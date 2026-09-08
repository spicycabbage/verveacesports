const CACHE = "storefront-pwa-v2";
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
