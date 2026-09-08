import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { reconcileOrderIfPaid } from "@/lib/stripe/mark-order-paid";
import { fulfillPosPickup } from "@/lib/pos/fulfill-pickup";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const orderId = req.nextUrl.searchParams.get("orderId");
  const readerId = req.nextUrl.searchParams.get("readerId");
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, status, financial_status, currency, stripe_pi_id, sales_channel")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.sales_channel !== "pos") {
    return NextResponse.json({ error: "POS order not found" }, { status: 404 });
  }

  const currency = "CAD" as const;
  const stripe = getStripe(currency);

  let readerAction: {
    status: string | null;
    failure: string | null;
  } = { status: null, failure: null };
  if (readerId) {
    try {
      const reader = await stripe.terminal.readers.retrieve(readerId);
      if (!("deleted" in reader && reader.deleted)) {
        readerAction = {
          status: reader.action?.status ?? null,
          failure: reader.action?.failure_message ?? null,
        };
      }
    } catch {
      /* reader lookup is best-effort */
    }
  }

  let piStatus: string | null = null;
  if (order.stripe_pi_id) {
    try {
      const pi = await stripe.paymentIntents.retrieve(order.stripe_pi_id);
      piStatus = pi.status;
    } catch {
      piStatus = null;
    }
  }

  if (
    (order.status === "pending" || order.financial_status === "pending") &&
    piStatus === "succeeded"
  ) {
    try {
      const paid = await reconcileOrderIfPaid(admin, order.id, { syncFees: true });
      if (paid) await fulfillPosPickup(admin, order.id, guard.userId);
    } catch (err) {
      console.error("POS status reconcile failed", err);
    }
    const { data: fresh } = await admin
      .from("orders")
      .select("status, financial_status")
      .eq("id", order.id)
      .maybeSingle();
    return NextResponse.json({
      orderStatus: fresh?.status ?? order.status,
      financialStatus: fresh?.financial_status ?? order.financial_status,
      paymentIntentStatus: piStatus,
      readerAction: readerAction.status,
      readerFailure: readerAction.failure,
    });
  }

  return NextResponse.json({
    orderStatus: order.status,
    financialStatus: order.financial_status,
    paymentIntentStatus: piStatus,
    readerAction: readerAction.status,
    readerFailure: readerAction.failure,
  });
}
