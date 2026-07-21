-- BleeqUp authorized retailer price list (WHOLEBRAND TRADING, effective Dec 31 2026).
-- CAD retail = Retailer Price column; CAD MSRP stored on variant compare_at.
-- USD derived at 1 CAD ≈ 0.735 USD (inverse of existing 1.359 catalog ratio).

-- ── Ranger Standard Lens (3 color variants) ──────────────────────────────────
update public.products set
  description = 'BleeqUp Ranger AI Sports Camera Glasses with standard lens. AI-powered action camera, integrated mics and speakers, pro-grade sports protection, and a lightweight design for hands-free POV capture. 3K video, 120° FOV, open-ear audio, and up to 5 hours of recording with Power Plus.',
  price_cad = 420.00,
  price_usd = round(420.00 / 1.359, 2),
  options = '[{"name":"Style","values":["Black Frame / Orange Red Lens","White Frame / Blue Gold Lens","Pink-Purple Frame / Pink-Purple Lens"]}]'::jsonb
where slug = 'bleequp-ranger-standard-lens';

update public.product_variants v set
  sku = '10100027',
  title = 'Black Frame / Orange Red Lens',
  option1 = 'Black Frame / Orange Red Lens',
  price_cad = 420.00,
  price_usd = round(420.00 / 1.359, 2),
  compare_at_cad = 529.00,
  compare_at_usd = round(529.00 / 1.359, 2)
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-ranger-standard-lens'
  and v.sku in ('10100015', '10100027');

update public.product_variants v set
  sku = '10100025',
  title = 'White Frame / Blue Gold Lens',
  option1 = 'White Frame / Blue Gold Lens',
  price_cad = 420.00,
  price_usd = round(420.00 / 1.359, 2),
  compare_at_cad = 529.00,
  compare_at_usd = round(529.00 / 1.359, 2)
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-ranger-standard-lens'
  and v.sku = '10100025';

update public.product_variants v set
  sku = '10100026',
  title = 'Pink-Purple Frame / Pink-Purple Lens',
  option1 = 'Pink-Purple Frame / Pink-Purple Lens',
  price_cad = 430.00,
  price_usd = round(430.00 / 1.359, 2),
  compare_at_cad = 539.00,
  compare_at_usd = round(539.00 / 1.359, 2)
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-ranger-standard-lens'
  and v.sku = '10100026';

-- ── Ranger ZEISS (Black / Orange) ───────────────────────────────────────────
update public.products set
  name = 'BleeqUp Ranger AI Sports Camera Glasses - ZEISS Orange Lens',
  description = 'BleeqUp Ranger with ZEISS Orange lens. Better light transmittance, dispersion control (sharp edges with no chromatic aberration), high-purity resin/glass, scratch-resistant, water & oil repellent, longer lifespan. Same AI camera glasses with Snapdragon-powered stabilization, open-ear audio, and prescription frame included.',
  price_cad = 490.00,
  price_usd = round(490.00 / 1.359, 2)
where slug = 'bleequp-ranger-zeiss-lens';

update public.product_variants v set
  sku = '10100029',
  title = 'Black Frame / Orange ZEISS Lens',
  option1 = 'Black Frame / Orange ZEISS Lens',
  price_cad = 490.00,
  price_usd = round(490.00 / 1.359, 2),
  compare_at_cad = 609.00,
  compare_at_usd = round(609.00 / 1.359, 2)
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-ranger-zeiss-lens';

-- ── Bluetooth Controller ──────────────────────────────────────────────────────
update public.products set
  description = 'Take full control of your BleeqUp Ranger Glasses with the Bluetooth Controller. Easily manage video recording, calls, and settings with a finger press.',
  price_cad = 55.00,
  price_usd = round(55.00 / 1.359, 2)
where slug = 'bleequp-bluetooth-controller';

update public.product_variants v set
  sku = '10200102',
  price_cad = 55.00,
  price_usd = round(55.00 / 1.359, 2),
  compare_at_cad = 69.00,
  compare_at_usd = round(69.00 / 1.359, 2)
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-bluetooth-controller';

-- ── Power Plus ────────────────────────────────────────────────────────────────
update public.products set
  description = '1600mAh capsule battery attaches at the back of your helmet and supplies up to 4× recording duration for BleeqUp Ranger glasses. IP56-rated, lightweight, clips securely for extended sessions.',
  price_cad = 55.00,
  price_usd = round(55.00 / 1.359, 2)
where slug = 'bleequp-power-plus';

update public.product_variants v set
  sku = '10200103',
  price_cad = 55.00,
  price_usd = round(55.00 / 1.359, 2),
  compare_at_cad = 69.00,
  compare_at_usd = round(69.00 / 1.359, 2)
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-power-plus';

-- ── Standard Orange Red Lens (swappable) ──────────────────────────────────────
update public.products set
  description = 'Ranger standard swappable lens — orange-red tint. UV400 protection for everyday sport and outdoor use.',
  price_cad = 55.00,
  price_usd = round(55.00 / 1.359, 2)
where slug = 'bleequp-orange-red-lens';

update public.product_variants v set
  sku = '10200007',
  price_cad = 55.00,
  price_usd = round(55.00 / 1.359, 2),
  compare_at_cad = 69.00,
  compare_at_usd = round(69.00 / 1.359, 2)
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-orange-red-lens';

-- ── Photochromic Lens (Red-Black) ─────────────────────────────────────────────
update public.products set
  description = 'Ranger photochromic swappable lens — clear indoors, darkens automatically to red-black tint when exposed to sunlight. UV400 protection.',
  price_cad = 79.00,
  price_usd = round(79.00 / 1.359, 2)
where slug = 'bleequp-photochromic-black-red';

update public.product_variants v set
  sku = '10200002',
  price_cad = 79.00,
  price_usd = round(79.00 / 1.359, 2),
  compare_at_cad = 99.00,
  compare_at_usd = round(99.00 / 1.359, 2)
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-photochromic-black-red';

-- ── ZEISS Blue Lens (swappable) ───────────────────────────────────────────────
update public.products set
  description = 'Premium ZEISS Blue swappable lens for BleeqUp Ranger. Better light transmittance, dispersion control (sharp edges with no chromatic aberration), high-purity resin/glass, scratch-resistant, water & oil repellent, longer lifespan.',
  price_cad = 87.00,
  price_usd = round(87.00 / 1.359, 2)
where slug = 'zeiss-blue-lens';

update public.product_variants v set
  sku = '10200003',
  price_cad = 87.00,
  price_usd = round(87.00 / 1.359, 2),
  compare_at_cad = 109.00,
  compare_at_usd = round(109.00 / 1.359, 2)
from public.products p
where v.product_id = p.id and p.slug = 'zeiss-blue-lens';
