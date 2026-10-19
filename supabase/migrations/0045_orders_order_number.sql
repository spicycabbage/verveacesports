-- Human sequential order numbers. UUID stays the PK / URL.
create sequence if not exists public.orders_order_number_seq;

alter table public.orders
  add column if not exists order_number integer;

with numbered as (
  select id, 1000 + row_number() over (order by created_at asc, id asc) as n
  from public.orders
  where order_number is null
)
update public.orders o
set order_number = numbered.n
from numbered
where o.id = numbered.id;

select setval(
  'public.orders_order_number_seq',
  greatest(coalesce((select max(order_number) from public.orders), 1000), 1000)
);

alter table public.orders
  alter column order_number set default nextval('public.orders_order_number_seq');

alter table public.orders
  alter column order_number set not null;

alter sequence public.orders_order_number_seq owned by public.orders.order_number;

create unique index if not exists orders_order_number_uidx
  on public.orders (order_number);

grant usage, select on sequence public.orders_order_number_seq to service_role;

comment on column public.orders.order_number is
  'Human sequential order number. Starts at 1001.';
