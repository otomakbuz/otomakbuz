-- ============================================================
-- Migration 009: Hatırlatıcılar — CRM Faz 5
-- reminders tablosu + yaklaşan hatırlatıcılar RPC
-- ============================================================

-- 1. REMINDERS TABLOSU
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  document_id uuid references public.documents on delete set null,
  contact_id uuid references public.contacts on delete set null,
  title text not null,
  description text,
  due_date timestamptz not null,
  reminder_type text not null default 'custom' check (reminder_type in ('payment', 'upload', 'review', 'custom')),
  is_completed boolean not null default false,
  is_recurring boolean not null default false,
  recurrence_rule text check (recurrence_rule in ('weekly', 'monthly', 'yearly')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. INDEXES
create index idx_reminders_workspace on public.reminders(workspace_id);
create index idx_reminders_user on public.reminders(user_id);
create index idx_reminders_due on public.reminders(workspace_id, due_date)
  where is_completed = false;
create index idx_reminders_document on public.reminders(document_id)
  where document_id is not null;
create index idx_reminders_contact on public.reminders(contact_id)
  where contact_id is not null;

-- 3. RLS
alter table public.reminders enable row level security;

create policy "reminders_select" on public.reminders
  for select using (workspace_id = public.get_user_workspace_id());
create policy "reminders_insert" on public.reminders
  for insert with check (workspace_id = public.get_user_workspace_id());
create policy "reminders_update" on public.reminders
  for update using (workspace_id = public.get_user_workspace_id());
create policy "reminders_delete" on public.reminders
  for delete using (workspace_id = public.get_user_workspace_id());

-- 4. YAKLAŞAN HATIRLATICILAR RPC
create or replace function public.get_upcoming_reminders(p_days int default 7)
returns json as $$
declare
  ws_id uuid;
  result json;
begin
  ws_id := public.get_user_workspace_id();
  if ws_id is null then return '[]'::json; end if;

  select coalesce(json_agg(row_to_json(t)), '[]'::json) into result
  from (
    select
      r.*,
      c.company_name as contact_name,
      d.supplier_name as document_name
    from public.reminders r
    left join public.contacts c on c.id = r.contact_id
    left join public.documents d on d.id = r.document_id
    where r.workspace_id = ws_id
      and r.is_completed = false
      and r.due_date <= now() + (p_days || ' days')::interval
    order by r.due_date asc
    limit 20
  ) t;

  return result;
end;
$$ language plpgsql security definer;

-- 5. TAMAMLANMAMIŞ HATIRLATICI SAYISI RPC (header badge için)
create or replace function public.get_pending_reminder_count()
returns int as $$
declare
  ws_id uuid;
  cnt int;
begin
  ws_id := public.get_user_workspace_id();
  if ws_id is null then return 0; end if;

  select count(*) into cnt
  from public.reminders
  where workspace_id = ws_id
    and is_completed = false
    and due_date <= now() + interval '7 days';

  return cnt;
end;
$$ language plpgsql security definer;
