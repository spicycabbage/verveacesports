-- Per-variant hero images (Shopify variant_ids → image mapping) + Ranger Standard Lens backfill.

alter table public.product_variants
  add column if not exists image_url text;

-- Product-level gallery: all three color heroes (was missing White).
update public.products
set images = array[
  'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Ranger_Black_Standard_Lens.jpg?v=1781082522',
  'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Ranger_Pink_Standard_Lens.jpg?v=1781082573',
  'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Ranger_White_Standard_Lens.jpg?v=1781082613'
]
where slug = 'bleequp-ranger-standard-lens';

update public.product_variants v
set image_url = case v.option1
  when 'Black - Standard Orange Red Lens' then
    'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Ranger_Black_Standard_Lens.jpg?v=1781082522'
  when 'Pink Purple - Standard Pink Purple Lens' then
    'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Ranger_Pink_Standard_Lens.jpg?v=1781082573'
  when 'White - Standard Gold Lens' then
    'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Ranger_White_Standard_Lens.jpg?v=1781082613'
  else v.image_url
end
from public.products p
where v.product_id = p.id
  and p.slug = 'bleequp-ranger-standard-lens';
