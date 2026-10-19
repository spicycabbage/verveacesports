"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Headset } from "lucide-react";
import { showAdminAlertToast } from "@/components/admin/AdminAlertToast";
import { fetchAdminLiveChatCounts } from "@/lib/chat/live-agent-client";
import { emitLiveChatCount } from "@/lib/admin/live-chat-count";

const SEEN_KEY = "verveace-live-chat-seen";
const SEEN_MSG_KEY = "verveace-live-chat-last-customer-msg";
const SEEN_CLOSE_KEY = "verveace-live-chat-last-customer-close";

function showChatToast(title: string, body: string, href: string) {
  showAdminAlertToast({ title, body, href, icon: Headset });
}

function toastWaiting(count: number, added: number) {
  showChatToast(
    added === 1 ? "Live agent requested" : `${added} live agent requests`,
    count === 1 ? "A shopper is waiting in chat" : `${count} shoppers waiting in chat`,
    "/admin/chat",
  );
}

function toastMessage(preview: string | null, chatId: string | null) {
  const body = preview?.replace(/\s+/g, " ").trim() || "A shopper sent a message";
  showChatToast(
    "New message",
    body,
    chatId ? `/admin/chat?chat=${chatId}` : "/admin/chat",
  );
}

/** Signed-in admins only. Shoppers get 403 and we stay quiet. */
export function AdminLiveChatAlerts() {
  const pathname = usePathname();
  const lastRequested = useRef<number | null>(null);
  const onChatPage = pathname.startsWith("/admin/chat");

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      let stats: Awaited<ReturnType<typeof fetchAdminLiveChatCounts>>;
      try {
        stats = await fetchAdminLiveChatCounts();
      } catch {
        return;
      }
      if (cancelled || !stats) return;
      emitLiveChatCount(stats.attention);

      try {
        const raw = localStorage.getItem(SEEN_KEY);
        const prevRequested = raw === null ? lastRequested.current ?? 0 : Number(raw);
        const grew = !Number.isNaN(prevRequested) && stats.requested > prevRequested;
        if (!onChatPage && grew) {
          toastWaiting(stats.requested, stats.requested - prevRequested);
        }
        localStorage.setItem(SEEN_KEY, String(stats.requested));
      } catch {
        if (!onChatPage && lastRequested.current !== null && stats.requested > lastRequested.current) {
          toastWaiting(stats.requested, stats.requested);
        }
      }
      lastRequested.current = stats.requested;

      if (stats.lastCustomerMessageAt) {
        try {
          const seenAt = localStorage.getItem(SEEN_MSG_KEY);
          const isNew = Boolean(seenAt && stats.lastCustomerMessageAt > seenAt);
          if (isNew && !onChatPage) {
            toastMessage(stats.lastPreview, stats.lastChatId);
          }
          localStorage.setItem(SEEN_MSG_KEY, stats.lastCustomerMessageAt);
        } catch {
          if (!onChatPage && lastRequested.current !== null) {
            toastMessage(stats.lastPreview, stats.lastChatId);
          }
        }
      }

      if (stats.lastCustomerCloseAt) {
        try {
          const seenClose = localStorage.getItem(SEEN_CLOSE_KEY);
          const isNew = Boolean(seenClose && stats.lastCustomerCloseAt > seenClose);
          if (isNew) {
            showChatToast(
              "User have closed chat.",
              stats.lastCustomerCloseWho || "Guest",
              stats.lastCustomerCloseChatId
                ? `/admin/chat?chat=${stats.lastCustomerCloseChatId}`
                : "/admin/chat",
            );
          }
          localStorage.setItem(SEEN_CLOSE_KEY, stats.lastCustomerCloseAt);
        } catch {
          /* keep quiet */
        }
      }
    };

    void poll();
    const timer = window.setInterval(() => void poll(), 4000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [onChatPage]);

  return null;
}
