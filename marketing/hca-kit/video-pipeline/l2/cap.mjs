import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='l2/cap'; const meta={shots:[]};
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })).newPage();
await p.goto('https://lumen.healthcarecrownacademy.co.uk/',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(3000);
await p.getByRole('button',{name:/Skip for now/}).click({timeout:3000}).catch(()=>{}); await p.waitForTimeout(1000);
async function shot(name){ console.log('shot',name); const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); meta.shots.push({name,file:f,rects:{}}); }
await p.locator('nav, aside').getByText('Study').first().click(); await p.waitForTimeout(2500); await shot('st0');
await p.getByRole('button',{name:/Try the starter collection|Add source-linked starter/}).first().click({timeout:3000}).catch(()=>console.log('nostarter')); await p.waitForTimeout(2500); await shot('st1');
const b=async()=>p.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim().replace(/\s+/g,' ').slice(0,25)).join(' | '));
console.log('B1',await b());
await p.getByRole('button',{name:/^Review 19 ready cards/}).first().click({timeout:3000}).catch(()=>console.log('nostart')); await p.waitForTimeout(2000); await shot('c0');
console.log('B2',await b());
await p.getByRole('button',{name:/Show answer|Reveal|Flip/}).first().click({timeout:3000}).catch(()=>console.log('noreveal')); await p.waitForTimeout(1500); await shot('c1');
console.log('B3',await b());
await p.getByRole('button',{name:/Good/}).first().click({timeout:3000}).catch(()=>console.log('nogood')); await p.waitForTimeout(1500); await shot('c2');
await p.getByRole('button',{name:/Show answer|Reveal|Flip/}).first().click({timeout:3000}).catch(()=>{}); await p.waitForTimeout(1500); await shot('c3');
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
