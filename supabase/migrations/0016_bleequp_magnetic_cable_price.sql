-- BleeqUp Magnetic Charging Wire MSRP: $29 CAD

update public.products set
  price_cad = 29.00,
  price_usd = round(29.00 / 1.359, 2)
where slug = 'bleequp-magnetic-charging-wire';

update public.product_variants v set
  price_cad = 29.00,
  price_usd = round(29.00 / 1.359, 2),
  compare_at_cad = null,
  compare_at_usd = null
from public.products p
where v.product_id = p.id and p.slug = 'bleequp-magnetic-charging-wire';
