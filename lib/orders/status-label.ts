import type { SalesChannel } from "@/lib/supabase/types";

export const FULFILLMENT_FILTERS = [
  { id: "all", label: "All" },
  { id: "unfulfilled", label: "Unfulfilled" },
  { id: "shipped", label: "Shipped" },
  { id: "pos", label: "POS Purchase" },
] as const;

export type FulfillmentFilter = (typeof FULFILLMENT_FILTERS)[number]["id"];

export function isFulfillmentFilter(value: string | undefined): value is Exclude<FulfillmentFilter, "all"> {
  return value === "unfulfilled" || value === "shipped" || value === "pos";
}

/** Admin-facing order status. POS pickup is stored as `delivered`. */
export function adminOrderStatusLabel(
  status: string,
  salesChannel?: SalesChannel | string | null,
): string {
  if (status === "delivered" && salesChannel === "pos") return "POS Purchase";
  if (status === "delivered") return "Shipped";
  return status.replaceAll("_", " ");
}

export function isCollectableOrder(financialStatus?: string | null): boolean {
  return financialStatus === "paid" || financialStatus === "partially_refunded";
}

export function needsFulfillment(
  fulfillmentStatus?: string | null,
  financialStatus?: string | null,
): boolean {
  return (
    isCollectableOrder(financialStatus) &&
    (fulfillmentStatus === "unfulfilled" || fulfillmentStatus === "partially_fulfilled")
  );
}

export function adminFulfillmentLabel(
  status: string,
  salesChannel?: SalesChannel | string | null,
  financialStatus?: string | null,
): string {
  if (!isCollectableOrder(financialStatus)) return "—";
  if (salesChannel === "pos" && status === "fulfilled") return "POS Purchase";
  if (status === "fulfilled") return "Shipped";
  return status.replaceAll("_", " ");
}
