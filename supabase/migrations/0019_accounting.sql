-- Accounting foundation: Stripe fee/payout capture for bank reconciliation,
-- COGS snapshots on order lines for gross-margin reporting, and admin-read RLS.
-- Idempotent: safe to re-run.

-- =============== VARIANT / ORDER-ITEM COST ===============
-- cost_usd already exists on product_variants (0003). Add CAD cost.
alter table public.product_variants add column if not exists cost_cad numeric(10,2);

-- Snapshot cost onto each order line at sale time so historical margin is stable
-- even if variant costs change later.
alter table public.order_items add column if not exists cost_usd numeric(10,2);
alter table public.order_items add column if not exists cost_cad numeric(10,2);

-- =============== STRIPE BALANCE TRANSACTIONS ===============
-- One row per Stripe balance transaction (charge or refund). Amounts are stored
-- in major units (dollars) in the transaction's own currency, matching how the
-- rest of the schema stores money.
create table if not exists public.stripe_balance_transactions (
  id text primary key,                         -- Stripe balance txn id (txn_...)
  stripe_charge_id text,
  stripe_refund_id text,
  stripe_payout_id text,
  order_id uuid references public.orders(id) on delete set null,
  type text not null,                          -- 'charge','refund','payout','adjustment',...
  currency text not null check (currency in ('USD','CAD')),
  gross numeric(12,2) not null default 0,       -- amount before fees (signed)
  fee numeric(12,2) not null default 0,         -- Stripe fee (>= 0)
  net numeric(12,2) not null default 0,         -- gross - fee (signed)
  available_on timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists sbt_order_idx on public.stripe_balance_transactions(order_id);
create index if not exists sbt_payout_idx on public.stripe_balance_transactions(stripe_payout_id);
create index if not exists sbt_created_idx on public.stripe_balance_transactions(created_at desc);

-- =============== STRIPE PAYOUTS ===============
create table if not exists public.stripe_payouts (
  id text primary key,                         -- Stripe payout id (po_...)
  currency text not null check (currency in ('USD','CAD')),
  amount numeric(12,2) not null default 0,      -- net deposited to bank
  status text not null,                         -- 'paid','pending','in_transit','failed','canceled'
  arrival_date timestamptz,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists stripe_payouts_arrival_idx on public.stripe_payouts(arrival_date desc);

-- =============== RLS (admin read only; writes via service role) ===============
alter table public.stripe_balance_transactions enable row level security;
alter table public.stripe_payouts enable row level security;

drop policy if exists "sbt_admin_read" on public.stripe_balance_transactions;
create policy "sbt_admin_read" on public.stripe_balance_transactions
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "stripe_payouts_admin_read" on public.stripe_payouts;
create policy "stripe_payouts_admin_read" on public.stripe_payouts
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );
