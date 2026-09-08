import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { POS_CURRENCY, loadPosSettings, stripeLocationIdFor } from "@/lib/pos/settings";

const schema = z.object({
  registrationCode: z.string().trim().min(3).max(64),
  label: z.string().trim().min(1).max(80).optional(),
});

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const settings = await loadPosSettings(admin);
  if (!settings) return NextResponse.json({ error: "No store location configured" }, { status: 400 });

  const location = stripeLocationIdFor(settings);
  if (!location) {
    return NextResponse.json(
      { error: "Create a Stripe Terminal location first (Canadian Stripe account)" },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe(POS_CURRENCY);
    const reader = await stripe.terminal.readers.create({
      registration_code: parsed.data.registrationCode,
      location,
      label: parsed.data.label || `${settings.name} reader`,
    });
    return NextResponse.json({
      reader: {
        id: reader.id,
        label: reader.label,
        status: reader.status,
        deviceType: reader.device_type,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Register failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
