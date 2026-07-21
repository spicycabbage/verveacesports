"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Discount, DiscountType } from "@/lib/supabase/types";
import { createDiscount, deleteDiscount, toggleDiscount } from "@/lib/actions/discounts";
import { formatDateOnly } from "@/lib/utils/format";
import {
  buildDiscountPayload,
  CouponFields,
  EditCouponDialog,
} from "./CouponFormFields";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CustomerUsageMode = "unlimited" | "once" | "limited";
type TotalUsageMode = "unlimited" | "limited";

type CouponFormState = {
  code: string;
  type: DiscountType;
  value: string;
  minSubtotal: string;
  totalUsageMode: TotalUsageMode;
  usageLimit: string;
  customerUsageMode: CustomerUsageMode;
  perCustomerLimit: string;
  startsAt: string;
  endsAt: string;
};

const emptyForm: CouponFormState = {
  code: "",
  type: "percentage",
  value: "",
  minSubtotal: "",
  totalUsageMode: "unlimited",
  usageLimit: "",
  customerUsageMode: "unlimited",
  perCustomerLimit: "",
  startsAt: "",
  endsAt: "",
};

function formatActiveRange(d: Discount): string {
  if (!d.starts_at && !d.ends_at) return "Always";
  const start = d.starts_at ? formatDateOnly(d.starts_at) : "—";
  const end = d.ends_at ? formatDateOnly(d.ends_at) : "—";
  return `${start} → ${end}`;
}

function formatCustomerLimit(d: Discount): string {
  if (d.once_per_customer) return "Once";
  if (d.per_customer_limit != null) return `${d.per_customer_limit}× / customer`;
  return "Unlimited";
}

export function DiscountManager({ discounts }: { discounts: Discount[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [tab, setTab] = useState<"create" | "in-use">("create");
  const [form, setForm] = useState(emptyForm);
  const [editTarget, setEditTarget] = useState<Discount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null);

  function patch<K extends keyof CouponFormState>(key: K, value: CouponFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function create() {
    if (!form.code.trim()) return toast.error("Enter a code");
    if (form.type !== "free_shipping" && !form.value) return toast.error("Enter a value");
    if (form.totalUsageMode === "limited" && !form.usageLimit) {
      return toast.error("Enter max total uses");
    }
    if (form.customerUsageMode === "limited" && !form.perCustomerLimit) {
      return toast.error("Enter max uses per customer");
    }

    start(async () => {
      const res = await createDiscount(buildDiscountPayload(form));
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success(`Created ${form.code.toUpperCase()}`);
      setForm(emptyForm);
      setTab("in-use");
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

  function confirmDelete() {
    if (!deleteTarget) return;
    start(async () => {
      const res = await deleteDiscount({ discountId: deleteTarget.id });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success(`Deleted ${deleteTarget.code}`);
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => v && setTab(v as "create" | "in-use")}>
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="in-use">
            In use
            {discounts.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 px-1.5 tabular-nums">
                {discounts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-4">
          <Card>
            <CardContent className="space-y-4 py-4">
              <CouponFields
                code={form.code}
                onCodeChange={(v) => patch("code", v)}
                type={form.type}
                onTypeChange={(v) => patch("type", v)}
                value={form.value}
                onValueChange={(v) => patch("value", v)}
                minSubtotal={form.minSubtotal}
                onMinSubtotalChange={(v) => patch("minSubtotal", v)}
                totalUsageMode={form.totalUsageMode}
                onTotalUsageModeChange={(v) => patch("totalUsageMode", v)}
                usageLimit={form.usageLimit}
                onUsageLimitChange={(v) => patch("usageLimit", v)}
                customerUsageMode={form.customerUsageMode}
                onCustomerUsageModeChange={(v) => patch("customerUsageMode", v)}
                perCustomerLimit={form.perCustomerLimit}
                onPerCustomerLimitChange={(v) => patch("perCustomerLimit", v)}
                startsAt={form.startsAt}
                onStartsAtChange={(v) => patch("startsAt", v)}
                endsAt={form.endsAt}
                onEndsAtChange={(v) => patch("endsAt", v)}
              />
              <p className="text-xs text-muted-foreground">
                Leave active dates empty for no time restriction. Checkout validates limits and dates
                server-side.
              </p>
              <Button onClick={create} disabled={pending}>
                Create coupon
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-use" className="mt-4">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Per customer</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                            : "Free ship"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatActiveRange(d)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {d.used_count}
                        {d.usage_limit ? ` / ${d.usage_limit}` : ""}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatCustomerLimit(d)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditTarget(d)}
                            disabled={pending}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(d)}
                            disabled={pending}
                          >
                            Delete
                          </Button>
                          <button type="button" onClick={() => toggle(d)} disabled={pending}>
                            <Badge
                              variant={d.is_active ? "default" : "secondary"}
                              className="cursor-pointer"
                            >
                              {d.is_active ? "Active" : "Off"}
                            </Badge>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {discounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        No coupons yet. Switch to Create to add one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditCouponDialog
        discount={editTarget}
        open={editTarget != null}
        onOpenChange={(open) => !open && setEditTarget(null)}
      />

      <Dialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.code}?</DialogTitle>
            <DialogDescription>
              This removes the coupon permanently. Existing orders are not affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={pending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
