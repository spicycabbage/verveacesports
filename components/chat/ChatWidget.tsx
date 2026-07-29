"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { chatUi } from "@/lib/i18n/chat-ui";
import { useChatStore } from "@/lib/store/chat";
import { useCartStore } from "@/lib/store/cart";
import { useLocaleStore } from "@/lib/store/locale";
import { useSite } from "@/lib/site/SiteProvider";
import { cn } from "@/lib/utils";

function messageText(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function ChatWidget() {
  const { isOpen, close, toggle } = useChatStore();
  const cartOpen = useCartStore((s) => s.isOpen);
  const locale = useLocaleStore((s) => s.locale);
  const site = useSite();
  const ui = chatUi(locale, site.supportEmail, site.id);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cartOpen) close();
  }, [cartOpen, close]);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    setInput("");
    await sendMessage({ text });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void onSubmit(e);
    }
  }

  if (cartOpen) return null;

  return (
    <>
      <Button
        type="button"
        size="lg"
        onClick={toggle}
        className={cn(
          "fixed bottom-5 z-[60] gap-2 shadow-xl",
          isOpen ? "right-5 sm:right-36" : "right-5 sm:right-36",
        )}
        aria-label={isOpen ? ui.close : ui.open}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="size-5" /> : <MessageCircle className="size-5" />}
        <span className="hidden sm:inline">{ui.title}</span>
      </Button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label={ui.close}
            className="fixed inset-0 z-[59] bg-black/20 sm:hidden"
            onClick={close}
          />
          <aside
            className="fixed inset-x-0 bottom-0 z-[60] flex max-h-[min(85dvh,640px)] flex-col rounded-t-xl border border-border bg-background shadow-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:rounded-l-xl sm:border-l sm:border-t-0"
            aria-label={ui.title}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">{ui.title}</h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={close}
                aria-label={ui.close}
              >
                <X className="size-4" />
              </Button>
            </div>

            <ScrollArea className="min-h-0 flex-1 px-4 py-4">
              <div className="space-y-4">
                <div className="mr-8 rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed">
                  {ui.welcome}
                </div>

                {messages.map((message) => {
                  const text = messageText(message.parts);
                  if (!text) return null;
                  const isUser = message.role === "user";
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                        isUser
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "mr-auto bg-muted",
                      )}
                    >
                      {text}
                    </div>
                  );
                })}

                {isBusy && (
                  <div className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    {ui.thinking}
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error.message.includes("503") || error.message.includes("not configured")
                      ? ui.unavailable
                      : ui.error}
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            <form
              onSubmit={onSubmit}
              className="flex items-end gap-2 border-t border-border p-3"
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={ui.placeholder}
                rows={2}
                disabled={isBusy}
                className="min-h-10 resize-none"
                aria-label={ui.placeholder}
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
        </>
      )}
    </>
  );
}
