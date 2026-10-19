/** Customer-facing variant label for an order line, or null for single-variant ("Default") products. */
export function orderVariantLabel(title: string | null | undefined): string | null {
  const t = title?.trim();
  if (!t || t.toLowerCase() === "default") return null;
  return t;
}
