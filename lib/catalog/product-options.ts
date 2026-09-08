import type { ProductOption } from "@/lib/supabase/types";

// Pure helper, safe for Client Components. Kept out of lib/catalog/variants.ts
// so client bundles don't drag in the server-only data layer.
export function parseProductOptions(raw: unknown): ProductOption[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (o): o is ProductOption =>
      typeof o === "object" &&
      o !== null &&
      typeof (o as ProductOption).name === "string" &&
      Array.isArray((o as ProductOption).values),
  );
}
