import type { SiteId } from "@/lib/site/config";

export const LIVE_CHAT_STORAGE_KEY = "verveace-live-chat";
export const LIVE_CHAT_SEEN_KEY = "verveace-live-chat-seen";
export const LIVE_CHAT_TOKEN_HEADER = "x-live-chat-token";

export type LiveChatStatus = "requested" | "active" | "closed";
export type LiveChatSender = "customer" | "admin" | "system";

export type LiveChat = {
  id: string;
  siteId: SiteId;
  status: LiveChatStatus;
  customerUserId: string | null;
  customerEmail: string | null;
  customerName: string | null;
  acceptedBy: string | null;
  acceptedByEmail: string | null;
  acceptedByName: string | null;
  acceptedAt: string | null;
  closedAt: string | null;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  createdAt: string;
};

export type LiveChatMessage = {
  id: string;
  chatId: string;
  senderRole: LiveChatSender;
  senderUserId: string | null;
  senderEmail: string | null;
  body: string;
  createdAt: string;
};

export type LiveChatSession = {
  chat: LiveChat;
  messages: LiveChatMessage[];
  token?: string;
};

export type StoredLiveChat = {
  id: string;
  token: string;
};

/** Short handoff phrases — long questions that mention "agent" still go to the AI. */
export function isLiveAgentIntent(text: string): boolean {
  const t = text
    .trim()
    .toLowerCase()
    .replace(/[!?.,]+$/g, "")
    .trim();
  if (!t || t.length > 160) return false;
  if (/\blive\s+agent\b/.test(t)) return true;
  if (/\bhuman\s+agent\b/.test(t)) return true;
  if (
    /\b(talk|speak|chat|connect|get)\s+(to\s+|with\s+)?(a\s+|an\s+)?(live\s+)?agent\b/.test(
      t,
    )
  ) {
    return true;
  }
  if (/^(please\s+)?(a\s+|an\s+)?agent$/.test(t)) return true;
  if (/^(i\s+)?(want|need|would like)\s+(a\s+|an\s+)?(live\s+)?agent$/.test(t)) {
    return true;
  }
  return false;
}

export function readStoredLiveChat(): StoredLiveChat | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LIVE_CHAT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredLiveChat>;
    if (
      typeof parsed.id === "string" &&
      parsed.id.length > 0 &&
      typeof parsed.token === "string" &&
      parsed.token.length >= 16
    ) {
      return { id: parsed.id, token: parsed.token };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function writeStoredLiveChat(session: StoredLiveChat) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LIVE_CHAT_STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

export function clearStoredLiveChat() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LIVE_CHAT_STORAGE_KEY);
    sessionStorage.removeItem(LIVE_CHAT_SEEN_KEY);
  } catch {
    /* ignore */
  }
}

export type SeenLiveChat = {
  chatId: string;
  status: LiveChatStatus;
  lastAdminId: string | null;
};

export function readSeenLiveChat(): SeenLiveChat | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LIVE_CHAT_SEEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SeenLiveChat>;
    if (
      typeof parsed.chatId === "string" &&
      (parsed.status === "requested" || parsed.status === "active" || parsed.status === "closed")
    ) {
      return {
        chatId: parsed.chatId,
        status: parsed.status,
        lastAdminId: typeof parsed.lastAdminId === "string" ? parsed.lastAdminId : null,
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function writeSeenLiveChat(seen: SeenLiveChat) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(LIVE_CHAT_SEEN_KEY, JSON.stringify(seen));
  } catch {
    /* ignore */
  }
}

export function latestAdminMessageId(messages: LiveChatMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.senderRole === "admin") return messages[i]!.id;
  }
  return null;
}
