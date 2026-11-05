import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='g2/cap'; const meta={shots:[]};
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })).newPage();
await p.goto('https://snle.healthcarecrownacademy.co.uk/',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(3500);
async function shot(name){ console.log('shot',name); const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); meta.shots.push({name,file:f,rects:{}}); }
await p.getByText('React & Interact').first().click(); await p.waitForTimeout(3000); await shot('ri0');
await p.getByText(/BE-FAST/).first().click({timeout:4000}).catch(()=>console.log('nobefast')); await p.waitForTimeout(3000); await shot('bf0');
console.log('T', await p.evaluate(()=>(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,1200)));
await p.getByText('Poster + annotate').first().click({timeout:3000}).catch(()=>console.log('nop')); await p.waitForTimeout(3000); await shot('po0');
await p.mouse.move(900,600); await p.mouse.wheel(0,500); await p.waitForTimeout(1500); await shot('po1');
await p.getByText('Coach practice').first().click({timeout:3000}).catch(()=>console.log('noc')); await p.waitForTimeout(2500); await shot('co0');
await p.getByText(/Start 10-question coached set/).first().click({timeout:3000}).catch(()=>console.log('nos')); await p.waitForTimeout(2500); await shot('cq0');
await p.keyboard.press('a'); await p.waitForTimeout(800); await shot('cq1'); await p.keyboard.press('Enter'); await p.waitForTimeout(2000); await shot('cq2');
console.log('C', await p.evaluate(()=>{const d=[...document.querySelectorAll('[role=dialog],dialog')].find(e=>e.offsetParent); return d?d.innerText.replace(/\n+/g,' | ').slice(0,1200):'none';}));
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
