import { Suspense } from "react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, formatDate } from "@/lib/utils/format";
import type { Order, FinancialStatus, OrderFulfillmentStatus } from "@/lib/supabase/types";
import type { Currency } from "@/lib/constants";
import { countryName } from "@/lib/constants";
import { SITES, type SiteId } from "@/lib/site/config";
import { OrdersToolbar } from "./OrdersToolbar";

export const metadata = { title: "Admin · Orders" };

type SearchParams = Promise<{ site?: string }>;

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

function isSiteId(value: string | undefined): value is SiteId {
  return value === "verveace" || value === "bleeq-ca";
}

function siteLabel(siteId: SiteId): string {
  return SITES[siteId].name;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const site = isSiteId(sp.site) ? sp.site : undefined;

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (site) query = query.eq("site_id", site);

  const { data, error } = await query;
  const orders = (data ?? []) as Order[];
  const loadError = error?.message;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All orders</h1>
        <p className="text-sm text-muted-foreground">
          Orders across both storefront properties.
        </p>
      </div>

      <Suspense fallback={<div className="h-9 animate-pulse rounded-lg bg-muted" />}>
        <OrdersToolbar />
      </Suspense>

      {loadError ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            Could not load orders: {loadError}
            {loadError.includes("site_id")
              ? " — apply migration 0033_orders_site_id.sql in Supabase."
              : null}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Fulfillment</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => {
                  const orderSite = isSiteId(o.site_id) ? o.site_id : "verveace";
                  return (
                    <TableRow key={o.id}>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-mono text-xs text-primary underline-offset-2 hover:underline"
                        >
                          #{o.id.slice(0, 8).toUpperCase()}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(o.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={orderSite === "bleeq-ca" ? "secondary" : "default"}>
                          {siteLabel(orderSite)}
                        </Badge>
                      </TableCell>
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
                      <TableCell>{countryName(o.country)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPrice(Number(o.total), o.currency as Currency)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      {site ? "No orders for this property." : "No orders yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
