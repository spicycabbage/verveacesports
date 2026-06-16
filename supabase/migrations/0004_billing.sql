-- Commercial-grade billing: Shopify-style dual order status (financial +
-- fulfillment), payment transactions, refunds, fulfillments, discounts,
-- tax rates, shipping rates, and Stripe webhook idempotency.
-- Idempotent: safe to re-run.

-- =============== ENUMS ===============
do $$ begin
  create type financial_status as enum (
    'pending','authorized','paid','partially_refunded','refunded','voided'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type fulfillment_status as enum (
    'unfulfilled','partially_fulfilled','fulfilled','restocked'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_kind as enum ('authorization','capture','sale','refund','void');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending','succeeded','failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type discount_type as enum ('percentage','fixed_amount','free_shipping');
exception when duplicate_object then null; end $$;

-- =============== ORDERS: BILLING EXTENSIONS ===============
alter table public.orders add column if not exists financial_status financial_status not null default 'pending';
alter table public.orders add column if not exists fulfillment_status fulfillment_status not null default 'unfulfilled';
alter table public.orders add column if not exists email text;
alter table public.orders add column if not exists discount_code text;
alter table public.orders add column if not exists discount_total numeric(10,2) not null default 0;
alter table public.orders add column if not exists tax_rate numeric(6,4) not null default 0;
alter table public.orders add column if not exists refunded_total numeric(10,2) not null default 0;
alter table public.orders add column if not exists customer_note text;
alter table public.orders add column if not exists admin_note text;
alter table public.orders add column if not exists cancelled_at timestamptz;
alter table public.orders add column if not exists paid_at timestamptz;

create index if not exists orders_financial_idx on public.orders(financial_status);
create index if not exists orders_fulfillment_idx on public.orders(fulfillment_status);

-- Backfill financial_status from legacy status for existing rows.
update public.orders set financial_status = 'paid'
  where status in ('paid','shipped','delivered') and financial_status = 'pending';
update public.orders set financial_status = 'voided'
  where status = 'cancelled' and financial_status = 'pending';
update public.orders set fulfillment_status = 'fulfilled'
  where status in ('shipped','delivered') and fulfillment_status = 'unfulfilled';

-- =============== PAYMENTS (TRANSACTIONS) ===============
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  kind payment_kind not null,
  status payment_status not null default 'pending',
  amount numeric(10,2) not null,
  currency text not null check (currency in ('USD','CAD')),
  gateway text not null default 'stripe',
  stripe_payment_intent_id text,
  stripe_charge_id text,
  stripe_refund_id text,
  error_message text,
  created_at timestamptz not null default now()
);
create index if not exists payments_order_idx on public.payments(order_id, created_at desc);
create unique index if not exists payments_refund_uniq
  on public.payments(stripe_refund_id) where stripe_refund_id is not null;

-- =============== REFUNDS ===============
create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  currency text not null check (currency in ('USD','CAD')),
  reason text,
  restock boolean not null default false,
  stripe_refund_id text unique,
  actor uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists refunds_order_idx on public.refunds(order_id);

create table if not exists public.refund_line_items (
  id uuid primary key default gen_random_uuid(),
  refund_id uuid not null references public.refunds(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete restrict,
  qty integer not null check (qty > 0),
  amount numeric(10,2) not null
);
create index if not exists refund_line_items_refund_idx on public.refund_line_items(refund_id);

-- =============== FULFILLMENTS ===============
create table if not exists public.fulfillments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  status text not null default 'shipped' check (status in ('pending','shipped','delivered','cancelled')),
  tracking_company text,
  tracking_number text,
  tracking_url text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  actor uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists fulfillments_order_idx on public.fulfillments(order_id);

create table if not exists public.fulfillment_line_items (
  id uuid primary key default gen_random_uuid(),
  fulfillment_id uuid not null references public.fulfillments(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete restrict,
  qty integer not null check (qty > 0)
);
create index if not exists fulfillment_line_items_fulfillment_idx on public.fulfillment_line_items(fulfillment_id);

-- =============== DISCOUNTS ===============
create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type discount_type not null,
  value numeric(10,2) not null default 0,
  applies_to text not null default 'order' check (applies_to in ('order','shipping')),
  min_subtotal numeric(10,2) not null default 0,
  usage_limit integer,
  used_count integer not null default 0,
  per_customer_limit integer,
  once_per_customer boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists discounts_active_idx on public.discounts(is_active);

create table if not exists public.discount_redemptions (
  id uuid primary key default gen_random_uuid(),
  discount_id uuid not null references public.discounts(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  amount numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists discount_redemptions_order_uniq on public.discount_redemptions(order_id, discount_id);
create index if not exists discount_redemptions_discount_idx on public.discount_redemptions(discount_id);
create index if not exists discount_redemptions_user_idx on public.discount_redemptions(user_id);

-- =============== TAX RATES ===============
create table if not exists public.tax_rates (
  id uuid primary key default gen_random_uuid(),
  country text not null check (country in ('US','CA')),
  region text,                       -- state / province code; null = whole country
  name text not null,
  rate numeric(6,4) not null,        -- e.g. 0.1300 = 13%
  is_active boolean not null default true,
  priority integer not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists tax_rates_region_uniq
  on public.tax_rates(country, coalesce(region,'')) where is_active = true;

-- =============== SHIPPING ===============
create table if not exists public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  countries text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references public.shipping_zones(id) on delete cascade,
  name text not null,
  price_usd numeric(10,2) not null default 0,
  price_cad numeric(10,2) not null default 0,
  min_subtotal numeric(10,2) not null default 0,
  free_over numeric(10,2),           -- free shipping when subtotal >= this
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists shipping_rates_zone_idx on public.shipping_rates(zone_id);

-- =============== WEBHOOK IDEMPOTENCY ===============
create table if not exists public.webhook_events (
  id text primary key,               -- Stripe event id (evt_...)
  type text not null,
  payload jsonb,
  processed_at timestamptz not null default now()
);

-- =============== SEED DEFAULTS ===============
do $$
declare
  zone_id uuid;
begin
  -- Default tax rates (override per region as needed).
  insert into public.tax_rates (country, region, name, rate)
  select 'US', null, 'US Sales Tax', 0.0000
  where not exists (select 1 from public.tax_rates where country = 'US' and region is null);

  insert into public.tax_rates (country, region, name, rate)
  select 'CA', null, 'GST/HST', 0.0500
  where not exists (select 1 from public.tax_rates where country = 'CA' and region is null);

  -- Default shipping zone + rate (mirrors existing $9.99 / free over $75 logic).
  if not exists (select 1 from public.shipping_zones) then
    insert into public.shipping_zones (name, countries) values ('North America', array['US','CA'])
    returning id into zone_id;
    insert into public.shipping_rates (zone_id, name, price_usd, price_cad, free_over)
    values (zone_id, 'Standard', 9.99, 12.99, 75.00);
  end if;
end $$;

-- =============== RLS ===============
alter table public.payments enable row level security;
alter table public.refunds enable row level security;
alter table public.refund_line_items enable row level security;
alter table public.fulfillments enable row level security;
alter table public.fulfillment_line_items enable row level security;
alter table public.discounts enable row level security;
alter table public.discount_redemptions enable row level security;
alter table public.tax_rates enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.webhook_events enable row level security;

-- Customers can read payments/fulfillments/refunds for their own orders; admins read all.
drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments
  for select using (
    exists (
      select 1 from public.orders o where o.id = payments.order_id
      and (o.user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
    )
  );

drop policy if exists "refunds_select_own" on public.refunds;
create policy "refunds_select_own" on public.refunds
  for select using (
    exists (
      select 1 from public.orders o where o.id = refunds.order_id
      and (o.user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
    )
  );

drop policy if exists "fulfillments_select_own" on public.fulfillments;
create policy "fulfillments_select_own" on public.fulfillments
  for select using (
    exists (
      select 1 from public.orders o where o.id = fulfillments.order_id
      and (o.user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
    )
  );

-- Active discount codes are readable by authenticated users (for client-side validation hints);
-- authoritative validation happens server-side via service role.
drop policy if exists "discounts_authenticated_read" on public.discounts;
create policy "discounts_authenticated_read" on public.discounts
  for select to authenticated using (is_active = true);

-- Tax + shipping are public (needed to render totals).
drop policy if exists "tax_rates_public_read" on public.tax_rates;
create policy "tax_rates_public_read" on public.tax_rates
  for select using (is_active = true);

drop policy if exists "shipping_zones_public_read" on public.shipping_zones;
create policy "shipping_zones_public_read" on public.shipping_zones for select using (true);

drop policy if exists "shipping_rates_public_read" on public.shipping_rates;
create policy "shipping_rates_public_read" on public.shipping_rates
  for select using (is_active = true);
