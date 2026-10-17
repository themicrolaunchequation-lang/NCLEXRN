'use strict';
const {setup,wait,settle,errors,cleanup}=require('./test-harness.cjs'),assert=require('assert/strict'),fs=require('fs'),path=require('path');
let checks=0;const outcomes=[];
const eq=(a,b,m)=>{assert.equal(a,b,m);checks++},ok=(v,m)=>{assert(v,m);checks++},reject=async p=>{await assert.rejects(p);checks++};
async function scenario(name,fn){try{await fn();outcomes.push({name,result:'PASS'});}catch(e){outcomes.push({name,result:'FAIL',error:e.message});console.error(name,e.stack);}}
const raw={app:'Serein',version:5,onboarded:true,journals:[{id:'j',text:'Secret record',date:'2026-10-01',persistent:true}],checkins:[],contacts:[],preferences:{theme:'light',time:120}};
(async()=>{
await scenario('Every studio and journey reopens from its existing route',async()=>{
 const x=setup();for(const s of x.S.content.studios){const route='toolkit/'+s.id;x.app.navigate(route);ok(x.$('#modal').open);x.click('[data-action="close-modal"]');x.app.navigate(route);ok(x.$('#modal').open,'Did not reopen '+route);x.click('[data-action="close-modal"]');}
 for(const j of x.S.content.journeys){const route='library/journeys?journey='+j.id;x.app.navigate(route);ok(x.$('#modal').open);x.click('[data-action="close-modal"]');x.app.navigate(route);ok(x.$('#modal').open);x.click('[data-action="close-modal"]');}x.close();
});
await scenario('Pending searches survive navigation without stale DOM writes',async()=>{
 const x=setup();for(const [route,id]of [['library/practices','practice-query'],['library/guides','guide-query'],['me/journal','journal-query']]){x.app.navigate(route);x.$('#'+id).value='test query';x.$('#'+id).dispatchEvent(new x.w.Event('input',{bubbles:true}));x.app.navigate('support');await wait(180);eq(x.S.router.current.view,'support');ok(x.$('main h1'));}
 x.click('[data-action="search"]');const before=x.$('#search-results').innerHTML;x.$('#global-search').value='box';x.$('#global-search').dispatchEvent(new x.w.Event('input',{bubbles:true}));x.click('[data-action="close-search"]');await wait(180);eq(x.$('#search-results').innerHTML,before);x.close();
});
await scenario('Quick check-in status survives Today updates',async()=>{
 const x=setup();x.click('main [data-mood="3"]');x.click('[data-v5="home-time"][data-value="60"]');ok(x.$('#quick-checkin-actions [data-v5="save-quick-checkin"]'));x.close();
});
await scenario('Box graphics never overlay another practice',async()=>{
 const x=setup();x.app.openPractice('box');eq(x.$('#box-guide').hidden,false);eq(x.$$('.box-edge').length,4);x.click('[data-action="exit-player"]');x.app.openPractice('tide');eq(x.$('#box-guide').hidden,true);x.change('#session-visual','text');ok(x.$('#player-scroll').classList.contains('text-focus'));x.close();
});
await scenario('Self-paced noticing keeps keyboard focus',async()=>{
 const x=setup();x.app.openPractice('ground');const b=x.$('[data-noticed="0"]');b.focus();b.click();eq(x.w.document.activeElement,b);eq(b.getAttribute('aria-pressed'),'true');b.click();eq(b.getAttribute('aria-pressed'),'false');x.close();
});
await scenario('Help, settings and search pause self-paced practices',async()=>{
 for(const target of ['[data-v5="help"]','[data-v5="player-settings"]','[data-action="search"]']){const x=setup();x.app.openPractice('ground');x.S.player.playPause();eq(x.app.state.session.state,'playing');const i=x.app.state.session.snapshot().index;x.click(target);eq(x.app.state.session.state,'paused');eq(x.app.state.session.snapshot().index,i);x.close();}
});
await scenario('Opening settings cancels Quick pause countdown',async()=>{
 const x=setup();x.click('#mobile-nav [data-v5="quick"]');ok(x.$('#quick-countdown'));x.click('[data-v5="player-settings"]');eq(x.$('#quick-countdown'),null);eq(x.app.state.session.state,'ready');x.close();
});
await scenario('Replay creates a separate optional feedback record',async()=>{
 const x=setup();x.app.openPractice('tide',60);x.change('#session-before',2);x.S.player.playPause();x.app.state.session.seek(60);x.S.player.update(true);x.click('[data-adv="feedback"][data-value="Helpful"]');const first=x.app.advance.sessionMeta.id;x.click('[data-action="play-player"]');ok(first!==x.app.advance.sessionMeta.id);eq(x.app.store.feedback.length,1);eq(x.$('#session-before').value,'');eq(x.$$('#uncomfortable-support').length,1);x.app.state.session.seek(60);x.S.player.update(true);x.click('[data-adv="feedback"][data-value="No change"]');eq(x.app.store.feedback.length,2);x.close();
});
await scenario('Timer rounds across minute boundaries correctly',async()=>{
 const x=setup();x.app.openPractice('tide',120);x.app.state.session.seek(.5);x.S.player.update(true);eq(x.$('#player-clock').textContent,'2:00');x.close();
});
await scenario('No-holds Box breathing shrinks on its out phase',async()=>{
 const x=setup(),p=x.S.data.practices.find(p=>p.id==='box'),e=new x.S.engine.SessionEngine(p,{noHolds:true});e.seek(4);const start=e.snapshot().scale;e.seek(6);ok(e.snapshot().scale<start);x.close();
});
await scenario('Media controls pause grounding and are removed on exit',async()=>{
 const x=setup(),handlers={};Object.defineProperty(x.w.navigator,'mediaSession',{value:{setActionHandler:(n,f)=>handlers[n]=f,setPositionState(){}}});x.w.MediaMetadata=function(data){Object.assign(this,data)};x.app.openPractice('ground');x.S.player.playPause();handlers.pause();eq(x.app.state.session.state,'paused');eq(x.app.state.session.snapshot().index,0);x.S.player.exit();eq(handlers.play,null);eq(handlers.pause,null);x.close();
});
await scenario('Late wake-lock grants are released after player exit',async()=>{
 const x=setup();let grant,released=0;Object.defineProperty(x.w.navigator,'wakeLock',{value:{request:()=>new Promise(r=>grant=r)}});x.app.openPractice('tide');x.S.player.playPause();x.change('#keep-awake',true);ok(grant);x.S.player.exit();grant({release:async()=>released++,addEventListener(){}});await settle();eq(released,1);x.close();
});
await scenario('Team share has a manual-copy fallback without clipboard API',async()=>{
 const x=setup();x.app.navigate('toolkit/team');for(let i=0;i<3;i++)x.click('[data-adv="studio-next"]');await settle();x.click('[data-v5="share-team"]');await settle();ok(x.$('#team-share-link').value.includes('practice='));ok(x.$('#toast').textContent.includes('Select and copy'));x.close();
});
await scenario('Invalid array shapes and missing secure UUID do not break migration',async()=>{
 const x=setup({noCrypto:true});const n=x.app.normalizeImport({app:'Serein',journals:{bad:1},checkins:'bad',savedWords:{bad:1},feedback:[{practiceId:'box',result:'Helpful'}],savedPlans:[{studio:'conditions',text:'Plan'}]});eq(n.journals.length,0);eq(n.checkins.length,0);eq(n.savedWords.length,0);ok(n.feedback[0].id);ok(n.savedPlans[0].id);assert.throws(()=>x.app.normalizeImport({app:'Serein',version:99}));checks++;x.close();
});
await scenario('Plain import merges contacts and records without dropping existing data',async()=>{
 const x=setup({raw});await x.app.modern.importFile({size:500,text:async()=>JSON.stringify({...raw,journals:[{id:'j2',text:'Second record',persistent:true}],contacts:[{id:'p',name:'Peer',phone:'0123456',persistent:true}]})});x.click('[data-v5="import-merge"]');await settle();eq(x.app.store.journals.length,2);eq(x.app.store.contacts.length,1);eq(x.$('#modal').open,false);x.close();
});
await scenario('Replace import removes the old unsubmitted draft',async()=>{
 const x=setup({raw});x.app.navigate('me/journal');x.$('#journal-draft').value='Old unsent draft';x.$('#journal-draft').dispatchEvent(new x.w.Event('input',{bubbles:true}));await x.app.modern.importFile({size:300,text:async()=>JSON.stringify({...raw,journals:[{id:'new',text:'Imported',persistent:true}]})});x.click('[data-v5="import-replace"]');await settle();eq(x.app.state.draft,'');eq(x.w.sessionStorage.getItem('serein-journal-draft'),null);eq(x.app.store.journals[0].text,'Imported');x.close();
});
await scenario('Quota failure rolls back import and reports failure',async()=>{
 const x=setup({raw});await x.app.modern.importFile({size:300,text:async()=>JSON.stringify({...raw,journals:[{id:'new',text:'Incoming',persistent:true}]})});x.w.Storage.prototype.setItem=function(){throw Error('Quota exceeded')};x.click('[data-v5="import-replace"]');await settle();eq(x.app.store.journals[0].text,'Secret record');ok(x.$('#import-error').textContent.includes('could not be saved'));ok(x.$('#modal').open);x.close();
});
await scenario('Unreadable stored data is protected and downloadable',async()=>{
 const x=setup({raw:'{broken archive'});x.app.navigate('me/settings');x.change('#pref-theme','night');await settle();eq(x.w.localStorage.getItem('serein-hca-v3'),'{broken archive');x.app.navigate('me/data');x.click('[data-v5="recovery-export"]');eq(await x.downloads.at(-1).text(),'{broken archive');x.click('[data-action="clear-data"]');x.click('[data-action="confirm-clear"]');eq(x.w.localStorage.getItem('serein-hca-v3'),null);x.close();
});
await scenario('Clearing data cancels encryption setup before it can write',async()=>{
 const x=setup({raw});const pending=x.app.modern.vault.enable('long test passphrase');x.app.modern.vault.reset();await reject(pending);eq(x.w.localStorage.getItem('serein-hca-v3'),null);eq(x.app.modern.vault.enabled,false);x.close();
});
await scenario('Clearing data cancels an in-flight unlock without restoring plaintext',async()=>{
 const a=setup({raw});await a.app.modern.vault.enable('long test passphrase');await a.app.modern.vault.lock();const x=setup({raw:a.w.localStorage.getItem('serein-hca-v3')});const pending=x.app.modern.vault.unlock('long test passphrase');x.app.navigate('me/data');x.click('[data-action="clear-data"]');x.click('[data-action="confirm-clear"]');await reject(pending);eq(x.app.store.journals.length,0);eq(x.w.localStorage.getItem('serein-hca-v3'),null);a.close();x.close();
});
await scenario('Clearing data cancels an in-flight lock removal',async()=>{
 const x=setup({raw});await x.app.modern.vault.enable('long test passphrase');const pending=x.app.modern.vault.remove('long test passphrase');x.app.navigate('me/data');x.click('[data-action="clear-data"]');x.click('[data-action="confirm-clear"]');await reject(pending);eq(x.app.store.journals.length,0);eq(x.w.localStorage.getItem('serein-hca-v3'),null);x.close();
});
await scenario('Writes use fresh IVs and never leak locked fields',async()=>{
 const x=setup({raw});await x.app.modern.vault.enable('long test passphrase');const first=JSON.parse(x.w.localStorage.getItem('serein-hca-v3')).vault;await x.S.store.persist();const text=x.w.localStorage.getItem('serein-hca-v3'),next=JSON.parse(text).vault;ok(first.iv!==next.iv);eq(first.salt,next.salt);ok(!text.includes('Secret record'));await x.app.modern.vault.lock();await reject(x.app.modern.vault.unlock('incorrect pass'));eq(x.app.store.journals.length,0);await x.app.modern.vault.unlock('long test passphrase');eq(x.app.store.journals[0].text,'Secret record');x.close();
});
await scenario('Tab hidden during lock setup finishes locked',async()=>{
 const x=setup({raw});const pending=x.app.modern.vault.enable('long test passphrase');Object.defineProperty(x.w.document,'visibilityState',{value:'hidden',configurable:true});x.w.document.dispatchEvent(new x.w.Event('visibilitychange'));await pending;await wait(350);await x.app.modern.vault.flush();eq(x.app.modern.vault.locked,true);eq(x.app.store.journals.length,0);ok(!x.w.document.body.classList.contains('privacy-shield'));x.close();
});
await scenario('Leaving while encryption is pending triggers an unsaved-work prompt',async()=>{
 const x=setup({raw});const pending=x.app.modern.vault.enable('long test passphrase');const e=new x.w.Event('beforeunload',{cancelable:true});x.w.dispatchEvent(e);ok(e.defaultPrevented);await pending;x.close();
});
await scenario('Encrypted entry forms describe their actual saving mode',async()=>{
 const x=setup({raw});await x.app.modern.vault.enable('long test passphrase');x.app.navigate('me/journal');ok(x.$('#journal-form label.check-label').textContent.includes('encrypted archive'));x.close();
});
await scenario('Private search and import buffers clear when records lock',async()=>{
 const x=setup({raw});await x.app.modern.vault.enable('long test passphrase');x.app.navigate('me/journal');x.$('#journal-query').value='Secret query';x.$('#journal-query').dispatchEvent(new x.w.Event('input',{bubbles:true}));await x.app.modern.vault.lock();eq(x.app.state.journalQuery,'');ok(!x.$('main').textContent.includes('Secret record'));await wait(180);eq(x.app.state.journalQuery,'');x.close();
});
await scenario('All routed controls have names, IDs are unique and image alternatives exist',async()=>{
 const x=setup();for(const route of ['today','library/practices','library/guides','library/journeys','toolkit','me/journal','me/saved','me/routine','me/insights','me/settings','me/data','support']){x.app.navigate(route);const ids=x.$$('[id]').map(e=>e.id);eq(new Set(ids).size,ids.length);ok(x.$$('button').every(b=>b.textContent.trim()||b.getAttribute('aria-label')||b.getAttribute('aria-labelledby')));ok(x.$$('img').every(i=>i.hasAttribute('alt')));for(const l of x.$$('label[for]'))ok(x.w.document.getElementById(l.htmlFor),'Broken label '+l.htmlFor);}x.close();
});
await scenario('Desktop search width defeats the original fixed-icon rule',async()=>{
 const css=fs.readFileSync(path.join(__dirname,'../dist/styles.css'),'utf8');ok(/\.topbar-actions \.search-launch\{[^}]*width:auto;[^}]*white-space:nowrap/.test(css));ok(css.includes('.player-scroll.text-focus{grid-template-columns:minmax(0,1fr)}'));
});
await scenario('Skip to content retains the current page and route',async()=>{
 const x=setup();x.app.navigate('library/guides');const hash=x.w.location.hash;x.click('a.skip');eq(x.w.location.hash,hash);eq(x.S.router.current.tab,'guides');eq(x.w.document.activeElement,x.$('#main'));x.close();
});
await scenario('Repeated navigation does not create duplicate history entries',async()=>{
 const x=setup();x.app.navigate('support');const length=x.w.history.length;x.app.navigate('support');eq(x.w.history.length,length);x.close();
});
await scenario('Four-practice routines can reorder, complete and exit cleanly',async()=>{
 const x=setup();x.app.store.routine=['box','ground','listen','tide'];x.app.navigate('me/routine');x.click('[data-routine-move="0"][data-direction="1"]');eq(x.app.store.routine[0],'ground');x.click('[data-action="start-routine"]');for(let i=0;i<4;i++){eq(x.app.state.session.practice.id,x.app.store.routine[i]);ok(x.$('#player').open);x.click('[data-action="routine-next"]');}eq(x.$('#player').open,false);eq(x.app.state.routineQueue.length,0);x.app.navigate('me/routine');x.click('[data-routine-remove="0"]');eq(x.app.store.routine.length,3);x.close();
});
await scenario('Every journey completes, revisits, unmarks and resets',async()=>{
 const x=setup();for(const j of x.S.content.journeys){x.app.navigate('library/journeys?journey='+j.id);for(let i=0;i<j.steps.length;i++)x.click('[data-adv="journey-complete"]');eq(x.app.store.journeyProgress[j.id].length,j.steps.length);eq(x.$('#modal').open,false);x.app.navigate('library/journeys?journey='+j.id);x.click('[data-adv="journey-step"][data-value="0"]');x.click('[data-adv="journey-unmark"]');ok(!x.app.store.journeyProgress[j.id].includes(0));x.click('[data-action="close-modal"]');}x.app.navigate('library/journeys');x.click('[data-adv="journey-reset-all"]');x.click('[data-adv="journey-reset-confirm"]');eq(Object.keys(x.app.store.journeyProgress).length,0);x.close();
});
await scenario('Journal editing, deletion and Undo preserve the intended record',async()=>{
 const x=setup({raw});x.app.navigate('me/journal');x.click('[data-edit-journal="j"]');x.$('#edit-journal').value='Updated reflection';x.submit('#edit-journal-form');eq(x.app.store.journals[0].text,'Updated reflection');x.click('[data-delete-entry="j"]');eq(x.app.store.journals.length,0);x.click('[data-action="undo"]');eq(x.app.store.journals[0].text,'Updated reflection');eq(JSON.parse(x.w.localStorage.getItem('serein-hca-v3')).journals[0].text,'Updated reflection');x.close();
});
await scenario('Every guide can be saved, reopened and removed from the collection',async()=>{
 const x=setup();for(const g of x.S.data.resources){x.app.openResource(g.id);x.click('[data-save-resource="'+g.id+'"]');ok(x.app.store.savedResources.includes(g.id));x.click('[data-action="close-modal"]');}x.app.navigate('me/saved');x.click('[data-saved-tab="guides"]');eq(x.$$('.resource-card').length,14);x.click('.resource-card .card-open');const id=x.$('[data-save-resource]').dataset.saveResource;x.click('[data-save-resource="'+id+'"]');ok(!x.app.store.savedResources.includes(id));x.close();
});
await scenario('Encrypted imports retain encryption by default and reject a wrong passcode',async()=>{
 const a=setup({raw});await a.app.modern.vault.enable('long test passphrase');const archive=await a.app.modern.vault.exportEncrypted(),x=setup();await x.app.modern.importFile({size:2000,text:async()=>JSON.stringify(archive)});x.$('#archive-pass').value='wrong pass';x.submit('#archive-pass-form');await wait(120);ok(x.$('#archive-error').textContent.includes('incorrect'));eq(x.app.store.journals.length,0);x.$('#archive-pass').value='long test passphrase';x.submit('#archive-pass-form');await wait(160);ok(x.$('#import-use-lock').checked);x.click('[data-v5="import-merge"]');await wait(160);ok(x.app.modern.vault.enabled);eq(x.app.store.journals[0].text,'Secret record');ok(!x.w.localStorage.getItem('serein-hca-v3').includes('Secret record'));a.close();x.close();
});
await scenario('Only one lazy image observer is retained across route changes',async()=>{
 const x=setup();let observers=0;const watched=new Set();x.w.IntersectionObserver=class{constructor(){observers++}observe(el){watched.add(el)}unobserve(el){watched.delete(el)}};for(const route of ['library/practices','library/guides','today','library/practices'])x.app.navigate(route);eq(observers,1);ok([...watched].every(el=>el.isConnected));x.close();
});
await scenario('Unicode calendar exports fold correctly and retain selected days',async()=>{
 const x=setup();x.app.navigate('me/settings');x.click('[data-adv="app-options"]');await settle();x.$('#reminder-title').value='Pause, support; '+ 'é'.repeat(60);x.$('#reminder-time').value='07:10';x.submit('#reminder-form');const text=await x.downloads.at(-1).text(),lines=text.split('\r\n');ok(lines.every(l=>Buffer.byteLength(l)<=75));const flat=text.replace(/\r\n /g,'');ok(flat.includes('SUMMARY:Pause\\, support\\; '));ok(flat.includes('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'));ok(flat.includes('T071000'));const n=x.downloads.length;for(const e of x.$$('input[name="days"]'))e.checked=false;x.submit('#reminder-form');eq(x.downloads.length,n);ok(x.$('#reminder-error').textContent.includes('Choose at least one'));x.close();
});
await scenario('Offline setup times out instead of trapping its prepare button',async()=>{
 const x=setup();x.w.caches={keys:async()=>[]};Object.defineProperty(x.w.navigator,'serviceWorker',{value:{register:async()=>({}),ready:new Promise(()=>{})}});x.w.fetch=async()=>({ok:true,text:async()=> '/* SEREIN_OFFLINE_WORKER */'});const native=x.w.setTimeout.bind(x.w);x.w.setTimeout=(fn,ms,...args)=>native(fn,ms===15000?5:ms,...args);x.app.navigate('me/settings');x.click('[data-adv="app-options"]');await settle();x.click('[data-adv="offline"]');await wait(30);eq(x.$('#offline-prepare').disabled,false);ok(x.$('#offline-status').textContent.includes('could not finish'));x.close();
});

await scenario('A stale tab cannot overwrite a newer encrypted browser archive',async()=>{
 const x=setup({raw}),external=JSON.stringify({...raw,vault:{ciphertext:'newer encrypted state'},journals:undefined});x.w.localStorage.setItem('serein-hca-v3',external);const result=await x.S.store.persist();eq(result,false);eq(x.w.localStorage.getItem('serein-hca-v3'),external);await settle();ok(x.$('#toast').textContent.includes('another tab'));x.close();
});
await scenario('Exiting a playing practice leaves its engine paused',async()=>{
 const x=setup();x.app.openPractice('ground');x.S.player.playPause();x.S.player.exit();eq(x.app.state.session.state,'paused');x.close();
});
await scenario('Audit release version is consistent in the UI and metadata',async()=>{const x=setup();eq(x.app.version,'5.1.1');eq(x.$('#app-version').textContent,x.app.version);eq(x.$('meta[name="serein-version"]').content,x.app.version);x.close();});
await scenario('Today remains understandable when all suggestions are excluded',async()=>{const x=setup();for(const p of x.S.data.practices)x.app.store.practiceChoices[p.id]='exclude';x.app.render();eq(x.$$('main h1').length,1);ok(x.$('main [data-nav="me/settings"]'));x.click('#mobile-nav [data-v5="quick"]');ok(x.$('#modal').open);x.close();});
eq(errors.length,0,errors.join('\n'));
fs.writeFileSync(path.join(__dirname,'audit-results.json'),JSON.stringify({checks,scenarios:outcomes},null,2));
cleanup();const failed=outcomes.filter(x=>x.result==='FAIL');console.log(checks+' audit assertions; '+outcomes.length+' scenarios; '+failed.length+' failed.');if(failed.length)process.exitCode=1;
})().catch(e=>{console.error(e.stack);cleanup();process.exit(1)});
