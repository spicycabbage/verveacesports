"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { SITES, type SiteId } from "@/lib/site/config";

const SITE_FILTERS: { id: SiteId | null; label: string }[] = [
  { id: null, label: "All properties" },
  { id: "verveace", label: SITES.verveace.name },
  { id: "bleeq-ca", label: SITES["bleeq-ca"].name },
];

export function ChatQuestionsToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const site = sp.get("site") ?? "";
  const qParam = sp.get("q") ?? "";
  const [q, setQ] = useState(qParam);

  useEffect(() => setQ(qParam), [qParam]);

  function pushParams(next: {
    site?: string | null;
    q?: string | null;
    page?: number;
  }) {
    const params = new URLSearchParams(sp.toString());
    if (next.site === null) params.delete("site");
    else if (next.site) params.set("site", next.site);
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
            placeholder="Search questions…"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
        {qParam ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => pushParams({ q: null })}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </form>
      <div className="flex flex-wrap items-center gap-2">
        {SITE_FILTERS.map((filter) => {
          const active = filter.id === null ? !site : site === filter.id;
          return (
            <Button
              key={filter.label}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              onClick={() =>
                pushParams({ site: filter.id === null ? null : filter.id })
              }
            >
              {filter.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
