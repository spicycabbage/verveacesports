import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  LIVE_CHAT_COLUMNS,
  isMissingLiveChats,
  serializeLiveChat,
  type ChatRow,
} from "@/lib/chat/live-agent-server";
import { liveChatAdminStats } from "@/lib/chat/live-agent-notify";
import type { LiveChatStatus } from "@/lib/chat/live-agent";

const STATUSES = new Set<LiveChatStatus>(["requested", "active", "closed"]);

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const admin = createSupabaseAdminClient();
  const countOnly = req.nextUrl.searchParams.get("count") === "1";
  if (countOnly) {
    const stats = await liveChatAdminStats(admin, guard.userId);
    return NextResponse.json(
      { count: stats.attention, ...stats },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  const statusParam = req.nextUrl.searchParams.get("status");
  const status = statusParam && STATUSES.has(statusParam as LiveChatStatus)
    ? (statusParam as LiveChatStatus)
    : undefined;
  const openOnly = statusParam === "open";

  let query = admin
    .from("live_chats")
    .select(LIVE_CHAT_COLUMNS)
    .order("last_message_at", { ascending: false })
    .limit(80);
  if (openOnly) query = query.in("status", ["requested", "active"]);
  else if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    if (isMissingLiveChats(error.message)) {
      return NextResponse.json(
        { chats: [], needsMigration: true, error: "Apply migration 0044_live_chats.sql" },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      viewerId: guard.userId,
      chats: ((data ?? []) as ChatRow[]).map((row) =>
        serializeLiveChat(row, { includeAdminEmail: true }),
      ),
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
