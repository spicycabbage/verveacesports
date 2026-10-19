import {
  LIVE_CHAT_TOKEN_HEADER,
  type LiveChat,
  type LiveChatMessage,
  type LiveChatStatus,
} from "@/lib/chat/live-agent";

export type LiveChatPayload = {
  chat: LiveChat | null;
  messages: LiveChatMessage[];
  token?: string;
  error?: string;
};

function headers(token?: string | null): HeadersInit {
  const h: Record<string, string> = { "content-type": "application/json" };
  if (token) h[LIVE_CHAT_TOKEN_HEADER] = token;
  return h;
}

export async function requestLiveAgent(token?: string | null): Promise<LiveChatPayload> {
  const res = await fetch("/api/chat/live", {
    method: "POST",
    headers: headers(token),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as LiveChatPayload | null;
  if (!res.ok || !data?.chat) {
    throw new Error(data?.error || "Couldn't start live chat");
  }
  return data;
}

export async function fetchCustomerLiveChat(
  id: string,
  token?: string | null,
): Promise<LiveChatPayload> {
  const res = await fetch(`/api/chat/live/${id}`, {
    headers: headers(token),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as LiveChatPayload | null;
  if (!res.ok || !data?.chat) {
    throw new Error(data?.error || "Chat not found");
  }
  return data;
}

export async function fetchOpenCustomerLiveChat(
  token?: string | null,
): Promise<LiveChatPayload> {
  const res = await fetch("/api/chat/live", {
    headers: headers(token),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as LiveChatPayload | null;
  if (!res.ok) throw new Error(data?.error || "Could not load chat");
  return data ?? { chat: null, messages: [] };
}

export async function closeCustomerLiveChat(
  id: string,
  token?: string | null,
): Promise<{ chat: LiveChat | null; deleted: boolean }> {
  const res = await fetch(`/api/chat/live/${id}`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ action: "close" }),
  });
  const data = (await res.json().catch(() => null)) as {
    chat?: LiveChat | null;
    deleted?: boolean;
    error?: string;
  } | null;
  if (!res.ok) throw new Error(data?.error || "Could not close");
  return { chat: data?.chat ?? null, deleted: Boolean(data?.deleted) };
}

export async function sendCustomerLiveMessage(
  id: string,
  body: string,
  token?: string | null,
): Promise<{ chat: LiveChat; message: LiveChatMessage }> {
  const res = await fetch(`/api/chat/live/${id}`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ body }),
  });
  const data = (await res.json().catch(() => null)) as {
    chat?: LiveChat;
    message?: LiveChatMessage;
    error?: string;
  } | null;
  if (!res.ok || !data?.chat || !data.message) {
    throw new Error(data?.error || "Could not send");
  }
  return { chat: data.chat, message: data.message };
}

export async function fetchAdminLiveChats(
  status?: LiveChatStatus | "open" | "all",
): Promise<{ chats: LiveChat[]; viewerId: string | null }> {
  const qs = status && status !== "all" ? `?status=${status}` : "";
  const res = await fetch(`/api/admin/chat/live${qs}`, { cache: "no-store" });
  const data = (await res.json().catch(() => null)) as {
    chats?: LiveChat[];
    viewerId?: string;
    error?: string;
  } | null;
  if (!res.ok) throw new Error(data?.error || "Could not load chats");
  return { chats: data?.chats ?? [], viewerId: data?.viewerId ?? null };
}

export async function fetchAdminLiveChatCounts(): Promise<{
  requested: number;
  active: number;
  attention: number;
  lastCustomerMessageAt: string | null;
  lastChatId: string | null;
  lastPreview: string | null;
  lastCustomerCloseAt: string | null;
  lastCustomerCloseChatId: string | null;
  lastCustomerCloseWho: string | null;
} | null> {
  let res: Response;
  try {
    res = await fetch("/api/admin/chat/live?count=1", { cache: "no-store" });
  } catch {
    return null;
  }
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) return null;
  const data = (await res.json().catch(() => null)) as {
    count?: number;
    requested?: number;
    active?: number;
    attention?: number;
    lastCustomerMessageAt?: string | null;
    lastChatId?: string | null;
    lastPreview?: string | null;
    lastCustomerCloseAt?: string | null;
    lastCustomerCloseChatId?: string | null;
    lastCustomerCloseWho?: string | null;
  } | null;
  if (!data) return null;
  const requested = typeof data.requested === "number" ? data.requested : 0;
  const attention =
    typeof data.attention === "number"
      ? data.attention
      : typeof data.count === "number"
        ? data.count
        : requested;
  return {
    requested,
    active: typeof data.active === "number" ? data.active : 0,
    attention,
    lastCustomerMessageAt: data.lastCustomerMessageAt ?? null,
    lastChatId: data.lastChatId ?? null,
    lastPreview: data.lastPreview ?? null,
    lastCustomerCloseAt: data.lastCustomerCloseAt ?? null,
    lastCustomerCloseChatId: data.lastCustomerCloseChatId ?? null,
    lastCustomerCloseWho: data.lastCustomerCloseWho ?? null,
  };
}

export async function fetchAdminLiveChatCount(): Promise<number | null> {
  const counts = await fetchAdminLiveChatCounts();
  return counts?.attention ?? null;
}

export async function fetchAdminLiveThread(
  id: string,
): Promise<{ chat: LiveChat; messages: LiveChatMessage[]; viewerId: string | null }> {
  const res = await fetch(`/api/admin/chat/live/${id}`, { cache: "no-store" });
  const data = (await res.json().catch(() => null)) as {
    chat?: LiveChat;
    messages?: LiveChatMessage[];
    viewerId?: string;
    error?: string;
  } | null;
  if (!res.ok || !data?.chat) throw new Error(data?.error || "Not found");
  return { chat: data.chat, messages: data.messages ?? [], viewerId: data.viewerId ?? null };
}

export async function postAdminLiveAction(
  id: string,
  action: "accept" | "close" | "message",
  body?: string,
): Promise<{ chat: LiveChat; messages?: LiveChatMessage[]; message?: LiveChatMessage }> {
  const res = await fetch(`/api/admin/chat/live/${id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, body }),
  });
  const data = (await res.json().catch(() => null)) as {
    chat?: LiveChat;
    messages?: LiveChatMessage[];
    message?: LiveChatMessage;
    error?: string;
  } | null;
  if (!res.ok || !data?.chat) throw new Error(data?.error || "Request failed");
  return { chat: data.chat, messages: data.messages, message: data.message };
}
