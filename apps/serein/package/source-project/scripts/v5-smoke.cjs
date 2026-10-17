const fs=require('fs'),{JSDOM,VirtualConsole}=require('jsdom'),path=require('path'),{webcrypto}=require('crypto');
const dist=path.join(__dirname,'../dist'),html=fs.readFileSync(path.join(dist,'index.html'),'utf8'),scripts=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(x=>x[1]);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html.replace(/<script src="[^"]+"><\/script>/g,''),{url:'https://serein.example/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc}),w=dom.window;
w.structuredClone=structuredClone;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;Object.defineProperty(w,'crypto',{value:webcrypto});
w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};w.HTMLCanvasElement.prototype.getContext=()=>null;w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};
try{
 for(const f of scripts)w.eval(fs.readFileSync(path.join(dist,f),'utf8'));
 for(const route of ['today','library/practices','library/guides','library/journeys','toolkit','me/journal','me/saved','me/routine','me/insights','me/settings','me/data','support']){w.Serein.app.navigate(route);console.log(route,w.document.querySelector('main h1')?.textContent);}
 w.Serein.player.open('box');console.log('player',w.Serein.player.engine.state,w.document.querySelector('#player-title').textContent);
 console.log('errors',JSON.stringify(errors));
}catch(e){console.error(e);process.exitCode=1;}
setTimeout(()=>w.close(),40);
