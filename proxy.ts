import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { REFERRAL_COOKIE, REFERRAL_COOKIE_DAYS } from "@/lib/constants";
import { isValidReferralCode } from "@/lib/utils/referral";
import { detectMarketFromRequest, MARKET_COOKIE } from "@/lib/geo/market";
import { SITE_COOKIE } from "@/lib/site/config";
import { getSiteFromRequest } from "@/lib/site/get-site";

export async function proxy(request: NextRequest) {
  // Do not refresh the session on sign-out — that can re-write auth cookies before the route clears them.
  if (request.nextUrl.pathname === "/api/auth/sign-out") {
    return NextResponse.next();
  }

  // Supabase site URL defaults to origin root; PKCE arrives as /?code=… — exchange lives on /callback.
  const url = request.nextUrl.clone();
  if (url.pathname === "/" && url.searchParams.has("code")) {
    url.pathname = "/callback";
    return NextResponse.redirect(url);
  }

  const response = await updateSession(request);
  const site = getSiteFromRequest(request);

  response.cookies.set(SITE_COOKIE, site.id, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  const market = site.lockMarket ?? detectMarketFromRequest(request);
  response.cookies.set(MARKET_COOKIE, market, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  });

  const ref = request.nextUrl.searchParams.get("ref");
  if (ref && isValidReferralCode(ref.toUpperCase())) {
    response.cookies.set(REFERRAL_COOKIE, ref.toUpperCase(), {
      maxAge: 60 * 60 * 24 * REFERRAL_COOKIE_DAYS,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
