// Turns a compact per-video SPEC (window.SPEC) into the engine's CFG. Times inside a scene are seconds from that scene's voice start.
(function(){ if(!window.SPEC) return;
const P=window.SPEC, TL=window.TL, F=window.FMT, tall=F==='tall', S={}; TL.scenes.forEach(s=>S[s.id]=s);
const base='file://'+window.BASE+'/'+window.PROJ+'/cap/';
const shots={}; const R={}; window.META.wide.shots.forEach(s=>{ shots[s.name]={src:base+s.file.split('/').pop()}; R[s.name]=s.rects; });
const pick=v=>Array.isArray(v)&&v.length===2&&(Array.isArray(v[0])||typeof v[0]==='number'&&P.dual)?v:v;
const tw=v=>(v&&typeof v==='object'&&!Array.isArray(v)&&('tall' in v||'wide' in v))?(tall?v.tall:v.wide):v;
const T=(sid,x)=>{ const s=S[sid]; if(x==='end') return s.end; if(x==='start') return s.start; if(x==='voend') return s.vo_end; return s.vo_start+(x||0); };
const rect=(r,shot)=>{ if(typeof r==='string'){ const [k,sh]=r.split('@'); const q=R[sh||shot][k]; if(!q) throw new Error('rect '+r); return q; } return r; };
const ctr=r=>[r[0]+r[2]/2,r[1]+r[3]/2];
const L = tall ? Object.assign({win:[30,450,1020,910], cap:[50,1390,980,210], capSize:60, brand:[60,64], head:[60,150,960], headK:24, headT:80},P.layoutTall||{})
               : Object.assign({win:[150,46,1620,850], cap:[150,912,1620,140], capSize:52, brand:[48,40], head:[0,0,0], headK:0, headT:0},P.layoutWide||{});
const seq=[], cam=[], cursor=[], hl=[], callouts=[], bubbles=[], head=[], caps=[], kin=[];
let lastShot=P.hookShot;
seq.push({t:0,name:P.hookShot}); cam.push({t:0,r:tw(P.hookCam)});
for (const sc of P.scenes){ const id=sc.id; const s=S[id];
  (sc.shots||[]).forEach(x=>{ seq.push({t:T(id,x.at),name:x.name,tr:x.tr,d:x.d||(x.tr?0.45:0)}); lastShot=x.name; });
  (sc.cam||[]).forEach(x=>cam.push({t:T(id,x.at),r:tw(x.r),d:x.d??0.8}));
  (sc.cursor||[]).forEach(x=>{ const sh=x.shot||lastShot; const p=Array.isArray(x.to)&&typeof x.to[0]==='number'&&x.to.length===2?x.to:ctr(rect(x.to,sh)); cursor.push({t:T(id,x.at),x:p[0]+(x.dx||0),y:p[1]+(x.dy||0),d:x.d||0.6,click:!!x.click}); });
  (sc.hl||[]).forEach(x=>{ const r=rect(x.r,x.shot||lastShot); const pd=x.pad||[0,0,0,0]; hl.push({t0:T(id,x.at),t1:T(id,x.to??'end'),r:[r[0]-pd[0],r[1]-pd[1],r[2]+pd[0]+pd[2],r[3]+pd[1]+pd[3]],color:x.color}); });
  (sc.callouts||[]).forEach(x=>callouts.push({t0:T(id,x.at),t1:T(x.toScene||id,x.to??'end'),html:x.html,bg:x.bg,size:tall?(x.sizeT||60):(x.sizeW||50),x:tall?540:(x.xW||960),y:tall?(x.yT||1180):(x.yW||690)}));
  if(sc.bubble){ const b=sc.bubble; bubbles.push({t0:s.vo_start-0.1,t1:s.end,who:b.who,av:b.av,text:b.text,size:tall?(b.sizeT||58):(b.sizeW||54),x:tall?60:(b.xW||420),y:tall?(b.yT||720):(b.yW||330),w:tall?960:(b.wW||1080),type:b.type||1.0,col:b.col}); }
  if(sc.head && tall) head.push({t0:s.start+0.2,t1:sc.headTo?S[sc.headTo].end:s.end,k:sc.head[0],t:sc.head[1]});
  (sc.kin||[]).forEach(x=>{ const k={t0:T(id,x.at),t1:T(id,x.to??'end'),html:x.html,size:tall?x.size[0]:x.size[1],y:tall?x.y[0]:x.y[1],color:x.color}; if(x.count) k.count={t:T(id,x.at),d:x.count.d,from:x.count.from,to:x.count.to,fmt:new Function('x','return '+x.count.fmt)}; kin.push(k); });
  if(sc.cap){ const ch=sc.cap; const tot=ch.reduce((a,c)=>a+c.replace(/\*/g,'').length+6,0); let t=s.vo_start;
    ch.forEach((c,i)=>{ const d=(s.vo_end-s.vo_start)*(c.replace(/\*/g,'').length+6)/tot; caps.push({t0:t,t1:i===ch.length-1?Math.min(s.end,s.vo_end+0.35):t+d,html:c.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')}); t+=d; }); }
}
seq.sort((a,b)=>a.t-b.t); cam.sort((a,b)=>a.t-b.t);
const reveal=S[P.revealScene].start, ctaS=S.cta.start;
const curWin=P.cursorWindows.map(([a,b])=>[T(a[0],a[1]),T(b[0],b[1])]);
const win=t=>{ if(t<reveal) return {blur:16,shade:.6,s:1.06};
  if(t<reveal+1.0){ const p=Math.min(1,(t-reveal)/1.0), q=1-Math.pow(1-p,3); return {blur:16*(1-q),shade:.6*(1-q),s:0.82+0.18*q,rx:14*(1-q),y:80*(1-q)}; }
  if(t>=ctaS){ const p=Math.min(1,(t-ctaS)/0.6); return {s:1-0.1*p,o:1-p,blur:6*p}; } return {}; };
const crest='file://'+window.BASE+'/lib/'+(P.crest||'crest.png');
const C=P.cta, fs=tall?{ttl:104,pts:30,go:46,url:36,fine:22}:{ttl:80,pts:24,go:36,url:30,fine:18};
const ctaHtml=`<img class="crest" src="${crest}"><div class="ttl" style="font-size:${fs.ttl}px">${C.title}</div>
<div class="pts" style="font-size:${fs.pts}px;max-width:${tall?900:1300}px">${C.pts.map(x=>'<span>'+x+'</span>').join('')}</div>
<div class="go" style="font-size:${fs.go}px">${C.go||'Start free today →'}</div><div class="url" style="font-size:${fs.url}px">${C.url}</div>
${C.fine?`<div class="fine" style="font-size:${fs.fine}px">${C.fine}</div>`:''}`;
window.CFG={W:tall?1080:1920,H:tall?1920:1080,layout:L,shots,shotW:P.shotW||1440,shotSeq:seq,cam,cursor,cursorOn:t=>curWin.some(([a,b])=>t>a&&t<b)?1:0,hl,callouts,kin,bubbles,head,caps,win,
  crest,brandTitle:P.brand[0],brandSub:P.brand[1],brandOn:t=>tall&&t>=reveal&&t<ctaS?1:0,url:C.url,note:P.note,sfxMarks:{reveal},
  cta:{t:ctaS+0.1,html:ctaHtml,crest:tall?280:160,bottom:tall?340:170}};
})();
