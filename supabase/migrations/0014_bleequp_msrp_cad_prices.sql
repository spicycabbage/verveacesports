-- Fix BleeqUp pricing: MSRP (CAD) is customer-facing retail; the lower
-- "Retailer Price" from the WHOLEBRAND sheet is wholesale cost to us.

-- ── Ranger Standard Lens ──────────────────────────────────────────────────────
update public.products set
  price_cad = 529.00,
  price_usd = round(529.00 / 1.359, 2)
where slug = 'bleequp-ranger-standard-lens';

update public.product_variants v set
  price_cad = 529.00,
  price_usd = round(529.00 / 1.359, 2),
  compare_at_cad = null,
  compare_at_usd = null
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-ranger-standard-lens'
  and v.sku in ('10100027', '10100025');

update public.product_variants v set
  price_cad = 539.00,
  price_usd = round(539.00 / 1.359, 2),
  compare_at_cad = null,
  compare_at_usd = null
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-ranger-standard-lens'
  and v.sku = '10100026';

-- ── Ranger ZEISS Orange ───────────────────────────────────────────────────────
update public.products set
  price_cad = 609.00,
  price_usd = round(609.00 / 1.359, 2)
where slug = 'bleequp-ranger-zeiss-lens';

update public.product_variants v set
  price_cad = 609.00,
  price_usd = round(609.00 / 1.359, 2),
  compare_at_cad = null,
  compare_at_usd = null
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-ranger-zeiss-lens';

-- ── Bluetooth Controller ──────────────────────────────────────────────────────
update public.products set
  price_cad = 69.00,
  price_usd = round(69.00 / 1.359, 2)
where slug = 'bleequp-bluetooth-controller';

update public.product_variants v set
  price_cad = 69.00,
  price_usd = round(69.00 / 1.359, 2),
  compare_at_cad = null,
  compare_at_usd = null
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-bluetooth-controller';

-- ── Power Plus ────────────────────────────────────────────────────────────────
update public.products set
  price_cad = 69.00,
  price_usd = round(69.00 / 1.359, 2)
where slug = 'bleequp-power-plus';

update public.product_variants v set
  price_cad = 69.00,
  price_usd = round(69.00 / 1.359, 2),
  compare_at_cad = null,
  compare_at_usd = null
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-power-plus';

-- ── Standard Orange Red Lens ──────────────────────────────────────────────────
update public.products set
  price_cad = 69.00,
  price_usd = round(69.00 / 1.359, 2)
where slug = 'bleequp-orange-red-lens';

update public.product_variants v set
  price_cad = 69.00,
  price_usd = round(69.00 / 1.359, 2),
  compare_at_cad = null,
  compare_at_usd = null
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-orange-red-lens';

-- ── Photochromic Red-Black Lens ───────────────────────────────────────────────
update public.products set
  price_cad = 99.00,
  price_usd = round(99.00 / 1.359, 2)
where slug = 'bleequp-photochromic-black-red';

update public.product_variants v set
  price_cad = 99.00,
  price_usd = round(99.00 / 1.359, 2),
  compare_at_cad = null,
  compare_at_usd = null
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-photochromic-black-red';

-- ── ZEISS Blue Lens ───────────────────────────────────────────────────────────
update public.products set
  price_cad = 109.00,
  price_usd = round(109.00 / 1.359, 2)
where slug = 'zeiss-blue-lens';

update public.product_variants v set
  price_cad = 109.00,
  price_usd = round(109.00 / 1.359, 2),
  compare_at_cad = null,
  compare_at_usd = null
from public.products p
where v.product_id = p.id and p.slug = 'zeiss-blue-lens';
