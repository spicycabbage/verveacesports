import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminPushPayload } from "@/lib/admin/web-push";

type TokenRow = { id: string; token: string };

/** APK WebView session lives on Bleeq. Never deep-link Expo taps to verveacesports.com. */
function expoAdminOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_BLEEQ_SITE_URL?.trim().replace(/\/+$/, "") ||
    "https://ca.bleequp.com"
  );
}

function expoAdminUrl(payloadUrl: string): string {
  const origin = expoAdminOrigin();
  try {
    const parsed = payloadUrl.startsWith("http")
      ? new URL(payloadUrl)
      : new URL(payloadUrl.startsWith("/") ? payloadUrl : `/${payloadUrl}`, origin);
    return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return `${origin}${payloadUrl.startsWith("/") ? payloadUrl : `/${payloadUrl}`}`;
  }
}

export async function sendExpoPushToAdmins(
  admin: SupabaseClient,
  payload: AdminPushPayload,
  onlyUserId?: string | null,
): Promise<void> {
  let query = admin.from("admin_expo_push_tokens").select("id, token");
  if (onlyUserId) query = query.eq("user_id", onlyUserId);
  const { data: rows, error } = await query;
  if (error) {
    if (error.message.includes("admin_expo_push_tokens")) return;
    console.error("load expo push tokens failed:", error.message);
    return;
  }
  if (!rows?.length) return;

  const url = expoAdminUrl(payload.url);
  const tokens = rows as TokenRow[];

  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      accept: "application/json",
      "accept-encoding": "gzip, deflate",
      "content-type": "application/json",
    },
    body: JSON.stringify(
      tokens.map((row) => ({
        to: row.token,
        title: payload.silent ? undefined : payload.title,
        body: payload.silent ? undefined : payload.body,
        data: { url, badgeCount: payload.badgeCount, silent: Boolean(payload.silent) },
        badge: payload.badgeCount,
        sound: payload.silent ? null : "default",
        channelId: payload.channelId ?? "orders",
        priority: "high",
      })),
    ),
  });
  if (!res.ok) {
    console.error("expo push send failed:", res.status, await res.text());
    return;
  }

  const json = (await res.json()) as {
    data?: { status?: string; details?: { error?: string } }[];
  };
  await Promise.all(
    (json.data ?? []).map(async (ticket, i) => {
      if (ticket.details?.error !== "DeviceNotRegistered") return;
      const id = tokens[i]?.id;
      if (id) await admin.from("admin_expo_push_tokens").delete().eq("id", id);
    }),
  );
}
