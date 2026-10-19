import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { POS_CURRENCY, loadPosSettings, stripeLocationIdFor } from "@/lib/pos/settings";

export async function POST() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const admin = createSupabaseAdminClient();
  const settings = await loadPosSettings(admin);
  const location = settings ? stripeLocationIdFor(settings) : undefined;

  try {
    const stripe = getStripe(POS_CURRENCY);
    const token = await stripe.terminal.connectionTokens.create(
      location ? { location } : {},
    );
    return NextResponse.json({ secret: token.secret, locationId: location ?? null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not create connection token";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
