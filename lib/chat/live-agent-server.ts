import { createHash, randomBytes, timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SiteId } from "@/lib/site/config";
import type { LiveChat, LiveChatMessage, LiveChatSender, LiveChatStatus } from "@/lib/chat/live-agent";

export function createVisitorToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashVisitorToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function tokensMatch(token: string, hash: string): boolean {
  const left = Buffer.from(hashVisitorToken(token), "hex");
  const right = Buffer.from(hash, "hex");
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
}

export function previewOf(body: string): string {
  const t = body.replace(/\s+/g, " ").trim();
  return t.length > 140 ? `${t.slice(0, 137)}…` : t;
}

export function displayName(input: {
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}): string | null {
  const full = input.full_name?.trim();
  if (full) return full;
  const parts = [input.first_name, input.last_name]
    .map((p) => p?.trim())
    .filter(Boolean);
  if (parts.length) return parts.join(" ");
  const email = input.email?.trim();
  if (email) return email.split("@")[0] ?? email;
  return null;
}

type ChatRow = {
  id: string;
  site_id: SiteId;
  status: LiveChatStatus;
  customer_user_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  visitor_token_hash: string;
  accepted_by: string | null;
  accepted_by_email: string | null;
  accepted_by_name: string | null;
  accepted_at: string | null;
  closed_by: string | null;
  closed_at: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  chat_id: string;
  sender_role: LiveChatSender;
  sender_user_id: string | null;
  sender_email: string | null;
  body: string;
  created_at: string;
};

export const LIVE_CHAT_COLUMNS =
  "id, site_id, status, customer_user_id, customer_email, customer_name, visitor_token_hash, accepted_by, accepted_by_email, accepted_by_name, accepted_at, closed_by, closed_at, last_message_at, last_message_preview, created_at, updated_at";

export const LIVE_MESSAGE_COLUMNS =
  "id, chat_id, sender_role, sender_user_id, sender_email, body, created_at";

export function serializeLiveChat(row: ChatRow, opts?: { includeAdminEmail?: boolean }): LiveChat {
  return {
    id: row.id,
    siteId: row.site_id,
    status: row.status,
    customerUserId: row.customer_user_id,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    acceptedBy: row.accepted_by,
    acceptedByEmail: opts?.includeAdminEmail ? row.accepted_by_email : null,
    acceptedByName: row.accepted_by_name,
    acceptedAt: row.accepted_at,
    closedAt: row.closed_at,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview,
    createdAt: row.created_at,
  };
}

export function serializeLiveMessage(row: MessageRow): LiveChatMessage {
  return {
    id: row.id,
    chatId: row.chat_id,
    senderRole: row.sender_role,
    senderUserId: row.sender_user_id,
    senderEmail: row.sender_email,
    body: row.body,
    createdAt: row.created_at,
  };
}

export function isAssignedLiveAgent(row: ChatRow, userId: string): boolean {
  return Boolean(row.accepted_by && row.accepted_by === userId);
}

export function canAccessLiveChat(
  row: ChatRow,
  auth: { userId: string | null; token: string | null },
): boolean {
  if (auth.userId && row.customer_user_id === auth.userId) return true;
  if (auth.token && tokensMatch(auth.token, row.visitor_token_hash)) return true;
  return false;
}

export async function insertLiveMessage(
  admin: SupabaseClient,
  input: {
    chatId: string;
    senderRole: LiveChatSender;
    senderUserId?: string | null;
    senderEmail?: string | null;
    body: string;
  },
): Promise<{ message: LiveChatMessage | null; error: string | null }> {
  const body = input.body.trim();
  if (!body) return { message: null, error: "Empty message" };
  if (body.length > 4000) return { message: null, error: "Message too long" };

  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("live_chat_messages")
    .insert({
      chat_id: input.chatId,
      sender_role: input.senderRole,
      sender_user_id: input.senderUserId ?? null,
      sender_email: input.senderEmail ?? null,
      body,
    })
    .select(LIVE_MESSAGE_COLUMNS)
    .single<MessageRow>();

  if (error || !data) {
    return { message: null, error: error?.message ?? "Could not send" };
  }

  await admin
    .from("live_chats")
    .update({
      last_message_at: now,
      last_message_preview: previewOf(body),
      updated_at: now,
    })
    .eq("id", input.chatId);

  return { message: serializeLiveMessage(data), error: null };
}

export async function loadLiveMessages(
  admin: SupabaseClient,
  chatId: string,
): Promise<LiveChatMessage[]> {
  const { data } = await admin
    .from("live_chat_messages")
    .select(LIVE_MESSAGE_COLUMNS)
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })
    .limit(200);
  return ((data ?? []) as MessageRow[]).map(serializeLiveMessage);
}

export async function loadLiveChatRow(
  admin: SupabaseClient,
  id: string,
): Promise<ChatRow | null> {
  const { data } = await admin
    .from("live_chats")
    .select(LIVE_CHAT_COLUMNS)
    .eq("id", id)
    .maybeSingle<ChatRow>();
  return data ?? null;
}

export const CUSTOMER_LEFT_MESSAGE = "Customer left this conversation.";

/** Archive the shopper's live thread. */
export async function endCustomerLiveChat(
  admin: SupabaseClient,
  row: ChatRow,
  customerUserId: string | null,
): Promise<{ alreadyClosed: boolean; chat: LiveChat | null; error: string | null }> {
  if (row.status === "closed") {
    return { alreadyClosed: true, chat: serializeLiveChat(row), error: null };
  }

  const now = new Date().toISOString();
  const { error } = await admin
    .from("live_chats")
    .update({
      status: "closed",
      closed_by: customerUserId,
      closed_at: now,
      updated_at: now,
    })
    .eq("id", row.id)
    .neq("status", "closed");

  if (error) return { alreadyClosed: false, chat: serializeLiveChat(row), error: error.message };

  await insertLiveMessage(admin, {
    chatId: row.id,
    senderRole: "system",
    senderUserId: customerUserId,
    senderEmail: row.customer_email,
    body: CUSTOMER_LEFT_MESSAGE,
  });

  const latest = await loadLiveChatRow(admin, row.id);
  return {
    alreadyClosed: false,
    chat: latest ? serializeLiveChat(latest) : serializeLiveChat({ ...row, status: "closed" }),
    error: null,
  };
}

export function isMissingLiveChats(message: string | undefined): boolean {
  if (!message) return false;
  return (
    message.includes("live_chats") ||
    message.includes("live_chat_messages") ||
    message.includes("does not exist")
  );
}

export type { ChatRow, MessageRow };
