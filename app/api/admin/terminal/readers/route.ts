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

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const admin = createSupabaseAdminClient();
  const settings = await loadPosSettings(admin);
  const location = settings ? stripeLocationIdFor(settings) : undefined;

  try {
    const stripe = getStripe(POS_CURRENCY);
    const list = await stripe.terminal.readers.list({
      limit: 50,
      ...(location ? { location } : {}),
    });
    return NextResponse.json({
      locationId: location ?? null,
      testMode: isStripeTestMode(),
      readers: list.data.map((r) => ({
        id: r.id,
        label: r.label,
        status: r.status,
        deviceType: r.device_type,
        serialNumber: r.serial_number,
        location: typeof r.location === "string" ? r.location : r.location?.id ?? null,
        actionStatus: r.action?.status ?? null,
        actionFailure: r.action?.failure_message ?? null,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to list readers";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
