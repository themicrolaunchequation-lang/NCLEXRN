import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='c2/cap'; const meta={shots:[]};
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })).newPage();
await p.goto('https://carecraft.healthcarecrownacademy.co.uk/#/tools',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(3500); await p.getByRole('button',{name:/Skip intro/}).click({timeout:1500}).catch(()=>{}); await p.waitForTimeout(800);
await p.getByText('Toolkit',{exact:true}).first().click({timeout:3000}).catch(()=>{}); await p.waitForTimeout(2000);
await p.addStyleTag({content:'*{caret-color:transparent!important}'});
async function shot(name, sels={}){ console.log('shot',name); const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); const r={}; for(const [k,l] of Object.entries(sels)){ const b=await l.boundingBox({timeout:400}).catch(()=>null); if(b) r[k]=[b.x,b.y,b.width,b.height]; } meta.shots.push({name,file:f,rects:r}); }
await shot('tools');
await p.getByRole('button',{name:/Open/}).first().click({timeout:3000}); await p.waitForTimeout(2200);
const sit = p.locator('textarea').first(), sel = p.locator('select').first();
await shot('e0',{sit,sel});
const text = 'Mr Lee, bed 4, is more breathless than an hour ago. I am worried.';
const chunks=[18,36,52,text.length]; let k=1;
await sit.click();
let done=0; for (const c of chunks){ await p.keyboard.type(text.slice(done,c),{delay:5}); done=c; await p.waitForTimeout(500); await shot('t'+(k++),{sit,sel}); }
const opts = await sel.evaluate(s=>[...s.options].map(o=>o.value+'|'+o.text)); console.log('OPTS',opts.join(' ;; '));
await sel.selectOption({index:1}); await p.waitForTimeout(1500); await shot('ex1',{sit,sel});
const modal = p.locator('[role=dialog]').filter({hasText:'SBAR and ISBAR'}).first();
await p.mouse.move(720,600); await p.mouse.wheel(0,500); await p.waitForTimeout(1000); await shot('ex2');
await p.mouse.wheel(0,600); await p.waitForTimeout(1000); await shot('ex3');
await p.mouse.wheel(0,700); await p.waitForTimeout(1000); await shot('ex4');
console.log('TXT', await p.evaluate(()=>{ const d=[...document.querySelectorAll('[role=dialog]')].find(e=>/SBAR and ISBAR/.test(e.innerText)); return d?d.innerText.replace(/\n+/g,' | ').slice(0,2000):'none'; }));
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
