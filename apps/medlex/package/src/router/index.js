import{closeWelcomeGuide}from'../features/today/welcome.js';
import{renderInfographics,closeInfographicViewer}from'../features/infographics/index.js';
import{renderDailySession}from'../features/practice/daily.js';
import {ROUTES,REDIRECTS,STUDIO_REDIRECTS,MODULE_TAB_REDIRECTS} from './routes.js';
import {COURSE_MODULES}from'../data/index.js';
import{moduleCard,renderAffixes,renderToolkit}from'../features/learn/index.js';
import{wordlab}from'../features/library/resources.js';
import{modernToday,modernLearn,modernModule,modernPractice,modernProgress,modernLibrary,modernTerm,modernSettings,modernTeach,modernParts,modernPart}from'../features/modern/views.js';
import{STUDIO_INFO,renderStudio,stopRecording}from'../features/studios/index.js';
import{renderWorksheetRoute,SHEET_STEPS}from'../features/worksheet/index.js';
import{startQuiz}from'../features/practice/index.js';
import{app}from'../state/runtime.js';
import{getModule,termBy}from'../state/selectors.js';
import{closeModal}from'../ui/components/index.js';
import{$,$$,main,modal}from'../ui/dom.js';
function decodeRoute(value){try{return decodeURIComponent(value);}catch{return value;}}
export function navigate(hash){if(location.hash===hash)render();else location.hash=hash;}
export function resolveRoute(raw){
 let [path,q='']=raw.split('?');const params=new URLSearchParams(q);
 if(path==='module')path='learn/module/'+(params.get('id')||'ch1')+'/'+(params.get('tab')||'overview');
 else if(REDIRECTS[path]){const target=REDIRECTS[path];path=target.split('?')[0];const extra=new URLSearchParams(target.split('?')[1]||'');for(const[k,v]of extra)params.set(k,v);}
 if(path.startsWith('studio/'))path=STUDIO_REDIRECTS[path.slice(7)]||'library/terms';
 const match=path.match(/^learn\/module\/([^/]+)(?:\/([^/]+))?$/);
 if(match){const old=match[2]||'overview';if(old==='independent'||old==='classroom')params.set('type',old);path='learn/module/'+match[1]+'/'+(MODULE_TAB_REDIRECTS[old]||old);}
 const suffix=params.toString();return{path,params,hash:'#'+path+(suffix?'?'+suffix:'')};
}
export function render(){
 const resolved=resolveRoute(location.hash.slice(1)||'today'),{path,params}=resolved;
 if(location.hash!==resolved.hash)history.replaceState(null,'',resolved.hash);
 app.params=params;app.path=path;
 const sheet=path.match(/^learn\/module\/([^/]+)\/activity\/(classroom|independent)\/(\d+)\/sheet\/(.+)$/),module=path.match(/^learn\/module\/([^/]+)(?:\/([^/]+))?$/),term=path.match(/^library\/term\/(.+)$/);
 const studio=Object.entries(STUDIO_REDIRECTS).find(([key,dest])=>key!=='hub'&&dest===path)?.[0];
 app.route=path==='practice/session'?'practice':sheet?'worksheet':module?'module':term?'termpage':studio?'studio':path.startsWith('library/part/')?'partpage':path.startsWith('settings')?'settings':path.startsWith('teach')?'teach':ROUTES[path]||'home';
 app.canonicalArea=path.split('/')[0];
 if(module){params.set('id',module[1]);params.set('tab',module[2]||'overview');app.moduleTab=({overview:'outline',words:'bank',activities:'classroom',resources:'references'})[module[2]]||module[2]||'outline';app.moduleBankQuery='';app.moduleDisplayLimit=100;}
 closeWelcomeGuide(true);closeInfographicViewer(true);if(modal.open)closeModal();stopRecording();app.adaptiveRun=null;app.quiz=null;app.flash=null;app.exercise=null;app.special=null;setNav(false);
 const group=sheet||module?'modules':app.canonicalArea==='today'?'home':app.canonicalArea==='learn'?'modules':app.canonicalArea;
 $$('nav[data-shell] a,.sidebar nav a,.bottom-nav a').forEach(a=>{const on=a.dataset.page===group;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const teach=app.v3.profile.role==='Educator'||app.v3.profile.teachMode;$$('.sidebar [data-page=teach]').forEach(a=>a.hidden=!teach);
 const name=sheet?'Worksheet':module?getModule(module[1]).title:term?termBy(decodeRoute(term[1]))?.term||'Term':studio?STUDIO_INFO[studio]?.title:({today:'Today',learn:'Learn',practice:'Practice',progress:'Progress',library:'Library',settings:'Settings',teach:'Teach',infographics:'Infographics'})[app.canonicalArea]||'Today';
 const section=module?(module[2]||'overview'):null,sectionTitle=section?section[0].toUpperCase()+section.slice(1):'';$('#crumb').textContent=(module?'Learn / ':term?'Library / ':'')+name+(section?' / '+sectionTitle:'');document.title=(section?sectionTitle+' / '+name+' / Learn':name)+' · MedLex';
 if(path==='infographics')renderInfographics();
 else if(path==='practice/session')renderDailySession();
 else if(sheet)renderWorksheetRoute(sheet,params);
 else if(module)modernModule(getModule(module[1]),module[2]||'overview');
 else if(term)modernTerm(decodeRoute(term[1]));
 else if(path==='library/parts')modernParts();
 else if(path.startsWith('library/part/'))modernPart(decodeRoute(path.slice(13)));
 else if(path==='library/lab')wordlab();
 else if(path.startsWith('settings'))modernSettings();
 else if(path.startsWith('teach'))modernTeach(path.split('/')[1]||'assignments');
 else if(studio)renderStudio(studio);
 else ({today:modernToday,learn:modernLearn,practice:modernPractice,progress:modernProgress,'library/terms':modernLibrary})[path]?.()||(!Object.keys(ROUTES).includes(path)&&modernToday());
 main.classList.remove('view-enter');void main.offsetWidth;main.classList.add('view-enter');
 if(app.route==='practice'&&app.pendingQuiz){const mode=app.pendingQuiz;app.pendingQuiz=null;startQuiz(mode);}
 focusCurrentPage();
}
export function applyLearnView(){
 $$('#moduleCards .course-grid').forEach(el=>el.classList.toggle('path-view',app.learnView==='path'));
 if(app.learnView==='systems'&&$('#moduleCards'))$('#moduleCards').innerHTML='<div class="course-grid">'+COURSE_MODULES.filter(m=>!m.affixKind&&m.words.length>=100).map(moduleCard).join('')+'</div>';
 $$('[data-v3=learnview]').forEach(b=>{b.classList.toggle('active',b.dataset.id===app.learnView);b.setAttribute('aria-pressed',b.dataset.id===app.learnView)});
}
export function setNav(on){$('#sidebar').classList.toggle('open',on);$('.nav-scrim').hidden=!on;$('.menu-toggle').setAttribute('aria-expanded',String(on));if(on){$('#sidebar').setAttribute('role','dialog');$('#sidebar').setAttribute('aria-modal','true');$('#sidebar').querySelector('a').focus();}else{$('#sidebar').removeAttribute('role');$('#sidebar').removeAttribute('aria-modal');}}
export function focusCurrentPage(){const h=main.querySelector('h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}let live=$('#routeAnnouncement');if(!live){live=document.createElement('div');live.id='routeAnnouncement';live.className='visually-hidden';live.setAttribute('aria-live','polite');document.body.append(live);}live.textContent=document.title+(app.route==='worksheet'?' · '+SHEET_STEPS[app.activeWorksheet?.step||0]:'');}
