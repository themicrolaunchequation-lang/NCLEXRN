import { createRequire } from 'node:module';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await br.newContext({ viewport:{width:1440,height:900} });
await ctx.addInitScript(()=>{ try{ for (const k of ['medlex-onboarded','mx-onboard','mx_onboarded']) localStorage.setItem(k,'1'); }catch(e){} });
const p = await ctx.newPage();
for (const h of ['#practice','#wordparts','#atlas']) {
  await p.goto('https://medlex.healthcarecrownacademy.co.uk/'+h, {waitUntil:'domcontentloaded'}); await p.waitForTimeout(3500);
  await p.getByRole('button',{name:/^Skip$/}).click({timeout:1500}).catch(()=>{}); await p.waitForTimeout(800);
  await p.screenshot({path:'m1/x'+h.slice(1)+'.png', fullPage:false});
  console.log(h, p.url(), (await p.evaluate(()=>[...document.querySelectorAll('main button, main a, main h2, main h3')].filter(b=>b.offsetParent).map(b=>b.textContent.trim().replace(/\s+/g,' ').slice(0,40)).filter(Boolean).slice(0,40).join(' | '))));
}
await br.close();
