import { NextResponse, type NextRequest } from "next/server";
import { sendAccountWelcomeEmail } from "@/lib/brevo/emails";
import { getSiteFromRequest } from "@/lib/site/get-site";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const NEW_USER_WINDOW_MS = 2 * 60 * 1000;

// Only allow internal single-slash paths — blocks open redirects like
// `next=https://evil.com` or protocol-relative `next=//evil.com`.
function sanitizeNext(raw: string | null): string {
  if (!raw) return "/account";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/account";
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Marketing enrollment stays on explicit newsletter opt-in only
      // (/api/newsletter/subscribe) — not tied to account creation / OAuth.
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          const createdAt = new Date(user.created_at).getTime();
          const isNew = Number.isFinite(createdAt) && Date.now() - createdAt < NEW_USER_WINDOW_MS;
          if (isNew) {
            const meta = user.user_metadata ?? {};
            const firstName =
              (typeof meta.first_name === "string" && meta.first_name) ||
              (typeof meta.given_name === "string" && meta.given_name) ||
              (typeof meta.full_name === "string" ? meta.full_name.split(/\s+/)[0] : undefined) ||
              (typeof meta.name === "string" ? meta.name.split(/\s+/)[0] : undefined);
            const site = getSiteFromRequest(request);
            // OAuth signups don't carry site_id in metadata — stamp origin from host.
            const admin = createSupabaseAdminClient();
            await admin.from("profiles").update({ site_id: site.id }).eq("id", user.id);
            void sendAccountWelcomeEmail({
              siteId: site.id,
              toEmail: user.email,
              firstName: firstName || undefined,
            }).catch((err) => {
              console.error("oauth account welcome email failed:", err);
            });
          }
        }
      } catch (err) {
        console.error("oauth welcome check failed:", err);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
