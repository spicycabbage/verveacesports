"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { requireAdmin } from "@/lib/auth/admin";
import { toMinorUnits } from "@/lib/utils/currency";
import { LOYALTY } from "@/lib/constants";

type ActionResult = { ok: true; refundId: string; amount: number } | { error: string };

const refundSchema = z.object({
  orderId: z.string().uuid(),
  // Per-line refunds. Omit to refund an amount / the full remaining balance.
  lines: z
    .array(
      z.object({
        orderItemId: z.string().uuid(),
        qty: z.coerce.number().int().positive(),
      }),
    )
    .optional(),
  // Explicit amount override (used when no lines, or to adjust). Omit for full.
  amount: z.coerce.number().positive().optional(),
  includeTax: z.boolean().default(true),
  includeShipping: z.boolean().default(false),
  clawbackLoyalty: z.boolean().default(true),
  reason: z
    .enum(["requested_by_customer", "duplicate", "fraudulent", "other"])
    .default("requested_by_customer"),
  restock: z.boolean().default(false),
});

const round2 = (n: number) => Math.round(n * 100) / 100;

export async function refundOrder(input: z.infer<typeof refundSchema>): Promise<ActionResult> {
  const parsed = refundSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };
  const d = parsed.data;

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select(
      "id, user_id, stripe_pi_id, currency, subtotal, tax, shipping, total, refunded_total, financial_status",
    )
    .eq("id", d.orderId)
    .single();
  if (!order) return { error: "Order not found" };
  if (!order.stripe_pi_id) return { error: "Order has no payment to refund" };

  const alreadyRefunded = Number(order.refunded_total) || 0;
  const remaining = round2(Number(order.total) - alreadyRefunded);
  if (remaining <= 0) return { error: "Order is already fully refunded" };

  const currency = order.currency as "USD" | "CAD";
  const orderSubtotal = Number(order.subtotal) || 0;

  // Resolve which lines (if any) are being refunded and the base line amount.
  let lineSubtotal = 0;
  const resolvedLines: { orderItemId: string; qty: number; amount: number }[] = [];

  if (d.lines && d.lines.length > 0) {
    const { data: itemsData } = await admin
      .from("order_items")
      .select("id, qty, refunded_qty, unit_price")
      .eq("order_id", order.id);
    const items = itemsData ?? [];
    const byId = new Map(items.map((it) => [it.id, it]));

    for (const line of d.lines) {
      const item = byId.get(line.orderItemId);
      if (!item) return { error: "Line item not found on this order" };
      const refundableQty = item.qty - (item.refunded_qty ?? 0);
      if (line.qty > refundableQty) {
        return { error: `Cannot refund more than ${refundableQty} of a line` };
      }
      const lineAmount = round2(Number(item.unit_price) * line.qty);
      lineSubtotal = round2(lineSubtotal + lineAmount);
      resolvedLines.push({ orderItemId: line.orderItemId, qty: line.qty, amount: lineAmount });
    }
  }

  // Compute refund amount.
  let amount: number;
  if (resolvedLines.length > 0) {
    let subtotalShare = lineSubtotal;
    if (d.includeTax && orderSubtotal > 0) {
      subtotalShare = round2(subtotalShare + Number(order.tax) * (lineSubtotal / orderSubtotal));
    }
    if (d.includeShipping) {
      subtotalShare = round2(subtotalShare + Number(order.shipping));
    }
    amount = Math.min(subtotalShare, remaining);
  } else {
    amount = d.amount ? Math.min(d.amount, remaining) : remaining;
  }
  amount = round2(amount);
  if (amount <= 0) return { error: "Refund amount must be greater than zero" };

  // Issue the Stripe refund first; only persist if it succeeds.
  const stripe = getStripe(currency);
  let stripeRefundId: string;
  try {
    const refund = await stripe.refunds.create({
      payment_intent: order.stripe_pi_id,
      amount: toMinorUnits(amount),
      reason: d.reason === "other" ? undefined : d.reason,
      metadata: { order_id: order.id },
    });
    stripeRefundId = refund.id;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Stripe refund failed" };
  }

  const { data: refundRow, error: refErr } = await admin
    .from("refunds")
    .insert({
      order_id: order.id,
      amount,
      currency,
      reason: d.reason,
      restock: d.restock,
      stripe_refund_id: stripeRefundId,
      actor: guard.userId,
    })
    .select("id")
    .single();
  if (refErr || !refundRow) return { error: refErr?.message ?? "Failed to record refund" };

  // Persist line items + bump refunded_qty.
  if (resolvedLines.length > 0) {
    await admin.from("refund_line_items").insert(
      resolvedLines.map((l) => ({
        refund_id: refundRow.id,
        order_item_id: l.orderItemId,
        qty: l.qty,
        amount: l.amount,
      })),
    );
    for (const l of resolvedLines) {
      await admin.rpc("increment_refunded_qty", {
        p_order_item: l.orderItemId,
        p_qty: l.qty,
      });
    }
  }

  await admin.from("payments").insert({
    order_id: order.id,
    kind: "refund",
    status: "succeeded",
    amount,
    currency,
    gateway: "stripe",
    stripe_payment_intent_id: order.stripe_pi_id,
    stripe_refund_id: stripeRefundId,
  });

  const newRefundedTotal = round2(alreadyRefunded + amount);
  const isFull = newRefundedTotal >= Number(order.total);
  await admin
    .from("orders")
    .update({
      refunded_total: newRefundedTotal,
      financial_status: isFull ? "refunded" : "partially_refunded",
      ...(isFull ? { status: "cancelled" } : {}),
    })
    .eq("id", order.id);

  // Loyalty clawback: reverse earned points proportional to the refunded
  // merchandise value (points were earned as floor(subtotal) at 1 pt/$).
  if (d.clawbackLoyalty && order.user_id) {
    const basis = resolvedLines.length > 0 ? lineSubtotal : amount;
    const clawback = Math.floor(basis * LOYALTY.POINTS_PER_DOLLAR);
    if (clawback > 0) {
      const { data: appliedDelta } = await admin.rpc("adjust_loyalty_points", {
        p_user: order.user_id,
        p_delta: -clawback,
      });
      const applied = Math.abs(Number(appliedDelta) || 0);
      if (applied > 0) {
        await admin.from("loyalty_transactions").insert({
          user_id: order.user_id,
          order_id: order.id,
          type: "adjust",
          points: -applied,
          note: `Refund clawback (refund ${refundRow.id})`,
        });
      }
    }
  }

  if (d.restock) {
    await admin.rpc("restock_order_inventory", { p_order: order.id });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath(`/account/orders/${order.id}`);
  return { ok: true, refundId: refundRow.id, amount };
}
