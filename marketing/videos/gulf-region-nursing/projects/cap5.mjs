import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const OUT='g/cap'; const meta={shots:[]};
const br = await chromium.launch(); const p=await (await br.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2})).newPage(); p.setDefaultTimeout(6000);
async function shot(name){ const f=`${OUT}/${name}.png`; await p.screenshot({path:f}); meta.shots.push({name,file:f,rects:{}}); console.log(name); }
await p.goto('https://snle.healthcarecrownacademy.co.uk/',{waitUntil:'networkidle'}); await p.waitForTimeout(2000);
await p.getByRole('button',{name:'React & Interact',exact:true}).first().click(); await p.waitForTimeout(2000);
await p.locator('main button').filter({hasText:'BE-FAST'}).first().click(); await p.waitForTimeout(2500);
await p.getByRole('button',{name:'Poster + annotate'}).first().click(); await p.waitForTimeout(2500);
const drag=async(pts)=>{ await p.mouse.move(...pts[0]); await p.mouse.down(); for(const q of pts.slice(1)) await p.mouse.move(...q,{steps:6}); await p.mouse.up(); await p.waitForTimeout(400); };
await p.getByRole('button',{name:/Highlight/}).last().click(); await p.waitForTimeout(400);
await drag([[505,432],[905,432]]); await shot('n-ann1');
await p.getByRole('button',{name:/Pen/}).last().click(); await p.waitForTimeout(400);
const ell=(cx,cy,rx,ry)=>{const c=[]; for(let a=0;a<=60;a++) c.push([cx+rx*Math.cos(a/60*6.45),cy+ry*Math.sin(a/60*6.45)]); return c;};
await drag(ell(275,375,215,72)); await drag(ell(520,575,205,52));
await shot('n-ann2');
console.log((await p.locator('[role=dialog]').last().innerText()).match(/Auto-saved[^|\n]*/));
fs.writeFileSync(`${OUT}/meta5.json`, JSON.stringify({wide:meta},null,1)); await br.close();
