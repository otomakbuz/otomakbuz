-- ============================================================
-- Migration 006: Gelir-Gider Takibi — CRM Faz 2
-- documents tablosuna direction kolonu + dashboard RPC güncelleme
-- ============================================================

-- 1. DIRECTION KOLONU
alter table public.documents
  add column direction text not null default 'expense';
-- 'expense' | 'income'
-- Mevcut tüm belgeler otomatik 'expense' olur

-- Index: workspace + direction filtresi
create index idx_docs_workspace_direction
  on public.documents(workspace_id, direction);


-- 2. DASHBOARD STATS RPC GÜNCELLEME
-- Gelir, gider ve net durum eklendi
create or replace function public.get_dashboard_stats()
returns json as $$
declare
  ws_id uuid;
  first_of_month date;
  docs_count int;
  total_exp numeric;
  total_inc numeric;
  pending int;
  cat_dist json;
  recent json;
begin
  ws_id := public.get_user_workspace_id();
  if ws_id is null then
    return json_build_object(
      'documents_this_month', 0,
      'total_expense_this_month', 0,
      'total_income_this_month', 0,
      'net_this_month', 0,
      'pending_review_count', 0,
      'category_distribution', '[]'::json,
      'recent_documents', '[]'::json
    );
  end if;

  first_of_month := date_trunc('month', now())::date;

  -- Bu ay belge sayısı
  select count(*) into docs_count
  from public.documents
  where workspace_id = ws_id and created_at >= first_of_month;

  -- Gider toplamı
  select coalesce(sum(total_amount), 0) into total_exp
  from public.documents
  where workspace_id = ws_id and created_at >= first_of_month
    and direction = 'expense' and total_amount is not null;

  -- Gelir toplamı
  select coalesce(sum(total_amount), 0) into total_inc
  from public.documents
  where workspace_id = ws_id and created_at >= first_of_month
    and direction = 'income' and total_amount is not null;

  -- Bekleyen
  select count(*) into pending
  from public.documents
  where workspace_id = ws_id and status = 'needs_review';

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
    'total_income_this_month', total_inc,
    'net_this_month', total_inc - total_exp,
    'pending_review_count', pending,
    'category_distribution', cat_dist,
    'recent_documents', recent
  );
end;
$$ language plpgsql security definer stable;
