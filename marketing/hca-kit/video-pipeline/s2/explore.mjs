import { createRequire } from 'node:module';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })).newPage();
await p.goto('https://serein.healthcarecrownacademy.co.uk/',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(2500);
for (let k=0;k<4;k++){ await p.getByRole('button',{name:/^(Skip|Not now|Close)$/}).first().click({timeout:1500}).catch(()=>{}); await p.waitForTimeout(800); }
await p.keyboard.press('Escape'); await p.waitForTimeout(800);
await p.getByRole('button',{name:/Something else/}).first().click({timeout:3000}).catch(()=>console.log('nose')); await p.waitForTimeout(2000);
await p.screenshot({path:'s2/cap/r0.png'});
console.log(await p.evaluate(()=>{const d=[...document.querySelectorAll('[role=dialog],dialog')].find(e=>e.offsetParent); return d?d.innerText.replace(/\n+/g,' | ').slice(0,900):document.querySelector('main').innerText.slice(0,500);}));
await br.close();
