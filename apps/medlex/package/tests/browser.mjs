import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright-core';
import c from '@sparticuz/chromium';
const phase=process.argv[2]||'after';
const baseline=process.env.MEDLEX_BASELINE||path.resolve('tests/fixtures/MedLex-before.html');
const file=phase==='before'?baseline:path.resolve('dist/MedLex.html');
const out=process.env.MEDLEX_QA_OUTPUT||path.resolve('tests/output/browser');
fs.mkdirSync(`${out}/${phase}`,{recursive:true});
const b=await chromium.launch({executablePath:process.env.MEDLEX_CHROMIUM||await c.executablePath(),args:c.args,headless:true});
const page=await b.newPage({reducedMotion:'reduce'}),errors=[],results=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
 const NativeDate=Date; const fixed=Date.UTC(2026,9,16,12);
 window.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[fixed]));} static now(){return fixed;}};
 let n=12345;Math.random=()=>((n=(1103515245*n+12345)>>>0)/4294967296);
});
await page.goto('file://'+file);await page.waitForTimeout(400);
const evaluate=code=>page.evaluate(code=>window.__MEDLEX_TEST__?window.__MEDLEX_TEST__.evaluate(code):(0,eval)(code),code);
// Production is exercised through its actual controls and hash routes.
await page.locator('dialog[open] [data-action=close]').first().click({timeout:1000}).catch(()=>{});
await page.keyboard.press('Escape');
const routes=['today','learn','explore/terms','explore/elements','explore/lab','practice','progress','tools','settings',...['outline','outcomes','bank','practice','classroom','independent','references'].map(t=>'learn/module/ch1/'+t),...['hub','adaptive','clinical','explain','confusions','matching','atlas','pronunciation','coding','educator','portfolio','editor'].map(s=>'studio/'+s)];
await page.addScriptTag({path:path.resolve('node_modules/axe-core/axe.min.js')});
for(const theme of ['light','dark'])for(const width of [390,1440]) {
 await page.setViewportSize({width,height:width===390?844:900});
 // Theme settings are persisted and applied by the actual application startup.
 await page.evaluate(theme=>{const d=JSON.parse(localStorage.getItem('medlex-v3'));d.profile.theme=theme;d.profile.reducedMotion=true;if(d.expansion?.onboarding)d.expansion.onboarding.done=true;localStorage.setItem('medlex-v3',JSON.stringify(d));},theme);
 await page.reload();await page.waitForTimeout(150);await page.keyboard.press('Escape');
 await page.addScriptTag({path:path.resolve('node_modules/axe-core/axe.min.js')});
 for(const route of routes){
  await page.evaluate(route=>{location.hash=route},route);await page.waitForTimeout(100);await page.keyboard.press('Escape');
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,text:document.querySelector('main').innerText,rects:[...document.querySelector('main').children].map(e=>({tag:e.tagName,class:e.className,rect:['x','y','width','height'].map(k=>Math.round(e.getBoundingClientRect()[k]*100)/100)}))}));
  const audit=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
  const violations=audit.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}));
  const name=`${route.replaceAll('/','-')}-${width}-${theme}`;
  await page.screenshot({path:`${out}/${phase}/${name}.png`,fullPage:true,animations:'disabled'});
  results.push({name,route,theme,width,...layout,violations});
  if(layout.overflow||violations.length)console.log(name,JSON.stringify({overflow:layout.overflow,violations}));
 }
}
fs.writeFileSync(`${out}/${phase}.json`,JSON.stringify({errors,results},null,2));
await b.close();
console.log(phase,results.length,'screenshots; errors:',errors.length);
if(errors.length||results.some(r=>r.overflow||r.violations.length))process.exitCode=1;
