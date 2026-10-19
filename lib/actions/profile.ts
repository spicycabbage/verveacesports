"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { revalidatePath } from "next/cache";
import { regionsForCountry } from "@/lib/constants";
import { isValidOrderPhone, normalizeOrderPhone } from "@/lib/utils/phone";

const MIGRATION_HINT = "Settings storage isn't set up yet (apply migration 0047_profile_settings).";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

const profileSchema = z.object({
  first_name: z.string().trim().min(1, "Enter your first name").max(80),
  last_name: z.string().trim().min(1, "Enter your last name").max(80),
  phone: z
    .string()
    .trim()
    .max(32)
    .refine((v) => v === "" || isValidOrderPhone(v), "Enter a valid phone number"),
});

export async function updateProfile(input: z.input<typeof profileSchema>) {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated" };

  const { first_name, last_name } = parsed.data;
  const phone = parsed.data.phone ? normalizeOrderPhone(parsed.data.phone) : null;

  const { error } = await supabase
    .from("profiles")
    .update({ first_name, last_name, full_name: `${first_name} ${last_name}`.trim(), phone })
    .eq("id", user.id);
  if (error) return { error: error.message.includes("phone") ? MIGRATION_HINT : error.message };

  revalidatePath("/account", "layout");
  revalidatePath("/", "layout");
  return { ok: true as const };
}

const addressSchema = z
  .object({
    line1: z.string().trim().min(1, "Enter your street address").max(200),
    line2: z.string().trim().max(200),
    city: z.string().trim().min(1, "Enter your city").max(100),
    state: z.string().trim().min(1, "Choose a province / state"),
    postal_code: z.string().trim().min(3, "Enter your postal code").max(16),
    country: z.enum(["US", "CA"]),
  })
  .refine((a) => regionsForCountry(a.country).some((r) => r.code === a.state), {
    message: "Choose a province / state",
    path: ["state"],
  });

export async function updateAddress(input: z.input<typeof addressSchema>) {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid address" };

  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated" };

  const { country, ...address } = parsed.data;
  const { error } = await supabase
    .from("profiles")
    .update({
      country,
      default_address: { ...address, postal_code: address.postal_code.toUpperCase() },
    })
    .eq("id", user.id);
  if (error) {
    return { error: error.message.includes("default_address") ? MIGRATION_HINT : error.message };
  }

  revalidatePath("/account", "layout");
  revalidatePath("/checkout");
  return { ok: true as const };
}

const passwordSchema = z.object({
  currentPassword: z.string().max(72).optional(),
  newPassword: z.string().min(8, "Min 8 characters").max(72),
});

export async function changePassword(input: z.input<typeof passwordSchema>) {
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid password" };

  const { supabase, user } = await requireUser();
  if (!user?.email) return { error: "Not authenticated" };

  const { data: hasPassword, error: rpcError } = await supabase.rpc("current_user_has_password");
  if (rpcError) return { error: MIGRATION_HINT };

  if (hasPassword) {
    if (!parsed.data.currentPassword) return { error: "Enter your current password" };
    // Throwaway cookie-less client so verifying doesn't replace the live session.
    const verifier = createSupabasePublicClient();
    const { error } = await verifier.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.currentPassword,
    });
    if (error) return { error: "Current password is incorrect" };
    await verifier.auth.signOut({ scope: "local" });
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
  if (error) return { error: error.message };

  revalidatePath("/account/settings");
  return { ok: true as const };
}
