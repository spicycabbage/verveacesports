# VerveaceSports

A production-ready e-commerce sporting-goods store: Next.js 15+ App Router, TypeScript, Tailwind v4, shadcn/ui, Supabase (Auth + Postgres + Storage), Stripe Payment Element (Card / Apple Pay / Google Pay), Zustand cart, CAD-only pricing, loyalty points, referral system, dashboards, admin overview.

## Quick start

```bash
npm install
cp .env.example .env.local      # fill in real keys
npm run dev
```

Visit http://localhost:3000.

## 1. Supabase setup

### 1a. Create the project
1. Go to https://supabase.com → New project. Pick a region near your users.
2. Once provisioned, copy from **Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose)

### 1b. Run the schema + seed
Open **SQL Editor** in the Supabase dashboard and run, in order:

1. `supabase/migrations/0001_init.sql` (core tables, enums, triggers, RLS).
2. `supabase/migrations/0002_profile_first_last_names.sql` (profile name fields).
3. `supabase/migrations/0003_commerce_core.sql` (locations, variants, multi-location inventory + ledger, collections).
4. `supabase/migrations/0004_billing.sql` (payments, refunds, fulfillments, discounts, tax/shipping rates, webhook idempotency).
5. `supabase/migrations/0005_inventory_functions.sql` (atomic inventory/order functions + denormalization triggers).
6. `supabase/seed.sql` (16 sporting-goods products — auto-creates default variants + inventory).

> Migrations are idempotent. `0003` backfills variants/inventory from any existing `products.stock`, and the `0005` product trigger auto-creates a default variant + inventory level for every product inserted afterward (seed or admin), so the order above is safe either way.

Or, with the Supabase CLI (`brew install supabase/tap/supabase`):
```bash
supabase link --project-ref <your-ref>
supabase db push     # if you initialize migrations
# or just paste the two SQL files into the dashboard
```

### 1c. Auth providers
**Authentication → Providers**:
- Email — already on. Optional: enable "Confirm email" off in dev.
- Google:
  1. Google Cloud Console → APIs & Services → Credentials → "Create Credentials" → OAuth client ID → Web application.
  2. Authorized redirect URI: `https://<your-ref>.supabase.co/auth/v1/callback`
  3. Paste the client ID + secret into Supabase → Auth → Providers → Google → enable.

### 1d. Storage (optional)
Create bucket `product-images` (public read) if you want to upload your own images instead of using the Unsplash URLs in the seed.

### 1e. Make yourself admin
After signing up once, run in SQL editor:
```sql
update public.profiles set is_admin = true where email = 'you@example.com';
```
Now `/admin` is unlocked.

## 2. Stripe setup

**CAD only.** New charges, checkout, and Terminal use the Canadian Stripe account.

1. Canadian Stripe account (CAD settlement) → **Test mode**.
2. **Developers → API keys**:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_CAD`
   - `STRIPE_SECRET_KEY_CAD`
3. **Developers → Webhooks** → endpoint `https://your-domain.com/api/stripe/webhook` → `STRIPE_WEBHOOK_SECRET_CAD`.

`STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are leftover from an old second account. Do not use them for new charges; the webhook route may still try them when verifying historical events.

### Local webhooks
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook --api-key $STRIPE_SECRET_KEY_CAD
```

4. **Settings → Payment methods** → enable Card, Apple Pay, Google Pay, Link on the CAD account.

### Stripe Terminal (in-person POS)
Physical **smart readers** (Stripe Reader S700/S710, BBPOS WisePOS E, Verifone). **CAD only** — uses `STRIPE_SECRET_KEY_CAD`. Bluetooth M2/WisePad are not supported.

1. Apply migration `0037_pos_terminal.sql` in Supabase.
2. **CAD** Stripe Dashboard → **Payments → Terminal** → enable Terminal. Register the reader on this account.
3. Add webhook events on the CAD account’s endpoint (`/api/stripe/webhook` + `STRIPE_WEBHOOK_SECRET_CAD`):
   - `terminal.reader.action_succeeded`
   - `terminal.reader.action_failed`
   (`payment_intent.succeeded` already marks the order paid.)
4. Open **Admin → POS**:
   - Save store address + Canadian tax province
   - Create a Stripe Terminal location (or paste existing `tml_…`)
   - On the reader: Settings → Generate pairing code (or `0-7-1-3-9` on older devices)
   - Paste the code → Pair
5. Optional env fallback: `STRIPE_TERMINAL_LOCATION_ID_CAD`
6. Test mode: **Add simulated reader** then **Simulate tap** after charging.

### Notes on wallets
- **Apple Pay** only renders over HTTPS on a verified domain. Stripe handles `apple-developer-merchantid-domain-association.txt` automatically once you register your production domain in Stripe → Settings → Payment methods → Apple Pay → Add new domain.
- **Google Pay** works on Chrome/Android over HTTPS or `localhost`.
- Use card `4242 4242 4242 4242` (any future date / any CVC / any ZIP) for test charges.

## 3. Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_CAD=pk_test_...
STRIPE_SECRET_KEY_CAD=sk_test_...
STRIPE_WEBHOOK_SECRET_CAD=whsec_...

# Optional Terminal location ID for CAD POS (otherwise created from Admin → POS)
# STRIPE_TERMINAL_LOCATION_ID_CAD=tml_...

# Optional: force market locally (CA or US)
# GEO_COUNTRY_OVERRIDE=CA

# Brevo (Contacts → Lists → list IDs; SMTP & API → API keys)
# Sender addresses must be verified in Brevo for each storefront:
#   verveace → info@verveacesports.com
#   bleeq-ca → info@bleequp.ca
# Transactional: account welcome, newsletter welcome, order confirmation (HTML in lib/brevo/emails.ts)
BREVO_API_KEY=xkeysib-...
BREVO_LIST_ID=2
# BREVO_LIST_ID_BLEEQ_CA=3

NEXT_PUBLIC_SITE_URL=http://localhost:3000
# NEXT_PUBLIC_BLEEQ_SITE_URL=https://ca.bleequp.com
```

## 4. Feature reference

| Feature | Where |
| --- | --- |
| Auth (email + password, Google) | `lib/actions/auth.ts`, `/login`, `/signup`, `/callback` |
| Geo market (shipping CA vs US; prices always CAD) | `lib/geo/market.ts`, `proxy.ts`, `components/layout/MarketBadge.tsx` |
| Catalog admin (CAD prices) | `app/admin/products` |
| Catalog + filters/search | `app/products/page.tsx`, `components/product/*` |
| PDP + gallery | `app/products/[slug]/page.tsx`, `components/product/Gallery.tsx` |
| Cart (Zustand + persist) | `lib/store/cart.ts`, `components/layout/CartDrawer.tsx`, `app/cart` |
| Checkout (Stripe Payment Element) | `app/checkout/`, `app/api/stripe/payment-intent`, `app/api/stripe/webhook` |
| In-person POS (Stripe Terminal) | `app/admin/pos`, `app/api/admin/terminal/*` |
| Brevo emails (welcome + order confirm) | `lib/brevo/send.ts`, `lib/brevo/emails.ts` |
| Loyalty points (earn + redeem) | DB triggers in `0001_init.sql`, `app/account/loyalty`, redeem slider in checkout |
| Referrals (`?ref=CODE`) | `middleware.ts` (cookie), `handle_new_user()` trigger, `award_loyalty_on_paid_order()` qualifies + double-rewards on first paid order, `app/account/referrals` |
| User dashboard | `app/account/*` |
| Admin overview + order status | `app/admin/*`, `lib/actions/admin.ts` |

## 5. Commands

```bash
npm run dev      # dev server
npm run build    # production build
npm run start    # serve build
npm run lint     # eslint
```

## 6. Architecture notes

- **CAD only**: storefront, checkout, POS, and admin report in CAD. `price_usd` columns are unused mirrors — writes copy CAD into both. Do not add a second selling currency.
- **Loyalty math**: 1 point earned per $1 CAD of subtotal. 100 points = $1 CAD redeem at checkout. Redemption is reserved at PI creation and refunded if the payment fails.
- **Referrals**: `?ref=CODE` → 30-day cookie via Edge middleware. Signup passes the code to Supabase Auth as user metadata; the `handle_new_user` trigger looks up the referrer and inserts a pending `referrals` row. On the referee's first paid order, `award_loyalty_on_paid_order` qualifies the referral and awards both parties 100 pts.
- **Admin gating**: `profiles.is_admin = true` toggled manually. `/admin` performs a server-side check and 404s otherwise.
- **RLS**: enabled on every table. Service-role admin client (`lib/supabase/admin.ts`) bypasses RLS for trusted server-side mutations (order creation, stock decrement, loyalty inserts).
