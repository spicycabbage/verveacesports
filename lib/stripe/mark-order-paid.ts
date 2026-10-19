import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { StripeAccountCurrency } from "@/lib/constants";
import { fulfillPosPickup } from "@/lib/pos/fulfill-pickup";
import { notifyAdminsOfUnfulfilledOrder } from "@/lib/admin/order-alerts";
import { sendExistingOrderEmail } from "@/lib/orders/send-order-email";
import { getStripe } from "@/lib/stripe/server";
import { syncBalanceTransactionForPaymentIntent } from "@/lib/stripe/reconcile";
import { revalidateCatalogCache } from "@/lib/catalog/invalidate";
import { fetchOrderRow } from "@/lib/supabase/order-row";

type Admin = SupabaseClient;

/**
 * Marks an order paid from a succeeded PaymentIntent.
 * Shared by the Stripe webhook and the checkout confirm/success paths.
 *
 * Fee sync defaults on. Pass `syncFees: false` only when latency matters and
 * another path (webhook / confirm-order) will capture fees.
 */
export async function markOrderPaidFromPaymentIntent(
  admin: Admin,
  currency: StripeAccountCurrency,
  pi: Stripe.PaymentIntent,
  opts: { syncFees?: boolean } = {},
): Promise<void> {
  const orderId = pi.metadata.order_id;
  if (!orderId) return;
  if (pi.status !== "succeeded") return;

  const { data: order, error: orderErr } = await fetchOrderRow(admin, orderId);
  if (orderErr) throw new Error(orderErr.message);
  if (!order) return;

  const expectedMinor = Math.round(Number(order.total) * 100);
  const receivedMinor = pi.amount_received ?? pi.amount ?? 0;
  if (receivedMinor !== expectedMinor) {
    console.error(
      `payment amount mismatch order=${orderId} expected=${expectedMinor} received=${receivedMinor}`,
    );
    throw new Error("Payment amount does not match order total");
  }

  const orderCurrency: StripeAccountCurrency = order.currency === "CAD" ? "CAD" : "USD";
  const feeCurrency: StripeAccountCurrency =
    (pi.currency?.toUpperCase() === "CAD" || pi.currency?.toUpperCase() === "USD"
      ? (pi.currency.toUpperCase() as StripeAccountCurrency)
      : null) ?? orderCurrency ?? currency;

  if (order.financial_status !== "paid") {
    const nextStatus = order.status === "pending" ? "paid" : order.status;
    const { error: paidErr } = await admin
      .from("orders")
      .update({
        status: nextStatus,
        financial_status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    if (paidErr) throw new Error(paidErr.message);

    const { error: commitErr } = await admin.rpc("commit_order_inventory", { p_order: orderId });
    if (commitErr) throw new Error(commitErr.message);
    // products.stock mirror moved — refresh cached listings/PDPs.
    revalidateCatalogCache();

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

    try {
      const result = await sendExistingOrderEmail(admin, orderId);
      if (!result.ok) {
        console.error("order confirmation email not sent:", result.error);
      }
    } catch (err) {
      console.error("order confirmation email failed:", err);
    }

    if (pi.metadata.sales_channel === "pos") {
      await fulfillPosPickup(admin, orderId);
    }

    await notifyAdminsOfUnfulfilledOrder(admin, orderId);
  }

  const charge =
    typeof pi.latest_charge === "string" ? pi.latest_charge : (pi.latest_charge?.id ?? null);
  await admin
    .from("payments")
    .update({ status: "succeeded", stripe_charge_id: charge })
    .eq("stripe_payment_intent_id", pi.id)
    .eq("kind", "sale");

  if (opts.syncFees === false) return;
  await syncBalanceTransactionForPaymentIntent(admin, feeCurrency, pi, orderId);
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
  if (!order.stripe_pi_id) return false;

  const currency: StripeAccountCurrency = order.currency === "CAD" ? "CAD" : "USD";
  const alreadyPaid = order.status === "paid" || order.financial_status === "paid";

  // Still sync fees for already-paid orders when requested (confirm-order / repair).
  if (alreadyPaid && opts.syncFees === false) return true;

  const stripe = getStripe(currency);
  const pi = await stripe.paymentIntents.retrieve(order.stripe_pi_id, {
    expand: ["latest_charge.balance_transaction", "latest_charge.refunds.data.balance_transaction"],
  });
  if (pi.status !== "succeeded") return false;

  await markOrderPaidFromPaymentIntent(admin, currency, pi, {
    syncFees: opts.syncFees !== false,
  });
  return true;
}
