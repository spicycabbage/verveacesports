"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductPrice } from "./ProductPrice";
import { VariantPicker } from "./VariantPicker";
import { useCartStore } from "@/lib/store/cart";
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
};

export function ProductBuyBox({ product, variants, productOptions = [] }: Props) {
  const axes = useMemo(
    () => buildOptionAxes(variants, productOptions),
    [variants, productOptions],
  );
  const showPicker = shouldShowVariantPicker(variants, axes);
  const [selection, setSelection] = useState(() => initialSelection(variants, axes));
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
    setSelection((prev) => ({ ...prev, [key]: value }));
    setQty(1);
  }

  const stock = selected?.available ?? product.stock;
  const disabled = !selected || stock === 0;
  const priceUsd = selected?.priceUsd ?? Number(product.price_usd);
  const priceCad = selected?.priceCad ?? Number(product.price_cad);

  function handleAdd() {
    if (!selected) return;
    add(
      {
        productId: product.id,
        variantId: selected.id,
        variantLabel: variantLabel(selected),
        slug: product.slug,
        name: product.name,
        image: product.images?.[0] ?? "",
        priceUsd,
        priceCad,
        stock,
      },
      qty,
    );
    const label = variantLabel(selected);
    const suffix = label !== "Default" ? ` (${label})` : "";
    toast.success(`${product.name}${suffix} ×${qty} added to cart`, {
      action: { label: "View cart", onClick: () => open() },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ProductPrice
          priceUsd={priceUsd}
          priceCad={priceCad}
          className="text-2xl font-bold tabular-nums"
        />
        {stock === 0 ? (
          <Badge variant="secondary">Sold out</Badge>
        ) : stock <= 5 ? (
          <Badge variant="destructive">Only {stock} left</Badge>
        ) : (
          <Badge variant="outline" className="border-primary/30 text-primary">
            In stock
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

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-md border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={disabled}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center text-sm tabular-nums">{qty}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setQty((q) => Math.min(stock, q + 1))}
            disabled={disabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button size="lg" onClick={handleAdd} disabled={disabled} className="flex-1">
          <ShoppingBag className="h-4 w-4" />
          {disabled ? "Out of stock" : "Add to cart"}
        </Button>
      </div>
    </div>
  );
}
