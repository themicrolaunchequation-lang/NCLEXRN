import { createRequire } from 'node:module';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900} })).newPage();
for (const h of ['#/practice','#/toolkit']) {
 await p.goto('https://carecraft.healthcarecrownacademy.co.uk/'+h, {waitUntil:'domcontentloaded'}); await p.waitForTimeout(4000);
 await p.getByRole('button',{name:/Skip intro/}).click({timeout:1500}).catch(()=>{}); await p.waitForTimeout(1000);
 await p.screenshot({path:'c2/x'+h.slice(2)+'.png'});
 console.log(h, (await p.evaluate(()=>[...document.querySelectorAll('main a, main button, main h2, main h3')].filter(b=>b.offsetParent).map(b=>b.textContent.trim().replace(/\s+/g,' ').slice(0,40)).filter(Boolean).slice(0,50).join(' | '))));
}
await br.close();
