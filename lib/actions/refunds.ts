"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { requireAdmin } from "@/lib/auth/admin";
import { toMinorUnits } from "@/lib/utils/currency";

type ActionResult = { ok: true; refundId: string } | { error: string };

const refundSchema = z.object({
  orderId: z.string().uuid(),
  // Omit amount to refund the full remaining balance.
  amount: z.coerce.number().positive().optional(),
  reason: z.enum(["requested_by_customer", "duplicate", "fraudulent", "other"]).default("requested_by_customer"),
  restock: z.boolean().default(false),
});

export async function refundOrder(input: z.infer<typeof refundSchema>): Promise<ActionResult> {
  const parsed = refundSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, stripe_pi_id, currency, total, refunded_total, financial_status")
    .eq("id", parsed.data.orderId)
    .single();
  if (!order) return { error: "Order not found" };
  if (!order.stripe_pi_id) return { error: "Order has no payment to refund" };

  const alreadyRefunded = Number(order.refunded_total) || 0;
  const remaining = Math.round((Number(order.total) - alreadyRefunded) * 100) / 100;
  if (remaining <= 0) return { error: "Order is already fully refunded" };

  const amount = parsed.data.amount ? Math.min(parsed.data.amount, remaining) : remaining;

  const stripe = getStripe(order.currency as "USD" | "CAD");
  let stripeRefundId: string;
  try {
    const refund = await stripe.refunds.create({
      payment_intent: order.stripe_pi_id,
      amount: toMinorUnits(amount),
      reason: parsed.data.reason === "other" ? undefined : parsed.data.reason,
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
      currency: order.currency,
      reason: parsed.data.reason,
      restock: parsed.data.restock,
      stripe_refund_id: stripeRefundId,
      actor: guard.userId,
    })
    .select("id")
    .single();
  if (refErr || !refundRow) return { error: refErr?.message ?? "Failed to record refund" };

  await admin.from("payments").insert({
    order_id: order.id,
    kind: "refund",
    status: "succeeded",
    amount,
    currency: order.currency,
    gateway: "stripe",
    stripe_payment_intent_id: order.stripe_pi_id,
    stripe_refund_id: stripeRefundId,
  });

  const newRefundedTotal = Math.round((alreadyRefunded + amount) * 100) / 100;
  const isFull = newRefundedTotal >= Number(order.total);
  await admin
    .from("orders")
    .update({
      refunded_total: newRefundedTotal,
      financial_status: isFull ? "refunded" : "partially_refunded",
      ...(isFull ? { status: "cancelled" } : {}),
    })
    .eq("id", order.id);

  if (parsed.data.restock) {
    await admin.rpc("restock_order_inventory", { p_order: order.id });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/account/orders/${order.id}`);
  return { ok: true, refundId: refundRow.id };
}
