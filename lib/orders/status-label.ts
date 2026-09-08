import type { SalesChannel } from "@/lib/supabase/types";

/** Admin-facing order status. POS pickup is stored as `delivered`. */
export function adminOrderStatusLabel(
  status: string,
  salesChannel?: SalesChannel | string | null,
): string {
  if (status === "delivered" && salesChannel === "pos") return "POS Purchase";
  if (status === "delivered") return "Shipped";
  return status.replaceAll("_", " ");
}

export function adminFulfillmentLabel(
  status: string,
  salesChannel?: SalesChannel | string | null,
  financialStatus?: string | null,
): string {
  if (financialStatus === "voided") return "—";
  if (salesChannel === "pos" && status === "fulfilled") return "POS Purchase";
  if (status === "fulfilled") return "Shipped";
  return status.replaceAll("_", " ");
}
