import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='g1/cap'; const meta={shots:[]};
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })).newPage();
await p.goto('https://snle.healthcarecrownacademy.co.uk/',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(3500);
async function shot(name){ console.log('shot',name); const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); meta.shots.push({name,file:f,rects:{}}); }
await shot('home');
await p.getByRole('button',{name:/Start a 10-question check/}).first().click({timeout:3000}).catch(()=>p.getByText('Start a 10-question check').first().click()); await p.waitForTimeout(3000); await shot('q0');
await p.keyboard.press('d'); await p.waitForTimeout(900); await shot('q1');
await p.keyboard.press('Enter'); await p.waitForTimeout(2000); await shot('q2');
await p.mouse.move(900,600); await p.mouse.wheel(0,500); await p.waitForTimeout(1200); await shot('q3');
await p.mouse.wheel(0,500); await p.waitForTimeout(1200); await shot('q4');
console.log('T', await p.evaluate(()=>(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,900)));
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
