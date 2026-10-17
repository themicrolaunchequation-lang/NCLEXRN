import { TERMS } from '../../data/index.js';
let index;
/** Searchable text is derived from original fields; original ordering is retained. */
export function getSearchIndex() {
 return index ||= TERMS.map(t=>({t,term:t.term.toLowerCase(),aliases:t.aliases.map(s=>s.toLowerCase()),text:[t.term,t.definition,t.plain,...t.aliases,...t.parts.map(p=>p.meaning)].join(' ').toLowerCase()}));
}
export function scheduleSearchIndex() {
 if('requestIdleCallback' in window)window.requestIdleCallback(getSearchIndex,{timeout:2500});
 else setTimeout(getSearchIndex,250);
}
