import { Suspense } from "react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, formatDate } from "@/lib/utils/format";
import type { Order } from "@/lib/supabase/types";
import { countryName } from "@/lib/constants";
import { adminPropertyLabel, isSiteId, type SiteId } from "@/lib/site/config";
import { OrdersToolbar } from "./OrdersToolbar";
import { Printer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  adminFulfillmentLabel,
  isFulfillmentFilter,
  needsFulfillment,
} from "@/lib/orders/status-label";
import { requireAdminPage } from "@/lib/auth/admin";
import { formatOrderNumber } from "@/lib/orders/number";
import { resolveOrderSiteId } from "@/lib/orders/send-order-email";
import { cn } from "@/lib/utils";

export const metadata = { title: "Admin · Orders" };

type SearchParams = Promise<{ site?: string; fulfillment?: string }>;

function siteLabel(siteId: SiteId): string {
  return adminPropertyLabel(siteId);
}

function asNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminPage();
  const sp = await searchParams;
  const site = isSiteId(sp.site) ? sp.site : undefined;
  const fulfillment = isFulfillmentFilter(sp.fulfillment) ? sp.fulfillment : undefined;

  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (site) query = query.eq("site_id", site);
  if (fulfillment === "unfulfilled") {
    query = query
      .in("fulfillment_status", ["unfulfilled", "partially_fulfilled"])
      .in("financial_status", ["paid", "partially_refunded"]);
  } else if (fulfillment === "shipped") {
    query = query.eq("fulfillment_status", "fulfilled").neq("sales_channel", "pos");
  } else if (fulfillment === "pos") {
    query = query
      .eq("sales_channel", "pos")
      .in("financial_status", ["paid", "partially_refunded"]);
  }

  const [{ data, error }, { data: paidRows, count: paidCount }, { count: customerCount }] =
    await Promise.all([
      query,
      admin
        .from("orders")
        .select("total, refunded_total", { count: "exact" })
        .in("financial_status", ["paid", "partially_refunded"])
        .eq("currency", "CAD"),
      admin.from("profiles").select("id", { count: "exact", head: true }),
    ]);
  const orders = (data ?? []) as Order[];
  const loadError = error?.message;
  const cadRevenue = (paidRows ?? []).reduce((sum, row) => {
    return sum + asNumber(row.total) - asNumber(row.refunded_total);
  }, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">All orders</h1>

      <div className="grid gap-3 sm:grid-cols-2">
        <KpiCard label="Revenue" value={formatPrice(cadRevenue)} />
        <KpiCard
          label="Paid orders"
          value={String(paidCount ?? 0)}
          hint={`${customerCount ?? 0} customers`}
        />
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
                  const orderSite = resolveOrderSiteId(o);
                  const fulfillment = adminFulfillmentLabel(
                    o.fulfillment_status,
                    o.sales_channel,
                    o.financial_status,
                  );
                  const openFulfillment = needsFulfillment(
                    o.fulfillment_status,
                    o.financial_status,
                  );
                  return (
                    <TableRow key={o.id}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="font-mono text-xs text-foreground underline-offset-2 hover:underline"
                          >
                            {formatOrderNumber(o)}
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
                      <TableCell>
                        {openFulfillment ? (
                          <Badge variant="warning" className="capitalize">
                            {fulfillment}
                          </Badge>
                        ) : (
                          <span className="capitalize text-muted-foreground">{fulfillment}</span>
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
                      {site || fulfillment
                        ? "No orders match these filters."
                        : "No orders yet."}
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

function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card size="sm" className="gap-0 py-2">
      <CardContent className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
        </div>
        <p className="text-lg font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
