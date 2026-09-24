// Offline support: network first, so the page is always current when online,
// with the last good copy served from the cache when there is no signal.

const CACHE = "golfpot-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Cache the page plus the hashed JS/CSS it references, so the very first
      // visit is enough to work offline afterwards.
      const response = await fetch("/", { cache: "no-cache" });
      const html = await response.clone().text();
      await cache.put("/", response);
      const assets = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((match) => match[1]);
      await cache.addAll(assets);
    })(),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        // Navigations to any path fall back to the app shell.
        if (request.mode === "navigate") return (await caches.match("/")) ?? Response.error();
        return Response.error();
      }
    })(),
  );
});
