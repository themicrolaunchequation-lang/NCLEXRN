import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='e1/cap', B='https://evinca.healthcarecrownacademy.co.uk/en'; const meta={shots:[]};
const br = await chromium.launch(); const ctx = await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
const p = await ctx.newPage(); p.setDefaultTimeout(8000);
const css='*{caret-color:transparent!important;scroll-behavior:auto!important} *,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}';
async function go(u){ await p.goto(B+u,{waitUntil:'networkidle'}); await p.addStyleTag({content:css}); await p.waitForTimeout(1500); }
async function top(loc,off=90){ await loc.evaluate((e,o)=>{ window.scrollTo(0, e.getBoundingClientRect().top+scrollY-o); },off); await p.waitForTimeout(1000); }
async function shot(name, sels={}){ const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); const r={}; for(const [k,l] of Object.entries(sels)){ const b=await l.boundingBox({timeout:800}).catch(()=>null); if(b) r[k]=[b.x,b.y,b.width,b.height].map(Math.round); } meta.shots.push({name,file:f,rects:r}); console.log(name,JSON.stringify(r)); }
await go(''); await shot('home',{h1:p.locator('h1').first(),start:p.getByRole('link',{name:'Start a free Spotlight Story'}).first(),verify:p.getByRole('link',{name:'Verify an honor'}).first()});
const ci=p.getByText('Where do you come in?',{exact:false}).first(); await top(ci,70);
const card=t=>p.locator('a').filter({hasText:t}).first();
await shot('comein',{c1:card('I made something better'),c2:card('I saw someone do it'),c3:card('Someone cared for me'),c4:card('I lead a team'),h:ci});
await go('/nominate'); await shot('nominate',{h1:p.locator('h1').first(),list:p.getByText('Think of the one who',{exact:false}).first()});
await top(p.getByText('Think of the one who',{exact:false}).first(),120); await shot('nominate2',{list:p.getByText('Think of the one who',{exact:false}).first().locator('xpath=..')});
await go('/thank'); await shot('thank',{h1:p.locator('h1').first()});
await top(p.getByText('A few words is enough',{exact:false}).first(),120); await shot('thank2',{q:p.getByText('To the night nurse',{exact:false}).first()});
await go('/apply'); await shot('apply',{h1:p.locator('h1').first(),ev:p.locator('.ap-evidence'),pr:p.locator('.ap-prompts')});
const c=p.locator('.eligibility-card'); await top(c,120);
const S=()=>({sel:c.locator('select'),c1:c.getByText('Patient Safety & Quality'),c2:c.getByText('Healthcare Education'),yes:c.getByRole('button',{name:'Yes'}),no:c.getByRole('button',{name:'Not yet'}),card:c,a:c.locator('a').first()});
await shot('a0',S());
await c.locator('select').selectOption('GB'); await p.waitForTimeout(500); await shot('a1',S());
await c.getByText('Patient Safety & Quality').click(); await p.waitForTimeout(800); await shot('a2',S());
await c.getByRole('button',{name:'Yes'}).click(); await p.waitForTimeout(800); await shot('a3',S());
await c.getByRole('button',{name:'Yes'}).click(); await p.waitForTimeout(800); await shot('a4',S());
await c.getByRole('button',{name:'Yes'}).click(); await p.waitForTimeout(1000); await shot('a5',S());
await c.getByRole('button',{name:'Start again'}).click(); await p.waitForTimeout(800);
await c.locator('select').selectOption('SA'); await p.waitForTimeout(500); await shot('b1',S());
await c.getByText('Healthcare Education').click(); await p.waitForTimeout(800); await shot('b2',S());
await c.getByRole('button',{name:'Yes'}).click(); await p.waitForTimeout(800); await shot('b3',S());
await c.getByRole('button',{name:'Not yet'}).click(); await p.waitForTimeout(800); await shot('b4',S());
await c.getByRole('button',{name:'Yes'}).click(); await p.waitForTimeout(1000); await shot('b5',S());
await go('/recognitions'); await shot('rec',{h1:p.locator('h1').first()});
await top(p.getByText('The ladder',{exact:false}).first(),80); await shot('rec2',{});
await go('/account/apply?mark=spotlight'); await shot('spot',{h1:p.locator('h1').first()});
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
