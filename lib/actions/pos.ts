"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeTaxRegion } from "@/lib/constants";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  taxRegion: z.string().trim().min(1).max(64),
  line1: z.string().trim().max(120).optional().default(""),
  city: z.string().trim().max(80).optional().default(""),
  postalCode: z.string().trim().max(20).optional().default(""),
  stripeLocationIdCad: z
    .string()
    .trim()
    .max(64)
    .optional()
    .transform((v) => v || null),
});

export async function savePosSettings(input: z.infer<typeof schema>) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Invalid store settings" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const region = normalizeTaxRegion("CA", parsed.data.taxRegion);
  if (!region) return { error: "Invalid province" };

  const admin = createSupabaseAdminClient();
  const { data: loc } = await admin.from("locations").select("id").eq("is_default", true).maybeSingle();
  if (!loc) return { error: "No default inventory location" };

  const { error } = await admin
    .from("locations")
    .update({
      name: parsed.data.name,
      tax_country: "CA",
      tax_region: region,
      address: {
        line1: parsed.data.line1,
        city: parsed.data.city,
        state: region,
        postal_code: parsed.data.postalCode,
        country: "CA",
      },
      stripe_location_id_cad: parsed.data.stripeLocationIdCad,
    })
    .eq("id", loc.id);
  if (error) return { error: error.message };

  revalidatePath("/admin/pos");
  return { ok: true as const };
}
