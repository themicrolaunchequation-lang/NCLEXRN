import { createRequire } from 'node:module';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900} })).newPage();
await p.goto('https://carecraft.healthcarecrownacademy.co.uk/',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(3500); await p.getByRole('button',{name:/Skip intro/}).click({timeout:1500}).catch(()=>{}); await p.waitForTimeout(800);
console.log(await p.evaluate(()=>[...document.querySelectorAll('nav a, aside a')].map(a=>a.textContent.trim()+'='+a.getAttribute('href')).join(' | ')));
for (const t of ['Learn','Toolkit']) {
  await p.getByText(t,{exact:true}).first().click({timeout:3000}); await p.waitForTimeout(2500);
  await p.screenshot({path:'c2/n-'+t+'.png'}); console.log(t,p.url());
}
await br.close();
