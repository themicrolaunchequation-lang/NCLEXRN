import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='s1/cap'; const meta={shots:[]};
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })).newPage();
await p.goto('https://serein.healthcarecrownacademy.co.uk/',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(2500);
async function shot(name){ const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); meta.shots.push({name,file:f,rects:{}}); }
for (let i=0;i<24;i++){ await shot('b'+String(i).padStart(2,'0')); await p.waitForTimeout(450); }
await p.getByRole('button',{name:/A little low/}).first().click({timeout:3000}).catch(()=>console.log('nolow')); await p.waitForTimeout(2000); await shot('ci1');
console.log('CI', await p.evaluate(()=>{const d=[...document.querySelectorAll('[role=dialog],dialog')].find(e=>e.offsetParent); return d?d.innerText.replace(/\n+/g,' | ').slice(0,700):'none';}));
for (let i=0;i<6;i++){ await p.waitForTimeout(900); await shot('ci'+(i+2)); }
await p.getByRole('button',{name:/^Skip$/}).click({timeout:3000}).catch(()=>{}); await p.waitForTimeout(2000); await shot('today');
console.log((await p.evaluate(()=>document.querySelector('main').innerText.replace(/\n+/g,' | ').slice(0,900))));
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
