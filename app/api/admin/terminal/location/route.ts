import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { POS_COUNTRY, POS_CURRENCY, loadPosSettings } from "@/lib/pos/settings";

export async function POST() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const admin = createSupabaseAdminClient();
  const settings = await loadPosSettings(admin);
  if (!settings) return NextResponse.json({ error: "No default inventory location" }, { status: 400 });
  if (!settings.line1 || !settings.city || !settings.postalCode || !settings.taxRegion) {
    return NextResponse.json(
      { error: "Save store address (street, city, province, postal) before creating a Stripe location" },
      { status: 400 },
    );
  }

  if (settings.stripeLocationIdCad) {
    return NextResponse.json({ locationId: settings.stripeLocationIdCad, created: false });
  }

  try {
    const stripe = getStripe(POS_CURRENCY);
    const loc = await stripe.terminal.locations.create({
      display_name: `${settings.name} (CAD)`,
      address: {
        line1: settings.line1,
        city: settings.city,
        state: settings.taxRegion,
        postal_code: settings.postalCode,
        country: POS_COUNTRY,
      },
    });

    const { error } = await admin
      .from("locations")
      .update({ stripe_location_id_cad: loc.id })
      .eq("id", settings.locationId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ locationId: loc.id, created: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create Stripe location";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
