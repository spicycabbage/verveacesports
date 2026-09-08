import { NextResponse, type NextRequest } from "next/server";
import { getStripe, webhookSecretFor } from "@/lib/stripe/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  syncBalanceTransactionForCharge,
  upsertPayout,
} from "@/lib/stripe/reconcile";
import { markOrderPaidFromPaymentIntent } from "@/lib/stripe/mark-order-paid";
import { voidPendingOrder } from "@/lib/pos/void-pending-order";
import type { StripeAccountCurrency } from "@/lib/constants";
import type Stripe from "stripe";

type Admin = ReturnType<typeof createSupabaseAdminClient>;

function verifyStripeEvent(
  rawBody: string,
  sig: string,
): { event: Stripe.Event; currency: StripeAccountCurrency } {
  const currencies: StripeAccountCurrency[] = ["CAD", "USD"];
  let lastError: string | undefined;
  let verified: Stripe.Event | undefined;

  for (const currency of currencies) {
    const secret = webhookSecretFor(currency);
    if (!secret) continue;
    try {
      verified = getStripe(currency).webhooks.constructEvent(rawBody, sig, secret);
      // Prefer payload currency — USD/CAD secrets may be identical (same Stripe account).
      return { event: verified, currency: currencyFromEvent(verified, currency) };
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Invalid signature";
    }
  }

  throw new Error(lastError ?? "No webhook secret configured");
}

function currencyFromEvent(event: Stripe.Event, fallback: StripeAccountCurrency): StripeAccountCurrency {
  const obj = event.data.object as {
    currency?: string | null;
  };
  const code = (obj.currency ?? "").toUpperCase();
  if (code === "CAD") return "CAD";
  return fallback;
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  let currency: StripeAccountCurrency;
  try {
    ({ event, currency } = verifyStripeEvent(rawBody, sig));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // Idempotency: claim the event id up front. The PK makes this atomic, so two
  // concurrent deliveries can't both pass a check-then-act and run handlers twice.
  const { error: claimErr } = await admin
    .from("webhook_events")
    .insert({ id: event.id, type: event.type, payload: event as unknown as Record<string, unknown> });
  if (claimErr) {
    if (claimErr.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("webhook: could not record event", claimErr.message);
    return NextResponse.json({ error: "Could not record event" }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handleSucceeded(admin, currency, event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await handleFailed(admin, event.data.object as Stripe.PaymentIntent, { voidPos: false });
        break;
      case "payment_intent.canceled":
        await handleFailed(admin, event.data.object as Stripe.PaymentIntent, { voidPos: true });
        break;
      case "terminal.reader.action_succeeded":
        await handleReaderAction(admin, currency, event.data.object as Stripe.Terminal.Reader, true);
        break;
      case "terminal.reader.action_failed":
        await handleReaderAction(admin, currency, event.data.object as Stripe.Terminal.Reader, false);
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
    // Release the claim so Stripe's retry gets processed.
    await admin.from("webhook_events").delete().eq("id", event.id);
    const msg = err instanceof Error ? err.message : "Webhook handler error";
    console.error(`webhook ${event.type} ${event.id} failed:`, msg);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleSucceeded(admin: Admin, currency: StripeAccountCurrency, pi: Stripe.PaymentIntent) {
  await markOrderPaidFromPaymentIntent(admin, currency, pi);
}

async function handleFailed(
  admin: Admin,
  pi: Stripe.PaymentIntent,
  opts: { voidPos: boolean },
) {
  const orderId = pi.metadata.order_id;
  if (!orderId) return;

  const { data: order } = await admin
    .from("orders")
    .select("id, status, user_id, points_redeemed")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.status !== "pending") return;

  const isPos = pi.metadata.sales_channel === "pos";
  if (isPos && !opts.voidPos) {
    await admin
      .from("payments")
      .update({
        status: "failed",
        error_message: pi.last_payment_error?.message ?? "Card declined — retry on the reader",
      })
      .eq("stripe_payment_intent_id", pi.id)
      .eq("kind", "sale");
    return;
  }

  await voidPendingOrder(admin, orderId, pi.last_payment_error?.message ?? "Payment failed");
}

async function handleReaderAction(
  admin: Admin,
  currency: StripeAccountCurrency,
  reader: Stripe.Terminal.Reader,
  succeeded: boolean,
) {
  const action = reader.action;
  if (!action || action.type !== "process_payment_intent") return;
  const raw = action.process_payment_intent?.payment_intent;
  const piId = typeof raw === "string" ? raw : raw?.id;
  if (!piId) return;

  const stripe = getStripe(currency);
  const pi = await stripe.paymentIntents.retrieve(piId);
  if (succeeded) {
    await markOrderPaidFromPaymentIntent(admin, currency, pi);
    return;
  }

  const orderId = pi.metadata.order_id;
  if (!orderId) return;
  await admin
    .from("payments")
    .update({
      status: "failed",
      error_message: action.failure_message ?? "Reader action failed",
    })
    .eq("stripe_payment_intent_id", pi.id)
    .eq("kind", "sale");
}

// Handle refunds initiated outside the app (e.g. Stripe dashboard).
async function handleChargeRefunded(admin: Admin, currency: StripeAccountCurrency, charge: Stripe.Charge) {
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
