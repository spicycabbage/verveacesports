"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, Package } from "lucide-react";
import { showAdminAlertToast } from "@/components/admin/AdminAlertToast";

const EVENT = "verveace-unfulfilled";
const SEEN_KEY = "verveace-unfulfilled-seen";
const SESSION_TOAST_KEY = "verveace-unfulfilled-session-toast";

function emitCount(count: number) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { count } }));
}

async function setBadge(count: number) {
  try {
    if ("setAppBadge" in navigator) {
      if (count > 0) await navigator.setAppBadge(count);
      else await navigator.clearAppBadge();
    }
  } catch {
    /* iOS Safari + most desktop browsers: no-op */
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    reg.active?.postMessage({ type: "badge", count });
  } catch {
    /* no SW */
  }
  const prefix = /^\(\d+\+?\)\s/;
  if (count > 0) {
    const label = count > 99 ? "99+" : String(count);
    if (!prefix.test(document.title)) document.title = `(${label}) ${document.title}`;
    else document.title = document.title.replace(prefix, `(${label}) `);
  } else {
    document.title = document.title.replace(prefix, "");
  }
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function toastUnfulfilled(count: number, added: number) {
  if (window.location.pathname.startsWith("/admin/orders")) return;
  showAdminAlertToast({
    title: added === 1 ? "New order to fulfill" : `${added} orders to fulfill`,
    body: count === 1 ? "1 unfulfilled order" : `${count} unfulfilled orders`,
    href: "/admin/orders?fulfillment=unfulfilled",
    icon: Package,
    duration: 12_000,
  });
}

async function refreshCount(): Promise<number | null> {
  const res = await fetch("/api/admin/orders/unfulfilled-count", { cache: "no-store" });
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) return null;
  const data = (await res.json()) as { count?: number };
  const count = typeof data.count === "number" ? data.count : 0;
  emitCount(count);
  await setBadge(count);

  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const prev = raw === null ? 0 : Number(raw);
    const sessionToasted = sessionStorage.getItem(SESSION_TOAST_KEY);
    const grew = !Number.isNaN(prev) && count > prev;
    if (count > 0 && (grew || sessionToasted !== "1")) {
      toastUnfulfilled(count, grew ? count - prev : count);
      sessionStorage.setItem(SESSION_TOAST_KEY, "1");
    }
    localStorage.setItem(SEEN_KEY, String(count));
  } catch {
    if (count > 0) toastUnfulfilled(count, count);
  }

  return count;
}

async function subscribePush(): Promise<"ok" | "need" | "denied" | "na"> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return "na";
  if (typeof Notification === "undefined") return "na";
  if (Notification.permission === "denied") return "denied";
  if (Notification.permission !== "granted") return "need";

  const vapid = await fetch("/api/admin/push/vapid", { cache: "no-store" });
  if (!vapid.ok) return "need";
  const { publicKey } = (await vapid.json()) as { publicKey?: string };
  if (!publicKey) return "need";

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });
  }
  const raw = sub.toJSON();
  if (!raw.endpoint || !raw.keys?.p256dh || !raw.keys?.auth) return "need";
  const saved = await fetch("/api/admin/push/subscribe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      endpoint: raw.endpoint,
      keys: { p256dh: raw.keys.p256dh, auth: raw.keys.auth },
    }),
  });
  return saved.ok ? "ok" : "need";
}

async function subscribeExpoToken() {
  const token = (window as Window & { __verveaceExpoPushToken?: string }).__verveaceExpoPushToken;
  if (!token) return;
  await fetch("/api/admin/push/expo", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token }),
  });
}

async function enablePushFromTap(): Promise<"ok" | "need" | "denied" | "na"> {
  if (typeof Notification === "undefined") return "na";
  if (Notification.permission === "denied") return "denied";
  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return permission === "denied" ? "denied" : "need";
  }
  return subscribePush();
}

/** Signed-in admins only. Shoppers get 403 and we hide. */
export function AdminOrderAlerts() {
  const [admin, setAdmin] = useState(false);
  const [count, setCount] = useState(0);
  const [pushState, setPushState] = useState<"unknown" | "ok" | "need" | "denied" | "na">(
    "unknown",
  );

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    void (async () => {
      const next = await refreshCount();
      if (cancelled) return;
      if (next === null) return;
      setAdmin(true);
      setCount(next);
      const state = await subscribePush();
      if (!cancelled) setPushState(state);
      void subscribeExpoToken();
      timer = window.setInterval(() => {
        void refreshCount().then((c) => {
          if (!cancelled && c !== null) setCount(c);
        });
      }, 15_000);
    })();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshCount().then((c) => {
          if (c !== null) {
            setAdmin(true);
            setCount(c);
          }
        });
      }
    };
    const onCount = (event: Event) => {
      const detail = (event as CustomEvent<{ count?: number }>).detail;
      if (typeof detail?.count === "number") setCount(detail.count);
    };
    const onExpo = () => {
      void subscribeExpoToken();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener(EVENT, onCount);
    window.addEventListener("verveace-expo-push", onExpo);

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener(EVENT, onCount);
      window.removeEventListener("verveace-expo-push", onExpo);
    };
  }, []);

  if (!admin) return null;

  const showEnable = pushState === "need";
  if (!showEnable) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[90] flex justify-center px-3 print:hidden">
      <div className="pointer-events-auto flex max-w-md items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-2 text-sm shadow-lg backdrop-blur">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground"
          onClick={() => {
            void enablePushFromTap().then((state) => {
              setPushState(state);
              if (state === "ok") toast.success("Order alerts on");
              else if (state === "denied") {
                toast.error("Notifications blocked", {
                  description: "Safari / Chrome settings → allow notifications for this site.",
                });
              }
            });
          }}
        >
          <Bell className="h-3.5 w-3.5" />
          Enable
        </button>
      </div>
    </div>
  );
}

export function AdminUnfulfilledBadge() {
  const count = useUnfulfilledOrderCount();
  if (count <= 0) return null;
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function useUnfulfilledOrderCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const onCount = (event: Event) => {
      const detail = (event as CustomEvent<{ count?: number }>).detail;
      if (typeof detail?.count === "number") setCount(detail.count);
    };
    window.addEventListener(EVENT, onCount);
    void (async () => {
      const res = await fetch("/api/admin/orders/unfulfilled-count", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number };
      if (typeof data.count === "number") setCount(data.count);
    })();
    return () => window.removeEventListener(EVENT, onCount);
  }, []);
  return count;
}
