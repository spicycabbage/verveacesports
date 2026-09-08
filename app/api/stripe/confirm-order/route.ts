import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { reconcileOrderIfPaid } from "@/lib/stripe/mark-order-paid";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";

const schema = z.object({
  orderId: z.string().uuid(),
});

/**
 * Client calls this right after Stripe confirmPayment succeeds so the order
 * flips to paid without waiting on the webhook.
 */
export async function POST(req: NextRequest) {
  // Each call hits Stripe (PI retrieve) — keep polling clients honest.
  const limited = await rateLimit(`confirm-order:${clientIp(req)}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests, slow down" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, status, financial_status")
    .eq("id", parsed.data.orderId)
    .maybeSingle();

  if (!order || order.user_id !== user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "paid" || order.financial_status === "paid") {
    return NextResponse.json({ paid: true });
  }

  try {
      const paid = await reconcileOrderIfPaid(admin, order.id, { syncFees: true });
    return NextResponse.json({ paid });
  } catch (err) {
    console.error("confirm-order reconcile failed", err);
    return NextResponse.json({ paid: false, error: "Could not confirm payment yet" }, { status: 502 });
  }
}
