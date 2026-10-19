#!/usr/bin/env node
// Validates the quality of Carecraft's decision questions (30 lesson checks and the 90-prompt bank).
// No dependencies. Exits 1 on any failure, so it can gate a build or test run.
//   node scripts/check-questions.mjs              check src/v4/data.json (and that runtime-data.js matches it)
//   node scripts/check-questions.mjs --data F     check another data.json (for before/after comparisons)
//   node scripts/check-questions.mjs --quiet      print only failures and the summary line
// Also run by test-v4.cjs, so it is part of the normal Carecraft test run.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const argValue = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const dataPath = path.resolve(argValue('--data') || path.join(root, 'src/v4/data.json'));
const checkRuntime = !argValue('--data');
const quiet = args.includes('--quiet');

// Thresholds (the quality bar for the question set).
const MIN_POSITION_SHARE = 0.25;      // each of A/B/C must hold at least this share of correct answers
const MAX_POSITION_SHARE = 0.42;      // ...and at most this share
const MAX_LONGEST_SHARE = 0.45;       // the correct option may be the longest in at most this share of items
const MAX_LENGTH_SPREAD = 0.15;       // every option within +/-15% of the item's mean option length
const MAX_SHARED_OPENING = 3;         // no more than this many rationales may open with the same five words
const MIN_QUESTION_CHARS = 150;       // a vignette, not a one-line stem
const MAX_ABSOLUTE_ONLY_IN_WRONG = 4; // items where an absolute word appears only in distractors
const ABSOLUTE = /\b(always|never|guarantee[sd]?|completely|entirely|definitely|certainly|no need|every single)\b/i;
const TEMPLATE = /^(this leaves the key issue|this applies the principle|this is the strongest|this is not the strongest)/i;

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const failures = [];
const warnings = [];
const fail = msg => failures.push(msg);

const norm = s => String(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const words = s => norm(s).split(' ').filter(Boolean);
const sentenceCount = s => (String(s).match(/[.?!](?:\s|$)/g) || []).length;

// Gather items: the 90-prompt bank is the full question set; the 30 lesson checks are a subset (bank item 1 of each lesson).
const bank = [];
for (const [lessonId, items] of Object.entries(data.HCA_BANK)) items.forEach((q, i) => bank.push({ ...q, lesson: lessonId, index: i }));
const lessonChecks = data.lessons.map(l => ({ id: l.id + ' (lesson check)', lesson: l.id, question: l.question, answers: l.answers, correct: l.correct, rationales: l.rationales, feedback: l.feedback }));

// Structural checks.
const ids = bank.map(q => q.id);
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupIds.length) fail(`Question ids are not unique: ${[...new Set(dupIds)].join(', ')}`);
const lessonIdList = data.lessons.map(l => l.id);
if (new Set(lessonIdList).size !== lessonIdList.length) fail('Lesson ids are not unique');
for (const l of data.lessons) {
  if (!data.HCA_BANK[l.id] || data.HCA_BANK[l.id].length !== 3) fail(`${l.id}: expected 3 bank prompts`);
}
for (const q of [...bank, ...lessonChecks]) {
  const where = q.id;
  if (!q.question || typeof q.question !== 'string') fail(`${where}: missing question`);
  if (!Array.isArray(q.answers) || q.answers.length !== 3) { fail(`${where}: needs exactly 3 options`); continue; }
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct > 2) fail(`${where}: correct index out of range`);
  if (!Array.isArray(q.rationales) || q.rationales.length !== q.answers.length) { fail(`${where}: needs one rationale per option`); continue; }
  q.answers.forEach((a, i) => { if (!String(a).trim()) fail(`${where}: option ${i + 1} is empty`); });
  q.rationales.forEach((r, i) => { if (!String(r || '').trim()) fail(`${where}: missing rationale for option ${i + 1}`); });
  if (new Set(q.answers.map(norm)).size !== q.answers.length) fail(`${where}: duplicate options`);
}
// Lesson check must equal bank item 1 (the app and tests rely on this linkage).
for (const l of data.lessons) {
  const core = data.HCA_BANK[l.id]?.[0];
  if (!core) continue;
  if (core.question !== l.question || JSON.stringify(core.answers) !== JSON.stringify(l.answers) || core.correct !== l.correct || JSON.stringify(core.rationales) !== JSON.stringify(l.rationales)) {
    fail(`${l.id}: lesson check differs from its first bank prompt`);
  }
  if (l.feedback !== l.rationales[l.correct]) fail(`${l.id}: feedback should equal the correct option's rationale`);
  const p2 = data.P2_DATA?.questions?.[l.id];
  if (p2 && (p2[0] !== l.question || p2[2] !== l.correct || JSON.stringify(p2[1]) !== JSON.stringify(l.answers) || JSON.stringify(p2[3]) !== JSON.stringify(l.rationales))) fail(`${l.id}: P2_DATA.questions entry is out of sync`);
}
// runtime-data.js is what ships; it must hold the same questions.
if (checkRuntime) {
  try {
    const rt = fs.readFileSync(path.join(root, 'src/v4/runtime-data.js'), 'utf8');
    const ctx = vm.createContext({});
    vm.runInContext(rt + ';this.__o={lessons,HCA_BANK,P2_DATA}', ctx);
    for (const k of ['lessons', 'HCA_BANK', 'P2_DATA']) {
      if (JSON.stringify(ctx.__o[k]) !== JSON.stringify(data[k])) fail(`runtime-data.js ${k} differs from data.json (run node scripts/apply-questions.mjs)`);
    }
  } catch (e) { fail('Could not compare runtime-data.js: ' + e.message); }
}

// Distribution of the correct answer's position.
const letters = ['A', 'B', 'C'];
const positionCounts = set => { const c = [0, 0, 0]; set.forEach(q => { if (q.correct >= 0 && q.correct < 3) c[q.correct]++; }); return c; };
function checkPositions(label, set) {
  const c = positionCounts(set), n = set.length;
  c.forEach((count, i) => {
    const share = count / n;
    if (share < MIN_POSITION_SHARE || share > MAX_POSITION_SHARE) fail(`${label}: correct answer is ${letters[i]} in ${count} of ${n} items (${(share * 100).toFixed(0)}%); each position must be ${MIN_POSITION_SHARE * 100}-${MAX_POSITION_SHARE * 100}%`);
  });
  for (let start = 0; start + 6 <= n; start += 6) {
    const block = [0, 0, 0];
    set.slice(start, start + 6).forEach(q => block[q.correct]++);
    if (block.some(x => x < 1 || x > 3)) fail(`${label}: items ${start + 1}-${start + 6} have correct positions A/B/C = ${block.join('/')}; expected roughly 2/2/2`);
  }
  let run = 1;
  for (let i = 1; i < n; i++) {
    run = set[i].correct === set[i - 1].correct ? run + 1 : 1;
    if (run >= 4) { fail(`${label}: four correct answers in a row at position ${letters[set[i].correct]} ending at item ${i + 1}`); break; }
  }
  return c;
}
const bankPositions = checkPositions('Question bank', bank);
const lessonPositions = checkPositions('Lesson checks', lessonChecks);

// Option length bias.
function lengthStats(label, set) {
  let longest = 0, shortest = 0, middle = 0, spreadFails = 0;
  for (const q of set) {
    if (!Array.isArray(q.answers) || q.answers.length !== 3) continue;
    const lens = q.answers.map(a => String(a).length), correctLen = lens[q.correct];
    const others = lens.filter((_, i) => i !== q.correct);
    if (correctLen > Math.max(...others)) longest++; else if (correctLen < Math.min(...others)) shortest++; else middle++;
    const mean = lens.reduce((x, y) => x + y, 0) / lens.length;
    const spread = Math.max(...lens.map(x => Math.abs(x - mean) / mean));
    if (spread > MAX_LENGTH_SPREAD) { spreadFails++; fail(`${q.id}: option lengths ${lens.join('/')} differ by ${(spread * 100).toFixed(0)}% from the mean; keep within +/-${MAX_LENGTH_SPREAD * 100}%`); }
  }
  const n = set.length;
  if (longest / n > MAX_LONGEST_SHARE) fail(`${label}: the correct option is the longest in ${longest} of ${n} items (${(longest / n * 100).toFixed(0)}%); the limit is ${MAX_LONGEST_SHARE * 100}%`);
  return { longest, shortest, middle, spreadFails };
}
const bankLength = lengthStats('Question bank', bank);
const lessonLength = lengthStats('Lesson checks', lessonChecks);

// Rationales: present, unique, not templated, not copied lesson text.
const allRationales = [];
bank.forEach(q => (q.rationales || []).forEach((r, i) => allRationales.push({ id: q.id, option: i + 1, text: String(r || ''), lesson: q.lesson })));
const seen = new Map();
let duplicateRationales = 0, templated = 0;
for (const r of allRationales) {
  if (!r.text.trim()) continue;
  const key = norm(r.text);
  if (seen.has(key)) { duplicateRationales++; fail(`Duplicate rationale in ${r.id} option ${r.option} (also ${seen.get(key)})`); } else seen.set(key, `${r.id} option ${r.option}`);
  if (TEMPLATE.test(r.text.trim())) { templated++; fail(`Template rationale in ${r.id} option ${r.option}: "${r.text.slice(0, 50)}..."`); }
}
const lessonById = new Map(data.lessons.map(l => [l.id, l]));
let copiedFromLesson = 0;
for (const r of allRationales) {
  const l = lessonById.get(r.lesson);
  if (!l) continue;
  const w = words(r.text);
  const stepsText = norm(l.steps.map(s => s[1]).join(' '));
  for (let i = 0; i + 12 <= w.length; i++) {
    if (stepsText.includes(w.slice(i, i + 12).join(' '))) { copiedFromLesson++; fail(`${r.id} option ${r.option}: rationale repeats lesson text verbatim instead of explaining the option`); break; }
  }
}
const openings = new Map();
for (const r of allRationales) {
  const key = words(r.text).slice(0, 5).join(' ');
  if (!key) continue;
  openings.set(key, (openings.get(key) || 0) + 1);
}
for (const [k, v] of openings) if (v > MAX_SHARED_OPENING) fail(`${v} rationales open with "${k}"; vary the wording`);
if (new Set(bank.map(q => q.rationales && q.rationales.join('|'))).size !== bank.length) fail('Two questions share an identical set of rationales');
// A distractor's rationale should not just repeat the correct answer's rationale.
for (const q of bank) {
  const rs = (q.rationales || []).map(norm);
  if (new Set(rs).size !== rs.length) fail(`${q.id}: options share a rationale`);
}

// Vignette quality and absolute-word cue.
let thin = 0, absoluteOnlyWrong = 0;
for (const q of bank) {
  if (String(q.question).length < MIN_QUESTION_CHARS || sentenceCount(q.question) < 2) { thin++; fail(`${q.id}: question is too thin (needs a short scenario of 2-3 sentences plus the question)`); }
  if (Array.isArray(q.answers) && q.answers.length === 3) {
    const flags = q.answers.map(a => ABSOLUTE.test(a));
    if (!flags[q.correct] && flags.some(Boolean)) { absoluteOnlyWrong++; warnings.push(`${q.id}: absolute wording appears only in a distractor`); }
  }
}
if (absoluteOnlyWrong > MAX_ABSOLUTE_ONLY_IN_WRONG) fail(`Absolute words (always, never, guarantee...) appear only in wrong options in ${absoluteOnlyWrong} items; the limit is ${MAX_ABSOLUTE_ONLY_IN_WRONG}`);

// Summary table.
const pct = (a, b) => (b ? (a / b * 100).toFixed(0) : '0') + '%';
const row = (label, set, pos, len) => {
  const n = set.length;
  return [label, n, `${pos[0]}/${pos[1]}/${pos[2]}`, `${pct(pos[0], n)}/${pct(pos[1], n)}/${pct(pos[2], n)}`, `${len.longest} (${pct(len.longest, n)})`, `${len.shortest} (${pct(len.shortest, n)})`, len.spreadFails];
};
const rows = [
  ['Set', 'Items', 'Correct A/B/C', 'A/B/C share', 'Correct longest', 'Correct shortest', 'Length spread >15%'],
  row('Question bank', bank, bankPositions, bankLength),
  row('Lesson checks', lessonChecks, lessonPositions, lessonLength)
];
const widths = rows[0].map((_, i) => Math.max(...rows.map(r => String(r[i]).length)));
const table = rows.map(r => r.map((c, i) => String(c).padEnd(widths[i])).join('  ')).join('\n');
const uniqueRationales = new Set(allRationales.map(r => norm(r.text))).size;
const summary = `Rationales: ${allRationales.length} total, ${uniqueRationales} unique, ${templated} template, ${duplicateRationales} duplicate, ${copiedFromLesson} copied from lesson text. Thin questions: ${thin}. Absolute words only in distractors: ${absoluteOnlyWrong}. Ids unique: ${dupIds.length === 0 ? 'yes' : 'NO'}.`;

if (!quiet) { console.log(table); console.log(summary); if (warnings.length) console.log(warnings.map(w => 'note: ' + w).join('\n')); }
if (failures.length) {
  console.error(`\nFAIL: ${failures.length} problem${failures.length === 1 ? '' : 's'} found`);
  const shown = failures.slice(0, 60);
  console.error(shown.map(f => ' - ' + f).join('\n'));
  if (failures.length > shown.length) console.error(` ... and ${failures.length - shown.length} more`);
  process.exit(1);
}
console.log('OK: question quality checks passed');
