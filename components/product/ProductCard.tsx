"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductPrice } from "./ProductPrice";
import { AddToCartButton } from "./AddToCartButton";
import type { ProductWithDefaultVariant } from "@/lib/catalog/variants";
import { sizedImageUrl } from "@/lib/images/cdn";
import { useDictionary, useT } from "@/lib/i18n/I18nProvider";
import { categoryLabelFromDict } from "@/lib/i18n/helpers";

export function ProductCard({ product }: { product: ProductWithDefaultVariant }) {
  const dict = useDictionary();
  const t = useT();
  const image = sizedImageUrl(product.images?.[0], 900);
  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0 transition-shadow hover:shadow-lg">
      <CardContent className="flex h-full flex-col p-0">
        <Link
          href={`/products/${product.slug}`}
          className="relative aspect-square overflow-hidden bg-white"
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
              {t("product.onlyNLeft", { n: product.stock })}
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="absolute left-2 top-2">
              {dict.product.soldOut}
            </Badge>
          )}
        </Link>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {categoryLabelFromDict(dict, product.category)}
          </span>
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 hover:underline"
          >
            {product.name}
          </Link>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <ProductPrice
              priceUsd={product.defaultPriceUsd}
              priceCad={product.defaultPriceCad}
              className="text-base font-bold tabular-nums"
            />
            <AddToCartButton
              product={product}
              variantId={product.defaultVariantId}
              variantLabel={product.defaultVariantLabel}
              priceUsd={product.defaultPriceUsd}
              priceCad={product.defaultPriceCad}
              compact
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
