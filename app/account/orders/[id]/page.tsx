import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDate } from "@/lib/utils/format";
import type { Currency } from "@/lib/constants";
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
        <ArrowLeft className="h-4 w-4" /> All orders
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
            <Badge variant={STATUS_VARIANTS[order.status as OrderStatus]} className="capitalize">
              {order.status}
            </Badge>
          </div>
          <Separator />
          <div className="space-y-3">
            {(items ?? []).map((it) => (
              <div key={it.id} className="flex items-center gap-3">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                  {it.product_image && (
                    <Image
                      src={it.product_image}
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
            <Row label="Subtotal" value={formatPrice(Number(order.subtotal), currency)} />
            <Row
              label="Shipping"
              value={
                Number(order.shipping) === 0
                  ? "FREE"
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
              label={<strong>Total</strong>}
              value={<strong>{formatPrice(Number(order.total), currency)}</strong>}
            />
          </div>
          {order.shipping_address && (
            <>
              <Separator />
              <div className="text-sm">
                <h3 className="mb-1 font-semibold">Shipping address</h3>
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
      {a.country}
    </p>
  );
}
