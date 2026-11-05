import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='c1/cap'; const meta={shots:[]};
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })).newPage();
await p.goto('https://carecraft.healthcarecrownacademy.co.uk/', {waitUntil:'domcontentloaded'}); await p.waitForTimeout(4500);
async function shot(name, sels={}){ console.log('shot',name); const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); const r={}; for(const [k,l] of Object.entries(sels)){ const b=await l.boundingBox({timeout:400}).catch(()=>null); if(b) r[k]=[b.x,b.y,b.width,b.height]; } meta.shots.push({name,file:f,rects:r}); }
const dlg = p.locator('body');
const optB = dlg.locator('button').filter({hasText:/So I know I.ve explained/}).filter({visible:true}).first();
const optA = dlg.locator('button').filter({hasText:/printed discharge/}).filter({visible:true}).first();
const optC = dlg.locator('button').filter({hasText:/Summarise the three/}).filter({visible:true}).first();
await shot('s0');
await p.mouse.move(720,647,{steps:6}); await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(1800); await shot('s1');
await p.waitForTimeout(1500); console.log('TXT', await p.evaluate(()=>{ const d=[...document.querySelectorAll('[role=dialog],dialog,[aria-modal=true]')].find(e=>/working day/.test(e.innerText)); return d? d.innerText.replace(/\n+/g,' | ').slice(0,1500):'none'; }));
await p.mouse.move(720,500); await p.mouse.wheel(0,500); await p.waitForTimeout(1000); await shot('s2');
await p.mouse.wheel(0,600); await p.waitForTimeout(1000); await shot('s3');
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1)); await br.close();
