export function formatOrderNumber(order: {
  id: string;
  order_number?: number | null;
}): string {
  const n = Number(order.order_number);
  if (Number.isFinite(n) && n > 0) return `#${n}`;
  return `#${order.id.slice(0, 8).toUpperCase()}`;
}
