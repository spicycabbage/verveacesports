import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { REFERRAL_COOKIE, REFERRAL_COOKIE_DAYS } from "@/lib/constants";
import { isValidReferralCode } from "@/lib/utils/referral";
import { detectMarketFromRequest, MARKET_COOKIE } from "@/lib/geo/market";
import { SITE_COOKIE } from "@/lib/site/config";
import { getSiteFromRequest } from "@/lib/site/get-site";
import { buildReportOnlyCsp, createCspNonce } from "@/lib/security/csp";

export async function proxy(request: NextRequest) {
  // Do not refresh the session on sign-out — that can re-write auth cookies before the route clears them.
  if (request.nextUrl.pathname === "/api/auth/sign-out") {
    return NextResponse.next();
  }

  // Host-aware favicon: Next still exposes /favicon.ico; serve the per-site /icon PNG.
  if (request.nextUrl.pathname === "/favicon.ico") {
    const iconUrl = request.nextUrl.clone();
    iconUrl.pathname = "/icon";
    return NextResponse.rewrite(iconUrl);
  }

  // Supabase site URL defaults to origin root; PKCE arrives as /?code=… — exchange lives on /callback.
  const url = request.nextUrl.clone();
  if (url.pathname === "/" && url.searchParams.has("code")) {
    url.pathname = "/callback";
    return NextResponse.redirect(url);
  }

  // Nonce-based CSP, Report-Only for now (lib/security/csp.ts). Next reads the
  // nonce from the CSP *request* header and applies it to its own inline/bundle
  // scripts; updateSession forwards the mutated request headers to the render.
  const nonce = createCspNonce();
  const csp = buildReportOnlyCsp(nonce);
  request.headers.set("x-nonce", nonce);
  request.headers.set("content-security-policy-report-only", csp);

  const response = await updateSession(request);
  response.headers.set("Content-Security-Policy-Report-Only", csp);

  const site = getSiteFromRequest(request);
  const secure = process.env.NODE_ENV === "production";

  // Only re-issue the site/market cookies when they actually change — avoids a
  // Set-Cookie on every response (which also defeats shared caching).
  if (request.cookies.get(SITE_COOKIE)?.value !== site.id) {
    response.cookies.set(SITE_COOKIE, site.id, {
      path: "/",
      sameSite: "lax",
      secure,
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const market = site.lockMarket ?? detectMarketFromRequest(request);
  if (request.cookies.get(MARKET_COOKIE)?.value !== market) {
    response.cookies.set(MARKET_COOKIE, market, {
      path: "/",
      sameSite: "lax",
      secure,
      maxAge: 60 * 60 * 24,
    });
  }

  const ref = request.nextUrl.searchParams.get("ref");
  if (ref && isValidReferralCode(ref.toUpperCase())) {
    response.cookies.set(REFERRAL_COOKIE, ref.toUpperCase(), {
      maxAge: 60 * 60 * 24 * REFERRAL_COOKIE_DAYS,
      path: "/",
      sameSite: "lax",
      secure,
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Skip static assets, the Stripe webhook (signature-authenticated, no
    // cookies), and metadata/icon routes — none need session or cookies.
    // (/favicon.ico must stay matched: it's rewritten to /icon above.)
    "/((?!_next/static|_next/image|sw\\.js|api/stripe/webhook|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|icon$|pwa-icon/|apple-touch-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
