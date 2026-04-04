-- ============================================================
-- Migration 007: Cari Hesap (Ledger) — CRM Faz 3
-- ledger_entries tablosu + bakiye RPC + RLS
-- ============================================================

-- 1. LEDGER ENTRIES TABLOSU
create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  contact_id uuid not null references public.contacts on delete cascade,
  document_id uuid references public.documents on delete set null,
  entry_type text not null check (entry_type in ('debit', 'credit')),
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'TRY',
  description text,
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. INDEXES
-- Workspace + contact bakiye sorgusu
create index idx_ledger_workspace_contact
  on public.ledger_entries(workspace_id, contact_id);

-- Document bazlı arama (duplicate engelleme)
create index idx_ledger_document
  on public.ledger_entries(document_id) where document_id is not null;

-- Tarih bazlı sıralama
create index idx_ledger_entry_date
  on public.ledger_entries(workspace_id, entry_date desc);

-- 3. RLS
alter table public.ledger_entries enable row level security;

create policy "ledger_select" on public.ledger_entries
  for select using (workspace_id = public.get_user_workspace_id());

create policy "ledger_insert" on public.ledger_entries
  for insert with check (workspace_id = public.get_user_workspace_id());

create policy "ledger_update" on public.ledger_entries
  for update using (workspace_id = public.get_user_workspace_id());

create policy "ledger_delete" on public.ledger_entries
  for delete using (workspace_id = public.get_user_workspace_id());

-- 4. BAKIYE HESAPLAMA RPC
-- Tek firma bakiyesi
create or replace function public.get_contact_balance(p_contact_id uuid)
returns json as $$
declare
  ws_id uuid;
  total_debit numeric;
  total_credit numeric;
begin
  ws_id := public.get_user_workspace_id();
  if ws_id is null then
    return json_build_object('debit', 0, 'credit', 0, 'balance', 0);
  end if;

  select
    coalesce(sum(case when entry_type = 'debit' then amount else 0 end), 0),
    coalesce(sum(case when entry_type = 'credit' then amount else 0 end), 0)
  into total_debit, total_credit
  from public.ledger_entries
  where workspace_id = ws_id and contact_id = p_contact_id;

  return json_build_object(
    'debit', total_debit,
    'credit', total_credit,
    'balance', total_credit - total_debit
  );
end;
$$ language plpgsql security definer stable;

-- 5. TÜM FİRMA BAKİYELERİ (cari hesap listesi)
create or replace function public.get_all_balances()
returns json as $$
declare
  ws_id uuid;
  result json;
begin
  ws_id := public.get_user_workspace_id();
  if ws_id is null then
    return '[]'::json;
  end if;

  select coalesce(json_agg(row_to_json(t)), '[]'::json) into result
  from (
    select
      c.id as contact_id,
      c.company_name,
      c.type as contact_type,
      coalesce(sum(case when le.entry_type = 'debit' then le.amount else 0 end), 0) as total_debit,
      coalesce(sum(case when le.entry_type = 'credit' then le.amount else 0 end), 0) as total_credit,
      coalesce(sum(case when le.entry_type = 'credit' then le.amount else 0 end), 0) -
      coalesce(sum(case when le.entry_type = 'debit' then le.amount else 0 end), 0) as balance,
      count(le.id) as entry_count,
      max(le.entry_date) as last_entry_date
    from public.contacts c
    left join public.ledger_entries le on le.contact_id = c.id and le.workspace_id = ws_id
    where c.workspace_id = ws_id and c.is_active = true
    group by c.id, c.company_name, c.type
    having count(le.id) > 0
    order by abs(
      coalesce(sum(case when le.entry_type = 'credit' then le.amount else 0 end), 0) -
      coalesce(sum(case when le.entry_type = 'debit' then le.amount else 0 end), 0)
    ) desc
  ) t;

  return result;
end;
$$ language plpgsql security definer stable;
