import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT=process.argv[2]+'/cap', B='https://evinca.healthcarecrownacademy.co.uk'; const meta={shots:[]};
const br = await chromium.launch(); const ctx = await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
const p = await ctx.newPage(); p.setDefaultTimeout(8000);
const css='*{caret-color:transparent!important;scroll-behavior:auto!important} *,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}';
async function go(u){ await p.goto(B+u,{waitUntil:'networkidle'}); await p.addStyleTag({content:css}); await p.waitForTimeout(1500); }
async function top(loc,off=90){ await loc.evaluate((e,o)=>{ window.scrollTo(0, e.getBoundingClientRect().top+scrollY-o); },off); await p.waitForTimeout(1000); }
const T=t=>p.getByText(t,{exact:false}).first();
async function shot(name, sels={}){ const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); const r={}; for(const [k,l] of Object.entries(sels)){ const b=await l.boundingBox({timeout:800}).catch(()=>null); if(b) r[k]=[b.x,b.y,b.width,b.height].map(Math.round); } meta.shots.push({name,file:f,rects:r}); console.log(name,JSON.stringify(r)); }
const steps=(await import(process.cwd()+'/'+process.argv[2]+'/steps.mjs')).default;
await steps({p,go,top,shot,T});
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
