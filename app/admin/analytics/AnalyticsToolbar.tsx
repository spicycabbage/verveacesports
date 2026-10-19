"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { adminSiteFilters, type SiteId } from "@/lib/site/config";
import { addCalendarDays, pacificDateKey } from "@/lib/utils/format";

function toInputDate(iso: string): string {
  return pacificDateKey(iso);
}

const PRESETS: { label: string; days: number }[] = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "1y", days: 365 },
];

const SITE_FILTERS: { id: SiteId | null; label: string }[] = adminSiteFilters().map((f) => {
  if (f.id === null) return { ...f, label: "All" };
  if (f.id === "verveace") return { ...f, label: "Verveace" };
  if (f.id === "bleeq-ca") return { ...f, label: "BleeqUp" };
  return f;
});

export function AnalyticsToolbar({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const site = searchParams.get("site") ?? "";

  const tab = searchParams.get("tab") === "traffic" ? "traffic" : "sales";

  const update = useCallback(
    (next: { from?: string; to?: string; site?: string | null; tab?: "sales" | "traffic" }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.from) params.set("from", next.from);
      if (next.to) params.set("to", next.to);
      if (next.site === null) params.delete("site");
      else if (next.site) params.set("site", next.site);
      if (next.tab === "sales") params.delete("tab");
      else if (next.tab) params.set("tab", next.tab);
      router.push(`/admin/analytics?${params.toString()}`);
    },
    [router, searchParams],
  );

  const applyPreset = (days: number) => {
    const end = pacificDateKey(new Date());
    update({ from: addCalendarDays(end, -days), to: end });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={tab === "sales" ? "default" : "outline"}
          onClick={() => update({ tab: "sales" })}
        >
          Sales
        </Button>
        <Button
          type="button"
          variant={tab === "traffic" ? "default" : "outline"}
          onClick={() => update({ tab: "traffic" })}
        >
          Website traffic
        </Button>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="from" className="text-xs">
            From
          </Label>
          <input
            id="from"
            type="date"
            defaultValue={toInputDate(from)}
            onChange={(e) => update({ from: e.target.value })}
            className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to" className="text-xs">
            To
          </Label>
          <input
            id="to"
            type="date"
            defaultValue={toInputDate(to)}
            onChange={(e) => update({ to: e.target.value })}
            className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="flex gap-1">
          {PRESETS.map((p) => (
            <Button key={p.label} variant="outline" size="sm" onClick={() => applyPreset(p.days)}>
              {p.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {SITE_FILTERS.map((filter) => {
          const active = filter.id === null ? !site : site === filter.id;
          return (
            <Button
              key={filter.label}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              onClick={() => update({ site: filter.id === null ? null : filter.id })}
            >
              {filter.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
