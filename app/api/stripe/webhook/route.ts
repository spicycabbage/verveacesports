import { NextResponse, type NextRequest } from "next/server";
import { getStripe, webhookSecretFor } from "@/lib/stripe/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  syncBalanceTransactionForCharge,
  upsertPayout,
} from "@/lib/stripe/reconcile";
import { markOrderPaidFromPaymentIntent } from "@/lib/stripe/mark-order-paid";
import type { Currency } from "@/lib/constants";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Admin = ReturnType<typeof createSupabaseAdminClient>;

function verifyStripeEvent(
  rawBody: string,
  sig: string,
): { event: Stripe.Event; currency: Currency } {
  const currencies: Currency[] = ["USD", "CAD"];
  let lastError: string | undefined;

  for (const currency of currencies) {
    const secret = webhookSecretFor(currency);
    if (!secret) continue;
    try {
      const event = getStripe(currency).webhooks.constructEvent(rawBody, sig, secret);
      return { event, currency };
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Invalid signature";
    }
  }

  throw new Error(lastError ?? "No webhook secret configured");
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  let currency: Currency;
  try {
    ({ event, currency } = verifyStripeEvent(rawBody, sig));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // Idempotency: skip events we've already processed.
  const { data: seen } = await admin
    .from("webhook_events")
    .select("id")
    .eq("id", event.id)
    .maybeSingle();
  if (seen) return NextResponse.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handleSucceeded(admin, currency, event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
      case "payment_intent.canceled":
        await handleFailed(admin, event.data.object as Stripe.PaymentIntent);
        break;
      case "charge.refunded":
        await handleChargeRefunded(admin, currency, event.data.object as Stripe.Charge);
        break;
      case "payout.paid":
      case "payout.updated":
      case "payout.failed":
      case "payout.canceled":
        await upsertPayout(admin, currency, event.data.object as Stripe.Payout);
        break;
      default:
        break;
    }
  } catch (err) {
    // Don't record the event so Stripe retries.
    const msg = err instanceof Error ? err.message : "Webhook handler error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  await admin
    .from("webhook_events")
    .insert({ id: event.id, type: event.type, payload: event as unknown as Record<string, unknown> })
    .then(() => undefined);

  return NextResponse.json({ received: true });
}

async function handleSucceeded(admin: Admin, currency: Currency, pi: Stripe.PaymentIntent) {
  await markOrderPaidFromPaymentIntent(admin, currency, pi);
}

async function handleFailed(admin: Admin, pi: Stripe.PaymentIntent) {
  const orderId = pi.metadata.order_id;
  if (!orderId) return;

  const { data: order } = await admin
    .from("orders")
    .select("id, status, user_id, points_redeemed")
    .eq("id", orderId)
    .single();
  if (!order || order.status !== "pending") return;

  await admin
    .from("orders")
    .update({
      status: "cancelled",
      financial_status: "voided",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  // Release the inventory reservation and any reserved discount usage.
  await admin.rpc("release_order_inventory", { p_order: orderId });
  await admin.rpc("release_discount", { p_order: orderId });

  // Refund any reserved loyalty points (atomic).
  if (order.points_redeemed && order.points_redeemed > 0) {
    await admin.from("loyalty_transactions").insert({
      user_id: order.user_id,
      order_id: orderId,
      type: "adjust",
      points: order.points_redeemed,
      note: "Refunded redemption (payment failed)",
    });
    await admin.rpc("adjust_loyalty_points", {
      p_user: order.user_id,
      p_delta: order.points_redeemed,
    });
  }

  await admin
    .from("payments")
    .update({ status: "failed", error_message: pi.last_payment_error?.message ?? "Payment failed" })
    .eq("stripe_payment_intent_id", pi.id)
    .eq("kind", "sale");
}

// Handle refunds initiated outside the app (e.g. Stripe dashboard).
async function handleChargeRefunded(admin: Admin, currency: Currency, charge: Stripe.Charge) {
  const piId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!piId) return;

  const { data: order } = await admin
    .from("orders")
    .select("id, currency, total, refunded_total")
    .eq("stripe_pi_id", piId)
    .single();
  if (!order) return;

  const refundedMinor = charge.amount_refunded ?? 0;
  const refundedTotal = refundedMinor / 100;
  const isFull = refundedTotal >= Number(order.total);

  await admin
    .from("orders")
    .update({
      refunded_total: refundedTotal,
      financial_status: isFull ? "refunded" : "partially_refunded",
    })
    .eq("id", order.id);

  // Record any refund objects not already captured.
  for (const r of charge.refunds?.data ?? []) {
    const { data: existing } = await admin
      .from("refunds")
      .select("id")
      .eq("stripe_refund_id", r.id)
      .maybeSingle();
    if (!existing) {
      await admin.from("refunds").insert({
        order_id: order.id,
        amount: (r.amount ?? 0) / 100,
        currency: order.currency,
        reason: r.reason ?? "stripe_dashboard",
        stripe_refund_id: r.id,
      });
      await admin.from("payments").insert({
        order_id: order.id,
        kind: "refund",
        status: "succeeded",
        amount: (r.amount ?? 0) / 100,
        currency: order.currency,
        gateway: "stripe",
        stripe_payment_intent_id: piId,
        stripe_refund_id: r.id,
      });
    }
  }

  // Capture refund fees / net for reconciliation.
  await syncBalanceTransactionForCharge(admin, currency, charge.id, order.id);
}
