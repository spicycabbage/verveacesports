"use client";

import { Button } from "@/components/ui/button";
import { Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useDictionary, useT } from "@/lib/i18n/I18nProvider";
import type { Product } from "@/lib/supabase/types";
import { toast } from "sonner";

type Props = {
  product: Product;
  variantId: string;
  variantLabel?: string;
  priceUsd: number;
  priceCad: number;
  qty?: number;
  compact?: boolean;
};

export function AddToCartButton({
  product,
  variantId,
  variantLabel = "Default",
  priceUsd,
  priceCad,
  qty = 1,
  compact = false,
}: Props) {
  const { add, open } = useCartStore();
  const dict = useDictionary();
  const t = useT();
  const disabled = !variantId || product.stock === 0;

  function handleAdd() {
    if (!variantId) return;
    add(
      {
        productId: product.id,
        variantId,
        variantLabel,
        slug: product.slug,
        name: product.name,
        image: product.images?.[0] ?? "",
        priceUsd,
        priceCad,
        stock: product.stock,
      },
      qty,
    );
    toast.success(t("product.addedToast", { name: product.name }), {
      action: { label: dict.product.viewCart, onClick: () => open() },
    });
  }

  if (compact) {
    return (
      <Button
        size="icon"
        variant="default"
        disabled={disabled}
        onClick={handleAdd}
        aria-label={dict.product.addToCart}
        className="size-10"
      >
        <Plus className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button size="lg" className="w-full" onClick={handleAdd} disabled={disabled}>
      <ShoppingBag className="h-4 w-4" />
      {disabled ? dict.product.outOfStock : dict.product.addToCart}
    </Button>
  );
}
