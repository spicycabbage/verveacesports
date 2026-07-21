-- Security hardening from the audit: atomic loyalty redemption (kills the
-- double-spend race), atomic discount reservation (kills the usage-limit race),
-- least-privilege function grants, tighter RLS, and storage listing lockdown.

-- =============== ATOMIC LOYALTY POINTS ===============
-- Strict redemption: only succeeds if the user has enough points.
create or replace function public.redeem_loyalty_points(p_user uuid, p_points integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_points <= 0 then
    return false;
  end if;
  update public.profiles
    set loyalty_points = loyalty_points - p_points
    where id = p_user and loyalty_points >= p_points;
  return found;
end;
$$;

-- Clamped adjustment (clawbacks / restores). Returns the delta actually applied.
create or replace function public.adjust_loyalty_points(p_user uuid, p_delta integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before integer;
  v_after integer;
begin
  select loyalty_points into v_before from public.profiles where id = p_user for update;
  if not found then
    return 0;
  end if;
  v_after := greatest(0, v_before + p_delta);
  update public.profiles set loyalty_points = v_after where id = p_user;
  return v_after - v_before;
end;
$$;

-- =============== ATOMIC DISCOUNT RESERVATION ===============
-- Reserve a redemption at order creation: bumps used_count only when under the
-- usage limit, and records the redemption row (unique per order+discount).
create or replace function public.reserve_discount(
  p_code text,
  p_order uuid,
  p_user uuid,
  p_amount numeric
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_discount_id uuid;
begin
  update public.discounts
    set used_count = used_count + 1
    where lower(code) = lower(p_code)
      and is_active = true
      and (usage_limit is null or used_count < usage_limit)
    returning id into v_discount_id;
  if v_discount_id is null then
    return false;
  end if;

  insert into public.discount_redemptions (discount_id, order_id, user_id, amount)
  values (v_discount_id, p_order, p_user, coalesce(p_amount, 0))
  on conflict (order_id, discount_id) do nothing;
  return true;
end;
$$;

-- Release a reservation when the order fails/cancels before payment.
create or replace function public.release_discount(p_order uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  for r in
    delete from public.discount_redemptions
      where order_id = p_order
      returning discount_id
  loop
    update public.discounts
      set used_count = greatest(0, used_count - 1)
      where id = r.discount_id;
  end loop;
end;
$$;

-- =============== FUNCTION GRANTS (least privilege) ===============
revoke execute on function public.redeem_loyalty_points(uuid, integer) from public, anon, authenticated;
revoke execute on function public.adjust_loyalty_points(uuid, integer) from public, anon, authenticated;
revoke execute on function public.reserve_discount(text, uuid, uuid, numeric) from public, anon, authenticated;
revoke execute on function public.release_discount(uuid) from public, anon, authenticated;
grant execute on function public.redeem_loyalty_points(uuid, integer) to service_role;
grant execute on function public.adjust_loyalty_points(uuid, integer) to service_role;
grant execute on function public.reserve_discount(text, uuid, uuid, numeric) to service_role;
grant execute on function public.release_discount(uuid) to service_role;

-- Advisor warnings: SECURITY DEFINER functions callable by anon/authenticated.
revoke execute on function public.tax_rate_for(text, text) from public, anon, authenticated;
revoke execute on function public.trg_inventory_recompute() from public, anon, authenticated;
revoke execute on function public.trg_variant_recompute() from public, anon, authenticated;
revoke execute on function public.enforce_profile_column_guard() from public, anon, authenticated;
revoke execute on function public.increment_refunded_qty(uuid, integer) from public, anon, authenticated;

-- =============== RLS TIGHTENING ===============
-- Discount codes should not be enumerable by any signed-in user; validation is
-- authoritative server-side (service role).
drop policy if exists "discounts_authenticated_read" on public.discounts;

-- Line-item tables: readable via parent order ownership or admin.
drop policy if exists "refund_line_items_select_own" on public.refund_line_items;
create policy "refund_line_items_select_own" on public.refund_line_items
  for select using (
    exists (
      select 1
      from public.refunds r
      join public.orders o on o.id = r.order_id
      where r.id = refund_line_items.refund_id
        and (o.user_id = auth.uid()
             or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
    )
  );

drop policy if exists "fulfillment_line_items_select_own" on public.fulfillment_line_items;
create policy "fulfillment_line_items_select_own" on public.fulfillment_line_items
  for select using (
    exists (
      select 1
      from public.fulfillments f
      join public.orders o on o.id = f.order_id
      where f.id = fulfillment_line_items.fulfillment_id
        and (o.user_id = auth.uid()
             or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
    )
  );

drop policy if exists "discount_redemptions_admin_read" on public.discount_redemptions;
create policy "discount_redemptions_admin_read" on public.discount_redemptions
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "webhook_events_admin_read" on public.webhook_events;
create policy "webhook_events_admin_read" on public.webhook_events
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- =============== STORAGE ===============
-- Public bucket objects are served via public URL without RLS; the broad SELECT
-- policy only enabled bucket listing via the API. Remove it.
drop policy if exists "product_images_public_read" on storage.objects;
