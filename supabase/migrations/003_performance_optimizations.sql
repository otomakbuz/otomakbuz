-- ============================================================
-- Migration 003: Performance Optimizations
-- Hedef: Günde 10.000+ istek için RLS, index ve sorgu optimizasyonu
-- ============================================================

-- 1. WORKSPACE HELPER FUNCTION
-- Her RLS check'te subquery yerine cache'lenebilir fonksiyon
-- PostgreSQL "STABLE" fonksiyonları aynı transaction'da 1 kez çalışır
-- ============================================================

create or replace function public.get_user_workspace_id()
returns uuid as $$
  select id from public.workspaces where owner_id = auth.uid() limit 1
$$ language sql security definer stable;


-- 2. RLS POLICY REFACTOR
-- Eski: workspace_id in (select id from workspaces where owner_id = auth.uid())
-- Yeni: workspace_id = get_user_workspace_id()
-- Her satır başına subquery yerine tek fonksiyon çağrısı
-- ============================================================

-- Categories
drop policy if exists "Users can view categories in own workspace" on public.categories;
drop policy if exists "Users can create categories in own workspace" on public.categories;
drop policy if exists "Users can update categories in own workspace" on public.categories;
drop policy if exists "Users can delete categories in own workspace" on public.categories;

create policy "categories_select" on public.categories for select
  using (workspace_id = public.get_user_workspace_id());
create policy "categories_insert" on public.categories for insert
  with check (workspace_id = public.get_user_workspace_id());
create policy "categories_update" on public.categories for update
  using (workspace_id = public.get_user_workspace_id());
create policy "categories_delete" on public.categories for delete
  using (workspace_id = public.get_user_workspace_id());

-- Documents
drop policy if exists "Users can view documents in own workspace" on public.documents;
drop policy if exists "Users can create documents in own workspace" on public.documents;
drop policy if exists "Users can update documents in own workspace" on public.documents;
drop policy if exists "Users can delete documents in own workspace" on public.documents;

create policy "documents_select" on public.documents for select
  using (workspace_id = public.get_user_workspace_id());
create policy "documents_insert" on public.documents for insert
  with check (workspace_id = public.get_user_workspace_id());
create policy "documents_update" on public.documents for update
  using (workspace_id = public.get_user_workspace_id());
create policy "documents_delete" on public.documents for delete
  using (workspace_id = public.get_user_workspace_id());

-- Tags
drop policy if exists "Users can view tags in own workspace" on public.tags;
drop policy if exists "Users can manage tags in own workspace" on public.tags;

create policy "tags_select" on public.tags for select
  using (workspace_id = public.get_user_workspace_id());
create policy "tags_all" on public.tags for all
  using (workspace_id = public.get_user_workspace_id());

-- Document Tags (2 seviye deep subquery yerine 1 seviye)
drop policy if exists "Users can view document_tags in own workspace" on public.document_tags;
drop policy if exists "Users can manage document_tags in own workspace" on public.document_tags;

create policy "document_tags_select" on public.document_tags for select
  using (document_id in (
    select id from public.documents where workspace_id = public.get_user_workspace_id()
  ));
create policy "document_tags_all" on public.document_tags for all
  using (document_id in (
    select id from public.documents where workspace_id = public.get_user_workspace_id()
  ));

-- Audit Logs
drop policy if exists "Users can view audit_logs in own workspace" on public.audit_logs;
drop policy if exists "Users can create audit_logs" on public.audit_logs;

create policy "audit_logs_select" on public.audit_logs for select
  using (document_id in (
    select id from public.documents where workspace_id = public.get_user_workspace_id()
  ));
create policy "audit_logs_insert" on public.audit_logs for insert
  with check (auth.uid() = user_id);


-- 3. COMPOSITE INDEXES
-- En sık kullanılan sorgu kalıplarına göre
-- ============================================================

-- Belgeler listesi: workspace + status + sıralama
create index if not exists idx_docs_workspace_status_created
  on public.documents(workspace_id, status, created_at desc);

-- Belgeler listesi: workspace + tarih filtresi
create index if not exists idx_docs_workspace_date
  on public.documents(workspace_id, issue_date desc nulls last);

-- Dashboard: workspace + ay bazlı toplam
create index if not exists idx_docs_workspace_created
  on public.documents(workspace_id, created_at desc);

-- Dashboard: kategori dağılımı
create index if not exists idx_docs_workspace_category_amount
  on public.documents(workspace_id, category_id, total_amount)
  where category_id is not null and total_amount is not null;

-- Audit logs: belge bazlı sıralı erişim
create index if not exists idx_audit_logs_doc_created
  on public.audit_logs(document_id, created_at desc);


-- 4. DASHBOARD STATS RPC
-- 5 ayrı sorgu yerine tek bir fonksiyon çağrısı
-- Supabase client: supabase.rpc('get_dashboard_stats')
-- ============================================================

create or replace function public.get_dashboard_stats()
returns json as $$
declare
  ws_id uuid;
  first_of_month date;
  docs_count int;
  total_exp numeric;
  pending int;
  cat_dist json;
  recent json;
begin
  ws_id := public.get_user_workspace_id();
  if ws_id is null then
    return json_build_object(
      'documents_this_month', 0,
      'total_expense_this_month', 0,
      'pending_review_count', 0,
      'category_distribution', '[]'::json,
      'recent_documents', '[]'::json
    );
  end if;

  first_of_month := date_trunc('month', now())::date;

  -- Bu ay belge sayısı + toplam gider (tek sorgu)
  select
    count(*),
    coalesce(sum(total_amount), 0)
  into docs_count, total_exp
  from public.documents
  where workspace_id = ws_id
    and created_at >= first_of_month;

  -- Bekleyen belge sayısı
  select count(*) into pending
  from public.documents
  where workspace_id = ws_id
    and status = 'needs_review';

  -- Kategori dağılımı
  select coalesce(json_agg(row_to_json(t)), '[]'::json) into cat_dist
  from (
    select c.name, c.color, sum(d.total_amount) as total
    from public.documents d
    join public.categories c on c.id = d.category_id
    where d.workspace_id = ws_id
      and d.category_id is not null
      and d.total_amount is not null
    group by c.name, c.color
    order by total desc
  ) t;

  -- Son 5 belge
  select coalesce(json_agg(row_to_json(t)), '[]'::json) into recent
  from (
    select d.*, row_to_json(c) as category
    from public.documents d
    left join public.categories c on c.id = d.category_id
    where d.workspace_id = ws_id
    order by d.created_at desc
    limit 5
  ) t;

  return json_build_object(
    'documents_this_month', docs_count,
    'total_expense_this_month', total_exp,
    'pending_review_count', pending,
    'category_distribution', cat_dist,
    'recent_documents', recent
  );
end;
$$ language plpgsql security definer stable;
