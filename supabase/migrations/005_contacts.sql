-- ============================================================
-- Migration 005: Contacts (Rehber) — CRM Faz 1
-- Tedarikçi/müşteri yönetimi, belgelerle bağlantı
-- ============================================================

-- 1. CONTACTS TABLOSU
create table public.contacts (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  type text not null default 'supplier',  -- 'supplier' | 'customer' | 'both'
  company_name text not null,
  tax_id text,
  tax_office text,
  phone text,
  email text,
  address text,
  city text,
  notes text,
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.contacts enable row level security;

create policy "contacts_select" on public.contacts for select
  using (workspace_id = public.get_user_workspace_id());
create policy "contacts_insert" on public.contacts for insert
  with check (workspace_id = public.get_user_workspace_id());
create policy "contacts_update" on public.contacts for update
  using (workspace_id = public.get_user_workspace_id());
create policy "contacts_delete" on public.contacts for delete
  using (workspace_id = public.get_user_workspace_id());

-- updated_at trigger
create trigger contacts_updated_at
  before update on public.contacts
  for each row execute procedure public.update_updated_at();

-- Indexes
create index idx_contacts_workspace on public.contacts(workspace_id);
create index idx_contacts_workspace_name on public.contacts(workspace_id, company_name);
create index idx_contacts_workspace_type on public.contacts(workspace_id, type);
create index idx_contacts_tax_id on public.contacts(workspace_id, tax_id) where tax_id is not null;


-- 2. CONTACT PERSONS TABLOSU
create table public.contact_persons (
  id uuid default gen_random_uuid() primary key,
  contact_id uuid references public.contacts on delete cascade not null,
  full_name text not null,
  title text,
  phone text,
  email text,
  is_primary boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.contact_persons enable row level security;

create policy "contact_persons_select" on public.contact_persons for select
  using (contact_id in (
    select id from public.contacts where workspace_id = public.get_user_workspace_id()
  ));
create policy "contact_persons_all" on public.contact_persons for all
  using (contact_id in (
    select id from public.contacts where workspace_id = public.get_user_workspace_id()
  ));

create index idx_contact_persons_contact on public.contact_persons(contact_id);


-- 3. DOCUMENTS → CONTACT BAĞLANTISI
alter table public.documents add column contact_id uuid references public.contacts on delete set null;
create index idx_documents_contact on public.documents(contact_id) where contact_id is not null;


-- 4. CONTACT STATS RPC (firma bazlı toplam harcama + belge sayısı)
create or replace function public.get_contact_stats(p_contact_id uuid)
returns json as $$
declare
  doc_count int;
  total_exp numeric;
  last_doc_date date;
begin
  select count(*), coalesce(sum(total_amount), 0), max(issue_date)
  into doc_count, total_exp, last_doc_date
  from public.documents
  where contact_id = p_contact_id
    and workspace_id = public.get_user_workspace_id();

  return json_build_object(
    'document_count', doc_count,
    'total_amount', total_exp,
    'last_document_date', last_doc_date
  );
end;
$$ language plpgsql security definer stable;
