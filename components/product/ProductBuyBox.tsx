"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductPrice } from "./ProductPrice";
import { VariantPicker } from "./VariantPicker";
import { useCartStore } from "@/lib/store/cart";
import { useDictionary, useT } from "@/lib/i18n/I18nProvider";
import type { Product, ProductOption } from "@/lib/supabase/types";
import {
  buildOptionAxes,
  findVariantBySelection,
  initialSelection,
  shouldShowVariantPicker,
  variantLabel,
  type StorefrontVariant,
  type VariantOptionKey,
} from "@/lib/utils/variants";

type Props = {
  product: Product;
  variants: StorefrontVariant[];
  productOptions?: ProductOption[];
  selection?: Partial<Record<VariantOptionKey, string>>;
  onSelectionChange?: (selection: Partial<Record<VariantOptionKey, string>>) => void;
};

export function ProductBuyBox({
  product,
  variants,
  productOptions = [],
  selection: controlledSelection,
  onSelectionChange,
}: Props) {
  const dict = useDictionary();
  const t = useT();
  const axes = useMemo(
    () => buildOptionAxes(variants, productOptions),
    [variants, productOptions],
  );
  const showPicker = shouldShowVariantPicker(variants, axes);
  const [internalSelection, setInternalSelection] = useState(() =>
    initialSelection(variants, axes),
  );
  const selection = controlledSelection ?? internalSelection;
  const setSelection = onSelectionChange ?? setInternalSelection;
  const [qty, setQty] = useState(1);
  const { add, open } = useCartStore();

  const selected = useMemo(() => {
    if (variants.length === 0) return undefined;
    if (!showPicker) return variants[0];
    return findVariantBySelection(variants, selection) ?? variants[0];
  }, [variants, selection, showPicker]);

  const disabledValues = useMemo(() => {
    const map: Partial<Record<VariantOptionKey, Set<string>>> = {};
    for (const axis of axes) {
      const set = new Set<string>();
      for (const value of axis.values) {
        const trial = { ...selection, [axis.key]: value };
        const match = findVariantBySelection(variants, trial);
        if (!match || match.available <= 0) set.add(value);
      }
      if (set.size > 0) map[axis.key] = set;
    }
    return map;
  }, [axes, selection, variants]);

  function onSelect(key: VariantOptionKey, value: string) {
    setSelection({ ...selection, [key]: value });
    setQty(1);
  }

  const stock = selected?.available ?? 0;
  const disabled = !selected || stock === 0;
  const priceUsd = selected?.priceUsd ?? 0;
  const priceCad = selected?.priceCad ?? 0;

  function handleAdd() {
    if (!selected) return;
    add(
      {
        productId: product.id,
        variantId: selected.id,
        variantLabel: variantLabel(selected),
        slug: product.slug,
        name: product.name,
        image: selected?.imageUrl ?? product.images?.[0] ?? "",
        priceUsd,
        priceCad,
        stock,
      },
      qty,
    );
    const label = variantLabel(selected);
    const suffix = label !== "Default" ? ` (${label})` : "";
    toast.success(t("product.addedToast", { name: `${product.name}${suffix} ×${qty}` }), {
      action: { label: dict.product.viewCart, onClick: () => open() },
    });
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <ProductPrice
          priceUsd={priceUsd}
          priceCad={priceCad}
          className="text-xl font-bold tabular-nums sm:text-2xl"
        />
        {stock === 0 ? (
          <Badge variant="secondary">{dict.product.soldOut}</Badge>
        ) : stock <= 5 ? (
          <Badge variant="destructive">{t("product.onlyNLeft", { n: stock })}</Badge>
        ) : (
          <Badge variant="outline" className="border-primary/30 text-primary">
            {dict.product.inStock}
          </Badge>
        )}
      </div>

      {showPicker && (
        <VariantPicker
          axes={axes}
          selection={selection}
          onSelect={onSelect}
          disabledValues={disabledValues}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex w-full items-center rounded-md border sm:w-fit">
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={disabled}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center text-sm tabular-nums">{qty}</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            onClick={() => setQty((q) => Math.min(stock, q + 1))}
            disabled={disabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button size="lg" onClick={handleAdd} disabled={disabled} className="w-full sm:min-w-[12rem] sm:flex-1">
          <ShoppingBag className="h-4 w-4" />
          {disabled ? dict.product.outOfStock : dict.product.addToCart}
        </Button>
      </div>
    </div>
  );
}
