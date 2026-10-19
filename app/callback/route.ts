import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { sanitizeAuthNext } from "@/lib/auth/post-login-path";
import { finalizeOAuthUser } from "@/lib/auth/finalize-oauth";
import {
  PASSWORD_RESET_COOKIE,
  PASSWORD_RESET_PATH,
  PASSWORD_RESET_TTL_S,
} from "@/lib/auth/cookies";
import { getSiteFromRequest } from "@/lib/site/get-site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const EMAIL_OTP_TYPES: ReadonlySet<string> = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const otpType = searchParams.get("type");
  const next = sanitizeAuthNext(searchParams.get("next"));
  const isReset = next === PASSWORD_RESET_PATH || otpType === "recovery";
  const failUrl = isReset ? `${origin}/forgot-password?error=expired` : `${origin}/login?error=auth`;

  const supabase = await createSupabaseServerClient();
  let authError: unknown = new Error("missing code");
  if (code) {
    ({ error: authError } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && otpType && EMAIL_OTP_TYPES.has(otpType)) {
    // Cross-device links (email template uses {{ .TokenHash }}) — no PKCE verifier needed.
    ({ error: authError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType as EmailOtpType,
    }));
  }
  if (authError) return NextResponse.redirect(failUrl);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isReset) {
    if (!user) return NextResponse.redirect(failUrl);
    const response = NextResponse.redirect(`${origin}${PASSWORD_RESET_PATH}`);
    response.cookies.set(PASSWORD_RESET_COOKIE, user.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: PASSWORD_RESET_TTL_S,
    });
    return response;
  }

  let dest = next;
  try {
    if (user) {
      dest = await finalizeOAuthUser({
        user,
        siteId: getSiteFromRequest(request).id,
        next,
      });
    }
  } catch (err) {
    console.error("oauth welcome check failed:", err);
  }
  return NextResponse.redirect(`${origin}${dest}`);
}
