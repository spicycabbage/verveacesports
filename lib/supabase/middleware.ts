import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authCookieOptions, SESSION_ONLY_COOKIE } from "@/lib/auth/cookies";

/** @supabase/ssr stores the session as `sb-<ref>-auth-token` (optionally chunked `.0`, `.1`, …). */
function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));
}

function shouldSkipAuthRefresh(request: NextRequest): boolean {
  const path = request.nextUrl.pathname;
  if (path === "/callback" || path === "/api/auth/sign-out") return true;
  if (
    request.method === "POST" &&
    (request.headers.has("Next-Action") || request.headers.has("next-action"))
  ) {
    return true;
  }
  // Anonymous visitor: nothing to refresh, skip the round-trip to Supabase Auth
  // on every storefront request.
  return !hasSupabaseAuthCookie(request);
}

export async function updateSession(request: NextRequest) {
  request.headers.set("x-pathname", request.nextUrl.pathname);

  let response = NextResponse.next({ request });
  const sessionOnly = request.cookies.get(SESSION_ONLY_COOKIE)?.value === "1";

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, authCookieOptions(options, sessionOnly)),
          );
        },
      },
    },
  );

  // Don't touch the session on Server Actions (refresh-token race) or /callback
  // (PKCE verifier must survive until exchangeCodeForSession).
  if (!shouldSkipAuthRefresh(request)) {
    try {
      await supabase.auth.getUser();
    } catch {
      // Corrupt cookies must not 500 the request. Leave them; /login try/catches getUser.
    }
  }

  return response;
}
