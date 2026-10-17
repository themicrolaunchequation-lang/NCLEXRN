import { renderPage } from "../../ui/page.js";
// Phase 1: canonical features/learn/module implementation.
import { MODULE_TABS } from '../../data/config.js';
import { COURSE_MODULES } from '../../data/index.js';
import { moduleBank, moduleClassroom, moduleIndependent, moduleOutcomes, moduleOutline, modulePractice, moduleReferences } from './index.js';
import { persistCourse } from './legacy-tools.js';
import { app } from '../../state/runtime.js';
import { moduleStatus } from '../../state/selectors.js';
import { esc, main } from '../../ui/dom.js';
import { uiIcon } from '../../ui/guidance.js';
export function renderModule(m) {
  app.course.last = m.id;
  persistCourse();
  const at = COURSE_MODULES.indexOf(m),
    next = COURSE_MODULES[at + 1];
  renderPage(`<a class="back-link" href="#learn">← All modules</a><header class="module-title"><div><span class="eyebrow">${m.affixKind ? 'Word elements' : 'Chapter ' + m.chapter}</span><h1>${esc(m.title)}</h1><p>${esc(m.subtitle)}</p></div><details class="module-downloads"><summary class="btn" aria-label="Module downloads">${uiIcon('book')} Downloads</summary><div><button class="btn" data-course="print" data-id="${m.id}" data-style="student">Print learning pack</button><button class="btn" data-course="print" data-id="${m.id}" data-style="teacher">Educator guide</button></div></details></header><p class="module-meta">${m.affixKind ? '100 word elements' : m.words.length + ' terms'} · ${m.outcomes.length} outcomes · ~70 min <span class="status-chip">${moduleStatus(m)}</span></p><div class="module-tab-frame"><div class="module-tabs" role="tablist" aria-label="Module sections">${MODULE_TABS.map(([id, label]) => `<button type="button" id="moduleTab_${m.id}_${id}" role="tab" aria-controls="moduleBody" aria-selected="${app.moduleTab === id}" tabindex="${app.moduleTab === id ? 0 : -1}" data-module-tab="${id}" data-module="${m.id}" class="${app.moduleTab === id ? 'active' : ''}">${label}</button>`).join('')}</div></div><div id="moduleBody" role="tabpanel" aria-labelledby="moduleTab_${m.id}_${app.moduleTab}"></div><div class="module-next"><a href="#learn" class="text-button">← Course overview</a>${next ? `<a class="btn" href="#learn/module/${next.id}/outline">Next: ${esc(next.title)} →</a>` : ''}</div>`, {
    overview: false
  });
  const views = {
    outline: moduleOutline,
    outcomes: moduleOutcomes,
    bank: moduleBank,
    practice: modulePractice,
    classroom: moduleClassroom,
    independent: moduleIndependent,
    references: moduleReferences
  };
  (views[app.moduleTab] || moduleOutline)(m);
  (window.requestAnimationFrame || setTimeout)(() => main.querySelector('.module-tabs .active')?.scrollIntoView({
    block: 'nearest',
    inline: 'nearest'
  }));
}
