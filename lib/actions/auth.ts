"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendAccountWelcomeEmail } from "@/lib/brevo/emails";
import { REFERRAL_COOKIE } from "@/lib/constants";
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

export async function signInWithPassword(input: { email: string; password: string }) {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(input);
  if (!parsed.success) return { error: "Invalid credentials" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signInWithGoogle() {
  const supabase = await createSupabaseServerClient();
  const ref = await getRefCode();
  const base = await resolveSiteUrl();
  const redirectTo = `${base}/callback${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, queryParams: ref ? { ref } : undefined },
  });
  if (error) return { error: error.message };
  if (data?.url) redirect(data.url);
  return { ok: true };
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
