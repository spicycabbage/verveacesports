"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateVariantDetails } from "@/lib/actions/catalog";
import { setInventoryOnHand } from "@/lib/actions/inventory";
import type { AdminVariantRow } from "./VariantManager";

type Props = {
  productId: string;
  locationId: string;
  variant: AdminVariantRow;
};

export type SimpleInventoryHandle = {
  save: () => Promise<{ ok: true } | { error: string } | null>;
};

export const SimpleInventoryPanel = forwardRef<SimpleInventoryHandle, Props>(
  function SimpleInventoryPanel({ productId, locationId, variant }, ref) {
    const [sku, setSku] = useState(variant.sku ?? "");
    const [priceUsd, setPriceUsd] = useState(String(variant.priceUsd));
    const [priceCad, setPriceCad] = useState(String(variant.priceCad));
    const [qty, setQty] = useState("");

    useImperativeHandle(
      ref,
      () => ({
        async save() {
          const usd = Number(priceUsd);
          const cad = Number(priceCad);
          if (Number.isNaN(usd) || usd < 0 || Number.isNaN(cad) || cad < 0) {
            return { error: "Enter valid prices (0 or higher)" };
          }

          const pricesDirty =
            priceUsd !== String(variant.priceUsd) || priceCad !== String(variant.priceCad);
          const skuDirty = sku !== (variant.sku ?? "");
          const stockTarget =
            qty.trim() === "" ? null : Number.parseInt(qty, 10);
          const stockDirty =
            stockTarget !== null &&
            !Number.isNaN(stockTarget) &&
            stockTarget >= 0 &&
            stockTarget !== variant.onHand;

          if (!pricesDirty && !skuDirty && !stockDirty) {
            return null;
          }

          if (stockTarget !== null && (Number.isNaN(stockTarget) || stockTarget < 0)) {
            return { error: "Enter a valid stock quantity (0 or higher)" };
          }

          if (pricesDirty || skuDirty) {
            const res = await updateVariantDetails({
              variantId: variant.id,
              productId,
              sku: sku || undefined,
              title: variant.title,
              priceUsd: usd,
              priceCad: cad,
              isActive: variant.isActive,
            });
            if ("error" in res) return res;
          }

          if (stockDirty && stockTarget !== null) {
            const res = await setInventoryOnHand({
              variantId: variant.id,
              locationId,
              onHand: stockTarget,
            });
            if ("error" in res) return res;
          }

          return { ok: true };
        },
      }),
      [sku, priceUsd, priceCad, qty, variant, productId, locationId],
    );

    return (
      <Card>
        <CardContent className="space-y-4 py-4">
          <div>
            <h2 className="text-sm font-semibold">Inventory &amp; pricing</h2>
            <p className="text-xs text-muted-foreground">
              Single-SKU product — prices and stock are saved with <strong>Save product</strong>{" "}
              below.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="inv-usd">US price (USD)</Label>
              <Input
                id="inv-usd"
                type="number"
                min={0}
                step="0.01"
                className="tabular-nums"
                value={priceUsd}
                onChange={(e) => setPriceUsd(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-cad">Canada price (CAD)</Label>
              <Input
                id="inv-cad"
                type="number"
                min={0}
                step="0.01"
                className="tabular-nums"
                value={priceCad}
                onChange={(e) => setPriceCad(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              className="font-mono text-sm"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex flex-col tabular-nums">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Current stock
              </span>
              <span className="font-medium">{variant.onHand}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stock-qty" className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Set stock to
              </Label>
              <Input
                id="stock-qty"
                type="number"
                min={0}
                step={1}
                placeholder={String(variant.onHand)}
                className="h-9 w-28 tabular-nums"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
);
