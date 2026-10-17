'use strict';
const {setup,wait,settle,errors,cleanup}=require('./test-harness.cjs');
const assert=require('assert/strict'),fs=require('fs'),path=require('path');
let checks=0;const ok=(value,message)=>{assert(value,message);checks++},eq=(a,b)=>{assert.equal(a,b);checks++};
(async()=>{
 const x=setup();
 eq(x.S.infographicCards.length,12);eq(new Set(x.S.infographicCards.map(c=>c.id)).size,12);
 const links=x.$$('#desktop-nav [data-nav]').map(b=>b.dataset.nav);
 eq(links[links.indexOf('toolkit')+1],'infographics');
 ok(!x.$('#desktop-nav [data-nav="infographics"]').hasAttribute('title'));
 eq(x.$$('#mobile-nav button').length,5);ok(x.$('#mobile-nav [data-nav="me/saved"]'));ok(x.$('#mobile-nav [data-nav="support"]'));
 const saved=x.w.localStorage.getItem('serein-hca-v3');
 x.app.navigate('infographics');
 eq(x.S.router.current.view,'infographics');eq(x.$$('main .ig-thumb').length,12);eq(x.$('[data-ig="previous"]').disabled,true);eq(x.$('[data-ig="next"]').disabled,false);
 for(const c of x.S.infographicCards){
  x.app.navigate('infographics/'+c.id);eq(x.$('#ig-reading-title').textContent,c.title);ok(x.$('#ig-image').getAttribute('alt').includes(c.title));
  const image=fs.readFileSync(path.join(__dirname,'../dist',c.image));eq(image.toString('ascii',0,4),'RIFF');eq(image.toString('ascii',8,12),'WEBP');ok(c.image.endsWith('.webp'));ok(c.width>=1000&&c.height>=1400);const thumb=fs.readFileSync(path.join(__dirname,'../dist',c.thumbnail));ok(thumb.length<image.length/5);ok(x.$('main a[download]').download.endsWith('.webp'));
  ok(x.$('main details.ig-source').textContent.includes(c.limit));
  const ids=x.$$('[id]').map(el=>el.id);eq(new Set(ids).size,ids.length);
 }
 eq(x.$('[data-ig="next"]').disabled,true);x.click('[data-ig="previous"]');eq(x.S.router.current.tab,'end-shift');
 x.app.navigate('infographics/pressure-at-work');const next=x.$('[data-ig="next"]');next.focus();x.click('[data-ig="next"]');eq(x.S.router.current.tab,'gentle-breathing');eq(x.w.document.activeElement,next);
 next.dispatchEvent(new x.w.KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));eq(x.S.router.current.tab,'privacy-choices');eq(x.w.document.activeElement,x.$('[data-ig="previous"]'));
 next.dispatchEvent(new x.w.KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));eq(x.S.router.current.tab,'pressure-at-work');
 x.click('[data-ig="filter"][data-value="Reset"]');eq(x.$$('main .ig-thumb').length,3);eq(x.S.router.current.tab,'gentle-breathing');
 x.click('[data-ig="next"]');eq(x.S.router.current.tab,'five-senses');x.click('[data-ig="next"]');eq(x.S.router.current.tab,'micro-breaks');eq(x.$('[data-ig="next"]').disabled,true);
 x.click('[data-ig="filter"][data-value="Privacy"]');eq(x.$$('main .ig-thumb').length,1);eq(x.S.router.current.tab,'privacy-choices');eq(x.$('[data-ig="previous"]').disabled,true);eq(x.$('[data-ig="next"]').disabled,true);
 x.app.navigate('infographics/five-senses');eq(x.$$('main .ig-thumb').length,12);eq(x.$('[data-ig="filter"][data-value="All"]').getAttribute('aria-pressed'),'true');
 x.click('[data-ig="zoom"]');ok(x.$('#modal').open);ok(x.$('#modal').classList.contains('ig-zoom-dialog'));ok(x.$('#modal .ig-zoom img'));ok(x.$('#modal .ig-zoom-image-wrap[tabindex="0"]'));x.click('[data-action="close-modal"]');eq(x.$('#modal').open,false);ok(!x.$('#modal').classList.contains('ig-zoom-dialog'));
 const pointer=(type,coords)=>{const e=new x.w.Event(type,{bubbles:true});Object.assign(e,{pointerId:9,pointerType:'touch',isPrimary:true,...coords});x.$('.ig-artwork').dispatchEvent(e);};
 pointer('pointerdown',{clientX:300,clientY:100});pointer('pointerup',{clientX:100,clientY:110});eq(x.S.router.current.tab,'micro-breaks');
 x.$('.ig-artwork').dispatchEvent(new x.w.MouseEvent('click',{bubbles:true,detail:1}));eq(x.$('#modal').open,false);
 pointer('pointerdown',{clientX:100,clientY:100});pointer('pointerup',{clientX:110,clientY:350});eq(x.S.router.current.tab,'micro-breaks');
 x.app.navigate('infographics/not-a-card');eq(x.S.router.current.tab,'');eq(x.$('#ig-reading-title').textContent,x.S.infographicCards[0].title);
 x.click('[data-action="search"]');x.S.search.run('privacy');ok(x.$('[data-kind="infographic"][data-id="privacy-choices"]'));x.click('[data-kind="infographic"][data-id="privacy-choices"]');eq(x.S.router.current.tab,'privacy-choices');
 // Reading itself never creates journal/feedback/retention records. Search history is an existing explicit preference.
 const updated=JSON.parse(x.w.localStorage.getItem('serein-hca-v3'));eq(updated.journals.length,0);eq(updated.checkins.length,0);eq(updated.feedback.length,0);
 x.app.navigate('toolkit');ok(x.$('main a[href="#infographics"]'));x.click('#desktop-nav [data-nav="infographics"]');eq(x.S.router.current.view,'infographics');
 const offline=JSON.parse(fs.readFileSync(path.join(__dirname,'../dist/offline-assets.json'),'utf8'));for(const card of x.S.infographicCards){ok(offline.files.includes('./'+card.image));ok(offline.files.includes('./'+card.thumbnail));}
 ok(offline.files.includes('./infographics.js'));ok(offline.files.includes('./infographics-data.js'));
 const prompts=fs.readFileSync(path.join(__dirname,'../INFOGRAPHICS-PROMPTS.md'),'utf8');eq((prompts.match(/^\/infographics:/gm)||[]).length,12);
 x.app.store.preferences.motion=true;let animations=0;x.w.Element.prototype.animate=()=>animations++;x.click('[data-ig="next"]');eq(animations,0);
 ok(!fs.readdirSync(path.join(__dirname,'../dist/assets/infographics')).some(n=>n.endsWith('.svg')));
 eq(errors.length,0);x.close();cleanup();console.log(checks+' infographic checks passed: routes, branding, content, filters, keyboard, swipe, zoom, privacy and offline assets.');
})().catch(e=>{cleanup();console.error(e);process.exitCode=1});
