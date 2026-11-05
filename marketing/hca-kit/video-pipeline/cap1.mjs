import { createRequire } from 'node:module'; import { stub } from './stub.mjs'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='p1/cap'; fs.mkdirSync(OUT,{recursive:true});
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-proxy-server'] });
const meta={};
for (const [fmt,w,h,dsf,mob] of [['wide',1440,900,2,false],['tall',430,932,2.5,true]]) {
  const ctx = await br.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:dsf, isMobile:mob, hasTouch:mob });
  await ctx.addInitScript(()=>{ try{ localStorage.setItem('lss_reg_v2', JSON.stringify({name:'Sarah Ahmed',org:'City Hospital',email:'demo@example.org',tier:'paid'})); }catch(e){} });
  const p = await ctx.newPage();
  await p.route(/vendor\/supabase-js/, r=>r.fulfill({status:200,contentType:'text/javascript',body:stub('paid')}));
  await p.goto('http://127.0.0.1:8788/'); await p.waitForTimeout(3000);
  await p.evaluate(()=>{ [...document.querySelectorAll('.nav-item')].find(e=>/Cost of Poor/.test(e.textContent)).click(); });
  await p.waitForTimeout(1200);
  // hide transient toasts, keep the page clean
  await p.addStyleTag({content:'.toast,#toast,[class*="toast"]{display:none!important} *{caret-color:transparent!important}'});
  if (mob) { await p.evaluate(()=>{ document.querySelectorAll('#sidebar.open').forEach(s=>s.classList.remove('open')); }); }
  const M = meta[fmt] = { w, h, dsf, shots: [] };
  const rects = (ids) => p.evaluate((ids)=>{ const o={}; for (const [k,sel] of Object.entries(ids)) { const e=document.querySelector(sel); if(e){ const r=e.getBoundingClientRect(); o[k]=[r.x,r.y,r.width,r.height]; } } return o; }, ids);
  const IDS = { vol:'#cq-vol', rate:'#cq-rate', cost:'#cq-cost', target:'#cq-target', defects:'#cq-defects', current:'#cq-current', projected:'#cq-projected', savings:'#cq-savings', studio:'button.ls-btn, .tool-studio-btn', title:'h1, .tool-title' };
  async function shot(name, extra={}) { const f=`${OUT}/${fmt}-${name}.png`; await p.screenshot({path:f}); M.shots.push({name, file:f, rects: await rects({...IDS, ...extra})}); }
  const scrollTo = (sel, frac) => p.evaluate(([sel,frac])=>{ const e=document.querySelector(sel); const r=e.getBoundingClientRect(); window.scrollBy(0, r.top - innerHeight*frac); }, [sel,frac]);
  // clear inputs
  await p.evaluate(()=>{ for (const id of ['cq-vol','cq-rate','cq-cost','cq-target']) { const e=document.getElementById(id); e.value=''; e.dispatchEvent(new Event('input',{bubbles:true})); } window.scrollTo(0,0); });
  await p.waitForTimeout(400);
  await shot('top');
  if (mob) await scrollTo('#cq-vol', 0.18); else await scrollTo('#cq-vol', 0.30);
  await p.waitForTimeout(300); await shot('empty');
  let i=0;
  for (const [id,val] of [['cq-vol','1200'],['cq-rate','4'],['cq-cost','48000'],['cq-target','1']]) {
    if (mob) { await scrollTo('#'+id, id==='cq-target'?0.12:0.25); }
    await p.click('#'+id);
    for (const ch of val) { await p.keyboard.type(ch); await p.waitForTimeout(120); await shot(`t${String(i++).padStart(2,'0')}`, {active:'#'+id}); }
  }
  await p.locator('#cq-target').blur(); await p.waitForTimeout(500);
  if (mob) { await scrollTo('#cq-defects', 0.10); await p.waitForTimeout(300); }
  await shot('results');
  // worked example fills the ledger
  const sel = p.locator('select').filter({hasText:'CLABSI cost model'}).first();
  await sel.selectOption('good:0'); await p.waitForTimeout(1200);
  await scrollTo('#cq-ledger', mob?0.08:0.22); await p.waitForTimeout(400); await shot('ledger', {ledger:'#cq-ledger', total:'#cq-ledgertotal'});
  const bucketSel = await p.evaluate(()=>{ const h=[...document.querySelectorAll('h2,h3,.sec-title, span, div')].find(e=>/^Cost buckets and sensitivity$/.test(e.textContent.trim())); if(!h) return null; h.id=h.id||'vid-buckets'; return '#'+h.id; });
  await scrollTo(bucketSel, mob?0.06:0.12); await p.waitForTimeout(400);
  const ins = await p.evaluate(()=>{ const e=[...document.querySelectorAll('div,p')].filter(e=>/more than three times prevention/.test(e.textContent)&&e.children.length<3).pop(); if(e){ e.id=e.id||'vid-insight'; return '#'+e.id;} return null; });
  await shot('buckets', ins?{insight:ins}:{});
  // learning studio pop-up
  await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(300);
  await p.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/Learning Studio/.test(b.textContent)); b.id='vid-ls'; });
  await shot('pre-studio', {lsbtn:'#vid-ls'});
  await p.evaluate(()=>document.getElementById('vid-ls').click()); await p.waitForTimeout(1800); await shot('studio1');
  // scroll the studio content to the poster
  await p.evaluate(()=>{ const img=[...document.querySelectorAll('img')].find(i=>i.offsetParent&&/copq|iceberg|cost/i.test(i.src+i.alt)&&i.getBoundingClientRect().width>200); if(img){ img.scrollIntoView({block:'start'}); } });
  await p.waitForTimeout(1500); await shot('studio2');
  await ctx.close();
}
fs.writeFileSync('p1/cap/meta.json', JSON.stringify(meta,null,1));
await br.close(); console.log('done');
