import{mountScenes3D,disposeScenes3D}from'../features/library/scene3d.js';
import {teachTabs,libraryTabs}from'../features/modern/views.js';
import { app } from '../state/runtime.js';
import { main } from './dom.js';
import { PAGE_GUIDES, inlineGuide } from './guidance.js';
import { enhancePractice, enhanceProgress, addPracticeModes, studioCallout, studioProgress, studioTools } from '../features/learn/legacy-tools.js';
import { renderActivity } from '../state/actions.js';

export function exploreTabs() {
 return `<div class="explore-tabs" role="group" aria-label="Explore views">${[['../studio/hub','Studios'],['terms','Terms'],['elements','Word elements'],['lab','Word lab']].map(([r,t])=>`<a class="filter-pill ${location.hash.split('?')[0]==='#explore/'+r?'active':''}" href="${r==='../studio/hub'?'#studio/hub':'#explore/'+r}">${t}</a>`).join('')}</div>`;
}
export const preferencesCallout = () => '<section class="surface"><h2>Make MedLex yours.</h2><p>Appearance, readable text, daily goal, motion and speech.</p><div class="term-actions"><button class="btn" data-action="profile">Open preferences</button><button class="btn" data-v3="calendar">Download study calendar (.ics)</button><button class="btn" data-v3="shortcuts">Keyboard shortcuts</button></div></section>';
export const labActions = () => '<div class="term-actions"><button class="btn" data-v3="randomword">Random word</button><button class="btn" data-v3="build">Build a word</button></div>';

/** Compose the complete page off-screen, then commit once. No observer/patch pass. */
export function renderPage(html, {overview=false}={}) {
 const page=document.createElement('template');
 page.innerHTML=html;
 const root=page.content;
 const fragment = markup => { const t=document.createElement('template');t.innerHTML=markup;return t.content; };
 if(overview && app.route==='wordlab'){root.prepend(fragment(exploreTabs()));root.querySelector('.surface')?.append(fragment(labActions()));}
 for(const h of root.querySelectorAll('button h3,button h2')){const s=document.createElement('span');s.className='card-heading '+h.tagName.toLowerCase();s.innerHTML=h.innerHTML;h.replaceWith(s);}
 for(const el of root.querySelectorAll('aside:not([aria-label])'))el.setAttribute('aria-label','Learning guidance');
 if(!root.querySelector('h2'))for(const el of root.querySelectorAll('h3'))if(!el.closest('article')){const h=document.createElement('h2');h.innerHTML=el.innerHTML;el.replaceWith(h);}
 for(const el of root.querySelectorAll('.tab-with-help')){const a=el.querySelector('a');if(a)el.replaceWith(a);}
 for(const el of root.querySelectorAll('.sheet-steps [data-hint]'))el.removeAttribute('data-hint');
 const primary=[...root.querySelectorAll('.btn.primary')].filter(e=>!e.closest('.sheet-footer,.quiz-footer'));primary.forEach((e,i)=>{if(i)e.classList.remove('primary');else e.classList.add('btn-primary');});
 if(!root.querySelector('.section-tabs')&&app.path?.startsWith('teach')){const h=root.querySelector('.view-header');h?.after(fragment(teachTabs(app.path.split('/')[1]||'assignments')));}
 if(!root.querySelector('.section-tabs')&&['library/parts','library/lab','library/atlas','library/pronunciation'].includes(app.path)){const h=root.querySelector('.view-header');h?.after(fragment(libraryTabs(app.path.split('/')[1])));}
 disposeScenes3D();
 main.replaceChildren(root);
 mountScenes3D();
}
/** Complete content for a named panel, including its own semantics and guidance. */
export function renderPanel(target, html) {
 const t=document.createElement('template');t.innerHTML=html;
 for(const h of t.content.querySelectorAll('button h3,button h2')){const s=document.createElement('span');s.className='card-heading '+h.tagName.toLowerCase();s.innerHTML=h.innerHTML;h.replaceWith(s);}
 for(const el of t.content.querySelectorAll('aside:not([aria-label])'))el.setAttribute('aria-label','Learning guidance');
 target.replaceChildren(t.content);
}
