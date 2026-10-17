const {JSDOM,VirtualConsole}=require('jsdom');
const {IDBFactory}=require('fake-indexeddb');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const errors=[],vc=new VirtualConsole();
vc.on('jsdomError',error=>{if(!/Could not parse CSS|Not implemented/.test(error.message))errors.push(error.message)});
const dom=new JSDOM(fs.readFileSync('dist-test/MedLex.html','utf8'),{
 url:'https://medlex.test',runScripts:'dangerously',virtualConsole:vc,
 beforeParse(w){
  w.indexedDB=new IDBFactory();w.structuredClone=structuredClone;w.matchMedia=()=>({matches:false,addEventListener(){}});
  w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
  w.ResizeObserver=class{constructor(callback){w.testResize=callback}observe(){}disconnect(){}};
 }
});
const w=dom.window,q=s=>w.document.querySelector(s),ev=s=>w.__MEDLEX_TEST__.evaluate(s);
const wait=()=>new Promise(resolve=>setTimeout(resolve,35));
(async()=>{
 await new Promise(resolve=>setTimeout(resolve,300));
 ev('closeModal();v3.profile.onboardingComplete=true;location.hash="infographics";render()');await wait();
 await ev('openInfographic("ch1")');await wait();
 const dialog=q('#infographicViewer'),stage=q('#infoImageStage');
 assert.equal(dialog.dataset.windowSize,'comfortable');
 assert.equal(q('#infoWindowSize').textContent,'Comfortable');
 assert.equal(q('#infoZoom').textContent,'50%');
 assert.equal(stage.style.getPropertyValue('--info-zoom'),'0.5');
 assert.equal(q('[data-info=fit]').textContent,'Fit 50%');
 assert.equal(q('[data-info=windowSmaller]').disabled,false);
 let stageWidth=740;Object.defineProperty(stage,'clientWidth',{get:()=>stageWidth,configurable:true});w.testResize();
 assert.equal(stage.style.getPropertyValue('--info-fit-width'),'716px');
 stage.scrollTop=125;q('[data-info=windowSmaller]').click();
 assert.equal(dialog.dataset.windowSize,'compact');
 assert.equal(q('#infoWindowSize').textContent,'Compact');
 assert.equal(q('[data-info=windowSmaller]').disabled,true);
 assert.equal(stage.scrollTop,125,'Changing popup size must not jump to the start of a poster');
 stageWidth=560;w.testResize();assert.equal(stage.style.getPropertyValue('--info-fit-width'),'536px');
 assert.equal(stage.style.getPropertyValue('--info-zoom'),'0.5','Overview remains half the available width after resizing');
 w.innerWidth=390;w.dispatchEvent(new w.Event('resize'));
 assert.equal(q('#infoZoom').textContent,'100%');assert.equal(q('[data-info=fit]').textContent,'Fit width');
 w.innerWidth=1024;w.dispatchEvent(new w.Event('resize'));
 assert.equal(q('#infoZoom').textContent,'50%');assert.equal(q('[data-info=fit]').textContent,'Fit 50%');
 q('[data-info=windowLarger]').click();q('[data-info=windowLarger]').click();
 assert.equal(dialog.dataset.windowSize,'wide');assert.equal(q('[data-info=windowLarger]').disabled,true);
 assert.equal(w.localStorage.getItem('medlex.infographicViewerSize'),'2');
 q('[data-info=zoomIn]').click();assert.equal(q('#infoZoom').textContent,'75%');
 q('[data-info=fill]').click();assert.equal(q('#infoZoom').textContent,'100%');
 q('[data-info=fit]').click();assert.equal(q('#infoZoom').textContent,'50%');
 q('[data-info=close]').click();assert.equal(dialog.open,false);
 await ev('openInfographic("ch2")');assert.equal(dialog.dataset.windowSize,'wide','Popup preference survives closing and reopening');
 assert.equal(q('#infoZoom').textContent,'50%','Each new poster opens in the overview');
 assert.deepEqual(errors,[]);w.close();
 console.log('Infographic popup sizes, fitted-width resizing, zoom independence and preference: passed (DOM simulation).');
})().catch(error=>{console.error(error);w.close();process.exit(1)});
