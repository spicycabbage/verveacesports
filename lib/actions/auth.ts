"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendAccountWelcomeEmail, sendPasswordResetEmail } from "@/lib/brevo/emails";
import { postLoginPath, sanitizeAuthNext } from "@/lib/auth/post-login-path";
import { finalizeOAuthUser } from "@/lib/auth/finalize-oauth";
import { REFERRAL_COOKIE } from "@/lib/constants";
import {
  PASSWORD_RESET_COOKIE,
  PASSWORD_RESET_PATH,
  SESSION_ONLY_COOKIE,
} from "@/lib/auth/cookies";
import { getSite } from "@/lib/site/get-site";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Min 8 characters"),
  firstName: z.string().trim().min(1, "Enter your first name").max(80),
  lastName: z.string().trim().min(1, "Enter your last name").max(80),
});

/**
 * Base URL for auth redirects. Pinned to configuration only — never derived
 * from request headers, which are attacker-controlled (host-header injection
 * would poison OAuth redirect targets).
 */
async function resolveSiteUrl(): Promise<string> {
  const site = await getSite();
  if (site.id === "bleeq-ca") {
    const bleeq =
      process.env.NEXT_PUBLIC_BLEEQ_SITE_URL?.trim().replace(/\/+$/, "") ?? "";
    if (bleeq) return bleeq;
  }
  if (site.id === "volt-ca") {
    const volt =
      process.env.NEXT_PUBLIC_VOLT_SITE_URL?.trim().replace(/\/+$/, "") ?? "";
    if (volt) return volt;
    return "https://voltcaddy.ca";
  }

  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ?? "";
  if (envUrl) return envUrl;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

async function getRefCode(): Promise<string | null> {
  const c = await cookies();
  return c.get(REFERRAL_COOKIE)?.value ?? null;
}

export async function signUpWithPassword(input: z.infer<typeof credentialsSchema>) {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createSupabaseServerClient();
  const ref = await getRefCode();
  const site = await getSite();

  const fn = parsed.data.firstName.trim();
  const ln = parsed.data.lastName.trim();
  const composed = `${fn} ${ln}`.trim();

  const base = await resolveSiteUrl();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${base}/callback`,
      data: {
        first_name: fn,
        last_name: ln,
        full_name: composed,
        ref,
        site_id: site.id,
      },
    },
  });
  if (error) return { error: error.message };

  // Do not auto-enroll into marketing lists on signup — email may be unverified
  // and account creation is not newsletter consent. Explicit opt-in: /api/newsletter/subscribe.
  void sendAccountWelcomeEmail({
    siteId: site.id,
    toEmail: parsed.data.email,
    firstName: fn,
  }).catch((err) => {
    console.error("account welcome email failed:", err);
  });

  return { ok: true };
}

async function isAdminUser(userId: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle<{ is_admin: boolean }>();
  return !!profile?.is_admin;
}

/** Persist the "Remember me" choice before Supabase writes the auth cookies. */
async function setSessionOnly(sessionOnly: boolean) {
  const c = await cookies();
  if (!sessionOnly) {
    c.delete(SESSION_ONLY_COOKIE);
    return;
  }
  c.set(SESSION_ONLY_COOKIE, "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function signInWithPassword(input: {
  email: string;
  password: string;
  remember?: boolean;
  next?: string;
}) {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(input);
  if (!parsed.success) return { error: "Invalid credentials" };

  const sessionOnly = input.remember === false;
  await setSessionOnly(sessionOnly);
  const supabase = await createSupabaseServerClient({ sessionOnly });
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  const isAdmin = data.user ? await isAdminUser(data.user.id) : false;

  revalidatePath("/", "layout");
  return {
    ok: true as const,
    redirectTo: postLoginPath(sanitizeAuthNext(input.next), isAdmin),
  };
}

function firstNameFromMeta(meta: Record<string, unknown> | undefined): string | undefined {
  if (!meta) return undefined;
  if (typeof meta.first_name === "string" && meta.first_name.trim()) return meta.first_name.trim();
  if (typeof meta.given_name === "string" && meta.given_name.trim()) return meta.given_name.trim();
  const full =
    typeof meta.full_name === "string"
      ? meta.full_name
      : typeof meta.name === "string"
        ? meta.name
        : "";
  return full.trim().split(/\s+/)[0] || undefined;
}

export async function requestPasswordReset(input: { email: string }) {
  const parsed = z.string().trim().email().safeParse(input.email);
  if (!parsed.success) return { error: "Enter a valid email" };

  const email = parsed.data.toLowerCase();
  const site = await getSite();
  const base = await resolveSiteUrl();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${base}/callback?next=${PASSWORD_RESET_PATH}` },
  });
  // Same response whether or not the address has an account.
  if (error) {
    if (error.status === 429) return { error: "Too many attempts. Try again in a few minutes." };
    const missing = error.status === 404 || /not found/i.test(error.message);
    if (!missing) console.error("recovery link failed:", error.status, error.message);
    return { ok: true as const };
  }

  const tokenHash = data.properties?.hashed_token;
  if (!tokenHash) {
    console.error("recovery link missing hashed_token");
    return { ok: true as const };
  }

  const resetUrl = `${base}/callback?${new URLSearchParams({
    token_hash: tokenHash,
    type: "recovery",
    next: PASSWORD_RESET_PATH,
  })}`;
  const sent = await sendPasswordResetEmail({
    siteId: site.id,
    toEmail: email,
    firstName: firstNameFromMeta(data.user?.user_metadata),
    resetUrl,
  });
  if (!sent.ok) {
    console.error("password reset email failed:", sent.error);
    return { error: "Couldn't send the reset email. Try again in a minute." };
  }
  return { ok: true as const };
}

/** Recovery sessions only (cookie set by /callback). Signed-in users change it in Settings. */
export async function resetPassword(input: { password: string }) {
  const parsed = z.string().min(8, "Min 8 characters").max(72).safeParse(input.password);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid password" };

  const c = await cookies();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || c.get(PASSWORD_RESET_COOKIE)?.value !== user.id) {
    return { error: "This reset link has expired. Request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return { error: error.message };

  c.delete(PASSWORD_RESET_COOKIE);
  revalidatePath("/", "layout");
  return {
    ok: true as const,
    redirectTo: postLoginPath("/account", await isAdminUser(user.id)),
  };
}

export async function signInWithGoogle(nextPath = "/account") {
  await setSessionOnly(false);
  const supabase = await createSupabaseServerClient();
  const ref = await getRefCode();
  const base = await resolveSiteUrl();
  const next =
    nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/account";
  const qs = new URLSearchParams();
  if (ref) qs.set("ref", ref);
  if (next !== "/account") qs.set("next", next);
  const q = qs.toString();
  const redirectTo = `${base}/callback${q ? `?${q}` : ""}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, queryParams: ref ? { ref } : undefined },
  });
  if (error) return { error: error.message };
  if (data?.url) redirect(data.url);
  return { ok: true };
}

/** Google Identity Services JWT — consent screen shows our hostname, not *.supabase.co. */
export async function signInWithGoogleIdToken(idToken: string, nextPath = "/account") {
  const token = idToken.trim();
  if (token.length < 20 || token.length > 4096) {
    return { error: "Invalid Google sign-in" };
  }

  await setSessionOnly(false);
  const supabase = await createSupabaseServerClient({ sessionOnly: false });
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token,
  });
  if (error) return { error: error.message };
  if (!data.user) return { error: "Google sign-in failed" };

  const site = await getSite();
  const redirectTo = await finalizeOAuthUser({
    user: data.user,
    siteId: site.id,
    next: nextPath,
  });
  revalidatePath("/", "layout");
  return { ok: true as const, redirectTo };
}

/** Prefer signOutClient() from the browser; this is for <form action={signOut}> only. */
export async function signOut() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut({ scope: "global" });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function _readHeaders() {
  // exported helper to preserve typing in Next 16 (unused but reserved)
  return await headers();
}
