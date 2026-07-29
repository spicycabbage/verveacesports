import { NextResponse, type NextRequest } from "next/server";
import { sendNewsletterWelcomeEmail } from "@/lib/brevo/emails";
import { subscribeToBrevoList } from "@/lib/brevo/subscribe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteFromRequest } from "@/lib/site/get-site";
import type { SiteId } from "@/lib/site/config";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function recordLocalSubscriber(email: string, source: string, siteId: SiteId) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("newsletter_subscribers").upsert(
    {
      email,
      source,
      site_id: siteId,
    },
    { onConflict: "email,site_id", ignoreDuplicates: true },
  );

  if (error) {
    console.error("newsletter local record failed:", error.message);
  }
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(`newsletter:${clientIp(request)}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts, try again shortly" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email =
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof (body as { email: unknown }).email === "string"
      ? (body as { email: string }).email.trim().toLowerCase()
      : null;

  const source =
    typeof body === "object" &&
    body !== null &&
    "source" in body &&
    typeof (body as { source: unknown }).source === "string"
      ? (body as { source: string }).source.trim().slice(0, 64)
      : "popup";

  const site = getSiteFromRequest(request);

  if (!email || !EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const channel = source || "popup";
  const brevo = await subscribeToBrevoList(email, {
    siteId: site.id,
    source: channel,
  });
  if (!brevo.ok) {
    return NextResponse.json({ error: brevo.error }, { status: 503 });
  }

  await recordLocalSubscriber(email, channel, site.id);

  if (brevo.created) {
    void sendNewsletterWelcomeEmail({
      siteId: site.id,
      toEmail: email,
    }).catch((err) => {
      console.error("newsletter welcome email failed:", err);
    });
  }

  return NextResponse.json({
    ok: true,
    alreadySubscribed: !brevo.created,
    siteId: site.id,
  });
}
