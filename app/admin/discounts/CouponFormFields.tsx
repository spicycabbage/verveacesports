"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { Discount, DiscountType } from "@/lib/supabase/types";
import { updateDiscount } from "@/lib/actions/discounts";
import { toDatetimeLocalValue } from "@/lib/admin/datetime";

type CustomerUsageMode = "unlimited" | "once" | "limited";

function customerModeFromDiscount(d: Discount): CustomerUsageMode {
  if (d.once_per_customer) return "once";
  if (d.per_customer_limit != null) return "limited";
  return "unlimited";
}

type CouponFieldsProps = {
  code: string;
  onCodeChange: (v: string) => void;
  type: DiscountType;
  onTypeChange: (v: DiscountType) => void;
  value: string;
  onValueChange: (v: string) => void;
  minSubtotal: string;
  onMinSubtotalChange: (v: string) => void;
  totalUsageMode: "unlimited" | "limited";
  onTotalUsageModeChange: (v: "unlimited" | "limited") => void;
  usageLimit: string;
  onUsageLimitChange: (v: string) => void;
  customerUsageMode: CustomerUsageMode;
  onCustomerUsageModeChange: (v: CustomerUsageMode) => void;
  perCustomerLimit: string;
  onPerCustomerLimitChange: (v: string) => void;
  startsAt: string;
  onStartsAtChange: (v: string) => void;
  endsAt: string;
  onEndsAtChange: (v: string) => void;
  codeDisabled?: boolean;
};

export function CouponFields({
  code,
  onCodeChange,
  type,
  onTypeChange,
  value,
  onValueChange,
  minSubtotal,
  onMinSubtotalChange,
  totalUsageMode,
  onTotalUsageModeChange,
  usageLimit,
  onUsageLimitChange,
  customerUsageMode,
  onCustomerUsageModeChange,
  perCustomerLimit,
  onPerCustomerLimitChange,
  startsAt,
  onStartsAtChange,
  endsAt,
  onEndsAtChange,
  codeDisabled,
}: CouponFieldsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-1.5">
        <Label htmlFor="coupon-code">Code</Label>
        <Input
          id="coupon-code"
          value={code}
          onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
          placeholder="SUMMER20"
          disabled={codeDisabled}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Type</Label>
        <Select value={type} onValueChange={(v) => v && onTypeChange(v as DiscountType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage off</SelectItem>
            <SelectItem value="fixed_amount">Fixed amount off</SelectItem>
            <SelectItem value="free_shipping">Free shipping</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="coupon-value">
          {type === "percentage" ? "Percent off" : type === "fixed_amount" ? "Amount off ($)" : "—"}
        </Label>
        <Input
          id="coupon-value"
          type="number"
          min={0}
          step={type === "percentage" ? 1 : 0.01}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={type === "free_shipping"}
          placeholder={type === "percentage" ? "20" : "10"}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="coupon-min">Min subtotal ($)</Label>
        <Input
          id="coupon-min"
          type="number"
          min={0}
          step={0.01}
          value={minSubtotal}
          onChange={(e) => onMinSubtotalChange(e.target.value)}
          placeholder="0"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Total redemptions</Label>
        <Select
          value={totalUsageMode}
          onValueChange={(v) => v && onTotalUsageModeChange(v as "unlimited" | "limited")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unlimited">Unlimited</SelectItem>
            <SelectItem value="limited">Limited total uses</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="coupon-usage-limit">Max total uses</Label>
        <Input
          id="coupon-usage-limit"
          type="number"
          min={1}
          value={usageLimit}
          onChange={(e) => onUsageLimitChange(e.target.value)}
          disabled={totalUsageMode === "unlimited"}
          placeholder="100"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Per customer</Label>
        <Select
          value={customerUsageMode}
          onValueChange={(v) => v && onCustomerUsageModeChange(v as CustomerUsageMode)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unlimited">Unlimited</SelectItem>
            <SelectItem value="once">Once per customer</SelectItem>
            <SelectItem value="limited">Limited uses per customer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="coupon-per-customer">Max uses per customer</Label>
        <Input
          id="coupon-per-customer"
          type="number"
          min={1}
          value={perCustomerLimit}
          onChange={(e) => onPerCustomerLimitChange(e.target.value)}
          disabled={customerUsageMode !== "limited"}
          placeholder="3"
        />
      </div>
      <div className="col-span-full grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="coupon-starts">Active from</Label>
          <Input
            id="coupon-starts"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => onStartsAtChange(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="coupon-ends">Active until</Label>
          <Input
            id="coupon-ends"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => onEndsAtChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export function discountToFormState(d: Discount) {
  return {
    code: d.code,
    type: d.type,
    value: d.type === "free_shipping" ? "" : String(d.value),
    minSubtotal: Number(d.min_subtotal) > 0 ? String(d.min_subtotal) : "",
    totalUsageMode: d.usage_limit != null ? ("limited" as const) : ("unlimited" as const),
    usageLimit: d.usage_limit != null ? String(d.usage_limit) : "",
    customerUsageMode: customerModeFromDiscount(d),
    perCustomerLimit: d.per_customer_limit != null ? String(d.per_customer_limit) : "",
    startsAt: toDatetimeLocalValue(d.starts_at),
    endsAt: toDatetimeLocalValue(d.ends_at),
  };
}

export function buildDiscountPayload(
  form: ReturnType<typeof discountToFormState>,
  discountId?: string,
) {
  const oncePerCustomer = form.customerUsageMode === "once";
  const perCustomerLimit =
    form.customerUsageMode === "limited" && form.perCustomerLimit
      ? Number(form.perCustomerLimit)
      : undefined;

  return {
    ...(discountId ? { discountId } : {}),
    code: form.code.trim(),
    type: form.type,
    value: form.type === "free_shipping" ? 0 : Number(form.value),
    appliesTo: "order" as const,
    minSubtotal: form.minSubtotal ? Number(form.minSubtotal) : 0,
    usageLimit:
      form.totalUsageMode === "limited" && form.usageLimit
        ? Number(form.usageLimit)
        : undefined,
    oncePerCustomer,
    perCustomerLimit,
    startsAt: form.startsAt || undefined,
    endsAt: form.endsAt || undefined,
  };
}

export function EditCouponDialog({
  discount,
  open,
  onOpenChange,
}: {
  discount: Discount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState(() =>
    discount ? discountToFormState(discount) : discountToFormState(emptyDiscount()),
  );

  useEffect(() => {
    if (discount && open) setForm(discountToFormState(discount));
  }, [discount, open]);

  function patch<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function save() {
    if (!discount) return;
    if (!form.code.trim()) return toast.error("Enter a code");
    if (form.type !== "free_shipping" && !form.value) return toast.error("Enter a value");
    if (form.totalUsageMode === "limited" && !form.usageLimit) {
      return toast.error("Enter max total uses");
    }
    if (form.customerUsageMode === "limited" && !form.perCustomerLimit) {
      return toast.error("Enter max uses per customer");
    }

    start(async () => {
      const res = await updateDiscount({
        ...buildDiscountPayload(form, discount.id),
        discountId: discount.id,
      });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success(`Updated ${form.code}`);
      onOpenChange(false);
      router.refresh();
    });
  }

  if (!discount) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit coupon</DialogTitle>
          <DialogDescription>
            {discount.used_count} redemption{discount.used_count === 1 ? "" : "s"} so far.
          </DialogDescription>
        </DialogHeader>
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={save} disabled={pending}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function emptyDiscount(): Discount {
  return {
    id: "",
    code: "",
    type: "percentage",
    value: 0,
    applies_to: "order",
    min_subtotal: 0,
    usage_limit: null,
    used_count: 0,
    per_customer_limit: null,
    once_per_customer: false,
    starts_at: null,
    ends_at: null,
    is_active: true,
    created_at: "",
  };
}
