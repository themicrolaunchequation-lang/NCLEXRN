const {JSDOM,VirtualConsole}=require('jsdom'),{IDBFactory}=require('fake-indexeddb'),fs=require('fs'),assert=require('node:assert/strict');
const errors=[],pending=[],rejections=[],vc=new VirtualConsole();
process.on('unhandledRejection',error=>rejections.push(String(error)));
vc.on('jsdomError',e=>{if(!/Could not parse CSS|Not implemented/.test(e.message))errors.push(e.message)});
const dom=new JSDOM(fs.readFileSync('dist-test/MedLex.html','utf8'),{url:'https://medlex.test',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
 w.indexedDB=new IDBFactory();w.structuredClone=structuredClone;w.matchMedia=()=>({matches:true,addEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
 const add=w.document.addEventListener.bind(w.document);w.document.addEventListener=(type,listener,options)=>add(type,function(e){const result=listener.call(this,e);if(result?.then)pending.push(result.catch(error=>rejections.push(String(error))));},options);
}}),w=dom.window,q=s=>w.document.querySelector(s),ev=s=>w.__MEDLEX_TEST__.evaluate(s),wait=()=>new Promise(r=>setTimeout(r,30));
async function go(route){ev('location.hash='+JSON.stringify(route)+';render()');await wait()}
async function flush(){await Promise.all(pending);await wait()}
(async()=>{
 await new Promise(r=>setTimeout(r,300));ev('closeModal();v3.profile.onboardingComplete=true');
 await go('infographics?topic=decode-1');await ev('loadInfographicAssets()');await wait();assert(q('#infographicViewer')?.open,JSON.stringify({hash:w.location.hash,errors,rejections}));q('[data-info=close]').click();assert(!q('#infographicViewer').open);
 q('#infoSearch').value='oxygenation';q('#infoSearch').dispatchEvent(new w.Event('input',{bubbles:true}));await wait();
 assert(!q('#infographicViewer').open,'Filtering after closing a deep-linked poster must keep the viewer closed');assert.equal(w.document.querySelectorAll('.info-card').length,1);
 q('[data-info=group][data-value="Memory cues"]').click();await wait();assert(!q('#infographicViewer').open);assert.equal(w.document.querySelectorAll('.info-card').length,8);
 await go('infographics');const input=q('#infoImageBackup');let resolveFile;
 Object.defineProperty(input,'files',{value:[{size:100,text:()=>new Promise(resolve=>{resolveFile=resolve})}]});input.dispatchEvent(new w.Event('change',{bubbles:true}));
 await go('learn');resolveFile(JSON.stringify({app:'MedLexInfographicImages',version:1,images:[]}));await flush();assert.deepEqual(rejections,[],'A backup read completing after navigation must not reject');assert.equal(q('main h1').textContent,'Learn');assert.equal(ev('INFO_VIEW.pending'),null,'An abandoned backup preview must not remain actionable');
 await go('infographics');const png='data:image/png;base64,'+fs.readFileSync('public/icon-192.png').toString('base64');
 const restoreInput=q('#infoImageBackup');Object.defineProperty(restoreInput,'files',{value:[{size:png.length,text:async()=>JSON.stringify({app:'MedLexInfographicImages',version:1,images:[{id:'ch1',data:png}]})}]});restoreInput.dispatchEvent(new w.Event('change',{bubbles:true}));await flush();assert(q('[data-info=restoreImages]'));q('[data-info=restoreImages]').click();await go('learn');await flush();assert.deepEqual(rejections,[],'An in-progress restore must survive route changes');
 assert.equal(ev('infographicAssets.get("ch1").saved'),true,'An already-started restore must finish saving when the page changes');assert.equal(q('main h1').textContent,'Learn');
 await go('infographics');let resolveNotes;const notesInput=q('#infoNotesBackup');Object.defineProperty(notesInput,'files',{value:[{size:100,text:()=>new Promise(resolve=>{resolveNotes=resolve})}]});notesInput.dispatchEvent(new w.Event('change',{bubbles:true}));await go('learn');resolveNotes(JSON.stringify({app:'MedLexInfographicAnnotations',version:1,boards:[]}));await flush();assert.equal(ev('INFO_VIEW.pendingNotes'),null);assert.deepEqual(rejections,[]);
 await go('infographics');const restoreNotes=q('#infoNotesBackup');Object.defineProperty(restoreNotes,'files',{value:[{size:250,text:async()=>JSON.stringify({app:'MedLexInfographicAnnotations',version:1,boards:[{id:'ch2',strokes:[],notes:[{id:'note-restore',x:.2,y:.3,color:'#c9f0df',text:'Restored after navigating'}]}]})}]});restoreNotes.dispatchEvent(new w.Event('change',{bubbles:true}));await flush();assert(q('[data-info=restoreAnnotations]'));q('[data-info=restoreAnnotations]').click();await go('learn');await flush();await ev('flushInfographicAnnotations()');assert.equal(ev('annotationRecords.get("ch2").notes[0].text'),'Restored after navigating');assert(!q('#infographicViewer').open);assert.deepEqual(rejections,[]);
 ev('INFO_VIEW.category="All";INFO_VIEW.query=""');await go('infographics');assert.equal(q('.info-card[data-topic=ch1] img').src,png);assert.deepEqual(errors,[]);
 const report={method:'JSDOM and fake IndexedDB; navigation with deferred file reads and writes. No native browser assertions.',checks:{deepLinkCloseThenSearch:true,deepLinkCloseThenGroup:true,abandonedBackupRead:true,restoreCompletesAfterNavigation:true,abandonedNotesBackupRead:true,notesRestoreCompletesAfterNavigation:true},errors,rejections};
 fs.writeFileSync('review/infographics/navigation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));w.close();
})().catch(error=>{console.error(error);w.close();process.exit(1)});
