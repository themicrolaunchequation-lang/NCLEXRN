import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='g/cap', B='https://snle.healthcarecrownacademy.co.uk'; const meta={shots:[]};
const br = await chromium.launch(); const ctx=await br.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2}); const p=await ctx.newPage(); p.setDefaultTimeout(6000);
const css='*{caret-color:transparent!important;scroll-behavior:auto!important} *,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important} [class*=help-fab],[class*=askus]{display:none!important}';
async function shot(name, sels={}){ const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); const r={}; for(const [k,l] of Object.entries(sels)){ const b=await l.boundingBox({timeout:800}).catch(()=>null); if(b) r[k]=[b.x,b.y,b.width,b.height].map(Math.round); } meta.shots.push({name,file:f,rects:r}); console.log(name,JSON.stringify(r)); }
const nav=async n=>{ await p.getByRole('button',{name:n,exact:true}).first().click(); await p.waitForTimeout(2200); await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(500); };
const T=t=>p.getByText(t,{exact:false}).first();
// Arabic hover (Saudi)
await p.goto(B+'/',{waitUntil:'networkidle'}); await p.addStyleTag({content:css}); await p.waitForTimeout(2000);
const ab=p.getByRole('button',{name:/العربية/}).first(); await shot('ar0',{btn:ab}); await ab.click(); await p.waitForTimeout(1500);
const w=p.locator('main').getByText('Practice Hub',{exact:true}).first(); console.log('main after toggle',(await p.locator('main').innerText()).slice(0,300).replace(/\n+/g,' | ')); await w.hover(); await p.waitForTimeout(1500); await shot('ar1',{btn:ab,w});
// Question bank
await p.goto(B+'/question-bank',{waitUntil:'networkidle'}); await p.addStyleTag({content:css}); await p.waitForTimeout(2500);
const d=p.locator('.gulf-slide'); const o=l=>d.locator(`button.gs-opt[data-l=${l}]`);
await shot('qb0',{a:o('A'),b:o('B'),c:o('C'),d:o('D')});
await o('B').click(); await p.waitForTimeout(1500); await shot('qb1',{b:o('B'),c:o('C')});
console.log('WRONG',(await d.innerText()).replace(/\n+/g,' | ').slice(900,1500));
const tr=d.getByRole('button',{name:/Try again/}); if(await tr.count()){ await tr.first().click(); await p.waitForTimeout(1000);} 
await o('C').click(); await p.waitForTimeout(1500); await shot('qb2',{c:o('C'),fb:d.getByText('Correct.',{exact:false}).first(),pearl:d.getByText('Clinical pearl',{exact:false}).first(),trap:d.getByText('Trap:',{exact:false}).first()});
await d.getByText('Clinical pearl',{exact:false}).first().scrollIntoViewIfNeeded(); await p.waitForTimeout(800); await shot('qb3',{pearl:d.getByText('Clinical pearl',{exact:false}).first(),trap:d.getByText('Trap:',{exact:false}).first(),alt:d.getByText('Alternative responses',{exact:false}).first()});
// crown apps
for (const [n,u] of [['medlex','https://medlex.healthcarecrownacademy.co.uk/'],['carecraft','https://carecraft.healthcarecrownacademy.co.uk/'],['lumen','https://lumen.healthcarecrownacademy.co.uk/'],['serein','https://serein.healthcarecrownacademy.co.uk/']]){
  await p.goto(u,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(4000); for (const x of [/^Skip$/,/Skip for now/]) await p.getByRole('button',{name:x}).first().click({timeout:800}).catch(()=>{}); await p.keyboard.press('Escape'); await p.waitForTimeout(1200); await shot('app-'+n,{}); }
fs.writeFileSync(`${OUT}/meta2.json`, JSON.stringify({wide:meta},null,1)); await br.close();
