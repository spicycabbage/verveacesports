import type { SupabaseClient } from "@supabase/supabase-js";
import { sendAdminNewOrderEmail } from "@/lib/brevo/emails";
import { resolveOrderSiteId } from "@/lib/orders/send-order-email";
import { fetchOrderRow } from "@/lib/supabase/order-row";
import type { OrderItem, ShippingAddress } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/utils/format";
import { formatOrderNumber } from "@/lib/orders/number";
import { sendExpoPushToAdmins } from "@/lib/admin/expo-push";
import { sendWebPushToAdmins } from "@/lib/admin/web-push";

/** Extra inbox on top of every `is_admin` profile. */
export function adminOrderAlertEmail(): string {
  return (
    process.env.ADMIN_ORDER_ALERT_EMAIL?.trim().toLowerCase() || "ming@verveacesports.com"
  );
}

export async function listAdminAlertRecipients(
  admin: SupabaseClient,
): Promise<{ email: string; name?: string }[]> {
  const { data, error } = await admin
    .from("profiles")
    .select("email, full_name, first_name")
    .eq("is_admin", true);
  if (error) {
    console.error("admin recipient lookup failed:", error.message);
  }
  const extra = adminOrderAlertEmail();
  const seen = new Set<string>();
  const out: { email: string; name?: string }[] = [];
  for (const row of data ?? []) {
    const email = String(row.email ?? "").trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    const name = String(row.full_name || row.first_name || "").trim() || undefined;
    out.push({ email, name });
  }
  if (extra && !seen.has(extra)) out.push({ email: extra, name: "Ming" });
  return out;
}

export async function countUnfulfilledPaidOrders(admin: SupabaseClient): Promise<number> {
  const { count, error } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .in("financial_status", ["paid", "partially_refunded"])
    .in("fulfillment_status", ["unfulfilled", "partially_fulfilled"]);
  if (error) {
    console.error("unfulfilled order count failed:", error.message);
    return 0;
  }
  return count ?? 0;
}

/** Email + push after a newly paid order that still needs fulfillment. Never throws. */
export async function notifyAdminsOfUnfulfilledOrder(
  admin: SupabaseClient,
  orderId: string,
): Promise<void> {
  try {
    const { data: order, error } = await fetchOrderRow(admin, orderId);
    if (error || !order) return;
    if (order.financial_status !== "paid" && order.financial_status !== "partially_refunded") {
      return;
    }
    if (order.fulfillment_status === "fulfilled" || order.fulfillment_status === "restocked") {
      return;
    }

    const siteId = resolveOrderSiteId(order);
    const { data: items } = await admin
      .from("order_items")
      .select("product_name, sku, qty, unit_price, currency")
      .eq("order_id", order.id);

    const badgeCount = await countUnfulfilledPaidOrders(admin);
    const label = formatOrderNumber(order);
    const total = formatPrice(Number(order.total), "CAD");
    const channel = order.sales_channel === "pos" ? "POS" : "Online";

    const recipients = await listAdminAlertRecipients(admin);
    const mail = await sendAdminNewOrderEmail({
      siteId,
      to: recipients,
      order: {
        id: order.id,
        order_number: order.order_number,
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
      salesChannel: order.sales_channel === "pos" ? "pos" : "online",
    });
    if (!mail.ok) {
      console.error("admin new-order email not sent:", mail.error);
    }

    const push = {
      title: `${channel} order ${total}`,
      body: `${label}${order.email ? ` · ${order.email}` : ""}`,
      url: `/admin/orders/${order.id}`,
      badgeCount,
    };
    await Promise.all([sendWebPushToAdmins(admin, push), sendExpoPushToAdmins(admin, push)]);
  } catch (err) {
    console.error("admin order alert failed:", err);
  }
}
