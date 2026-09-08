import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import {
  POS_CURRENCY,
  isStripeTestMode,
  loadPosSettings,
  stripeLocationIdFor,
} from "@/lib/pos/settings";

export async function POST() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
  if (!isStripeTestMode()) {
    return NextResponse.json({ error: "Simulated readers are test-mode only" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const settings = await loadPosSettings(admin);
  if (!settings) return NextResponse.json({ error: "No store location configured" }, { status: 400 });
  const location = stripeLocationIdFor(settings);
  if (!location) {
    return NextResponse.json({ error: "Create a Stripe Terminal location first" }, { status: 400 });
  }

  try {
    const stripe = getStripe(POS_CURRENCY);
    const reader = await stripe.terminal.readers.create({
      registration_code: "simulated-wpe",
      location,
      label: "Simulated reader",
    });
    return NextResponse.json({
      reader: { id: reader.id, label: reader.label, status: reader.status, deviceType: reader.device_type },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not create simulated reader";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
