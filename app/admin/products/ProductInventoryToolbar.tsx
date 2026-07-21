"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { CATEGORIES, categoryLabel } from "@/lib/constants";

export function ProductInventoryToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const category = sp.get("category") ?? "";
  const qParam = sp.get("q") ?? "";
  const [q, setQ] = useState(qParam);

  useEffect(() => setQ(qParam), [qParam]);

  function pushParams(next: { category?: string | null; q?: string | null; page?: number }) {
    const params = new URLSearchParams(sp.toString());
    if (next.category === null) params.delete("category");
    else if (next.category) params.set("category", next.category);
    if (next.q === null) params.delete("q");
    else if (next.q !== undefined) {
      const trimmed = next.q.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
    }
    params.delete("page");
    if (next.page && next.page > 1) params.set("page", String(next.page));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ q });
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submitSearch} className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
        {qParam && (
          <Button type="button" variant="ghost" size="icon" onClick={() => pushParams({ q: null })} aria-label="Clear search">
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={!category ? "default" : "outline"}
          onClick={() => pushParams({ category: null })}
        >
          All
        </Button>
        {CATEGORIES.map((c) => (
          <Button
            key={c}
            type="button"
            size="sm"
            variant={category === c ? "default" : "outline"}
            onClick={() => pushParams({ category: c })}
          >
            {categoryLabel(c)}
          </Button>
        ))}
      </div>
    </div>
  );
}
