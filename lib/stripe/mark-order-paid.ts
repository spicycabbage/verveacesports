import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail } from "@/lib/brevo/emails";
import type { Currency } from "@/lib/constants";
import type { SiteId } from "@/lib/site/config";
import { getStripe } from "@/lib/stripe/server";
import { syncBalanceTransactionForPaymentIntent } from "@/lib/stripe/reconcile";
import type { OrderItem, ShippingAddress } from "@/lib/supabase/types";

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
  currency: Currency,
  pi: Stripe.PaymentIntent,
  opts: { syncFees?: boolean } = {},
): Promise<void> {
  const orderId = pi.metadata.order_id;
  if (!orderId) return;
  if (pi.status !== "succeeded") return;

  const { data: order } = await admin
    .from("orders")
    .select(
      "id, status, discount_code, discount_total, user_id, total, currency, email, site_id, subtotal, tax, shipping, points_value, shipping_address",
    )
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

  const orderCurrency = (order.currency === "CAD" ? "CAD" : "USD") as Currency;
  const feeCurrency =
    (pi.currency?.toUpperCase() === "CAD" || pi.currency?.toUpperCase() === "USD"
      ? (pi.currency.toUpperCase() as Currency)
      : null) ?? orderCurrency ?? currency;

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

    void sendOrderPaidEmail(admin, order).catch((err) => {
      console.error("order confirmation email failed:", err);
    });
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

async function sendOrderPaidEmail(
  admin: Admin,
  order: {
    id: string;
    email: string | null;
    site_id: string;
    currency: string;
    subtotal: number;
    tax: number;
    shipping: number;
    discount_code: string | null;
    discount_total: number;
    points_value: number;
    total: number;
    shipping_address: ShippingAddress | null;
  },
): Promise<void> {
  const siteId: SiteId = order.site_id === "bleeq-ca" ? "bleeq-ca" : "verveace";
  const { data: items } = await admin
    .from("order_items")
    .select("product_name, qty, unit_price, currency")
    .eq("order_id", order.id);

  const result = await sendOrderConfirmationEmail({
    siteId,
    order: {
      id: order.id,
      email: order.email,
      currency: order.currency === "CAD" ? "CAD" : "USD",
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shipping: Number(order.shipping),
      discount_code: order.discount_code,
      discount_total: Number(order.discount_total ?? 0),
      points_value: Number(order.points_value ?? 0),
      total: Number(order.total),
      shipping_address: order.shipping_address,
    },
    items: (items ?? []) as Pick<OrderItem, "product_name" | "qty" | "unit_price" | "currency">[],
  });

  if (!result.ok) {
    console.error("order confirmation email not sent:", result.error);
  }
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

  const currency = (order.currency === "CAD" ? "CAD" : "USD") as Currency;
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
