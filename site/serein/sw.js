/* SEREIN_OFFLINE_WORKER 5.2.0: serves the saved copy of /serein when the network is unavailable. */
const PREFIX='serein-hca-v4-',SHELL='/serein';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  const cfg=await fetch('/serein/offline-assets.json',{cache:'no-store'}).then(r=>r.json()).catch(()=>null);
  if(cfg)for(const k of await caches.keys())if(k.startsWith(PREFIX)&&k!==cfg.cacheName)await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin||!(u.pathname===SHELL||u.pathname.startsWith(SHELL+'/')))return;
  if(r.mode==='navigate'){e.respondWith(fetch(r).catch(async()=>(await caches.match(SHELL,{ignoreSearch:true}))||Response.error()));return;}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r)));
});
