import type { SupabaseClient } from "@supabase/supabase-js";
import type { ShippingAddress } from "@/lib/supabase/types";

export type OrderRow = {
  id: string;
  order_number?: number | null;
  status: string;
  financial_status: string;
  fulfillment_status: string | null;
  discount_code: string | null;
  discount_total: number | null;
  user_id: string | null;
  total: number;
  currency: string;
  email: string | null;
  subtotal: number;
  tax: number;
  tax_rate: number | null;
  country: string | null;
  shipping: number;
  points_value: number | null;
  shipping_address: ShippingAddress | null;
  admin_note: string | null;
  sales_channel: string | null;
  stripe_pi_id: string | null;
  paid_at: string | null;
};

export function isMissingColumn(message: string | undefined, column: string): boolean {
  if (!message) return false;
  return (
    message.includes(`'${column}' column`) ||
    message.includes(`column ${column}`) ||
    message.includes(`column orders.${column}`) ||
    message.includes(`"${column}"`) ||
    (message.includes(column) && message.includes("does not exist"))
  );
}

/**
 * Columns that exist on live `orders`.
 * Do not add `site_id` — 0033 is not applied in production.
 */
export const ORDER_ROW_COLUMNS =
  "id, order_number, status, financial_status, fulfillment_status, discount_code, discount_total, user_id, total, currency, email, subtotal, tax, tax_rate, country, shipping, points_value, shipping_address, admin_note, sales_channel, stripe_pi_id, paid_at";

function withoutColumn(columns: string, column: string): string {
  return columns
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && part !== column)
    .join(", ");
}

export async function fetchOrderRow(
  admin: SupabaseClient,
  orderId: string,
): Promise<{ data: OrderRow | null; error: { message: string } | null }> {
  let columns = ORDER_ROW_COLUMNS;
  let result = await admin.from("orders").select(columns).eq("id", orderId).maybeSingle();
  if (result.error && isMissingColumn(result.error.message, "site_id")) {
    columns = withoutColumn(columns, "site_id");
    result = await admin.from("orders").select(columns).eq("id", orderId).maybeSingle();
  }
  if (result.error && isMissingColumn(result.error.message, "order_number")) {
    columns = withoutColumn(columns, "order_number");
    result = await admin.from("orders").select(columns).eq("id", orderId).maybeSingle();
  }
  if (result.error) return { data: null, error: { message: result.error.message } };
  return { data: (result.data as OrderRow | null) ?? null, error: null };
}
