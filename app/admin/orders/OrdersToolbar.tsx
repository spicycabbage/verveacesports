"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminSiteFilters, type SiteId } from "@/lib/site/config";
import {
  FULFILLMENT_FILTERS,
  isFulfillmentFilter,
  type FulfillmentFilter,
} from "@/lib/orders/status-label";

const SITE_FILTERS = adminSiteFilters();

export function OrdersToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const site = sp.get("site") ?? "";
  const raw = sp.get("fulfillment") ?? "all";
  const fulfillment: FulfillmentFilter = isFulfillmentFilter(raw) ? raw : "all";

  function pushParams(next: { site?: SiteId | null; fulfillment?: FulfillmentFilter }) {
    const params = new URLSearchParams(sp.toString());
    if (next.site !== undefined) {
      if (next.site) params.set("site", next.site);
      else params.delete("site");
    }
    if (next.fulfillment !== undefined) {
      if (next.fulfillment !== "all") params.set("fulfillment", next.fulfillment);
      else params.delete("fulfillment");
    }
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
            onClick={() => pushParams({ site: filter.id })}
          >
            {filter.label}
          </Button>
        );
      })}
      <Select
        value={fulfillment}
        onValueChange={(value) => {
          if (!value) return;
          pushParams({ fulfillment: value as FulfillmentFilter });
        }}
      >
        <SelectTrigger size="sm" className="ml-auto h-8" aria-label="Fulfillment">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {FULFILLMENT_FILTERS.map((filter) => (
            <SelectItem key={filter.id} value={filter.id}>
              {filter.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
