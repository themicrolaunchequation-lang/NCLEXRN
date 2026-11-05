import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='e1/cap'; const meta={shots:[]};
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })).newPage();
await p.goto('https://evinca.healthcarecrownacademy.co.uk/en',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(3500);
await p.addStyleTag({content:'html,body,*{scroll-behavior:auto!important}'});
async function shot(name){ console.log('shot',name); const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); meta.shots.push({name,file:f,rects:{}}); }
await shot('h0');
for (let i=1;i<=7;i++){ await p.mouse.move(700,500); await p.mouse.wheel(0,800); await p.waitForTimeout(1300); await shot('h'+i); }
await p.goto('https://evinca.healthcarecrownacademy.co.uk/en',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(2500);
await p.getByText(/check your eligibility in two minutes/).first().click({timeout:4000}).catch(()=>console.log('noelig')); await p.waitForTimeout(3500); await shot('el0'); console.log('EL',p.url(), (await p.evaluate(()=>document.body.innerText.replace(/\n+/g,' | ').slice(0,700))));
await p.mouse.move(700,500); await p.mouse.wheel(0,700); await p.waitForTimeout(1300); await shot('el1');
console.log('B1', await p.evaluate(()=>[...document.querySelectorAll('main button, main label')].filter(b=>b.offsetParent&&b.getBoundingClientRect().top>0&&b.getBoundingClientRect().top<900).map(b=>b.textContent.trim().replace(/\s+/g,' ').slice(0,40)).join(' | ')));
await p.mouse.wheel(0,700); await p.waitForTimeout(1300); await shot('el2');
await p.goto('https://evinca.healthcarecrownacademy.co.uk/en',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(2500);
await p.getByText('Open proof page').first().click({timeout:4000}).catch(()=>console.log('noproof')); await p.waitForTimeout(3500); await shot('pr0'); console.log('PR',p.url());
await p.mouse.move(700,500); await p.mouse.wheel(0,800); await p.waitForTimeout(1300); await shot('pr1');
await p.mouse.wheel(0,800); await p.waitForTimeout(1300); await shot('pr2');
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
