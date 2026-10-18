// Build-time data for the MedLex Learning Studio: one compact record per module, drawn from the course records,
// so the lazily loaded studio bundle never needs the 700 KB term bank. Nothing here is invented: sections, outcomes,
// classroom tasks, the case, the confusable pair, the poster and the terms (with their parts) are the course's own.
import fs from 'node:fs';

const rec = n => JSON.parse(fs.readFileSync(`package/src/data/records/${n}.json`, 'utf8'));

export function studioData(base) {
  const MODS = rec('COURSE_MODULES'), TERMS = rec('TERMS'), PRE = rec('PREFIXES'), SUF = rec('SUFFIXES'), CONF = rec('CONFUSIONS'), CASES = rec('CASES');
  const CAT = JSON.parse(fs.readFileSync('package/src/features/infographics/catalog.json', 'utf8'));
  const byId = Object.fromEntries(TERMS.map(t => [t.id, t])), byName = Object.fromEntries(TERMS.map(t => [t.term.toLowerCase(), t]));
  const parts = t => (t.parts || []).filter(p => p.type !== 'vowel').map(p => [p.text, p.type[0], p.meaning]);
  const slim = t => ({ id: t.id, term: t.term, plain: t.plain, def: t.definition, ex: t.example, parts: parts(t) });
  const decodable = t => t && t.plain && parts(t).length >= 2;
  const poster = p => p && ({ id: p.id, src: `${base}infographics/${p.id}.webp`, title: p.title, outcome: p.outcome, terms: p.terms.map(t => ({ term: t.term, def: t.definition })), caution: p.caution, question: p.question, answer: p.answer });
  const chapterOf = t => t && t.chapter;

  const modules = MODS.map(m => {
    let pool;
    if (m.id === 'prefixes' || m.id === 'suffixes') {
      const src = m.id === 'prefixes' ? PRE : SUF;
      pool = src.slice(0, 14).map(x => ({ id: x.id, term: x.form, plain: x.meaning, def: x.meaning, ex: x.example, parts: [[x.form, x.kind[0], x.meaning]], form: true }));
    } else {
      const ids = [...new Set([...m.sections.flatMap(s => (s.terms || []).map(t => t.id)), ...(m.words || [])])];
      const all = ids.map(id => byId[id]).filter(t => t && t.plain && t.definition);
      pool = [...all.filter(decodable), ...all.filter(t => !decodable(t))].slice(0, 14).map(slim);   // word-part terms first: they teach the most
    }
    const mainPoster = CAT.find(p => p.id === m.id), extra = CAT.find(p => p.module === m.id && p.id !== m.id);
    const confusion = CONF.find(c => [byName[c.a.toLowerCase()], byName[c.b.toLowerCase()]].some(t => t && 'ch' + chapterOf(t) === m.id));
    const kase = CASES.find(c => byId[c.term] && 'ch' + chapterOf(byId[c.term]) === m.id);
    return {
      id: m.id, n: m.chapter, title: m.title, sub: m.subtitle, min: m.minutes,
      count: m.id === 'prefixes' || m.id === 'suffixes' ? '100 word parts' : `${(m.words || []).length || pool.length} terms`,
      sections: m.sections.map(s => ({ t: s.title, m: s.minutes, r: s.read })),
      outcomes: m.outcomes.map(o => ({ t: o.text, e: o.evidence, s: o.section })),
      classroom: m.classroom.map(c => ({ s: c.section, mode: c.mode, title: c.title, ev: c.evidence })),
      independent: m.independent.map(i => ({ title: i.title, minutes: i.minutes, task: i.task })),
      case: m.case, terms: pool, poster: poster(mainPoster), bonus: poster(extra),
      confusion: confusion ? { a: confusion.a, b: confusion.b, left: confusion.left, right: confusion.right, diff: confusion.difference } : null,
      caseq: kase ? { q: kase.prompt, a: kase.answers, c: kase.correct, x: kase.explanation } : null
    };
  });
  return { modules };
}
