-- Atomic inventory + order lifecycle functions and denormalization triggers.
-- All mutating functions are SECURITY DEFINER and locked to the service role.
-- Idempotent: safe to re-run.

-- =============== DENORMALIZATION: products.stock / price mirror ===============
-- Keeps the legacy products.stock + price columns in sync with the variant /
-- inventory tables so the existing storefront keeps working unchanged.
create or replace function public.recompute_product_stock(p_product uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.products p
  set stock = coalesce((
    select sum(il.available)
    from public.inventory_levels il
    join public.product_variants v on v.id = il.variant_id
    where v.product_id = p.id and v.is_active = true
  ), 0)
  where p.id = p_product;
end;
$$;

create or replace function public.recompute_product_pricing(p_product uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.products p
  set price_usd = coalesce((
        select min(v.price_usd) from public.product_variants v
        where v.product_id = p.id and v.is_active = true), p.price_usd),
      price_cad = coalesce((
        select min(v.price_cad) from public.product_variants v
        where v.product_id = p.id and v.is_active = true), p.price_cad),
      has_variants = (
        select count(*) > 1 from public.product_variants v where v.product_id = p.id
      )
  where p.id = p_product;
end;
$$;

create or replace function public.trg_inventory_recompute()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_variant uuid := coalesce(new.variant_id, old.variant_id);
  v_product uuid;
begin
  select product_id into v_product from public.product_variants where id = v_variant;
  if v_product is not null then
    perform public.recompute_product_stock(v_product);
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists on_inventory_levels_change on public.inventory_levels;
create trigger on_inventory_levels_change
  after insert or update or delete on public.inventory_levels
  for each row execute function public.trg_inventory_recompute();

create or replace function public.trg_variant_recompute()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_product uuid := coalesce(new.product_id, old.product_id);
begin
  if v_product is not null then
    perform public.recompute_product_pricing(v_product);
    perform public.recompute_product_stock(v_product);
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists on_variant_change on public.product_variants;
create trigger on_variant_change
  after insert or update or delete on public.product_variants
  for each row execute function public.trg_variant_recompute();

-- =============== AUTO DEFAULT VARIANT ON NEW PRODUCT ===============
-- Every product gets at least one (default) variant + an inventory level at the
-- default location, seeded from products.stock. Keeps catalog Shopify-consistent
-- regardless of whether products are added by seed or the admin UI.
create or replace function public.handle_new_product()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_variant uuid;
  v_loc uuid;
begin
  if exists (select 1 from public.product_variants where product_id = new.id) then
    return new;
  end if;

  insert into public.product_variants (product_id, sku, title, price_usd, price_cad, position, is_active)
  values (new.id, upper(replace(new.slug, '-', '')), 'Default', new.price_usd, new.price_cad, 1, new.is_active)
  returning id into v_variant;

  select id into v_loc from public.locations where is_default = true limit 1;
  if v_loc is not null then
    insert into public.inventory_levels (variant_id, location_id, on_hand, reserved)
    values (v_variant, v_loc, coalesce(new.stock, 0), 0)
    on conflict (variant_id, location_id) do nothing;

    if coalesce(new.stock, 0) > 0 then
      insert into public.inventory_ledger
        (variant_id, location_id, delta, reason, on_hand_after, reserved_after, note)
      values (v_variant, v_loc, new.stock, 'initial', new.stock, 0, 'Opening balance (new product)');
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_product_created on public.products;
create trigger on_product_created
  after insert on public.products
  for each row execute function public.handle_new_product();

revoke execute on function public.handle_new_product() from public, anon, authenticated;

-- =============== MANUAL INVENTORY MOVES (ADMIN) ===============
-- Relative move: receive stock, shrinkage, transfers, etc.
create or replace function public.inventory_move(
  p_variant uuid,
  p_location uuid,
  p_delta integer,
  p_reason inventory_reason default 'adjustment',
  p_note text default null,
  p_actor uuid default null
)
returns public.inventory_levels
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  lvl public.inventory_levels;
begin
  insert into public.inventory_levels (variant_id, location_id, on_hand, reserved)
  values (p_variant, p_location, 0, 0)
  on conflict (variant_id, location_id) do nothing;

  update public.inventory_levels
  set on_hand = on_hand + p_delta, updated_at = now()
  where variant_id = p_variant and location_id = p_location
  returning * into lvl;

  if lvl.on_hand < 0 then
    raise exception 'NEGATIVE_INVENTORY: on_hand would go below zero for variant %', p_variant
      using errcode = 'P0001';
  end if;

  insert into public.inventory_ledger
    (variant_id, location_id, delta, reason, on_hand_after, reserved_after, note, actor)
  values
    (p_variant, p_location, p_delta, p_reason, lvl.on_hand, lvl.reserved, p_note, p_actor);

  return lvl;
end;
$$;

-- Absolute set: recount / cycle-count to a known on_hand value.
create or replace function public.inventory_set_on_hand(
  p_variant uuid,
  p_location uuid,
  p_new_on_hand integer,
  p_note text default null,
  p_actor uuid default null
)
returns public.inventory_levels
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_on_hand integer;
begin
  insert into public.inventory_levels (variant_id, location_id, on_hand, reserved)
  values (p_variant, p_location, 0, 0)
  on conflict (variant_id, location_id) do nothing;

  select on_hand into current_on_hand
  from public.inventory_levels
  where variant_id = p_variant and location_id = p_location
  for update;

  return public.inventory_move(
    p_variant, p_location, p_new_on_hand - current_on_hand, 'recount', p_note, p_actor
  );
end;
$$;

-- =============== ORDER INVENTORY LIFECYCLE ===============
-- Reserve all items for an order atomically. Raises INSUFFICIENT_STOCK (and
-- rolls back the whole reservation) if any line can't be satisfied.
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
  -- Already reserved/committed? No-op (idempotent).
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
    if it.variant_id is null or it.location_id is null then
      raise exception 'UNTRACKED_ITEM: order item missing variant/location' using errcode = 'P0001';
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

-- Release a reservation (payment failed / cancelled before fulfillment).
create or replace function public.release_order_inventory(p_order uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  it record;
  lvl public.inventory_levels;
begin
  -- Only release if currently reserved and not yet sold/released.
  if not exists (select 1 from public.inventory_ledger where order_id = p_order and reason = 'reservation') then
    return;
  end if;
  if exists (select 1 from public.inventory_ledger where order_id = p_order and reason in ('sale','release')) then
    return;
  end if;

  for it in
    select oi.variant_id, oi.location_id, oi.qty
    from public.order_items oi
    where oi.order_id = p_order and oi.variant_id is not null and oi.location_id is not null
  loop
    update public.inventory_levels
    set reserved = greatest(0, reserved - it.qty), updated_at = now()
    where variant_id = it.variant_id and location_id = it.location_id
    returning * into lvl;

    insert into public.inventory_ledger
      (variant_id, location_id, delta, reason, on_hand_after, reserved_after, order_id, note)
    values
      (it.variant_id, it.location_id, it.qty, 'release', lvl.on_hand, lvl.reserved, p_order,
       'Released reservation');
  end loop;
end;
$$;

-- Convert a reservation into a real sale: deduct on_hand + reserved. Idempotent.
create or replace function public.commit_order_inventory(p_order uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  it record;
  lvl public.inventory_levels;
begin
  if exists (select 1 from public.inventory_ledger where order_id = p_order and reason = 'sale') then
    return;
  end if;

  for it in
    select oi.variant_id, oi.location_id, oi.qty
    from public.order_items oi
    where oi.order_id = p_order and oi.variant_id is not null and oi.location_id is not null
  loop
    update public.inventory_levels
    set on_hand = on_hand - it.qty,
        reserved = greatest(0, reserved - it.qty),
        updated_at = now()
    where variant_id = it.variant_id and location_id = it.location_id
    returning * into lvl;

    insert into public.inventory_ledger
      (variant_id, location_id, delta, reason, on_hand_after, reserved_after, order_id, note)
    values
      (it.variant_id, it.location_id, -it.qty, 'sale', lvl.on_hand, lvl.reserved, p_order, 'Sold');
  end loop;
end;
$$;

-- Restock sold items back to on_hand (refund with restock).
create or replace function public.restock_order_inventory(p_order uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  it record;
  lvl public.inventory_levels;
begin
  if not exists (select 1 from public.inventory_ledger where order_id = p_order and reason = 'sale') then
    return;
  end if;
  if exists (select 1 from public.inventory_ledger where order_id = p_order and reason = 'return') then
    return;
  end if;

  for it in
    select oi.variant_id, oi.location_id, oi.qty
    from public.order_items oi
    where oi.order_id = p_order and oi.variant_id is not null and oi.location_id is not null
  loop
    update public.inventory_levels
    set on_hand = on_hand + it.qty, updated_at = now()
    where variant_id = it.variant_id and location_id = it.location_id
    returning * into lvl;

    insert into public.inventory_ledger
      (variant_id, location_id, delta, reason, on_hand_after, reserved_after, order_id, note)
    values
      (it.variant_id, it.location_id, it.qty, 'return', lvl.on_hand, lvl.reserved, p_order, 'Restocked on refund');
  end loop;
end;
$$;

-- =============== DISCOUNT VALIDATION ===============
-- Authoritative server-side validation. Returns the computed order-level
-- discount amount (shipping discounts are signalled via kind = 'free_shipping').
create or replace function public.validate_discount(
  p_code text,
  p_user uuid,
  p_subtotal numeric,
  p_currency text
)
returns table (valid boolean, discount_id uuid, kind discount_type, amount numeric, reason text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  d public.discounts;
  redemptions_by_user integer;
begin
  select * into d from public.discounts where lower(code) = lower(p_code);

  if d.id is null or not d.is_active then
    return query select false, null::uuid, null::discount_type, 0::numeric, 'Invalid code'; return;
  end if;
  if d.starts_at is not null and now() < d.starts_at then
    return query select false, d.id, d.type, 0::numeric, 'Not active yet'; return;
  end if;
  if d.ends_at is not null and now() > d.ends_at then
    return query select false, d.id, d.type, 0::numeric, 'Expired'; return;
  end if;
  if d.usage_limit is not null and d.used_count >= d.usage_limit then
    return query select false, d.id, d.type, 0::numeric, 'Usage limit reached'; return;
  end if;
  if p_subtotal < d.min_subtotal then
    return query select false, d.id, d.type, 0::numeric,
      'Minimum subtotal not met'; return;
  end if;

  if p_user is not null and (d.once_per_customer or d.per_customer_limit is not null) then
    select count(*) into redemptions_by_user
    from public.discount_redemptions r
    where r.discount_id = d.id and r.user_id = p_user;
    if d.once_per_customer and redemptions_by_user >= 1 then
      return query select false, d.id, d.type, 0::numeric, 'Already used'; return;
    end if;
    if d.per_customer_limit is not null and redemptions_by_user >= d.per_customer_limit then
      return query select false, d.id, d.type, 0::numeric, 'Per-customer limit reached'; return;
    end if;
  end if;

  -- Compute amount.
  if d.type = 'percentage' then
    return query select true, d.id, d.type,
      round(p_subtotal * (d.value / 100.0), 2), null::text;
  elsif d.type = 'fixed_amount' then
    return query select true, d.id, d.type, least(d.value, p_subtotal), null::text;
  else -- free_shipping
    return query select true, d.id, d.type, 0::numeric, null::text;
  end if;
end;
$$;

-- =============== TAX LOOKUP ===============
create or replace function public.tax_rate_for(p_country text, p_region text default null)
returns numeric
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select rate from public.tax_rates
      where country = p_country and region = p_region and is_active = true
      order by priority desc limit 1),
    (select rate from public.tax_rates
      where country = p_country and region is null and is_active = true
      order by priority desc limit 1),
    0
  );
$$;

-- =============== PRIVILEGES ===============
-- Lock mutating functions to the service role (server-side only).
revoke execute on function public.recompute_product_stock(uuid)               from public, anon, authenticated;
revoke execute on function public.recompute_product_pricing(uuid)             from public, anon, authenticated;
revoke execute on function public.inventory_move(uuid, uuid, integer, inventory_reason, text, uuid) from public, anon, authenticated;
revoke execute on function public.inventory_set_on_hand(uuid, uuid, integer, text, uuid) from public, anon, authenticated;
revoke execute on function public.reserve_order_inventory(uuid)               from public, anon, authenticated;
revoke execute on function public.release_order_inventory(uuid)               from public, anon, authenticated;
revoke execute on function public.commit_order_inventory(uuid)                from public, anon, authenticated;
revoke execute on function public.restock_order_inventory(uuid)               from public, anon, authenticated;
revoke execute on function public.validate_discount(text, uuid, numeric, text) from public, anon, authenticated;

grant execute on function public.inventory_move(uuid, uuid, integer, inventory_reason, text, uuid) to service_role;
grant execute on function public.inventory_set_on_hand(uuid, uuid, integer, text, uuid) to service_role;
grant execute on function public.reserve_order_inventory(uuid)               to service_role;
grant execute on function public.release_order_inventory(uuid)               to service_role;
grant execute on function public.commit_order_inventory(uuid)                to service_role;
grant execute on function public.restock_order_inventory(uuid)               to service_role;
grant execute on function public.validate_discount(text, uuid, numeric, text) to service_role;
grant execute on function public.tax_rate_for(text, text)                    to service_role, authenticated;
