import { cache } from "react";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/** @supabase/ssr stores the session as `sb-<ref>-auth-token` (optionally chunked). */
async function hasAuthCookie(): Promise<boolean> {
  const store = await cookies();
  return store.getAll().some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));
}

export type SessionProfile = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  loyalty_points: number;
  is_admin: boolean;
};

async function readUser(): Promise<User | null> {
  try {
    // Anonymous visitor (most storefront traffic): skip the Supabase Auth
    // round-trip the header/layout would otherwise make on every page.
    if (!(await hasAuthCookie())) return null;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (user) return user;
    if (error) {
      // Verified fallback (signature + expiry). getSession() would return the
      // cookie payload unverified, which must never drive authz.
      const { data: claims } = await supabase.auth.getClaims();
      const sub = claims?.claims.sub;
      if (!sub) return null;
      const email = claims.claims.email;
      return {
        id: sub,
        email: typeof email === "string" ? email : undefined,
        app_metadata: claims.claims.app_metadata ?? {},
        user_metadata: claims.claims.user_metadata ?? {},
        aud: typeof claims.claims.aud === "string" ? claims.claims.aud : "authenticated",
        created_at: "",
      } satisfies User;
    }
    return null;
  } catch {
    return null;
  }
}

/** Dedupes auth.getUser() across layout / header / admin in one request. */
export const getSessionUser = cache(readUser);

/** Dedupes the profile read used by header + admin gate. */
export const getSessionProfile = cache(async (): Promise<SessionProfile | null> => {
  const user = await getSessionUser();
  if (!user) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, first_name, last_name, loyalty_points, is_admin")
      .eq("id", user.id)
      .maybeSingle<SessionProfile>();
    return data ?? null;
  } catch {
    return null;
  }
});
