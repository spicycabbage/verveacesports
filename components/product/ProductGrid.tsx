import { ProductCard, type ProductCardData } from "./ProductCard";
import type { ProductWithDefaultVariant } from "@/lib/catalog/variants";

/**
 * ProductCard is a Client Component, so everything passed to it is serialized
 * into the RSC payload. Drop description/options/extra images here (server
 * side) — a grid of 8 `select("*")` rows was ~100KB of payload.
 */
function toCardData(p: ProductWithDefaultVariant): ProductCardData {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    stock: p.stock,
    images: p.images?.length ? [p.images[0]] : [],
    defaultVariantId: p.defaultVariantId,
    defaultVariantLabel: p.defaultVariantLabel,
    defaultPriceCad: p.defaultPriceCad,
    defaultCompareAtCad: p.defaultCompareAtCad,
    translations: p.translations,
  };
}

export function ProductGrid({
  products,
  priorityCount = 4,
}: {
  products: ProductWithDefaultVariant[];
  priorityCount?: number;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        No products match your filters.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={toCardData(p)} priority={i < priorityCount} />
      ))}
    </div>
  );
}
