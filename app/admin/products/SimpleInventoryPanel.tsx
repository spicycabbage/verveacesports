"use client";

import { forwardRef, useImperativeHandle } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminVariantRow } from "./VariantManager";

type Props = {
  productId: string;
  locationId: string;
  variant: AdminVariantRow;
  priceCad: string;
  sku: string;
  onPriceCadChange: (value: string) => void;
  onSkuChange: (value: string) => void;
  qty: string;
  onQtyChange: (value: string) => void;
};

export type SimpleInventoryDraft = {
  variantId: string;
  sku?: string;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  priceUsd: number;
  priceCad: number;
  isActive: boolean;
  onHand?: number;
};

export type SimpleInventoryHandle = {
  getDraft: () => SimpleInventoryDraft | { error: string };
};

export const SimpleInventoryPanel = forwardRef<SimpleInventoryHandle, Props>(
  function SimpleInventoryPanel({
    productId: _productId,
    locationId: _locationId,
    variant,
    priceCad,
    sku,
    onPriceCadChange,
    onSkuChange,
    qty,
    onQtyChange,
  }, ref) {

    useImperativeHandle(
      ref,
      () => ({
        getDraft() {
          const cad = Number(priceCad);
          if (Number.isNaN(cad) || cad < 0) {
            return { error: "Enter a valid price (0 or higher)" };
          }
          const stockTarget = qty.trim() === "" ? undefined : Number.parseInt(qty, 10);
          if (stockTarget !== undefined && (Number.isNaN(stockTarget) || stockTarget < 0)) {
            return { error: "Enter a valid stock quantity (0 or higher)" };
          }
          return {
            variantId: variant.id,
            sku: sku || undefined,
            title: variant.title,
            option1: variant.option1,
            option2: variant.option2,
            option3: variant.option3,
            priceUsd: cad,
            priceCad: cad,
            isActive: variant.isActive,
            onHand: stockTarget,
          };
        },
      }),
      [sku, priceCad, qty, variant],
    );

    return (
      <div className="space-y-3 border-t pt-4">
        <h2 className="text-sm font-semibold">Inventory &amp; pricing</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="inv-cad">Price (CAD)</Label>
            <Input
              id="inv-cad"
              type="number"
              min={0}
              step="0.01"
              className="tabular-nums"
              value={priceCad}
              onChange={(e) => onPriceCadChange(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              className="font-mono text-sm"
              value={sku}
              onChange={(e) => onSkuChange(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stock-qty">Stock ({variant.onHand} on hand)</Label>
            <Input
              id="stock-qty"
              type="number"
              min={0}
              step={1}
              placeholder={String(variant.onHand)}
              className="tabular-nums"
              value={qty}
              onChange={(e) => onQtyChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  },
);
