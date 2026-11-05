import { createRequire } from 'node:module'; import { stub } from './stub.mjs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const names = process.argv.slice(2);
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-proxy-server'] });
const ctx = await br.newContext({ viewport:{width:1440,height:900} });
await ctx.addInitScript(()=>{ try{ localStorage.setItem('lss_reg_v2', JSON.stringify({name:'Sarah Ahmed',org:'City Hospital',email:'demo@example.org',tier:'paid'})); }catch(e){} });
const p = await ctx.newPage();
await p.route(/vendor\/supabase-js/, r=>r.fulfill({status:200,contentType:'text/javascript',body:stub('paid')}));
await p.goto('http://127.0.0.1:8788/'); await p.waitForTimeout(3000);
for (const n of names) {
  await p.evaluate(n=>{ [...document.querySelectorAll('.nav-item')].find(e=>e.textContent.includes(n)).click(); window.scrollTo(0,0); }, n);
  await p.waitForTimeout(1500);
  const f='explore/'+n.replace(/\W+/g,'_')+'.png'; await p.screenshot({path:f, fullPage:true});
  console.log(f, await p.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim().slice(0,30)).filter(Boolean).slice(0,60).join(' | ')));
}
await br.close();
