import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";

const schema = z.object({
  orderId: z.string().uuid(),
  readerId: z.string().min(3).max(64),
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
  if (!order || order.sales_channel !== "pos" || !order.stripe_pi_id) {
    return NextResponse.json({ error: "POS order not found" }, { status: 404 });
  }
  if (order.status !== "pending") {
    return NextResponse.json({ error: "Order is no longer pending" }, { status: 409 });
  }

  const currency = "CAD" as const;
  const stripe = getStripe(currency);
  try {
    await stripe.terminal.readers.processPaymentIntent(parsed.data.readerId, {
      payment_intent: order.stripe_pi_id,
    });
    await admin
      .from("payments")
      .update({ status: "pending", error_message: null })
      .eq("stripe_payment_intent_id", order.stripe_pi_id)
      .eq("kind", "sale");
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Reader rejected retry";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
