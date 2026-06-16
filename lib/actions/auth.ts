"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { REFERRAL_COOKIE } from "@/lib/constants";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Min 8 characters"),
  firstName: z.string().trim().min(1, "Enter your first name").max(80),
  lastName: z.string().trim().min(1, "Enter your last name").max(80),
});

const emailOnlySchema = z.object({ email: z.string().email() });

/** Base URL for auth redirects — never send localhost links from prod. */
async function resolveSiteUrl(): Promise<string> {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ?? "";
  if (
    envUrl &&
    !/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(envUrl)
  ) {
    return envUrl;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel && !/^localhost/i.test(vercel)) {
    return `https://${vercel}`;
  }

  const h = await headers();
  const host =
    h.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    h.get("host")?.trim() ??
    "";
  let proto =
    (h.get("x-forwarded-proto") ?? "").split(",")[0]?.trim().toLowerCase() ?? "";
  if (host && !/^(localhost|127\.0\.0\.1)(:|$)/.test(host)) {
    if (proto !== "http" && proto !== "https") proto = "https";
    return `${proto}://${host}`;
  }

  if (envUrl) return envUrl;
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
      },
    },
  });
  if (error) return { error: error.message };
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

export async function signInWithMagicLink(input: { email: string }) {
  const parsed = emailOnlySchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid email" };

  const supabase = await createSupabaseServerClient();
  const ref = await getRefCode();
  const base = await resolveSiteUrl();

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${base}/callback`,
      data: { ref },
    },
  });
  if (error) return { error: error.message };
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
