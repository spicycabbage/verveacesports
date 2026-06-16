"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export function OrderRefundPanel({
  orderId,
  currency,
  refundable,
  isPaid,
}: {
  orderId: string;
  currency: Currency;
  refundable: number;
  isPaid: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState<Reason>("requested_by_customer");
  const [restock, setRestock] = useState(true);

  if (!isPaid || refundable <= 0) {
    return (
      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">
          {isPaid ? "Fully refunded." : "Nothing to refund yet."}
        </CardContent>
      </Card>
    );
  }

  function submit() {
    const amt = amount ? Number(amount) : undefined;
    if (amt !== undefined && (Number.isNaN(amt) || amt <= 0)) {
      return toast.error("Enter a valid amount");
    }
    start(async () => {
      const res = await refundOrder({ orderId, amount: amt, reason, restock });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("Refund issued");
      setAmount("");
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
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount (blank = full)</Label>
          <Input
            id="amount"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={refundable.toFixed(2)}
          />
        </div>
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
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={restock}
            onChange={(e) => setRestock(e.target.checked)}
            className="accent-[var(--primary)]"
          />
          Restock items
        </label>
        <Button onClick={submit} disabled={pending} variant="destructive" className="w-full">
          Issue refund
        </Button>
      </CardContent>
    </Card>
  );
}
