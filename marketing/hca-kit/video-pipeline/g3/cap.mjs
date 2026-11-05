import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='g3/cap'; const meta={shots:[]};
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })).newPage();
await p.goto('https://snle.healthcarecrownacademy.co.uk/',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(3500);
async function shot(name){ console.log('shot',name); const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); meta.shots.push({name,file:f,rects:{}}); }
await shot('home');
await p.getByText('Glossary',{exact:true}).first().click(); await p.waitForTimeout(3000); await shot('gl0');
await p.mouse.move(900,600); await p.mouse.wheel(0,450); await p.waitForTimeout(1200); await shot('gl1');
await p.getByText('العربية').first().click({timeout:3000}).catch(()=>console.log('noar')); await p.waitForTimeout(2500); await shot('ar0');
await p.mouse.wheel(0,-450); await p.waitForTimeout(1000); await shot('ar1');
await p.getByText('العربية').first().click({timeout:3000}).catch(()=>{}); await p.waitForTimeout(1500);
for (const q of ['Saudi','Qatar','Dubai','Abu Dhabi']) { await p.getByRole('button',{name:new RegExp('^\\s*'+q)}).first().click({timeout:3000}).catch(()=>console.log('no',q)); await p.waitForTimeout(2000); await p.getByText('Today',{exact:true}).first().click().catch(()=>{}); await p.waitForTimeout(2000); await shot('ex-'+q.replace(' ','')); }
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
