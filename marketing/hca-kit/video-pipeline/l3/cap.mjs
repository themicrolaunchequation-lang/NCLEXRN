import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='l3/cap'; const meta={shots:[]};
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })).newPage();
await p.goto('https://lumen.healthcarecrownacademy.co.uk/',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(3000);
await p.getByRole('button',{name:/Skip for now/}).click({timeout:3000}).catch(()=>{}); await p.waitForTimeout(1000);
async function shot(name){ console.log('shot',name); const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); meta.shots.push({name,file:f,rects:{}}); }
await shot('day');
await p.getByRole('button',{name:/Focus session/}).first().click({timeout:3000}).catch(()=>console.log('nofocus')); await p.waitForTimeout(2500); await shot('f0');
console.log('B', await p.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim().replace(/\s+/g,' ').slice(0,25)).join(' | ')));
await p.getByRole('button',{name:/^Start/}).first().click({timeout:3000}).catch(()=>console.log('nostart')); await p.waitForTimeout(3000); await shot('f1');
await p.waitForTimeout(3000); await shot('f2');
await p.keyboard.press('Escape'); await p.waitForTimeout(1000);
await p.locator('nav, aside').getByText('Methods').first().click(); await p.waitForTimeout(2500); await shot('m0');
await p.mouse.wheel(0,500); await p.waitForTimeout(1200); await shot('m1');
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
