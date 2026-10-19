import { NextResponse, type NextRequest } from "next/server";
import { getSessionProfile } from "@/lib/auth/session";
import { getSiteFromRequest } from "@/lib/site/get-site";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";
import {
  insertPageView,
  isBotUserAgent,
  sanitizeCountry,
  sanitizePath,
  sanitizeReferrerHost,
  sanitizeSessionId,
} from "@/lib/analytics/pageviews";

export async function POST(request: NextRequest) {
  if (isBotUserAgent(request.headers.get("user-agent"))) {
    return new NextResponse(null, { status: 204 });
  }

  const profile = await getSessionProfile();
  if (profile?.is_admin) {
    return new NextResponse(null, { status: 204 });
  }

  const limited = await rateLimit(`pageview:${clientIp(request)}`, 120, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const record =
    body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const path = sanitizePath(record?.path);
  const sessionId = sanitizeSessionId(record?.sessionId);
  if (!path || !sessionId) {
    return NextResponse.json({ error: "Invalid pageview" }, { status: 400 });
  }

  const site = getSiteFromRequest(request);
  const country = sanitizeCountry(
    request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry"),
  );
  let referrerHost = sanitizeReferrerHost(record?.referrerHost);
  const reqHost = (
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    ""
  ).toLowerCase();
  if (referrerHost && (referrerHost === reqHost || referrerHost.endsWith(`.${reqHost}`))) {
    referrerHost = null;
  }

  const result = await insertPageView({
    siteId: site.id,
    path,
    sessionId,
    referrerHost,
    country,
  });
  if (!result.ok) {
    console.error("pageview insert failed:", result.error);
    return new NextResponse(null, { status: 204 });
  }
  return new NextResponse(null, { status: 204 });
}
