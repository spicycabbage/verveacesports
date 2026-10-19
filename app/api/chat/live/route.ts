import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteFromRequest } from "@/lib/site/get-site";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";
import {
  LIVE_CHAT_COLUMNS,
  canAccessLiveChat,
  createVisitorToken,
  displayName,
  hashVisitorToken,
  insertLiveMessage,
  isMissingLiveChats,
  loadLiveMessages,
  serializeLiveChat,
  type ChatRow,
} from "@/lib/chat/live-agent-server";
import { LIVE_CHAT_TOKEN_HEADER } from "@/lib/chat/live-agent";
import { countRequestedLiveChats, notifyAdminsOfLiveChat } from "@/lib/chat/live-agent-notify";

async function sessionCustomer(): Promise<{
  userId: string | null;
  email: string | null;
  name: string | null;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { userId: null, email: null, name: null };
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, first_name, last_name, email")
      .eq("id", user.id)
      .maybeSingle<{
        full_name: string | null;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
      }>();
    return {
      userId: user.id,
      email: (profile?.email || user.email || "").trim().toLowerCase() || null,
      name: displayName({
        full_name: profile?.full_name,
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        email: profile?.email || user.email,
      }),
    };
  } catch {
    return { userId: null, email: null, name: null };
  }
}

function visitorToken(req: NextRequest): string | null {
  const header = req.headers.get(LIVE_CHAT_TOKEN_HEADER);
  if (header && header.length >= 16 && header.length <= 128) return header;
  return null;
}

/** Resume an open chat (logged-in user or visitor token). */
export async function GET(req: NextRequest) {
  const customer = await sessionCustomer();
  const token = visitorToken(req);
  if (!customer.userId && !token) {
    return NextResponse.json({ chat: null, messages: [] });
  }

  const admin = createSupabaseAdminClient();
  let query = admin
    .from("live_chats")
    .select(LIVE_CHAT_COLUMNS)
    .in("status", ["requested", "active"])
    .order("created_at", { ascending: false })
    .limit(8);

  if (customer.userId) {
    query = query.eq("customer_user_id", customer.userId);
  } else if (token) {
    query = query.eq("visitor_token_hash", hashVisitorToken(token));
  }

  const { data, error } = await query;
  if (error) {
    if (isMissingLiveChats(error.message)) {
      return NextResponse.json({ chat: null, messages: [], needsMigration: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = ((data ?? []) as ChatRow[]).find((chat) =>
    canAccessLiveChat(chat, { userId: customer.userId, token }),
  );
  if (!row) return NextResponse.json({ chat: null, messages: [] });

  const messages = await loadLiveMessages(admin, row.id);
  return NextResponse.json(
    { chat: serializeLiveChat(row), messages },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

/** Request a live agent. Reuses an open chat if one already exists. */
export async function POST(req: NextRequest) {
  const limited = await rateLimit(`live-chat:${clientIp(req)}`, 8, 10 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests, slow down" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const site = getSiteFromRequest(req);
  const customer = await sessionCustomer();
  const existingToken = visitorToken(req);
  const admin = createSupabaseAdminClient();

  if (customer.userId) {
    const { data: open } = await admin
      .from("live_chats")
      .select(LIVE_CHAT_COLUMNS)
      .eq("customer_user_id", customer.userId)
      .in("status", ["requested", "active"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<ChatRow>();
    if (open) {
      const token = existingToken || createVisitorToken();
      if (!existingToken) {
        await admin
          .from("live_chats")
          .update({ visitor_token_hash: hashVisitorToken(token), updated_at: new Date().toISOString() })
          .eq("id", open.id);
      }
      const messages = await loadLiveMessages(admin, open.id);
      return NextResponse.json({
        chat: serializeLiveChat(open),
        messages,
        token: existingToken || token,
      });
    }
  } else if (existingToken) {
    const { data: open } = await admin
      .from("live_chats")
      .select(LIVE_CHAT_COLUMNS)
      .eq("visitor_token_hash", hashVisitorToken(existingToken))
      .in("status", ["requested", "active"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<ChatRow>();
    if (open) {
      const messages = await loadLiveMessages(admin, open.id);
      return NextResponse.json({
        chat: serializeLiveChat(open),
        messages,
        token: existingToken,
      });
    }
  }

  const token = existingToken || createVisitorToken();
  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("live_chats")
    .insert({
      site_id: site.id,
      status: "requested",
      customer_user_id: customer.userId,
      customer_email: customer.email,
      customer_name: customer.name,
      visitor_token_hash: hashVisitorToken(token),
      last_message_at: now,
      last_message_preview: "Live agent requested",
      updated_at: now,
    })
    .select(LIVE_CHAT_COLUMNS)
    .single<ChatRow>();

  if (error || !data) {
    if (isMissingLiveChats(error?.message)) {
      return NextResponse.json(
        { error: "Live chat is not configured — apply migration 0044_live_chats.sql" },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error?.message ?? "Could not start live chat" }, { status: 500 });
  }

  const who = customer.email
    ? `Live agent requested by ${customer.email}.`
    : "Live agent requested (guest).";
  await insertLiveMessage(admin, {
    chatId: data.id,
    senderRole: "system",
    body: who,
  });

  const chat = serializeLiveChat(data);
  const messages = await loadLiveMessages(admin, data.id);
  const pending = await countRequestedLiveChats(admin);
  void notifyAdminsOfLiveChat(admin, chat, pending);

  return NextResponse.json({ chat, messages, token });
}
