// Read-only quality checks on the preserved SNLE question bank (source/original.html.gz).
// Changes nothing. Writes reports for the clinical reviewer:
//   reports/item-cues.json      answer-cue statistics (key is longest option; key is the only option without a full stop)
//   reports/scoring-check.csv   APGAR items whose stated components do not add up to the keyed total
//   reports/units-check.csv     items mixing mg/dL and mmol/L or giving glucose in one unit only
// Usage: node scripts/item-checks.mjs   (exit code 1 if any scoring mismatch is found)
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, '..');
const html = zlib.gunzipSync(fs.readFileSync(path.join(root, 'source/original.html.gz'))).toString('utf8');

// Every array of question records starts with [{"toolNumber"
const items = [];
for (let i = html.indexOf('[{"toolNumber"'); i !== -1; i = html.indexOf('[{"toolNumber"', i + 1)) {
  let depth = 0, inStr = false, esc = false, j = i;
  for (; j < html.length; j++) {
    const ch = html[j];
    if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') inStr = true; else if (ch === '[' || ch === '{') depth++; else if (ch === ']' || ch === '}') { depth--; if (depth === 0) break; }
  }
  try { for (const q of JSON.parse(html.slice(i, j + 1))) if (q && q.key && q.options) items.push(q); } catch { /* not a bank array */ }
}
const bank = [...new Map(items.map((q) => [q.id, q])).values()];
if (!bank.length) throw Error('No questions found in the preserved source');

const keyOpt = (q) => q.options.find((o) => o.label === q.key);
const endsDot = (t) => /[.?!]["”’)]?\s*$/.test(t.trim());
let longest = 0, punct = 0;
const punctIds = [];
for (const q of bank) {
  const k = keyOpt(q), others = q.options.filter((o) => o !== k);
  if (Math.max(...q.options.map((o) => o.text.length)) === k.text.length && others.every((o) => o.text.length < k.text.length)) longest++;
  if (!endsDot(k.text) && others.every((o) => endsDot(o.text))) { punct++; punctIds.push(q.id); }
}
const cues = { checked: new Date().toISOString(), items: bank.length, keyIsStrictlyLongest: longest, keyIsStrictlyLongestPct: +(100 * longest / bank.length).toFixed(1), keyOnlyOptionWithoutFullStop: punct, punctuationCueIds: punctIds, targets: { keyIsStrictlyLongestPct: '< 35', keyOnlyOptionWithoutFullStop: 0 } };
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports/item-cues.json'), JSON.stringify(cues, null, 2) + '\n');

// APGAR: score each component from the stem and compare with the keyed number.
const score = (s) => {
  const t = s.toLowerCase(); let total = 0; const parts = [];
  const hr = t.match(/heart rate (?:of )?(\d+)/); if (hr) { const v = +hr[1]; const p = v === 0 ? 0 : v < 100 ? 1 : 2; total += p; parts.push('pulse ' + p); } else if (/absent (heart|pulse)/.test(t)) parts.push('pulse 0');
  if (/strong cry|cries vigorously|vigorous cry|crying vigorously/.test(t)) { total += 2; parts.push('resp 2'); } else if (/slow|irregular|weak cry/.test(t)) { total += 1; parts.push('resp 1'); } else if (/apn(o)?eic|no respirat/.test(t)) parts.push('resp 0'); else return null;
  if (/active movement|moves all extremities actively|active flexion|actively/.test(t)) { total += 2; parts.push('tone 2'); } else if (/some flexion/.test(t)) { total += 1; parts.push('tone 1'); } else if (/limp|flaccid/.test(t)) parts.push('tone 0'); else return null;
  if (/cough|sneez|cries with stimulation|pulls away/.test(t)) { total += 2; parts.push('reflex 2'); } else if (/grimace/.test(t)) { total += 1; parts.push('reflex 1'); } else if (/no response/.test(t)) parts.push('reflex 0'); else return null;
  if (/completely pink|pink all over|entirely pink/.test(t)) { total += 2; parts.push('colour 2'); } else if (/blue hands|bluish hands|acrocyanosis|blue extremities/.test(t)) { total += 1; parts.push('colour 1'); } else if (/pallor|pale|blue all over|cyanotic/.test(t)) parts.push('colour 0'); else return null;
  return { total, parts };
};
const rows = [['id', 'computed_total', 'keyed_answer', 'components', 'stem']];
let mismatches = 0;
for (const q of bank) {
  if (!/apgar/i.test(q.stem) || !/score/i.test(q.stem)) continue;
  const k = keyOpt(q); const keyed = parseInt(k.text, 10); if (Number.isNaN(keyed)) continue;
  const r = score(q.stem); if (!r) continue;
  if (r.total !== keyed) { mismatches++; rows.push([q.id, r.total, keyed, r.parts.join('; '), q.stem]); }
}
const csv = (rs) => rs.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n') + '\n';
fs.writeFileSync(path.join(root, 'reports/scoring-check.csv'), csv(rows));

const urows = [['id', 'mg_dL', 'mmol_L', 'stem']];
for (const q of bank) {
  const t = JSON.stringify(q); const a = /mg\/dL/.test(t), b = /mmol\/L/.test(t);
  if ((a && b) || (/glucose/i.test(t) && (a !== b))) urows.push([q.id, a, b, q.stem]);
}
fs.writeFileSync(path.join(root, 'reports/units-check.csv'), csv(urows));

console.log(`items ${bank.length} | key strictly longest ${cues.keyIsStrictlyLongestPct}% | punctuation cue ${punct} | APGAR mismatches ${mismatches} | unit rows ${urows.length - 1}`);
process.exit(mismatches ? 1 : 0);
