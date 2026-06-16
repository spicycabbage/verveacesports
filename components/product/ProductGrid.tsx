import { ProductCard } from "./ProductCard";
import type { ProductWithDefaultVariant } from "@/lib/catalog/variants";

export function ProductGrid({ products }: { products: ProductWithDefaultVariant[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        No products match your filters.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
