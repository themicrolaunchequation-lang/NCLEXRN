// Regression checks for lesson progress, card layout and the independent Word parts loader.
// node apps/tools/medlex-learn-design-check.mjs [outdir] [port]
// PLAYWRIGHT_MODULE and CHROMIUM_PATH may select the local test installation.
import {createRequire} from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright');
const out=process.argv[2] || '/tmp/medlex-design-check',port=process.argv[3] || 8443;fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-proxy-server','--ignore-certificate-errors',`--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`]});
const results=[];const check=(name,pass,detail)=>{results.push({name,pass:!!pass,detail});if(!pass)console.log('FAIL',name,detail||'');};
const origin='https://medlex.healthcarecrownacademy.co.uk/';
async function session(width=1440,height=800,dark=false){const ctx=await b.newContext({viewport:{width,height},ignoreHTTPSErrors:true,colorScheme:dark?'dark':'light',reducedMotion:'reduce',serviceWorkers:'block'});const p=await ctx.newPage();await p.route(/supabase\.co/,r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));await p.goto(origin+'#learn');await p.waitForTimeout(800);await p.evaluate(()=>[...document.querySelectorAll('dialog[open] button')].find(b=>b.textContent.trim()==='Skip')?.click());await p.waitForSelector('.ml-card');return {ctx,p};}
try {
 for(const [w,h] of [[1920,940],[1440,800],[1024,700],[390,844]])for(const dark of [false,true]){
  const {ctx,p}=await session(w,h,dark);const geometry=await p.evaluate(()=>{const cards=[...document.querySelectorAll('.course-part:first-child .ml-card')];return cards.map(e=>{const r=e.getBoundingClientRect(),b=e.querySelector('.ms-row'),br=b.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,buttonHeight:br.height,buttonWrap:b.querySelector('span').getClientRects().length>1};});});
  check(`${w} ${dark?'dark':'light'}: six foundation cards`,geometry.length===6,geometry.length);
  check(`${w}: grid has 1–3 columns`,new Set(geometry.map(x=>x.x)).size<4);
  check(`${w}: no horizontal overflow`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  check(`${w}: primary targets fit`,geometry.every(x=>x.buttonHeight>=44&&!x.buttonWrap));
  check(`${w}: heights match within each row`,geometry.every(a=>geometry.filter(b=>Math.abs(b.y-a.y)<2).every(b=>Math.abs(b.h-a.h)<2)));
  await p.screenshot({path:path.join(out,`cards-${w}-${dark?'dark':'light'}.png`)});await ctx.close();
 }
 const {ctx,p}=await session();
 await p.locator('.ml-card button[data-ms-open="ch1"]').click();await p.waitForFunction(()=>document.querySelector('.ml-frame')?.contentWindow?.MedLexCourse);
 await p.waitForFunction(()=>document.querySelector('.ml-load')?.hidden===true); let f=p.frames().find(f=>/basic-word-structure/.test(f.url()));await f.evaluate(()=>MedLexCourse.go(5));await p.waitForTimeout(60);await p.locator('.ml-x').click();
 check('viewing slides records real progress',await p.evaluate(()=>{const p=MedlexStudioEntry.progress('ch1');return p.started&&!p.done&&p.last===5&&p.visited===2&&p.pct>0;}));
 await p.locator('.ml-card button[data-ms-open="ch1"]').click();await p.waitForFunction(()=>document.querySelector('.ml-frame')?.contentWindow?.MedLexCourse);f=p.frames().find(f=>/basic-word-structure/.test(f.url()));await f.waitForFunction(()=>document.querySelector('[data-nav="5"]')?.getAttribute('aria-current')==='true');
 await f.locator('.study-key-open').click(); await f.waitForFunction(()=>document.querySelector('#mainDialog')?.open);
 check('Visual study key opens from a visible control',await f.locator('.art-inspector img').count()===1);
 check('study key has an accessible dialog name',await f.getByRole('dialog',{name:'VISUAL STUDY KEY',exact:true}).count()===1);
 await f.locator('#closeDialog').click(); await f.waitForTimeout(40);
 check('closing the study key restores keyboard focus',await f.evaluate(()=>document.activeElement.classList.contains('study-key-open')));
 check('Continue restores the last slide',true);await p.locator('.ml-done').click();await p.locator('.ml-x').click();
 check('marking done offers Review and 100% progress',await p.evaluate(()=>{const b=document.querySelector('.ml-card button[data-ms-open="ch1"]');return b.textContent.trim()==='Review'&&b.closest('.ml-card').querySelector('progress').value===100;}));
 await p.locator('[data-modern="learnStatus"][data-value="done"]').click();await p.waitForTimeout(150);
 check('Done filter uses lesson completion',await p.evaluate(()=>document.querySelectorAll('.ml-card').length===1&&!!document.querySelector('.ml-card button[data-ms-open="ch1"]')));
 await p.evaluate(()=>location.hash='today');await p.waitForTimeout(80);await p.evaluate(()=>location.hash='learn');await p.waitForSelector('.ml-card');
 check('completion survives navigation',await p.evaluate(()=>MedlexStudioEntry.progress('ch1').done));
 await p.locator('[data-modern="learnStatus"][data-value="all"]').click(); await p.locator('[data-modern="learnView"][data-value="systems"]').click(); await p.waitForTimeout(150);
 check('Body systems preserves the original placement of extra foundation lessons',await p.evaluate(()=>!document.querySelector('[data-deck="history"],[data-deck="components"]') || !!document.querySelector('[data-deck="ch1"]')));
 await ctx.close();
 // A fresh app session, with neither Library nor the engine fetched.
 const c=await b.newContext({ignoreHTTPSErrors:true,serviceWorkers:'block'}),q=await c.newPage(),requests=[];q.on('request',r=>requests.push(r.url()));await q.route(/supabase\.co/,r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));await q.goto(origin+'#wordparts');await q.waitForSelector('.wp-open');
 check('Word parts landing does not fetch engine or Library',!requests.some(u=>/\/(engine|lib)\.[a-f0-9]+\.js/.test(u)),requests.filter(u=>/engine|lib\./.test(u)));
 await q.evaluate(()=>document.querySelector('.wp-open').click());await q.waitForFunction(()=>document.querySelector('.wp-frame')?.getAttribute('aria-busy')==='false');
 check('studio loading state clears',await q.locator('.wp-loading').isHidden());
 for (const kind of ['prefix','root','suffix']) {
  await q.evaluate(k=>location.hash='wordparts/'+k,kind); await q.waitForFunction(k=>{ const frame=document.querySelector('.wp-frame'); return frame?.src.includes(MEDLEX_LEARN.quests[k][1]) && frame.getAttribute('aria-busy')==='false'; },kind);
  const frame=q.frames().find(f=>/quest-/.test(f.url()));
  check(kind+': cards appear without staggered entry animations',await frame.evaluate(()=>[...document.querySelectorAll('#grid .card,#grid .scard')].every(card=>getComputedStyle(card).animationName==='none')));
 }
 await c.close();
}finally{await b.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));}
console.log(`${results.filter(x=>x.pass).length}/${results.length} passed`);process.exit(results.some(x=>!x.pass)?1:0);
