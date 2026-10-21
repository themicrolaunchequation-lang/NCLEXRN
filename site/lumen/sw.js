/* Lumen offline worker for /: app shell on install; engines (OCR, PDF, PowerPoint) and pictures cached when first used. */
const CACHE='lumen-web-1255683f4b',SHELL=["/","/lumen/js/00.c127811987.js","/lumen/js/01.e245896886.js","/lumen/js/pwa.9ce55d6233.js","/lumen/js/shell.98988a424a.js","/lumen/manifest.webmanifest","/lumen/icon-192.png","/lumen/icon-512.png","/lumen/icon.svg"],LAZY=/^\/lumen\/(vendor|img|licenses)\//;
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('lumen-web-')&&k!==CACHE).map(k=>caches.open(k).then(old=>old.keys().then(reqs=>Promise.all(reqs.filter(r=>LAZY.test(new URL(r.url).pathname)).map(r=>old.match(r).then(res=>res&&caches.open(CACHE).then(c=>c.put(r,res)))))).then(()=>caches.delete(k)))))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  if(r.mode==='navigate'&&u.pathname==='/'){e.respondWith(fetch(r).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put('/',copy));}return res;}).catch(()=>caches.match('/')));return;}
  if(SHELL.includes(u.pathname)||LAZY.test(u.pathname))e.respondWith(caches.open(CACHE).then(c=>c.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{if(res.ok&&res.status===200)c.put(r,res.clone());return res;}))));
});
