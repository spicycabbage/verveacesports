import { createServerClient } from "@supabase/ssr";
import { type NextRequest, type NextResponse } from "next/server";

/** Supabase SSR client that applies cookie changes to the outgoing response. */
export function createSupabaseRouteClient(
  request: NextRequest,
  response: NextResponse,
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );
}

function expireAuthCookie(
  response: NextResponse,
  name: string,
  opts: { path: string; secure: boolean; domain?: string },
) {
  response.cookies.set(name, "", {
    path: opts.path,
    secure: opts.secure,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
    ...(opts.domain ? { domain: opts.domain } : {}),
  });
}

/** Force-delete every Supabase auth cookie on this response. */
export function purgeSupabaseAuthCookies(
  request: NextRequest,
  response: NextResponse,
) {
  const secure =
    process.env.NODE_ENV === "production" ||
    request.nextUrl.protocol === "https:";
  const siteHost = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
    : request.nextUrl.hostname;

  for (const { name } of request.cookies.getAll()) {
    if (!name.startsWith("sb-")) continue;
    expireAuthCookie(response, name, { path: "/", secure });
    if (siteHost && siteHost !== "localhost") {
      expireAuthCookie(response, name, { path: "/", secure, domain: siteHost });
      expireAuthCookie(response, name, {
        path: "/",
        secure,
        domain: `.${siteHost}`,
      });
    }
  }
}
