-- Commercial-grade commerce core: locations, product variants/options,
-- multi-location inventory with an immutable ledger, and collections.
-- Idempotent: safe to re-run.

create extension if not exists pgcrypto;

-- =============== ENUMS ===============
do $$ begin
  create type inventory_reason as enum (
    'initial','purchase','sale','return','adjustment','reservation','release','recount','transfer'
  );
exception when duplicate_object then null; end $$;

-- =============== CATALOG: OPTIONS + VARIANTS ===============
-- Shopify model: a product carries up to 3 named options (Size, Color, ...);
-- each sellable combination is a variant with its own SKU, price, and inventory.
alter table public.products add column if not exists options jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists has_variants boolean not null default false;
-- products.stock stays as a denormalized "available" mirror so the existing
-- storefront keeps working; inventory_levels is the source of truth.

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text unique,
  barcode text,
  title text not null default 'Default',
  option1 text,
  option2 text,
  option3 text,
  price_usd numeric(10,2) not null,
  price_cad numeric(10,2) not null,
  compare_at_usd numeric(10,2),
  compare_at_cad numeric(10,2),
  cost_usd numeric(10,2),
  weight_grams integer not null default 0,
  requires_shipping boolean not null default true,
  taxable boolean not null default true,
  position integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists product_variants_product_idx on public.product_variants(product_id);
create unique index if not exists product_variants_options_uniq
  on public.product_variants(product_id, coalesce(option1,''), coalesce(option2,''), coalesce(option3,''));

-- =============== LOCATIONS (WAREHOUSES) ===============
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address jsonb,
  is_active boolean not null default true,
  is_default boolean not null default false,
  priority integer not null default 0,
  created_at timestamptz not null default now()
);
-- Only one default location.
create unique index if not exists locations_single_default
  on public.locations(is_default) where is_default = true;

-- =============== INVENTORY LEVELS + LEDGER ===============
create table if not exists public.inventory_levels (
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  on_hand integer not null default 0,
  reserved integer not null default 0,
  reorder_point integer not null default 0,
  available integer generated always as (on_hand - reserved) stored,
  updated_at timestamptz not null default now(),
  primary key (variant_id, location_id),
  constraint inventory_on_hand_nonneg check (on_hand >= 0),
  constraint inventory_reserved_nonneg check (reserved >= 0)
);
create index if not exists inventory_levels_variant_idx on public.inventory_levels(variant_id);
create index if not exists inventory_levels_low_stock_idx
  on public.inventory_levels(location_id) where available <= reorder_point;

-- Immutable audit trail of every stock movement.
create table if not exists public.inventory_ledger (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete restrict,
  delta integer not null,
  reason inventory_reason not null,
  on_hand_after integer,
  reserved_after integer,
  order_id uuid,
  note text,
  actor uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists inventory_ledger_variant_idx on public.inventory_ledger(variant_id, created_at desc);
create index if not exists inventory_ledger_order_idx on public.inventory_ledger(order_id);

-- order_items learn about variant + fulfillment location.
alter table public.order_items add column if not exists variant_id uuid references public.product_variants(id) on delete set null;
alter table public.order_items add column if not exists location_id uuid references public.locations(id) on delete set null;
alter table public.order_items add column if not exists sku text;
alter table public.order_items add column if not exists fulfilled_qty integer not null default 0;
alter table public.order_items add column if not exists refunded_qty integer not null default 0;

-- =============== COLLECTIONS ===============
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  image text,
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_collections (
  product_id uuid not null references public.products(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  position integer not null default 0,
  primary key (product_id, collection_id)
);
create index if not exists product_collections_collection_idx on public.product_collections(collection_id);

-- =============== BACKFILL ===============
-- 1) Ensure a default location exists.
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

  -- 2) One default variant per product that has none, mirroring product price/sku.
  insert into public.product_variants (product_id, sku, title, price_usd, price_cad, position, is_active)
  select p.id, upper(replace(p.slug, '-', '')), 'Default', p.price_usd, p.price_cad, 1, p.is_active
  from public.products p
  where not exists (select 1 from public.product_variants v where v.product_id = p.id);

  -- 3) Inventory levels for every variant at the default location, seeded from products.stock.
  insert into public.inventory_levels (variant_id, location_id, on_hand, reserved)
  select v.id, loc_id, coalesce(p.stock, 0), 0
  from public.product_variants v
  join public.products p on p.id = v.product_id
  where not exists (
    select 1 from public.inventory_levels il where il.variant_id = v.id and il.location_id = loc_id
  );

  -- 4) Opening ledger entries for the seeded stock.
  insert into public.inventory_ledger (variant_id, location_id, delta, reason, on_hand_after, reserved_after, note)
  select il.variant_id, il.location_id, il.on_hand, 'initial', il.on_hand, il.reserved, 'Opening balance (backfill)'
  from public.inventory_levels il
  where il.on_hand > 0
    and not exists (
      select 1 from public.inventory_ledger l
      where l.variant_id = il.variant_id and l.location_id = il.location_id and l.reason = 'initial'
    );

  -- 5) Link existing order_items to their product's default variant.
  update public.order_items oi
  set variant_id = v.id,
      location_id = loc_id,
      sku = v.sku
  from public.product_variants v
  where oi.variant_id is null and v.product_id = oi.product_id;
end $$;

-- =============== RLS ===============
alter table public.product_variants enable row level security;
alter table public.locations enable row level security;
alter table public.inventory_levels enable row level security;
alter table public.inventory_ledger enable row level security;
alter table public.collections enable row level security;
alter table public.product_collections enable row level security;

-- Variants of active products are publicly readable (storefront).
drop policy if exists "variants_public_read" on public.product_variants;
create policy "variants_public_read" on public.product_variants
  for select using (
    is_active = true
    and exists (select 1 from public.products p where p.id = product_id and p.is_active = true)
  );

-- Collections public read.
drop policy if exists "collections_public_read" on public.collections;
create policy "collections_public_read" on public.collections
  for select using (is_active = true);

drop policy if exists "product_collections_public_read" on public.product_collections;
create policy "product_collections_public_read" on public.product_collections
  for select using (true);

-- Inventory + locations: no public/anon access. Admin reads via service-role client
-- (bypasses RLS); authenticated admins can read for dashboards.
drop policy if exists "locations_admin_read" on public.locations;
create policy "locations_admin_read" on public.locations
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "inventory_levels_admin_read" on public.inventory_levels;
create policy "inventory_levels_admin_read" on public.inventory_levels
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "inventory_ledger_admin_read" on public.inventory_ledger;
create policy "inventory_ledger_admin_read" on public.inventory_ledger
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
