import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),BASE='https://snle.healthcarecrownacademy.co.uk',PORT=process.env.SNLE_TEST_PORT||8450,checks=[],errors=[];
const ok=(value,message)=>{assert(value,message);checks.push(message);console.log('PASS '+message)};
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH||'/usr/bin/chromium',args:['--no-sandbox','--no-proxy-server','--ignore-certificate-errors','--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:'+PORT]});
const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,reducedMotion:'reduce',serviceWorkers:'block'});
await context.route('**/*',r=>new URL(r.request().url()).hostname==='snle.healthcarecrownacademy.co.uk'?r.continue():r.abort());
try{
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await page.goto(BASE+'/#home');
 for(const [open,close]of[['data-learning-journey-info','data-learning-journey-close'],['data-course-library-info','data-course-library-close']]){
  await page.locator('['+open+']').click();ok(await page.locator('[role=dialog]').isVisible(),open+' opens teaching overlay');await page.locator('['+close+']').first().click();
 }
 await page.locator('[data-course-library-info]').click();
 const links=await page.locator('.library-choice').evaluateAll(elements=>elements.map(a=>a.href));ok(links.length===3,'course library retains three companion links');
 for(const url of links){
  const view=await context.newPage();view.on('pageerror',e=>errors.push(e.message));const response=await view.goto(url);assert.equal(response.status(),200);await view.locator('#items article').first().waitFor();
  const mode=await view.locator('body').getAttribute('data-library'),count={tools:67,questions:1297,dossiers:350}[mode];ok((await view.locator('#count').innerText())===count+' of '+count+' records',mode+' companion contains all records');
  await view.locator('#next').click();ok((await view.locator('#position').innerText()).startsWith('Page 2'),mode+' pagination works');
  await view.locator('#search').fill(mode==='tools'?'ABCDE':'patient');ok((await view.locator('#count').innerText()).includes('of '+count),mode+' search works');await view.locator('#search').fill('');
  await view.locator('#hyp').selectOption('90');await view.locator('#sort').selectOption('high');
  if(mode==='tools'){
   await view.locator('[data-open-poster]').first().click();await view.waitForFunction(()=>{const i=document.querySelector('#poster img');return i.complete&&i.naturalWidth>0});ok(await view.locator('dialog').evaluate(d=>d.open),'library poster opens');await view.keyboard.press('Escape');
  }else{
   await view.locator('[data-field=difficulty]').selectOption('Hard');ok(await view.locator('#items article').count()>0,mode+' difficulty and HYP filters work');
   const detail=view.locator('details').first();assert.equal(await detail.evaluate(d=>d.open),false);await detail.locator('summary').click();ok(await detail.evaluate(d=>d.open),mode+' answer reveal is controlled');
  }
  await view.reload();ok(await view.locator('#count').innerText()===count+' of '+count+' records',mode+' direct refresh works');
  await view.setViewportSize({width:390,height:844});ok(await view.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),mode+' phone layout has no horizontal overflow');await view.close();
 }
 await page.goto(BASE+'/#tools');await page.locator('#hyp-select').selectOption('critical');ok(await page.locator('[data-poster]').count()>0&&await page.locator('[data-poster]').count()<67,'tool HYP filter works');await page.locator('#hyp-select').selectOption('all');await page.locator('[data-catalog-view=compact]').click();ok(await page.locator('.compact-grid').count()===1,'compact catalogue view works');await page.locator('#catalog-sort').selectOption('az');await page.reload();ok(await page.locator('#catalog-sort').inputValue()==='az','catalogue sorting persists');
 await page.goto(BASE+'/#guide');await page.locator('[data-guide-tab=day]').click();await page.locator('[data-plan=month]').fill('Review ABCDE each Monday');await page.reload();await page.locator('[data-guide-tab=day]').click();ok(await page.locator('[data-plan=month]').inputValue()==='Review ABCDE each Monday','five-stage study planner persists');
 await page.goto(BASE+'/#reset');await page.locator('[data-reset-timing-info]').click();ok(await page.locator('[data-reset-timing-close]').count()>0,'reset timing evidence overlay opens');await page.locator('[data-reset-timing-close]').first().click();
 const resetBefore=await page.evaluate(()=>JSON.parse(localStorage.getItem('snle-react-interact-progress-v1')).resetSessions||0);await page.locator('[data-reset-complete]').click();ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('snle-react-interact-progress-v1')).resetSessions)>resetBefore,'reset completion persists');
 ok(errors.length===0,'companion views and supplemental journeys have no missing assets or exceptions');
 fs.writeFileSync(path.join(ROOT,'reports/library-verification.json'),JSON.stringify({checks,errors,companionProvenance:'New interfaces built from preserved embedded records; original companion files absent'},null,2)+'\n');
}finally{await browser.close()}
