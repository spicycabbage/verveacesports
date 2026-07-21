import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { reconcileOrderIfPaid } from "@/lib/stripe/mark-order-paid";
import { formatPrice } from "@/lib/utils/format";
import type { Currency } from "@/lib/constants";

export const metadata = { title: "Order confirmed" };

type SearchParams = Promise<{ order?: string }>;

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const orderId = sp.order;
  if (!orderId) redirect("/");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fast path: if confirm-order already flipped it, skip Stripe. Otherwise reconcile
  // without fee sync so this page isn't blocked on balance-transaction fetches.
  try {
    await reconcileOrderIfPaid(createSupabaseAdminClient(), orderId, { syncFees: false });
  } catch (err) {
    console.error("checkout success reconcile failed", err);
  }

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, status, financial_status, currency, subtotal, shipping, total, points_redeemed, points_value",
    )
    .eq("id", orderId)
    .single();

  const isPaid =
    order?.status === "paid" ||
    order?.financial_status === "paid" ||
    order?.financial_status === "partially_refunded";

  const statusLabel = isPaid
    ? "Paid"
    : order?.status === "cancelled"
      ? "Cancelled"
      : "Processing";

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Card>
        <CardContent className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Order confirmed!</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Thank you for your order. A receipt was sent to your email.
            </p>
          </div>
          {order && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-left text-sm">
              <Row label="Order" value={`#${order.id.slice(0, 8).toUpperCase()}`} />
              <Row
                label="Status"
                value={
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {statusLabel}
                  </span>
                }
              />
              <Row
                label="Subtotal"
                value={formatPrice(Number(order.subtotal), order.currency as Currency)}
              />
              <Row
                label="Shipping"
                value={
                  Number(order.shipping) === 0
                    ? "FREE"
                    : formatPrice(Number(order.shipping), order.currency as Currency)
                }
              />
              {Number(order.points_value) > 0 && (
                <Row
                  label="Points redeemed"
                  value={`−${formatPrice(Number(order.points_value), order.currency as Currency)}`}
                />
              )}
              <Separator />
              <Row
                label={<strong>Total paid</strong>}
                value={
                  <strong>{formatPrice(Number(order.total), order.currency as Currency)}</strong>
                }
              />
            </div>
          )}
          <div className="flex items-center justify-center gap-2 rounded-md bg-accent p-3 text-sm text-accent-foreground">
            <Sparkles className="h-4 w-4" />
            <span>
              {isPaid
                ? "Payment received. Loyalty points for this order will show in your account shortly."
                : "We’re confirming payment with Stripe — this usually takes a few seconds."}
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href={`/account/orders/${orderId}`} className={buttonVariants({})}>
              View order
            </Link>
            <Link href="/products" className={buttonVariants({ variant: "outline" })}>
              Keep shopping
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
