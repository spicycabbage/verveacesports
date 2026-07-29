-- Canadian provincial tax rates (GST / HST / GST+PST combined).
-- Country-level CA 5% GST remains as the fallback when region is missing/unknown.
-- NS HST is 14% as of 2025-04-01. QC combined GST+QST is 14.975%.

-- Widen rate precision for QC 9.975% QST (combined 0.14975).
alter table public.tax_rates
  alter column rate type numeric(7,5);

alter table public.orders
  alter column tax_rate type numeric(7,5);

-- Prefer exact region match case-insensitively; fall back to country default.
create or replace function public.tax_rate_for(p_country text, p_region text default null)
returns numeric
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select rate from public.tax_rates
      where country = upper(trim(p_country))
        and region is not null
        and p_region is not null
        and upper(trim(region)) = upper(trim(p_region))
        and is_active = true
      order by priority desc limit 1),
    (select rate from public.tax_rates
      where country = upper(trim(p_country))
        and region is null
        and is_active = true
      order by priority desc limit 1),
    0
  );
$$;

grant execute on function public.tax_rate_for(text, text) to service_role, authenticated;

do $$
declare
  r record;
begin
  for r in
    select * from (values
      ('CA', 'AB', 'GST', 0.05000::numeric),
      ('CA', 'BC', 'GST + PST', 0.12000),
      ('CA', 'MB', 'GST + RST', 0.12000),
      ('CA', 'NB', 'HST', 0.15000),
      ('CA', 'NL', 'HST', 0.15000),
      ('CA', 'NS', 'HST', 0.14000),
      ('CA', 'NT', 'GST', 0.05000),
      ('CA', 'NU', 'GST', 0.05000),
      ('CA', 'ON', 'HST', 0.13000),
      ('CA', 'PE', 'HST', 0.15000),
      ('CA', 'QC', 'GST + QST', 0.14975),
      ('CA', 'SK', 'GST + PST', 0.11000),
      ('CA', 'YT', 'GST', 0.05000)
    ) as v(country, region, name, rate)
  loop
    update public.tax_rates
    set name = r.name, rate = r.rate, priority = 10, is_active = true
    where country = r.country and region = r.region and is_active = true;

    if not found then
      insert into public.tax_rates (country, region, name, rate, priority)
      values (r.country, r.region, r.name, r.rate, 10);
    end if;
  end loop;

  -- Keep country fallback labeled as GST (not HST).
  update public.tax_rates
  set name = 'GST', rate = 0.05000
  where country = 'CA' and region is null and is_active = true;
end $$;
