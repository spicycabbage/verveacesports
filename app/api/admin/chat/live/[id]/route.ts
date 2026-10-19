import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  LIVE_CHAT_COLUMNS,
  displayName,
  insertLiveMessage,
  isAssignedLiveAgent,
  isMissingLiveChats,
  loadLiveChatRow,
  loadLiveMessages,
  serializeLiveChat,
  type ChatRow,
} from "@/lib/chat/live-agent-server";

async function adminProfile(userId: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("full_name, first_name, last_name, email")
    .eq("id", userId)
    .maybeSingle<{
      full_name: string | null;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    }>();
  return {
    email: data?.email?.trim() || null,
    name: displayName({
      full_name: data?.full_name,
      first_name: data?.first_name,
      last_name: data?.last_name,
      email: data?.email,
    }),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const row = await loadLiveChatRow(admin, id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await loadLiveMessages(admin, row.id);
  return NextResponse.json(
    {
      chat: serializeLiveChat(row, { includeAdminEmail: true }),
      messages,
      viewerId: guard.userId,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

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

  const profile = await adminProfile(guard.userId);
  const now = new Date().toISOString();

  if (action === "accept") {
    if (row.status === "closed") {
      return NextResponse.json({ error: "This conversation is closed" }, { status: 409 });
    }
    if (row.status === "active") {
      const messages = await loadLiveMessages(admin, row.id);
      return NextResponse.json({
        chat: serializeLiveChat(row, { includeAdminEmail: true }),
        messages,
      });
    }

    const { data: taken, error } = await admin
      .from("live_chats")
      .update({
        status: "active",
        accepted_by: guard.userId,
        accepted_by_email: profile.email,
        accepted_by_name: profile.name,
        accepted_at: now,
        updated_at: now,
      })
      .eq("id", row.id)
      .eq("status", "requested")
      .select(LIVE_CHAT_COLUMNS)
      .maybeSingle<ChatRow>();

    if (error) {
      if (isMissingLiveChats(error.message)) {
        return NextResponse.json({ error: "Apply migration 0044_live_chats.sql" }, { status: 503 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const current = taken ?? (await loadLiveChatRow(admin, row.id));
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (taken) {
      await insertLiveMessage(admin, {
        chatId: row.id,
        senderRole: "system",
        senderUserId: guard.userId,
        senderEmail: profile.email,
        body: `${profile.name || "An agent"} accepted this chat.`,
      });
    }

    const latest = (await loadLiveChatRow(admin, row.id)) ?? current;
    const messages = await loadLiveMessages(admin, row.id);
    return NextResponse.json({
      chat: serializeLiveChat(latest, { includeAdminEmail: true }),
      messages,
    });
  }

  if (action === "close") {
    if (row.status === "active" && !isAssignedLiveAgent(row, guard.userId)) {
      return NextResponse.json(
        { error: "Only the assigned agent can close this chat" },
        { status: 403 },
      );
    }
    if (row.status === "closed") {
      const messages = await loadLiveMessages(admin, row.id);
      return NextResponse.json({
        chat: serializeLiveChat(row, { includeAdminEmail: true }),
        messages,
      });
    }

    const { error } = await admin
      .from("live_chats")
      .update({
        status: "closed",
        closed_by: guard.userId,
        closed_at: now,
        updated_at: now,
      })
      .eq("id", row.id)
      .neq("status", "closed");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await insertLiveMessage(admin, {
      chatId: row.id,
      senderRole: "system",
      senderUserId: guard.userId,
      senderEmail: profile.email,
      body: `${profile.name || "An agent"} closed this conversation.`,
    });

    const latest = await loadLiveChatRow(admin, row.id);
    const messages = await loadLiveMessages(admin, row.id);
    return NextResponse.json({
      chat: latest ? serializeLiveChat(latest, { includeAdminEmail: true }) : serializeLiveChat(row),
      messages,
    });
  }

  if (action === "message") {
    if (row.status === "closed") {
      return NextResponse.json({ error: "This conversation is closed" }, { status: 409 });
    }
    if (row.status === "requested") {
      return NextResponse.json({ error: "Accept the chat before replying" }, { status: 409 });
    }
    if (!isAssignedLiveAgent(row, guard.userId)) {
      return NextResponse.json(
        { error: "Only the assigned agent can reply" },
        { status: 403 },
      );
    }

    const { message, error } = await insertLiveMessage(admin, {
      chatId: row.id,
      senderRole: "admin",
      senderUserId: guard.userId,
      senderEmail: profile.email,
      body,
    });
    if (error || !message) {
      return NextResponse.json({ error: error ?? "Could not send" }, { status: 400 });
    }

    const latest = await loadLiveChatRow(admin, row.id);
    return NextResponse.json({
      chat: latest ? serializeLiveChat(latest, { includeAdminEmail: true }) : serializeLiveChat(row),
      message,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
