// usage: node record2.js <app> <format>   formats: wide (1920x1080), tall (1080x1920)
const {chromium}=require('playwright');const fs=require('fs');
const [,, app, fmt]=process.argv;
const S=parseFloat(process.env.S||"0.17");
const F={wide:{w:1280,h:720,dsf:1.5},tall:{w:540,h:960,dsf:2}}[fmt];
const dir=`${__dirname}/work/${app}-${fmt}`;fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir+'/f',{recursive:true});
(async()=>{
 const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required','--force-device-scale-factor='+F.dsf]});
 const ctx=await b.newContext({viewport:{width:F.w,height:F.h},deviceScaleFactor:1,isMobile:fmt==='tall',hasTouch:fmt==='tall',serviceWorkers:'block'});
 const p=await ctx.newPage();
 await p.addInitScript((S)=>{
  const rn=performance.now.bind(performance), rd=Date.now.bind(Date), p0=rn(), d0=rd();
  window.__d0=d0;
  performance.now=()=>p0+(rn()-p0)*S; Date.now=()=>d0+(rd()-d0)*S;
  const raf=window.requestAnimationFrame.bind(window); window.requestAnimationFrame=(cb)=>raf(()=>cb(performance.now()));
  const st=window.setTimeout.bind(window), si=window.setInterval.bind(window);
  window.setTimeout=(f,d,...a)=>st(f,(d||0)/S,...a); window.setInterval=(f,d,...a)=>si(f,(d||0)/S,...a);
  window.__ev=[];let n=0;const ids=new WeakMap();const id=(e)=>{if(!ids.has(e))ids.set(e,++n);return ids.get(e)};
  const log=(e,k)=>window.__ev.push({t:Date.now(),k,id:id(e),src:e.src||e.currentSrc||'',ct:e.currentTime,vol:e.volume});
  const P=HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play=function(){ this.playbackRate=S; if(!this.__w){this.__w=1;['pause','ended','emptied','volumechange'].forEach(k=>this.addEventListener(k,()=>log(this,k)));} log(this,'play'); return P.apply(this,arguments); };
  try{localStorage.setItem('hca-tour-sound','on')}catch(_){}
 },S);
 await p.goto('http://localhost:8788/home.html',{waitUntil:'load'});await p.waitForTimeout(1500);
 const css=`.tour-ctl,.tour-bars,.tour-x,.tour-sr{display:none!important}`+(fmt==='wide'?`dialog.tour{width:100vw!important;height:100vh!important;max-height:100vh!important;border-radius:0!important;box-shadow:none!important}.tour-in{height:100%!important}`:'');
 await p.addStyleTag({content:css});
 const cdp=await ctx.newCDPSession(p);
 await cdp.send('Animation.enable');await cdp.send('Animation.setPlaybackRate',{playbackRate:S});
 let k=0;const fr=[];
 cdp.on('Page.screencastFrame',async(e)=>{const i=k++;fs.writeFileSync(`${dir}/f/${String(i).padStart(6,'0')}.jpg`,Buffer.from(e.data,'base64'));fr.push(e.metadata.timestamp);try{await cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId})}catch(_){}});
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:90,everyNthFrame:1});
 await p.waitForTimeout(600);
 await p.evaluate((a)=>{window.__open=Date.now();const el=document.querySelector(`[data-tour="${a}"]`);el.scrollIntoView();el.click()},app);
 const t=Date.now();let done=false;
 const LIM=parseInt(process.env.LIMIT||'0');while(!done&&Date.now()-t<900000){if(LIM&&Date.now()-t>LIM*1000)break;await p.waitForTimeout(500);done=await p.evaluate(()=>{const b=[...document.querySelectorAll('.tour-seg')];return b.length&&b[b.length-1].getAttribute('aria-current')==='step'});}
 const tEndV=await p.evaluate(()=>Date.now());
 for(let i=0;i<120;i++){const ended=await p.evaluate((te)=>window.__ev.some(e=>e.k==='ended'&&e.t>=te&&/tour\//.test(e.src)),tEndV-300);if(ended)break;await p.waitForTimeout(500);}
 await p.waitForTimeout(3000); // 1.5 s of tour time after the last word
 await cdp.send('Page.stopScreencast');
 const ev=await p.evaluate(()=>window.__ev);const o=await p.evaluate(()=>({open:window.__open,d0:window.__d0}));
 fs.writeFileSync(`${dir}/meta.json`,JSON.stringify({ev,open:o.open,d0:o.d0,S,frames:fr,fmt,app,w:F.w*F.dsf,h:F.h*F.dsf}));
 console.log(app,fmt,'frames',k,'real secs',(fr[fr.length-1]-fr[0]).toFixed(1),'virtual fps',(k/((fr[fr.length-1]-fr[0])*S)).toFixed(1));
 await b.close();
})();
