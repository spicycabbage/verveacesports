import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductPrice } from "./ProductPrice";
import { AddToCartButton } from "./AddToCartButton";
import type { ProductWithDefaultVariant } from "@/lib/catalog/variants";

export function ProductCard({ product }: { product: ProductWithDefaultVariant }) {
  const image = product.images?.[0];
  return (
    <Card className="group flex flex-col overflow-hidden p-0 transition-shadow hover:shadow-lg">
      <CardContent className="flex flex-col p-0">
        <Link
          href={`/products/${product.slug}`}
          className="relative aspect-square overflow-hidden bg-muted"
        >
          {image && (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge variant="destructive" className="absolute left-2 top-2">
              Low stock
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="absolute left-2 top-2">
              Sold out
            </Badge>
          )}
        </Link>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {product.category}
          </span>
          <Link href={`/products/${product.slug}`} className="line-clamp-2 text-sm font-semibold hover:underline">
            {product.name}
          </Link>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <ProductPrice
              priceUsd={Number(product.price_usd)}
              priceCad={Number(product.price_cad)}
              className="text-base font-bold tabular-nums"
            />
            <AddToCartButton
              product={product}
              variantId={product.defaultVariantId}
              variantLabel={product.defaultVariantLabel}
              compact
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
