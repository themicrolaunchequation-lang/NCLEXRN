import { createRequire } from 'node:module'; import { stub } from './stub.mjs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-proxy-server'] });
for (const [n,w,h,mob] of [['wide',1280,720,false],['tall',430,932,true]]) {
  const ctx = await br.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:2, isMobile:mob, hasTouch:mob });
  await ctx.addInitScript(()=>{ try{ localStorage.setItem('lss_reg_v2', JSON.stringify({name:'Sarah Ahmed',org:'City Hospital',email:'demo@example.org',tier:'paid'})); localStorage.setItem('lss_onboarded','1'); }catch(e){} });
  const p = await ctx.newPage();
  await p.route(/vendor\/supabase-js/, r=>r.fulfill({status:200,contentType:'text/javascript',body:stub('paid')}));
  await p.goto('http://127.0.0.1:8788/'); await p.waitForTimeout(3500);
  await p.screenshot({path:`explore/${n}-home.png`});
  await p.evaluate(()=>{ const el=[...document.querySelectorAll('.nav-item')].find(e=>/Cost of Poor/.test(e.textContent)); el && el.click(); });
  await p.waitForTimeout(1500); await p.screenshot({path:`explore/${n}-copq.png`});
  await p.screenshot({path:`explore/${n}-copq-full.png`, fullPage:true});
  await ctx.close();
}
await br.close();
