"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type Category } from "@/lib/constants";
import { useSite } from "@/lib/site/SiteProvider";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { categoryLabelFromDict } from "@/lib/i18n/helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SortSelect({
  sort,
  onSort,
  className,
  triggerClassName,
}: {
  sort: string;
  onSort: (value: string | null) => void;
  className?: string;
  triggerClassName?: string;
}) {
  const dict = useDictionary();

  return (
    <div className={className}>
      <Select
        items={{
          newest: dict.products.sortNewest,
          price_asc: dict.products.sortPriceAsc,
          price_desc: dict.products.sortPriceDesc,
          name_asc: dict.products.sortNameAsc,
        }}
        value={sort}
        onValueChange={(v) => onSort(v === "newest" ? null : v)}
      >
        <SelectTrigger className={cn("w-full", triggerClassName)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{dict.products.sortNewest}</SelectItem>
          <SelectItem value="price_asc">{dict.products.sortPriceAsc}</SelectItem>
          <SelectItem value="price_desc">{dict.products.sortPriceDesc}</SelectItem>
          <SelectItem value="name_asc">{dict.products.sortNameAsc}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function ProductFilters({
  categories: categoriesProp,
}: {
  categories?: readonly Category[];
} = {}) {
  const site = useSite();
  const dict = useDictionary();
  const categories = categoriesProp ?? site.categories;
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const category = sp.get("category");
  const sort = sp.get("sort") ?? "newest";
  const q = sp.get("q");

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 sm:hidden">
        <div className="min-w-0 flex-1">
          <Select
            items={{
              all: dict.products.all,
              ...Object.fromEntries(categories.map((c) => [c, categoryLabelFromDict(dict, c)])),
            }}
            value={category ?? "all"}
            onValueChange={(v) => setParam("category", !v || v === "all" ? null : v)}
          >
            <SelectTrigger className="w-full" aria-label={dict.products.filterCategory}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{dict.products.all}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {categoryLabelFromDict(dict, c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <SortSelect
          sort={sort}
          onSort={(value) => setParam("sort", value)}
          triggerClassName="w-full"
          className="min-w-0 flex-1"
        />
      </div>

      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        <Link
          href="/products"
          className={cn(
            "flex min-h-11 items-center rounded-full border px-3 py-2 text-sm font-medium",
            !category ? "bg-foreground text-background" : "hover:bg-accent",
          )}
        >
          {dict.products.all}
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/products?category=${c}`}
            className={cn(
              "flex min-h-11 items-center rounded-full border px-3 py-2 text-sm font-medium",
              category === c ? "bg-foreground text-background" : "hover:bg-accent",
            )}
          >
            {categoryLabelFromDict(dict, c)}
          </Link>
        ))}
        <SortSelect
          sort={sort}
          onSort={(value) => setParam("sort", value)}
          triggerClassName="w-[160px]"
          className="ml-auto"
        />
      </div>

      {q && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{dict.products.searching}</span>
          <Badge variant="secondary" className="gap-1">
            {q}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="-mr-1 size-8"
              onClick={() => setParam("q", null)}
              aria-label={dict.products.clearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}
    </div>
  );
}
