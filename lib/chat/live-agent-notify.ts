import type { SupabaseClient } from "@supabase/supabase-js";
import { sendExpoPushToAdmins } from "@/lib/admin/expo-push";
import { sendWebPushToAdmins } from "@/lib/admin/web-push";
import type { LiveChat } from "@/lib/chat/live-agent";
import { CUSTOMER_LEFT_MESSAGE } from "@/lib/chat/live-agent-server";

export async function notifyAdminsOfLiveChat(
  admin: SupabaseClient,
  chat: LiveChat,
  pendingCount: number,
): Promise<void> {
  try {
    const who = chat.customerEmail || chat.customerName || "Guest";
    const push = {
      title: "Live agent requested",
      body: who,
      url: `/admin/chat?chat=${chat.id}`,
      badgeCount: pendingCount,
      channelId: "support",
    };
    await Promise.all([sendWebPushToAdmins(admin, push), sendExpoPushToAdmins(admin, push)]);
  } catch (err) {
    console.error("live chat admin notify failed:", err);
  }
}

export async function notifyAdminsOfLiveClosed(
  admin: SupabaseClient,
  chat: LiveChat,
): Promise<void> {
  try {
    const who = chat.customerEmail || chat.customerName || "Guest";
    const push = {
      title: "User have closed chat.",
      body: who,
      url: `/admin/chat?chat=${chat.id}`,
      badgeCount: 0,
      channelId: "support",
    };
    const onlyUserId = chat.acceptedBy;
    await Promise.all([
      sendWebPushToAdmins(admin, push, onlyUserId),
      sendExpoPushToAdmins(admin, push, onlyUserId),
    ]);
  } catch (err) {
    console.error("live chat closed notify failed:", err);
  }
}

export async function notifyAdminsOfLiveMessage(
  admin: SupabaseClient,
  chat: LiveChat,
  body: string,
  attentionCount: number,
): Promise<void> {
  try {
    const who = chat.customerEmail || chat.customerName || "Guest";
    const preview = body.replace(/\s+/g, " ").trim();
    const snippet = preview.length > 80 ? `${preview.slice(0, 77)}…` : preview;
    const push = {
      title: "New chat message",
      body: snippet ? `${who}: ${snippet}` : who,
      url: `/admin/chat?chat=${chat.id}`,
      badgeCount: attentionCount,
      channelId: "support",
    };
    const onlyUserId = chat.acceptedBy;
    await Promise.all([
      sendWebPushToAdmins(admin, push, onlyUserId),
      sendExpoPushToAdmins(admin, push, onlyUserId),
    ]);
  } catch (err) {
    console.error("live chat message notify failed:", err);
  }
}

export type LiveChatAdminStats = {
  requested: number;
  active: number;
  attention: number;
  lastCustomerMessageAt: string | null;
  lastChatId: string | null;
  lastPreview: string | null;
  lastCustomerCloseAt: string | null;
  lastCustomerCloseChatId: string | null;
  lastCustomerCloseWho: string | null;
};

export async function liveChatAdminStats(
  admin: SupabaseClient,
  viewerId?: string | null,
): Promise<LiveChatAdminStats> {
  const [requested, active, closed] = await Promise.all([
    countLiveChatsByStatus(admin, "requested"),
    countLiveChatsByStatus(admin, "active"),
    lastCustomerCloseForViewer(admin, viewerId),
  ]);

  const empty: LiveChatAdminStats = {
    requested,
    active,
    attention: requested,
    lastCustomerMessageAt: null,
    lastChatId: null,
    lastPreview: null,
    ...closed,
  };

  const { data: open, error: openError } = await admin
    .from("live_chats")
    .select("id, status, accepted_by")
    .in("status", ["requested", "active"])
    .limit(80);
  if (openError || !open?.length) {
    if (openError) console.error("live chat open list failed:", openError.message);
    return empty;
  }

  const relevant = open.filter((row) => {
    if (row.status === "requested") return true;
    if (!viewerId) return true;
    return row.accepted_by === viewerId;
  });
  const ids = relevant.map((row) => row.id as string);
  if (!ids.length) return empty;

  const { data: msgs, error: msgError } = await admin
    .from("live_chat_messages")
    .select("chat_id, sender_role, created_at, body")
    .in("chat_id", ids)
    .order("created_at", { ascending: false })
    .limit(400);
  if (msgError) {
    console.error("live chat message scan failed:", msgError.message);
    return empty;
  }

  const latest = new Map<string, { sender_role: string }>();
  let lastCustomerMessageAt: string | null = null;
  let lastChatId: string | null = null;
  let lastPreview: string | null = null;
  for (const row of msgs ?? []) {
    const chatId = String(row.chat_id);
    if (!latest.has(chatId)) latest.set(chatId, { sender_role: String(row.sender_role) });
    if (row.sender_role !== "customer") continue;
    const at = String(row.created_at);
    if (!lastCustomerMessageAt || at > lastCustomerMessageAt) {
      lastCustomerMessageAt = at;
      lastChatId = chatId;
      lastPreview = typeof row.body === "string" ? row.body : null;
    }
  }

  let attention = 0;
  for (const row of relevant) {
    const last = latest.get(String(row.id));
    if (row.status === "requested") attention += 1;
    else if (row.status === "active" && last?.sender_role === "customer") attention += 1;
  }

  return {
    requested,
    active,
    attention,
    lastCustomerMessageAt,
    lastChatId,
    lastPreview,
    ...closed,
  };
}

async function lastCustomerCloseForViewer(
  admin: SupabaseClient,
  viewerId?: string | null,
): Promise<{
  lastCustomerCloseAt: string | null;
  lastCustomerCloseChatId: string | null;
  lastCustomerCloseWho: string | null;
}> {
  const none = {
    lastCustomerCloseAt: null,
    lastCustomerCloseChatId: null,
    lastCustomerCloseWho: null,
  };
  const { data, error } = await admin
    .from("live_chats")
    .select("id, closed_at, accepted_by, customer_email, customer_name, last_message_preview")
    .eq("status", "closed")
    .eq("last_message_preview", CUSTOMER_LEFT_MESSAGE)
    .order("closed_at", { ascending: false })
    .limit(12);
  if (error || !data?.length) {
    if (error) console.error("live chat close scan failed:", error.message);
    return none;
  }
  const row = data.find((r) => !r.accepted_by || !viewerId || r.accepted_by === viewerId);
  if (!row?.closed_at) return none;
  return {
    lastCustomerCloseAt: String(row.closed_at),
    lastCustomerCloseChatId: String(row.id),
    lastCustomerCloseWho:
      (typeof row.customer_email === "string" && row.customer_email) ||
      (typeof row.customer_name === "string" && row.customer_name) ||
      "Guest",
  };
}

export async function countLiveChatsByStatus(
  admin: SupabaseClient,
  status: "requested" | "active" | "closed",
): Promise<number> {
  const { count, error } = await admin
    .from("live_chats")
    .select("id", { count: "exact", head: true })
    .eq("status", status);
  if (error) {
    console.error(`live chat ${status} count failed:`, error.message);
    return 0;
  }
  return count ?? 0;
}

export async function countRequestedLiveChats(admin: SupabaseClient): Promise<number> {
  return countLiveChatsByStatus(admin, "requested");
}
