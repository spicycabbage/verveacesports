"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format";
import { setInventoryOnHand, updateVariantPrice } from "@/lib/actions/inventory";
import { setProductStorefrontVisibility } from "@/lib/actions/catalog";

type Props = {
  locationId: string;
  inline?: boolean;
  productId?: string;
  productIsActive?: boolean;
  variant: {
    id: string;
    title: string;
    sku: string | null;
    options: string;
    priceUsd: number;
    priceCad: number;
    isActive: boolean;
  };
  level: { onHand: number; reserved: number; available: number };
};

export function VariantInventoryRow({
  locationId,
  variant,
  level,
  inline = false,
  productId,
  productIsActive,
}: Props) {
  const storefrontActive = inline && productIsActive !== undefined ? productIsActive : variant.isActive;
  const [qty, setQty] = useState("");
  const [active, setActive] = useState(storefrontActive);
  const [pending, start] = useTransition();

  function saveStock() {
    const n = Number.parseInt(qty, 10);
    if (Number.isNaN(n) || n < 0) {
      toast.error("Enter a valid quantity (0 or higher)");
      return;
    }
    if (n === level.onHand) {
      toast.message("Stock unchanged");
      return;
    }
    start(async () => {
      const res = await setInventoryOnHand({ variantId: variant.id, locationId, onHand: n });
      if ("error" in res) toast.error(res.error);
      else {
        toast.success(`Stock updated to ${n}`);
        setQty("");
      }
    });
  }

  function toggleActive() {
    const next = !active;
    setActive(next);
    start(async () => {
      const res =
        inline && productId
          ? await setProductStorefrontVisibility({ productId, isActive: next })
          : await updateVariantPrice({
              variantId: variant.id,
              priceUsd: variant.priceUsd,
              priceCad: variant.priceCad,
              isActive: next,
            });
      if ("error" in res) {
        setActive(!next);
        toast.error(res.error);
      } else {
        toast.success(
          inline
            ? next
              ? "Visible on storefront"
              : "Hidden from storefront"
            : next
              ? "Variant active"
              : "Variant hidden",
        );
      }
    });
  }

  const stats = (
    <div className="flex flex-col items-center tabular-nums">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Stock</span>
      <span className="font-medium">{level.onHand}</span>
    </div>
  );

  const stockInput = (
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        min={0}
        step={1}
        placeholder={String(level.onHand)}
        className="h-8 w-20 tabular-nums"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), saveStock())}
      />
      <Button size="sm" variant="secondary" onClick={saveStock} disabled={pending}>
        Save
      </Button>
    </div>
  );

  const activeToggle = (
    <Button
      size="sm"
      variant={active ? "ghost" : "secondary"}
      onClick={toggleActive}
      disabled={pending}
    >
      {active ? (inline ? "Visible" : "Active") : "Hidden"}
    </Button>
  );

  if (inline) {
    return (
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <p className="text-xs tabular-nums text-muted-foreground">
          {formatPrice(variant.priceUsd, "USD")} / {formatPrice(variant.priceCad, "CAD")}
        </p>
        {stats}
        {stockInput}
        {activeToggle}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 py-2 text-sm">
      <div className="min-w-0 flex-1">
        <span className="font-medium">{variant.options || variant.title}</span>
        {variant.sku && (
          <span className="ml-2 font-mono text-xs text-muted-foreground">{variant.sku}</span>
        )}
        <p className="text-xs tabular-nums text-muted-foreground">
          {formatPrice(variant.priceUsd, "USD")} / {formatPrice(variant.priceCad, "CAD")}
        </p>
      </div>
      {stats}
      {stockInput}
      {activeToggle}
    </div>
  );
}
