import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='g/cap'; const meta={shots:[]};
const br = await chromium.launch(); const p=await (await br.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2})).newPage(); p.setDefaultTimeout(6000);
const css='*{caret-color:transparent!important;scroll-behavior:auto!important} *,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}';
async function shot(name, sels={}){ const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); const r={}; for(const [k,l] of Object.entries(sels)){ const b=await l.boundingBox({timeout:800}).catch(()=>null); if(b) r[k]=[b.x,b.y,b.width,b.height].map(Math.round); } meta.shots.push({name,file:f,rects:r}); console.log(name,JSON.stringify(r)); }
const go=async()=>{ await p.goto('https://snle.healthcarecrownacademy.co.uk/',{waitUntil:'networkidle'}); await p.addStyleTag({content:css}); await p.waitForTimeout(2000); };
const D=()=>p.locator('[role=dialog], dialog').last();
await go(); await p.getByRole('button',{name:'React & Interact',exact:true}).first().click(); await p.waitForTimeout(2000);
await p.locator('main button').filter({hasText:'BE-FAST'}).first().click(); await p.waitForTimeout(2500);
for (const [tab,n] of [['Poster + annotate','n-poster'],['Coach practice','n-coach'],['Evidence & scope','n-evid']]){ await p.getByRole('button',{name:tab}).first().click().catch(e=>console.log('tab',tab)); await p.waitForTimeout(2500); await shot(n,{}); console.log(n,(await D().innerText().catch(()=>'')).replace(/\n+/g,' | ').slice(0,500)); }
await go(); await p.getByRole('button',{name:/Edit/}).first().click(); await p.waitForTimeout(1500); await shot('n-edit0',{});
console.log('EDITBTN',(await p.locator('button:visible').allInnerTexts()).map(x=>x.trim().slice(0,20)).filter(Boolean).join(' ¦ ').slice(0,600));
for (const t of ['Highlight','Pen']){ const b=p.getByRole('button',{name:new RegExp(t)}).last(); if(await b.count()){ await b.click(); await p.waitForTimeout(500); if(t==='Highlight'){ await p.mouse.move(300,215); await p.mouse.down(); await p.mouse.move(560,215,{steps:15}); await p.mouse.up(); } else { await p.mouse.move(1000,140); await p.mouse.down(); for(let a=0;a<=40;a++){ await p.mouse.move(1180+120*Math.cos(a/40*6.3),190+45*Math.sin(a/40*6.3)); } await p.mouse.up(); } await p.waitForTimeout(600);} }
await shot('n-edit1',{});
await go(); await p.getByRole('button',{name:/SNLE Guide/}).first().click(); await p.waitForTimeout(2500); await shot('n-guide',{}); console.log('GUIDE',(await p.locator('main').innerText()).replace(/\n+/g,' | ').slice(0,900));
await p.goto('https://snle.healthcarecrownacademy.co.uk/hub/#saudi',{waitUntil:'networkidle'}); await p.addStyleTag({content:css}); await p.waitForTimeout(2500); await shot('n-hub',{}); console.log('HUB',(await p.locator('body').innerText()).replace(/\n+/g,' | ').slice(0,1200));
await go(); await p.getByRole('button',{name:/Course Library/}).first().click().catch(()=>{}); await p.waitForTimeout(2500); await shot('n-lib',{}); console.log('LIB',(await p.locator('body').innerText()).replace(/\n+/g,' | ').slice(0,700));
fs.writeFileSync(`${OUT}/meta4.json`, JSON.stringify({wide:meta},null,1)); await br.close();
