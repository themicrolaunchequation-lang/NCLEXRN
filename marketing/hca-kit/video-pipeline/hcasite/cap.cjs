const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('node:fs');
const OUT='hcasite/cap', meta={shots:[]};
(async () => {
const br = await chromium.launch();
const ctx = await br.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
await ctx.addInitScript(()=>{ let s=777; Math.random=()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;}; });
const p = await ctx.newPage();
await p.goto('https://healthcarecrownacademy.co.uk/', {waitUntil:'networkidle', timeout:90000});
await p.waitForTimeout(4000);
await p.addStyleTag({content:`
  *{caret-color:transparent!important}
  html,body,*{scroll-behavior:auto!important}
  .chp-panel,[class*=crown-help],[class*=askus],[class*=ask-us],[id*=chp]{display:none!important}
`});
await p.evaluate(()=>{
  const kill=[];
  document.querySelectorAll('*').forEach(e=>{
    const t=(e.textContent||'').trim();
    if(t==='Ask us'||/^Crown Help/.test(t)) kill.push(e);
  });
  kill.forEach(e=>{let n=e; for(let i=0;i<6&&n;i++){const cs=getComputedStyle(n);
    if(cs.position==='fixed'){n.style.display='none';return} n=n.parentElement;}
    e.style.display='none';});
});
await p.waitForTimeout(600);

async function shot(name, sels={}){
  const f=`${OUT}/${name}.png`;
  await p.screenshot({path:f});
  const r={};
  for (const [k,loc] of Object.entries(sels)) {
    const b = await loc.boundingBox({timeout:500}).catch(()=>null);
    if (b) r[k]=[b.x,b.y,b.width,b.height];
  }
  meta.shots.push({name,file:f,rects:r});
  console.log('shot', name, Object.keys(r).join(','));
}
const dot = n => p.locator('button').filter({hasText:new RegExp('^\\s*'+n+'\\s*$')}).first();
const cta = p.locator('a,button').filter({hasText:/Start free/}).first();
const pass = p.locator('a,button').filter({hasText:/Crown Pass/}).first();

// ---- Act 1: the crown story, scenes 00-05
for (const n of ['00','01','02','03','04','05']) {
  await dot(n).click({force:true, timeout:6000}).catch(e=>console.log('dot miss',n));
  await p.waitForTimeout(2600);                       // let the 3D settle
  await shot('s'+n, n==='00' ? {cta, pass} : {});
  // two extra rotation frames for the hero and the jewels, for a flipbook
  if (n==='00' || n==='02') {
    for (let k=1;k<=2;k++){ await p.waitForTimeout(900); await shot('s'+n+'r'+k); }
  }
}

// ---- Act 2: orientation on the apps
const go = async (sel, pause=1600) => { await p.evaluate(s=>{const e=document.querySelector(s); if(e) e.scrollIntoView({block:'start'});}, sel); await p.waitForTimeout(pause); };
await go('#after');  await shot('after');
await go('#start');  await shot('start');
await go('#apps');   await shot('apps');
await p.mouse.wheel(0,700); await p.waitForTimeout(1200); await shot('apps2');
await p.mouse.wheel(0,700); await p.waitForTimeout(1200); await shot('apps3');
await go('#proof');  await shot('proof');

// the Apps menu lists every jewel with its one-word job
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(1200);
await p.locator('header button,header a').filter({hasText:/^Apps$/}).first().click({force:true,timeout:6000}).catch(e=>console.log('menu miss'));
await p.waitForTimeout(1400); await shot('menu');

console.log('\nAPPS SECTION TEXT:\n', (await p.evaluate(()=>{const e=document.querySelector('#apps'); return e?e.innerText.replace(/\n+/g,' | ').slice(0,700):'none'})));
console.log('\nAFTER TEXT:\n', (await p.evaluate(()=>{const e=document.querySelector('#after'); return e?e.innerText.replace(/\n+/g,' | ').slice(0,400):'none'})));
console.log('\nPROOF TEXT:\n', (await p.evaluate(()=>{const e=document.querySelector('#proof'); return e?e.innerText.replace(/\n+/g,' | ').slice(0,400):'none'})));

fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({wide:meta},null,1));
await br.close();
})();
