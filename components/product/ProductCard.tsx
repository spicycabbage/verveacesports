"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductPrice } from "./ProductPrice";
import { AddToCartButton } from "./AddToCartButton";
import type { ProductWithDefaultVariant } from "@/lib/catalog/variants";
import { useDictionary, useLocale, useT } from "@/lib/i18n/I18nProvider";
import { catalogProductName } from "@/lib/i18n/catalog-copy";
import { categoryLabelFromDict } from "@/lib/i18n/helpers";

/** Minimal projection a card needs — keep the client payload small. */
export type ProductCardData = Pick<
  ProductWithDefaultVariant,
  | "id"
  | "slug"
  | "name"
  | "category"
  | "stock"
  | "images"
  | "defaultVariantId"
  | "defaultVariantLabel"
  | "defaultPriceCad"
  | "translations"
>;

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const dict = useDictionary();
  const t = useT();
  const locale = useLocale();
  const name = catalogProductName(product.slug, locale, product.name, product.translations);
  const image = product.images?.[0] ?? "";
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
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              fetchPriority={priority ? "high" : "auto"}
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
            {name}
          </Link>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <ProductPrice
              price={product.defaultPriceCad}
              className="text-base font-bold tabular-nums"
            />
            <AddToCartButton
              product={product}
              variantId={product.defaultVariantId}
              variantLabel={product.defaultVariantLabel}
              priceUsd={product.defaultPriceCad}
              priceCad={product.defaultPriceCad}
              compact
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
