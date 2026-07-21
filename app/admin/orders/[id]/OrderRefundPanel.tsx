"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils/format";
import type { Currency } from "@/lib/constants";
import { refundOrder } from "@/lib/actions/refunds";

type Reason = "requested_by_customer" | "duplicate" | "fraudulent" | "other";

type RefundLine = {
  id: string;
  name: string;
  unitPrice: number;
  refundableQty: number;
};

export function OrderRefundPanel({
  orderId,
  currency,
  refundable,
  isPaid,
  lines,
}: {
  orderId: string;
  currency: Currency;
  refundable: number;
  isPaid: boolean;
  lines: RefundLine[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [includeTax, setIncludeTax] = useState(true);
  const [includeShipping, setIncludeShipping] = useState(false);
  const [clawbackLoyalty, setClawbackLoyalty] = useState(true);
  const [reason, setReason] = useState<Reason>("requested_by_customer");
  const [restock, setRestock] = useState(true);

  const selectedLines = useMemo(
    () =>
      lines
        .map((l) => ({ orderItemId: l.id, qty: qtys[l.id] ?? 0 }))
        .filter((l) => l.qty > 0),
    [lines, qtys],
  );

  const lineMerchandise = useMemo(
    () =>
      selectedLines.reduce((sum, sel) => {
        const line = lines.find((l) => l.id === sel.orderItemId);
        return sum + (line ? line.unitPrice * sel.qty : 0);
      }, 0),
    [selectedLines, lines],
  );

  if (!isPaid || refundable <= 0) {
    return (
      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">
          {isPaid ? "Fully refunded." : "Nothing to refund yet."}
        </CardContent>
      </Card>
    );
  }

  const hasLines = lines.length > 0;

  function setQty(id: string, value: number, max: number) {
    const clamped = Math.max(0, Math.min(value, max));
    setQtys((prev) => ({ ...prev, [id]: clamped }));
  }

  function submit() {
    start(async () => {
      const res = await refundOrder({
        orderId,
        lines: hasLines && selectedLines.length > 0 ? selectedLines : undefined,
        includeTax,
        includeShipping,
        clawbackLoyalty,
        reason,
        restock,
      });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success(`Refunded ${formatPrice(res.amount, currency)}`);
      setQtys({});
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <h3 className="text-sm font-semibold">Refund</h3>
        <p className="text-xs text-muted-foreground">
          Up to {formatPrice(refundable, currency)} refundable.
        </p>

        {hasLines && (
          <div className="space-y-2">
            <Label className="text-xs">Items</Label>
            {lines.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{l.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(l.unitPrice, currency)} · {l.refundableQty} refundable
                  </p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={l.refundableQty}
                  disabled={l.refundableQty === 0}
                  value={qtys[l.id] ?? 0}
                  onChange={(e) => setQty(l.id, Number(e.target.value), l.refundableQty)}
                  className="h-9 w-16 rounded-lg border border-input bg-transparent px-2 text-right text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40"
                />
              </div>
            ))}
            {lineMerchandise > 0 && (
              <p className="text-xs text-muted-foreground">
                Merchandise selected: {formatPrice(lineMerchandise, currency)} (tax/shipping added
                per options below)
              </p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Reason</Label>
          <Select value={reason} onValueChange={(v) => v && setReason(v as Reason)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="requested_by_customer">Requested by customer</SelectItem>
              <SelectItem value="duplicate">Duplicate</SelectItem>
              <SelectItem value="fraudulent">Fraudulent</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          {hasLines && (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeTax}
                  onChange={(e) => setIncludeTax(e.target.checked)}
                  className="accent-[var(--primary)]"
                />
                Include proportional tax
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeShipping}
                  onChange={(e) => setIncludeShipping(e.target.checked)}
                  className="accent-[var(--primary)]"
                />
                Include shipping
              </label>
            </>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={clawbackLoyalty}
              onChange={(e) => setClawbackLoyalty(e.target.checked)}
              className="accent-[var(--primary)]"
            />
            Claw back earned loyalty points
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={restock}
              onChange={(e) => setRestock(e.target.checked)}
              className="accent-[var(--primary)]"
            />
            Restock items
          </label>
        </div>

        <Button onClick={submit} disabled={pending} variant="destructive" className="w-full">
          {hasLines && selectedLines.length > 0
            ? "Refund selected items"
            : `Refund full ${formatPrice(refundable, currency)}`}
        </Button>
        {hasLines && selectedLines.length === 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Select item quantities, or leave blank to refund the full remaining balance.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
