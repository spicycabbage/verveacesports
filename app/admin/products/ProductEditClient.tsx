"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductEditor, type ProductEditorHandle } from "./ProductEditor";
import { SimpleInventoryPanel, type SimpleInventoryHandle } from "./SimpleInventoryPanel";
import { VariantManager, type VariantManagerHandle } from "./VariantManager";
import type { AdminVariantRow } from "./VariantManager";
import type { Category } from "@/lib/constants";
import type { ProductOption } from "@/lib/supabase/types";

type ProductDraft = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: Category;
  images: string[];
  isActive: boolean;
};

type Props = {
  product: ProductDraft;
  locationId: string | null;
  usesVariants: boolean;
  singleVariant?: AdminVariantRow;
  variants: AdminVariantRow[];
  productOptions: ProductOption[];
  defaultPriceUsd: number;
  defaultPriceCad: number;
};

export function ProductEditClient({
  product,
  locationId,
  usesVariants,
  singleVariant,
  variants,
  productOptions,
  defaultPriceUsd,
  defaultPriceCad,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const productRef = useRef<ProductEditorHandle>(null);
  const inventoryRef = useRef<SimpleInventoryHandle>(null);
  const variantRef = useRef<VariantManagerHandle>(null);

  function saveAll() {
    start(async () => {
      const productRes = await productRef.current?.save();
      if (productRes && "error" in productRes) {
        toast.error(productRes.error);
        return;
      }

      if (locationId && !usesVariants && singleVariant) {
        const invRes = await inventoryRef.current?.save();
        if (invRes && "error" in invRes) {
          toast.error(invRes.error);
          return;
        }
      }

      if (locationId && usesVariants) {
        const varRes = await variantRef.current?.saveAll();
        if (varRes && "error" in varRes) {
          toast.error(varRes.error);
          return;
        }
      }

      toast.success("Product saved");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <ProductEditor ref={productRef} product={product} />

      {locationId ? (
        usesVariants ? (
          <VariantManager
            ref={variantRef}
            productId={product.id}
            locationId={locationId}
            productOptions={productOptions}
            variants={variants}
            defaultPriceUsd={defaultPriceUsd}
            defaultPriceCad={defaultPriceCad}
          />
        ) : singleVariant ? (
          <SimpleInventoryPanel
            ref={inventoryRef}
            productId={product.id}
            locationId={locationId}
            variant={singleVariant}
          />
        ) : (
          <p className="text-sm text-destructive">
            No inventory record for this product. Re-run commerce migrations or add a variant in
            Supabase.
          </p>
        )
      ) : (
        <p className="text-sm text-destructive">
          No default warehouse found — inventory unavailable until commerce migrations are applied.
        </p>
      )}

      <div className="sticky bottom-4 z-10 flex justify-end rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Button size="lg" onClick={saveAll} disabled={pending}>
          {pending ? "Saving…" : "Save product"}
        </Button>
      </div>
    </div>
  );
}
