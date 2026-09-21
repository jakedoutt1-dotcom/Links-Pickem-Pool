const CACHE_NAME = "links-pickem-pwa-v589";
const OFFLINE_ASSETS = [
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/favicon-32.png",
  "/favicon-48.png",
  "/app-logo.png",
  "/links-home-hero-stadium-v109.png",
  "/nfl-pickem-logo.png",
  "/college-pickem-logo.png",
  "/march-madness-logo.png",
  "/game-33-logo.png",
  "/nfl-playoff-challenge-logo-v102.jpg",
  "/super-bowl-props-logo-v102.jpg",
  "/confidence-pool-logo-v102.jpg",
  "/nfl-survivor-logo-v102.jpg",
  "/football-squares-logo-v102.png",
  "/masters-golf-pool-logo-v102.jpg",
  "/nascar-pool-logo-v102.jpg",
  "/fantasy-football-logo-v154.png",
  "/links-gear-coming-soon-v126.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_ASSETS)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))),
    self.clients.claim()
  ]));
});
self.addEventListener("message", event => { if(event.data?.type === "SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // live pool data is never service-worker cached
  event.respondWith((async()=>{
    const isStatic = /\.(?:png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname);
    if (isStatic) {
      const cached = await caches.match(req);
      if (cached) return cached;
      const fresh = await fetch(req);
      if (fresh && fresh.ok) (await caches.open(CACHE_NAME)).put(req, fresh.clone()).catch(()=>{});
      return fresh;
    }
    try {
      // v589: app shell/code always comes from the network. Never save HTML/JS/JSON
      // into the service-worker cache; only image/font assets above are cached.
      const fresh = await fetch(req, {cache:"no-store"});
      return fresh;
    } catch (err) {
      const cached = await caches.match(req);
      if (cached) return cached;
      if (req.mode === "navigate") return (await caches.match(new Request(self.location.origin + "/"))) || Response.error();
      throw err;
    }
  })());
});
