"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, categoryLabel } from "@/lib/constants";
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

export function ProductFilters() {
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
          className={`rounded-full border px-3 py-2 text-sm font-medium min-h-11 flex items-center ${!category ? "bg-foreground text-background" : "hover:bg-accent"}`}
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/products?category=${c}`}
            className={`rounded-full border px-3 py-2 text-sm font-medium min-h-11 flex items-center ${category === c ? "bg-foreground text-background" : "hover:bg-accent"}`}
          >
            {categoryLabel(c)}
          </Link>
        ))}
        <div className="w-full sm:ml-auto sm:w-auto">
          <Select value={sort} onValueChange={(v) => setParam("sort", v === "newest" ? null : v)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="name_asc">Name A–Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {q && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Searching:</span>
          <Badge variant="secondary" className="gap-1">
            {q}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="-mr-1 size-8"
              onClick={() => setParam("q", null)}
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}
    </div>
  );
}
