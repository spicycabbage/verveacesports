import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatPrice, formatDateOnly } from "@/lib/utils/format";
import { countryName } from "@/lib/constants";
import { SITES, type SiteId } from "@/lib/site/config";
import type { Order, OrderItem, ShippingAddress } from "@/lib/supabase/types";
import { InvoiceActions } from "../InvoiceActions";
import { AutoPrint } from "./AutoPrint";
import { requireAdminPage } from "@/lib/auth/admin";
import { GST_NUMBER, taxLinesForOrder } from "@/lib/tax/label";
import { formatOrderNumber } from "@/lib/orders/number";
import { orderVariantLabel } from "@/lib/orders/variant-label";

export const metadata = { title: "Admin · Invoice" };

type Params = Promise<{ id: string }>;
type Search = Promise<{ print?: string }>;

function isSiteId(value: string | undefined | null): value is SiteId {
  return value === "verveace" || value === "bleeq-ca" || value === "volt-ca";
}

export default async function AdminOrderInvoicePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  await requireAdminPage();
  const { id } = await params;
  const { print } = await searchParams;
  const admin = createSupabaseAdminClient();

  const { data: orderData } = await admin.from("orders").select("*").eq("id", id).single();
  if (!orderData) notFound();
  const order = orderData as Order;
  const currency = "CAD" as const;
  const siteId = isSiteId(order.site_id) ? order.site_id : "verveace";
  const site = SITES[siteId];
  const { data: itemsData } = await admin.from("order_items").select("*").eq("order_id", id);
  const items = (itemsData ?? []) as OrderItem[];
  const address = order.shipping_address as ShippingAddress | null;
  const invoiceDate = order.paid_at ?? order.created_at;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/admin/orders/${order.id}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="h-4 w-4" /> Back to order
        </Link>
        <InvoiceActions
          key={`${order.id}:${order.email ?? ""}:${address?.full_name ?? ""}`}
          orderId={order.id}
          email={order.email ?? ""}
          customerName={address?.full_name ?? ""}
        />
        {print === "1" ? <AutoPrint /> : null}
      </div>

      <article className="rounded-lg border bg-background p-6 text-foreground shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Invoice
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">{site.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{site.supportEmail}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">GST/HST {GST_NUMBER}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-mono text-base font-semibold">{formatOrderNumber(order)}</p>
            <p className="text-muted-foreground">{formatDateOnly(invoiceDate)}</p>
            <p className="mt-1 capitalize text-muted-foreground">
              {order.financial_status.replaceAll("_", " ")}
            </p>
          </div>
        </header>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="text-sm">
            <h2 className="font-semibold">Bill to</h2>
            <p className="mt-1 text-muted-foreground">
              {address?.full_name || "—"}
              {order.email ? (
                <>
                  <br />
                  {order.email}
                </>
              ) : null}
            </p>
          </div>
          <div className="text-sm sm:text-right">
            <h2 className="font-semibold">
              {order.sales_channel === "pos" ? "Fulfillment" : "Ship to"}
            </h2>
            {order.sales_channel === "pos" ? (
              <p className="mt-1 text-muted-foreground sm:ml-auto sm:max-w-xs">
                In-store pickup · paid in person
                {address ? (
                  <>
                    <br />
                    {address.city}, {address.state} {address.postal_code}
                    <br />
                    {countryName(address.country)}
                  </>
                ) : null}
              </p>
            ) : address ? (
              <p className="mt-1 text-muted-foreground sm:ml-auto sm:max-w-xs">
                {address.full_name}
                <br />
                {address.line1}
                {address.line2 ? (
                  <>
                    <br />
                    {address.line2}
                  </>
                ) : null}
                <br />
                {address.city}, {address.state} {address.postal_code}
                <br />
                {countryName(address.country)}
                {address.phone ? (
                  <>
                    <br />
                    {address.phone}
                  </>
                ) : null}
              </p>
            ) : (
              <p className="mt-1 text-muted-foreground">—</p>
            )}
          </div>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-3 font-semibold">Item</th>
                <th className="py-2 px-3 font-semibold text-right">Qty</th>
                <th className="py-2 px-3 font-semibold text-right">Unit</th>
                <th className="py-2 pl-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/70">
                  <td className="py-3 pr-3 align-top">
                    <p className="font-medium">{item.product_name}</p>
                    {orderVariantLabel(item.variant_title) ? (
                      <p className="text-xs">{orderVariantLabel(item.variant_title)}</p>
                    ) : null}
                    {item.sku ? (
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                    ) : null}
                  </td>
                  <td className="py-3 px-3 align-top text-right tabular-nums">{item.qty}</td>
                  <td className="py-3 px-3 align-top text-right tabular-nums">
                    {formatPrice(Number(item.unit_price), currency)}
                  </td>
                  <td className="py-3 pl-3 align-top text-right tabular-nums">
                    {formatPrice(Number(item.unit_price) * item.qty, currency)}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground">
                    No line items
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between gap-6">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(Number(order.subtotal), currency)}</dd>
            </div>
            {Number(order.discount_total) > 0 && (
              <div className="flex justify-between gap-6">
                <dt className="text-muted-foreground">
                  Discount{order.discount_code ? ` (${order.discount_code})` : ""}
                </dt>
                <dd className="tabular-nums">
                  −{formatPrice(Number(order.discount_total), currency)}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-6">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">
                {Number(order.shipping) === 0
                  ? "FREE"
                  : formatPrice(Number(order.shipping), currency)}
              </dd>
            </div>
            {taxLinesForOrder(order).map((line) => (
              <div key={line.label} className="flex justify-between gap-6">
                <dt className="text-muted-foreground">{line.label}</dt>
                <dd className="tabular-nums">{formatPrice(line.amount, currency)}</dd>
              </div>
            ))}
            {Number(order.points_value) > 0 && (
              <div className="flex justify-between gap-6">
                <dt className="text-muted-foreground">
                  Points ({order.points_redeemed})
                </dt>
                <dd className="tabular-nums">
                  −{formatPrice(Number(order.points_value), currency)}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-6 border-t pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(Number(order.total), currency)}</dd>
            </div>
            {Number(order.refunded_total) > 0 && (
              <div className="flex justify-between gap-6 text-muted-foreground">
                <dt>Refunded</dt>
                <dd className="tabular-nums">
                  −{formatPrice(Number(order.refunded_total), currency)}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <footer className="mt-10 border-t pt-4 text-xs text-muted-foreground">
          Order ID {order.id} · {site.name} · GST/HST {GST_NUMBER} · {currency}
        </footer>
      </article>
    </div>
  );
}
