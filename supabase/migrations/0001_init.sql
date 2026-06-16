-- VerveaceSports initial schema
-- Idempotent: safe to re-run.

create extension if not exists pgcrypto;

-- =============== ENUMS ===============
do $$ begin
  create type order_status as enum ('pending','paid','shipped','delivered','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type loyalty_tx_type as enum ('earn_purchase','earn_referral','redeem','adjust');
exception when duplicate_object then null; end $$;

do $$ begin
  create type referral_status as enum ('pending','qualified');
exception when duplicate_object then null; end $$;

-- =============== HELPERS ===============
create or replace function gen_referral_code()
returns text
language plpgsql
set search_path = public, pg_temp
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..8 loop
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return result;
end;
$$;

-- =============== TABLES ===============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  first_name text,
  last_name text,
  email text not null,
  country text not null default 'US' check (country in ('US','CA')),
  referral_code text not null unique,
  referred_by uuid references public.profiles(id) on delete set null,
  loyalty_points integer not null default 0,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  category text not null,
  price_usd numeric(10,2) not null,
  price_cad numeric(10,2) not null,
  images text[] not null default '{}',
  stock integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category);
create index if not exists products_active_idx on public.products(is_active);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  status order_status not null default 'pending',
  currency text not null check (currency in ('USD','CAD')),
  subtotal numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  points_redeemed integer not null default 0,
  points_value numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  country text not null check (country in ('US','CA')),
  stripe_pi_id text unique,
  shipping_address jsonb,
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  qty integer not null check (qty > 0),
  unit_price numeric(10,2) not null,
  currency text not null check (currency in ('USD','CAD')),
  product_name text not null,
  product_image text
);
create index if not exists order_items_order_idx on public.order_items(order_id);

create table if not exists public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  type loyalty_tx_type not null,
  points integer not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists loyalty_user_idx on public.loyalty_transactions(user_id, created_at desc);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referee_id uuid not null unique references public.profiles(id) on delete cascade,
  status referral_status not null default 'pending',
  qualified_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists referrals_referrer_idx on public.referrals(referrer_id);

-- =============== TRIGGERS ===============

-- Auto-create profile on auth.users insert + apply referral if present in metadata.
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
begin
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

  insert into public.profiles (id, email, full_name, first_name, last_name, referral_code, referred_by)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    null,
    null,
    new_code,
    referrer_id
  );

  if referrer_id is not null then
    insert into public.referrals (referrer_id, referee_id, status)
    values (referrer_id, new.id, 'pending')
    on conflict (referee_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Award loyalty + referral points on order paid.
create or replace function public.award_loyalty_on_paid_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  earn_points integer;
  ref_row public.referrals%rowtype;
begin
  if new.status = 'paid' and (old.status is distinct from 'paid') then
    -- Earn 1 point per dollar of subtotal.
    earn_points := floor(new.subtotal)::int;
    if earn_points > 0 then
      insert into public.loyalty_transactions (user_id, order_id, type, points, note)
      values (new.user_id, new.id, 'earn_purchase', earn_points,
              'Earned on order ' || new.id::text);
      update public.profiles
        set loyalty_points = loyalty_points + earn_points
        where id = new.user_id;
    end if;

    -- Qualify pending referral on first paid order; reward both parties.
    select * into ref_row
      from public.referrals
      where referee_id = new.user_id and status = 'pending'
      limit 1;
    if found then
      update public.referrals
        set status = 'qualified', qualified_at = now()
        where id = ref_row.id;

      insert into public.loyalty_transactions (user_id, order_id, type, points, note)
      values
        (ref_row.referrer_id, new.id, 'earn_referral', 100, 'Referral bonus: friend purchased'),
        (ref_row.referee_id,  new.id, 'earn_referral', 100, 'Welcome bonus: referred signup');
      update public.profiles set loyalty_points = loyalty_points + 100
        where id in (ref_row.referrer_id, ref_row.referee_id);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_paid on public.orders;
create trigger on_order_paid
  after update on public.orders
  for each row execute function public.award_loyalty_on_paid_order();

-- =============== RLS ===============
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.loyalty_transactions enable row level security;
alter table public.referrals enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- products: public read of active products
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (is_active = true);

-- orders: select/insert own; admin read all
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);

-- order_items: select own via parent order
drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid()
             or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
    )
  );

drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- loyalty_transactions: select own (insert/update via service role only — bypasses RLS)
drop policy if exists "loyalty_select_own" on public.loyalty_transactions;
create policy "loyalty_select_own" on public.loyalty_transactions
  for select using (auth.uid() = user_id);

-- referrals: select own (as referrer or referee)
drop policy if exists "referrals_select_own" on public.referrals;
create policy "referrals_select_own" on public.referrals
  for select using (auth.uid() = referrer_id or auth.uid() = referee_id);

-- =============== HARDENING ===============
-- Trigger / helper functions must not be callable via PostgREST RPC.
revoke execute on function public.handle_new_user()             from public, anon, authenticated;
revoke execute on function public.award_loyalty_on_paid_order() from public, anon, authenticated;
revoke execute on function public.gen_referral_code()           from public, anon, authenticated;
