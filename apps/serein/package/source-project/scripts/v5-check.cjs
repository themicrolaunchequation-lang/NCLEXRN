'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{JSDOM,VirtualConsole}=require('jsdom'),{webcrypto}=require('crypto');
const dist=path.join(__dirname,'../dist'),html=fs.readFileSync(path.join(dist,'index.html'),'utf8'),scripts=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(x=>x[1]);
const errors=[],windows=[];let checks=0;
function setup(options={}){
 const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html.replace(/<script src="[^"]+"><\/script>/g,''),{url:options.url||'https://serein.example/index.html',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});const w=dom.window;windows.push(w);
 w.structuredClone=structuredClone;w.scrollTo=()=>{};w.matchMedia=q=>({matches:!!options.dark&&q.includes('color-scheme'),addEventListener(){}});
 w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;Object.defineProperty(w,'crypto',{value:options.noCrypto?{}:webcrypto});
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};w.HTMLCanvasElement.prototype.getContext=()=>null;
 const downloads=[];w.Blob=Blob;w.URL.createObjectURL=b=>{downloads.push(b);return 'blob:test'};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=()=>{};
 const raw=options.raw||{app:'Serein',version:4,checkins:[],journals:[],onboarded:options.firstRun?false:true,preferences:{theme:options.auto?'auto':'light',time:120,role:'Healthcare worker'}};
 try{w.localStorage.setItem('serein-hca-v3',typeof raw==='string'?raw:JSON.stringify(raw));}catch{}
 for(const [k,v] of Object.entries(options.session||{}))w.sessionStorage.setItem(k,v);
 for(const file of scripts)w.eval(fs.readFileSync(path.join(dist,file),'utf8'));
 const app=w.Serein.app,$=s=>w.document.querySelector(s),$$=s=>[...w.document.querySelectorAll(s)];
 return {w,app,S:w.Serein,$,$$,downloads,click:s=>{assert($(s),'Missing '+s);$(s).click()},change:(s,value)=>{const e=$(s);assert(e,'Missing '+s);if(e.type==='checkbox')e.checked=value;else e.value=String(value);e.dispatchEvent(new w.Event('change',{bubbles:true}))},submit:s=>$(s).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true})),close:()=>w.close()};
}
const wait=n=>new Promise(r=>setTimeout(r,n)),settle=()=>new Promise(r=>setImmediate(r));
async function main(){
 let x=setup(),{w,app,S,$,$$,click,change,submit}=x;
 const aliases={practices:'library/practices',journeys:'library/journeys',studios:'toolkit',reflect:'me/journal',space:'me/saved'};
 for(const [old,canonical] of Object.entries(aliases)){assert.equal(S.router.parse(old).canonical,canonical);checks++;}
 for(const route of ['today','library/practices','library/guides','library/journeys','toolkit','me/journal','me/saved','me/routine','me/insights','me/settings','me/data','support']){
  app.navigate(route);assert($('main h1'));assert.equal($$('#desktop-nav button').length,6);assert.equal($$('#mobile-nav button').length,5);assert(!$('#sidebar [data-context-open],#sidebar [data-context-tip]'));const ids=$$('[id]').map(e=>e.id);assert.equal(new Set(ids).size,ids.length,'Duplicate ID on '+route);checks++;
 }
 app.navigate('library/practices?time=60&style=nonbreath');assert.equal(app.state.budget,60);assert.equal(app.state.style,'nonbreath');assert($$('.practice-card').length);for(const b of $$('.practice-card [data-practice-detail]'))assert(!S.data.practices.find(p=>p.id===b.dataset.practiceDetail).breathFocus);checks++;
 click('.practice-card .card-open');assert($('#detail-duration'));assert.equal(app.state.session,null);assert($('#modal .evidence-grid'));click('[data-v5="detail-start"]');assert($('#player').open);assert.equal(app.state.session.state,'ready');click('[data-action="exit-player"]');checks++;
 app.navigate('today');assert.equal($$('main [data-adv="finder"]').length,1);assert.equal($$('main .pause-card').length,1);const selected=$('main [data-moment="3"]');selected.focus();selected.click();assert.equal(app.state.moment,3);assert.equal(w.document.activeElement,selected,'Moment change replaced focused control');checks++;
 click('main [data-mood="4"]');assert.equal(app.store.checkins.at(-1).persistent,false);assert.equal(JSON.parse(w.localStorage.getItem('serein-hca-v3')).checkins.length,0);click('[data-v5="save-quick-checkin"]');assert.equal(JSON.parse(w.localStorage.getItem('serein-hca-v3')).checkins.length,1);checks++;
 app.navigate('me/settings');change('#pref-theme','night');assert.equal(w.document.body.dataset.theme,'night');change('#pref-theme','contrast');assert.equal(w.document.body.dataset.theme,'contrast');change('#pref-reading','extra');assert.equal(w.document.body.dataset.reading,'extra');assert(!$('#settings-form button[type="submit"]'));checks++;
 change('#pref-shift','nights');assert.equal(app.store.preferences.shift,'nights');assert.equal(JSON.parse(w.localStorage.getItem('serein-hca-v3')).preferences.shift,'nights');checks++;
 app.navigate('support');$('#contact-name').value='Shift lead';$('#contact-role').value='Team';$('#contact-phone').value='+44 1234 567890';submit('#support-contact-form');assert.equal(app.store.contacts.length,1);assert.equal(app.store.contacts[0].persistent,false);app.navigate('support');$('#contact-name').value='<img src=x onerror=alert(1)>';$('#contact-phone').value='01234 567890';$('#support-contact-form [name="persist"]').checked=true;submit('#support-contact-form');assert.equal(app.store.contacts.length,2);assert.equal($$('.contact-list img').length,0);assert.equal(JSON.parse(w.localStorage.getItem('serein-hca-v3')).contacts.length,1);checks++;
 assert($('a[href="tel:999"]'));assert($('a[href="tel:111"]'));assert($('a[href="tel:116123"]'));assert($('a[href^="sms:85258"]'));click('.global-help');assert($('#modal .help-now'));click('[data-action="close-modal"]');checks++;
 // The same session engine and mapped sources remain available for every practice.
 for(const p of S.data.practices){app.openPractice(p.id);assert.equal($('#player-title').textContent,p.title);assert($('#player-notes-content').textContent.includes(p.safety));assert($('[data-v5="player-settings"]'));click('[data-v5="player-settings"]');assert($('#player-settings').open);assert($('#session-remember'));click('[data-v5="close-player-settings"]');assert.equal(w.document.activeElement,$('#player-settings-button'));click('[data-action="exit-player"]');checks++;}
 app.openPractice('box',60);change('#session-before',2);click('[data-action="play-player"]');assert.equal(app.state.session.state,'playing');click('[data-action="play-player"]');app.state.session.seek(60);app.render();S.player.update(true);assert.equal($('#player-completion').hidden,false);assert.equal($('#completion-title').textContent,'Well done for pausing.');assert($('#feedback-save'));change('#session-after',4);click('[data-adv="feedback"][data-value="Uncomfortable"]');await settle();assert.equal($('#uncomfortable-support').hidden,false);assert.equal(app.store.feedback.at(-1).persistent,false);change('#feedback-save',true);assert.equal(JSON.parse(w.localStorage.getItem('serein-hca-v3')).feedback.length,1);click('[data-v5="back-today"]');checks++;
 // Quick pause respects motion preference and exit cancels its delayed start.
 app.store.preferences.motion=true;app.modern.applyTheme();click('#mobile-nav [data-v5="quick"]');assert.equal(app.state.session.state,'playing');assert.equal($('#quick-countdown'),null);click('[data-action="exit-player"]');checks++;
 app.store.preferences.motion=false;app.modern.applyTheme();click('#mobile-nav [data-v5="quick"]');assert.equal(app.state.session.state,'ready');assert($('#quick-countdown'));click('[data-action="exit-player"]');assert.equal($('#quick-countdown'),null);checks++;
 app.navigate('toolkit/team?practice=ground&duration=120&external=1');assert($('#player').classList.contains('present'));assert.equal(app.state.session.practice.id,'ground');assert.equal(app.state.session.external,true);assert.equal(app.state.visual,'text');assert.equal($('#session-voice').checked,false);click('[data-action="exit-player"]');checks++;
 // Studios preserve fields, output, optional saving and team links.
 for(const s of S.content.studios){
  app.navigate('toolkit');click('[data-adv="studio"][data-id="'+s.id+'"]');assert.equal(S.router.current.tab,s.id);
  for(let step=0;step<3;step++){for(const e of $$('[data-studio-field]'))e.value=e.type==='date'?'2026-11-05':'A useful '+s.id+' step';if(s.id==='boundary'&&step===1)click('[data-adv="boundary-response"][data-value="1"]');click('[data-adv="studio-next"]');}
  assert($('#studio-output').value.length>50,s.id);if(s.id==='conditions'){click('[data-adv="studio-save"]');assert(app.store.savedPlans.length);}
  if(s.id==='team'){await settle();assert($('#team-share-link'));click('[data-v5="share-team"]');assert($('#team-share-link').value.includes('practice='));assert(!$('#team-share-link').value.includes('A useful'));}
  click('[data-action="close-modal"]');checks++;
 }
 for(const j of S.content.journeys){app.navigate('library/journeys');click('[data-adv="journey"][data-id="'+j.id+'"]');click('[data-adv="journey-complete"]');assert(app.store.journeyProgress[j.id].length);click('[data-action="close-modal"]');checks++;}
 app.navigate('me/insights');assert($('.mood-calendar[role="img"]'));assert($('.pair-chart[role="img"]'));assert($('table caption'));change('#date-filter',90);assert.equal(app.state.dateFilter,'90');checks++;
 click('[data-action="search"]');S.app.modern.search('start box breathing');assert($('#search-results [data-v5="command"][data-id="box"]'));click('#search-results [data-v5="command"][data-id="box"]');assert.equal(app.state.session.practice.id,'box');click('[data-action="exit-player"]');checks++;
 app.navigate('me/journal');$('#journal-draft').value='Draft kept locally';$('#journal-draft').dispatchEvent(new w.Event('input',{bubbles:true}));await wait(550);assert.equal(w.sessionStorage.getItem('serein-journal-draft'),'Draft kept locally');submit('#journal-form');assert.equal(app.store.journals.at(-1).persistent,false);assert.equal(JSON.parse(w.localStorage.getItem('serein-hca-v3')).journals.length,0);checks++;
 // Encryption at rest, authenticated failure, reload/unlock, draft recovery and both export formats.
 const secret={app:'Serein',version:4,onboarded:true,journals:[{id:'secret-j',text:'Private reflection about my day',date:'2026-10-15',persistent:true}],checkins:[{id:'secret-c',mood:2,note:'Private context',date:'2026-10-15',persistent:true}],contacts:[{id:'secret-p',name:'Private person',phone:'0123456789',role:'Peer',persistent:true}],preferences:{theme:'auto',time:120}};
 const a=setup({raw:secret});a.app.navigate('me/journal');a.$('#journal-draft').value='A private unsent draft';a.$('#journal-draft').dispatchEvent(new a.w.Event('input',{bubbles:true}));await a.app.modern.vault.enable('test passphrase 456');await a.S.store.persist();
 let raw=a.w.localStorage.getItem('serein-hca-v3');assert(!raw.includes('Private reflection'));assert(!raw.includes('Private context'));assert(!raw.includes('Private person'));assert.equal(JSON.parse(raw).vault.iterations,310000);assert.equal(JSON.parse(raw).journals,undefined);assert.equal(a.w.sessionStorage.getItem('serein-journal-draft'),null);assert(!JSON.stringify(a.w.sessionStorage).includes('private unsent'));checks++;
 await a.app.modern.vault.lock();assert(a.app.modern.vault.locked);assert.equal(a.app.store.journals.length,0);assert(!a.$('main').textContent.includes('Private reflection'));await assert.rejects(a.app.modern.vault.unlock('wrong password'));assert.equal(a.app.store.journals.length,0);checks++;
 const session=Object.fromEntries(Array.from({length:a.w.sessionStorage.length},(_,i)=>a.w.sessionStorage.key(i)).map(k=>[k,a.w.sessionStorage.getItem(k)]));
 const b=setup({raw:a.w.localStorage.getItem('serein-hca-v3'),session});assert(b.app.modern.vault.locked);await b.app.modern.vault.unlock('test passphrase 456');assert.equal(b.app.store.journals[0].text,'Private reflection about my day');assert.equal(b.app.store.checkins[0].note,'Private context');assert.equal(b.app.store.contacts[0].name,'Private person');assert.equal(b.app.state.draft,'A private unsent draft');checks++;
 const encrypted=await b.app.modern.vault.exportEncrypted();assert(!JSON.stringify(encrypted).includes('Private reflection'));const decoded=await b.app.modern.vault.decryptArchive(encrypted,'test passphrase 456');assert.equal(decoded.journals[0].text,'Private reflection about my day');await assert.rejects(b.app.modern.vault.decryptArchive(encrypted,'wrong password'));checks++;
 await b.app.modern.vault.remove('test passphrase 456');assert(!b.app.modern.vault.enabled);assert(b.w.localStorage.getItem('serein-hca-v3').includes('Private reflection'));checks++;
 // Clearing invalidates queued encrypted writes; no delayed write may restore records.
 await a.app.modern.vault.unlock('test passphrase 456');const pending=a.S.store.persist();a.app.modern.vault.reset();await pending;assert.equal(a.w.localStorage.getItem('serein-hca-v3'),null);checks++;
 const unsupported=setup({noCrypto:true});unsupported.app.navigate('me/settings');assert.equal(unsupported.$('[data-v5="setup-lock"]'),null);assert(unsupported.$('main').textContent.includes('Web Crypto is unavailable'));checks++;
 const first=setup({firstRun:true});await wait(20);assert(first.$('.onboarding-step'));first.click('[data-v5="welcome-next"]');assert(first.$('#welcome-role'));first.click('[data-v5="welcome-skip"]');assert.equal(first.app.store.onboarded,true);assert(!first.$('#modal').open);checks++;
 const auto=setup({auto:true,dark:true});assert.equal(auto.w.document.body.dataset.theme,'night');checks++;
 const plain=setup({url:'file:///tmp/Serein-v5.0.html'});plain.app.navigate('me/settings');assert(plain.$('main'));checks++;
 const self=await S.app.modern.selftest();assert(self.every(x=>x.result==='PASS'));checks++;
 assert.deepEqual(errors,[]);console.log(checks+' v5 behaviour and privacy checks passed.');windows.forEach(w=>w.close());
}
main().catch(e=>{console.error(e.name,e.message,e.stack,'checks',checks);windows.forEach(w=>w.close());process.exit(1)});
