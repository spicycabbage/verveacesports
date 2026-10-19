import type { SupabaseClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail, sendOrderShippedEmail } from "@/lib/brevo/emails";
import type { BrevoSendResult } from "@/lib/brevo/send";
import type { SiteId } from "@/lib/site/config";
import type { OrderItem, ShippingAddress } from "@/lib/supabase/types";
import { fetchOrderRow, type OrderRow } from "@/lib/supabase/order-row";

export function resolveOrderSiteId(order: {
  site_id?: string | null;
  admin_note?: string | null;
}): SiteId {
  if (order.site_id === "bleeq-ca" || order.site_id === "verveace" || order.site_id === "volt-ca") {
    return order.site_id;
  }
  const note = order.admin_note ?? "";
  if (note.includes("Bleeq")) return "bleeq-ca";
  if (note.includes("· Volt")) return "volt-ca";
  return "verveace";
}

/** Send the paid-order invoice (POS) or confirmation (online) to `orders.email`. */
export async function sendExistingOrderEmail(
  admin: SupabaseClient,
  orderId: string,
): Promise<BrevoSendResult> {
  const { data: order, error } = await fetchOrderRow(admin, orderId);
  if (error) return { ok: false, error: error.message };
  if (!order) return { ok: false, error: "Order not found" };

  const { data: items } = await admin
    .from("order_items")
    .select("product_name, variant_title, sku, qty, unit_price, currency")
    .eq("order_id", order.id);

  return sendOrderConfirmationEmail({
    siteId: resolveOrderSiteId(order),
    salesChannel: order.sales_channel === "pos" ? "pos" : "online",
    order: toOrderEmailFields(order),
    items: (items ?? []) as Pick<
      OrderItem,
      "product_name" | "variant_title" | "sku" | "qty" | "unit_price" | "currency"
    >[],
  });
}

export async function sendExistingShippedEmail(
  admin: SupabaseClient,
  orderId: string,
  to?: string,
  subject?: string,
): Promise<BrevoSendResult> {
  const { data: order, error } = await fetchOrderRow(admin, orderId);
  if (error) return { ok: false, error: error.message };
  if (!order) return { ok: false, error: "Order not found" };

  const { data: rows, error: shipErr } = await admin
    .from("fulfillments")
    .select("tracking_company, tracking_number, tracking_url")
    .eq("order_id", order.id)
    .order("created_at");
  if (shipErr) return { ok: false, error: shipErr.message };

  const shipments = (rows ?? [])
    .filter(
      (row) =>
        typeof row.tracking_number === "string" &&
        row.tracking_number.trim() &&
        row.tracking_company !== "In-store pickup",
    )
    .map((row) => ({
      company: typeof row.tracking_company === "string" ? row.tracking_company : null,
      number: String(row.tracking_number),
      url: typeof row.tracking_url === "string" ? row.tracking_url : null,
    }));

  return sendOrderShippedEmail({
    siteId: resolveOrderSiteId(order),
    order: toOrderEmailFields(order),
    shipments,
    to,
    subject,
  });
}

function toOrderEmailFields(order: OrderRow) {
  return {
    id: order.id,
    order_number: order.order_number,
    email: order.email,
    currency: "CAD" as const,
    subtotal: Number(order.subtotal),
    tax: Number(order.tax),
    tax_rate: Number(order.tax_rate ?? 0),
    country: typeof order.country === "string" ? order.country : "CA",
    shipping: Number(order.shipping),
    discount_code: order.discount_code,
    discount_total: Number(order.discount_total ?? 0),
    points_value: Number(order.points_value ?? 0),
    total: Number(order.total),
    shipping_address: order.shipping_address as ShippingAddress | null,
  };
}
