import { createRequire } from 'node:module';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900} })).newPage();
await p.goto('https://lumen.healthcarecrownacademy.co.uk/',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(3000);
await p.getByRole('button',{name:/Skip for now/}).click({timeout:3000}).catch(()=>{}); await p.waitForTimeout(1000);
for (const t of ['Library','Study','Methods']) { await p.locator('nav, aside').getByText(t,{exact:false}).first().click({timeout:3000}).catch(()=>console.log('no',t)); await p.waitForTimeout(2500); await p.screenshot({path:'l1/x-'+t+'.png'}); console.log(t, (await p.evaluate(()=>(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,600)))); }
await br.close();
