import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, formatDate } from "@/lib/utils/format";
import { COUNTRIES } from "@/lib/constants";
import type { Order, OrderStatus } from "@/lib/supabase/types";
import type { Currency } from "@/lib/constants";
import Link from "next/link";

export const metadata = { title: "Admin overview" };

const STATUS_VARIANTS: Record<OrderStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  paid: "default",
  shipped: "outline",
  delivered: "outline",
  cancelled: "destructive",
};

// Crude FX for USD-equivalent display only (admin reporting).
const TO_USD = { USD: 1, CAD: 0.74 } as const;

export default async function AdminOverviewPage() {
  const supabase = await createSupabaseServerClient();

  const { data: paidOrders } = await supabase
    .from("orders")
    .select("currency, country, total")
    .eq("status", "paid");
  const orders = (paidOrders ?? []) as Pick<Order, "currency" | "country" | "total">[];

  let totalUsdEq = 0;
  const byCurrency: Record<Currency, number> = { USD: 0, CAD: 0 };
  const byCountry: Record<"US" | "CA", number> = { US: 0, CA: 0 };
  for (const o of orders) {
    const cur = o.currency as Currency;
    const country = o.country as "US" | "CA";
    const total = Number(o.total);
    byCurrency[cur] += total;
    byCountry[country] += total;
    totalUsdEq += total * TO_USD[cur];
  }

  const { data: recent } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  const { count: paidCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "paid");

  const { count: customerCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales overview</h1>
        <p className="text-sm text-muted-foreground">
          Across both currencies, paid orders only.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Revenue (USD-eq)"
          value={formatPrice(totalUsdEq, "USD")}
          hint="USD + CAD ≈ 0.74"
        />
        <KpiCard label="USD revenue" value={formatPrice(byCurrency.USD, "USD")} />
        <KpiCard label="CAD revenue" value={formatPrice(byCurrency.CAD, "CAD")} />
        <KpiCard
          label="Paid orders"
          value={String(paidCount ?? 0)}
          hint={`${customerCount ?? 0} customers`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By country</CardTitle>
            <CardDescription>Native-currency totals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row
              label={`${COUNTRIES.US.flag} United States`}
              value={formatPrice(byCountry.US, "USD")}
            />
            <Row
              label={`${COUNTRIES.CA.flag} Canada`}
              value={formatPrice(byCountry.CA, "CAD")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Link href="/admin/orders" className="block hover:underline">
              View all orders →
            </Link>
            <Link href="/admin/catalog" className="block hover:underline">
              Edit catalog (descriptions & images) →
            </Link>
            <Link href="/products" className="block hover:underline">
              Browse storefront →
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(recent ?? []).map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">
                    #{o.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(o.created_at)}
                  </TableCell>
                  <TableCell>{o.country}</TableCell>
                  <TableCell>
                    <Badge
                      variant={STATUS_VARIANTS[o.status as OrderStatus]}
                      className="capitalize"
                    >
                      {o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPrice(Number(o.total), o.currency as Currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
    <Card>
      <CardHeader className="space-y-0 pb-2">
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
