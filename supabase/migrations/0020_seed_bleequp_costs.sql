-- Seed wholesale cost (COGS) for BleeqUp variants from the WHOLEBRAND retailer
-- price list. The "Retailer Price" is what we pay (wholesale cost); customer MSRP
-- lives in price_cad. cost_usd derived at the catalog ratio (CAD / 1.359).

update public.product_variants set cost_cad = 420.00, cost_usd = round(420.00 / 1.359, 2)
  where sku in ('10100027', '10100025');
update public.product_variants set cost_cad = 430.00, cost_usd = round(430.00 / 1.359, 2)
  where sku = '10100026';
update public.product_variants set cost_cad = 490.00, cost_usd = round(490.00 / 1.359, 2)
  where sku = '10100029';
update public.product_variants set cost_cad = 55.00, cost_usd = round(55.00 / 1.359, 2)
  where sku in ('10200102', '10200103', '10200007');
update public.product_variants set cost_cad = 79.00, cost_usd = round(79.00 / 1.359, 2)
  where sku = '10200002';
update public.product_variants set cost_cad = 87.00, cost_usd = round(87.00 / 1.359, 2)
  where sku = '10200003';
