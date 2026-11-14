-- Ranger promo through 2026-12-01 00:00 America/Edmonton.
-- Zeiss $609 -> $539. Standard $529 (pink-purple was $539) -> $479.
-- App code in lib/catalog/ranger-sale.ts restores the previous CAD price after that instant.
-- price_usd is the CAD mirror. No-op if applied after the promo ends.

do $$
begin
  if now() >= timestamptz '2026-12-01 07:00:00+00' then
    return;
  end if;

  update public.products set
    price_cad = 539,
    price_usd = 539
  where slug = 'bleequp-ranger-zeiss-lens';

  update public.product_variants v set
    price_cad = 539,
    price_usd = 539,
    compare_at_cad = 609,
    compare_at_usd = 609
  from public.products p
  where v.product_id = p.id
    and p.slug = 'bleequp-ranger-zeiss-lens';

  update public.products set
    price_cad = 479,
    price_usd = 479
  where slug = 'bleequp-ranger-standard-lens';

  update public.product_variants v set
    price_cad = 479,
    price_usd = 479,
    compare_at_cad = case when v.sku = '10100026' then 539 else 529 end,
    compare_at_usd = case when v.sku = '10100026' then 539 else 529 end
  from public.products p
  where v.product_id = p.id
    and p.slug = 'bleequp-ranger-standard-lens';
end $$;
