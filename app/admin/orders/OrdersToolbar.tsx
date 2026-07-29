"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SITES, type SiteId } from "@/lib/site/config";

const SITE_FILTERS: { id: SiteId | null; label: string }[] = [
  { id: null, label: "All properties" },
  { id: "verveace", label: SITES.verveace.name },
  { id: "bleeq-ca", label: SITES["bleeq-ca"].name },
];

export function OrdersToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const site = sp.get("site") ?? "";

  function setSite(next: SiteId | null) {
    const params = new URLSearchParams(sp.toString());
    if (next) params.set("site", next);
    else params.delete("site");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {SITE_FILTERS.map((filter) => {
        const active = filter.id === null ? !site : site === filter.id;
        return (
          <Button
            key={filter.label}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            onClick={() => setSite(filter.id)}
          >
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}
