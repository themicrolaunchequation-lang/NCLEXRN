import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='e2/cap'; const meta={shots:[]};
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })).newPage();
await p.goto('https://evinca.healthcarecrownacademy.co.uk/en/apply',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(3500);
await p.addStyleTag({content:'html,body,*{scroll-behavior:auto!important}'});
async function shot(name){ console.log('shot',name); const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); meta.shots.push({name,file:f,rects:{}}); }
await shot('a0');
const sel=p.locator('select').first(); await sel.scrollIntoViewIfNeeded(); await p.mouse.wheel(0,-250); await p.waitForTimeout(1000); await shot('s0');
const opts=await sel.evaluate(s=>[...s.options].map(o=>o.text)); console.log('O',opts.slice(0,12).join(','));
await sel.selectOption({label:opts.find(o=>/United Kingdom/.test(o))||opts[3]}); await p.waitForTimeout(800); await shot('s1');
await p.getByText('Patient Safety & Quality').first().click({timeout:3000}).catch(()=>console.log('nocat')); await p.waitForTimeout(800); await shot('s2');
for (let step=2; step<=6; step++){
  const nx=p.getByRole('button',{name:/^(Next|Continue|See)/}).first(); await nx.click({timeout:3000}).catch(()=>console.log('nonext',step)); await p.waitForTimeout(1500);
  const lbl=p.locator('main label, main [role=radio], main button').filter({hasText:/Yes|measur|before|data|.{20,}/}).first();
  await shot('st'+step+'a'); console.log('ST'+step, await p.evaluate(()=>{const e=[...document.querySelectorAll('main *')].find(x=>/STEP \d OF/i.test(x.textContent)&&x.children.length<2); return e?e.parentElement.parentElement.innerText.replace(/\n+/g,' | ').slice(0,300):'?';}));
  await lbl.click({timeout:2000}).catch(()=>{}); await p.waitForTimeout(700); await shot('st'+step+'b');
}
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
