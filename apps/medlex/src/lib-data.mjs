// Build-time data for the reorganised MedLex Library, Visual Atlas and Practice. Everything comes from the course records;
// the only judgement made here is what leads: the 75 terms that have curated word parts, the 200 prefix/suffix forms and the
// roots those words use come first, and the 1,480-term glossary becomes a search-first reference loaded on demand.
import fs from 'node:fs';

const rec = n => JSON.parse(fs.readFileSync(`package/src/data/records/${n}.json`, 'utf8'));
const np = t => t.parts.filter(p => p.type !== 'vowel').length;
// 1,385 of the 1,480 records carry generated filler (an identical definition, a templated example, a stock note); drop it so only real content is shown.
const FILLER_EX = /^In a fictional teaching glossary/, FILLER_NOTE = /^Concise companion definition/;
const clean = t => ({ ex: FILLER_EX.test(t.example || '') ? '' : (t.example || ''), note: FILLER_NOTE.test(t.note || '') ? '' : (t.note || ''), def: t.definition === t.plain ? '' : t.definition });

export function libData(base) {
  const T = rec('TERMS'), M = rec('COURSE_MODULES'), PRE = rec('PREFIXES'), SUF = rec('SUFFIXES'), CONF = rec('CONFUSIONS'), CASES = rec('CASES'), CODE = rec('CODE_QUESTIONS');
  const CAT = JSON.parse(fs.readFileSync('package/src/features/infographics/catalog.json', 'utf8'));
  const decoded = T.filter(t => np(t) >= 2);
  const words = decoded.map(t => ({ id: t.id, term: t.term, plain: t.plain, def: clean(t).def || t.plain, ex: clean(t).ex, note: clean(t).note, ch: t.chapter, al: t.aliases || [], p: t.parts.map(p => [p.text, p.type[0], p.meaning]) }));
  const rootMap = {};
  for (const w of words) for (const [text, k, m] of w.p) if (k === 'r') { const key = text.toLowerCase(); (rootMap[key] ||= { id: 'root-' + key, f: text, m, e: w.term, w: [] }).w.push(w.id); }
  const roots = Object.values(rootMap).sort((a, b) => a.f.localeCompare(b.f));
  const chapterName = Object.fromEntries(M.filter(m => /^ch\d+$/.test(m.id)).map(m => [m.chapter, m.title]));
  const systems = M.filter(m => /^ch\d+$/.test(m.id) && m.chapter >= 3).map(m => ({
    id: m.id, n: m.chapter, title: m.title, sub: m.subtitle, words: (m.words || []).slice(0, 200),
    decoded: words.filter(w => w.ch === m.chapter).map(w => w.id), terms: T.filter(t => t.chapter === m.chapter).length, poster: CAT.some(p => p.id === m.id) ? m.id : null
  }));
  const atlas = CAT.map(p => ({ id: p.id, title: p.title, cat: p.category, module: p.module, outcome: p.outcome, terms: p.terms.map(t => ({ term: t.term, def: t.definition })), caution: p.caution || '', q: p.question || '', a: p.answer || '', src: `${base}infographics/${p.id}.webp`, thumb: `${base}infographics/t/${p.id}.webp` }));
  const data = {
    words, roots, chapterName, systems, atlas,
    prefixes: PRE.map(x => ({ id: x.id, f: x.form, m: x.meaning, e: x.example, t: x.tier })),
    suffixes: SUF.map(x => ({ id: x.id, f: x.form, m: x.meaning, e: x.example, t: x.tier })),
    confusions: CONF.map(c => ({ a: c.a, b: c.b, l: c.left, r: c.right, d: c.difference })),
    cases: CASES.map(c => ({ q: c.prompt, a: c.answers, c: c.correct, x: c.explanation, t: c.term })),
    coding: CODE.map(c => ({ q: c.prompt, a: c.options, c: c.correct, x: c.explain }))
  };
  const glossary = T.map(t => Object.assign({ id: t.id, term: t.term, plain: t.plain, ch: t.chapter, al: t.aliases || [], d: np(t) >= 2 ? 1 : 0 }, clean(t)));
  return { data, glossary };
}
