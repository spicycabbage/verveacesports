-- Snapshot the purchased variant (e.g. "Black Frame - Silver ZEISS Lens / No extra lens")
-- on each order line so invoices and confirmation emails can show what was picked.
alter table public.order_items
  add column if not exists variant_title text;

-- Backfill existing lines from the catalog. 'Default' means a single-variant product.
update public.order_items oi
set variant_title = pv.title
from public.product_variants pv
where pv.id = oi.variant_id
  and oi.variant_title is null
  and nullif(btrim(pv.title), '') is not null
  and lower(btrim(pv.title)) <> 'default';
