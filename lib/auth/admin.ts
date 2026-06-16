import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminGuard =
  | { ok: true; userId: string }
  | { ok: false; error: string };

export async function requireAdmin(): Promise<AdminGuard> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single<{ is_admin: boolean }>();
  if (!data?.is_admin) return { ok: false, error: "Forbidden" };
  return { ok: true, userId: user.id };
}
