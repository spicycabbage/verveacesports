"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function toInputDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

const PRESETS: { label: string; days: number }[] = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "1y", days: 365 },
];

export function FinanceDateRange({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback(
    (next: { from?: string; to?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.from) params.set("from", next.from);
      if (next.to) params.set("to", next.to);
      router.push(`/admin/finance?${params.toString()}`);
    },
    [router, searchParams],
  );

  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    update({ from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) });
  };

  return (
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
  );
}
