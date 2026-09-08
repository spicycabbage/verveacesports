import { Suspense } from "react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, formatDate } from "@/lib/utils/format";
import type { Order } from "@/lib/supabase/types";
import { countryName } from "@/lib/constants";
import { SITES, type SiteId } from "@/lib/site/config";
import { OrdersToolbar } from "./OrdersToolbar";
import { Printer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { adminFulfillmentLabel } from "@/lib/orders/status-label";
import { requireAdminPage } from "@/lib/auth/admin";
import { cn } from "@/lib/utils";

export const metadata = { title: "Admin · Orders" };

type SearchParams = Promise<{ site?: string }>;

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
  await requireAdminPage();
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
                  <TableHead className="w-[72px] text-right">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => {
                  const orderSite = isSiteId(o.site_id) ? o.site_id : "verveace";
                  return (
                    <TableRow key={o.id}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="font-mono text-xs text-primary underline-offset-2 hover:underline"
                          >
                            #{o.id.slice(0, 8).toUpperCase()}
                          </Link>
                          {o.sales_channel === "pos" ? (
                            <span className="text-xs text-muted-foreground">POS</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(o.created_at)}
                      </TableCell>
                      <TableCell>{siteLabel(orderSite)}</TableCell>
                      <TableCell
                        className={cn(
                          "capitalize",
                          (o.financial_status === "voided" || o.financial_status === "refunded") &&
                            "text-destructive",
                        )}
                      >
                        {o.financial_status.replace("_", " ")}
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground">
                        {adminFulfillmentLabel(
                          o.fulfillment_status,
                          o.sales_channel,
                          o.financial_status,
                        )}
                      </TableCell>
                      <TableCell>{countryName(o.country)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPrice(Number(o.total))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/admin/orders/${o.id}/invoice`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                          title="Print invoice"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Print
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
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
