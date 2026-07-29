import { subscribeToBrevoList } from "@/lib/brevo/subscribe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SiteId } from "@/lib/site/config";

export type MarketingContactInput = {
  email: string;
  siteId: SiteId;
  source: string;
  firstName?: string;
  lastName?: string;
};

/**
 * Add contact to the storefront's Brevo list + local newsletter_subscribers.
 * Failures are logged; callers should not block signup on marketing sync errors.
 */
export async function syncMarketingContact(input: MarketingContactInput): Promise<void> {
  const email = input.email.trim().toLowerCase();
  if (!email) return;

  const source = input.source.trim().slice(0, 64) || "account-signup";

  try {
    const brevo = await subscribeToBrevoList(email, {
      siteId: input.siteId,
      source,
      firstName: input.firstName,
      lastName: input.lastName,
    });
    if (!brevo.ok) {
      console.error("marketing sync Brevo failed:", brevo.error);
      // Still record locally so we can backfill Brevo later.
    }
  } catch (err) {
    console.error("marketing sync Brevo threw:", err);
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("newsletter_subscribers").upsert(
      {
        email,
        source,
        site_id: input.siteId,
      },
      { onConflict: "email,site_id", ignoreDuplicates: true },
    );
    if (error) {
      console.error("marketing sync local record failed:", error.message);
    }
  } catch (err) {
    console.error("marketing sync local threw:", err);
  }
}
