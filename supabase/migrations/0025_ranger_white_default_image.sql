-- Default BleeqUp Ranger Standard Lens hero/thumbnail to White Frame / Blue Gold Lens.

update public.products
set
  images = array[
    'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Ranger_White_Standard_Lens.jpg?v=1781082613',
    'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Ranger_Black_Standard_Lens.jpg?v=1781082522',
    'https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Ranger_Pink_Standard_Lens.jpg?v=1781082573'
  ],
  options = '[{"name":"Style","values":["White Frame / Blue Gold Lens","Black Frame / Orange Red Lens","Pink-Purple Frame / Pink-Purple Lens"]}]'::jsonb
where slug = 'bleequp-ranger-standard-lens';

update public.product_variants v
set position = case v.option1
  when 'White Frame / Blue Gold Lens' then 1
  when 'Black Frame / Orange Red Lens' then 2
  when 'Pink-Purple Frame / Pink-Purple Lens' then 3
  else v.position
end
from public.products p
where v.product_id = p.id
  and p.slug = 'bleequp-ranger-standard-lens';
