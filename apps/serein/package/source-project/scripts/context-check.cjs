const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const dist=path.join(__dirname,'../dist');let errors=[],checks=0;
const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8').replace(/<script src="[^"]+"><\/script>/g,'');
const dom=new JSDOM(html,{url:'https://serein.example/index.html',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
const w=dom.window;w.structuredClone=structuredClone;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});
w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};w.HTMLCanvasElement.prototype.getContext=()=>null;
for(const f of ['data.js','engine.js','orb.js','advance-data.js','advance.js','context-data.js','context-info.js','app.js'])w.eval(fs.readFileSync(path.join(dist,f),'utf8'));
const app=w.SereinApp,C=app.contexts,$=s=>w.document.querySelector(s),$$=s=>[...w.document.querySelectorAll(s)];
const click=s=>{assert($(s),'Missing '+s);$(s).click();},delay=n=>new Promise(r=>setTimeout(r,n));
const escape=()=>w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
const hover=el=>el.dispatchEvent(new w.MouseEvent('mouseover',{bubbles:true,relatedTarget:w.document.body}));
async function main(){
 // The quiet default applies throughout the app, on keyboard and mouse alike.
 for(const view of ['today','practices','studios','journeys','reflect','space','support']){
  app.navigate(view);assert.equal($$('[data-context-info],.context-trigger,.info-tab-item,.moment-info-shell,.has-context-info').length,0);
  assert.equal($$('#desktop-nav [data-nav]').length,7);assert.equal($$('#sidebar [data-context-open],#sidebar [data-context-tip],#mobile-nav [data-context-open],#mobile-nav [data-context-tip]').length,0);
  for(const el of [$('#main .page-header'),$('#desktop-nav [data-nav]'),...$$('#main [data-tab],#main .card-open,#main [data-space-tab]')]){hover(el);if(el.matches('button'))el.focus();}
  await delay(260);assert.equal(C.active,null);assert.equal(C.tooltip,null);assert(!$('button button'));checks++;
 }
 // Only labeled click controls open extended details. Merely focusing them does not.
 app.navigate('studios');assert.equal($$('.studio-card .studio-when').length,6);assert.equal($$('.studio-card [data-context-open]').length,6);
 for(const s of w.SEREIN_ADVANCE_DATA.studios){const card=$(`[data-adv="studio"][data-id="${s.id}"]`).closest('article');assert(card.querySelector('.studio-when').textContent.includes(s.when));const b=card.querySelector('[data-context-open]');assert.equal(b.textContent,'How it works');hover(card);hover(b);b.focus();await delay(260);assert.equal(C.active,null);b.click();assert(C.active);assert.equal(C.active.getAttribute('aria-modal'),'false');assert(C.active.textContent.includes(s.who));assert.equal(C.active.querySelectorAll('dt').length,5);assert.equal(C.active.querySelectorAll('.context-fact').length,0);assert(!$('#modal').open);assert.equal(app.state.session,null);assert.equal(w.document.activeElement,C.active.querySelector('[data-context-close]'));escape();assert.equal(C.active,null);assert.equal(w.document.activeElement,b);assert.equal(b.getAttribute('aria-expanded'),'false');checks++;}
 // A click panel remains available while reading and dismisses without navigation.
 let b=$('[data-context-open]');b.click();let panel=C.active;panel.dispatchEvent(new w.MouseEvent('mouseout',{bubbles:true,relatedTarget:w.document.body}));await delay(300);assert.equal(C.active,panel);assert(panel.querySelector('.context-sources a'));assert(!panel.querySelector('[data-context-pin]'));click('[data-context-close]');assert.equal(app.state.view,'studios');checks++;
 // Studio guidance is actual content before the first question; drafts survive details.
 click('[data-adv="studio"][data-id="support"]');assert($('#modal-content .studio-intro'));assert($('#modal-content .studio-intro').textContent.includes(C.get('studio:support').answers[2]));assert(!$('#modal .dialog-head [data-context-open]'));$('#studio-field-0').value='A practical request';const sourceDetails=$('.studio-about');assert.equal(sourceDetails.querySelector('summary').textContent,'Background & sources');sourceDetails.querySelector('summary').click();assert(sourceDetails.open);assert.equal($('#studio-field-0').value,'A practical request');click('[data-action="close-modal"]');checks++;
 // Journey outlines are native click disclosures; learning is still explicitly chosen.
 app.navigate('journeys');assert.equal($$('.journey-outline').length,3);for(const outline of $$('.journey-outline')){assert(!outline.open);outline.querySelector('summary').click();assert(outline.open);assert.equal(outline.querySelectorAll('li').length,5);assert(!$('#modal').open);assert.equal(C.active,null);checks++;}
 // Each guide places why/when beside its content. Evidence is a deliberate separate click.
 app.state.tab='guides';app.navigate('practices');for(const r of w.SEREIN_DATA.resources){click(`[data-resource="${r.id}"]`);assert($('#modal-content .context-reading-note'));assert($('#modal-content .context-reading-note').textContent.includes(C.get('resource:'+r.id).answers[2]));b=$('#modal-content [data-context-open]');b.focus();hover(b);await delay(260);assert.equal(C.active,null);b.click();assert.equal(C.active.closest('dialog'),$('#modal'));assert(C.active.querySelector('.context-sources a'));assert.equal(C.active.querySelectorAll('.context-fact').length,C.get('resource:'+r.id).facts.length);escape();assert($('#modal').open);assert.equal(w.document.activeElement,b);assert.equal(C.active,null);click('[data-action="close-modal"]');checks++;}
 // Relevant statistics are visible in Support, with year, population, source and limits.
 app.navigate('support');const evidence=$('.context-evidence-section');assert(evidence);assert.equal(evidence.querySelectorAll('.context-fact').length,2);assert(evidence.textContent.includes('2022'));assert(evidence.textContent.includes('2023'));assert(evidence.textContent.includes('U.S. health workers'));assert(evidence.textContent.includes('not a current local rate'));assert(!C.active);b=evidence.querySelector('[data-context-open]');b.click();assert(C.active.textContent.includes('2018 and 2022'));assert(C.active.querySelector('a[href^="https://www.cdc.gov/"]'));assert(C.active.querySelector('.context-comparison b').style.width.endsWith('%'));C.close();checks++;
 // Practices retain their existing deliberate About flow and source scope.
 app.state.tab='practices';app.navigate('practices');assert($$('.practice-card').length>0);assert.equal($$('.practice-card [data-adv="evidence"]').length,$$('.practice-card').length);assert.equal($$('.practice-card [data-context-open]').length,0);click('.practice-card [data-adv="evidence"]');assert($('#modal-content .evidence-grid'));assert.equal(C.active,null);assert.equal(app.state.session,null);click('[data-action="close-modal"]');checks++;
 // Brief help lives beside four ambiguous labels, never inside their click target.
 app.openPractice('box');assert.equal($$('#player [data-context-tip]').length,4);assert(!$('#player label button'));assert(!$('#player .player-head [data-context-open]'));assert.equal(C.active,null);
 const input=$('#session-noholds'),initial=input.checked;const tip=$('[data-context-tip="session-noholds"]');tip.focus();assert(C.tooltip);assert.equal(C.tooltip.getAttribute('role'),'tooltip');assert.equal(C.tooltip.closest('dialog'),$('#player'));assert(C.tooltip.textContent.includes('Removes the timed pauses'));assert.equal(C.tooltip.querySelectorAll('button,a,.context-fact').length,0);assert.equal(input.checked,initial);assert.equal(C.active,null);assert.equal(tip.getAttribute('aria-describedby'),C.tooltip.id);escape();assert.equal(C.tooltip,null);assert(!tip.hasAttribute('aria-describedby'));assert($('#player').open);checks++;
 // Hover tooltips are small and stay readable when crossing into the text bubble.
 tip.blur();hover(tip);await delay(270);assert(C.tooltip);let bubble=C.tooltip;tip.dispatchEvent(new w.MouseEvent('mouseout',{bubbles:true,relatedTarget:bubble}));hover(bubble);await delay(210);assert.equal(C.tooltip,bubble);bubble.dispatchEvent(new w.MouseEvent('mouseout',{bubbles:true,relatedTarget:w.document.body}));await delay(220);assert.equal(C.tooltip,null);checks++;
 // Touch/click gives the same explanation without toggling a setting or starting.
 tip.click();assert(C.tooltip);assert.equal(input.checked,initial);assert.equal(app.state.session.state,'ready');escape();click('[data-action="exit-player"]');assert.equal(C.tooltip,null);checks++;
 // Writing, moving tabs and changing results never summons unrelated help.
 app.navigate('reflect');$('#journal-draft').focus();$('#journal-draft').value='Words stay in context';await delay(10);assert.equal(C.active,null);assert.equal(C.tooltip,null);checks++;
 app.navigate('studios');click('[data-context-open]');app.navigate('practices');assert.equal(C.active,null);$('#practice-query').value='body';$('#practice-query').dispatchEvent(new w.Event('input',{bubbles:true}));await delay(10);assert.equal($$('.practice-card [data-context-open]').length,0);assert($$('.practice-card').length);checks++;
 // Closing a native reading dialog removes its detail panel as well.
 app.state.tab='guides';app.navigate('practices');click('[data-resource="sleep"]');click('#modal-content [data-context-open]');assert(C.active);$('#modal').close();assert.equal(C.active,null);checks++;
 for(const f of Object.values(w.SEREIN_CONTEXT_DATA.facts)){if(f.source){const s=w.SEREIN_CONTEXT_DATA.sources[f.source];assert(s.url.startsWith('https://'));assert(s.population&&s.period&&s.limit);}if(f.number!==undefined)assert(f.number>=0&&f.number<=100);checks++;}
 assert.deepEqual(errors,[]);dom.window.close();console.log(`${checks} information-design checks passed: quiet navigation/cards/tabs, visible guidance, click details, journey disclosures, contextual evidence, draft preservation, brief setting tips, keyboard/touch dismissal and focus restoration.`);
}
main().catch(e=>{console.error(e);dom.window.close();process.exit(1)});
