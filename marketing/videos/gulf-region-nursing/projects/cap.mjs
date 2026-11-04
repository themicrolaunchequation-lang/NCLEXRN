import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='g/cap', B='https://snle.healthcarecrownacademy.co.uk'; const meta={shots:[]};
const br = await chromium.launch(); const ctx=await br.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2}); const p=await ctx.newPage(); p.setDefaultTimeout(6000);
const css='*{caret-color:transparent!important;scroll-behavior:auto!important} *,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important} [class*=help-fab],[class*=askus]{display:none!important}';
async function shot(name, sels={}){ const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); const r={}; for(const [k,l] of Object.entries(sels)){ const b=await l.boundingBox({timeout:800}).catch(()=>null); if(b) r[k]=[b.x,b.y,b.width,b.height].map(Math.round); } meta.shots.push({name,file:f,rects:r}); console.log(name,JSON.stringify(r)); }
const nav=async n=>{ await p.getByRole('button',{name:n,exact:true}).first().click(); await p.waitForTimeout(2200); await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(500); };
const T=t=>p.getByText(t,{exact:false}).first();
for (const [code,reg] of [['sa','Saudi'],['qa','Qatar'],['du','Dubai'],['ad','Abu Dhabi']]){
  await p.goto(B+'/',{waitUntil:'networkidle'}); await p.addStyleTag({content:css}); await p.waitForTimeout(2000);
  await p.getByRole('button',{name:reg,exact:true}).first().click(); await p.waitForTimeout(2500);
  await shot(code+'-today',{card:T('QUESTIONS').locator('xpath=ancestor::*[.//text()[contains(.,"ATTEMPTS")]][1]'),ready:T('READINESS MAP').locator('xpath=ancestor::*[3]'),spaces:T('Study spaces').locator('xpath=..'),date:T('My exam date').locator('xpath=..'),reg:p.getByRole('button',{name:reg,exact:true}).first()});
  await nav('Practice Hub'); await shot(code+'-hub',{tutor:T('Tutor Mock'),sim:T('Exam Simulation')});
  await nav('React & Interact'); await shot(code+'-tools',{bf:p.locator('main button').filter({hasText:'BE-FAST'}).first()});
  await p.locator('main button').filter({hasText:'BE-FAST'}).first().click(); await p.waitForTimeout(2500); await shot(code+'-befast',{pearl:T('CLINICAL PEARL').locator('xpath=..'),trap:T('TRAP HUNTER').locator('xpath=..'),bound:T('QUICK BOUNDARY').locator('xpath=..')});
  await p.keyboard.press('Escape'); await p.waitForTimeout(700);
  await nav('Clinical Dossier'); await shot(code+'-dossier',{});
  await nav('Glossary'); await shot(code+'-gloss',{t1:T('نص السؤال')});
  await nav('My Progress'); await shot(code+'-prog',{});
  await nav('Reset & Recharge'); await shot(code+'-reset',{});
}
// Arabic hover (Saudi)
await p.goto(B+'/',{waitUntil:'networkidle'}); await p.addStyleTag({content:css}); await p.waitForTimeout(2000);
const ab=p.getByRole('button',{name:/العربية/}).first(); await shot('ar0',{btn:ab}); await ab.click(); await p.waitForTimeout(1500);
const w=T('Saudi Nursing Licensure Examination'); await w.hover(); await p.waitForTimeout(1500); await shot('ar1',{btn:ab,w});
// Question bank
await p.goto(B+'/question-bank',{waitUntil:'networkidle'}); await p.addStyleTag({content:css}); await p.waitForTimeout(2500);
const opt=T('BP 78/42'); await shot('qb0',{opt,stem:T('A septic patient')});
await opt.click(); await p.waitForTimeout(1500); await shot('qb1',{opt});
await p.getByRole('button',{name:/Reveal answer/}).first().click().catch(()=>{}); await p.waitForTimeout(2000); await shot('qb2',{});
console.log('QB',(await p.locator('body').innerText()).replace(/\n+/g,' | ').slice(600,2200));
await p.mouse.wheel(0,500); await p.waitForTimeout(1000); await shot('qb3',{});
// crown apps
for (const [n,u] of [['medlex','https://medlex.healthcarecrownacademy.co.uk/'],['carecraft','https://carecraft.healthcarecrownacademy.co.uk/'],['lumen','https://lumen.healthcarecrownacademy.co.uk/'],['serein','https://serein.healthcarecrownacademy.co.uk/']]){
  await p.goto(u,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(4000); for (const x of [/^Skip$/,/Skip for now/]) await p.getByRole('button',{name:x}).first().click({timeout:800}).catch(()=>{}); await p.keyboard.press('Escape'); await p.waitForTimeout(1200); await shot('app-'+n,{}); }
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
