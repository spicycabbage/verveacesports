"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/lib/actions/admin";
import type { OrderStatus } from "@/lib/supabase/types";

const STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [pending, start] = useTransition();
  return (
    <Select
      value={status}
      onValueChange={(v) => {
        if (!v) return;
        start(async () => {
          const res = await updateOrderStatus({ orderId, status: v as OrderStatus });
          if (res?.error) toast.error(res.error);
          else toast.success(`Marked ${v}`);
        });
      }}
      disabled={pending}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s} className="capitalize">
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
