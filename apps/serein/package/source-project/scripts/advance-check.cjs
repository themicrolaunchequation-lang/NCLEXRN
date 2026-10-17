/* Behavior tests for v4. Browser rendering, audio hardware and OS installation remain separate QA. */
const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),vm=require('vm');
const dist=path.join(__dirname,'../dist');
const scripts=['data.js','engine.js','orb.js','advance-data.js','advance.js','context-data.js','context-info.js','app.js'];
let errors=[],checks=0,downloads=[];
function setup(raw){
 const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const html=fs.readFileSync(path.join(dist,'index.html'),'utf8').replace(/<script src="[^"]+"><\/script>/g,'');
 const dom=new JSDOM(html,{url:'https://serein.example/index.html',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
 const w=dom.window;w.structuredClone=structuredClone;w.scrollTo=()=>{};w.Blob=Blob;
 w.matchMedia=()=>({matches:false,addEventListener(){}});
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
 w.HTMLCanvasElement.prototype.getContext=()=>null;
 w.URL.createObjectURL=b=>{downloads.push(b);return 'blob:download'};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=()=>{};
 if(raw)w.localStorage.setItem('serein-hca-v3',raw);
 for(const f of scripts)w.eval(fs.readFileSync(path.join(dist,f),'utf8'));
 return {dom,w,app:w.SereinApp};
}
async function run(){
 const {dom,w,app}=setup();
 const $=s=>w.document.querySelector(s), $$=s=>[...w.document.querySelectorAll(s)];
 const click=s=>{assert($(s),'Missing '+s);$(s).click();};
 const change=(s,value)=>{let el=$(s);assert(el,'Missing '+s);if(el.type==='checkbox')el.checked=value;else el.value=String(value);el.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const submit=s=>$(s).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 const settle=()=>new Promise(r=>setImmediate(r));
 for(const v of ['today','practices','studios','journeys','reflect','space','support']){app.navigate(v);assert($('main h1'));assert.equal($$('#desktop-nav [data-nav]').length,7);checks++;}
 // Finder matches time, physical setting, breath preference, and manual exclusions.
 app.navigate('today');click('[data-adv="finder"]');click('[data-adv="finder-moment"][data-value="2"]');click('[data-adv="finder-next"]');click('[data-adv="finder-time"][data-value="60"]');click('[data-adv="finder-next"]');change('#finder-style','nonbreath');change('#finder-position','still');change('#finder-silent',true);click('[data-adv="finder-next"]');
 assert($$('.finder-result').length>0);for(const b of $$('[data-adv="finder-start"]')){let p=w.SEREIN_DATA.practices.find(x=>x.id===b.dataset.id);assert(!p.breathFocus&&!p.movement);assert(p.selfPaced||w.SereinEngine.chooseDuration(p,60)<=60);}checks++;
 click('[data-adv="finder-start"]');assert(!app.state.session.practice.breathFocus);assert.equal(app.state.voice,false);assert.equal(app.state.moment,2);click('[data-action="exit-player"]');checks++;
 // Each evidence panel has only its mapped sources.
 app.navigate('practices');for(const p of w.SEREIN_DATA.practices){app.openPractice(p.id);const info=$('#player-notes-content');assert(info.textContent.includes('When might it fit?'));const expected=w.SEREIN_ADVANCE_DATA.evidence[p.id].refs.map(k=>w.SEREIN_ADVANCE_DATA.references[k].url);assert.deepEqual([...info.querySelectorAll('a')].map(a=>a.href),Array.from(expected));click('[data-action="exit-player"]');checks++;}
 // Practice memory survives reload, while an explicit launch duration wins.
 app.openPractice('box');change('#session-remember',true);change('#session-pace','3-3');change('#session-duration',300);change('#session-noholds',true);change('#session-visual','text');change('#session-motion',true);assert.equal(app.store.practiceMemory.box.duration,300);click('[data-action="exit-player"]');app.openPractice('box');assert.equal(app.state.session.duration,300);assert.equal(app.state.session.pace,'3-3');assert.equal(app.state.session.noHolds,true);assert.equal(app.state.visual,'text');click('[data-action="exit-player"]');app.openPractice('box',60);assert.equal(app.state.session.duration,60);checks++;
 change('#session-before',2);click('[data-action="play-player"]');assert.equal($('#session-before').disabled,true);click('[data-action="play-player"]');const input=$('#player-seek');input.value='60';input.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(app.state.session.state,'complete');change('#session-after',4);click('[data-adv="feedback"][data-value="Helpful"]');assert.equal(app.store.feedback.length,1);assert.equal(JSON.parse(w.localStorage.getItem('serein-hca-v3')).feedback.length,0);checks++;
 change('#feedback-save',true);assert.equal(JSON.parse(w.localStorage.getItem('serein-hca-v3')).feedback.length,1);assert.equal(app.store.feedback[0].before,2);assert.equal(app.store.feedback[0].after,4);change('#feedback-save',false);assert.equal(JSON.parse(w.localStorage.getItem('serein-hca-v3')).feedback.length,0);change('#feedback-save',true);checks++;
 click('[data-adv="practice-choice"][data-value="exclude"]');assert.equal(app.store.practiceChoices.box,'exclude');click('[data-action="exit-player"]');assert.notEqual(app.recommend()?.id,'box');checks++;
 // Excluding every practice produces an actionable empty state without bypassing preferences.
 for(const p of w.SEREIN_DATA.practices)app.store.practiceChoices[p.id]='exclude';app.navigate('today');assert.equal(app.recommend(),null);assert(!$('.hero [data-practice]'));assert($('.hero [data-adv="finder"]'));assert($('main').textContent.includes('Your choices come first.'));checks++;
 for(const p of w.SEREIN_DATA.practices)delete app.store.practiceChoices[p.id];
 // Comfort settings use the existing preferences flow and persist.
 click('[data-action="settings"]');change('#pref-reading','extra');change('#pref-theme','night');$('#preferences-form [name="readingWidth"]').checked=true;$('#preferences-form [name="focus"]').checked=true;submit('#preferences-form');assert.equal(w.document.body.dataset.reading,'extra');assert.equal(w.document.body.dataset.theme,'night');assert(w.document.body.classList.contains('comfortable-reading'));checks++;
 // Every studio produces an editable result; back preserves entries.
 for(const s of w.SEREIN_ADVANCE_DATA.studios){
  app.navigate('studios');click(`[data-adv="studio"][data-id="${s.id}"]`);
  for(let step=0;step<3;step++){
   if(s.id==='boundary'&&step===1){click('[data-adv="boundary-response"][data-value="1"]');assert($('.response-rationale'));}
   for(const el of $$('[data-studio-field]')){if(el.type==='date')el.value='2026-11-08';else el.value=`${s.id} entry ${el.dataset.studioField}`;}
   if(s.id==='team'&&step===1){change('#team-practice','tide');change('#team-duration',60);}
   click('[data-adv="studio-next"]');
  }
  assert($('#studio-output').value.length>100,s.id+' result missing');
  if(s.id==='support'){assert($('#studio-output').value.includes('support entry 0'));click('[data-adv="studio-back"]');assert.equal($('#studio-field-4').value,'support entry 4');click('[data-adv="studio-next"]');checks++;}
  if(s.id==='conditions'){$('#studio-output').value+='\n<img src=x onerror=alert(1)>';click('[data-adv="studio-save"]');assert.equal(app.store.savedPlans.length,1);click('[data-adv="studio-save"]');assert.equal(app.store.savedPlans.length,1);checks++;}
  if(s.id==='team'){click('[data-adv="team-present"]');assert.equal(app.state.present,true);assert.equal(app.state.visual,'text');assert.equal(app.state.session.noHolds,true);assert.equal(app.state.session.external,true);assert.equal(app.state.voice,false);assert.equal($('#session-motion').checked,true);click('[data-action="exit-player"]');checks++;}
  else click('[data-action="close-modal"]');
  checks++;
 }
 app.navigate('studios');assert(!$('.saved-plan img'));assert($('.saved-plan pre').textContent.includes('<img'));checks++;
 // Learning marks preserve progress without requiring a fixed sequence.
 for(const j of w.SEREIN_ADVANCE_DATA.journeys){app.navigate('journeys');click(`[data-adv="journey"][data-id="${j.id}"]`);for(let i=0;i<5;i++)click('[data-adv="journey-complete"]');assert.equal(app.store.journeyProgress[j.id].length,5);checks++;}
 app.navigate('journeys');click('[data-adv="journey"][data-id="pause"]');click('[data-adv="journey-step"][data-value="2"]');click('[data-adv="journey-unmark"]');assert(!app.store.journeyProgress.pause.includes(2));click('[data-action="close-modal"]');checks++;
 // Insights use actual recorded entries and show paired counts with limitations.
 app.state.spaceTab='patterns';app.navigate('space');assert($('main').textContent.includes('Of 1 paired observations'));assert($('main').textContent.includes('cannot establish'));assert($('.feedback-bar').getAttribute('aria-label').includes('1 helpful'));change('#date-filter',7);assert($('.feedback-bar'));checks++;
 // Restore/export normalization retains the new fields and rejects invalid IDs.
 const normalized=app.normalizeImport({...app.store,app:'Serein'});assert.equal(normalized.feedback.length,1);assert.equal(normalized.savedPlans.length,1);assert.equal(normalized.practiceMemory.box.pace,'3-3');assert.equal(normalized.journeyProgress.boundaries.length,5);checks++;
 const bad=app.normalizeImport({app:'Serein',feedback:[{practiceId:'not-real',result:'Helpful'},{practiceId:'box',result:'Not a result'}],practiceMemory:{box:{duration:-2,pace:'0-0',visual:'untrusted'}},journeyProgress:{pause:[-1,0,0,99]}});assert.equal(bad.feedback.length,0);assert.equal(bad.practiceMemory.box.duration,null);assert.deepEqual(Array.from(bad.journeyProgress.pause),[0]);checks++;
 // Calendar reminders validate weekdays and correctly escape user input.
 app.state.spaceTab='data';app.navigate('space');click('[data-adv="app-options"]');change('#reminder-title','Pause, breathe; "hello"');change('#reminder-time','19:45');submit('#reminder-form');const ics=await downloads.at(-1).text();assert(ics.includes('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'));assert(ics.includes('SUMMARY:Pause\\, breathe\\; "hello"'));assert(ics.includes('BEGIN:VALARM'));for(const e of $$('[name="days"]'))e.checked=false;let count=downloads.length;submit('#reminder-form');assert.equal(downloads.length,count);assert($('#reminder-error').textContent.includes('at least one'));checks++;
 click('[data-action="close-modal"]');click('[data-action="search"]');$('#global-search').value='boundary';$('#global-search').dispatchEvent(new w.Event('input',{bubbles:true}));assert($('#search-results [data-adv="studio"]'));click('#search-results [data-adv="studio"]');assert.equal($('#search-dialog').open,false);assert.equal($('#modal-title').textContent,'Boundary Rehearsal');checks++;
 // A reload retains only explicitly saved feedback, settings, plans and learning marks.
 const raw=w.localStorage.getItem('serein-hca-v3'),reload=setup(raw);assert.equal(reload.app.store.feedback.length,1);assert.equal(reload.app.store.savedPlans.length,1);assert.equal(reload.app.store.practiceMemory.box.pace,'3-3');assert.equal(reload.w.document.body.dataset.theme,'night');assert.equal(reload.app.store.journeyProgress.pause.length,4);reload.dom.window.close();checks++;
 // All old entries migrate, and extra data participates in merge and replace.
 const older=app.normalizeImport({app:'Serein',version:3,checkins:[{id:'old-check',mood:4,date:'2026-10-14'}],journals:[{id:'old-journal',text:'Older words',date:'2026-10-14'}]});assert.equal(older.journals[0].text,'Older words');assert.equal(older.feedback.length,0);const importText=JSON.stringify(older);Object.defineProperty($('#import-file'),'files',{value:[{size:importText.length,text:async()=>importText}],configurable:true});$('#import-file').dispatchEvent(new w.Event('change',{bubbles:true}));await settle();click('[data-action="import-merge"]');assert(app.store.checkins.some(x=>x.id==='old-check'));assert.equal(app.store.feedback.length,1);assert.equal(app.store.savedPlans.length,1);checks++;
 // Keyboard dismissal keeps the information trigger available.
 app.navigate('studios');let explain=$('.studio-card [data-context-open]');explain.focus();explain.click();assert(app.contexts.active);w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));assert.equal(app.contexts.active,null);assert.equal(w.document.activeElement,explain);checks++;
 // Phase buttons move to the selected breathing phase within the current cycle.
 const engine=new w.SereinEngine.SessionEngine(w.SEREIN_DATA.practices.find(p=>p.id==='box'));engine.seek(37);engine.jump(1);assert.equal(engine.snapshot().index,1);assert(engine.elapsed>=32&&engine.elapsed<48);checks++;
 // Body-map seeking uses the actual session engine and keeps control focus between ticks.
 app.openPractice('scan');change('#session-visual','map');assert.equal($('#advance-stage').hidden,false);click('[data-player-step="3"]');assert.equal(app.state.session.snapshot().index,3);assert.equal($('#advance-stage [aria-current="step"]').textContent,'Shoulders');click('[data-action="exit-player"]');checks++;
 app.openPractice('box');change('#session-visual','orb');change('#session-motion',false);change('#session-noholds',false);app.state.session.seek(1);app.advance.updateStage(app.state.session.snapshot());click('[data-action="play-player"]');await new Promise(r=>setTimeout(r,45));const ball=$('.box-marker'),position=ball.style.left;await new Promise(r=>setTimeout(r,45));assert.notEqual(ball.style.left,position);click('[data-action="play-player"]');const paused=ball.style.left;await new Promise(r=>setTimeout(r,45));assert.equal(ball.style.left,paused);click('[data-action="exit-player"]');checks++;
 // Source and destination IDs remain valid, including PWA assets.
 const config=JSON.parse(fs.readFileSync(path.join(dist,'offline-assets.json')));for(const f of config.files)assert(fs.existsSync(path.join(dist,f)));const manifest=JSON.parse(fs.readFileSync(path.join(dist,'manifest.webmanifest')));for(const i of manifest.icons)assert(fs.existsSync(path.join(dist,i.src)));checks++;
 for(const f of scripts)new vm.Script(fs.readFileSync(path.join(dist,f),'utf8'),{filename:f});checks++;
 await settle();assert.deepEqual(errors,[]);dom.window.close();
 await serviceWorkerChecks();
 console.log(`${checks} v4 checks passed: finder, preferences, per-practice evidence, memory, feedback consent, insights, all six studios, journeys, reload/migration/merge, escaping, reminders, body/phase navigation, offline assets and worker behavior.`);
}
async function serviceWorkerChecks(){
 const handlers={},cacheMap=new Map(),deleted=[],scope='https://serein.example/',assets=JSON.parse(fs.readFileSync(path.join(dist,'offline-assets.json'))),name=assets.cacheName;
 const caches={keys:async()=>[name,'serein-hca-v4-old','unrelated-cache'],delete:async k=>{deleted.push(k);return true},open:async key=>{if(!cacheMap.has(key))cacheMap.set(key,new Map());const data=cacheMap.get(key);return {addAll:async files=>{for(const f of files)data.set(new URL(f,scope).href,new Response(f.includes('index.html')?'<div id="app-shell"></div>':'asset'));},match:async request=>data.get(typeof request==='string'?request:request.url)?.clone()};}};
 let offline=false,skipped=false,claimed=false;
 const ctx={URL,Response,Set,caches,fetch:async()=>{if(offline)throw Error('offline');return new Response('<div id="app-shell"></div>')},self:{location:{href:scope+'sw.js'},addEventListener:(n,f)=>handlers[n]=f,clients:{claim:async()=>claimed=true},skipWaiting:()=>skipped=true}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(dist,'sw.js'),'utf8'),ctx);
 let wait;handlers.install({waitUntil:p=>wait=p});await wait;assert.equal(cacheMap.get(name).size,assets.files.length);checks++;
 handlers.activate({waitUntil:p=>wait=p});await wait;assert(claimed);assert.deepEqual(deleted,['serein-hca-v4-old']);checks++;
 offline=true;let response;handlers.fetch({request:{method:'GET',url:scope+'index.html',mode:'navigate'},respondWith:p=>response=p});assert((await (await response).text()).includes('app-shell'));checks++;
 response=null;handlers.fetch({request:{method:'GET',url:'https://external.example/source',mode:'cors'},respondWith:p=>response=p});assert.equal(response,null);handlers.message({data:{type:'SKIP_WAITING'}});assert(skipped);checks++;
}
run().catch(e=>{console.error(e);process.exit(1)});
