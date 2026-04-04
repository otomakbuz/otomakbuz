-- ============================================================
-- Migration 010: Gelişmiş Rapor RPC'leri — CRM Faz 6
-- ============================================================

-- 1. AYLIK TREND — Son N ay gelir vs gider
create or replace function public.get_monthly_trends(p_months int default 12)
returns json as $$
declare
  ws_id uuid;
  result json;
begin
  ws_id := public.get_user_workspace_id();
  if ws_id is null then return '[]'::json; end if;

  select coalesce(json_agg(row_to_json(t) order by t.month), '[]'::json) into result
  from (
    select
      to_char(date_trunc('month', d.issue_date::date), 'YYYY-MM') as month,
      to_char(date_trunc('month', d.issue_date::date), 'TMMonth YYYY') as label,
      coalesce(sum(case when d.direction = 'expense' then d.total_amount else 0 end), 0) as expense,
      coalesce(sum(case when d.direction = 'income' then d.total_amount else 0 end), 0) as income,
      coalesce(sum(case when d.direction = 'income' then d.total_amount else 0 end), 0)
        - coalesce(sum(case when d.direction = 'expense' then d.total_amount else 0 end), 0) as net
    from public.documents d
    where d.workspace_id = ws_id
      and d.issue_date is not null
      and d.total_amount is not null
      and d.issue_date::date >= date_trunc('month', current_date) - (p_months || ' months')::interval
    group by date_trunc('month', d.issue_date::date)
  ) t;

  return result;
end;
$$ language plpgsql security definer;

-- 2. FİRMA SIRALAMASI — Top N firma harcama/gelir
create or replace function public.get_supplier_ranking(p_limit int default 10, p_direction text default 'expense')
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
      c.id as contact_id,
      c.company_name,
      count(*) as document_count,
      coalesce(sum(d.total_amount), 0) as total_amount,
      coalesce(avg(d.total_amount), 0) as avg_amount
    from public.documents d
    join public.contacts c on c.id = d.contact_id
    where d.workspace_id = ws_id
      and d.contact_id is not null
      and d.total_amount is not null
      and d.direction = p_direction
    group by c.id, c.company_name
    order by sum(d.total_amount) desc
    limit p_limit
  ) t;

  return result;
end;
$$ language plpgsql security definer;

-- 3. KATEGORİ DETAY — Kategori bazlı gelir/gider dağılımı
create or replace function public.get_category_breakdown(p_direction text default 'expense')
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
      coalesce(cat.id::text, 'uncategorized') as category_id,
      coalesce(cat.name, 'Kategorisiz') as category_name,
      coalesce(cat.color, '#94a3b8') as color,
      count(*) as document_count,
      coalesce(sum(d.total_amount), 0) as total_amount,
      round(coalesce(sum(d.total_amount), 0) * 100.0 / nullif(
        sum(sum(d.total_amount)) over (), 0
      ), 1) as percentage
    from public.documents d
    left join public.categories cat on cat.id = d.category_id
    where d.workspace_id = ws_id
      and d.total_amount is not null
      and d.direction = p_direction
    group by cat.id, cat.name, cat.color
    order by sum(d.total_amount) desc
  ) t;

  return result;
end;
$$ language plpgsql security definer;

-- 4. NAKİT AKIŞ PROJEKSİYONU
create or replace function public.get_cashflow_projection(p_months int default 3)
returns json as $$
declare
  ws_id uuid;
  result json;
begin
  ws_id := public.get_user_workspace_id();
  if ws_id is null then return '[]'::json; end if;

  select coalesce(json_agg(row_to_json(t) order by t.month), '[]'::json) into result
  from (
    select
      to_char(m.month_start, 'YYYY-MM') as month,
      to_char(m.month_start, 'TMMonth YYYY') as label,
      coalesce(
        (select sum(rp.avg_amount)
         from public.recurring_patterns rp
         where rp.workspace_id = ws_id
           and rp.is_active = true
           and (
             (rp.frequency = 'monthly') or
             (rp.frequency = 'weekly') or
             (rp.frequency = 'quarterly' and extract(month from m.month_start)::int % 3 = 0) or
             (rp.frequency = 'yearly' and extract(month from m.month_start) = extract(month from rp.last_occurrence))
           )
        ),
        0
      ) as projected_expense,
      coalesce(
        (select sum(d.total_amount) from public.documents d
         where d.workspace_id = ws_id
           and d.direction = 'expense'
           and d.total_amount is not null
           and date_trunc('month', d.issue_date::date) = m.month_start),
        0
      ) as actual_expense,
      coalesce(
        (select sum(d.total_amount) from public.documents d
         where d.workspace_id = ws_id
           and d.direction = 'income'
           and d.total_amount is not null
           and date_trunc('month', d.issue_date::date) = m.month_start),
        0
      ) as actual_income
    from generate_series(
      date_trunc('month', current_date),
      date_trunc('month', current_date) + (p_months || ' months')::interval,
      '1 month'::interval
    ) as m(month_start)
  ) t;

  return result;
end;
$$ language plpgsql security definer;

-- 5. YILLIK ÖZET
create or replace function public.get_yearly_summary()
returns json as $$
declare
  ws_id uuid;
  result json;
begin
  ws_id := public.get_user_workspace_id();
  if ws_id is null then return '[]'::json; end if;

  select coalesce(json_agg(row_to_json(t) order by t.year), '[]'::json) into result
  from (
    select
      extract(year from d.issue_date::date)::int as year,
      coalesce(sum(case when d.direction = 'expense' then d.total_amount else 0 end), 0) as expense,
      coalesce(sum(case when d.direction = 'income' then d.total_amount else 0 end), 0) as income,
      coalesce(sum(case when d.direction = 'income' then d.total_amount else 0 end), 0)
        - coalesce(sum(case when d.direction = 'expense' then d.total_amount else 0 end), 0) as net,
      count(*) as document_count
    from public.documents d
    where d.workspace_id = ws_id
      and d.issue_date is not null
      and d.total_amount is not null
    group by extract(year from d.issue_date::date)
  ) t;

  return result;
end;
$$ language plpgsql security definer;
