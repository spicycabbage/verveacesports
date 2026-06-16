"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { moveInventory, setInventoryOnHand, updateVariantPrice } from "@/lib/actions/inventory";

type Props = {
  locationId: string;
  variant: {
    id: string;
    title: string;
    sku: string | null;
    options: string;
    priceUsd: number;
    priceCad: number;
    isActive: boolean;
  };
  level: { onHand: number; reserved: number; available: number };
};

export function VariantInventoryRow({ locationId, variant, level }: Props) {
  const [delta, setDelta] = useState("");
  const [count, setCount] = useState("");
  const [active, setActive] = useState(variant.isActive);
  const [pending, start] = useTransition();

  function receive() {
    const n = Number.parseInt(delta, 10);
    if (Number.isNaN(n) || n === 0) {
      toast.error("Enter a non-zero amount (use − to remove)");
      return;
    }
    start(async () => {
      const res = await moveInventory({
        variantId: variant.id,
        locationId,
        delta: n,
        reason: n > 0 ? "purchase" : "adjustment",
      });
      if ("error" in res) toast.error(res.error);
      else {
        toast.success(n > 0 ? `Received ${n}` : `Removed ${Math.abs(n)}`);
        setDelta("");
      }
    });
  }

  function setExact() {
    const n = Number.parseInt(count, 10);
    if (Number.isNaN(n) || n < 0) {
      toast.error("Count must be a non-negative integer");
      return;
    }
    start(async () => {
      const res = await setInventoryOnHand({ variantId: variant.id, locationId, onHand: n });
      if ("error" in res) toast.error(res.error);
      else {
        toast.success(`Set to ${n}`);
        setCount("");
      }
    });
  }

  function toggleActive() {
    const next = !active;
    setActive(next);
    start(async () => {
      const res = await updateVariantPrice({
        variantId: variant.id,
        priceUsd: variant.priceUsd,
        priceCad: variant.priceCad,
        isActive: next,
      });
      if ("error" in res) {
        setActive(!next);
        toast.error(res.error);
      } else toast.success(next ? "Variant active" : "Variant hidden");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 py-2 text-sm md:flex-nowrap">
      <div className="min-w-0 flex-1">
        <span className="font-medium">{variant.options || variant.title}</span>
        {variant.sku && (
          <span className="ml-2 font-mono text-xs text-muted-foreground">{variant.sku}</span>
        )}
      </div>

      <div className="flex items-center gap-3 tabular-nums">
        <Stat label="On hand" value={level.onHand} />
        <Stat label="Reserved" value={level.reserved} muted />
        <Badge variant={level.available <= 0 ? "destructive" : "outline"}>
          {level.available} avail
        </Badge>
      </div>

      <div className="flex items-center gap-1">
        <Input
          type="number"
          step={1}
          placeholder="+/−"
          className="w-20 tabular-nums"
          value={delta}
          onChange={(e) => setDelta(e.target.value)}
        />
        <Button size="sm" variant="secondary" onClick={receive} disabled={pending}>
          Apply
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={0}
          step={1}
          placeholder="set"
          className="w-20 tabular-nums"
          value={count}
          onChange={(e) => setCount(e.target.value)}
        />
        <Button size="sm" variant="outline" onClick={setExact} disabled={pending}>
          Set
        </Button>
      </div>

      <Button
        size="sm"
        variant={active ? "ghost" : "secondary"}
        onClick={toggleActive}
        disabled={pending}
      >
        {active ? "Active" : "Hidden"}
      </Button>
    </div>
  );
}

function Stat({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <span className={`flex flex-col items-center ${muted ? "text-muted-foreground" : ""}`}>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}
