// Pilot: LSS Cost of Poor Quality. Builds window.CFG from window.TL (timeline), window.META (capture rects), window.FMT.
(function(){
const TL=window.TL, M=window.META[window.FMT], F=window.FMT, tall=F==='tall';
const S={}; TL.scenes.forEach(s=>S[s.id]=s);
const base='file://'+window.BASE+'/p1/cap/';
const shots={}; M.shots.forEach(s=>shots[s.name]={src:base+s.file.split('/').pop().replace('tall-','wide-'), rects:s.rects});
// always use the sharp desktop captures (wide-*) for both shapes; rects from the wide run
const W=window.META.wide; const R={}; W.shots.forEach(s=>R[s.name]=s.rects);
const ctr=r=>[r[0]+r[2]/2, r[1]+r[3]/2], card=r=>[r[0]-20,r[1]-46,r[2]+40,r[3]+74];
const L = tall ? {win:[30,450,1020,910], cap:[50,1390,980,210], capSize:60, brand:[60,64], head:[60,150,960], headK:24, headT:80}
               : {win:[150,46,1620,850], cap:[150,912,1620,140], capSize:52, brand:[48,40], head:[0,0,0], headK:0, headT:0};
const v=id=>S[id].vo_start, e=id=>S[id].end, st=id=>S[id].start;
// ---- shots
const seq=[{t:0,name:'results'}];
const typing=[]; for(let i=0;i<=10;i++) typing.push('t'+String(i).padStart(2,'0'));
seq.push({t:st('reveal'),name:'top'});
seq.push({t:v('inputs')-0.3,name:'empty',tr:'fade',d:.4});
const tt=[v('inputs')+0.75,v('inputs')+0.93,v('inputs')+1.11,v('inputs')+1.29, v('inputs')+3.2, v('inputs')+5.25,v('inputs')+5.42,v('inputs')+5.59,v('inputs')+5.76,v('inputs')+5.93, v('payoff')+1.0];
typing.forEach((n,i)=>seq.push({t:tt[i],name:n}));
seq.push({t:v('payoff')+1.6,name:'results'});
seq.push({t:st('ledger'),name:'ledger',tr:'fade',d:.45});
seq.push({t:v('ledger')+3.4,name:'buckets',tr:'fade',d:.45});
seq.push({t:st('studio'),name:'pre-studio',tr:'fade',d:.4});
seq.push({t:v('studio')+1.05,name:'studio1',tr:'pop',d:.55});
seq.push({t:v('studio')+4.1,name:'studio2',tr:'fade',d:.5});
// ---- camera regions [x,y,w] in page CSS px (1440 x 900 captures)
const cam = tall ? [
  {t:0,r:[560,230,560]},
  {t:st('reveal'),r:[330,40,900]}, {t:st('reveal')+1.2,r:[350,70,640],d:2.8},
  {t:v('inputs')-0.3,r:[330,200,560],d:.8}, {t:v('inputs')+2.3,r:[560,200,560],d:.8}, {t:v('inputs')+4.4,r:[820,200,560],d:.8},
  {t:st('result'),r:[340,200,560],d:.9}, {t:v('result')+2.4,r:[560,200,560],d:1.2},
  {t:v('payoff'),r:[880,200,540],d:.8}, {t:v('payoff')+2.4,r:[880,250,500],d:1.0},
  {t:st('ledger'),r:[340,150,560],d:.6}, {t:v('ledger')+1.4,r:[860,150,560],d:1.6},
  {t:v('ledger')+3.4,r:[340,100,620],d:.5}, {t:v('ledger')+4.6,r:[340,240,560],d:1.0},
  {t:st('studio'),r:[960,60,500],d:.6},
  {t:v('studio')+1.05,r:[380,270,720],d:.01}, {t:v('studio')+1.3,r:[400,280,640],d:2.6},
  {t:v('studio')+4.1,r:[700,40,700],d:.01}, {t:v('studio')+4.3,r:[740,60,600],d:2.6}
] : [
  {t:0,r:[300,150,1000]},
  {t:st('reveal'),r:[0,0,1440]}, {t:st('reveal')+1.2,r:[330,40,1100],d:2.8},
  {t:v('inputs')-0.3,r:[320,160,1080],d:.8},
  {t:st('result'),r:[330,200,800],d:1.0},
  {t:v('payoff'),r:[620,190,800],d:1.0}, {t:v('payoff')+2.4,r:[760,230,640],d:1.0},
  {t:st('ledger'),r:[330,120,1080],d:.6},
  {t:v('ledger')+3.4,r:[330,90,1080],d:.5}, {t:v('ledger')+4.6,r:[330,180,1060],d:1.0},
  {t:st('studio'),r:[640,40,820],d:.6},
  {t:v('studio')+1.05,r:[300,40,1140],d:.01}, {t:v('studio')+1.3,r:[340,200,1040],d:2.6},
  {t:v('studio')+4.1,r:[150,10,1290],d:.01}, {t:v('studio')+4.3,r:[260,30,1080],d:2.6}
];
// ---- cursor (page coords of the shot on screen)
const r0=R.empty, rs=R['pre-studio'];
const cursor=[
  {t:v('inputs')-0.1,...xy(ctr(r0.vol)),d:.6,click:true},
  {t:v('inputs')+2.5,...xy(ctr(r0.rate)),d:.55,click:true},
  {t:v('inputs')+4.6,...xy(ctr(r0.cost)),d:.55,click:true},
  {t:v('payoff')+0.25,...xy(ctr(r0.target)),d:.6,click:true},
  {t:v('payoff')+1.8,...xy([ctr(r0.target)[0]+60,ctr(r0.target)[1]+140]),d:.6},
  {t:st('studio')+0.2,...xy([ctr(rs.lsbtn)[0]-90,ctr(rs.lsbtn)[1]+120]),d:.4},
  {t:v('studio')+0.1,...xy(ctr(rs.lsbtn)),d:.65,click:true},
];
function xy(p){ return {x:p[0],y:p[1]}; }
const cursorOn=t=>(t>v('inputs')-0.5&&t<v('payoff')+2.6)||(t>st('studio')&&t<v('studio')+1.1)?1:0;
// ---- highlights (page coords)
const hl=[
  {t0:v('inputs')+0.4,t1:v('inputs')+2.3,r:r0.vol},{t0:v('inputs')+2.9,t1:v('inputs')+4.4,r:r0.rate},{t0:v('inputs')+4.9,t1:e('inputs'),r:r0.cost},
  {t0:v('result')+0.9,t1:e('result'),r:card(r0.current),color:'#f87171'},
  {t0:v('payoff')+2.8,t1:e('mgr2'),r:card(r0.savings),color:'#34d399'},
  {t0:v('ledger')+1.4,t1:v('ledger')+3.3,r:R.ledger.total},
  {t0:v('ledger')+4.8,t1:e('ledger'),r:R.buckets.insight},
];
const big=tall?62:54;
const callouts=[
  {t0:v('result')+2.2,t1:e('result'),html:'$2.3M lost every year<small>48 infections</small>',bg:'linear-gradient(135deg,#ef4444,#b91c1c)',size:big,x:tall?540:960,y:tall?1180:690},
  {t0:v('payoff')+3.2,t1:e('mgr2')-1.6,html:'$1.73M freed up<small>36 infections avoided · every year</small>',bg:'linear-gradient(135deg,#10b981,#047857)',size:big,x:tall?540:960,y:tall?1180:690},
  {t0:v('ledger')+5.0,t1:e('ledger'),html:'69% is external failure<small>treatment, ICU days, penalties</small>',bg:'linear-gradient(135deg,#f59e0b,#b45309)',size:tall?54:46,x:tall?540:960,y:tall?1180:700},
  {t0:v('studio')+1.5,t1:v('studio')+4.0,html:'Learning Studio<small>inside every tool</small>',bg:'linear-gradient(135deg,#6366f1,#4338ca)',size:tall?52:44,x:tall?540:1460,y:tall?1180:720},
];
// ---- hook kinetic text
const fmtM=x=>'$'+x.toFixed(1)+'M';
const kin = [
  {t0:v('hook'),t1:v('hook')+3.75,html:'4%',size:tall?340:300,y:tall?330:150},
  {t0:v('hook')+1.25,t1:v('hook')+3.75,html:'<span style="font-weight:700;color:#5eead4">infection rate</span>',size:tall?82:66,y:tall?730:500},
  {t0:v('hook')+3.85,t1:e('hook'),html:'<span data-n>$0.0M</span>',size:tall?230:220,y:tall?400:180,color:'#ffd166',count:{t:v('hook')+3.85,d:1.1,from:0,to:1.7,fmt:fmtM}},
  {t0:v('hook')+5.2,t1:e('hook'),html:'<span style="font-weight:800">a year?</span>',size:tall?110:96,y:tall?700:470},
];
const bubbles=[
  {t0:v('mgr1')-0.05,t1:e('mgr1'),who:'Ward manager',av:'WM',text:'Four percent? That’s fine… isn’t it?',size:tall?60:56,x:tall?60:420,y:tall?720:330,w:tall?960:1080,type:1.3},
  {t0:v('mgr2')-0.1,t1:e('mgr2'),who:'Ward manager',av:'WM',text:'Wait. That’s a business case.',size:tall?54:48,x:tall?60:250,y:tall?600:120,w:tall?960:880,type:0.8},
];
const head = tall ? [
  {t0:st('reveal')+0.3,t1:e('inputs'),k:'Lean Six Sigma · Healthcare',t:'Cost of Poor<br>Quality'},
  {t0:st('result'),t1:e('result'),k:'The hidden cost',t:'$2.3M<br>a year'},
  {t0:st('payoff'),t1:e('mgr2'),k:'The business case',t:'$1.7M<br>saved'},
  {t0:st('ledger'),t1:e('ledger'),k:'Where the money goes',t:'Four cost<br>categories'},
  {t0:st('studio'),t1:e('studio'),k:'Built-in coaching',t:'Learning<br>Studio'},
] : [];
// ---- captions: chunks spread over each voice line by length
const CAP={hook:['What if a **4% infection rate**','was quietly costing','**$1.7 million** a year?'],
 reveal:['Let’s put a **price** on it.','**Cost of Poor Quality**','in Lean Six Sigma for Healthcare.'],
 inputs:['**1,200** central lines a year.','A **4%** infection rate.','**$48,000** per infection,','from the worked example.'],
 result:['That’s **48 infections**,','and **$2.3 million**,','every year.'],
 payoff:['Bring the rate down to **1%**,','and you avoid **36 infections**,','and free up **$1.7 million**.'],
 ledger:['Split the cost into **prevention**,','**appraisal**, **internal**','and **external failure**,','and see exactly **where the money goes**.'],
 studio:['Stuck on a concept?','Open the **Learning Studio**.','Every tool comes with **clinical examples**,','and posters you can annotate.'],
 cta:['Turn your quality problem','into a **business case**','leaders can’t ignore.','**Start free** today.']};
const caps=[];
for (const [id,ch] of Object.entries(CAP)){ const s=S[id]; const tot=ch.reduce((a,c)=>a+c.replace(/\*/g,'').length+6,0); let t=s.vo_start;
  ch.forEach((c,i)=>{ const d=(s.vo_end-s.vo_start)*(c.replace(/\*/g,'').length+6)/tot; caps.push({t0:t,t1:i===ch.length-1?Math.min(s.end, s.vo_end+0.35):t+d,html:c.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')}); t+=d; }); }
// ---- window state
const win=t=>{ const r=st('reveal');
  if(t<r) return {blur:16,shade:.6,s:1.06};
  if(t<r+1.0){ const p=Math.min(1,(t-r)/1.0), q=1-Math.pow(1-p,3); return {blur:16*(1-q),shade:.6*(1-q),s:0.82+0.18*q,rx:14*(1-q),y:80*(1-q)}; }
  const c=st('cta'); if(t>=c){ const p=Math.min(1,(t-c)/0.6); return {s:1-0.1*p,o:1-p,blur:6*p}; }
  return {}; };
const crest='file://'+window.BASE+'/lib/crest.png';
const fs=tall?{ttl:104,pts:30,go:46,url:36,promo:32,fine:22}:{ttl:80,pts:24,go:36,url:30,promo:26,fine:18};
const ctaHtml=`<img class="crest" src="${crest}"><div class="ttl" style="font-size:${fs.ttl}px">Lean Six Sigma<br><em>for Healthcare</em></div>
<div class="pts" style="font-size:${fs.pts}px;max-width:${tall?900:1300}px"><span>30 DMAIC tools</span><span>10 simulations</span><span>Exam + verified certificate</span></div>
<div class="go" style="font-size:${fs.go}px">Start free today →</div><div class="url" style="font-size:${fs.url}px">lss.healthcarecrownacademy.co.uk</div>
<div class="fine" style="font-size:${fs.fine}px">Healthcare Crown Academy · figures from the app’s worked example</div>`;
window.CFG={W:tall?1080:1920,H:tall?1920:1080,layout:L,shots,shotW:1440,shotSeq:seq,cam,cursor,cursorOn,hl,callouts,kin,bubbles,head,caps,win,
  crest,brandTitle:'Lean Six Sigma',brandSub:'for Healthcare',brandOn:t=>tall&&t>=st('reveal')&&t<st('cta')?1:0,url:'lss.healthcarecrownacademy.co.uk',
  sfxMarks:{reveal:st('reveal')},cta:{t:st('cta')+0.1,html:ctaHtml,crest:tall?280:160,bottom:tall?340:170}};
})();
