const C = "pi-game-cache-v1";
self.addEventListener("install", (_) => {self.skipWaiting()});
self.addEventListener("activate", (e) => {e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => {if (k !== C) return caches.delete(k)}))));self.clients.claim()});
self.addEventListener("fetch", (e) => {const { request: r } = e;(r.method === "GET") && e.respondWith(caches.open(C).then(c => c.match(r).then(d =>  d || fetch(r).then(res => { const d = res.destination; (d === "script" || d === "style" || d === "document") && c.put(r, res.clone()); return res }))))});
