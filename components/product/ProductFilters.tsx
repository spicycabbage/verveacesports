"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type Category } from "@/lib/constants";
import { useSite } from "@/lib/site/SiteProvider";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { categoryLabelFromDict } from "@/lib/i18n/helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/products"
          className={`flex min-h-11 items-center rounded-full border px-3 py-2 text-sm font-medium ${!category ? "bg-foreground text-background" : "hover:bg-accent"}`}
        >
          {dict.products.all}
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/products?category=${c}`}
            className={`flex min-h-11 items-center rounded-full border px-3 py-2 text-sm font-medium ${category === c ? "bg-foreground text-background" : "hover:bg-accent"}`}
          >
            {categoryLabelFromDict(dict, c)}
          </Link>
        ))}
        <div className="w-full sm:ml-auto sm:w-auto">
          <Select value={sort} onValueChange={(v) => setParam("sort", v === "newest" ? null : v)}>
            <SelectTrigger className="w-full sm:w-[160px]">
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
