"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Headset, Loader2, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils/format";
import { SITES } from "@/lib/site/config";
import type { LiveChat, LiveChatMessage, LiveChatStatus } from "@/lib/chat/live-agent";
import {
  fetchAdminLiveChatCounts,
  fetchAdminLiveChats,
  fetchAdminLiveThread,
  postAdminLiveAction,
} from "@/lib/chat/live-agent-client";
import { cn } from "@/lib/utils";

type InboxFilter = LiveChatStatus | "all";

const FILTERS: { id: InboxFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "requested", label: "Waiting" },
  { id: "active", label: "Active" },
  { id: "closed", label: "Archived" },
];

function customerLabel(chat: LiveChat): string {
  return chat.customerEmail || chat.customerName || "Guest";
}

function statusTone(status: LiveChatStatus) {
  if (status === "requested") {
    return { label: "Waiting", badge: "bg-yellow-400 text-yellow-950" };
  }
  if (status === "active") {
    return { label: "Active", badge: "bg-emerald-500 text-white" };
  }
  return { label: "Archived", badge: "bg-red-600 text-white" };
}

export function LiveChatInbox({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("chat");
  const [filter, setFilter] = useState<InboxFilter>("requested");
  const [query, setQuery] = useState("");
  const [chats, setChats] = useState<LiveChat[]>([]);
  const [counts, setCounts] = useState({ requested: 0, active: 0 });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [thread, setThread] = useState<{ chat: LiveChat; messages: LiveChatMessage[] } | null>(
    null,
  );
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chats.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (!q) return true;
      const hay = [customerLabel(c), c.customerEmail, c.customerName, c.lastMessagePreview]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [chats, filter, query]);

  async function refreshList() {
    try {
      const [payload, nextCounts] = await Promise.all([
        fetchAdminLiveChats(filter),
        fetchAdminLiveChatCounts(),
      ]);
      setChats(payload.chats);
      if (payload.viewerId) setViewerId(payload.viewerId);
      if (nextCounts) setCounts(nextCounts);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load live chats");
    } finally {
      setLoading(false);
    }
  }

  async function refreshThread(id: string) {
    try {
      const next = await fetchAdminLiveThread(id);
      setThread({ chat: next.chat, messages: next.messages });
      if (next.viewerId) setViewerId(next.viewerId);
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not load conversation");
    }
  }

  useEffect(() => {
    void refreshList();
    const timer = window.setInterval(() => void refreshList(), 4000);
    return () => window.clearInterval(timer);
  }, [filter]);

  useEffect(() => {
    if (!selectedId) {
      setThread(null);
      return;
    }
    void refreshThread(selectedId);
    const timer = window.setInterval(() => void refreshThread(selectedId), 2500);
    return () => window.clearInterval(timer);
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  function selectChat(id: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("chat", id);
    else params.delete("chat");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  async function run(action: "accept" | "close" | "message", body?: string) {
    if (!selectedId) return;
    const target = thread?.chat ?? visible.find((c) => c.id === selectedId);
    if (action === "message" && target && target.acceptedBy && target.acceptedBy !== viewerId) {
      setActionError("Only the assigned agent can reply");
      return;
    }
    if (
      action === "close" &&
      target?.status === "active" &&
      target.acceptedBy &&
      target.acceptedBy !== viewerId
    ) {
      setActionError("Only the assigned agent can close this chat");
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      const result = await postAdminLiveAction(selectedId, action, body);
      if (result.messages) {
        setThread({ chat: result.chat, messages: result.messages });
      } else if (result.message) {
        setThread((prev) =>
          prev
            ? {
                chat: result.chat,
                messages: prev.messages.some((m) => m.id === result.message!.id)
                  ? prev.messages
                  : [...prev.messages, result.message!],
              }
            : { chat: result.chat, messages: result.message ? [result.message] : [] },
        );
      } else {
        setThread((prev) => (prev ? { ...prev, chat: result.chat } : prev));
      }
      setChats((prev) => {
        const rest = prev.filter((c) => c.id !== result.chat.id);
        return [result.chat, ...rest];
      });
      if (action === "message") setInput("");
      if (filter !== "all") {
        if (action === "accept") setFilter("active");
        if (action === "close") setFilter("closed");
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  const chat = thread?.chat ?? visible.find((c) => c.id === selectedId) ?? null;
  const isOwner = Boolean(chat?.acceptedBy && viewerId && chat.acceptedBy === viewerId);
  const canRespond = Boolean(chat && chat.status === "active" && isOwner);
  const canClose = Boolean(
    chat && chat.status !== "closed" && (chat.status === "requested" || isOwner),
  );

  return (
    <div className={cn("grid gap-4", compact ? "grid-cols-1" : "lg:grid-cols-[280px_1fr]")}>
      <Card>
        <CardContent className="space-y-3 p-3">
          <div className="flex flex-nowrap gap-1">
            {FILTERS.map((item) => {
              const badge =
                item.id === "requested"
                  ? counts.requested
                  : item.id === "active"
                    ? counts.active
                    : 0;
              return (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant={filter === item.id ? "default" : "outline"}
                  onClick={() => setFilter(item.id)}
                  className="min-w-0 flex-1 px-1.5 text-[11px] sm:text-xs"
                >
                  <span className="relative">
                    {item.label}
                    {badge > 0 ? (
                      <span className="absolute -right-2 -top-2 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-600 px-0.5 text-[9px] font-bold leading-none text-white">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    ) : null}
                  </span>
                </Button>
              );
            })}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search email, name, message…"
              className="h-8 pl-8 text-sm"
            />
          </div>
          {loading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : loadError ? (
            <p className="py-6 text-sm text-destructive">{loadError}</p>
          ) : visible.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No chats in this view.
            </p>
          ) : (
            <div className="max-h-[min(50vh,420px)] space-y-1 overflow-y-auto">
              {visible.map((row) => {
                const tone = statusTone(row.status);
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => selectChat(row.id)}
                    className={cn(
                      "w-full rounded-md bg-muted/60 px-2.5 py-2 text-left text-sm hover:bg-muted",
                      selectedId === row.id && "bg-muted ring-1 ring-border",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{customerLabel(row)}</span>
                      <span
                        className={cn(
                          "inline-flex h-4 shrink-0 items-center rounded-full px-1.5 text-[9px] font-semibold leading-none",
                          tone.badge,
                        )}
                      >
                        {tone.label}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {row.lastMessagePreview || SITES[row.siteId].name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{formatDate(row.createdAt)}</p>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex min-h-[420px] flex-col p-0">
          {!chat ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
              <Headset className="size-6" />
              Select a live chat to accept or reply.
            </div>
          ) : (
            <>
              <div className="space-y-2 border-b border-border px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{customerLabel(chat)}</p>
                    <p className="text-xs text-muted-foreground">
                      {SITES[chat.siteId].name}
                      {chat.customerEmail ? ` · ${chat.customerEmail}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {chat.status === "requested" ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={busy}
                        onClick={() => void run("accept")}
                      >
                        Accept
                      </Button>
                    ) : null}
                    {canClose ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={busy}
                        onClick={() => void run("close")}
                        className="border-yellow-400 bg-yellow-400 text-yellow-950 hover:bg-yellow-300 hover:text-yellow-950"
                      >
                        Close & archive
                      </Button>
                    ) : null}
                  </div>
                </div>
                {chat.acceptedByName && chat.acceptedAt ? (
                  <p className="text-xs text-muted-foreground">
                    Accepted by <span className="font-medium text-foreground">{chat.acceptedByName}</span>
                    {chat.acceptedByEmail ? ` (${chat.acceptedByEmail})` : ""} on{" "}
                    {formatDate(chat.acceptedAt)}
                    {chat.status === "active" && !isOwner ? (
                      <span className="mt-0.5 block">Read-only — only they can reply.</span>
                    ) : null}
                  </p>
                ) : null}
                {chat.status === "closed" && chat.closedAt ? (
                  <p className="text-xs text-muted-foreground">Archived {formatDate(chat.closedAt)}</p>
                ) : null}
              </div>

              <ScrollArea className="min-h-0 flex-1 px-4 py-4">
                <div className="space-y-3">
                  {(thread?.messages ?? []).map((message) => {
                    if (message.senderRole === "system") {
                      return (
                        <p key={message.id} className="text-center text-xs text-muted-foreground">
                          {message.body}
                        </p>
                      );
                    }
                    const fromCustomer = message.senderRole === "customer";
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                          fromCustomer
                            ? "mr-auto bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
                            : "ml-auto bg-zinc-300 text-zinc-900 dark:bg-zinc-600 dark:text-zinc-50",
                        )}
                      >
                        {message.body}
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              {actionError ? (
                <p className="px-4 pb-2 text-sm text-destructive">{actionError}</p>
              ) : null}

              <form
                className="flex items-end gap-2 border-t border-border p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const text = input.trim();
                  if (!text || busy || !canRespond) return;
                  void run("message", text);
                }}
              >
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const text = input.trim();
                      if (!text || busy || !canRespond) return;
                      void run("message", text);
                    }
                  }}
                  rows={2}
                  disabled={busy || !canRespond}
                  placeholder={
                    chat.status === "requested"
                      ? "Accept this chat to reply"
                      : chat.status === "closed"
                        ? "Conversation archived"
                        : canRespond
                          ? "Reply to the customer…"
                          : `Read-only — ${chat.acceptedByName || "another agent"} is handling this chat`
                  }
                  className="min-h-10 resize-none"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || busy || !canRespond}
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
