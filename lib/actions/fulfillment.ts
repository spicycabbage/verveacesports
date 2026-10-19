"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";
import { countUnfulfilledPaidOrders } from "@/lib/admin/order-alerts";
import { sendExpoPushToAdmins } from "@/lib/admin/expo-push";
import { sendWebPushToAdmins } from "@/lib/admin/web-push";
import {
  carrierLabel,
  isShippingCarrierId,
  trackingUrlFor,
  type ShippingCarrierId,
} from "@/lib/shipping/carriers";
import { sendExistingShippedEmail } from "@/lib/orders/send-order-email";

type ActionResult = { ok: true; fulfillmentId?: string } | { error: string };

const fulfillSchema = z.object({
  orderId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  trackingCompany: z.string().trim().max(120).optional(),
  trackingNumber: z.string().trim().max(120).optional(),
  trackingUrl: z.string().url().max(500).optional(),
  carrierId: z.string().optional(),
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

  const tracking = resolveTrackingInput(parsed.data);
  const { data: fulfillment, error: fErr } = await admin
    .from("fulfillments")
    .insert({
      order_id: parsed.data.orderId,
      location_id: locationId,
      status: "shipped",
      tracking_company: tracking.company,
      tracking_number: tracking.number,
      tracking_url: tracking.url,
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
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  revalidatePath(`/account/orders/${parsed.data.orderId}`);

  try {
    const badgeCount = await countUnfulfilledPaidOrders(admin);
    const push = {
      title: "Order fulfilled",
      body: "",
      url: "/admin/orders",
      badgeCount,
      silent: true,
    };
    await Promise.all([sendWebPushToAdmins(admin, push), sendExpoPushToAdmins(admin, push)]);
  } catch {
    /* badge refresh is best-effort */
  }

  if (fullyFulfilled) await notifyShippedEmail(admin, parsed.data.orderId);

  return { ok: true, fulfillmentId: fulfillment.id };
}

const trackingSchema = z.object({
  fulfillmentId: z.string().uuid(),
  carrierId: z.string().refine(isShippingCarrierId, "Pick a carrier"),
  trackingNumber: z.string().trim().min(4).max(120),
});

export async function updateFulfillmentTracking(
  input: z.infer<typeof trackingSchema>,
): Promise<ActionResult> {
  const parsed = trackingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid tracking" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const carrierId = parsed.data.carrierId as ShippingCarrierId;
  const trackingNumber = parsed.data.trackingNumber;
  const admin = createSupabaseAdminClient();
  const { data: fulfillment, error: loadErr } = await admin
    .from("fulfillments")
    .select("id, order_id")
    .eq("id", parsed.data.fulfillmentId)
    .maybeSingle();
  if (loadErr || !fulfillment) return { error: loadErr?.message ?? "Fulfillment not found" };

  const { error } = await admin
    .from("fulfillments")
    .update({
      tracking_company: carrierLabel(carrierId),
      tracking_number: trackingNumber,
      tracking_url: trackingUrlFor(carrierId, trackingNumber),
    })
    .eq("id", fulfillment.id);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${fulfillment.order_id}`);
  revalidatePath(`/account/orders/${fulfillment.order_id}`);
  return { ok: true, fulfillmentId: fulfillment.id };
}

export async function deleteShipmentTracking(fulfillmentId: string): Promise<ActionResult> {
  const parsed = z.string().uuid().safeParse(fulfillmentId);
  if (!parsed.success) return { error: "Invalid tracking" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const { data: fulfillment, error: loadErr } = await admin
    .from("fulfillments")
    .select("id, order_id, tracking_company")
    .eq("id", parsed.data)
    .maybeSingle();
  if (loadErr || !fulfillment) return { error: loadErr?.message ?? "Fulfillment not found" };
  if (fulfillment.tracking_company === "In-store pickup") {
    return { error: "In-store pickup cannot be deleted" };
  }

  const { count } = await admin
    .from("fulfillment_line_items")
    .select("id", { count: "exact", head: true })
    .eq("fulfillment_id", fulfillment.id);

  if ((count ?? 0) === 0) {
    const { error } = await admin.from("fulfillments").delete().eq("id", fulfillment.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await admin
      .from("fulfillments")
      .update({
        tracking_company: null,
        tracking_number: null,
        tracking_url: null,
      })
      .eq("id", fulfillment.id);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${fulfillment.order_id}`);
  revalidatePath(`/account/orders/${fulfillment.order_id}`);
  return { ok: true, fulfillmentId: fulfillment.id };
}

const addShipmentSchema = z.object({
  orderId: z.string().uuid(),
  carrierId: z.string().refine(isShippingCarrierId, "Pick a carrier"),
  trackingNumber: z.string().trim().min(4).max(120),
});

/** Extra package after the order is already fulfilled — no qty bump. */
export async function addShipmentTracking(
  input: z.infer<typeof addShipmentSchema>,
): Promise<ActionResult> {
  const parsed = addShipmentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid tracking" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const { data: loc } = await admin.from("locations").select("id").eq("is_default", true).maybeSingle();

  const carrierId = parsed.data.carrierId as ShippingCarrierId;
  const trackingNumber = parsed.data.trackingNumber;
  const { data: fulfillment, error } = await admin
    .from("fulfillments")
    .insert({
      order_id: parsed.data.orderId,
      location_id: loc?.id ?? null,
      status: "shipped",
      tracking_company: carrierLabel(carrierId),
      tracking_number: trackingNumber,
      tracking_url: trackingUrlFor(carrierId, trackingNumber),
      shipped_at: new Date().toISOString(),
      actor: guard.userId,
    })
    .select("id")
    .single();
  if (error || !fulfillment) return { error: error?.message ?? "Failed to add tracking" };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  revalidatePath(`/account/orders/${parsed.data.orderId}`);
  return { ok: true, fulfillmentId: fulfillment.id };
}

export async function resendShipmentEmail(orderId: string): Promise<ActionResult> {
  const parsed = z.string().uuid().safeParse(orderId);
  if (!parsed.success) return { error: "Invalid order" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const { data: rows, error } = await admin
    .from("fulfillments")
    .select("tracking_company, tracking_number")
    .eq("order_id", parsed.data);
  if (error) return { error: error.message };

  const hasTracking = (rows ?? []).some(
    (row) =>
      typeof row.tracking_number === "string" &&
      row.tracking_number.trim() &&
      row.tracking_company !== "In-store pickup",
  );
  if (!hasTracking) return { error: "No tracking to send" };

  const result = await sendExistingShippedEmail(admin, parsed.data);
  if (!result.ok) return { error: result.error };
  return { ok: true };
}

async function notifyShippedEmail(
  admin: Parameters<typeof sendExistingShippedEmail>[0],
  orderId: string,
) {
  try {
    const result = await sendExistingShippedEmail(admin, orderId);
    if (!result.ok) console.error("[fulfillment] shipped email failed", result.error);
  } catch (err) {
    console.error("[fulfillment] shipped email failed", err);
  }
}

function resolveTrackingInput(input: {
  carrierId?: string;
  trackingCompany?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}): { company: string | null; number: string | null; url: string | null } {
  const number = input.trackingNumber?.trim() || null;
  const carrierId = input.carrierId && isShippingCarrierId(input.carrierId) ? input.carrierId : null;
  if (carrierId && number) {
    return {
      company: carrierLabel(carrierId),
      number,
      url: input.trackingUrl ?? trackingUrlFor(carrierId, number),
    };
  }
  return {
    company: input.trackingCompany?.trim() || null,
    number,
    url: input.trackingUrl ?? null,
  };
}
