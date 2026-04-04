-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Workspaces
create table public.workspaces (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users on delete cascade not null,
  name text not null,
  default_currency text default 'TRY' not null,
  created_at timestamptz default now() not null
);

alter table public.workspaces enable row level security;

create policy "Users can view own workspaces"
  on public.workspaces for select
  using (auth.uid() = owner_id);

create policy "Users can create workspaces"
  on public.workspaces for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own workspaces"
  on public.workspaces for update
  using (auth.uid() = owner_id);

create or replace function public.handle_new_user_workspace()
returns trigger as $$
begin
  insert into public.workspaces (owner_id, name)
  values (new.id, 'Varsayilan Calisma Alani');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_workspace
  after insert on auth.users
  for each row execute procedure public.handle_new_user_workspace();

-- Categories
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  name text not null,
  color text not null default '#6b7280',
  created_at timestamptz default now() not null
);

alter table public.categories enable row level security;

create policy "Users can view categories in own workspace"
  on public.categories for select
  using (workspace_id in (select id from public.workspaces where owner_id = auth.uid()));

create policy "Users can create categories in own workspace"
  on public.categories for insert
  with check (workspace_id in (select id from public.workspaces where owner_id = auth.uid()));

create policy "Users can update categories in own workspace"
  on public.categories for update
  using (workspace_id in (select id from public.workspaces where owner_id = auth.uid()));

create policy "Users can delete categories in own workspace"
  on public.categories for delete
  using (workspace_id in (select id from public.workspaces where owner_id = auth.uid()));

-- Documents
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  original_file_url text not null,
  preview_file_url text,
  file_type text not null,
  document_type text,
  supplier_name text,
  supplier_tax_id text,
  document_number text,
  issue_date date,
  issue_time time,
  subtotal_amount numeric(12,2),
  vat_amount numeric(12,2),
  vat_rate numeric(5,2),
  total_amount numeric(12,2),
  currency text default 'TRY' not null,
  payment_method text,
  category_id uuid references public.categories on delete set null,
  notes text,
  status text default 'uploaded' not null,
  confidence_score numeric(5,2),
  field_scores jsonb,
  raw_ocr_text text,
  parsed_json jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.documents enable row level security;

create policy "Users can view documents in own workspace"
  on public.documents for select
  using (workspace_id in (select id from public.workspaces where owner_id = auth.uid()));

create policy "Users can create documents in own workspace"
  on public.documents for insert
  with check (workspace_id in (select id from public.workspaces where owner_id = auth.uid()));

create policy "Users can update documents in own workspace"
  on public.documents for update
  using (workspace_id in (select id from public.workspaces where owner_id = auth.uid()));

create policy "Users can delete documents in own workspace"
  on public.documents for delete
  using (workspace_id in (select id from public.workspaces where owner_id = auth.uid()));

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger documents_updated_at
  before update on public.documents
  for each row execute procedure public.update_updated_at();

-- Tags
create table public.tags (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  name text not null,
  created_at timestamptz default now() not null
);

alter table public.tags enable row level security;

create policy "Users can view tags in own workspace"
  on public.tags for select
  using (workspace_id in (select id from public.workspaces where owner_id = auth.uid()));

create policy "Users can manage tags in own workspace"
  on public.tags for all
  using (workspace_id in (select id from public.workspaces where owner_id = auth.uid()));

-- Document Tags
create table public.document_tags (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references public.documents on delete cascade not null,
  tag_id uuid references public.tags on delete cascade not null,
  unique(document_id, tag_id)
);

alter table public.document_tags enable row level security;

create policy "Users can view document_tags in own workspace"
  on public.document_tags for select
  using (document_id in (select id from public.documents where workspace_id in (select id from public.workspaces where owner_id = auth.uid())));

create policy "Users can manage document_tags in own workspace"
  on public.document_tags for all
  using (document_id in (select id from public.documents where workspace_id in (select id from public.workspaces where owner_id = auth.uid())));

-- Audit Logs
create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references public.documents on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  action_type text not null,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz default now() not null
);

alter table public.audit_logs enable row level security;

create policy "Users can view audit_logs in own workspace"
  on public.audit_logs for select
  using (document_id in (select id from public.documents where workspace_id in (select id from public.workspaces where owner_id = auth.uid())));

create policy "Users can create audit_logs"
  on public.audit_logs for insert
  with check (auth.uid() = user_id);

-- Indexes
create index idx_documents_workspace_id on public.documents(workspace_id);
create index idx_documents_status on public.documents(status);
create index idx_documents_issue_date on public.documents(issue_date);
create index idx_documents_category_id on public.documents(category_id);
create index idx_documents_supplier_name on public.documents(supplier_name);
create index idx_categories_workspace_id on public.categories(workspace_id);
create index idx_tags_workspace_id on public.tags(workspace_id);
create index idx_audit_logs_document_id on public.audit_logs(document_id);

-- Storage bucket
insert into storage.buckets (id, name, public) values ('documents', 'documents', false);

create policy "Users can upload document files"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "Users can view own document files"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "Users can delete own document files"
  on storage.objects for delete
  using (bucket_id = 'documents' and auth.role() = 'authenticated');
