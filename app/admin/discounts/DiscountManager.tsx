"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Discount, DiscountType } from "@/lib/supabase/types";
import { createDiscount, toggleDiscount } from "@/lib/actions/discounts";

export function DiscountManager({ discounts }: { discounts: Discount[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [code, setCode] = useState("");
  const [type, setType] = useState<DiscountType>("percentage");
  const [value, setValue] = useState("");
  const [minSubtotal, setMinSubtotal] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [oncePerCustomer, setOncePerCustomer] = useState(false);

  function create() {
    if (!code.trim()) return toast.error("Enter a code");
    if (type !== "free_shipping" && !value) return toast.error("Enter a value");
    start(async () => {
      const res = await createDiscount({
        code: code.trim(),
        type,
        value: type === "free_shipping" ? 0 : Number(value),
        appliesTo: "order",
        minSubtotal: minSubtotal ? Number(minSubtotal) : 0,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        oncePerCustomer,
      });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success(`Created ${code.toUpperCase()}`);
      setCode("");
      setValue("");
      setMinSubtotal("");
      setUsageLimit("");
      setOncePerCustomer(false);
      router.refresh();
    });
  }

  function toggle(d: Discount) {
    start(async () => {
      const res = await toggleDiscount({ discountId: d.id, isActive: !d.is_active });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 py-4">
          <h2 className="text-sm font-semibold">New discount</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SUMMER20"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => v && setType(v as DiscountType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage %</SelectItem>
                  <SelectItem value="fixed_amount">Fixed amount</SelectItem>
                  <SelectItem value="free_shipping">Free shipping</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="value">
                {type === "percentage" ? "Percent off" : type === "fixed_amount" ? "Amount off" : "—"}
              </Label>
              <Input
                id="value"
                type="number"
                min={0}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={type === "free_shipping"}
                placeholder={type === "percentage" ? "20" : "10"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="min">Min subtotal</Label>
              <Input
                id="min"
                type="number"
                min={0}
                value={minSubtotal}
                onChange={(e) => setMinSubtotal(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="limit">Usage limit</Label>
              <Input
                id="limit"
                type="number"
                min={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="∞"
              />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={oncePerCustomer}
                  onChange={(e) => setOncePerCustomer(e.target.checked)}
                  className="accent-[var(--primary)]"
                />
                Once per customer
              </label>
            </div>
          </div>
          <Button onClick={create} disabled={pending}>
            Create discount
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Min</TableHead>
                <TableHead>Used</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono font-medium">{d.code}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {d.type.replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    {d.type === "percentage"
                      ? `${d.value}%`
                      : d.type === "fixed_amount"
                        ? `$${Number(d.value).toFixed(2)}`
                        : "—"}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {Number(d.min_subtotal) > 0 ? `$${Number(d.min_subtotal).toFixed(2)}` : "—"}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {d.used_count}
                    {d.usage_limit ? ` / ${d.usage_limit}` : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    <button onClick={() => toggle(d)} disabled={pending}>
                      <Badge variant={d.is_active ? "default" : "secondary"} className="cursor-pointer">
                        {d.is_active ? "Active" : "Disabled"}
                      </Badge>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {discounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No discounts yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
