-- ============================================================
-- Migration 008: Tekrarlayan Harcama Tespiti — CRM Faz 4
-- recurring_patterns tablosu + tespit RPC
-- ============================================================

-- 1. RECURRING PATTERNS TABLOSU
create table public.recurring_patterns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  contact_id uuid not null references public.contacts on delete cascade,
  pattern_name text not null,
  avg_amount numeric(12,2) not null,
  min_amount numeric(12,2),
  max_amount numeric(12,2),
  frequency text not null check (frequency in ('weekly', 'monthly', 'quarterly', 'yearly')),
  last_occurrence date,
  next_expected date,
  occurrence_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. INDEXES
create index idx_recurring_workspace
  on public.recurring_patterns(workspace_id);
create index idx_recurring_contact
  on public.recurring_patterns(contact_id);
create index idx_recurring_next
  on public.recurring_patterns(workspace_id, next_expected)
  where is_active = true;

-- 3. RLS
alter table public.recurring_patterns enable row level security;

create policy "recurring_select" on public.recurring_patterns
  for select using (workspace_id = public.get_user_workspace_id());
create policy "recurring_insert" on public.recurring_patterns
  for insert with check (workspace_id = public.get_user_workspace_id());
create policy "recurring_update" on public.recurring_patterns
  for update using (workspace_id = public.get_user_workspace_id());
create policy "recurring_delete" on public.recurring_patterns
  for delete using (workspace_id = public.get_user_workspace_id());

-- 4. TEKRARLAYAN HARCAMA TESPİT RPC
-- Aynı firmaya 3+ belge, tarih aralığı tutarlı → pattern
create or replace function public.detect_recurring_patterns()
returns json as $$
declare
  ws_id uuid;
  result json;
begin
  ws_id := public.get_user_workspace_id();
  if ws_id is null then return '[]'::json; end if;

  -- Mevcut patternleri temizle ve yeniden hesapla
  delete from public.recurring_patterns where workspace_id = ws_id;

  -- Firmaya göre grupla, 3+ belge olan ve tarih aralığı tutarlı olanları bul
  insert into public.recurring_patterns
    (workspace_id, contact_id, pattern_name, avg_amount, min_amount, max_amount,
     frequency, last_occurrence, next_expected, occurrence_count)
  select
    ws_id,
    sub.contact_id,
    sub.company_name || ' - ' ||
      case
        when sub.avg_days between 5 and 10 then 'Haftalik'
        when sub.avg_days between 25 and 40 then 'Aylik'
        when sub.avg_days between 80 and 100 then 'Uc Aylik'
        when sub.avg_days between 350 and 380 then 'Yillik'
        else 'Duzensiz'
      end,
    sub.avg_amount,
    sub.min_amount,
    sub.max_amount,
    case
      when sub.avg_days between 5 and 10 then 'weekly'
      when sub.avg_days between 25 and 40 then 'monthly'
      when sub.avg_days between 80 and 100 then 'quarterly'
      when sub.avg_days between 350 and 380 then 'yearly'
      else 'monthly'
    end,
    sub.last_date,
    sub.last_date + sub.avg_days::int,
    sub.doc_count
  from (
    select
      d.contact_id,
      c.company_name,
      count(*) as doc_count,
      avg(d.total_amount) as avg_amount,
      min(d.total_amount) as min_amount,
      max(d.total_amount) as max_amount,
      max(d.issue_date::date) as last_date,
      -- Ortalama gün aralığı hesapla
      extract(epoch from (max(d.issue_date::timestamp) - min(d.issue_date::timestamp)))
        / 86400.0 / nullif(count(*) - 1, 0) as avg_days,
      -- Standart sapma / ortalama (tutarsızlık oranı)
      case when count(*) > 2 then
        stddev(d.total_amount) / nullif(avg(d.total_amount), 0)
      else 0 end as amount_cv
    from public.documents d
    join public.contacts c on c.id = d.contact_id
    where d.workspace_id = ws_id
      and d.contact_id is not null
      and d.total_amount is not null
      and d.issue_date is not null
      and d.direction = 'expense'
    group by d.contact_id, c.company_name
    having count(*) >= 3
  ) sub
  where sub.avg_days is not null
    and sub.avg_days > 4
    and sub.amount_cv < 0.35;  -- Tutar varyasyonu %35'ten az

  select coalesce(json_agg(row_to_json(t)), '[]'::json) into result
  from (
    select rp.*, c.company_name
    from public.recurring_patterns rp
    join public.contacts c on c.id = rp.contact_id
    where rp.workspace_id = ws_id and rp.is_active = true
    order by rp.next_expected asc nulls last
  ) t;

  return result;
end;
$$ language plpgsql security definer;
