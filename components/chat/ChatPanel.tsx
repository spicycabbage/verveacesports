"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Headset, Loader2, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils/format";
import type { ChatUiStrings } from "@/lib/i18n/chat-ui";
import type { Locale } from "@/lib/i18n/locale";
import {
  clearStoredLiveChat,
  isLiveAgentIntent,
  latestAdminMessageId,
  readSeenLiveChat,
  readStoredLiveChat,
  writeSeenLiveChat,
  writeStoredLiveChat,
  type LiveChat,
  type LiveChatMessage,
} from "@/lib/chat/live-agent";
import {
  closeCustomerLiveChat,
  fetchCustomerLiveChat,
  fetchOpenCustomerLiveChat,
  requestLiveAgent,
  sendCustomerLiveMessage,
} from "@/lib/chat/live-agent-client";
import { useChatStore } from "@/lib/store/chat";
import { cn } from "@/lib/utils";

function messageText(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

type ChatPanelProps = {
  open: boolean;
  ui: ChatUiStrings;
  locale: Locale;
  onClose: () => void;
};

export default function ChatPanel({ open, ui, locale, onClose }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [offerText, setOfferText] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [live, setLive] = useState<LiveChat | null>(null);
  const [liveMessages, setLiveMessages] = useState<LiveChatMessage[]>([]);
  const [liveToken, setLiveToken] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const liveAgentRequestId = useChatStore((s) => s.liveAgentRequestId);
  const closeRequestId = useChatStore((s) => s.closeRequestId);
  const liveDismissId = useChatStore((s) => s.liveDismissId);
  const liveOnly = useChatStore((s) => s.liveOnly);
  const hideChat = useChatStore((s) => s.close);
  const confirmDismiss = useChatStore((s) => s.dismiss);
  const resumeLiveChat = useChatStore((s) => s.resumeLiveChat);
  const [confirmClose, setConfirmClose] = useState(false);
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const openRef = useRef(open);
  openRef.current = open;
  const resumeRef = useRef(resumeLiveChat);
  resumeRef.current = resumeLiveChat;
  const liveRef = useRef(live);
  liveRef.current = live;
  const liveTokenRef = useRef(liveToken);
  liveTokenRef.current = liveToken;
  const endedRef = useRef(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ locale: localeRef.current }),
      }),
    [],
  );
  const { messages, sendMessage, status, error } = useChat({ transport });
  const liveOpen = live && live.status !== "closed";
  const isBusy = liveOpen
    ? requesting
    : status === "submitted" || status === "streaming" || requesting;

  function applyLivePayload(chat: LiveChat, messages: LiveChatMessage[], token?: string | null) {
    if (endedRef.current) return;
    setLive(chat);
    setLiveMessages(messages);
    if (token) setLiveToken(token);
    if (chat.status === "closed") {
      clearStoredLiveChat();
      return;
    }
    const lastAdminId = latestAdminMessageId(messages);
    if (openRef.current) {
      writeSeenLiveChat({ chatId: chat.id, status: chat.status, lastAdminId });
      return;
    }
    const prev = readSeenLiveChat();
    const sameChat = prev?.chatId === chat.id;
    const agentJoined = chat.status === "active" && (!sameChat || prev?.status === "requested");
    const newAdmin = Boolean(lastAdminId && lastAdminId !== prev?.lastAdminId);
    if (agentJoined || newAdmin) {
      resumeRef.current();
      writeSeenLiveChat({ chatId: chat.id, status: chat.status, lastAdminId });
    }
  }

  useEffect(() => {
    let cancelled = false;
    const stored = readStoredLiveChat();
    void (async () => {
      try {
        if (stored) {
          const payload = await fetchCustomerLiveChat(stored.id, stored.token);
          if (cancelled || !payload.chat) return;
          applyLivePayload(payload.chat, payload.messages, stored.token);
          return;
        }
        const openChat = await fetchOpenCustomerLiveChat(null);
        if (cancelled || !openChat.chat) return;
        applyLivePayload(openChat.chat, openChat.messages, openChat.token);
      } catch {
        /* keep stored token — a transient 404/500 should not drop the session */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const liveId = live?.id;
  const liveClosed = live?.status === "closed";

  useEffect(() => {
    if (!liveId || liveClosed) return;
    const tick = () => {
      void fetchCustomerLiveChat(liveId, liveToken)
        .then((payload) => {
          if (!payload.chat) return;
          applyLivePayload(payload.chat, payload.messages, liveToken);
        })
        .catch(() => {
          /* keep last snapshot */
        });
    };
    const timer = window.setInterval(tick, 2500);
    return () => window.clearInterval(timer);
  }, [liveId, liveClosed, liveToken]);

  useEffect(() => {
    if (closeRequestId === 0) return;
    if (liveRef.current && liveRef.current.status !== "closed") {
      setConfirmClose(true);
      return;
    }
    hideChat();
  }, [closeRequestId, hideChat]);

  useEffect(() => {
    if (liveDismissId === 0) return;
    const chat = liveRef.current;
    const token = liveTokenRef.current;
    if (!chat || chat.status === "closed") return;
    endedRef.current = true;
    setLive(null);
    setLiveMessages([]);
    setLiveToken(null);
    setOfferText(null);
    setLiveError(null);
    clearStoredLiveChat();
    void closeCustomerLiveChat(chat.id, token).catch(() => {
      /* already gone */
    });
  }, [liveDismissId]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, status, liveMessages, offerText, live]);

  async function startLiveAgent() {
    endedRef.current = false;
    setRequesting(true);
    setLiveError(null);
    try {
      const payload = await requestLiveAgent(liveToken);
      if (!payload.chat || !payload.token) throw new Error("No chat");
      let messages = payload.messages;
      if (offerText) {
        try {
          const sent = await sendCustomerLiveMessage(payload.chat.id, offerText, payload.token);
          payload.chat = sent.chat;
          if (!messages.some((m) => m.id === sent.message.id)) {
            messages = [...messages, sent.message];
          }
        } catch {
          /* queue still created */
        }
      }
      writeStoredLiveChat({ id: payload.chat.id, token: payload.token });
      applyLivePayload(payload.chat, messages, payload.token);
      setOfferText(null);
    } catch (err) {
      setLiveError(err instanceof Error ? err.message : ui.liveAgentError);
    } finally {
      setRequesting(false);
    }
  }

  useEffect(() => {
    if (liveAgentRequestId === 0) return;
    void startLiveAgent();
  }, [liveAgentRequestId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    setInput("");
    setLiveError(null);

    if (live && live.status !== "closed") {
      try {
        const sent = await sendCustomerLiveMessage(live.id, text, liveToken);
        setLive(sent.chat);
        setLiveMessages((prev) =>
          prev.some((m) => m.id === sent.message.id) ? prev : [...prev, sent.message],
        );
      } catch (err) {
        setLiveError(err instanceof Error ? err.message : ui.liveAgentError);
        setInput(text);
      }
      return;
    }

    if (isLiveAgentIntent(text)) {
      setOfferText(text);
      return;
    }

    await sendMessage({ text });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void onSubmit(e);
    }
  }

  if (!open) return null;

  const statusLine =
    live?.status === "requested"
      ? ui.liveAgentWaiting
      : live?.status === "active"
        ? ui.liveAgentJoined
        : live?.status === "closed"
          ? ui.liveAgentClosed
          : null;

  return (
    <>
      <button
        type="button"
        aria-label={ui.close}
        className="fixed inset-0 z-[59] bg-black/20 sm:hidden"
        onClick={onClose}
      />
      <aside
        className="fixed inset-x-0 bottom-0 z-[60] flex max-h-[min(85dvh,640px)] flex-col rounded-t-xl border border-border bg-background shadow-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:rounded-l-xl sm:border-l sm:border-t-0"
        aria-label={ui.title}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            {liveOpen ? (
              <Headset className="size-4 text-primary" />
            ) : (
              <MessageCircle className="size-4 text-primary" />
            )}
            <h2 className="text-sm font-semibold">{ui.title}</h2>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label={ui.close}>
            <X className="size-4" />
          </Button>
        </div>

        {statusLine ? (
          <div
            className={
              live?.status === "requested"
                ? "border-b border-yellow-200 bg-yellow-100 px-4 py-2 text-xs text-yellow-950 dark:border-yellow-500/20 dark:bg-yellow-400/15 dark:text-yellow-100"
                : "border-b border-border bg-muted/60 px-4 py-2 text-xs text-muted-foreground"
            }
          >
            {statusLine}
            {live?.status === "active" && live.acceptedByName && live.acceptedAt ? (
              <span className="mt-0.5 block">
                {live.acceptedByName} · {formatDate(live.acceptedAt)}
              </span>
            ) : null}
          </div>
        ) : null}

        <ScrollArea className="min-h-0 flex-1 px-4 py-4">
          <div className="space-y-4">
            {!liveOnly ? (
              <div className="mr-8 rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed">
                {ui.welcome}
              </div>
            ) : null}

            {!liveOnly && messages.map((message) => {
              const text = messageText(message.parts);
              if (!text) return null;
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                    isUser ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-muted",
                  )}
                >
                  {text}
                </div>
              );
            })}

            {!liveOnly && offerText ? (
              <>
                <div className="ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap text-primary-foreground">
                  {offerText}
                </div>
                <div className="mr-auto max-w-[90%] space-y-2 rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed">
                  <p>{ui.liveAgentSuggest}</p>
                  <Button
                    type="button"
                    size="sm"
                    disabled={requesting}
                    onClick={() => void startLiveAgent()}
                  >
                    {requesting ? <Loader2 className="size-4 animate-spin" /> : <Headset className="size-4" />}
                    {ui.liveAgentButton}
                  </Button>
                </div>
              </>
            ) : null}

            {liveMessages.map((message) => {
              if (message.senderRole === "system") {
                if (liveOnly) return null;
                return (
                  <div
                    key={message.id}
                    className="text-center text-xs text-muted-foreground"
                  >
                    {message.body}
                  </div>
                );
              }
              const isUser = message.senderRole === "customer";
              return (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                    isUser ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-muted",
                  )}
                >
                  {message.body}
                </div>
              );
            })}

            {isBusy && !liveOpen && !liveOnly && (
              <div className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                {ui.thinking}
              </div>
            )}

            {liveError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {liveError}
              </div>
            ) : null}

            {error && !liveOpen && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error.message.includes("503") || error.message.includes("not configured")
                  ? ui.unavailable
                  : ui.error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-border p-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={liveOpen ? ui.liveAgentPlaceholder : ui.placeholder}
            rows={2}
            disabled={isBusy}
            className="min-h-10 resize-none"
            aria-label={liveOpen ? ui.liveAgentPlaceholder : ui.placeholder}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isBusy}
            aria-label={ui.send}
          >
            <Send className="size-4" />
          </Button>
        </form>
      </aside>

      <Dialog open={confirmClose} onOpenChange={(next) => !next && setConfirmClose(false)}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{ui.liveAgentCloseConfirm}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmClose(false)}>
              {ui.liveAgentCloseNo}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setConfirmClose(false);
                confirmDismiss();
              }}
            >
              {ui.liveAgentCloseYes}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
