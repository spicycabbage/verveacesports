"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";

type ActionResult = { ok: true; fulfillmentId?: string } | { error: string };

const fulfillSchema = z.object({
  orderId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  trackingCompany: z.string().trim().max(120).optional(),
  trackingNumber: z.string().trim().max(120).optional(),
  trackingUrl: z.string().url().max(500).optional(),
  // Omit to fulfill everything still outstanding.
  items: z
    .array(z.object({ orderItemId: z.string().uuid(), qty: z.coerce.number().int().positive() }))
    .optional(),
});

export async function createFulfillment(
  input: z.infer<typeof fulfillSchema>,
): Promise<ActionResult> {
  const parsed = fulfillSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const { data: orderItems } = await admin
    .from("order_items")
    .select("id, qty, fulfilled_qty")
    .eq("order_id", parsed.data.orderId);
  if (!orderItems || orderItems.length === 0) return { error: "Order has no items" };

  // Resolve quantities to fulfill (default = all remaining).
  const requested = new Map<string, number>();
  if (parsed.data.items?.length) {
    for (const i of parsed.data.items) requested.set(i.orderItemId, i.qty);
  } else {
    for (const oi of orderItems) requested.set(oi.id, oi.qty - oi.fulfilled_qty);
  }

  const lines: { orderItemId: string; qty: number }[] = [];
  for (const oi of orderItems) {
    const want = requested.get(oi.id) ?? 0;
    const remaining = oi.qty - oi.fulfilled_qty;
    const qty = Math.min(Math.max(0, want), remaining);
    if (qty > 0) lines.push({ orderItemId: oi.id, qty });
  }
  if (lines.length === 0) return { error: "Nothing left to fulfill" };

  let locationId = parsed.data.locationId ?? null;
  if (!locationId) {
    const { data: loc } = await admin
      .from("locations")
      .select("id")
      .eq("is_default", true)
      .single();
    locationId = loc?.id ?? null;
  }

  const { data: fulfillment, error: fErr } = await admin
    .from("fulfillments")
    .insert({
      order_id: parsed.data.orderId,
      location_id: locationId,
      status: "shipped",
      tracking_company: parsed.data.trackingCompany ?? null,
      tracking_number: parsed.data.trackingNumber ?? null,
      tracking_url: parsed.data.trackingUrl ?? null,
      shipped_at: new Date().toISOString(),
      actor: guard.userId,
    })
    .select("id")
    .single();
  if (fErr || !fulfillment) return { error: fErr?.message ?? "Failed to create fulfillment" };

  await admin
    .from("fulfillment_line_items")
    .insert(lines.map((l) => ({ fulfillment_id: fulfillment.id, order_item_id: l.orderItemId, qty: l.qty })));

  // Bump fulfilled_qty per line.
  for (const l of lines) {
    const oi = orderItems.find((o) => o.id === l.orderItemId)!;
    await admin
      .from("order_items")
      .update({ fulfilled_qty: oi.fulfilled_qty + l.qty })
      .eq("id", l.orderItemId);
  }

  // Recompute order fulfillment status.
  const fullyFulfilled = orderItems.every((oi) => {
    const added = lines.find((l) => l.orderItemId === oi.id)?.qty ?? 0;
    return oi.fulfilled_qty + added >= oi.qty;
  });
  await admin
    .from("orders")
    .update({
      fulfillment_status: fullyFulfilled ? "fulfilled" : "partially_fulfilled",
      ...(fullyFulfilled ? { status: "shipped" } : {}),
    })
    .eq("id", parsed.data.orderId);

  revalidatePath("/admin/orders");
  revalidatePath(`/account/orders/${parsed.data.orderId}`);
  return { ok: true, fulfillmentId: fulfillment.id };
}
