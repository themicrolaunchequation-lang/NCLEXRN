// usage: node lib/render.mjs <proj> <fmt> [--stills t1,t2,...] [--fps 30]
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const [proj, fmt] = process.argv.slice(2); const BASE = path.resolve('.');
const stills = (process.argv.find(a=>a.startsWith('--stills='))||'').slice(9);
const FPS = 30; const tall = fmt==='tall'; const W=tall?1080:1920, H=tall?1920:1080;
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-proxy-server','--allow-file-access-from-files'] });
const p = await br.newPage({ viewport:{width:W,height:H}, deviceScaleFactor:1 });
p.on('pageerror', e=>console.log('PAGEERR', e.message)); p.on('console', m=>{ if(m.type()==='error') console.log('CONSOLE', m.text()); });
await p.goto(`file://${BASE}/lib/comp.html?proj=${proj}&fmt=${fmt}&base=${encodeURIComponent(BASE)}`);
await p.waitForFunction(()=>window.renderAt && [...document.images].every(i=>i.complete));
await p.evaluate(()=>document.fonts.ready);
const total = await p.evaluate(()=>window.TL.total);
const ev = await p.evaluate(()=>{ const C=window.CFG; const E=[];
  (C.cursor||[]).forEach(k=>{ if(k.click) E.push(['click',k.t+(k.d||.6)]); });
  C.shotSeq.forEach(s=>{ if(/^t\d+$/.test(s.name)) E.push(['key',s.t]); else if(s.tr==='pop') E.push(['pop',s.t]); else if(s.tr==='fade' && s.d>=.4) E.push(['whoosh',s.t-0.15]); });
  (C.bubbles||[]).forEach(b=>E.push(['pop',b.t0])); (C.callouts||[]).forEach((c,i)=>E.push([/freed|saved/i.test(c.html)?'chime':'pop',c.t0]));
  (C.kin||[]).forEach(k=>E.push(['pop',k.t0]));
  E.push(['whoosh_big',(C.sfxMarks||{}).reveal ?? 0]); E.push(['whoosh_big',C.cta.t-0.3]);
  return E; });
fs.writeFileSync(`${proj}/events-${fmt}.json`, JSON.stringify(ev));
const out = `${proj}/frames-${fmt}`; fs.mkdirSync(out,{recursive:true});
if (stills) { for (const t of stills.split(',').map(Number)) { await p.evaluate(t=>renderAt(t), t); await p.screenshot({path:`${proj}/still-${fmt}-${t}.jpg`, type:'jpeg', quality:85}); } await br.close(); process.exit(0); }
const N = Math.ceil(total*FPS); const t0=Date.now();
for (let i=0;i<N;i++){ await p.evaluate(t=>renderAt(t), i/FPS); await p.screenshot({path:`${out}/${String(i).padStart(5,'0')}.jpg`, type:'jpeg', quality:92}); if(i%300===0) console.log(fmt,i,'/',N, Math.round((Date.now()-t0)/1000)+'s'); }
await br.close(); console.log('frames',N);
