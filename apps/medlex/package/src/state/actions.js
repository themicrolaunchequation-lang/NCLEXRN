import{beginStorage,queueStorage,mirrorV4Metadata}from'./storage.js';
import{fsrsSchedule}from'../features/practice/fsrs.js';
import { selectStreak, selectMastery } from './pure-selectors.js';
// Phase 1: canonical state/actions implementation.
import { COURSE_MODULES, TERMS } from '../data/index.js';
import { downloadText, persist, studySessions, today, validateExpansion, validateV2Import } from '../features/learn/legacy-tools.js';
import { ASSIST_LANGUAGES } from '../features/settings/language.js';
import { startOnboarding } from '../features/studios/index.js';
import { updateWorksheetSaveStatus, snapshotCurrentWorksheet } from '../features/worksheet/index.js';
import { render } from '../router/index.js';
import { initial } from './defaults.js';
import { applyPreferences } from './preferences.js';
import { app } from './runtime.js';
import { courseDefaults, pct, termBy } from './selectors.js';
import { toast } from '../ui/components/index.js';
import { esc, main } from '../ui/dom.js';
export function blankV3() {
  return {
    schemaVersion: 3,
    profile: {
      name: '',
      role: 'Trainee',
      dailyGoalMin: 10,
      theme: 'system',
      reducedMotion: null,
      textScale: 1,
      highContrast: false,
      ttsRate: .85,
      ttsVoice: '',
      assistingLanguage: ''
    },
    terms: {},
    lessons: [],
    sessions: [],
    activity: {},
    course: courseDefaults(),
    search: {
      recent: []
    },
    achievements: {}
  };
}
export function migrate(studio, oldCourse) {
  const result = blankV3();
  result.profile = {
    ...result.profile,
    name: studio.name || '',
    theme: studio.theme || 'system',
    reducedMotion: studio.reduced ?? null
  };
  for (const id of new Set([...(studio.saved || []), ...(studio.learned || []), ...Object.keys(studio.reviews || {})])) {
    const r = studio.reviews?.[id];
    result.terms[id] = {
      saved: (studio.saved || []).includes(id),
      familiar: (studio.learned || []).includes(id),
      ...(r ? {
        srs: {
          ...r,
          interval: r.interval ?? ([0, 1, 3, 7][Math.min(3, r.reps)] || 0),
          ease: r.ease || 2.5,
          lapses: r.lapses || 0
        }
      } : {})
    };
  }
  result.lessons = [...(studio.lessons || [])];
  result.sessions = [...(studio.history || [])];
  for (const date of studio.visits || []) result.activity[date] = {
    minutes: 0,
    items: 0
  };
  result.course = JSON.parse(JSON.stringify(oldCourse || courseDefaults()));
  return result;
}
export function saveV3() {
  if (!app.v3) return;
  app.v3.profile = {
    ...app.v3.profile,
    name: app.state.name,
    theme: app.state.theme,
    reducedMotion: app.state.reduced
  };
  for (const id of new Set([...Object.keys(app.v3.terms), ...app.state.saved, ...app.state.learned, ...Object.keys(app.state.reviews)])) {
    const old = app.v3.terms[id] || {};
    app.v3.terms[id] = {
      ...old,
      saved: app.state.saved.includes(id),
      familiar: app.state.learned.includes(id),
      ...(app.state.reviews[id] ? {
        srs: {
          ...app.state.reviews[id]
        }
      } : {})
    };
  }
  app.v3.lessons = [...app.state.lessons];
  app.v3.sessions = app.state.history.slice(0, 500);
  app.v3.course = app.course;
  snapshotCurrentWorksheet();
  app.v3.updatedAt=Date.now();
  localStorage.setItem('medlex-v3', JSON.stringify(app.v3));
  mirrorV4Metadata(app.v3);
  queueStorage(app.v3).catch(()=>{});
  updateWorksheetSaveStatus();
  return true;
}
export function hydrateV3() {
  if (app.v3.profile.role === 'Student') app.v3.profile.role = 'Trainee';
  app.state = {
    ...initial,
    name: app.v3.profile.name || '',
    theme: app.v3.profile.theme || 'system',
    reduced: app.v3.profile.reducedMotion,
    saved: Object.keys(app.v3.terms).filter(id => app.v3.terms[id].saved),
    learned: Object.keys(app.v3.terms).filter(id => app.v3.terms[id].familiar),
    reviews: Object.fromEntries(Object.entries(app.v3.terms).filter(([id, t]) => t.srs).map(([id, t]) => [id, t.srs])),
    lessons: app.v3.lessons,
    history: app.v3.sessions,
    visits: Object.keys(app.v3.activity)
  };
  app.course = {
    ...courseDefaults(),
    ...app.v3.course
  };
}
export async function initializeV3() {
  let stored = null,
    existing = false;
  try {
    stored = JSON.parse(localStorage.getItem('medlex-v3') || 'null');
    existing = !!(localStorage.getItem('medlex-v1') || localStorage.getItem('medlex-course-v2'));
  } catch {}
  try{const fallback=JSON.parse(localStorage.getItem('medlex-v4')||'null');if(fallback?.schemaVersion===4&&fallback.profile&&(fallback.updatedAt||0)>(stored?.updatedAt||0))stored={...fallback,schemaVersion:3};}catch{}
  app.v3 = stored?.schemaVersion === 3 ? stored : migrate(app.state, app.course);
  if (!stored && !existing) {
    app.v3.profile.theme = 'system';
    app.v3.profile.reducedMotion = null;
  }
  hydrateV3();
  app.v3 = await beginStorage(app.v3);
  existing = existing || !!app.v3.updatedAt;
  hydrateV3();
  applyPreferences();
  try {
    saveV3();
  } catch (e) {
    app.storageState.error = e.name;
    app.storageState.dirty = true;
  }
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyPreferences);
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', applyPreferences);
  render();
  setInterval(() => {
    if (!document.hidden && Date.now() - app.lastInteraction < 60000) {
      const a = app.v3.activity[today()] || {
        minutes: 0,
        items: 0
      };
      a.minutes += .25;
      app.v3.activity[today()] = a;
      persist();
    }
  }, 15000);
  if (!stored && !existing) setTimeout(() => {if(app.onboardingStep==null&&!app.v3.profile.onboardingComplete)startOnboarding(0);}, 200);
}
export function streak() {return selectStreak(app.v3.activity, Date.now(), Object.values(app.v3.profile.streakFreezes||{}));}

export function trackItem() {
  const a = app.v3.activity[today()] || {
    minutes: 0,
    items: 0
  };
  a.items++;
  app.v3.activity[today()] = a;
  for (const [id, met] of [['first-item', a.items > 0], ['seven-day-streak', streak() >= 7], ['100-familiar', app.state.learned.length >= 100]]) if (met && !app.v3.achievements[id]) {
    app.v3.achievements[id] = today();
    toast({
      'first-item': 'First answer saved. Nice start.',
      'seven-day-streak': 'Seven days of learning recorded.',
      '100-familiar': '100 words marked familiar.'
    }[id] || 'A learning milestone was recorded.');
  }
}
export function schedule(old={},rating){return app.v3?.profile.scheduler==='fsrs'?fsrsSchedule(old,rating):classicSchedule(old,rating);}
export function classicSchedule(old = {}, rating) {
  const r = {
      reps: 0,
      interval: 0,
      ease: 2.5,
      lapses: 0,
      ...old
    },
    good = r.reps === 0 ? 1 : r.reps === 1 ? 3 : r.interval * r.ease;
  let days;
  if (rating === 1) {
    days = 10 / 1440;
    r.reps = 0;
    r.lapses++;
    r.ease = Math.max(1.3, r.ease - .2);
  } else {
    days = rating === 2 ? Math.max(1, r.interval * 1.2) : rating === 4 ? good * 1.3 : good;
    r.reps++;
    r.ease = Math.max(1.3, r.ease + (rating === 2 ? -.15 : rating === 4 ? .15 : 0));
    days = Math.min(180, days * (.95 + Math.random() * .1));
  }
  return {
    ...r,
    interval: days,
    last: Date.now(),
    due: Date.now() + days * 86400000
  };
}
export function intervalLabel(id, n) {
  return formatInterval(reviewPrediction(id, n).interval);
}
export function reviewPrediction(id, n) {
  if (!app.flash) return schedule(app.state.reviews[id], n);
  if (app.flash.predictionId !== id) {
    app.flash.predictionId = id;
    app.flash.predictions = Object.fromEntries([1, 2, 3, 4].map(r => [r, schedule(app.state.reviews[id], r)]));
  }
  return app.flash.predictions[n];
}
export function formatInterval(days) {
  if (days < 1 / 24) return Math.round(days * 1440) + ' min';
  if (days < 1) return Math.round(days * 24) + ' h';
  return Math.round(days * 10) / 10 + ' d';
}
export function distractors(t) {
  const same = TERMS.filter(x => x.id !== t.id && x.definition !== t.definition && !x.definition.toLowerCase().includes(t.term.toLowerCase()));
  const ranked = same.map(x => ({
    x,
    s: (x.chapter === t.chapter ? 0 : x.category && x.category === t.category ? 2 : 4) + Math.abs(x.definition.length - t.definition.length) / Math.max(t.definition.length, 1) + Math.random() * .5
  })).sort((a, b) => a.s - b.s);
  const seen = new Set([t.definition]);
  return ranked.filter(({
    x
  }) => {
    if (seen.has(x.definition)) return false;
    seen.add(x.definition);
    return true;
  }).slice(0, 3).map(a => a.x);
}
export function renderActivity() {
  const days = [];
  for (let i = 181; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-CA'),
      a = app.v3.activity[key];
    days.push(`<span class="${a && (a.items || a.minutes >= 2) ? 'active' : ''}" title="${key}: ${Math.floor(a?.minutes || 0)} min, ${a?.items || 0} items" role="img" aria-label="${key}: ${a?.items || 0} items"></span>`);
  }
  return `<section class="surface"><div class="section-head"><div><span class="eyebrow">YOUR LEARNING RHYTHM</span><h2>${streak()} day streak</h2></div><span>${Object.keys(app.v3.achievements).length} milestones</span></div><div class="heatmap" tabindex="0" aria-label="Activity over the last 26 weeks">${days.join('')}</div><h3>Familiarity by body system</h3><div class="mastery-list">${COURSE_MODULES.filter(m => !m.affixKind && m.words.length >= 100).map(m => {
    const p = selectMastery(app.state.learned, m.words);
    return `<a href="#module?id=${m.id}"><div class="mastery-meta"><span>${esc(m.title)}</span><span>${p}% familiar</span></div><div class="progress-track"><i style="width:${p}%"></i></div></a>`;
  }).join('')}</div></section>`;
}
export function validateImport(x) {
  if(x?.app==='MedLex'&&x.version===4){if(x.data?.schemaVersion!==4)throw Error('Invalid MedLex v4 backup.');const result=validateImport({...x,version:3,data:{...x.data,schemaVersion:3}});return{...result,v4:JSON.parse(JSON.stringify(x.data))};}
  if (x?.version !== 3) return validateV2Import(x);
  if (x.app !== 'MedLex' || !x.data || x.data.schemaVersion !== 3) throw Error('Invalid MedLex v3 backup.');
  const d = x.data;
  if (d.expansion) validateExpansion(d.expansion);
  if (!d.profile || !d.terms || Array.isArray(d.terms) || !Array.isArray(d.sessions) || !Array.isArray(d.lessons) || !d.activity || !d.course || !d.search || !d.achievements) throw Error('Incomplete MedLex v3 record.');
  for (const [id, t] of Object.entries(d.terms)) {
    if (!termBy(id) || !t || typeof t.saved !== 'boolean' || typeof t.familiar !== 'boolean') throw Error('Invalid term record.');
    if (t.srs && (!Number.isFinite(t.srs.due) || !Number.isFinite(t.srs.reps))) throw Error('Invalid review record.');
  }
  if (!['light', 'dark', 'system'].includes(d.profile.theme) || ![1, 1.125, 1.25, 1.5].includes(d.profile.textScale) || ![5, 10, 15, 20].includes(d.profile.dailyGoalMin) || ![true, false, null].includes(d.profile.reducedMotion)) throw Error('Invalid preferences.');
  if (d.profile.assistingLanguage != null && d.profile.assistingLanguage !== '' && !Object.hasOwn(ASSIST_LANGUAGES, d.profile.assistingLanguage)) throw Error('Invalid assisting language.');
  const studio = {
    ...initial,
    name: String(d.profile.name || '').slice(0, 40),
    theme: d.profile.theme,
    reduced: d.profile.reducedMotion,
    saved: Object.keys(d.terms).filter(id => d.terms[id].saved),
    learned: Object.keys(d.terms).filter(id => d.terms[id].familiar),
    reviews: Object.fromEntries(Object.entries(d.terms).filter(([id, t]) => t.srs).map(([id, t]) => [id, t.srs])),
    lessons: d.lessons,
    history: d.sessions,
    visits: Object.keys(d.activity)
  };
  validateV2Import({
    app: 'MedLex',
    version: 2,
    studio,
    course: d.course
  });
  return {
    studio,
    course: d.course,
    v3: JSON.parse(JSON.stringify(d))
  };
}
export function calendar() {
  let day = 0;
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//HCA//MedLex//EN'];
  for (const item of studySessions()) {
    const date = new Date(app.course.planStart + 'T12:00:00');
    date.setDate(date.getDate() + day++);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const fmt = d => d.toISOString().slice(0, 10).replaceAll('-', '');
    lines.push('BEGIN:VEVENT', 'UID:medlex-' + fmt(date) + '-' + day + '@healthcarecrownacademy.co.uk', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''), 'DTSTART;VALUE=DATE:' + fmt(date), 'DTEND;VALUE=DATE:' + fmt(next), 'SUMMARY:MedLex - ' + item.module.title.replace(/[,;\\]/g, ' '), 'DESCRIPTION:' + item.minutes + ' minute study block - ' + item.title.replace(/[,;\\]/g, ' '), 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  downloadText('MedLex-Study-Plan.ics', lines.join('\r\n'), 'text/calendar');
}
export function flushPendingSave() {
  clearTimeout(app.saveTimer);
  try {
    return saveV3();
  } catch (e) {
    app.storageState.pending = false;
    app.storageState.dirty = true;
    app.storageState.error = e.name || 'Storage error';
    updateWorksheetSaveStatus();
    return false;
  }
}
