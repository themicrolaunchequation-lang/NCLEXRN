import { createRequire } from 'node:module'; import { stub } from '../stub.mjs'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='p2/cap';
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-proxy-server'] });
const ctx = await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
await ctx.addInitScript(()=>{ try{ localStorage.setItem('lss_reg_v2', JSON.stringify({name:'Sarah Ahmed',org:'City Hospital',email:'demo@example.org',tier:'paid'})); }catch(e){} Math.random=(()=>{let s=20251103;return()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};})(); });
const p = await ctx.newPage();
await p.route(/vendor\/supabase-js/, r=>r.fulfill({status:200,contentType:'text/javascript',body:stub('paid')}));
await p.goto('http://127.0.0.1:8788/'); await p.waitForTimeout(3000);
await p.evaluate(()=>{ [...document.querySelectorAll('.nav-item')].find(e=>e.textContent.includes('Red Bead')).click(); window.scrollTo(0,0); });
await p.waitForTimeout(1500);
await p.addStyleTag({content:'html,body,*{scroll-behavior:auto!important} .toast,#toast,[class*="toast"]{display:none!important} *{caret-color:transparent!important}'});
const meta={shots:[]};
const tag = (sel, id) => p.evaluate(([sel,id])=>{ const e=typeof sel==='string'?document.querySelector(sel):null; if(e) e.id=e.id||id; return e?e.id:null; },[sel,id]);
const byText = (txt, id, tagSel='button') => p.evaluate(([txt,id,tagSel])=>{ const e=[...document.querySelectorAll(tagSel)].find(b=>b.offsetParent&&b.textContent.trim().startsWith(txt)); if(e){ e.id=e.id||id; return '#'+e.id; } return null; },[txt,id,tagSel]);
async function rects(sels){ return p.evaluate(sels=>{ const o={}; for(const [k,s] of Object.entries(sels)){ const e=s&&document.querySelector(s); if(e){const r=e.getBoundingClientRect(); o[k]=[r.x,r.y,r.width,r.height];} } return o; }, sels); }
const S={};
async function shot(name){ const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); meta.shots.push({name,file:f,rects:await rects(S)}); }
S.next = await byText('Next day','vid-next');
S.reset = await byText('Reset','vid-reset');
S.slider = await tag('input[type=range]','vid-slider');
S.ls = await byText('🎓Learning','vid-ls') || await p.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/Learning Studio/.test(b.textContent)); b.id='vid-ls'; return '#vid-ls'; });
S.chart = await p.evaluate(()=>{ const c=document.querySelector('#vid-next').closest('section,.card,.panel,div[class*=card]'); c.id=c.id||'vid-card1'; return '#'+c.id; });
S.side = await p.evaluate(()=>{ const e=[...document.querySelectorAll('*')].find(e=>e.children.length<4&&/WORKER OF THE DAY/i.test(e.textContent)&&e.textContent.length<200); if(!e) return null; const box=e.parentElement; box.id=box.id||'vid-side'; return '#'+box.id; });
await p.evaluate(()=>window.scrollTo(0,0)); await p.evaluate(()=>{ const e=document.querySelector('#vid-next'); window.scrollBy(0, e.getBoundingClientRect().top-560); });
await p.waitForTimeout(500);
await shot('day1');
for (let d=2; d<=5; d++){ await p.click(S.next); await p.waitForTimeout(900); await shot('day'+d); }
// change the system: lower red beads to 5%
await p.evaluate(()=>{ const s=document.querySelector('#vid-slider'); const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; set.call(s, s.min && +s.min>5 ? s.min : 5); s.dispatchEvent(new Event('input',{bubbles:true})); s.dispatchEvent(new Event('change',{bubbles:true})); });
await p.waitForTimeout(500); await shot('slider5');
for (let d=1; d<=2; d++){ await p.click(S.next); await p.waitForTimeout(900); await shot('fixed'+d); }
// guided section: prediction + run
const pred = await byText('None of them','vid-pred');
await p.evaluate(()=>{ const e=document.querySelector('#vid-pred'); window.scrollBy(0, e.getBoundingClientRect().top-450); });
await p.waitForTimeout(400); S.pred=pred; S.run=await byText('▶ Run simulation','vid-run'); S.step=await byText('Next step','vid-step');
await shot('guide0');
await p.click(pred); await p.waitForTimeout(500); await shot('guide1');
await p.click(S.run); await p.waitForTimeout(2500); await shot('guide2');
// Learning Studio pop-up
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(1200); await shot('pre-studio');
await p.evaluate(()=>document.querySelector('#vid-ls').click()); await p.waitForTimeout(1800); await shot('studio1');
await p.evaluate(()=>{ const img=[...document.querySelectorAll('img')].filter(i=>i.offsetParent&&i.getBoundingClientRect().width>300)[0]; if(img) img.scrollIntoView({block:'start'}); });
await p.waitForTimeout(1500); await shot('studio2');
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1));
await br.close(); console.log('ok', Object.keys(S).join(','));
