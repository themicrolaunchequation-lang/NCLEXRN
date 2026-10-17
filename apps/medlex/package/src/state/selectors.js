// Phase 1: canonical state/selectors implementation.
import { CHAPTERS, COURSE_MODULES, TERMS } from '../data/index.js';
import { app } from './runtime.js';

export const chapter = id => CHAPTERS.find(c => c.id === Number(id));
export const termBy = id => TERMS.find(t => t.id === id);
export const termCount = id => TERMS.filter(t => t.chapter === id).length;
export const pct = (n, total) => Math.round(n / total * 100) || 0;
export const courseDefaults = () => ({
  outcomes: {},
  activities: {},
  attempts: [],
  notes: {},
  mapping: {},
  last: 'ch1',
  planMinutes: 20,
  planStart: new Date().toISOString().slice(0, 10)
});
export const getModule = id => COURSE_MODULES.find(m => m.id === id) || COURSE_MODULES[0];
export const bankFor = m => m.bank || TERMS.filter(t => m.words.includes(t.id));
export const passedModule = m => app.course.attempts.some(a => a.module === m.id && a.mode === 'meaning' && a.total >= 10 && a.score / a.total >= .8);
export const outcomeCount = m => m.outcomes.filter(o => app.course.outcomes[o.id]).length;
export const moduleStatus = m => passedModule(m) ? 'Knowledge check passed' : outcomeCount(m) ? 'In progress' : 'Ready to explore';
