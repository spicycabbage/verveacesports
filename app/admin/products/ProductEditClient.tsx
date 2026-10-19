"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { saveProductEdit } from "@/lib/actions/catalog";
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
  translations?: unknown;
};

type Props = {
  product: ProductDraft;
  locationId: string | null;
  usesVariants: boolean;
  singleVariant?: AdminVariantRow;
  variants: AdminVariantRow[];
  productOptions: ProductOption[];
  defaultPriceCad: number;
};

export function ProductEditClient({
  product,
  locationId,
  usesVariants,
  singleVariant,
  variants,
  productOptions,
  defaultPriceCad,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const productRef = useRef<ProductEditorHandle>(null);
  const inventoryRef = useRef<SimpleInventoryHandle>(null);
  const variantRef = useRef<VariantManagerHandle>(null);
  const [priceCad, setPriceCad] = useState(String(singleVariant?.priceCad ?? defaultPriceCad));
  const [sku, setSku] = useState(singleVariant?.sku ?? "");
  const [qty, setQty] = useState("");

  function saveAll() {
    start(async () => {
      const catalog = productRef.current?.getDraft();
      if (!catalog) {
        toast.error("Editor not ready — refresh and try again");
        return;
      }
      if (!catalog.name) {
        toast.error("Name is required");
        return;
      }

      let persistOptions = false;
      let option1Name: string | undefined;
      let option2Name: string | undefined;
      let option3Name: string | undefined;
      let variantPayload: Parameters<typeof saveProductEdit>[0]["variants"];

      if (!usesVariants && singleVariant) {
        const cad = Number(priceCad);
        if (Number.isNaN(cad) || cad < 0) {
          toast.error("Enter a valid price (0 or higher)");
          return;
        }
        const stockTarget = qty.trim() === "" ? undefined : Number.parseInt(qty, 10);
        if (stockTarget !== undefined && (Number.isNaN(stockTarget) || stockTarget < 0)) {
          toast.error("Enter a valid stock quantity (0 or higher)");
          return;
        }
        variantPayload = [
          {
            variantId: singleVariant.id,
            sku: sku || undefined,
            title: singleVariant.title || "Default",
            option1: singleVariant.option1,
            option2: singleVariant.option2,
            option3: singleVariant.option3,
            priceUsd: cad,
            priceCad: cad,
            isActive: singleVariant.isActive,
            onHand: stockTarget,
          },
        ];
      }

      if (locationId && usesVariants) {
        const draft = variantRef.current?.getDraft();
        if (!draft) {
          toast.error("Variant editor not ready — refresh and try again");
          return;
        }
        if ("error" in draft) {
          toast.error(draft.error);
          return;
        }
        persistOptions = draft.persistOptions;
        option1Name = draft.option1Name;
        option2Name = draft.option2Name;
        option3Name = draft.option3Name;
        variantPayload = draft.variants;
      }

      const res = await saveProductEdit({
        productId: product.id,
        name: catalog.name,
        description: catalog.description,
        translations: catalog.translations,
        category: catalog.category,
        isActive: catalog.isActive,
        images: catalog.images,
        locationId: locationId ?? undefined,
        persistOptions,
        option1Name,
        option2Name,
        option3Name,
        variants: variantPayload,
      });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }

      toast.success("Product saved");
      router.refresh();
    });
  }

  const inventorySlot =
    locationId && !usesVariants && singleVariant ? (
      <SimpleInventoryPanel
        ref={inventoryRef}
        productId={product.id}
        locationId={locationId}
        variant={singleVariant}
        priceCad={priceCad}
        sku={sku}
        qty={qty}
        onPriceCadChange={setPriceCad}
        onSkuChange={setSku}
        onQtyChange={setQty}
      />
    ) : null;

  return (
    <div className="space-y-6">
      <ProductEditor ref={productRef} product={product}>
        {inventorySlot}
      </ProductEditor>

      {locationId ? (
        usesVariants ? (
          <VariantManager
            ref={variantRef}
            productId={product.id}
            locationId={locationId}
            productOptions={productOptions}
            variants={variants}
            defaultPriceCad={defaultPriceCad}
          />
        ) : !singleVariant ? (
          <p className="text-sm text-destructive">
            No inventory record for this product. Re-run commerce migrations or add a variant in
            Supabase.
          </p>
        ) : null
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
