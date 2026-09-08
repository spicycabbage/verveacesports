import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile, getSessionUser } from "@/lib/auth/session";

/**
 * RSC guard for admin pages. The check in app/admin/layout.tsx alone is NOT
 * enough: Next renders layout and page segments in parallel and streams both,
 * so an anonymous request still received the page's RSC payload (order emails,
 * catalog rows) next to the redirect. Call this first in every admin page and
 * admin-only loader, before reading any data. Per-request memoized.
 */
export const requireAdminPage = cache(async (): Promise<{ userId: string }> => {
  const [user, profile] = await Promise.all([getSessionUser(), getSessionProfile()]);
  if (!user) redirect("/login?next=/admin");
  if (!profile?.is_admin) notFound();
  return { userId: user.id };
});

export type AdminGuard =
  | { ok: true; userId: string }
  | { ok: false; error: string; status: 401 | 403 };

async function sessionUserId(): Promise<{ id: string; email: string | undefined } | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return { id: user.id, email: user.email };

    // Access token still in the cookie but Auth refresh already happened in proxy.
    // getClaims() verifies the JWT signature + expiry; never trust getSession()
    // here — it returns whatever is in the cookie unverified.
    const { data: claims } = await supabase.auth.getClaims();
    const sub = claims?.claims.sub;
    if (sub) {
      const email = claims.claims.email;
      return { id: sub, email: typeof email === "string" ? email : undefined };
    }
  } catch {
    return null;
  }

  return null;
}

/** Fresh session + service-role flag check. Don't use the RSC cache here — actions are a new request. */
export async function requireAdmin(): Promise<AdminGuard> {
  const user = await sessionUserId();
  if (!user) {
    return { ok: false, error: "Not signed in — refresh and try again", status: 401 };
  }

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle<{ is_admin: boolean }>();

  if (!profile?.is_admin) {
    return {
      ok: false,
      error: `${user.email ?? "This account"} is not an admin`,
      status: 403,
    };
  }
  return { ok: true, userId: user.id };
}
