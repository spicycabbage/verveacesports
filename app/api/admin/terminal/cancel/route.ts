import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { voidPendingOrder } from "@/lib/pos/void-pending-order";

const schema = z.object({
  orderId: z.string().uuid(),
  readerId: z.string().min(3).max(64).optional(),
});

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, status, currency, stripe_pi_id, sales_channel")
    .eq("id", parsed.data.orderId)
    .maybeSingle();
  if (!order || order.sales_channel !== "pos") {
    return NextResponse.json({ error: "POS order not found" }, { status: 404 });
  }
  if (order.status !== "pending") {
    return NextResponse.json({ error: "Order is no longer pending" }, { status: 409 });
  }

  const currency = "CAD" as const;
  const stripe = getStripe(currency);

  if (parsed.data.readerId) {
    try {
      await stripe.terminal.readers.cancelAction(parsed.data.readerId);
    } catch {
      /* reader idle or already finished */
    }
  }
  if (order.stripe_pi_id) {
    try {
      await stripe.paymentIntents.cancel(order.stripe_pi_id);
    } catch {
      /* already canceled / succeeded */
    }
  }

  await voidPendingOrder(admin, order.id, "Cancelled at terminal");
  return NextResponse.json({ cancelled: true });
}
