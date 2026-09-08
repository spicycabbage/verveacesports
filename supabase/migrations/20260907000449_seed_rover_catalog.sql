-- Seed BleeqUp Rover line from bleequp.com (Sep 2026).
-- CAD = Shopify Canada presentment (cart/add.js + localization=CA).
-- USD = bleequp.com list price. Inventory: 10 units per variant.

insert into public.products (
  slug, name, description, category, price_usd, price_cad, images, stock, is_active, has_variants, options
)
values
  (
    'bleequp-rover-ai-sports-glasses',
    'BleeqUp Rover AI Sports Glasses - Lenses by ZEISS',
    'BleeqUp Rover is an AI sports glasses platform with a 3-level tilt camera (-10° / 0° / 15°), 3K60 HDR video, 64GB storage, open-ear audio, and AI assistance for riding. IP65, 53g. Includes magnetic charging cable, prescription frame insert, and storage kit.',
    'ai-glasses',
    459.00,
    648.00,
    array[
      'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/4feb7c0139c4d61e49e5d93a29c4093d.png?v=1788523792',
      'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/1aa36c4cccdf62d2e0315816d6f280f7.png?v=1788523792',
      'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/9f260746671be49d04cada079285e451.png?v=1788535167',
      'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/940e7676f4d5cb4958b31e4797cf2ecd.png?v=1788535167'
    ],
    20,
    true,
    true,
    '[{"name":"Style","values":["Black Frame - Gold ZEISS Lens","Black Frame - Silver ZEISS Lens"]}]'::jsonb
  ),
  (
    'bleequp-rover-ai-sports-glasses-bundle',
    'BleeqUp Rover AI Sports Glasses Bundle',
    'Rover AI sports glasses with ZEISS lenses, Rover Power Plus, and Bluetooth Controller. Optional Photochromic Clear Lens add-on.',
    'ai-glasses',
    519.00,
    769.00,
    array[
      'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-bundle-kit-black-gold-zeiss.png?v=1788522779',
      'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-bundle-kit-black-silver-zeiss.png?v=1788522779'
    ],
    40,
    true,
    true,
    '[{"name":"Style","values":["Black Frame - Gold ZEISS Lens","Black Frame - Silver ZEISS Lens"]},{"name":"Photochromic Lens","values":["No extra lens","Photochromic Clear Lens"]}]'::jsonb
  ),
  (
    'bleequp-rover-zeiss-lens',
    'BleeqUp Rover ZEISS Lens',
    'ZEISS UV400 swappable replacement lens for BleeqUp Rover AI sports glasses.',
    'wearables',
    79.00,
    112.00,
    array['https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-lens-zeiss.webp?v=1788538089'],
    40,
    true,
    true,
    '[{"name":"Color","values":["Gold","Silver","Blue","Pink"]}]'::jsonb
  ),
  (
    'bleequp-rover-photochromic-lens',
    'BleeqUp Rover Photochromic Lens',
    'Photochromic swappable replacement lens for BleeqUp Rover AI sports glasses in changing light.',
    'wearables',
    69.00,
    98.00,
    array['https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-lens-photochromic.webp?v=1788538095'],
    20,
    true,
    true,
    '[{"name":"Color","values":["Clear","Red Black"]}]'::jsonb
  ),
  (
    'bleequp-rover-polarized-lens',
    'BleeqUp Rover Polarized Lens',
    'Polarized swappable replacement lens for BleeqUp Rover AI sports glasses to help control outdoor glare.',
    'wearables',
    79.00,
    112.00,
    array['https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-lens-polarized.webp?v=1788538103'],
    20,
    true,
    true,
    '[{"name":"Color","values":["Clear","Red Black"]}]'::jsonb
  ),
  (
    'bleequp-rover-power-plus',
    'BleeqUp Rover Power Plus',
    'Power Plus charging accessory for BleeqUp Rover. Extends total recording time to up to 5 hours, or audio playback to up to 48 hours.',
    'wearables',
    49.00,
    69.00,
    array['https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-power-plus.png?v=1788509881'],
    10,
    true,
    false,
    '[]'::jsonb
  )
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

-- Rover glasses
insert into public.product_variants (
  product_id, sku, title, option1, price_usd, price_cad, position, is_active, image_url
)
select p.id, vr.sku, vr.title, vr.option1, vr.usd, vr.cad, vr.pos, true, vr.image
from public.products p
cross join (values
  (
    '10100040',
    'Black Frame - Gold ZEISS Lens',
    'Black Frame - Gold ZEISS Lens',
    459.00::numeric, 648.00::numeric, 1,
    'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/9f260746671be49d04cada079285e451.png?v=1788535167'
  ),
  (
    '10100039',
    'Black Frame - Silver ZEISS Lens',
    'Black Frame - Silver ZEISS Lens',
    459.00::numeric, 648.00::numeric, 2,
    'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/940e7676f4d5cb4958b31e4797cf2ecd.png?v=1788535167'
  )
) as vr(sku, title, option1, usd, cad, pos, image)
where p.slug = 'bleequp-rover-ai-sports-glasses'
on conflict (sku) do update set
  title = excluded.title,
  option1 = excluded.option1,
  price_usd = excluded.price_usd,
  price_cad = excluded.price_cad,
  position = excluded.position,
  is_active = excluded.is_active,
  image_url = excluded.image_url;

-- Rover bundle (CAD add-on for photochromic = $98 from CA cart)
insert into public.product_variants (
  product_id, sku, title, option1, option2, price_usd, price_cad, compare_at_usd, compare_at_cad, position, is_active, image_url
)
select p.id, vr.sku, vr.title, vr.option1, vr.option2, vr.usd, vr.cad, vr.cmp_usd, vr.cmp_cad, vr.pos, true, vr.image
from public.products p
cross join (values
  (
    '10100040+10200102+10200108',
    'Black Frame - Gold ZEISS Lens / No extra lens',
    'Black Frame - Gold ZEISS Lens',
    'No extra lens',
    519.00::numeric, 769.00::numeric, 557.00::numeric, 786.00::numeric, 1,
    'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-bundle-kit-black-gold-zeiss.png?v=1788522779'
  ),
  (
    '10100040+10200019+10200102+10200108',
    'Black Frame - Gold ZEISS Lens / Photochromic Clear Lens',
    'Black Frame - Gold ZEISS Lens',
    'Photochromic Clear Lens',
    579.00::numeric, 867.00::numeric, 626.00::numeric, 884.00::numeric, 2,
    'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-bundle-kit-black-gold-zeiss.png?v=1788522779'
  ),
  (
    '10100039+10200102+10200108',
    'Black Frame - Silver ZEISS Lens / No extra lens',
    'Black Frame - Silver ZEISS Lens',
    'No extra lens',
    519.00::numeric, 769.00::numeric, 557.00::numeric, 786.00::numeric, 3,
    'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-bundle-kit-black-silver-zeiss.png?v=1788522779'
  ),
  (
    '10100039+10200019+10200102+10200108',
    'Black Frame - Silver ZEISS Lens / Photochromic Clear Lens',
    'Black Frame - Silver ZEISS Lens',
    'Photochromic Clear Lens',
    579.00::numeric, 867.00::numeric, 626.00::numeric, 884.00::numeric, 4,
    'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-bundle-kit-black-silver-zeiss.png?v=1788522779'
  )
) as vr(sku, title, option1, option2, usd, cad, cmp_usd, cmp_cad, pos, image)
where p.slug = 'bleequp-rover-ai-sports-glasses-bundle'
on conflict (sku) do update set
  title = excluded.title,
  option1 = excluded.option1,
  option2 = excluded.option2,
  price_usd = excluded.price_usd,
  price_cad = excluded.price_cad,
  compare_at_usd = excluded.compare_at_usd,
  compare_at_cad = excluded.compare_at_cad,
  position = excluded.position,
  is_active = excluded.is_active,
  image_url = excluded.image_url;

-- Rover ZEISS lenses
insert into public.product_variants (
  product_id, sku, title, option1, price_usd, price_cad, position, is_active, image_url
)
select p.id, vr.sku, vr.title, vr.option1, 79.00, 112.00, vr.pos, true,
  'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-lens-zeiss.webp?v=1788538089'
from public.products p
cross join (values
  ('10200018', 'Gold', 'Gold', 1),
  ('10200017', 'Silver', 'Silver', 2),
  ('10200016', 'Blue', 'Blue', 3),
  ('10200026', 'Pink', 'Pink', 4)
) as vr(sku, title, option1, pos)
where p.slug = 'bleequp-rover-zeiss-lens'
on conflict (sku) do update set
  title = excluded.title,
  option1 = excluded.option1,
  price_usd = excluded.price_usd,
  price_cad = excluded.price_cad,
  position = excluded.position,
  is_active = excluded.is_active,
  image_url = excluded.image_url;

-- Rover photochromic
insert into public.product_variants (
  product_id, sku, title, option1, price_usd, price_cad, position, is_active, image_url
)
select p.id, vr.sku, vr.title, vr.option1, 69.00, 98.00, vr.pos, true,
  'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-lens-photochromic.webp?v=1788538095'
from public.products p
cross join (values
  ('10200019', 'Clear', 'Clear', 1),
  ('10200020', 'Red Black', 'Red Black', 2)
) as vr(sku, title, option1, pos)
where p.slug = 'bleequp-rover-photochromic-lens'
on conflict (sku) do update set
  title = excluded.title,
  option1 = excluded.option1,
  price_usd = excluded.price_usd,
  price_cad = excluded.price_cad,
  position = excluded.position,
  is_active = excluded.is_active,
  image_url = excluded.image_url;

-- Rover polarized (Red Black has no Shopify SKU — synthetic)
insert into public.product_variants (
  product_id, sku, title, option1, price_usd, price_cad, position, is_active, image_url
)
select p.id, vr.sku, vr.title, vr.option1, 79.00, 112.00, vr.pos, true,
  'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-lens-polarized.webp?v=1788538103'
from public.products p
cross join (values
  ('10200021', 'Clear', 'Clear', 1),
  ('10200022', 'Red Black', 'Red Black', 2)
) as vr(sku, title, option1, pos)
where p.slug = 'bleequp-rover-polarized-lens'
on conflict (sku) do update set
  title = excluded.title,
  option1 = excluded.option1,
  price_usd = excluded.price_usd,
  price_cad = excluded.price_cad,
  position = excluded.position,
  is_active = excluded.is_active,
  image_url = excluded.image_url;

-- Rover Power Plus (simple)
insert into public.product_variants (product_id, sku, title, price_usd, price_cad, position, is_active, image_url)
select
  p.id,
  '10200108',
  'Default',
  49.00,
  69.00,
  1,
  true,
  'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-power-plus.png?v=1788509881'
from public.products p
where p.slug = 'bleequp-rover-power-plus'
on conflict (sku) do update set
  title = excluded.title,
  price_usd = excluded.price_usd,
  price_cad = excluded.price_cad,
  is_active = excluded.is_active,
  image_url = excluded.image_url;

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

  delete from public.product_variants v
  using public.products p
  where v.product_id = p.id
    and p.slug in (
      'bleequp-rover-ai-sports-glasses',
      'bleequp-rover-ai-sports-glasses-bundle',
      'bleequp-rover-zeiss-lens',
      'bleequp-rover-photochromic-lens',
      'bleequp-rover-polarized-lens',
      'bleequp-rover-power-plus'
    )
    and v.title = 'Default'
    and v.sku like 'BLEEQUP%';

  insert into public.inventory_levels (variant_id, location_id, on_hand, reserved)
  select v.id, loc_id, 10, 0
  from public.product_variants v
  join public.products p on p.id = v.product_id
  where p.slug in (
    'bleequp-rover-ai-sports-glasses',
    'bleequp-rover-ai-sports-glasses-bundle',
    'bleequp-rover-zeiss-lens',
    'bleequp-rover-photochromic-lens',
    'bleequp-rover-polarized-lens',
    'bleequp-rover-power-plus'
  )
  on conflict (variant_id, location_id) do update set
    on_hand = 10,
    reserved = excluded.reserved;
end $$;
