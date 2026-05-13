const CACHE_VERSION = "v4";
const CACHE_NAME = `circlerelay-pwa-${CACHE_VERSION}`;
const PRECACHE_URLS = [
  "/offline",
  "/manifest.webmanifest",
  "/brand/icons/circlerelay-app-icon-192.png",
  "/brand/icons/circlerelay-app-icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline").then((response) => response || Response.error())),
    );
    return;
  }

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/dashboard")) return;
  if (url.pathname.startsWith("/account")) return;
  if (url.pathname.startsWith("/settings")) return;
  if (url.pathname.startsWith("/team")) return;
  if (url.pathname.startsWith("/admin")) return;

  if (PRECACHE_URLS.includes(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request)),
    );
  }
});
