-- Atomic increment of order_items.refunded_qty for line-level refunds.
create or replace function public.increment_refunded_qty(p_order_item uuid, p_qty integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.order_items
    set refunded_qty = least(qty, refunded_qty + p_qty)
    where id = p_order_item;
$$;

revoke execute on function public.increment_refunded_qty(uuid, integer) from public, anon, authenticated;
grant execute on function public.increment_refunded_qty(uuid, integer) to service_role;
