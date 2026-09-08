import type { SupabaseClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail } from "@/lib/brevo/emails";
import type { BrevoSendResult } from "@/lib/brevo/send";
import type { SiteId } from "@/lib/site/config";
import type { OrderItem, ShippingAddress } from "@/lib/supabase/types";
import { fetchOrderRow } from "@/lib/supabase/order-row";

export function resolveOrderSiteId(order: {
  site_id?: string | null;
  admin_note?: string | null;
}): SiteId {
  if (order.site_id === "bleeq-ca" || order.site_id === "verveace") return order.site_id;
  return order.admin_note?.includes("Bleeq") ? "bleeq-ca" : "verveace";
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
    .select("product_name, sku, qty, unit_price, currency")
    .eq("order_id", order.id);

  return sendOrderConfirmationEmail({
    siteId: resolveOrderSiteId(order),
    salesChannel: order.sales_channel === "pos" ? "pos" : "online",
    order: {
      id: order.id,
      email: order.email,
      currency: "CAD",
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
    },
    items: (items ?? []) as Pick<
      OrderItem,
      "product_name" | "sku" | "qty" | "unit_price" | "currency"
    >[],
  });
}
