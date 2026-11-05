import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='p3/cap';
const stub = `export function createClient(){ const sess={user:{email:'demo@example.org'}};
 return { auth:{ onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}}}, getSession:async()=>({data:{session:sess}}), signOut:async()=>({}) },
  rpc:async(name,args)=>{ if(name==='my_access') return {data:[{tier:'paid',full_name:'Sarah Ahmed',org:'City Hospital',paid_until:'2027-11-01T00:00:00Z'}],error:null};
   if(name==='submit_exam'){ await new Promise(r=>setTimeout(r,400)); return {data:{passed:true,score:92,correct:61,total:66},error:null}; }
   if(name==='claim_certificate') return {data:{code:'LSSGB-7K3QM-X2PRT',name:args.p_name,org:args.p_org,score:92,issued_at:new Date().toISOString()},error:null};
   return {data:null,error:null}; },
  from(){ return {select(){return this},eq(){return this},maybeSingle:async()=>({data:null,error:null}),upsert:async()=>({error:null})}; }, functions:{invoke:async()=>({error:new Error('no')})} }; }`;
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-proxy-server'] });
const ctx = await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
await ctx.addInitScript(()=>{ try{ localStorage.setItem('lss_reg_v2', JSON.stringify({name:'Sarah Ahmed',org:'City Hospital',email:'demo@example.org',tier:'paid'})); }catch(e){} });
const p = await ctx.newPage();
await p.route(/vendor\/supabase-js/, r=>r.fulfill({status:200,contentType:'text/javascript',body:stub}));
await p.goto('http://127.0.0.1:8788/'); await p.waitForTimeout(3000);
await p.addStyleTag({content:'html,body,*{scroll-behavior:auto!important} .toast,#toast{display:none!important} *{caret-color:transparent!important}'});
const meta={shots:[]};
async function rects(sels){ return p.evaluate(sels=>{ const o={}; for(const [k,s] of Object.entries(sels)){ const e=s&&document.querySelector(s); if(e){const r=e.getBoundingClientRect(); o[k]=[r.x,r.y,r.width,r.height];} } return o; }, sels); }
const S={examBtn:'#examOpenBtn', start:'#examStartBtn', opt0:'#examOpts .exam-opt', next:'#examNextBtn', fb:'#examFb', claim:'#resToCert', issue:'#issueBtn'};
async function shot(name,extra={}){ const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); meta.shots.push({name,file:f,rects:await rects({...S,...extra})}); }
await shot('home');
await p.click('#examOpenBtn'); await p.waitForTimeout(900); await shot('intro');
await p.click('#examStartBtn'); await p.waitForTimeout(700); await shot('q1');
// answer questions: pick the correct option where we can find it (the app knows the key), else first
for (let i=0;i<66;i++){
  await p.locator('#examOpts .exam-opt').nth(1).click();
  await p.waitForTimeout(i<2?600:60);
  if(i===0) await shot('q1a', {chosen:'#examOpts .exam-opt.chosen'});
  if(i===64){ await p.click('#examNextBtn'); await p.waitForTimeout(500); await shot('qlast'); continue; }
  await p.click('#examNextBtn'); await p.waitForTimeout(i<2?500:40);
  if(i===0) await shot('q2');
}
await p.waitForTimeout(400); await shot('marking');
await p.waitForTimeout(1500); await shot('result');
await p.evaluate(()=>{ const e=document.querySelector('.exam-review'); if(e){ e.scrollIntoView({block:'start'}); } }); await p.waitForTimeout(500); await shot('review');
await p.evaluate(()=>{ const e=document.querySelector('#resToCert'); e && e.scrollIntoView({block:'center'}); }); await p.waitForTimeout(400); await shot('result2');
await p.click('#resToCert'); await p.waitForTimeout(1000); await shot('gate');
await p.click('#issueBtn'); await p.waitForTimeout(3500); await shot('cert');
const tabs = await p.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent&&/ID Badge|Academic Transcript/.test(b.textContent)).map((b,i)=>{b.id='vid-tab'+i; return b.textContent.trim();}));
console.log('tabs',tabs);
S.tab0='#vid-tab0'; S.tab1='#vid-tab1';
await p.click('#vid-tab0'); await p.waitForTimeout(2500); await shot('badge');
if(tabs.length>1){ await p.click('#vid-tab1'); await p.waitForTimeout(2000); await shot('transcript'); }
// verify page (desktop + phone) with a mocked lookup
const vctx = await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
for (const [n,vp] of [['verify-wide',{width:1440,height:900}],['verify-phone',{width:430,height:860}]]) {
  const v = await vctx.newPage(); await v.setViewportSize(vp);
  await v.route(/rest\/v1\/rpc\/verify_certificate/, r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{holder_name:'Sarah Ahmed',org:'City Hospital',course:'Lean Six Sigma Green Belt in Healthcare',issued_at:new Date().toISOString()}])}));
  await v.goto('http://127.0.0.1:8788/verify?c=LSSGB-7K3QM-X2PRT'); await v.waitForTimeout(1200);
  await v.screenshot({path:`${OUT}/${n}.png`}); meta.shots.push({name:n,file:`${OUT}/${n}.png`,rects:{}}); await v.close();
}
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1));
await br.close(); console.log('ok');
