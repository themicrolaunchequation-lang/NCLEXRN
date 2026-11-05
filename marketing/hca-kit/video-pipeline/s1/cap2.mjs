import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='s1/cap'; const meta=JSON.parse(fs.readFileSync('s1/cap/meta.json')); meta.wide.shots=meta.wide.shots.filter(s=>/^b\d/.test(s.name));
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })).newPage();
await p.goto('https://serein.healthcarecrownacademy.co.uk/',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(2500);
async function shot(name){ const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); meta.wide.shots.push({name,file:f,rects:{}}); }
for (let k=0;k<4;k++){ await p.getByRole('button',{name:/^(Skip|Not now|Close)$/}).first().click({timeout:1500}).catch(()=>{}); await p.waitForTimeout(800); }
await p.keyboard.press('Escape'); await p.waitForTimeout(800);
await shot('today');
await p.getByRole('button',{name:/Start my pause/}).first().click({timeout:3000}).catch(()=>console.log('nostart')); await p.waitForTimeout(1500);
await shot('pre'); await p.getByRole('button',{name:/Begin practice/}).first().click({timeout:3000}).catch(()=>console.log('nobegin')); await p.waitForTimeout(800);
for (let i=0;i<24;i++){ await shot('p'+String(i).padStart(2,'0')); await p.waitForTimeout(500); }
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify(meta,null,1)); await br.close();
