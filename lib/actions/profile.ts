"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const updateSchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  country: z.enum(["US", "CA"]),
});

export async function updateProfile(input: {
  first_name: string;
  last_name: string;
  country: "US" | "CA";
}) {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const fn = parsed.data.first_name.trim();
  const ln = parsed.data.last_name.trim();
  const full_name = `${fn} ${ln}`.trim();

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: fn,
      last_name: ln,
      full_name,
      country: parsed.data.country,
    })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/account");
  revalidatePath("/", "layout");
  return { ok: true };
}
