import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, formatDate } from "@/lib/utils/format";
import type { Order, FinancialStatus, OrderFulfillmentStatus } from "@/lib/supabase/types";
import type { Currency } from "@/lib/constants";

export const metadata = { title: "Admin · Orders" };

const FIN_VARIANTS: Record<FinancialStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  authorized: "outline",
  paid: "default",
  partially_refunded: "outline",
  refunded: "destructive",
  voided: "destructive",
};

const FUL_VARIANTS: Record<OrderFulfillmentStatus, "default" | "secondary" | "outline"> = {
  unfulfilled: "secondary",
  partially_fulfilled: "outline",
  fulfilled: "default",
  restocked: "outline",
};

export default async function AdminOrdersPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const orders = (data ?? []) as Order[];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">All orders</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-mono text-xs text-primary underline-offset-2 hover:underline"
                    >
                      #{o.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(o.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={FIN_VARIANTS[o.financial_status]} className="capitalize">
                      {o.financial_status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={FUL_VARIANTS[o.fulfillment_status]} className="capitalize">
                      {o.fulfillment_status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{o.country}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPrice(Number(o.total), o.currency as Currency)}
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No orders yet.
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
