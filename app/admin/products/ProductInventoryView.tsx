"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryLabel } from "@/lib/constants";
import { formatPrice } from "@/lib/utils/format";
import { parseProductOptions } from "@/lib/catalog/product-options";
import { productUsesVariants } from "@/lib/utils/variants";
import { sizedImageUrl } from "@/lib/images/cdn";
import { Pencil } from "lucide-react";
import { VariantInventoryRow } from "./VariantInventoryRow";
import { PAGE_SIZE } from "./ProductInventoryPagination";
import { DeleteProductButton } from "./DeleteProductButton";
import {
  ProductBulkDeleteBar,
  ProductSelectCheckbox,
  ProductSelectionProvider,
} from "./ProductBulkSelect";
import { ProductInventoryToolbar } from "./ProductInventoryToolbar";
import type { AdminInventoryPayload, AdminProduct, AdminVariant } from "./load-inventory";

export function ProductInventoryView({ data }: { data: AdminInventoryPayload }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const [category, setCategory] = useState(sp.get("category") ?? "");
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [page, setPage] = useState(Math.max(1, Number.parseInt(sp.get("page") ?? "1", 10) || 1));

  useEffect(() => {
    function onPop() {
      const next = new URLSearchParams(window.location.search);
      setCategory(next.get("category") ?? "");
      setQ(next.get("q") ?? "");
      setPage(Math.max(1, Number.parseInt(next.get("page") ?? "1", 10) || 1));
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function syncUrl(next: { category?: string; q?: string; page?: number }) {
    const nextCategory = next.category ?? category;
    const nextQ = next.q ?? q;
    const nextPage = next.page ?? 1;
    const params = new URLSearchParams();
    if (nextCategory) params.set("category", nextCategory);
    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    window.history.pushState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }

  function onCategory(next: string) {
    setCategory(next);
    setPage(1);
    syncUrl({ category: next, page: 1 });
  }

  function onSearch(next: string) {
    const trimmed = next.trim();
    setQ(trimmed);
    setPage(1);
    syncUrl({ q: trimmed, page: 1 });
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return data.products.filter((p) => {
      if (category && p.category !== category) return false;
      if (needle && !p.name.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [data.products, category, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (data.error) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-destructive">
          Could not load products: {data.error}
        </CardContent>
      </Card>
    );
  }

  if (!data.location) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-destructive">
          No default warehouse found. Commerce migrations (0003–0005) may not be applied on this
          database — contact support or run them in Supabase SQL.
        </CardContent>
      </Card>
    );
  }

  const location = data.location;

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Edit descriptions, prices, images, and inventory in one place. Stock counts are at{" "}
        <span className="font-medium">{location.name}</span>.
      </p>
      <ProductInventoryToolbar
        category={category}
        q={q}
        onCategory={onCategory}
        onSearch={onSearch}
      />
      <ProductSelectionProvider products={pageRows.map((p) => ({ id: p.id, name: p.name }))}>
        <ProductBulkDeleteBar products={pageRows.map((p) => ({ id: p.id, name: p.name }))} />
        <div className="space-y-4">
          {pageRows.map((p) => (
            <ProductCard key={p.id} product={p} locationId={location.id} />
          ))}
          {pageRows.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {q || category ? "No products match your filters." : "No products found."}
              </CardContent>
            </Card>
          )}
        </div>
      </ProductSelectionProvider>
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => {
                const next = safePage - 1;
                setPage(next);
                syncUrl({ page: next });
              }}
            >
              Previous
            </Button>
            <span className="text-sm tabular-nums text-muted-foreground">
              Page {safePage} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => {
                const next = safePage + 1;
                setPage(next);
                syncUrl({ page: next });
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function levelFor(variant: AdminVariant) {
  return {
    onHand: variant.onHand,
    reserved: variant.reserved,
    available: variant.available,
    reorderPoint: variant.reorderPoint,
  };
}

function ProductCard({ product: p, locationId }: { product: AdminProduct; locationId: string }) {
  const pv = p.variants;
  const productOptions = parseProductOptions(p.options);
  const usesVariants = productUsesVariants(pv, productOptions);
  const singleVariant = !usesVariants && pv.length === 1 ? pv[0] : null;
  const primaryVariant = pv[0];
  const listPrices = primaryVariant
    ? { priceCad: primaryVariant.priceCad }
    : { priceCad: 0 };
  const lowStock = pv.some((v) => v.available <= v.reorderPoint);

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-wrap items-start gap-4">
          <ProductSelectCheckbox productId={p.id} />
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin thumbs skip the image optimizer
              <img
                src={sizedImageUrl(p.image, 160)}
                alt=""
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No image
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium leading-tight">{p.name}</span>
              <span className="text-xs text-muted-foreground">{categoryLabel(p.category)}</span>
              {!p.isActive && <Badge variant="secondary">Hidden</Badge>}
              {lowStock && <Badge variant="destructive">Low stock</Badge>}
            </div>
            <p className="text-xs tabular-nums text-muted-foreground">
              {formatPrice(listPrices.priceCad, "CAD")}
              {usesVariants && pv.length > 1 ? " · default variant" : ""}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" render={<Link href={`/admin/products/${p.id}`} />}>
                <Pencil className="h-3.5 w-3.5" />
                Edit product
              </Button>
              <DeleteProductButton productId={p.id} productName={p.name} variant="compact" />
            </div>
          </div>
          {singleVariant && (
            <VariantInventoryRow
              locationId={locationId}
              inline
              productId={p.id}
              productIsActive={p.isActive}
              variant={{
                id: singleVariant.id,
                title: singleVariant.title,
                sku: singleVariant.sku,
                options: "",
                priceUsd: singleVariant.priceUsd,
                priceCad: singleVariant.priceCad,
                isActive: singleVariant.isActive,
              }}
              level={levelFor(singleVariant)}
            />
          )}
        </div>
        {usesVariants && (
          <div className="mt-3 divide-y border-t pt-2">
            {pv.map((v) => (
              <VariantInventoryRow
                key={v.id}
                locationId={locationId}
                variant={{
                  id: v.id,
                  title: v.title,
                  sku: v.sku,
                  options: [v.option1, v.option2, v.option3].filter(Boolean).join(" / "),
                  priceUsd: v.priceUsd,
                  priceCad: v.priceCad,
                  isActive: v.isActive,
                }}
                level={levelFor(v)}
              />
            ))}
          </div>
        )}
        {pv.length === 0 && (
          <p className="mt-2 text-xs text-muted-foreground">No inventory record.</p>
        )}
      </CardContent>
    </Card>
  );
}
