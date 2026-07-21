import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Currency } from "@/lib/constants";
import { getStripe } from "@/lib/stripe/server";
import { fromMinorUnits } from "@/lib/utils/currency";

type Admin = SupabaseClient;

function chargeId(charge: Stripe.Charge | string | null | undefined): string | null {
  if (!charge) return null;
  return typeof charge === "string" ? charge : charge.id;
}

// Fetch a charge's balance transaction (gross/fee/net) and upsert it so bank
// deposits can be reconciled against orders. Safe to call repeatedly.
export async function syncBalanceTransactionForCharge(
  admin: Admin,
  currency: Currency,
  charge: string | null,
  orderId: string | null,
): Promise<void> {
  if (!charge) return;
  const stripe = getStripe(currency);

  let chargeObj: Stripe.Charge;
  try {
    chargeObj = await stripe.charges.retrieve(charge, {
      expand: ["balance_transaction", "refunds.data.balance_transaction"],
    });
  } catch {
    return;
  }

  const rows: {
    id: string;
    stripe_charge_id: string | null;
    stripe_refund_id: string | null;
    stripe_payout_id: string | null;
    order_id: string | null;
    type: string;
    currency: Currency;
    gross: number;
    fee: number;
    net: number;
    available_on: string | null;
  }[] = [];

  const chargeBt = chargeObj.balance_transaction;
  if (chargeBt && typeof chargeBt !== "string") {
    rows.push({
      id: chargeBt.id,
      stripe_charge_id: chargeObj.id,
      stripe_refund_id: null,
      stripe_payout_id: null,
      order_id: orderId,
      type: chargeBt.type,
      currency,
      gross: fromMinorUnits(chargeBt.amount),
      fee: fromMinorUnits(chargeBt.fee),
      net: fromMinorUnits(chargeBt.net),
      available_on: chargeBt.available_on
        ? new Date(chargeBt.available_on * 1000).toISOString()
        : null,
    });
  }

  for (const refund of chargeObj.refunds?.data ?? []) {
    const refundBt = refund.balance_transaction;
    if (refundBt && typeof refundBt !== "string") {
      rows.push({
        id: refundBt.id,
        stripe_charge_id: chargeObj.id,
        stripe_refund_id: refund.id,
        stripe_payout_id: null,
        order_id: orderId,
        type: refundBt.type,
        currency,
        gross: fromMinorUnits(refundBt.amount),
        fee: fromMinorUnits(refundBt.fee),
        net: fromMinorUnits(refundBt.net),
        available_on: refundBt.available_on
          ? new Date(refundBt.available_on * 1000).toISOString()
          : null,
      });
    }
  }

  if (rows.length > 0) {
    await admin.from("stripe_balance_transactions").upsert(rows, { onConflict: "id" });
  }
}

export async function syncBalanceTransactionForPaymentIntent(
  admin: Admin,
  currency: Currency,
  pi: Stripe.PaymentIntent,
  orderId: string | null,
): Promise<void> {
  await syncBalanceTransactionForCharge(admin, currency, chargeId(pi.latest_charge), orderId);
}

export async function upsertPayout(
  admin: Admin,
  currency: Currency,
  payout: Stripe.Payout,
): Promise<void> {
  await admin.from("stripe_payouts").upsert(
    {
      id: payout.id,
      currency,
      amount: fromMinorUnits(payout.amount),
      status: payout.status,
      arrival_date: payout.arrival_date
        ? new Date(payout.arrival_date * 1000).toISOString()
        : null,
      description: payout.description ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  // Link the payout's balance transactions to this payout id for reconciliation.
  try {
    const stripe = getStripe(currency);
    for await (const txn of stripe.balanceTransactions.list({
      payout: payout.id,
      limit: 100,
    })) {
      const source = txn.source;
      const srcId = typeof source === "string" ? source : source?.id ?? null;
      await admin
        .from("stripe_balance_transactions")
        .update({ stripe_payout_id: payout.id })
        .eq("id", txn.id);
      // Best effort: if the BT wasn't captured at charge time, insert a minimal row.
      const { data: existing } = await admin
        .from("stripe_balance_transactions")
        .select("id")
        .eq("id", txn.id)
        .maybeSingle();
      if (!existing) {
        await admin.from("stripe_balance_transactions").insert({
          id: txn.id,
          stripe_charge_id: txn.type === "charge" ? srcId : null,
          stripe_refund_id: txn.type === "refund" ? srcId : null,
          stripe_payout_id: payout.id,
          order_id: null,
          type: txn.type,
          currency,
          gross: fromMinorUnits(txn.amount),
          fee: fromMinorUnits(txn.fee),
          net: fromMinorUnits(txn.net),
          available_on: txn.available_on
            ? new Date(txn.available_on * 1000).toISOString()
            : null,
        });
      }
    }
  } catch {
    // Non-fatal: payout header is recorded even if line linking fails.
  }
}
