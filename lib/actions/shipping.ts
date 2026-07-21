"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";

type ActionResult = { ok: true } | { error: string };

const updateRateSchema = z.object({
  rateId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  priceUsd: z.coerce.number().nonnegative(),
  priceCad: z.coerce.number().nonnegative(),
  freeOver: z.coerce.number().nonnegative().nullable(),
  isActive: z.boolean(),
});

export async function updateShippingRate(
  input: z.infer<typeof updateRateSchema>,
): Promise<ActionResult> {
  const parsed = updateRateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const d = parsed.data;
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("shipping_rates")
    .update({
      name: d.name,
      price_usd: d.priceUsd,
      price_cad: d.priceCad,
      free_over: d.freeOver,
      is_active: d.isActive,
    })
    .eq("id", d.rateId);
  if (error) return { error: error.message };

  revalidatePath("/admin/shipping");
  revalidatePath("/checkout");
  return { ok: true };
}
