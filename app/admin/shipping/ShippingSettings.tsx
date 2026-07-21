"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ShippingRateWithZone } from "@/lib/supabase/types";
import { updateShippingRate } from "@/lib/actions/shipping";

type RateForm = {
  name: string;
  priceUsd: string;
  priceCad: string;
  freeOver: string;
  isActive: boolean;
};

function rateToForm(rate: ShippingRateWithZone): RateForm {
  return {
    name: rate.name,
    priceUsd: String(rate.price_usd),
    priceCad: String(rate.price_cad),
    freeOver: rate.free_over != null ? String(rate.free_over) : "",
    isActive: rate.is_active,
  };
}

function RateEditor({ rate }: { rate: ShippingRateWithZone }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState(() => rateToForm(rate));

  const countries = rate.shipping_zones.countries.join(", ");

  function save() {
    if (!form.name.trim()) return toast.error("Enter a rate name");
    start(async () => {
      const res = await updateShippingRate({
        rateId: rate.id,
        name: form.name.trim(),
        priceUsd: Number(form.priceUsd),
        priceCad: Number(form.priceCad),
        freeOver: form.freeOver.trim() ? Number(form.freeOver) : null,
        isActive: form.isActive,
      });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("Shipping rate updated");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{rate.shipping_zones.name}</CardTitle>
            <CardDescription>
              Ships to {countries || "—"} · {rate.name}
            </CardDescription>
          </div>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
            disabled={pending}
          >
            <Badge variant={form.isActive ? "default" : "secondary"} className="cursor-pointer">
              {form.isActive ? "Active" : "Disabled"}
            </Badge>
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label htmlFor={`rate-name-${rate.id}`}>Rate name</Label>
            <Input
              id={`rate-name-${rate.id}`}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`rate-usd-${rate.id}`}>USD shipping fee</Label>
            <Input
              id={`rate-usd-${rate.id}`}
              type="number"
              min={0}
              step={0.01}
              value={form.priceUsd}
              onChange={(e) => setForm((f) => ({ ...f, priceUsd: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`rate-cad-${rate.id}`}>CAD shipping fee</Label>
            <Input
              id={`rate-cad-${rate.id}`}
              type="number"
              min={0}
              step={0.01}
              value={form.priceCad}
              onChange={(e) => setForm((f) => ({ ...f, priceCad: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label htmlFor={`rate-free-${rate.id}`}>Free shipping over</Label>
            <Input
              id={`rate-free-${rate.id}`}
              type="number"
              min={0}
              step={0.01}
              value={form.freeOver}
              onChange={(e) => setForm((f) => ({ ...f, freeOver: e.target.value }))}
              placeholder="Leave empty for none"
            />
          </div>
        </div>
        <Button onClick={save} disabled={pending} size="sm">
          Save shipping rate
        </Button>
      </CardContent>
    </Card>
  );
}

export function ShippingSettings({ rates }: { rates: ShippingRateWithZone[] }) {
  return (
    <div className="space-y-4">
      {rates.map((rate) => (
        <RateEditor key={rate.id} rate={rate} />
      ))}
      {rates.length === 0 && (
        <p className="text-sm text-muted-foreground">No shipping rates configured.</p>
      )}
    </div>
  );
}
