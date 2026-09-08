import { revalidateTag, updateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/catalog/tags";

// Server-only (next/cache). Tag constants live in lib/catalog/tags.ts so
// Client Components can import those without pulling this in.

/**
 * Server Actions only (admin edits): expire immediately so the admin's next
 * render reads their own write.
 */
export function updateCatalogCache(): void {
  updateTag(CATALOG_TAG);
}

/**
 * Route handlers / webhooks (order flow): stale-while-revalidate — the next
 * storefront request is served the previous listing while a refresh runs.
 */
export function revalidateCatalogCache(): void {
  revalidateTag(CATALOG_TAG, "max");
}
