import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='c3/cap'; const meta={shots:[]};
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })).newPage();
await p.goto('https://carecraft.healthcarecrownacademy.co.uk/',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(3500); await p.getByRole('button',{name:/Skip intro/}).click({timeout:1500}).catch(()=>{}); await p.waitForTimeout(800);
await p.getByText('Learn',{exact:true}).first().click({timeout:3000}); await p.waitForTimeout(2500);
async function shot(name){ console.log('shot',name); const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); meta.shots.push({name,file:f,rects:{}}); }
await shot('learn');
await p.getByRole('button',{name:/Learn as slides/}).first().click({timeout:4000}).catch(()=>console.log('noslides')); await p.waitForTimeout(3000);
await shot('sl00');
for (let i=1;i<=14;i++){ await p.keyboard.press('ArrowRight'); await p.waitForTimeout(1600); await shot('sl'+String(i).padStart(2,'0')); if(i===7){ await p.getByRole('button',{name:/Reveal a stronger/}).click({timeout:3000}).catch(()=>console.log('noreveal')); await p.waitForTimeout(1500); await shot('rev'); } }
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
