"use client";

import { Button } from "@/components/ui/button";
import { Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import type { Product } from "@/lib/supabase/types";
import { toast } from "sonner";

type Props = {
  product: Product;
  variantId: string;
  variantLabel?: string;
  qty?: number;
  compact?: boolean;
};

export function AddToCartButton({
  product,
  variantId,
  variantLabel = "Default",
  qty = 1,
  compact = false,
}: Props) {
  const { add, open } = useCartStore();
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
        priceUsd: Number(product.price_usd),
        priceCad: Number(product.price_cad),
        stock: product.stock,
      },
      qty,
    );
    toast.success(`${product.name} added to cart`, {
      action: { label: "View cart", onClick: () => open() },
    });
  }

  if (compact) {
    return (
      <Button
        size="icon"
        variant="default"
        disabled={disabled}
        onClick={handleAdd}
        aria-label="Add to cart"
        className="h-8 w-8"
      >
        <Plus className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button size="lg" className="w-full" onClick={handleAdd} disabled={disabled}>
      <ShoppingBag className="h-4 w-4" />
      {disabled ? "Out of stock" : "Add to cart"}
    </Button>
  );
}
