import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='s3/cap'; const meta={shots:[]};
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })).newPage();
await p.goto('https://serein.healthcarecrownacademy.co.uk/',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(2500);
for (let k=0;k<4;k++){ await p.getByRole('button',{name:/^(Skip|Not now|Close)$/}).first().click({timeout:1500}).catch(()=>{}); await p.waitForTimeout(800); }
await p.keyboard.press('Escape');
async function shot(name){ console.log('shot',name); const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); meta.shots.push({name,file:f,rects:{}}); }
await p.getByText('Visual Atlas',{exact:true}).first().click({timeout:3000}); await p.waitForTimeout(3000);
await shot('a0');
const img = p.locator('main img').filter({visible:true}).first();
await img.scrollIntoViewIfNeeded().catch(()=>{}); await p.mouse.wheel(0,250); await p.waitForTimeout(1200); await shot('a1');
const nextB = p.getByRole('button',{name:/next/i}).filter({visible:true}).first();
for (let i=2;i<=4;i++){ await nextB.click({timeout:3000}).catch(()=>p.keyboard.press('ArrowRight')); await p.waitForTimeout(1500); await shot('a'+i); }
await p.getByRole('button',{name:/Enlarge/}).first().click({timeout:3000}).catch(()=>console.log('noenl')); await p.waitForTimeout(2000); await shot('big');
await p.keyboard.press('Escape'); await p.waitForTimeout(800);
await p.getByText('Support',{exact:true}).first().click({timeout:3000}).catch(()=>{}); await p.waitForTimeout(2500); await shot('support');
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
