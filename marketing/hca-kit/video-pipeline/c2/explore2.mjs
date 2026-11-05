import { createRequire } from 'node:module';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900} })).newPage();
const go=async h=>{ await p.goto('https://carecraft.healthcarecrownacademy.co.uk/'+h,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(3500); await p.getByRole('button',{name:/Skip intro/}).click({timeout:1500}).catch(()=>{}); await p.waitForTimeout(800); };
await go('#/learn'); await p.screenshot({path:'c2/learn.png'});
console.log('LEARN', (await p.evaluate(()=>document.querySelector('main').innerText.replace(/\n+/g,' | ').slice(0,900))));
for (const nav of ['Toolkit','My Growth']) { await p.getByRole('link',{name:nav}).first().click({timeout:3000}).catch(()=>{}); await p.waitForTimeout(2500); await p.screenshot({path:'c2/'+nav.replace(' ','')+'.png'}); console.log(nav, p.url(), (await p.evaluate(()=>document.querySelector('main').innerText.replace(/\n+/g,' | ').slice(0,700)))); }
await br.close();
