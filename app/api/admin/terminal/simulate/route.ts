import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { getStripe } from "@/lib/stripe/server";
import { POS_CURRENCY, isStripeTestMode } from "@/lib/pos/settings";

const schema = z.object({
  readerId: z.string().min(3).max(64),
});

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (!isStripeTestMode()) {
    return NextResponse.json({ error: "Simulate tap is test-mode only" }, { status: 400 });
  }

  try {
    const stripe = getStripe(POS_CURRENCY);
    await stripe.testHelpers.terminal.readers.presentPaymentMethod(parsed.data.readerId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Simulate failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
