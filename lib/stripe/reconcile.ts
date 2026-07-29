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

function currencyFromStripe(code: string | null | undefined, fallback: Currency): Currency {
  const upper = (code ?? "").toUpperCase();
  return upper === "CAD" || upper === "USD" ? upper : fallback;
}

type BtRow = {
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
};

function rowFromBalanceTransaction(
  bt: Stripe.BalanceTransaction,
  opts: {
    fallbackCurrency: Currency;
    chargeId: string | null;
    refundId: string | null;
    payoutId: string | null;
    orderId: string | null;
  },
): BtRow {
  return {
    id: bt.id,
    stripe_charge_id: opts.chargeId,
    stripe_refund_id: opts.refundId,
    stripe_payout_id: opts.payoutId,
    order_id: opts.orderId,
    type: bt.type,
    currency: currencyFromStripe(bt.currency, opts.fallbackCurrency),
    gross: fromMinorUnits(bt.amount),
    fee: fromMinorUnits(bt.fee),
    net: fromMinorUnits(bt.net),
    available_on: bt.available_on
      ? new Date(bt.available_on * 1000).toISOString()
      : null,
  };
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
  } catch (err) {
    console.error("syncBalanceTransactionForCharge retrieve failed", charge, err);
    return;
  }

  const rows: BtRow[] = [];
  const fallback = currencyFromStripe(chargeObj.currency, currency);

  const chargeBt = chargeObj.balance_transaction;
  if (chargeBt && typeof chargeBt !== "string") {
    rows.push(
      rowFromBalanceTransaction(chargeBt, {
        fallbackCurrency: fallback,
        chargeId: chargeObj.id,
        refundId: null,
        payoutId: null,
        orderId,
      }),
    );
  }

  for (const refund of chargeObj.refunds?.data ?? []) {
    const refundBt = refund.balance_transaction;
    if (refundBt && typeof refundBt !== "string") {
      rows.push(
        rowFromBalanceTransaction(refundBt, {
          fallbackCurrency: fallback,
          chargeId: chargeObj.id,
          refundId: refund.id,
          payoutId: null,
          orderId,
        }),
      );
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
  const latest = pi.latest_charge;
  // Prefer already-expanded charge + BT to avoid an extra retrieve.
  if (latest && typeof latest !== "string") {
    const chargeBt = latest.balance_transaction;
    const rows: BtRow[] = [];
    const fallback = currencyFromStripe(pi.currency ?? latest.currency, currency);

    if (chargeBt && typeof chargeBt !== "string") {
      rows.push(
        rowFromBalanceTransaction(chargeBt, {
          fallbackCurrency: fallback,
          chargeId: latest.id,
          refundId: null,
          payoutId: null,
          orderId,
        }),
      );
    }

    for (const refund of latest.refunds?.data ?? []) {
      const refundBt = refund.balance_transaction;
      if (refundBt && typeof refundBt !== "string") {
        rows.push(
          rowFromBalanceTransaction(refundBt, {
            fallbackCurrency: fallback,
            chargeId: latest.id,
            refundId: refund.id,
            payoutId: null,
            orderId,
          }),
        );
      }
    }

    if (rows.length > 0) {
      await admin.from("stripe_balance_transactions").upsert(rows, { onConflict: "id" });
      return;
    }
  }

  await syncBalanceTransactionForCharge(admin, currency, chargeId(latest), orderId);
}

/** Backfill fees for paid orders that are missing balance-transaction rows. */
export async function backfillOrderFees(admin: Admin): Promise<{ synced: number; failed: number }> {
  const { data: payments } = await admin
    .from("payments")
    .select("order_id, currency, stripe_charge_id, stripe_payment_intent_id")
    .eq("kind", "sale")
    .eq("status", "succeeded")
    .not("stripe_charge_id", "is", null);

  let synced = 0;
  let failed = 0;
  for (const p of payments ?? []) {
    if (!p.stripe_charge_id || !p.order_id) continue;
    const currency = (p.currency === "CAD" ? "CAD" : "USD") as Currency;
    try {
      await syncBalanceTransactionForCharge(admin, currency, p.stripe_charge_id, p.order_id);
      synced += 1;
    } catch (err) {
      console.error("backfillOrderFees failed", p.order_id, err);
      failed += 1;
    }
  }
  return { synced, failed };
}

export async function upsertPayout(
  admin: Admin,
  currency: Currency,
  payout: Stripe.Payout,
): Promise<void> {
  const payoutCurrency = currencyFromStripe(payout.currency, currency);
  await admin.from("stripe_payouts").upsert(
    {
      id: payout.id,
      currency: payoutCurrency,
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
      const srcId = typeof source === "string" ? source : (source?.id ?? null);
      const isChargeLike = txn.type === "charge" || txn.type === "payment";
      const isRefundLike = txn.type === "refund" || txn.type === "payment_refund";
      const row = rowFromBalanceTransaction(txn, {
        fallbackCurrency: payoutCurrency,
        chargeId: isChargeLike ? srcId : null,
        refundId: isRefundLike ? srcId : null,
        payoutId: payout.id,
        orderId: null,
      });

      const { data: existing } = await admin
        .from("stripe_balance_transactions")
        .select("id, order_id, stripe_charge_id")
        .eq("id", txn.id)
        .maybeSingle();

      if (existing) {
        await admin
          .from("stripe_balance_transactions")
          .update({
            stripe_payout_id: payout.id,
            currency: row.currency,
            fee: row.fee,
            gross: row.gross,
            net: row.net,
            // Keep existing order/charge links if already set.
            stripe_charge_id: existing.stripe_charge_id ?? row.stripe_charge_id,
            order_id: existing.order_id,
          })
          .eq("id", txn.id);
      } else {
        await admin.from("stripe_balance_transactions").insert(row);
      }
    }
  } catch (err) {
    console.error("upsertPayout balance transaction link failed", payout.id, err);
  }
}
