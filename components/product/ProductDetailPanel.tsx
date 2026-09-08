"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Gallery } from "@/components/product/Gallery";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { ReviewStars } from "@/components/product/ReviewStars";
import { Separator } from "@/components/ui/separator";
import { parseProductOptions } from "@/lib/catalog/product-options";
import type { ProductReviewSummary } from "@/lib/reviews/summary";
import { useSite } from "@/lib/site/SiteProvider";
import { useDictionary, useT } from "@/lib/i18n/I18nProvider";
import type { Product } from "@/lib/supabase/types";
import {
  buildOptionAxes,
  buildProductGalleryImages,
  findVariantBySelection,
  initialSelection,
  type StorefrontVariant,
} from "@/lib/utils/variants";

type Props = {
  product: Product;
  variants: StorefrontVariant[];
  productOptions?: ReturnType<typeof parseProductOptions>;
  categoryLabel: string;
  reviewSummary?: ProductReviewSummary;
};

export function ProductDetailPanel({
  product,
  variants,
  productOptions = [],
  categoryLabel,
  reviewSummary,
}: Props) {
  const site = useSite();
  const dict = useDictionary();
  const t = useT();
  const axes = useMemo(
    () => buildOptionAxes(variants, productOptions),
    [variants, productOptions],
  );
  const [selection, setSelection] = useState(() => initialSelection(variants, axes));

  const selected = useMemo(() => {
    if (variants.length === 0) return undefined;
    return findVariantBySelection(variants, selection) ?? variants[0];
  }, [variants, selection]);

  const galleryImages = useMemo(
    () => buildProductGalleryImages(product.images ?? [], variants),
    [product.images, variants],
  );

  const [rawActiveIndex, setActiveIndex] = useState(0);

  // Jump the gallery to the selected variant's image when the selection changes
  // (state adjusted during render — no effect/extra commit). The user can still
  // browse other images afterwards.
  const [syncedHero, setSyncedHero] = useState(selected?.imageUrl);
  if (selected?.imageUrl !== syncedHero) {
    setSyncedHero(selected?.imageUrl);
    const idx = selected?.imageUrl ? galleryImages.indexOf(selected.imageUrl) : -1;
    if (idx >= 0) setActiveIndex(idx);
  }
  // Clamp instead of correcting via effect when the image list shrinks.
  const activeIndex = Math.min(rawActiveIndex, Math.max(0, galleryImages.length - 1));

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-10">
      <div className="min-w-0">
        <Gallery
          images={galleryImages}
          alt={product.name}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
        />
      </div>
      <div className="min-w-0 space-y-5 sm:space-y-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {categoryLabel}
          </span>
          <h1 className="mt-1 break-words text-2xl font-bold tracking-tight sm:text-3xl">
            {product.name}
          </h1>
          {reviewSummary && reviewSummary.count > 0 ? (
            <a
              href="#reviews-heading"
              className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ReviewStars rating={reviewSummary.average} />
              <span>
                {reviewSummary.average.toFixed(1)} ({reviewSummary.count})
              </span>
            </a>
          ) : null}
        </div>

        <ProductBuyBox
          product={product}
          variants={variants}
          productOptions={productOptions}
          selection={selection}
          onSelectionChange={setSelection}
        />

        <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

        <Separator />
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2 text-muted-foreground">
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {t(
              site.id === "bleeq-ca"
                ? "product.freeShippingCanada"
                : "product.freeShippingUsaCa",
              { amount: site.freeShippingOver },
            )}
          </li>
          <li className="flex items-start gap-2 text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {dict.product.returns30}
          </li>
          <li className="flex items-start gap-2 text-muted-foreground">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {t("product.earnPoints", { n: Math.floor(selected?.priceCad ?? 0) })}
          </li>
        </ul>
      </div>
    </div>
  );
}
