import { NextResponse, type NextRequest } from "next/server";
import {
  LOCALE_COOKIE,
  isLocale,
  parseLocaleCookie,
} from "@/lib/i18n/locale";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";

export async function POST(request: NextRequest) {
  const limited = await rateLimit(`locale:${clientIp(request)}`, 30, 60_000);
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

  const raw =
    typeof body === "object" &&
    body !== null &&
    "locale" in body &&
    typeof (body as { locale: unknown }).locale === "string"
      ? (body as { locale: string }).locale
      : null;

  if (!raw || !isLocale(raw)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const locale = parseLocaleCookie(raw);
  const response = NextResponse.json({ locale });
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
