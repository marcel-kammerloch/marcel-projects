const CACHE_NAME = "music-pwa-cache-v1";
const OFFLINE_URL = "/offline";
const APP_SHELL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        APP_SHELL,
        OFFLINE_URL,
        "/icons/icon-192x192.png",
        "/icons/icon-512x512.png",
        "/site.webmanifest",
      ]);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Handle navigation requests: Stale-While-Revalidate for the App Shell
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(APP_SHELL);

        // Fetch from network to update cache in background
        const networkFetch = fetch(event.request)
          .then((response) => {
            if (response.ok) {
              cache.put(APP_SHELL, response.clone());
            }
            return response;
          })
          .catch(() => null);

        // Return cached shell immediately if available, 
        // fall back to network, and finally to the offline page if both fail.
        return (
          cachedResponse ||
          (await networkFetch) ||
          (await cache.match(OFFLINE_URL)) ||
          new Response("Offline", { status: 503 })
        );
      })(),
    );
    return;
  }


  // Handle media requests from Vercel Blob or common audio file extensions
  const isVercelBlob = url.hostname.includes("public.blob.vercel-storage.com");
  const isAudioFile = url.pathname.match(/\.(mp3|wav|ogg|m4a|aac)$/i);

  if (isVercelBlob || isAudioFile) {
    event.respondWith(
      caches.open("offline-songs").then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request);
      }),
    );
  }
});

