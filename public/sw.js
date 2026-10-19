const CACHE = "storefront-pwa-v5";
const OFFLINE = "/offline";

const BYPASS_PREFIXES = [
  "/api/",
  "/admin",
  "/checkout",
  "/callback",
  "/login",
  "/signup",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([OFFLINE])).catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

function shouldBypass(url) {
  return BYPASS_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (shouldBypass(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(OFFLINE);
        return cached ?? Response.error();
      }),
    );
    return;
  }
});

self.addEventListener("message", (event) => {
  const count = event.data?.type === "badge" ? event.data.count : null;
  if (typeof count !== "number" || !self.navigator.setAppBadge) return;
  event.waitUntil(
    (async () => {
      try {
        if (count > 0) await self.navigator.setAppBadge(count);
        else await self.navigator.clearAppBadge();
      } catch {
        /* ignore */
      }
    })(),
  );
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "New order";
  const body = data.body || "A paid order is waiting to be fulfilled.";
  const url = data.url || "/admin/orders";
  const badgeCount = typeof data.badgeCount === "number" ? data.badgeCount : null;

  event.waitUntil(
    (async () => {
      if (badgeCount !== null && self.navigator.setAppBadge) {
        try {
          if (badgeCount > 0) await self.navigator.setAppBadge(badgeCount);
          else await self.navigator.clearAppBadge();
        } catch {
          /* ignore */
        }
      }
      if (data.silent) return;
      await self.registration.showNotification(title, {
        body,
        data: { url },
        tag: "unfulfilled-orders",
        renotify: true,
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/admin/orders";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate?.(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
