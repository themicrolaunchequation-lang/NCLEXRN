import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const meta=JSON.parse(fs.readFileSync('s1/cap/meta.json'));
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })).newPage();
await p.goto('https://serein.healthcarecrownacademy.co.uk/#library',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(2500);
for (let k=0;k<4;k++){ await p.getByRole('button',{name:/^(Skip|Not now|Close)$/}).first().click({timeout:1500}).catch(()=>{}); await p.waitForTimeout(800); }
await p.keyboard.press('Escape'); await p.waitForTimeout(800);
await p.getByText('Library',{exact:true}).first().click({timeout:3000}).catch(()=>{}); await p.waitForTimeout(2500);
await p.screenshot({path:'s1/cap/library.png'}); meta.wide.shots.push({name:'library',file:'s1/cap/library.png',rects:{}});
fs.writeFileSync('s1/cap/meta.json', JSON.stringify(meta,null,1)); await br.close();
