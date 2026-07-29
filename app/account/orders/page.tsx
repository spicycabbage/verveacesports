import Link from "next/link";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, formatDateOnly } from "@/lib/utils/format";
import type { Currency } from "@/lib/constants";
import type { Order, OrderStatus } from "@/lib/supabase/types";
import { buttonVariants } from "@/components/ui/button";
import { Package } from "lucide-react";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  return { title: dict.account.ordersTitle };
}

const STATUS_VARIANTS: Record<OrderStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  paid: "default",
  shipped: "outline",
  delivered: "outline",
  cancelled: "destructive",
};

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const statusLabel: Record<OrderStatus, string> = {
    pending: dict.account.status_pending,
    paid: dict.account.status_paid,
    shipped: dict.account.status_shipped,
    delivered: dict.account.status_delivered,
    cancelled: dict.account.status_cancelled,
  };
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
          <h2 className="text-lg font-semibold">{dict.account.noOrders}</h2>
          <Link href="/products" className={buttonVariants({})}>
            {dict.account.startShopping}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y md:hidden">
          {orders.map((o) => (
            <div key={o.id} className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">{formatDateOnly(o.created_at)}</p>
                </div>
                <Badge variant={STATUS_VARIANTS[o.status]} className="shrink-0">
                  {statusLabel[o.status]}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-semibold tabular-nums">
                  {formatPrice(Number(o.total), o.currency as Currency)}
                </span>
                <Link
                  href={`/account/orders/${o.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {dict.account.view} →
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.account.order}</TableHead>
                <TableHead>{dict.account.date}</TableHead>
                <TableHead>{dict.account.status}</TableHead>
                <TableHead className="text-right">{dict.account.total}</TableHead>
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
                    <Badge variant={STATUS_VARIANTS[o.status]}>
                      {statusLabel[o.status]}
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
                      {dict.account.view} →
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
