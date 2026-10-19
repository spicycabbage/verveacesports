import type { SupabaseClient } from "@supabase/supabase-js";
import { siteBaseUrl } from "@/lib/brevo/emails";

export type AdminPushPayload = {
  title: string;
  body: string;
  url: string;
  badgeCount: number;
  silent?: boolean;
  channelId?: string;
};

type PushRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

function vapidConfig(): { publicKey: string; privateKey: string; subject: string } | null {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject =
    process.env.VAPID_SUBJECT?.trim() || "mailto:ming@verveacesports.com";
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

export function vapidPublicKey(): string | null {
  return vapidConfig()?.publicKey ?? null;
}

export async function sendWebPushToAdmins(
  admin: SupabaseClient,
  payload: AdminPushPayload,
  onlyUserId?: string | null,
): Promise<void> {
  const vapid = vapidConfig();
  if (!vapid) return;

  let query = admin.from("admin_push_subscriptions").select("id, endpoint, p256dh, auth");
  if (onlyUserId) query = query.eq("user_id", onlyUserId);
  const { data: rows, error } = await query;
  if (error) {
    console.error("load push subscriptions failed:", error.message);
    return;
  }
  if (!rows?.length) return;

  const webpush = await import("web-push");
  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const origin = siteBaseUrl("verveace");
  const body = JSON.stringify({
    ...payload,
    url: payload.url.startsWith("http") ? payload.url : `${origin}${payload.url}`,
  });

  await Promise.all(
    (rows as PushRow[]).map(async (row) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: row.endpoint,
            keys: { p256dh: row.p256dh, auth: row.auth },
          },
          body,
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await admin.from("admin_push_subscriptions").delete().eq("id", row.id);
          return;
        }
        console.error("web push send failed:", err instanceof Error ? err.message : err);
      }
    }),
  );
}
