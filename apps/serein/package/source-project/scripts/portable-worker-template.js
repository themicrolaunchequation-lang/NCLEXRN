/* SEREIN_OFFLINE_WORKER · Standalone HTML hosting companion. Register only on request. */
'use strict';
const CACHE=__CACHE_NAME__;
const SCOPE=new URL('./',self.location.href);
const requestedShell=new URL(self.location.href).searchParams.get('shell')||'Serein-v5.0-p0.html';
const shellName=/^[^/\\?#]+\.html$/i.test(requestedShell)?requestedShell:'Serein-v5.0-p0.html';
const SHELL=new URL(shellName,SCOPE);
async function fetchShell(request){
 const response=await fetch(request);
 if(!response.ok||!(await response.clone().text()).includes('id="app-shell"'))throw Error('Serein app shell unavailable');
 return response;
}
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.put(SHELL.href,await fetchShell(new Request(SHELL.href,{cache:'no-store'})));
  if(self.registration?.active){const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of clients)client.postMessage({type:'UPDATE_AVAILABLE'});}
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith('serein-hca-portable-')&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
 })());
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==SHELL.origin||url.pathname!==SHELL.pathname)return;
 // The complete document embeds its own images, fonts, styles and scripts.
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),cached=await cache.match(SHELL.href);
  if(cached)return cached;
  const response=await fetchShell(request);await cache.put(SHELL.href,response.clone());return response;
 })());
});
