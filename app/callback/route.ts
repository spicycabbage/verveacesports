import { NextResponse, type NextRequest } from "next/server";
import { sanitizeAuthNext } from "@/lib/auth/post-login-path";
import { finalizeOAuthUser } from "@/lib/auth/finalize-oauth";
import { getSiteFromRequest } from "@/lib/site/get-site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeAuthNext(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      let dest = next;
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
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
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
