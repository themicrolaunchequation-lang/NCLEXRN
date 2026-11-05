import { createRequire } from 'node:module';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:1 })).newPage();
await p.goto('https://serein.healthcarecrownacademy.co.uk/',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(2500);
for (let k=0;k<4;k++){ await p.getByRole('button',{name:/^(Skip|Not now|Close)$/}).first().click({timeout:1500}).catch(()=>{}); await p.waitForTimeout(800); }
await p.keyboard.press('Escape');
for (const t of ['Toolkit','Visual Atlas']) { await p.getByText(t,{exact:true}).first().click({timeout:3000}); await p.waitForTimeout(2500); await p.screenshot({path:'s3/x-'+t.replace(' ','')+'.png'}); console.log(t, (await p.evaluate(()=>document.querySelector('main').innerText.replace(/\n+/g,' | ').slice(0,700)))); }
await br.close();
