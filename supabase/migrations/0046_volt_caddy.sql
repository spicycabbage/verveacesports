-- Volt Caddy storefront (voltcaddy.ca) on the shared catalog.
-- Brand column scopes POS/reporting. Storefront queries also key off slug prefix volt-caddy-.

alter table public.products
  add column if not exists brand text;

create index if not exists products_brand_idx on public.products (brand);

comment on column public.products.brand is
  'Catalog brand: bleequp | mgi | motocaddy | volt-caddy. Null still sells on Verveace.';

update public.products
set brand = 'bleequp'
where brand is null
  and (
    category in ('ai-glasses', 'wearables')
    or slug ilike 'bleequp%'
    or name ilike '%bleeq%'
  );

update public.products
set brand = 'motocaddy'
where brand is null
  and (slug ilike '%motocaddy%' or name ilike '%motocaddy%');

update public.products
set brand = 'mgi'
where brand is null
  and (slug ilike 'mgi-%' or name ilike '%mgi%');

-- Widen storefront check constraints that list bleeq-ca but not volt-ca.
do $$
declare
  r record;
  def text;
begin
  for r in
    select c.conrelid, c.conname, pg_get_constraintdef(c.oid) as def
    from pg_constraint c
    join pg_namespace n on n.oid = c.connamespace
    where c.contype = 'c'
      and n.nspname = 'public'
      and pg_get_constraintdef(c.oid) like '%''bleeq-ca''%'
      and pg_get_constraintdef(c.oid) not like '%''volt-ca''%'
  loop
    if r.def like '%ARRAY[%' then
      def := replace(r.def, '''bleeq-ca''::text', '''bleeq-ca''::text, ''volt-ca''::text');
    else
      def := replace(r.def, '''bleeq-ca''', '''bleeq-ca'', ''volt-ca''');
    end if;
    execute format('alter table %s drop constraint %I', r.conrelid::regclass, r.conname);
    execute format('alter table %s add constraint %I %s', r.conrelid::regclass, r.conname, def);
  end loop;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_code text;
  ref_code text;
  referrer_id uuid;
  attempt int := 0;
  fn text;
  ln text;
  combo text;
  legacy text;
  full_display text;
  grant_admin boolean;
  origin_site text;
begin
  grant_admin := lower(coalesce(new.email, '')) = 'tubandzits@gmail.com';

  origin_site := lower(nullif(trim(coalesce(new.raw_user_meta_data->>'site_id', '')), ''));
  if origin_site is distinct from 'verveace'
     and origin_site is distinct from 'bleeq-ca'
     and origin_site is distinct from 'volt-ca' then
    origin_site := 'verveace';
  end if;

  loop
    new_code := gen_referral_code();
    exit when not exists (select 1 from public.profiles where referral_code = new_code);
    attempt := attempt + 1;
    if attempt > 10 then raise exception 'could not generate unique referral code'; end if;
  end loop;

  ref_code := nullif(upper(coalesce(new.raw_user_meta_data->>'ref','')), '');
  if ref_code is not null then
    select id into referrer_id from public.profiles where referral_code = ref_code;
  end if;

  fn := coalesce(
    nullif(trim(coalesce(new.raw_user_meta_data->>'first_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'given_name', '')), '')
  );

  ln := coalesce(
    nullif(trim(coalesce(new.raw_user_meta_data->>'last_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'family_name', '')), '')
  );

  combo := nullif(trim(concat_ws(' ', fn, ln)), '');
  legacy := nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), '');
  full_display := coalesce(combo, legacy);

  insert into public.profiles (
    id, email, full_name, first_name, last_name, referral_code, referred_by, is_admin, site_id
  )
  values (
    new.id,
    new.email,
    full_display,
    fn,
    ln,
    new_code,
    referrer_id,
    grant_admin,
    origin_site
  );

  if referrer_id is not null then
    insert into public.referrals (referrer_id, referee_id, status)
    values (referrer_id, new.id, 'pending')
    on conflict (referee_id) do nothing;
  end if;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

insert into public.products (
  slug, name, description, category, brand,
  price_usd, price_cad, images, stock, is_active, options, has_variants
)
values
(
  'volt-caddy-pro-s',
  'Volt Caddy Pro-S Remote Electric Golf Pushcart',
  $vc$Volt Caddy Pro-S is a compact, foldable remote electric golf push cart.

- Lithium battery — up to 36 holes on one charge
- IP54 water and dust protection
- Detachable battery and power unit
- Two external USB Type-C charging ports
- Dual quiet motors — 360W (2 × 180W)
- Speed modes up to 10 km/h
- Climbing capacity up to 30 degrees
- Downhill speed control, automatic parking brake, and programmed distance cruise
- One-step easy-fold frame and dual stability wheels
- Remote control up to 40 meters

Includes a beverage holder, scorecard holder, umbrella holder, cooler and storage bag, and wheel holder stand. Choose Black or Silver.$vc$,
  'electric-carts',
  'volt-caddy',
  1200.00,
  1200.00,
  array[
    '/catalog/volt/pro-s-01-sq.webp',
    '/catalog/volt/pro-s-02-sq.webp',
    '/catalog/volt/pro-s-03-sq.webp',
    '/catalog/volt/pro-s-04-sq.webp',
    '/catalog/volt/pro-s-05-sq.webp',
    '/catalog/volt/pro-s-06-sq.webp',
    '/catalog/volt/pro-s-07-sq.webp',
    '/catalog/volt/pro-s-08-sq.webp',
    '/catalog/volt/pro-s-09-sq.webp'
  ],
  16,
  true,
  '[{"name":"Color","values":["Black","Silver"]}]'::jsonb,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  brand = excluded.brand,
  price_usd = excluded.price_usd,
  price_cad = excluded.price_cad,
  images = excluded.images,
  options = excluded.options,
  has_variants = excluded.has_variants,
  is_active = true;

-- Accessories copied from voltcaddy.com are not carried. Hide any rows already seeded.
update public.products
set is_active = false,
    images = '{}'
where slug in (
  'volt-caddy-battery',
  'volt-caddy-chair',
  'volt-caddy-electric-wagon-part',
  'volt-caddy-lithium-battery-charger',
  'volt-caddy-remote-control',
  'volt-caddy-remote-control-lithium',
  'volt-caddy-support-rack',
  'volt-caddy-support-wheel'
);

update public.product_variants v
set is_active = false
from public.products p
where v.product_id = p.id
  and p.slug in (
    'volt-caddy-battery',
    'volt-caddy-chair',
    'volt-caddy-electric-wagon-part',
    'volt-caddy-lithium-battery-charger',
    'volt-caddy-remote-control',
    'volt-caddy-remote-control-lithium',
    'volt-caddy-support-rack',
    'volt-caddy-support-wheel'
  );

insert into public.product_variants (
  product_id, sku, title, option1, price_usd, price_cad, weight_grams,
  requires_shipping, taxable, position, is_active
)
select p.id, v.sku, v.title, v.option1, v.price_cad, v.price_cad, v.weight_grams,
       true, v.taxable, v.position, true
from public.products p
join (
  values
    ('volt-caddy-pro-s', 'VC-PROS-BLK', 'Black', 'Black', 1200.00, 21000, true, 1),
    ('volt-caddy-pro-s', 'VC-PROS-SLV', 'Silver', 'Silver', 1200.00, 21000, true, 2)
) as v(slug, sku, title, option1, price_cad, weight_grams, taxable, position)
  on v.slug = p.slug
on conflict (sku) do update set
  title = excluded.title,
  option1 = excluded.option1,
  price_usd = excluded.price_usd,
  price_cad = excluded.price_cad,
  weight_grams = excluded.weight_grams,
  taxable = excluded.taxable,
  position = excluded.position,
  is_active = true;

do $$
declare
  loc_id uuid;
begin
  select id into loc_id from public.locations where is_default = true limit 1;
  if loc_id is null then
    insert into public.locations (name, is_active, is_default, priority)
    values ('Primary Warehouse', true, true, 100)
    returning id into loc_id;
  end if;

  insert into public.inventory_levels (variant_id, location_id, on_hand, reserved)
  select v.id, loc_id,
    case when p.slug = 'volt-caddy-pro-s' then 8 else 12 end,
    0
  from public.product_variants v
  join public.products p on p.id = v.product_id
  where p.slug like 'volt-caddy-%'
  on conflict (variant_id, location_id) do nothing;
end $$;

update public.products p
set stock = coalesce((
  select sum(l.available)
  from public.product_variants v
  join public.inventory_levels l on l.variant_id = v.id
  where v.product_id = p.id
), p.stock)
where p.slug like 'volt-caddy-%';
