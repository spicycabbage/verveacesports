import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { REFERRAL_COOKIE, REFERRAL_COOKIE_DAYS } from "@/lib/constants";
import { isValidReferralCode } from "@/lib/utils/referral";
import { detectMarketFromRequest, MARKET_COOKIE } from "@/lib/geo/market";
import { SITE_COOKIE } from "@/lib/site/config";
import { getSiteFromRequest } from "@/lib/site/get-site";
import { buildReportOnlyCsp, createCspNonce } from "@/lib/security/csp";
import { classifyUserAgent, contentSignalForPath } from "@/lib/bots/crawlers";
import { blogHrefLang, blogLocaleFromPath } from "@/lib/content/blog/paths";

function requestHostname(request: NextRequest): string {
  const raw =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    "";
  return raw.toLowerCase().split(":")[0] ?? "";
}

export async function proxy(request: NextRequest) {
  // Apex is canonical. vercel.json has the same rule; keep it here so local
  // + preview still collapse www even if the edge redirect is missing.
  if (
    requestHostname(request) === "www.verveacesports.com" ||
    requestHostname(request) === "www.voltcaddy.ca"
  ) {
    const dest = request.nextUrl.clone();
    dest.hostname =
      requestHostname(request) === "www.voltcaddy.ca" ? "voltcaddy.ca" : "verveacesports.com";
    dest.protocol = "https:";
    dest.port = "";
    return NextResponse.redirect(dest, 308);
  }

  const { pathname } = request.nextUrl;

  // English blog lives at /blog. /en/blog would be a duplicate URL.
  if (pathname === "/en/blog" || pathname.startsWith("/en/blog/")) {
    const dest = request.nextUrl.clone();
    dest.pathname = pathname.slice("/en".length);
    return NextResponse.redirect(dest, 308);
  }

  // Scrapers ignore robots.txt. Search and AI-discovery agents are classified
  // before the generic bot/spider/scraper deny so Googlebot and GPTBot get in.
  if (classifyUserAgent(request.headers.get("user-agent")) === "scraper") {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "private, no-store",
        Vary: "User-Agent",
        "X-Robots-Tag": "noindex, nofollow",
        "Content-Signal": "search=no, ai-input=no, ai-train=no",
      },
    });
  }

  // Metadata files stay cookie-free. Matcher includes them so the block above still runs.
  if (
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/llms.txt" ||
    pathname === "/indexnow.txt"
  ) {
    const res = NextResponse.next();
    res.headers.set("Content-Signal", contentSignalForPath(pathname));
    return res;
  }

  // Do not refresh the session on sign-out — that can re-write auth cookies before the route clears them.
  if (pathname === "/api/auth/sign-out") {
    return NextResponse.next();
  }

  // Host-aware favicon: Next still exposes /favicon.ico; serve the per-site /icon PNG.
  if (pathname === "/favicon.ico") {
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

  // /draw is Bleeq-only. Streamed notFound() is a 200 in this app — tag it
  // so Google doesn't index the Verveace 404 shell.
  if (pathname === "/draw" && site.id !== "bleeq-ca") {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

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

  response.headers.set("Content-Signal", contentSignalForPath(pathname));
  if (site.id === "verveace" && (blogLocaleFromPath(pathname) || pathname.startsWith("/blog"))) {
    const blogLocale = blogLocaleFromPath(pathname) ?? "en";
    response.headers.set("Content-Language", blogHrefLang(blogLocale));
  }
  return response;
}

export const config = {
  matcher: [
    // Skip static assets and the Stripe webhook (signature-authenticated, no
    // cookies). robots.txt, sitemap.xml, and llms.txt stay matched so scraper
    // UAs are rejected, then returned before session cookies.
    // (/favicon.ico must stay matched: it's rewritten to /icon above.)
    "/((?!_next/static|_next/image|sw\\.js|api/stripe/webhook|manifest\\.webmanifest|icon$|pwa-icon/|apple-touch-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
