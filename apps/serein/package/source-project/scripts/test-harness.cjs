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

module.exports={setup,wait,settle,errors,windows,cleanup:()=>windows.forEach(w=>w.close())};
