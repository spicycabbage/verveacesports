import type { SupabaseClient } from "@supabase/supabase-js";
import type { CountryCode } from "@/lib/constants";
import { normalizeTaxRegion } from "@/lib/constants";
import type { ShippingAddress } from "@/lib/supabase/types";

/** Physical Terminal and online checkout are CAD-only. */
export const POS_CURRENCY = "CAD" as const;
export const POS_COUNTRY = "CA" as const;

export type PosSettings = {
  locationId: string;
  name: string;
  taxCountry: CountryCode;
  taxRegion: string;
  line1: string;
  city: string;
  postalCode: string;
  stripeLocationIdCad: string | null;
};

type LocationRow = {
  id: string;
  name: string;
  address: unknown;
  tax_country: string | null;
  tax_region: string | null;
  stripe_location_id: string | null;
  stripe_location_id_cad: string | null;
};

function addressFields(address: unknown): { line1: string; city: string; postalCode: string } {
  if (!address || typeof address !== "object") {
    return { line1: "", city: "", postalCode: "" };
  }
  const a = address as Record<string, unknown>;
  return {
    line1: typeof a.line1 === "string" ? a.line1 : "",
    city: typeof a.city === "string" ? a.city : "",
    postalCode: typeof a.postal_code === "string" ? a.postal_code : "",
  };
}

export function stripeLocationIdFor(settings: PosSettings): string | undefined {
  return (
    settings.stripeLocationIdCad ||
    process.env.STRIPE_TERMINAL_LOCATION_ID_CAD ||
    undefined
  );
}

export async function loadPosSettings(admin: SupabaseClient): Promise<PosSettings | null> {
  const { data } = await admin
    .from("locations")
    .select("id, name, address, tax_country, tax_region, stripe_location_id, stripe_location_id_cad")
    .eq("is_default", true)
    .maybeSingle();
  if (!data) return null;

  const row = data as LocationRow;
  const addr = addressFields(row.address);
  const taxRegion =
    row.tax_region?.trim() || process.env.POS_TAX_REGION?.trim() || "";

  return {
    locationId: row.id,
    name: row.name,
    taxCountry: POS_COUNTRY,
    taxRegion,
    line1: addr.line1 || process.env.POS_LINE1?.trim() || "",
    city: addr.city || process.env.POS_CITY?.trim() || "",
    postalCode: addr.postalCode || process.env.POS_POSTAL_CODE?.trim() || "",
    stripeLocationIdCad: row.stripe_location_id_cad,
  };
}

export function pickupAddress(settings: PosSettings, customerName: string): ShippingAddress {
  const region = normalizeTaxRegion(POS_COUNTRY, settings.taxRegion) ?? settings.taxRegion;
  return {
    full_name: customerName.trim() || "Walk-in",
    line1: settings.line1.trim() || "In-store pickup",
    city: settings.city.trim() || "Store",
    state: region,
    postal_code: settings.postalCode.trim() || "00000",
    country: POS_COUNTRY,
  };
}

export function isStripeTestMode(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY_CAD?.startsWith("sk_test_"));
}

export function terminalPaymentMethodTypes(): string[] {
  return ["card_present", "interac_present"];
}
