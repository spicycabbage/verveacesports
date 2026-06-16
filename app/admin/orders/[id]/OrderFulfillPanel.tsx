"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createFulfillment } from "@/lib/actions/fulfillment";

type Item = { id: string; name: string; remaining: number };

export function OrderFulfillPanel({
  orderId,
  remaining,
  items,
}: {
  orderId: string;
  remaining: number;
  items: Item[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [company, setCompany] = useState("");
  const [number, setNumber] = useState("");

  if (remaining <= 0) {
    return (
      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">
          All items fulfilled.
        </CardContent>
      </Card>
    );
  }

  function fulfillAll() {
    start(async () => {
      const res = await createFulfillment({
        orderId,
        trackingCompany: company || undefined,
        trackingNumber: number || undefined,
      });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("Fulfilled");
      setCompany("");
      setNumber("");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <h3 className="text-sm font-semibold">Fulfill order</h3>
        <ul className="space-y-0.5 text-sm text-muted-foreground">
          {items
            .filter((i) => i.remaining > 0)
            .map((i) => (
              <li key={i.id} className="flex justify-between gap-2">
                <span className="truncate">{i.name}</span>
                <span className="tabular-nums">×{i.remaining}</span>
              </li>
            ))}
        </ul>
        <div className="space-y-1.5">
          <Label htmlFor="company">Carrier</Label>
          <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="UPS" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tracking">Tracking #</Label>
          <Input id="tracking" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="1Z..." />
        </div>
        <Button onClick={fulfillAll} disabled={pending} className="w-full">
          Mark fulfilled & ship
        </Button>
      </CardContent>
    </Card>
  );
}
