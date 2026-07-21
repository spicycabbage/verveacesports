-- Replace Power Golf Carts catalog with MGI + Motocaddy products from Insanity Golf.
-- Idempotent: deactivates old golf products, upserts new catalog, backfills variants/inventory.

-- Hide previous electric-carts and golf-gear (preserves order history FKs).
update public.products set is_active = false
where category in ('electric-carts', 'golf-gear');

-- Remove deactivated golf products with no order history.
delete from public.products p
where p.is_active = false
  and p.category in ('electric-carts', 'golf-gear')
  and not exists (
    select 1 from public.order_items oi where oi.product_id = p.id
  );

insert into public.products (slug, name, description, category, price_usd, price_cad, images, stock, is_active, has_variants, options)
values
  ('mgi-ai-navigator-halo-halo-eye-bundle', 'MGI: Ai Navigator Halo + Halo Eye Bundle',
   'MGI Ai Navigator Halo remote-controlled e-caddy bundled with the Halo Eye 2D LiDAR sensor for follow-me, return-home, point-to-point navigation, and obstacle avoidance. GPS Geo Protect hazard mapping, brushless in-hub motors, gyroscope straight tracking, and bonus drink, umbrella, and phone holders included.',
   'electric-carts', 2572.79, 3499.00,
   array['https://static.wixstatic.com/media/6df5bf_2e142104e9de400ea6e254dc5a6e6abd~mv2.webp/v1/fit/w_1000,h_1000,q_90,enc_avif,quality_auto/6df5bf_2e142104e9de400ea6e254dc5a6e6abd~mv2.webp'],
   6, true, false, '[]'::jsonb),

  ('mgi-ai-navigator-halo', 'MGI: Ai Navigator HALO Remote Control Ecaddy',
   'Next-gen MGI Ai Navigator Halo with GPS Geo Protect hazard mapping, hands-free remote control, brushless in-hub motors, 5th-wheel stability, and gyroscope straight-track technology. Compact fold design for easy storage between rounds.',
   'electric-carts', 2205.15, 2999.00,
   array['https://static.wixstatic.com/media/6df5bf_2e142104e9de400ea6e254dc5a6e6abd~mv2.webp/v1/fit/w_1000,h_1000,q_90,enc_avif,quality_auto/6df5bf_2e142104e9de400ea6e254dc5a6e6abd~mv2.webp'],
   8, true, false, '[]'::jsonb),

  ('mgi-ai-navigator-gps', 'MGI: Ai Navigator GPS+ Remote Control Ecaddy',
   'MGI Ai Navigator GPS+ electric caddy with integrated GPS course mapping, remote control, downhill speed control, and compact folding frame. Smart navigation for confident shot selection on every hole.',
   'electric-carts', 1562.49, 2124.99,
   array['https://static.wixstatic.com/media/6df5bf_4018df30f43243cf87c20eaca1401295~mv2.webp/v1/fit/w_1000,h_1000,q_90,enc_avif,quality_auto/6df5bf_4018df30f43243cf87c20eaca1401295~mv2.webp'],
   8, true, false, '[]'::jsonb),

  ('mgi-zip-x1', 'MGI: Zip X1',
   'Compact MGI Zip X1 electric push cart with remote control for effortless walking rounds. Lightweight foldable design built for everyday course use.',
   'electric-carts', 661.76, 899.99,
   array['https://static.wixstatic.com/media/6df5bf_02266e73643c4d2080a464b275e0d565~mv2.webp/v1/fit/w_1000,h_1000,q_90,enc_avif,quality_auto/6df5bf_02266e73643c4d2080a464b275e0d565~mv2.webp'],
   10, true, false, '[]'::jsonb),

  ('mgi-e-boost-pushcart', 'MGI: E-Boost Pushcart',
   'MGI E-Boost motorized push cart for golfers who want electric assist without full remote-control complexity. Easy to fold, store, and walk the course with less fatigue.',
   'electric-carts', 441.17, 599.99,
   array['https://static.wixstatic.com/media/6df5bf_8115fb22873c4567820b87f06b87aed7~mv2.webp/v1/fit/w_1000,h_1000,q_90,enc_avif,quality_auto/6df5bf_8115fb22873c4567820b87f06b87aed7~mv2.webp'],
   12, true, false, '[]'::jsonb),

  ('mgi-zip-navigator-at-all-terrain', 'MGI: Zip Navigator AT - All Terrain',
   'MGI Zip Navigator AT all-terrain remote-control e-caddy engineered for uneven lies, slopes, and demanding course conditions. Full remote operation with rugged traction and stability.',
   'electric-carts', 1580.15, 2149.00,
   array['https://static.wixstatic.com/media/6df5bf_13394a551d6b435faf71dea6dd9d9290~mv2.webp/v1/fit/w_1000,h_1000,q_90,enc_avif,quality_auto/6df5bf_13394a551d6b435faf71dea6dd9d9290~mv2.webp'],
   8, true, false, '[]'::jsonb),

  ('mgi-zip-navigator', 'MGI: Zip Navigator Remote Control Ecart',
   'MGI Zip Navigator remote-control electric cart with intuitive handset operation, reliable motor performance, and a compact fold for trunk storage.',
   'electric-carts', 1250.00, 1699.99,
   array['https://static.wixstatic.com/media/6df5bf_8e02992f795545acaa7f9657b8f2a91b~mv2.webp/v1/fit/w_1000,h_1000,q_90,enc_avif,quality_auto/6df5bf_8e02992f795545acaa7f9657b8f2a91b~mv2.webp'],
   10, true, false, '[]'::jsonb),

  ('mgi-zip-x5', 'MGI: Zip X5',
   'MGI Zip X5 remote-control electric trolley — a versatile mid-range e-cart with smooth power delivery and quick-fold portability for walking golfers.',
   'electric-carts', 937.49, 1274.99,
   array['https://static.wixstatic.com/media/6df5bf_edb1c7c2114e402b88ad6f0ba591a5bb~mv2.webp/v1/fit/w_800,h_800,q_90,enc_avif,quality_auto/6df5bf_edb1c7c2114e402b88ad6f0ba591a5bb~mv2.webp'],
   10, true, false, '[]'::jsonb),

  ('motocaddy-m7-gps-2026', 'Motocaddy: M7 GPS Remote Control Electric Trolley - 2026',
   '2026 Motocaddy M7 GPS with full remote control, integrated GPS yardages, downhill control (DHC), and a slim-fold frame. Flagship trolley for tech-forward walking golfers.',
   'electric-carts', 1947.79, 2648.99,
   array['https://static.wixstatic.com/media/6df5bf_204a114f9b8e44fc8fef093ac3a77cfc~mv2.webp/v1/fit/w_1200,h_1200,q_90,enc_avif,quality_auto/6df5bf_204a114f9b8e44fc8fef093ac3a77cfc~mv2.webp'],
   6, true, false, '[]'::jsonb),

  ('motocaddy-m7-2026', 'Motocaddy: M7 Remote Control Electric Trolley - 2026',
   '2026 Motocaddy M7 remote-control electric trolley with premium build quality, responsive handset control, and compact storage footprint.',
   'electric-carts', 1616.91, 2198.99,
   array['https://static.wixstatic.com/media/6df5bf_483671bd1c3f41688c7e60b93896f5c5~mv2.webp/v1/fit/w_1200,h_1200,q_90,enc_avif,quality_auto/6df5bf_483671bd1c3f41688c7e60b93896f5c5~mv2.webp'],
   8, true, false, '[]'::jsonb),

  ('motocaddy-m5-gps-dhc-2026', 'Motocaddy: M5 GPS DHC Electric Trolley - 2026',
   '2026 Motocaddy M5 GPS with Downhill Control — integrated GPS distances plus automatic speed regulation on slopes for steady, controlled walks between shots.',
   'electric-carts', 1322.06, 1798.00,
   array['https://static.wixstatic.com/media/6df5bf_055186b5cc3547cca79e710dfd1e13ec~mv2.webp/v1/fit/w_1200,h_1200,q_90,enc_avif,quality_auto/6df5bf_055186b5cc3547cca79e710dfd1e13ec~mv2.webp'],
   8, true, false, '[]'::jsonb),

  ('motocaddy-m1-dhc-2026', 'Motocaddy: M1 DHC Electric Trolley - 2026',
   '2026 Motocaddy M1 DHC entry-level electric trolley with downhill speed control — reliable, easy to operate, and quick to fold for everyday course use.',
   'electric-carts', 1028.68, 1399.00,
   array['https://static.wixstatic.com/media/6df5bf_e163f16a1da943d58c4ea251f9253556~mv2.webp/v1/fit/w_1200,h_1200,q_90,enc_avif,quality_auto/6df5bf_e163f16a1da943d58c4ea251f9253556~mv2.webp'],
   10, true, false, '[]'::jsonb),

  ('motocaddy-28v-anti-tip-wheel-2024', '28V M-Series Anti-tip Wheel (2024)',
   'Motocaddy 28V M-Series anti-tip wheel accessory (2024) — adds extra stability on slopes and uneven terrain for M-Series trolleys.',
   'golf-gear', 26.47, 36.00,
   array['https://static.wixstatic.com/media/6df5bf_cb47826b9a344e52b8c294718888f327~mv2.webp/v1/fit/w_1000,h_1000,q_90,enc_avif,quality_auto/6df5bf_cb47826b9a344e52b8c294718888f327~mv2.webp'],
   30, true, false, '[]'::jsonb),

  ('motocaddy-essential-accessory-pack', 'Essential Accessory Pack',
   'Motocaddy essential accessory pack — drink holder, scorecard holder, and other course-day essentials for Motocaddy trolleys.',
   'golf-gear', 72.79, 99.00,
   array['https://static.wixstatic.com/media/6df5bf_35adbccb049948a791758b5e5a526a5c~mv2.webp/v1/fit/w_1200,h_1200,q_90,enc_avif,quality_auto/6df5bf_35adbccb049948a791758b5e5a526a5c~mv2.webp'],
   25, true, false, '[]'::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  price_usd = excluded.price_usd,
  price_cad = excluded.price_cad,
  images = excluded.images,
  stock = excluded.stock,
  is_active = excluded.is_active,
  has_variants = excluded.has_variants,
  options = excluded.options;

-- Keep default variant prices in sync on re-run.
update public.product_variants v
set price_usd = p.price_usd,
    price_cad = p.price_cad,
    is_active = p.is_active
from public.products p
where v.product_id = p.id
  and p.is_active = true
  and p.category in ('electric-carts', 'golf-gear')
  and v.title = 'Default';

-- Default variant + inventory for new simple products.
do $$
declare
  loc_id uuid;
  pid uuid;
begin
  select id into loc_id from public.locations where is_default = true limit 1;
  if loc_id is null then
    insert into public.locations (name, is_active, is_default, priority)
    values ('Primary Warehouse', true, true, 100)
    returning id into loc_id;
  end if;

  insert into public.product_variants (product_id, sku, title, price_usd, price_cad, position, is_active)
  select p.id, upper(replace(p.slug, '-', '')), 'Default', p.price_usd, p.price_cad, 1, p.is_active
  from public.products p
  where p.is_active = true
    and p.category in ('electric-carts', 'golf-gear')
    and p.has_variants = false
    and not exists (select 1 from public.product_variants v where v.product_id = p.id);

  insert into public.inventory_levels (variant_id, location_id, on_hand, reserved)
  select v.id, loc_id, coalesce(p.stock, 0), 0
  from public.product_variants v
  join public.products p on p.id = v.product_id
  where p.is_active = true
    and p.category in ('electric-carts', 'golf-gear')
    and not exists (
      select 1 from public.inventory_levels il
      where il.variant_id = v.id and il.location_id = loc_id
    );

  for pid in
    select id from public.products
    where is_active = true and category in ('electric-carts', 'golf-gear')
  loop
    perform public.recompute_product_stock(pid);
  end loop;
end $$;
