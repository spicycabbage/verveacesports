import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils/format";
import type { Currency } from "@/lib/constants";
import type {
  Order,
  OrderItem,
  Payment,
  Refund,
  Fulfillment,
  FinancialStatus,
  OrderFulfillmentStatus,
} from "@/lib/supabase/types";
import { OrderFulfillPanel } from "./OrderFulfillPanel";
import { OrderRefundPanel } from "./OrderRefundPanel";

export const metadata = { title: "Admin · Order" };

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

type Params = Promise<{ id: string }>;

export default async function AdminOrderDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { data: orderData } = await admin.from("orders").select("*").eq("id", id).single();
  if (!orderData) notFound();
  const order = orderData as Order;
  const currency = order.currency as Currency;

  const [{ data: itemsData }, { data: paymentsData }, { data: refundsData }, { data: fulfillmentsData }] =
    await Promise.all([
      admin.from("order_items").select("*").eq("order_id", id),
      admin.from("payments").select("*").eq("order_id", id).order("created_at"),
      admin.from("refunds").select("*").eq("order_id", id).order("created_at"),
      admin.from("fulfillments").select("*").eq("order_id", id).order("created_at"),
    ]);

  const items = (itemsData ?? []) as OrderItem[];
  const payments = (paymentsData ?? []) as Payment[];
  const refunds = (refundsData ?? []) as Refund[];
  const fulfillments = (fulfillmentsData ?? []) as Fulfillment[];

  const remainingToFulfill = items.reduce((s, it) => s + (it.qty - it.fulfilled_qty), 0);
  const refundedTotal = Number(order.refunded_total) || 0;
  const refundable = Math.max(0, Number(order.total) - refundedTotal);

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="space-y-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </h1>
                  <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                  {order.email && <p className="text-sm text-muted-foreground">{order.email}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={FIN_VARIANTS[order.financial_status]} className="capitalize">
                    {order.financial_status.replace("_", " ")}
                  </Badge>
                  <Badge variant={FUL_VARIANTS[order.fulfillment_status]} className="capitalize">
                    {order.fulfillment_status.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <Separator />
              <div className="space-y-3">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium">{it.product_name}</p>
                      <p className="text-muted-foreground">
                        {it.sku ? `${it.sku} · ` : ""}Qty {it.qty}
                        {it.fulfilled_qty > 0 ? ` · ${it.fulfilled_qty} fulfilled` : ""}
                        {it.refunded_qty > 0 ? ` · ${it.refunded_qty} refunded` : ""}
                      </p>
                    </div>
                    <p className="font-medium tabular-nums">
                      {formatPrice(Number(it.unit_price) * it.qty, currency)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />
              <div className="space-y-1 text-sm">
                <Row label="Subtotal" value={formatPrice(Number(order.subtotal), currency)} />
                {Number(order.discount_total) > 0 && (
                  <Row
                    label={`Discount${order.discount_code ? ` (${order.discount_code})` : ""}`}
                    value={`−${formatPrice(Number(order.discount_total), currency)}`}
                  />
                )}
                <Row
                  label="Shipping"
                  value={
                    Number(order.shipping) === 0 ? "FREE" : formatPrice(Number(order.shipping), currency)
                  }
                />
                {Number(order.tax) > 0 && (
                  <Row label={`Tax (${(Number(order.tax_rate) * 100).toFixed(2)}%)`} value={formatPrice(Number(order.tax), currency)} />
                )}
                {Number(order.points_value) > 0 && (
                  <Row
                    label={`Points (${order.points_redeemed})`}
                    value={`−${formatPrice(Number(order.points_value), currency)}`}
                  />
                )}
                <Separator />
                <Row label={<strong>Total</strong>} value={<strong>{formatPrice(Number(order.total), currency)}</strong>} />
                {refundedTotal > 0 && (
                  <Row
                    label="Refunded"
                    value={`−${formatPrice(refundedTotal, currency)}`}
                  />
                )}
              </div>

              {order.shipping_address && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <h3 className="mb-1 font-semibold">Shipping address</h3>
                    <ShippingAddress address={order.shipping_address as Record<string, unknown>} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {(payments.length > 0 || refunds.length > 0 || fulfillments.length > 0) && (
            <Card>
              <CardContent className="space-y-3 py-4 text-sm">
                <h3 className="font-semibold">Timeline</h3>
                {fulfillments.map((f) => (
                  <div key={f.id} className="flex justify-between gap-2 text-muted-foreground">
                    <span>
                      Fulfillment · {f.status}
                      {f.tracking_number ? ` · ${f.tracking_company ?? "tracking"} ${f.tracking_number}` : ""}
                    </span>
                    <span>{formatDate(f.created_at)}</span>
                  </div>
                ))}
                {payments.map((p) => (
                  <div key={p.id} className="flex justify-between gap-2 text-muted-foreground">
                    <span className="capitalize">
                      {p.kind} · {p.status} · {formatPrice(Number(p.amount), p.currency as Currency)}
                    </span>
                    <span>{formatDate(p.created_at)}</span>
                  </div>
                ))}
                {refunds.map((r) => (
                  <div key={r.id} className="flex justify-between gap-2 text-muted-foreground">
                    <span>
                      Refund · {formatPrice(Number(r.amount), r.currency as Currency)}
                      {r.reason ? ` · ${r.reason}` : ""}
                    </span>
                    <span>{formatDate(r.created_at)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <OrderFulfillPanel
            orderId={order.id}
            remaining={remainingToFulfill}
            items={items.map((it) => ({
              id: it.id,
              name: it.product_name,
              remaining: it.qty - it.fulfilled_qty,
            }))}
          />
          <OrderRefundPanel
            orderId={order.id}
            currency={currency}
            refundable={refundable}
            isPaid={order.financial_status === "paid" || order.financial_status === "partially_refunded"}
          />
        </div>
      </div>
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
