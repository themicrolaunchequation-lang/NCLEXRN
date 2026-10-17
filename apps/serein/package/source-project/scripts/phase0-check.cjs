'use strict';
const {JSDOM,VirtualConsole}=require('jsdom'),fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),vm=require('vm');
const root=path.join(__dirname,'..'),dist=path.join(root,'dist'),fixture=require('./fixtures/phase0-preservation.json');
const files=['data.js','engine.js','orb.js','advance-data.js','advance.js','context-data.js','context-info.js','app.js'];
const errors=[],windows=[];let checks=0;
function setup({draft='',saved='',blocked=false,url='https://serein.example/index.html',portable=false}={}){
 let html=fs.readFileSync(path.join(dist,'index.html'),'utf8').replace(/<script src="[^"]+"><\/script>/g,'');
 if(portable)html=html.replace('</head>','<meta name="serein-distribution" content="portable"><meta name="serein-offline-cache" content="serein-test-portable"></head>');
 const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});windows.push(dom.window);
 const w=dom.window;w.structuredClone=structuredClone;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};w.HTMLCanvasElement.prototype.getContext=()=>null;
 if(blocked)Object.defineProperty(w,'sessionStorage',{get(){throw new w.DOMException('Storage blocked','SecurityError')}});
 else if(draft)w.sessionStorage.setItem('serein-journal-draft',draft);
 if(saved)w.localStorage.setItem('serein-hca-v3',saved);
 for(const file of files)w.eval(fs.readFileSync(path.join(dist,file),'utf8'));
 return {w,app:w.SereinApp,$:s=>w.document.querySelector(s),$$:s=>[...w.document.querySelectorAll(s)],close:()=>w.close()};
}
const wait=n=>new Promise(r=>setTimeout(r,n)),settle=()=>new Promise(r=>setImmediate(r));
const input=(e,value,w)=>{e.value=value;e.dispatchEvent(new w.Event('input',{bubbles:true}))};
const submit=(e,w)=>e.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
async function main(){
 let {w,app,$,$$,close}=setup();
 const clean=(obj,omit)=>JSON.parse(JSON.stringify(obj, (k,v)=>omit.includes(k)?undefined:v));
 assert.deepEqual(clean(w.SEREIN_DATA.practices,['photo','cardAlt']),fixture.content.practices);
 assert.deepEqual(clean(w.SEREIN_DATA.resources,['image','imageAlt']),fixture.content.guides);
 const other=Object.fromEntries(Object.entries(w.SEREIN_DATA).filter(([k])=>!['practices','resources'].includes(k)));
 assert.deepEqual(clean(other,[]),fixture.content.other);checks+=3;
 for(const [name,hash] of Object.entries(fixture.assets)){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(dist,name))).digest('hex'),hash,name+' payload changed');checks++;}
 assert.equal(new Set(w.SEREIN_DATA.practices.map(p=>p.photo)).size,15);assert.equal(new Set(w.SEREIN_DATA.resources.map(r=>r.image)).size,14);checks+=2;
 assert.equal(app.version,'5.0');assert.equal($('#app-version').textContent,app.version);assert.equal($('meta[name="serein-version"]').content,app.version);assert.equal(app.store.version,4);checks++;
 app.navigate('practices');assert($('.page-sub').textContent.includes('15 experiences'));assert($('.result-count').textContent.includes('Showing 12 of 15 practices'));$('[data-budget="0"]').click();assert($('.result-count').textContent.includes('Showing 15 of 15 practices'));input($('#practice-query'),'no-such-practice',w);assert($('.result-count').textContent.includes('Showing 0 of 15 practices'));checks++;
 assert.equal($('#mobile-nav [data-nav="support"]').textContent.trim(),'Support');assert.equal($$('#mobile-nav [data-nav]').length,7);
 assert.equal($('.search-launch').getAttribute('aria-label'),'Search Serein');$('.search-launch').click();assert($('#search-dialog').open);$('[data-action="close-search"]').click();
 $('.initial-avatar').click();assert.equal(app.state.view,'space');assert.equal($('.initial-avatar').getAttribute('aria-label'),'Your space');checks++;
 assert.equal($('.app-options-launch').getAttribute('aria-label'),'App & reminders');$('.app-options-launch').click();assert($('#reminder-form'));$('[data-action="close-modal"]').click();checks++;
 app.openPractice('tide');assert.equal($('#player-orb-legend').hidden,false);assert.equal($('#player-media-label').parentElement,$('#player-orb-legend').parentElement);assert.equal($('#player-feedback [data-feedback]'),null);assert($('#feedback-note'));$('[data-action="exit-player"]').click();app.openPractice('box');assert.equal($('#player-orb-legend').hidden,true);$('[data-action="exit-player"]').click();checks++;
 // Debounced tab-only drafts recover on reload without entering persistent storage.
 app.navigate('reflect');input($('#journal-draft'),'A draft after a busy shift',w);assert.equal(w.sessionStorage.getItem('serein-journal-draft'),null);await wait(530);assert.equal(w.sessionStorage.getItem('serein-journal-draft'),'A draft after a busy shift');assert($('#journal-draft-status').textContent.includes('Draft kept for this visit'));assert(!JSON.stringify(w.localStorage).includes('A draft after a busy shift'));checks++;
 const reload=setup({draft:w.sessionStorage.getItem('serein-journal-draft')});reload.app.navigate('reflect');assert.equal(reload.$('#journal-draft').value,'A draft after a busy shift');reload.close();checks++;
 input($('#journal-draft'),'Latest edit before leaving',w);w.dispatchEvent(new w.Event('pagehide'));assert.equal(w.sessionStorage.getItem('serein-journal-draft'),'Latest edit before leaving');checks++;
 // Successful submission clears pending autosave and never resurrects a duplicate draft.
 input($('#journal-draft'),'Visit-only entry',w);submit($('#journal-form'),w);await wait(530);assert.equal(w.sessionStorage.getItem('serein-journal-draft'),null);assert.equal(app.store.journals.at(-1).persistent,false);assert.equal(JSON.parse(w.localStorage.getItem('serein-hca-v3')).journals.length,0);checks++;
 input($('#journal-draft'),'Explicitly saved entry',w);$('#journal-form [name="persist"]').checked=true;submit($('#journal-form'),w);assert.equal(JSON.parse(w.localStorage.getItem('serein-hca-v3')).journals.at(-1).text,'Explicitly saved entry');assert.equal(w.sessionStorage.getItem('serein-journal-draft'),null);checks++;
 input($('#journal-draft'),'Remove this draft too',w);app.state.spaceTab='data';app.navigate('space');$('[data-action="clear-data"]').click();$('[data-action="confirm-clear"]').click();assert.equal(w.sessionStorage.getItem('serein-journal-draft'),null);assert.equal(app.state.draft,'');assert.equal(app.store.journals.length,0);app.navigate('reflect');assert.equal($('#journal-draft').value,'');checks++;
 input($('#journal-draft'),'',w);$('[data-prompt="1"]').click();await wait(530);assert(w.sessionStorage.getItem('serein-journal-draft').includes('One support'));checks++;
 close();
 // Blocked session storage is honest, still usable, and does not silently persist drafts.
 const blocked=setup({blocked:true});blocked.app.navigate('reflect');input(blocked.$('#journal-draft'),'Memory only',blocked.w);await wait(530);assert(blocked.$('#journal-draft-status').textContent.includes('memory only'));assert(!JSON.stringify(blocked.w.localStorage).includes('Memory only'));const unload=new blocked.w.Event('beforeunload',{cancelable:true});blocked.w.dispatchEvent(unload);assert(unload.defaultPrevented);blocked.close();checks++;
 // Missing workers and SPA fallbacks cannot be mistaken for successful offline setup.
 for(const fake of [{ok:false,text:async()=>''},{ok:true,text:async()=>'<html>Fallback route</html>'},{ok:true,text:async()=>'<html><script>/* SEREIN_OFFLINE_WORKER */</script></html>'}]){
  const ctx=setup();let registrations=0;ctx.w.caches={keys:async()=>[]};Object.defineProperty(ctx.w.navigator,'serviceWorker',{value:{register:async()=>{registrations++},ready:Promise.resolve()}});
  ctx.w.fetch=async()=>fake;ctx.$('.app-options-launch').click();ctx.$('#reminder-title').value='Keep my reminder draft';ctx.$('[data-adv="offline"]').click();await settle();assert.equal(registrations,0);assert(ctx.$('#offline-status').textContent.includes('sw.js is missing'));assert.equal(ctx.$('#reminder-title').value,'Keep my reminder draft');assert.equal(ctx.$('#offline-prepare').disabled,false);ctx.close();checks++;
 }
 for(const portable of [false,true]){
  const ctx=setup({portable,url:'https://serein.example/'+(portable?'Serein-v5.0-p0.html':'index.html')});let registered='',added=[];const cached=new Set();
  ctx.w.caches={keys:async()=>[],open:async()=>({addAll:async files=>{added=[...files];for(const f of files)cached.add(new URL(f,ctx.w.location.href).href)},match:async url=>cached.has(String(url))?{}:undefined})};
  Object.defineProperty(ctx.w.navigator,'serviceWorker',{value:{register:async url=>{registered=url;return {}},ready:Promise.resolve()}});
  ctx.w.fetch=async url=>String(url).includes('sw.js')?{ok:true,text:async()=> '/* SEREIN_OFFLINE_WORKER */'}:{ok:true,json:async()=>({cacheName:'hosted-test',files:['./index.html']})};
  ctx.$('.app-options-launch').click();ctx.$('[data-adv="offline"]').click();await settle();await settle();assert(ctx.$('#offline-status').textContent.includes('ready on this device'));assert(registered.includes('sw.js'));if(portable){assert(registered.includes('shell=Serein-v5.0-p0.html'));assert.equal(added.length,1);}ctx.close();checks++;
 }
 const file=setup({url:'file:///tmp/Serein-v5.0-p0.html'});file.$('.app-options-launch').click();assert(file.$('#offline-status').textContent.includes('already includes its core content'));assert.equal(file.$('[data-adv="offline"]'),null);file.close();checks++;
 // Worker caches the standalone document; offline navigation is cache-first and update messages work.
 const listeners={},cacheMap=new Map(),bucket=new Map();let network=0,skipped=false,claimed=false;
 const workerSelf={location:{href:'https://serein.example/sw.js?shell=index.html'},registration:{active:null},clients:{claim:async()=>{claimed=true},matchAll:async()=>[]},addEventListener:(name,fn)=>listeners[name]=fn,skipWaiting:()=>{skipped=true}};
 const cacheAPI={keys:async()=>[...cacheMap.keys()],delete:async name=>cacheMap.delete(name),open:async name=>{cacheMap.set(name,bucket);return {put:async(k,v)=>bucket.set(String(k),v),match:async k=>bucket.get(String(k))}}};
 const worker=fs.readFileSync(path.join(root,'portable/sw.js'),'utf8');
 vm.runInNewContext(worker,{self:workerSelf,caches:cacheAPI,URL,Request,fetch:async()=>{network++;return new Response('<div id="app-shell">Serein</div>')}});
 let pending;listeners.install({waitUntil:p=>pending=p});await pending;assert.equal(network,1);let response;listeners.fetch({request:{method:'GET',url:'https://serein.example/index.html?selftest'},respondWith:p=>response=p});assert((await (await response).text()).includes('Serein'));assert.equal(network,1);listeners.message({data:{type:'SKIP_WAITING'}});assert(skipped);listeners.activate({waitUntil:p=>pending=p});await pending;assert(claimed);let intercepted=false;listeners.fetch({request:{method:'GET',url:'https://elsewhere.example/'},respondWith:()=>intercepted=true});assert(!intercepted);checks+=4;
 assert.deepEqual(errors,[]);console.log(checks+' Phase 0 checks passed: full catalogue/safety and asset preservation, distinct images, version/counts, search/navigation, player labels, debounced draft recovery, opt-in saving, clearing, blocked storage and both offline distributions.');
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>windows.forEach(w=>w.close()));
