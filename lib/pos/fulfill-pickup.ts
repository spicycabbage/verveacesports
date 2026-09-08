import type { SupabaseClient } from "@supabase/supabase-js";

/** Mark a paid in-store order as handed to the customer. Idempotent. */
export async function fulfillPosPickup(
  admin: SupabaseClient,
  orderId: string,
  actor?: string,
): Promise<void> {
  const { data: order } = await admin
    .from("orders")
    .select("id, fulfillment_status, financial_status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.fulfillment_status === "fulfilled") return;
  if (order.financial_status !== "paid") return;

  const { data: existing } = await admin
    .from("fulfillments")
    .select("id")
    .eq("order_id", orderId)
    .eq("tracking_company", "In-store pickup")
    .maybeSingle();
  if (existing) {
    await admin
      .from("orders")
      .update({ fulfillment_status: "fulfilled", status: "delivered" })
      .eq("id", orderId);
    return;
  }

  const { data: items } = await admin
    .from("order_items")
    .select("id, qty, fulfilled_qty")
    .eq("order_id", orderId);
  if (!items?.length) return;

  const lines = items
    .map((oi) => ({ orderItemId: oi.id, qty: Math.max(0, oi.qty - oi.fulfilled_qty) }))
    .filter((l) => l.qty > 0);
  if (lines.length === 0) {
    await admin
      .from("orders")
      .update({ fulfillment_status: "fulfilled", status: "delivered" })
      .eq("id", orderId);
    return;
  }

  const { data: loc } = await admin.from("locations").select("id").eq("is_default", true).maybeSingle();

  const { data: fulfillment, error } = await admin
    .from("fulfillments")
    .insert({
      order_id: orderId,
      location_id: loc?.id ?? null,
      status: "delivered",
      tracking_company: "In-store pickup",
      shipped_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
      actor: actor ?? null,
    })
    .select("id")
    .single();
  if (error || !fulfillment) {
    console.error("POS pickup fulfill failed", error?.message);
    return;
  }

  await admin.from("fulfillment_line_items").insert(
    lines.map((l) => ({
      fulfillment_id: fulfillment.id,
      order_item_id: l.orderItemId,
      qty: l.qty,
    })),
  );

  for (const l of lines) {
    const oi = items.find((i) => i.id === l.orderItemId);
    if (!oi) continue;
    await admin
      .from("order_items")
      .update({ fulfilled_qty: oi.fulfilled_qty + l.qty })
      .eq("id", l.orderItemId);
  }

  await admin
    .from("orders")
    .update({ fulfillment_status: "fulfilled", status: "delivered" })
    .eq("id", orderId);
}
