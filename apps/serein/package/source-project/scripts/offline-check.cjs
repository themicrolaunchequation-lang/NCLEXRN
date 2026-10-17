'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');let checks=0;
async function test(worker,portable){
 const listeners={},buckets=new Map();let network=0,skipped=false,claimed=false,offline=false;
 const self={location:{href:'https://serein.example/sw.js?shell=Serein-v5.0.html'},registration:{active:null},clients:{claim:async()=>claimed=true,matchAll:async()=>[]},addEventListener:(k,v)=>listeners[k]=v,skipWaiting:()=>skipped=true};
 const caches={keys:async()=>[...buckets.keys()],delete:async k=>buckets.delete(k),open:async k=>{if(!buckets.has(k))buckets.set(k,new Map());const b=buckets.get(k);return {put:async(k,v)=>b.set(String(k),v),addAll:async files=>files.forEach(k=>b.set(new URL(k,self.location.href).href,new Response('<div id="app-shell">Serein</div>'))),match:async k=>b.get(String(k))?.clone()};}};
 vm.runInNewContext(fs.readFileSync(worker,'utf8'),{self,caches,URL,Request,fetch:async()=>{network++;if(offline)throw Error('Offline');return new Response('<div id="app-shell">Serein</div>')}});
 let pending;listeners.install({waitUntil:p=>pending=p});await pending;assert(network>0);checks++;
 listeners.activate({waitUntil:p=>pending=p});await pending;assert(claimed);checks++;
 offline=true;let response;listeners.fetch({request:{method:'GET',mode:'navigate',url:'https://serein.example/'+(portable?'Serein-v5.0.html':'index.html')+'?selftest'},respondWith:p=>response=p});assert((await(await response).text()).includes('Serein'));checks++;
 listeners.message({data:{type:'SKIP_WAITING'}});assert(skipped);checks++;
 let intercepted=false;listeners.fetch({request:{method:'GET',url:'https://elsewhere.example/'},respondWith:()=>intercepted=true});assert(!intercepted);checks++;
}
(async()=>{await test(path.join(__dirname,'../dist/sw.js'),false);await test(process.argv[2]||path.join(__dirname,'../portable/sw.js'),true);console.log(checks+' offline-worker checks passed.');})().catch(e=>{console.error(e);process.exit(1)});
