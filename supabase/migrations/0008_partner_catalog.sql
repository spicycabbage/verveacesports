-- Replace legacy sporting-goods catalog with BleeqUp + Power Golf Carts products.
-- Idempotent: deactivates old products, upserts partner catalog, backfills variants/inventory.

-- Hide legacy catalog (preserves order history FKs).
update public.products set is_active = false
where slug not in (
  'bleequp-ranger-standard-lens',
  'bleequp-ranger-zeiss-lens',
  'bleequp-ranger-ultimate-bundle',
  'bleequp-power-plus',
  'bleequp-bluetooth-controller',
  'bleequp-magnetic-charging-wire',
  'bleequp-orange-red-lens',
  'bleequp-photochromic-black-red',
  'zeiss-blue-lens',
  'bleequp-prescription-service',
  'robera-pro',
  'ego-caddy-m5',
  'volt-caddy',
  'insanity-golf-waterproof-bag',
  'robera-pro-seat',
  'robera-pro-drink-holder',
  'robera-pro-phone-holder',
  'robera-pro-umbrella-holder',
  'robera-pro-sand-bottle-holder'
);

insert into public.products (slug, name, description, category, price_usd, price_cad, images, stock, is_active, has_variants, options)
values
  ('bleequp-ranger-standard-lens', 'BleeqUp Ranger AI Sports Camera Glasses - Standard Lens',
   'BleeqUp Ranger AI Sports Camera Glasses feature an AI-powered action camera, integrated mics and speakers, pro-grade sports protection, and a lightweight design for hands-free POV capture on every ride and outdoor adventure. 3K video, 120° FOV, open-ear audio, and up to 5 hours of recording with Power Plus.',
   'ai-glasses', 379.00, 515.44,
   array[
     'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Ranger_Black_Standard_Lens.jpg?v=1781082522',
     'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Ranger_Pink_Standard_Lens.jpg?v=1781082573'
   ],
   25, true, true,
   '[{"name":"Style","values":["Black - Standard Orange Red Lens","Pink Purple - Standard Pink Purple Lens","White - Standard Gold Lens"]}]'::jsonb),

  ('bleequp-ranger-zeiss-lens', 'BleeqUp Ranger AI Sports Camera Glasses - Lenses by Zeiss',
   'The flagship BleeqUp Ranger with ZEISS lenses for clearer reads, less glare, and faster reactions on the move. Same 4-in-1 AI camera glasses with Snapdragon-powered stabilization, open-ear audio, and prescription frame included.',
   'ai-glasses', 439.00, 597.04,
   array['https://cdn.shopify.com/s/files/1/0674/8527/0213/files/Bleequp_Ranger_Zeiss_Black_with_Logo_Hero.jpg?v=1781083379'],
   20, true, false, '[]'::jsonb),

  ('bleequp-ranger-ultimate-bundle', 'BleeqUp Ranger AI Sports Camera Glasses - Ultimate Bundle',
   'Everything you need to start recording: BleeqUp Ranger glasses, Power Plus extended battery, Bluetooth controller, and magnetic charging wire. Save versus buying accessories separately.',
   'ai-glasses', 499.00, 678.64,
   array['https://cdn.shopify.com/s/files/1/0674/8527/0213/files/4_in_1_bundle.jpg?v=1774582922'],
   15, true, false, '[]'::jsonb),

  ('bleequp-power-plus', 'BleeqUp Power Plus',
   '1600 mAh capsule battery extends Ranger continuous recording from 1 hour to over 4 hours and audio playback to 48 hours. IP56-rated, 42g, clips to your helmet.',
   'wearables', 49.00, 66.64,
   array['https://cdn.shopify.com/s/files/1/0674/8527/0213/files/Bleequp_Power_Plus_Hero_Image.jpg?v=1776843169'],
   80, true, false, '[]'::jsonb),

  ('bleequp-bluetooth-controller', 'BleeqUp Bluetooth Controller',
   'Wireless remote to trigger photos and video without stopping your workout. Pairs instantly with Ranger glasses.',
   'wearables', 49.00, 66.64,
   array['https://cdn.shopify.com/s/files/1/0674/8527/0213/files/Bleequp_Bluethooth_Controller_Hero_Image.jpg?v=1776843201'],
   80, true, false, '[]'::jsonb),

  ('bleequp-magnetic-charging-wire', 'BleeqUp Magnetic Charging Wire',
   'Magnetic charging cable for Ranger glasses and Power Plus. Quick-connect design for easy charging between sessions.',
   'wearables', 19.00, 25.84,
   array['https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Magnetic_Charging_Wire.jpg?v=1753958202'],
   120, true, false, '[]'::jsonb),

  ('bleequp-orange-red-lens', 'BleeqUp Orange Red Lens',
   'Swappable UV400 lens for Ranger glasses. Standard orange-red tint for everyday sport and outdoor use.',
   'wearables', 49.00, 66.64,
   array['https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Orange_Red_Lens_V2.jpg?v=1780992182'],
   60, true, false, '[]'::jsonb),

  ('bleequp-photochromic-black-red', 'BleeqUp Photochromic Lens (Clear to Black Red)',
   'Photochromic swappable lens that adapts from clear indoors to black-red tint in bright sun. UV400 protection.',
   'wearables', 69.00, 93.84,
   array['https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Photochromic_Lens_Clear_to_Black_Red.jpg?v=1780991946'],
   50, true, false, '[]'::jsonb),

  ('zeiss-blue-lens', 'ZEISS Blue Lens',
   'Premium ZEISS blue lens upgrade for BleeqUp Ranger. Sharper contrast and reduced glare for cycling and trail sports.',
   'wearables', 79.00, 107.44,
   array['https://cdn.shopify.com/s/files/1/0674/8527/0213/files/Bleequp_Ranger_ZEISS_Blue_Lens.jpg?v=1780991778'],
   40, true, false, '[]'::jsonb),

  ('bleequp-prescription-service', 'BleeqUp Prescription Customization',
   'Prescription frame insert included with every Ranger purchase. Customize RX lenses through BleeqUp or your local optician.',
   'wearables', 69.00, 93.84,
   array['https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Ranger_glasses_with_prescription_frame.jpg?v=1776097135'],
   999, true, false, '[]'::jsonb),

  ('robera-pro', 'Robera Pro Electric Golf Caddy',
   'Built-in AI Vision with RGB and TOF technology recognizes golfers in all lighting conditions. Follows you with hand gestures for hands-free course navigation. Premium electric golf caddy from Power Golf Carts.',
   'electric-carts', 1999.00, 2718.64,
   array['https://www.powergolfcarts.shop/uploads/products/robera-pro-black-1-1759534531195.jpg'],
   8, true, false, '[]'::jsonb),

  ('ego-caddy-m5', 'Ego Caddy M5 Smart Follow Me E-Cart',
   'Top-of-the-line smart follow-me electric cart with 35° slope capability, 36–45 hole lithium battery, USB charging, and mobile app telemetry. Automatically follows you on the course.',
   'electric-carts', 1999.99, 2719.99,
   array['https://www.powergolfcarts.shop/uploads/products/ego-caddy-electric-golf-cart-1759544812780.png'],
   6, true, false, '[]'::jsonb),

  ('volt-caddy', 'Volt Caddy Electric Trolley',
   'Compact, foldable electric trolley with AI-assisted remote control. Walk the course with ease — sleek design meets course-ready functionality.',
   'electric-carts', 800.00, 1088.00,
   array['https://www.powergolfcarts.shop/uploads/products/volt-caddy-1-1759541292258.jpg'],
   12, true, false, '[]'::jsonb),

  ('insanity-golf-waterproof-bag', 'Insanity Golf Waterproof Cart Bag',
   'Upgraded waterproof 14-club cart bag with full-length dividers, rain cover, and built-in cooler pocket. Light, scratch-resistant, and built for four-season use on e-carts or riding carts.',
   'golf-gear', 260.00, 353.60,
   array['https://www.powergolfcarts.shop/uploads/products/insanity-golf-waterproof-golf-bag-blue-1759547163839.jpg'],
   30, true, false, '[]'::jsonb),

  ('robera-pro-seat', 'Robera Pro Seat',
   'Comfort seat accessory for Robera Pro electric caddies. Quick-attach design for resting between shots.',
   'golf-gear', 99.00, 134.64,
   array['https://www.powergolfcarts.shop/uploads/products/seat-1759566941635.webp'],
   25, true, false, '[]'::jsonb),

  ('robera-pro-drink-holder', 'Robera Pro Drink Holder',
   'Secure drink holder accessory for Robera Pro caddies. Keeps hydration within reach on every hole.',
   'golf-gear', 25.00, 34.00,
   array['https://www.powergolfcarts.shop/uploads/products/robera-drink-holder-2-1759568085952.webp'],
   50, true, false, '[]'::jsonb),

  ('robera-pro-phone-holder', 'Robera Pro Phone Holder',
   'Phone mount for Robera Pro — view GPS yardages and scores while your caddy follows hands-free.',
   'golf-gear', 25.00, 34.00,
   array['https://www.powergolfcarts.shop/uploads/products/robera-phone-holder-1759567882846.webp'],
   50, true, false, '[]'::jsonb),

  ('robera-pro-umbrella-holder', 'Robera Pro Umbrella Holder',
   'Umbrella holder attachment for Robera Pro electric caddies. Stay dry without breaking your rhythm.',
   'golf-gear', 25.00, 34.00,
   array['https://www.powergolfcarts.shop/uploads/products/robera-umbrella-holder-2-1759567214971.webp'],
   50, true, false, '[]'::jsonb),

  ('robera-pro-sand-bottle-holder', 'Robera Pro Sand Bottle Holder',
   'Sand bottle holder for Robera Pro — keep bunker rakes and bottles organized on the bag.',
   'golf-gear', 35.00, 47.60,
   array['https://www.powergolfcarts.shop/uploads/products/sand-bottle-1759567441300.webp'],
   40, true, false, '[]'::jsonb)
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

-- Ranger Standard Lens color variants (remove any auto default first).
delete from public.product_variants v
using public.products p
where v.product_id = p.id
  and p.slug = 'bleequp-ranger-standard-lens';

insert into public.product_variants (product_id, sku, title, option1, price_usd, price_cad, position, is_active)
select
  p.id,
  vr.sku,
  vr.title,
  vr.option1,
  vr.variant_usd,
  vr.variant_cad,
  vr.variant_pos,
  true
from public.products p
cross join (values
  ('10100015', 'Black - Standard Orange Red Lens', 'Black - Standard Orange Red Lens', 379.00::numeric, 515.44::numeric, 1),
  ('10100026', 'Pink Purple - Standard Pink Purple Lens', 'Pink Purple - Standard Pink Purple Lens', 389.00::numeric, 528.24::numeric, 2),
  ('10100025', 'White - Standard Gold Lens', 'White - Standard Gold Lens', 389.00::numeric, 528.24::numeric, 3)
) as vr(sku, title, option1, variant_usd, variant_cad, variant_pos)
where p.slug = 'bleequp-ranger-standard-lens';

-- Default variant + inventory for simple products.
do $$
declare
  loc_id uuid;
begin
  select id into loc_id from public.locations where is_default = true limit 1;
  if loc_id is null then
    insert into public.locations (name, is_active, is_default, priority)
    values ('Primary Warehouse', true, true, 100)
    returning id into loc_id;
  end if;

  insert into public.inventory_levels (variant_id, location_id, on_hand, reserved)
  select v.id, loc_id, 25, 0
  from public.product_variants v
  join public.products p on p.id = v.product_id
  where p.slug = 'bleequp-ranger-standard-lens'
    and not exists (
      select 1 from public.inventory_levels il
      where il.variant_id = v.id and il.location_id = loc_id
    );

  insert into public.product_variants (product_id, sku, title, price_usd, price_cad, position, is_active)
  select p.id, upper(replace(p.slug, '-', '')), 'Default', p.price_usd, p.price_cad, 1, p.is_active
  from public.products p
  where p.is_active = true
    and p.has_variants = false
    and not exists (select 1 from public.product_variants v where v.product_id = p.id);

  insert into public.inventory_levels (variant_id, location_id, on_hand, reserved)
  select v.id, loc_id, coalesce(p.stock, 0), 0
  from public.product_variants v
  join public.products p on p.id = v.product_id
  where p.is_active = true
    and not exists (
      select 1 from public.inventory_levels il
      where il.variant_id = v.id and il.location_id = loc_id
    );

  -- Sync denormalized stock on products from inventory.
  update public.products p
  set stock = sub.avail
  from (
    select v.product_id, sum(greatest(il.on_hand - il.reserved, 0)) as avail
    from public.product_variants v
    join public.inventory_levels il on il.variant_id = v.id
    join public.products pr on pr.id = v.product_id
    where pr.is_active = true
    group by v.product_id
  ) sub
  where p.id = sub.product_id;
end $$;
