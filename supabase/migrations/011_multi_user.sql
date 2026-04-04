-- ============================================================
-- Migration 011: Çoklu Kullanıcı — CRM Faz 7
-- workspace_members + workspace_invitations + get_user_workspace_id güncelleme
-- ============================================================

-- 1. WORKSPACE MEMBERS TABLOSU
create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor', 'viewer')),
  invited_by uuid references auth.users on delete set null,
  joined_at timestamptz not null default now(),
  unique(workspace_id, user_id)
);

create index idx_wm_workspace on public.workspace_members(workspace_id);
create index idx_wm_user on public.workspace_members(user_id);

-- 2. MEVCUT OWNER'LARI MIGRATE ET
insert into public.workspace_members (workspace_id, user_id, role)
select id, owner_id, 'owner' from public.workspaces
on conflict (workspace_id, user_id) do nothing;

-- 3. WORKSPACE INVITATIONS TABLOSU
create table public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  email text not null,
  role text not null default 'editor' check (role in ('editor', 'viewer')),
  invited_by uuid not null references auth.users on delete cascade,
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_inv_workspace on public.workspace_invitations(workspace_id);
create index idx_inv_token on public.workspace_invitations(token) where accepted_at is null;
create index idx_inv_email on public.workspace_invitations(email) where accepted_at is null;

-- 4. RLS — workspace_members
alter table public.workspace_members enable row level security;

create policy "wm_select" on public.workspace_members
  for select using (workspace_id = public.get_user_workspace_id());
create policy "wm_insert" on public.workspace_members
  for insert with check (workspace_id = public.get_user_workspace_id());
create policy "wm_update" on public.workspace_members
  for update using (workspace_id = public.get_user_workspace_id());
create policy "wm_delete" on public.workspace_members
  for delete using (workspace_id = public.get_user_workspace_id());

-- 5. RLS — workspace_invitations
alter table public.workspace_invitations enable row level security;

create policy "inv_select" on public.workspace_invitations
  for select using (workspace_id = public.get_user_workspace_id());
create policy "inv_insert" on public.workspace_invitations
  for insert with check (workspace_id = public.get_user_workspace_id());
create policy "inv_delete" on public.workspace_invitations
  for delete using (workspace_id = public.get_user_workspace_id());

-- 6. GET_USER_WORKSPACE_ID GÜNCELLEME (multi-user destekli)
create or replace function public.get_user_workspace_id()
returns uuid as $$
  select workspace_id
  from public.workspace_members
  where user_id = auth.uid()
  limit 1;
$$ language sql stable security definer;

-- 7. KULLANICININ ROLÜNÜ DÖNDÜREN FONKSİYON
create or replace function public.get_user_role()
returns text as $$
  select role
  from public.workspace_members
  where user_id = auth.uid()
    and workspace_id = public.get_user_workspace_id()
  limit 1;
$$ language sql stable security definer;

-- 8. DAVET KABUL RPC
create or replace function public.accept_invitation(p_token text)
returns json as $$
declare
  inv record;
begin
  select * into inv
  from public.workspace_invitations
  where token = p_token
    and accepted_at is null
    and expires_at > now();

  if inv is null then
    return json_build_object('error', 'Davet bulunamadi veya suresi dolmus');
  end if;

  insert into public.workspace_members (workspace_id, user_id, role, invited_by)
  values (inv.workspace_id, auth.uid(), inv.role, inv.invited_by)
  on conflict (workspace_id, user_id) do nothing;

  update public.workspace_invitations
  set accepted_at = now()
  where id = inv.id;

  return json_build_object('success', true, 'workspace_id', inv.workspace_id);
end;
$$ language plpgsql security definer;
