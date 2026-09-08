-- Orders and order_items are only ever created server-side via the service
-- role (app/api/stripe/payment-intent, lib/pos/charge). The 0001 policies let
-- any signed-in user INSERT arbitrary pending orders / line items straight
-- through PostgREST — junk data + inventory confusion with zero app-side
-- validation. Service role bypasses RLS, so dropping these changes nothing for
-- the app.
drop policy if exists "orders_insert_own" on public.orders;
drop policy if exists "order_items_insert_own" on public.order_items;
