import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";
import { LIVE_CHAT_TOKEN_HEADER } from "@/lib/chat/live-agent";
import {
  canAccessLiveChat,
  endCustomerLiveChat,
  insertLiveMessage,
  isMissingLiveChats,
  loadLiveChatRow,
  loadLiveMessages,
  serializeLiveChat,
} from "@/lib/chat/live-agent-server";
import {
  liveChatAdminStats,
  notifyAdminsOfLiveClosed,
  notifyAdminsOfLiveMessage,
} from "@/lib/chat/live-agent-notify";

async function sessionUserId(): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

function visitorToken(req: NextRequest): string | null {
  const header = req.headers.get(LIVE_CHAT_TOKEN_HEADER);
  if (header && header.length >= 16 && header.length <= 128) return header;
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing chat" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const row = await loadLiveChatRow(admin, id);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const userId = await sessionUserId();
  const token = visitorToken(req);
  if (!canAccessLiveChat(row, { userId, token })) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await loadLiveMessages(admin, row.id);
  return NextResponse.json(
    { chat: serializeLiveChat(row), messages },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = await rateLimit(`live-chat-msg:${clientIp(req)}`, 40, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many messages, slow down" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const { id } = await params;
  const json = await req.json().catch(() => null);
  const action =
    typeof json === "object" && json && "action" in json && typeof json.action === "string"
      ? json.action
      : "";
  const body =
    typeof json === "object" && json && "body" in json && typeof json.body === "string"
      ? json.body
      : "";

  const admin = createSupabaseAdminClient();
  const row = await loadLiveChatRow(admin, id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = await sessionUserId();
  const token = visitorToken(req);
  if (!canAccessLiveChat(row, { userId, token })) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "close") {
    const result = await endCustomerLiveChat(admin, row, userId);
    if (result.error) {
      if (isMissingLiveChats(result.error)) {
        return NextResponse.json({ error: "Live chat is not configured" }, { status: 503 });
      }
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    if (result.chat && !result.alreadyClosed) {
      void notifyAdminsOfLiveClosed(admin, result.chat);
    }
    return NextResponse.json({ chat: result.chat, deleted: false });
  }

  if (row.status === "closed") {
    return NextResponse.json({ error: "This conversation is closed" }, { status: 409 });
  }

  const { message, error } = await insertLiveMessage(admin, {
    chatId: row.id,
    senderRole: "customer",
    senderUserId: userId,
    senderEmail: row.customer_email,
    body,
  });
  if (error || !message) {
    if (isMissingLiveChats(error ?? undefined)) {
      return NextResponse.json({ error: "Live chat is not configured" }, { status: 503 });
    }
    return NextResponse.json({ error: error ?? "Could not send" }, { status: 400 });
  }

  const latest = await loadLiveChatRow(admin, row.id);
  const chat = latest ? serializeLiveChat(latest) : serializeLiveChat(row);
  void liveChatAdminStats(admin).then((stats) =>
    notifyAdminsOfLiveMessage(admin, chat, message.body, stats.attention),
  );
  return NextResponse.json({ chat, message });
}
