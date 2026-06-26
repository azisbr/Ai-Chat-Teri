const CACHE_NAME = "ai-chat-cache-v1";
const APP_SHELL = [
  "./chat-pro.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle our own app-shell files with cache-first.
  // Everything else (the AI API calls) should always go to the network.
  const url = new URL(request.url);
  const isAppShell = APP_SHELL.some((path) => url.pathname.endsWith(path.replace("./", "/")));

  if (request.method !== "GET" || !isAppShell) {
    return; // let the network handle it normally (API calls, uploads, etc.)
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
