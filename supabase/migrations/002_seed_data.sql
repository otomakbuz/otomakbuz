create or replace function public.seed_default_categories()
returns trigger as $$
begin
  insert into public.categories (workspace_id, name, color) values
    (new.id, 'Yakit', '#f97316'),
    (new.id, 'Yemek', '#ef4444'),
    (new.id, 'Ofis', '#3b82f6'),
    (new.id, 'Kargo', '#8b5cf6'),
    (new.id, 'Konaklama', '#06b6d4'),
    (new.id, 'Ulasim', '#10b981'),
    (new.id, 'Diger', '#6b7280');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_workspace_created_seed_categories
  after insert on public.workspaces
  for each row execute procedure public.seed_default_categories();
