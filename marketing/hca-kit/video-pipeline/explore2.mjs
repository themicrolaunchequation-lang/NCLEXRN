import { createRequire } from 'node:module'; import { stub } from './stub.mjs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-proxy-server'] });
const ctx = await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:1 });
await ctx.addInitScript(()=>{ try{ localStorage.setItem('lss_reg_v2', JSON.stringify({name:'Sarah Ahmed',org:'City Hospital',email:'demo@example.org',tier:'paid'})); }catch(e){} });
const p = await ctx.newPage();
await p.route(/vendor\/supabase-js/, r=>r.fulfill({status:200,contentType:'text/javascript',body:stub('paid')}));
await p.goto('http://127.0.0.1:8788/'); await p.waitForTimeout(3000);
await p.evaluate(()=>{ [...document.querySelectorAll('.nav-item')].find(e=>/Cost of Poor/.test(e.textContent)).click(); });
await p.waitForTimeout(1000);
const info = await p.evaluate(()=>{ const sec=document.querySelector('.section.active, section.active, #copq') ; const s=[...document.querySelectorAll('select')].filter(x=>x.offsetParent&&/worked example/i.test(x.options[0]?.text||'')); return {examples:s.map(x=>[x.id,[...x.options].map(o=>o.value+'|'+o.text)]), inputs:[...document.querySelectorAll('#copq input, [id^=cq] , [id^=cq-]')].filter(x=>x.offsetParent).map(x=>x.id+':'+x.type).slice(0,30)}; });
console.log(JSON.stringify(info,null,1));
const selL=p.locator('select:visible').filter({hasText:'CLABSI cost model'}).first(); await selL.selectOption('good:0'); await p.waitForTimeout(1500);
await p.screenshot({path:'explore/ex1.png', fullPage:true}); console.log(await p.evaluate(()=>['cq-vol','cq-rate','cq-cost','cq-target'].map(i=>i+'='+document.getElementById(i).value).join(' ')+' | '+['cq-defects','cq-current','cq-projected','cq-savings','cq-savingssub','cq-ledgertotal'].map(i=>i+'='+document.getElementById(i).textContent.trim()).join(' | ')));
// learning studio
await p.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/Learning Studio/.test(b.textContent)); b&&b.click(); });
await p.waitForTimeout(1500); await p.screenshot({path:'explore/studio.png'});
await br.close();
