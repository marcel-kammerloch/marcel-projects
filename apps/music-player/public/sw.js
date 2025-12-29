const C = "music-player-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== C) return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const r = e.request;

  if (r.method !== "GET") return;

  e.respondWith(
    caches.open(C).then(async (cache) => {
      const cached = await cache.match(r);
      if (cached) return cached;

      try {
        const res = await fetch(r);

        // Validate response
        if (!res || res.status >= 400 || res.type !== "basic") {
          return res;
        }

        const dest = r.destination;

        if (
          r.url.endsWith(".mp3") ||
          dest === "script" ||
          dest === "style" ||
          dest === "document"
        ) {
          cache.put(r, res.clone());
        }

        return res;
      } catch (err) {
        console.log("Fetch failed", err);
        return new Response("Offline", { status: 503 });
      }
    })
  );
});
