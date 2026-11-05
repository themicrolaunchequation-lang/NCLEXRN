import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='s2/cap'; const meta={shots:[]};
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })).newPage();
await p.goto('https://serein.healthcarecrownacademy.co.uk/',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(2500);
for (let k=0;k<4;k++){ await p.getByRole('button',{name:/^(Skip|Not now|Close)$/}).first().click({timeout:1500}).catch(()=>{}); await p.waitForTimeout(800); }
await p.keyboard.press('Escape'); await p.waitForTimeout(800);
async function shot(name){ console.log('shot',name); const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); meta.shots.push({name,file:f,rects:{}}); }
const dtext=()=>p.evaluate(()=>{const d=[...document.querySelectorAll('[role=dialog],dialog')].find(e=>e.offsetParent&&/pause that fits|STEP/i.test(e.innerText)); return d?d.innerText.replace(/\n+/g,' | ').slice(0,600):'none';});
await shot('home');
await p.getByRole('button',{name:/Something else/}).first().click({timeout:3000}); await p.waitForTimeout(1500); await shot('q1');
await p.getByRole('button',{name:/After a difficult moment/}).first().click({timeout:3000}).catch(()=>console.log('m1')); await p.waitForTimeout(800); await shot('q1b');
await p.getByRole('button',{name:/Continue/}).click({timeout:3000}); await p.waitForTimeout(1500); await shot('q2'); console.log('Q2',await dtext());
const opt2 = p.locator('[role=dialog] button').filter({hasText:/racing|on edge|tense|wired|heavy/i}).first();
await opt2.click({timeout:3000}).catch(()=>console.log('m2')); await p.waitForTimeout(800); await shot('q2b');
await p.getByRole('button',{name:/Continue/}).click({timeout:3000}).catch(()=>{}); await p.waitForTimeout(1500); await shot('q3'); console.log('Q3',await dtext());
const opt3 = p.locator('[role=dialog] button').filter({hasText:/station|desk|break room|standing|seated/i}).first();
await opt3.click({timeout:3000}).catch(()=>console.log('m3')); await p.waitForTimeout(800); await shot('q3b');
await p.getByRole('button',{name:/Continue|Show|Suggest|See/}).last().click({timeout:3000}).catch(()=>{}); await p.waitForTimeout(2000); await shot('res'); console.log('RES',await dtext());
await p.getByRole('button',{name:/Explore 90 sec/}).first().click({timeout:3000}).catch(()=>console.log('nohand')); await p.waitForTimeout(2000); await shot('hpre');
await p.getByRole('button',{name:/Begin practice/}).first().click({timeout:3000}).catch(()=>console.log('nobegin')); await p.waitForTimeout(800);
for (let i=0;i<14;i++){ await shot('h'+String(i).padStart(2,'0')); await p.waitForTimeout(600); }
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
