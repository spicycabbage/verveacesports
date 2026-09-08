import { NextResponse, type NextRequest } from "next/server";
import {
  createSupabaseRouteClient,
  purgeSupabaseAuthCookies,
} from "@/lib/supabase/route-handler";

async function signOutResponse(request: NextRequest) {
  const redirectTo = new URL("/", request.url);
  const response = NextResponse.redirect(redirectTo);

  const supabase = createSupabaseRouteClient(request, response);
  await supabase.auth.signOut({ scope: "global" });
  purgeSupabaseAuthCookies(request, response);

  response.headers.set("Cache-Control", "no-store");

  return response;
}

/** Prefetches (next/link, browser speculation, link previews) must never sign the user out. */
function isPrefetch(request: NextRequest): boolean {
  const h = request.headers;
  return (
    h.has("next-router-prefetch") ||
    h.has("rsc") ||
    h.get("purpose") === "prefetch" ||
    h.get("sec-purpose")?.includes("prefetch") === true ||
    h.get("x-purpose") === "preview"
  );
}

export async function GET(request: NextRequest) {
  if (isPrefetch(request)) {
    return new NextResponse(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  }
  return signOutResponse(request);
}

export async function POST(request: NextRequest) {
  return signOutResponse(request);
}
