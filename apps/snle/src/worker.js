const CACHE='snle-web-__BUILD__',SHELL=__SHELL__;
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ns=>Promise.all(ns.filter(n=>n.startsWith('snle-web-')&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin)return;
 if(r.mode==='navigate'){
  e.respondWith(fetch(r).then(res=>{if(res.ok){const copy=res.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(u.pathname,copy)))}return res}).catch(()=>caches.match(u.pathname)));return;
 }
 if(u.pathname.startsWith('/assets/'))e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const copy=res.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(r,copy)))}return res})));
});
