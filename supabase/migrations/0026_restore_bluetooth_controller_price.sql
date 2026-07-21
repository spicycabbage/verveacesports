-- Restore BleeqUp Bluetooth Controller from $1 CAD test price to MSRP (0014).

update public.products set
  price_cad = 69.00,
  price_usd = round(69.00 / 1.359, 2)
where slug = 'bleequp-bluetooth-controller';

update public.product_variants v set
  price_cad = 69.00,
  price_usd = round(69.00 / 1.359, 2)
from public.products p
where v.product_id = p.id
  and p.slug = 'bleequp-bluetooth-controller';
