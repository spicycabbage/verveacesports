"use client";

import { useEffect, useState } from "react";
import { LIVE_CHAT_COUNT_EVENT, emitLiveChatCount } from "@/lib/admin/live-chat-count";
import { fetchAdminLiveChatCount } from "@/lib/chat/live-agent-client";

export function usePendingLiveChatCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const onCount = (event: Event) => {
      const detail = (event as CustomEvent<{ count?: number }>).detail;
      if (typeof detail?.count === "number") setCount(detail.count);
    };
    window.addEventListener(LIVE_CHAT_COUNT_EVENT, onCount);
    void fetchAdminLiveChatCount().then((c) => {
      if (c !== null) {
        setCount(c);
        emitLiveChatCount(c);
      }
    });
    return () => window.removeEventListener(LIVE_CHAT_COUNT_EVENT, onCount);
  }, []);
  return count;
}
