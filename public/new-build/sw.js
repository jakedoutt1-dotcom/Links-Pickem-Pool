const CACHE="links-new-build-shell-v531";
const SHELL=["./","./index.html","./app.css","./app.js","./build.js","./shell.css","./shell.js","./manifest.webmanifest"];
self.addEventListener("install",event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL.map(x=>x+"?v=531")).catch(()=>{}))});
self.addEventListener("activate",event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()]))});
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 if(event.request.mode==="navigate"||url.pathname.includes("/new-build/api/")||/\.(?:html|js|css)$/.test(url.pathname)){event.respondWith(fetch(event.request,{cache:"no-store"}).catch(()=>caches.match(event.request)));return}
 event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{})}return response})))});
