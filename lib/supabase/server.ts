import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { authCookieOptions, SESSION_ONLY_COOKIE } from "@/lib/auth/cookies";

export async function createSupabaseServerClient(opts?: { sessionOnly?: boolean }) {
  const cookieStore = await cookies();
  const sessionOnly = opts?.sessionOnly ?? cookieStore.get(SESSION_ONLY_COOKIE)?.value === "1";
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, authCookieOptions(options, sessionOnly)),
            );
          } catch {
            // Server Component context — middleware refreshes the session.
          }
        },
      },
    },
  );
}
