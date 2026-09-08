import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendAccountWelcomeEmail } from "@/lib/brevo/emails";
import { postLoginPath, sanitizeAuthNext } from "@/lib/auth/post-login-path";
import type { SiteId } from "@/lib/site/config";

const NEW_USER_WINDOW_MS = 2 * 60 * 1000;

function firstNameFromMeta(meta: Record<string, unknown>): string | undefined {
  if (typeof meta.first_name === "string" && meta.first_name) return meta.first_name;
  if (typeof meta.given_name === "string" && meta.given_name) return meta.given_name;
  if (typeof meta.full_name === "string") return meta.full_name.split(/\s+/)[0];
  if (typeof meta.name === "string") return meta.name.split(/\s+/)[0];
  return undefined;
}

/** Stamp site, send welcome for brand-new accounts, return post-login path. */
export async function finalizeOAuthUser(input: {
  user: User;
  siteId: SiteId;
  next: string;
}): Promise<string> {
  const adminClient = createSupabaseAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("is_admin")
    .eq("id", input.user.id)
    .maybeSingle<{ is_admin: boolean }>();
  const dest = postLoginPath(sanitizeAuthNext(input.next), !!profile?.is_admin);

  if (!input.user.email) return dest;

  const createdAt = new Date(input.user.created_at).getTime();
  const isNew = Number.isFinite(createdAt) && Date.now() - createdAt < NEW_USER_WINDOW_MS;
  if (!isNew) return dest;

  await adminClient.from("profiles").update({ site_id: input.siteId }).eq("id", input.user.id);
  void sendAccountWelcomeEmail({
    siteId: input.siteId,
    toEmail: input.user.email,
    firstName: firstNameFromMeta(input.user.user_metadata ?? {}),
  }).catch((err) => {
    console.error("oauth account welcome email failed:", err);
  });

  return dest;
}
