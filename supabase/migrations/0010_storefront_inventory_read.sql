-- Allow the public storefront to read default-location inventory for active products.
-- Without this, loadStorefrontVariants() returns available=0 for anonymous shoppers.

drop policy if exists "locations_storefront_read" on public.locations;
create policy "locations_storefront_read" on public.locations
  for select using (is_active = true);

drop policy if exists "inventory_levels_storefront_read" on public.inventory_levels;
create policy "inventory_levels_storefront_read" on public.inventory_levels
  for select using (
    exists (
      select 1
      from public.product_variants v
      join public.products p on p.id = v.product_id
      where v.id = variant_id
        and v.is_active = true
        and p.is_active = true
    )
  );

-- Repair products left with inactive variants after the old list-page "Hidden" toggle.
update public.product_variants v
set is_active = true
from public.products p
where p.id = v.product_id
  and p.is_active = true
  and v.is_active = false;

-- Re-sync denormalized products.stock after visibility repair.
do $$
declare
  pid uuid;
begin
  for pid in
    select distinct v.product_id
    from public.product_variants v
    join public.products p on p.id = v.product_id
    where p.is_active = true
  loop
    perform public.recompute_product_stock(pid);
  end loop;
end $$;
