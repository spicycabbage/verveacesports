import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sizedImageUrl } from "@/lib/images/cdn";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDate } from "@/lib/utils/format";
import type { Currency } from "@/lib/constants";
import { countryName } from "@/lib/constants";
import type { OrderStatus } from "@/lib/supabase/types";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const STATUS_VARIANTS: Record<OrderStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  paid: "default",
  shipped: "outline",
  delivered: "outline",
  cancelled: "destructive",
};

type Params = Promise<{ id: string }>;

export default async function OrderDetailPage({ params }: { params: Params }) {
  const { id } = await params;
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
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  const currency = order.currency as Currency;

  return (
    <div className="space-y-6">
      <Link
        href="/account/orders"
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        <ArrowLeft className="h-4 w-4" /> {dict.account.orders}
      </Link>
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
            </div>
            <Badge variant={STATUS_VARIANTS[order.status as OrderStatus]}>
              {statusLabel[order.status as OrderStatus]}
            </Badge>
          </div>
          <Separator />
          <div className="space-y-3">
            {(items ?? []).map((it) => (
              <div key={it.id} className="flex items-center gap-3">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-white">
                  {it.product_image && (
                    <Image
                      src={sizedImageUrl(it.product_image, 128)}
                      alt={it.product_name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{it.product_name}</p>
                  <p className="text-muted-foreground">
                    Qty {it.qty} · {formatPrice(Number(it.unit_price), currency)} each
                  </p>
                </div>
                <p className="text-sm font-medium tabular-nums">
                  {formatPrice(Number(it.unit_price) * it.qty, currency)}
                </p>
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-1 text-sm">
            <Row label={dict.checkout.subtotal} value={formatPrice(Number(order.subtotal), currency)} />
            <Row
              label={dict.checkout.shipping}
              value={
                Number(order.shipping) === 0
                  ? dict.checkout.free
                  : formatPrice(Number(order.shipping), currency)
              }
            />
            {Number(order.points_value) > 0 && (
              <Row
                label={`Points redeemed (${order.points_redeemed})`}
                value={`−${formatPrice(Number(order.points_value), currency)}`}
              />
            )}
            <Separator />
            <Row
              label={<strong>{dict.checkout.total}</strong>}
              value={<strong>{formatPrice(Number(order.total), currency)}</strong>}
            />
          </div>
          {order.shipping_address && (
            <>
              <Separator />
              <div className="text-sm">
                <h3 className="mb-1 font-semibold">{dict.checkout.shippingAddress}</h3>
                <ShippingAddress address={order.shipping_address} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function ShippingAddress({ address }: { address: Record<string, unknown> }) {
  const a = address as {
    full_name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  return (
    <p className="text-muted-foreground">
      {a.full_name}
      <br />
      {a.line1}
      {a.line2 ? `, ${a.line2}` : ""}
      <br />
      {a.city}, {a.state} {a.postal_code}
      <br />
      {countryName(a.country)}
    </p>
  );
}
