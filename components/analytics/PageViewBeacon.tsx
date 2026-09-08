"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const SESSION_KEY = "vs_pageview_sid";

function sessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing && existing.length >= 8) return existing;
    const id = crypto.randomUUID().replace(/-/g, "");
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID().replace(/-/g, "");
  }
}

function referrerHost(): string | null {
  try {
    if (!document.referrer) return null;
    const host = new URL(document.referrer).hostname;
    return host || null;
  } catch {
    return null;
  }
}

export function PageViewBeacon() {
  const pathname = usePathname();
  const category = useSearchParams().get("category");

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const path = category ? `${pathname}?category=${category}` : pathname;
    const payload = JSON.stringify({
      path,
      sessionId: sessionId(),
      referrerHost: referrerHost(),
    });

    const blob = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon("/api/analytics/pageview", blob)) return;

    void fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    });
  }, [pathname, category]);

  return null;
}
