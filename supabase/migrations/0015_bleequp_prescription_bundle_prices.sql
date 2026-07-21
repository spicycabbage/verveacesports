-- BleeqUp prescription service and ultimate bundle MSRP (CAD).

update public.products set
  price_cad = 101.00,
  price_usd = round(101.00 / 1.359, 2)
where slug = 'bleequp-prescription-service';

update public.product_variants v set
  price_cad = 101.00,
  price_usd = round(101.00 / 1.359, 2),
  compare_at_cad = null,
  compare_at_usd = null
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-prescription-service';

update public.products set
  price_cad = 699.00,
  price_usd = round(699.00 / 1.359, 2)
where slug = 'bleequp-ranger-ultimate-bundle';

update public.product_variants v set
  price_cad = 699.00,
  price_usd = round(699.00 / 1.359, 2),
  compare_at_cad = null,
  compare_at_usd = null
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-ranger-ultimate-bundle';
