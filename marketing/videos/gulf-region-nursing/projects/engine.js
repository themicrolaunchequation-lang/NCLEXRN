// Deterministic video compositor: window.renderAt(t) draws one frame. Config in window.CFG.
(function(){
const C = window.CFG, $ = s => document.querySelector(s);
const ease = x => x<.5 ? 4*x*x*x : 1-Math.pow(-2*x+2,3)/2, clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const outBack = x => { const c1=1.70158,c3=c1+1; return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2); };
const W=C.W, H=C.H; document.documentElement.style.setProperty('--W',W+'px'); document.documentElement.style.setProperty('--H',H+'px');
const st=$('#stage');
st.innerHTML = `<div id="bg"></div><div id="grain"></div>
 <div id="brand"><img src="${C.crest}"><div><b>${C.brandTitle}</b><span>${C.brandSub}</span></div></div>
 <div id="head"></div>
 <div id="win"><div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><span>${C.url}</span></div><div id="cam"></div><div id="shade"></div></div>
 <div id="cap"><div class="line"></div></div>
 <svg id="cursor" viewBox="0 0 32 32"><path d="M6 3 L6 26 L12 20 L16.5 29 L20.5 27.2 L16 18.5 L24 18.5 Z" fill="#fff" stroke="#0f172a" stroke-width="2" stroke-linejoin="round"/></svg>
 <div id="cta"></div>${C.note?`<div id="note" style="position:absolute;left:0;right:0;bottom:${H>W?18:10}px;text-align:center;z-index:60;font:700 ${H>W?28:22}px Inter,sans-serif;color:rgba(226,232,240,.85);padding:0 30px">${C.note}</div>`:''}`;
const L=C.layout, win=$('#win'), cam=$('#cam');
Object.assign(win.style,{left:L.win[0]+'px',top:L.win[1]+'px',width:L.win[2]+'px',height:L.win[3]+'px'});
const cap=$('#cap'); Object.assign(cap.style,{left:L.cap[0]+'px',top:L.cap[1]+'px',width:L.cap[2]+'px',height:L.cap[3]+'px'});
cap.firstChild.style.fontSize=L.capSize+'px';
const brand=$('#brand'); Object.assign(brand.style,{left:L.brand[0]+'px',top:L.brand[1]+'px'});
const head=$('#head'); Object.assign(head.style,{left:L.head[0]+'px',top:L.head[1]+'px',width:L.head[2]+'px'});
// shot images
const imgs={}; for (const [n,s] of Object.entries(C.shots)) { const im=new Image(); im.src=s.src; im.style.opacity=0; cam.appendChild(im); imgs[n]=im; }
const camW=L.win[2], camH=L.win[3]-34;
// dynamic elements
function mk(cls, parent=st){ const d=document.createElement('div'); d.className=cls; parent.appendChild(d); return d; }
const hls=(C.hl||[]).map(()=>mk('hl', cam)), cos=(C.callouts||[]).map(c=>{ const d=mk('callout'); d.innerHTML=c.html; d.style.background=c.bg; d.style.fontSize=c.size+'px'; return d; });
const rips=(C.cursor||[]).filter(k=>k.click).map(()=>mk('ripple'));
const kins=(C.kin||[]).map(k=>{ const d=mk('kin'); d.innerHTML=k.html; d.style.fontSize=k.size+'px'; d.style.top=k.y+'px'; if(k.color) d.style.color=k.color; return d; });
const bubs=(C.bubbles||[]).map(b=>{ const d=mk('bubble'); d.innerHTML=`<div class="av" style="${b.col?'background:'+b.col:''}">${b.av}</div><div><div class="who">${b.who}</div><div class="msg" style="font-size:${b.size}px"></div></div>`; Object.assign(d.style,{left:b.x+'px',top:b.y+'px',width:b.w+'px'}); return d; });
const cta=$('#cta'); cta.innerHTML=C.cta.html; cta.style.setProperty('--crest',C.cta.crest+'px'); cta.style.setProperty('--ctaBottom',(C.cta.bottom||0)+'px'); [...cta.children].forEach(c=>c.style.willChange='transform,opacity');
// camera
function camAt(t){ const k=C.cam; let cur=k[0].r, prev=k[0].r, p=1;
  for (let i=0;i<k.length;i++){ if(t>=k[i].t){ prev = i? k[i-1].r : k[i].r; cur=k[i].r; p=clamp((t-k[i].t)/(k[i].d||0.001)); prevSet(i); } }
  function prevSet(i){ if(i>0){ prev = resolvedAt(i-1, k[i].t); } }
  const e=ease(p); return [prev[0]+(cur[0]-prev[0])*e, prev[1]+(cur[1]-prev[1])*e, prev[2]+(cur[2]-prev[2])*e];
}
function resolvedAt(i, t){ const k=C.cam; const prev = i? resolvedAt(i-1,k[i].t) : k[i].r; const p=ease(clamp((t-k[i].t)/(k[i].d||0.001))); return [prev[0]+(k[i].r[0]-prev[0])*p, prev[1]+(k[i].r[1]-prev[1])*p, prev[2]+(k[i].r[2]-prev[2])*p]; }
function camNow(t){ const k=C.cam; let i=0; while(i+1<k.length && t>=k[i+1].t) i++; return resolvedAt(i, t); }
function toScreen(x,y,c){ const s=camW/c[2]; return [L.win[0]+(x-c[0])*s, L.win[1]+34+(y-c[1])*s, s]; }
function shotAt(t){ let cur=C.shotSeq[0], prev=null; for(const s of C.shotSeq){ if(t>=s.t){ prev=cur===s?prev:cur; cur=s; } } return [cur,prev]; }
window.renderAt = function(t){
  // background drift
  const bg=$('#bg').style; bg.setProperty('--gx',(30+10*Math.sin(t*.25))+'%'); bg.setProperty('--gy',(20+8*Math.cos(t*.2))+'%'); bg.setProperty('--hx',(80+8*Math.cos(t*.22))+'%'); bg.setProperty('--hy',(85+6*Math.sin(t*.3))+'%');
  // window transform (fly-in / blur / hide)
  const wv=C.win(t); win.style.transform=`perspective(1800px) translateY(${wv.y||0}px) rotateX(${wv.rx||0}deg) scale(${wv.s??1})`; win.style.filter=wv.blur?`blur(${wv.blur}px)`:''; win.style.opacity=wv.o??1; $('#shade').style.opacity=wv.shade||0;
  // shots
  const c=camNow(t), s=camW/c[2];
  const [cur]=shotAt(t); let curIdx=C.shotSeq.indexOf(cur); const prev=curIdx>0?C.shotSeq[curIdx-1]:null;
  for (const [n,im] of Object.entries(imgs)) { im.style.opacity=0; }
  const pt=clamp((t-cur.t)/(cur.d||0.001));
  const place=(im)=>{ im.style.width=(C.shotW*s)+'px'; im.style.transform=`translate(${-c[0]*s}px,${-c[1]*s}px)`; };
  const ci=imgs[cur.name]; place(ci);
  if (cur.tr==='fade' && prev && pt<1){ const pi=imgs[prev.name]; place(pi); pi.style.opacity=1; ci.style.opacity=ease(pt); ci.style.zIndex=2; pi.style.zIndex=1; }
  else if (cur.tr==='pop' && pt<1){ const pi=prev&&imgs[prev.name]; if(pi){place(pi); pi.style.opacity=1; pi.style.zIndex=1;} ci.style.zIndex=2; ci.style.opacity=clamp(pt*2.5); ci.style.transform+=` scale(${0.9+0.1*outBack(pt)})`; ci.style.transformOrigin=`${(c[0]+c[2]/2)*s}px ${(c[1]+camH/s/2)*s}px`; }
  else { ci.style.opacity=1; ci.style.zIndex=2; }
  // highlights (in shot coordinates)
  (C.hl||[]).forEach((h,i)=>{ const d=hls[i]; const a=clamp((t-h.t0)/.35)*clamp((h.t1-t)/.3); d.style.opacity=a; const p=8; const pulse=1+0.03*Math.sin((t-h.t0)*6);
    Object.assign(d.style,{left:((h.r[0]-p-c[0])*s)+'px',top:((h.r[1]-p-c[1])*s)+'px',width:((h.r[2]+2*p)*s)+'px',height:((h.r[3]+2*p)*s)+'px',transform:`scale(${pulse})`,borderColor:h.color||'#f5c542'}); });
  // callouts (screen coords)
  (C.callouts||[]).forEach((o,i)=>{ const d=cos[i]; const a=clamp((t-o.t0)/.3)*clamp((o.t1-t)/.3); const e=outBack(clamp((t-o.t0)/.45));
    d.style.opacity=a; d.style.left=o.x+'px'; d.style.top=o.y+'px'; d.style.transform=`translateX(-50%) scale(${0.6+0.4*e})`; });
  // cursor
  const K=C.cursor||[]; const cu=$('#cursor'); let vis=0, cx=0, cy=0; let ri=0;
  for (let i=0;i<K.length;i++){ const k=K[i]; const end=k.t+(k.d||0.6); if(t>=k.t-0.4){ vis=k.hide&&t>k.t?0:1; const from=i&&K[i-1].t<k.t&&!K[i-1].hide?K[i-1]:{x:k.x+120,y:k.y+160}; const p=ease(clamp((t-k.t)/(k.d||0.6))); const [fx,fy]=toScreen(from.x,from.y,c), [tx,ty]=toScreen(k.x,k.y,c); cx=fx+(tx-fx)*p; cy=fy+(ty-fy)*p; }
    if(k.click){ const r=rips[ri++]; const ct=end; const a=clamp((t-ct)/.5); const [rx,ry]=toScreen(k.x,k.y,c); r.style.left=(rx-10)+'px'; r.style.top=(ry-10)+'px'; r.style.opacity=(t>=ct&&a<1)?(1-a):0; r.style.transform=`scale(${1+a*3.5})`; } }
  const press=K.some(k=>k.click&&t>=k.t+(k.d||.6)&&t<k.t+(k.d||.6)+.15);
  cu.style.opacity=vis*clamp(C.cursorOn(t)); cu.style.transform=`translate(${cx-8}px,${cy-4}px) scale(${press?.85:1})`;
  // kinetic text
  (C.kin||[]).forEach((k,i)=>{ const d=kins[i]; const a=clamp((t-k.t0)/.25)*clamp((k.t1-t)/.3); const e=outBack(clamp((t-k.t0)/.5)); d.style.opacity=a; d.style.transform=`translateY(${(1-e)*40}px) scale(${0.7+0.3*e})`;
    if(k.count){ const p=ease(clamp((t-k.count.t)/k.count.d)); d.querySelector('[data-n]').textContent=k.count.fmt(k.count.from+(k.count.to-k.count.from)*p); } });
  // bubbles (typed text)
  (C.bubbles||[]).forEach((b,i)=>{ const d=bubs[i]; const a=clamp((t-b.t0)/.25)*clamp((b.t1-t)/.3); const e=outBack(clamp((t-b.t0)/.45)); d.style.opacity=a; d.style.transform=`scale(${0.7+0.3*e})`;
    const n=Math.round(b.text.length*clamp((t-b.t0-0.15)/(b.type||1.0))); d.querySelector('.msg').textContent=b.text.slice(0,n); });
  // headline
  const hd=(C.head||[]).find(h=>t>=h.t0&&t<h.t1); if(hd){ if(head._k!==hd){ head.innerHTML=`<div class="k" style="font-size:${L.headK}px">${hd.k}</div><div class="t" style="font-size:${L.headT}px">${hd.t}</div>`; head._k=hd; } const a=clamp((t-hd.t0)/.35)*clamp((hd.t1-t)/.3); head.style.opacity=a; head.style.transform=`translateY(${(1-ease(clamp((t-hd.t0)/.45)))*24}px)`; } else head.style.opacity=0;
  brand.style.opacity=C.brandOn(t);
  // captions
  const cp=(C.caps||[]).find(x=>t>=x.t0&&t<x.t1); const line=cap.firstChild;
  if(cp){ if(line._c!==cp){ line.innerHTML=cp.html; line._c=cp; } const e=outBack(clamp((t-cp.t0)/.22)); line.style.opacity=clamp((t-cp.t0)/.12); line.style.transform=`scale(${0.85+0.15*e})`; } else { line.style.opacity=0; }
  // CTA
  const ct=C.cta.t; cta.style.opacity=clamp((t-ct)/.4);
  [...cta.children].forEach((el,i)=>{ const tt=t-ct-0.15-i*0.28; const e=outBack(clamp(tt/.55)); el.style.opacity=clamp(tt/.3); el.style.transform=`translateY(${(1-e)*40}px) scale(${0.85+0.15*e})`+(el.classList.contains('go')&&tt>1?` scale(${1+0.04*Math.sin(tt*5)})`:'')+(el.classList.contains('crest')?` rotate(${(1-e)*-25}deg)`:''); });
  return true;
};
})();
