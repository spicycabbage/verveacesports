import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, formatDate } from "@/lib/utils/format";
import { COUNTRIES, countryName } from "@/lib/constants";
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

export default async function AdminOverviewPage() {
  const supabase = await createSupabaseServerClient();

  const { data: paidOrders } = await supabase
    .from("orders")
    .select("currency, country, total")
    .eq("status", "paid");
  const orders = (paidOrders ?? []) as Pick<Order, "currency" | "country" | "total">[];

  const byCurrency: Record<Currency, number> = { USD: 0, CAD: 0 };
  const byCountry: Record<"US" | "CA", number> = { US: 0, CA: 0 };
  for (const o of orders) {
    const cur = o.currency as Currency;
    const country = o.country as "US" | "CA";
    const total = Number(o.total);
    byCurrency[cur] += total;
    byCountry[country] += total;
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              label="United States"
              value={formatPrice(byCountry.US, "USD")}
            />
            <Row
              label="Canada"
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
            <Link href="/admin/finance" className="block hover:underline">
              Finance reports →
            </Link>
            <Link href="/admin/products" className="block hover:underline">
              Manage products & inventory →
            </Link>
            <Link href="/admin/discounts" className="block hover:underline">
              Manage coupons →
            </Link>
            <Link href="/admin/shipping" className="block hover:underline">
              Shipping fees →
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
          <div className="divide-y md:hidden">
            {(recent ?? []).map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between gap-2 p-4 hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                  <p className="text-xs text-muted-foreground">{countryName(o.country)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <Badge
                    variant={STATUS_VARIANTS[o.status as OrderStatus]}
                    className="mb-1 capitalize"
                  >
                    {o.status}
                  </Badge>
                  <p className="text-sm font-medium tabular-nums">
                    {formatPrice(Number(o.total), o.currency as Currency)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="hidden md:block">
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
                  <TableCell>{countryName(o.country)}</TableCell>
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
          </div>
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
