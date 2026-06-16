import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, formatDateOnly } from "@/lib/utils/format";
import type { Currency } from "@/lib/constants";
import type { Order, OrderStatus } from "@/lib/supabase/types";
import { buttonVariants } from "@/components/ui/button";
import { Package } from "lucide-react";

export const metadata = { title: "My orders" };

const STATUS_VARIANTS: Record<OrderStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  paid: "default",
  shipped: "outline",
  delivered: "outline",
  cancelled: "destructive",
};

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as Order[];

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="grid place-items-center gap-3 py-20 text-center">
          <Package className="h-10 w-10 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold">No orders yet</h2>
          <Link href="/products" className={buttonVariants({})}>
            Start shopping
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[1%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">
                  #{o.id.slice(0, 8).toUpperCase()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateOnly(o.created_at)}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANTS[o.status]} className="capitalize">
                    {o.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatPrice(Number(o.total), o.currency as Currency)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/account/orders/${o.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View →
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
