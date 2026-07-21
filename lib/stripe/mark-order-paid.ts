import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Currency } from "@/lib/constants";
import { getStripe } from "@/lib/stripe/server";
import { syncBalanceTransactionForPaymentIntent } from "@/lib/stripe/reconcile";

type Admin = SupabaseClient;

/**
 * Marks an order paid from a succeeded PaymentIntent.
 * Shared by the Stripe webhook and the checkout success page (webhook race).
 *
 * Fee / balance-transaction sync is optional — skip it on the checkout hot path
 * so the success page isn't blocked on extra Stripe round-trips. Webhook still
 * syncs fees in the background.
 */
export async function markOrderPaidFromPaymentIntent(
  admin: Admin,
  currency: Currency,
  pi: Stripe.PaymentIntent,
  opts: { syncFees?: boolean } = {},
): Promise<void> {
  const orderId = pi.metadata.order_id;
  if (!orderId) return;
  if (pi.status !== "succeeded") return;

  const { data: order } = await admin
    .from("orders")
    .select("id, status, discount_code, discount_total, user_id, total, currency")
    .eq("id", orderId)
    .single();
  if (!order) return;

  const expectedMinor = Math.round(Number(order.total) * 100);
  const receivedMinor = pi.amount_received ?? pi.amount ?? 0;
  if (receivedMinor !== expectedMinor) {
    console.error(
      `payment amount mismatch order=${orderId} expected=${expectedMinor} received=${receivedMinor}`,
    );
    throw new Error("Payment amount does not match order total");
  }

  if (order.status !== "paid") {
    await admin
      .from("orders")
      .update({ status: "paid", financial_status: "paid", paid_at: new Date().toISOString() })
      .eq("id", orderId);

    await admin.rpc("commit_order_inventory", { p_order: orderId });

    if (order.discount_code) {
      const { data: disc } = await admin
        .from("discounts")
        .select("id, used_count")
        .ilike("code", order.discount_code)
        .maybeSingle();
      if (disc) {
        const { error: redErr } = await admin.from("discount_redemptions").insert({
          discount_id: disc.id,
          order_id: orderId,
          user_id: order.user_id,
          amount: order.discount_total ?? 0,
        });
        if (!redErr) {
          await admin
            .from("discounts")
            .update({ used_count: (disc.used_count ?? 0) + 1 })
            .eq("id", disc.id);
        }
      }
    }
  }

  const charge =
    typeof pi.latest_charge === "string" ? pi.latest_charge : (pi.latest_charge?.id ?? null);
  await admin
    .from("payments")
    .update({ status: "succeeded", stripe_charge_id: charge })
    .eq("stripe_payment_intent_id", pi.id)
    .eq("kind", "sale");

  if (opts.syncFees === false) return;
  await syncBalanceTransactionForPaymentIntent(admin, currency, pi, orderId);
}

/** If the order is still pending, check Stripe and mark paid when the PI succeeded. */
export async function reconcileOrderIfPaid(
  admin: Admin,
  orderId: string,
  opts: { syncFees?: boolean } = {},
): Promise<boolean> {
  const { data: order } = await admin
    .from("orders")
    .select("id, status, financial_status, stripe_pi_id, currency")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return false;
  if (order.status === "paid" || order.financial_status === "paid") return true;
  if (!order.stripe_pi_id) return false;

  const currency = (order.currency === "CAD" ? "CAD" : "USD") as Currency;
  const stripe = getStripe(currency);
  const pi = await stripe.paymentIntents.retrieve(order.stripe_pi_id);
  if (pi.status !== "succeeded") return false;

  await markOrderPaidFromPaymentIntent(admin, currency, pi, opts);
  return true;
}
