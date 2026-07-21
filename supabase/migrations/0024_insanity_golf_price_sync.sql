-- Sync MGI + Motocaddy CAD prices with Insanity Golf (insanitygolf.ca) as of 2026-07.
-- USD derived at catalog ratio (CAD / 1.359).

update public.products set price_cad = 2499.99, price_usd = round(2499.99 / 1.359, 2)
  where slug = 'mgi-ai-navigator-gps';

update public.products set price_cad = 999.99, price_usd = round(999.99 / 1.359, 2)
  where slug = 'mgi-zip-x1';

update public.products set price_cad = 1999.99, price_usd = round(1999.99 / 1.359, 2)
  where slug = 'mgi-zip-navigator';

update public.products set price_cad = 1499.99, price_usd = round(1499.99 / 1.359, 2)
  where slug = 'mgi-zip-x5';

update public.products set price_cad = 2249.99, price_usd = round(2249.99 / 1.359, 2)
  where slug = 'motocaddy-m7-gps-2026';

update public.products set price_cad = 1995.99, price_usd = round(1995.99 / 1.359, 2)
  where slug = 'motocaddy-m7-2026';

update public.products set price_cad = 1749.00, price_usd = round(1749.00 / 1.359, 2)
  where slug = 'motocaddy-m5-gps-dhc-2026';

update public.products set price_cad = 1249.00, price_usd = round(1249.00 / 1.359, 2)
  where slug = 'motocaddy-m1-dhc-2026';

-- Keep default variant prices in sync.
update public.product_variants v
set price_usd = p.price_usd,
    price_cad = p.price_cad
from public.products p
where v.product_id = p.id
  and p.slug in (
    'mgi-ai-navigator-gps',
    'mgi-zip-x1',
    'mgi-zip-navigator',
    'mgi-zip-x5',
    'motocaddy-m7-gps-2026',
    'motocaddy-m7-2026',
    'motocaddy-m5-gps-dhc-2026',
    'motocaddy-m1-dhc-2026'
  )
  and v.title = 'Default';
