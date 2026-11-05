import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='m2/cap'; const meta={shots:[]};
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
await ctx.addInitScript(()=>{ let s=777; Math.random=()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;}; });
const p = await ctx.newPage();
await p.goto('https://medlex.healthcarecrownacademy.co.uk/#practice', {waitUntil:'domcontentloaded'}); await p.waitForTimeout(3500);
await p.getByRole('button',{name:/^Skip$/}).click({timeout:1500}).catch(()=>{}); await p.waitForTimeout(800);
await p.addStyleTag({content:'html,body,*{scroll-behavior:auto!important} .crown-help, [class*=askus], [class*=ask-us]{display:none!important}'});
async function shot(name, sels={}){ console.log('shot',name); const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); const r={}; for(const [k,l] of Object.entries(sels)){ const b=await l.boundingBox({timeout:400}).catch(()=>null); if(b) r[k]=[b.x,b.y,b.width,b.height]; } meta.shots.push({name,file:f,rects:r}); }
await shot('practice');
const tile = t => p.locator('button').filter({hasText:new RegExp('^\\s*'+t+'\\s*$')}).first();
await p.locator('button,a').filter({hasText:/^Build it/}).first().click({force:true,timeout:5000}); await p.waitForTimeout(2200);
const prompt = await p.evaluate(()=>document.querySelector('main').innerText.split('\n').find(l=>/Build the word/.test(l)));
console.log('PROMPT', prompt);
const pieces = await p.evaluate(()=>[...document.querySelectorAll('main button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()));
console.log('PIECES', pieces.join(','));
await shot('b0',{gastr:tile('gastr'),o:tile('o'),enter:tile('enter'),itis:tile('itis'),check:p.getByRole('button',{name:'Check'})});
let i=1; for (const t of ['gastr','o','enter','itis']) { await tile(t).click({force:true,timeout:3000}).catch(()=>console.log('miss',t)); await p.waitForTimeout(700); await shot('b'+(i++),{check:p.getByRole('button',{name:'Check'})}); }
await p.getByRole('button',{name:'Check'}).click({force:true,timeout:3000}); await p.waitForTimeout(1500); await shot('b9'); await p.mouse.wheel(0,300); await p.waitForTimeout(600); await shot('b10');
console.log('FB', await p.evaluate(()=>document.querySelector('main').innerText.replace(/\n+/g,' | ').slice(0,500)));
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
