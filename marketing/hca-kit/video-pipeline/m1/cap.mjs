import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='m1/cap'; const meta={shots:[]};
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2, reducedMotion:'no-preference' });
const p = await ctx.newPage();
await p.goto('https://medlex.healthcarecrownacademy.co.uk/', {waitUntil:'domcontentloaded', timeout:60000}).catch(()=>{});
await p.waitForTimeout(2500);
await p.addStyleTag({content:'html,body,*{scroll-behavior:auto!important} *{caret-color:transparent!important}'});
async function rect(loc){ const b=await loc.boundingBox({timeout:400}).catch(()=>null); return b?[b.x,b.y,b.width,b.height]:null; }
const parts={peri:p.getByRole('button',{name:/peri/i}).first(), card:p.getByRole('button',{name:/card/i}).first(), itis:p.getByRole('button',{name:/itis/i}).first(), show:p.getByRole('button',{name:/Show me the answer/i})};
async function shot(name){ console.log('shot',name); const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); const r={}; for(const [k,l] of Object.entries(parts)) { try{ r[k]=await rect(l);}catch(e){} } meta.shots.push({name,file:f,rects:r}); }
await shot('d0');
await parts.peri.click({force:true,timeout:5000}); await p.waitForTimeout(1200); await shot('d1');
await parts.card.click({force:true,timeout:5000}); await p.waitForTimeout(1200); await shot('d2');
await parts.itis.click({force:true,timeout:5000}); await p.waitForTimeout(1800); await shot('d3');
await p.waitForTimeout(1500); await shot('d4');
await p.getByRole('button',{name:/Decode another word/i}).click({force:true,timeout:5000}); await p.waitForTimeout(1500); await shot('e0');
let i=1; for (const w of ['tachy','card','ia']) { await p.locator('button').filter({hasText:new RegExp('^\\s*'+w+'(PREFIX|ROOT|SUFFIX)','i')}).first().click({force:true,timeout:5000}).catch(e=>console.log('miss',w)); await p.waitForTimeout(1200); await shot('e'+(i++)); }
await p.waitForTimeout(1500); await shot('e9');
await p.getByRole('button',{name:/Start learning/i}).click({timeout:5000}).catch(()=>{}); await p.waitForTimeout(2500); await shot('today');
console.log(await p.evaluate(()=>[...document.querySelectorAll('button,a')].filter(b=>b.offsetParent).map(b=>b.textContent.trim().replace(/\s+/g,' ').slice(0,30)).filter(Boolean).slice(0,30).join(' | ')));
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
