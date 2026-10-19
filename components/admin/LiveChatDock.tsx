"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Headset, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveChatInbox } from "@/app/admin/chat/LiveChatInbox";
import { emitLiveChatCount } from "@/lib/admin/live-chat-count";
import { fetchAdminLiveChatCount } from "@/lib/chat/live-agent-client";

/** Staff terminal: accept / reply without leaving POS or other admin pages. */
export function LiveChatDock() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const poll = () => {
      void fetchAdminLiveChatCount().then((c) => {
        if (cancelled || c === null) return;
        setCount(c);
        emitLiveChatCount(c);
      });
    };
    poll();
    const timer = window.setInterval(poll, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  if (pathname.startsWith("/admin/chat")) return null;

  return (
    <>
      <Button
        type="button"
        size="lg"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-[70] gap-2 shadow-xl print:hidden"
        aria-expanded={open}
        aria-label="Live agent inbox"
      >
        <span className="relative">
          <Headset className="size-5" />
          {count > 0 ? (
            <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {count > 99 ? "99+" : count}
            </span>
          ) : null}
        </span>
        <span className="hidden sm:inline">Live Agent</span>
      </Button>

      {open ? (
        <div className="fixed inset-x-0 bottom-0 z-[75] flex max-h-[min(92dvh,760px)] flex-col border-t border-border bg-background shadow-2xl sm:inset-auto sm:bottom-20 sm:right-5 sm:w-[min(100vw-1.5rem,720px)] sm:rounded-xl sm:border print:hidden">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Headset className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">Live agent inbox</h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
              aria-label="Close live agent inbox"
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <LiveChatInbox compact />
          </div>
        </div>
      ) : null}
    </>
  );
}
