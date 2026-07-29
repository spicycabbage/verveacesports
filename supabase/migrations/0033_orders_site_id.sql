-- Attribute orders to the storefront that created them.
alter table public.orders
  add column if not exists site_id text not null default 'verveace';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_site_id_check'
  ) then
    alter table public.orders
      add constraint orders_site_id_check
      check (site_id in ('verveace', 'bleeq-ca'));
  end if;
end $$;

create index if not exists orders_site_created_idx
  on public.orders (site_id, created_at desc);

comment on column public.orders.site_id is
  'Storefront that created the order: verveace | bleeq-ca';
