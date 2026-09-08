-- POS one-off lines: no catalog product / no inventory movement.

alter table public.order_items
  alter column product_id drop not null;

create or replace function public.reserve_order_inventory(p_order uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  it record;
  rc integer;
  lvl public.inventory_levels;
begin
  if exists (
    select 1 from public.inventory_ledger
    where order_id = p_order and reason in ('reservation','sale')
  ) then
    return;
  end if;

  for it in
    select oi.variant_id, oi.location_id, oi.qty, oi.product_name
    from public.order_items oi
    where oi.order_id = p_order
  loop
    -- Custom / untracked POS lines have no variant — skip, don't fail the sale.
    if it.variant_id is null or it.location_id is null then
      continue;
    end if;

    update public.inventory_levels
    set reserved = reserved + it.qty, updated_at = now()
    where variant_id = it.variant_id
      and location_id = it.location_id
      and (on_hand - reserved) >= it.qty
    returning * into lvl;

    get diagnostics rc = row_count;
    if rc = 0 then
      raise exception 'INSUFFICIENT_STOCK: %', coalesce(it.product_name, it.variant_id::text)
        using errcode = 'P0001';
    end if;

    insert into public.inventory_ledger
      (variant_id, location_id, delta, reason, on_hand_after, reserved_after, order_id, note)
    values
      (it.variant_id, it.location_id, -it.qty, 'reservation', lvl.on_hand, lvl.reserved, p_order,
       'Reserved at checkout');
  end loop;
end;
$$;
