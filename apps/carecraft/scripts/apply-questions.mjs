#!/usr/bin/env node
// Writes the authored question set in scripts/question-source/part*.mjs into the two places the app reads it from:
//   src/v4/data.json       (lessons[].question/answers/correct/rationales/feedback, HCA_BANK, P2_DATA.questions)
//   src/v4/runtime-data.js (the same three constants, embedded in the build)
// Authors write the correct answer first ("ok") and two distractors ("bad"); this script places the correct answer so that
// positions stay balanced: each lesson uses A, B and C once across its three items, and the first item of every pair of
// lessons covers each position twice. Run from apps/carecraft:  node scripts/apply-questions.mjs
// Then run: node scripts/check-questions.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'scripts/question-source');
const dataPath = path.join(root, 'src/v4/data.json');
const runtimePath = path.join(root, 'src/v4/runtime-data.js');

const parts = fs.readdirSync(srcDir).filter(f => /^part\d+\.mjs$/.test(f)).sort();
const authored = [];
for (const f of parts) authored.push(...(await import(path.join(srcDir, f))).default);

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const lessonIds = data.lessons.map(l => l.id);
const byLesson = new Map(authored.map(a => [a.lesson, a.items]));
for (const id of lessonIds) if (!byLesson.has(id) || byLesson.get(id).length !== 3) throw new Error(`Lesson ${id} needs exactly 3 authored items`);
if (authored.length !== lessonIds.length) throw new Error('Authored lessons do not match the lesson list');

// Position of the correct answer for the first item of each lesson, repeating every six lessons (2 each of A/B/C).
const FIRST = [0, 2, 1, 2, 0, 1];
const positionsFor = lessonIndex => {
  const p0 = FIRST[lessonIndex % 6];
  const p1 = (p0 + (lessonIndex % 2 === 0 ? 1 : 2)) % 3;
  const p2 = 3 - p0 - p1;
  return [p0, p1, p2];
};

const place = (item, pos) => {
  const answers = [], rationales = [];
  const bad = item.bad.slice();
  for (let i = 0; i < 3; i++) {
    const [a, r] = i === pos ? item.ok : bad.shift();
    answers.push(a); rationales.push(r);
  }
  return { id: item.id, question: item.q, answers, correct: pos, rationales };
};

lessonIds.forEach((lid, li) => {
  const pos = positionsFor(li);
  const items = byLesson.get(lid).map((it, k) => place(it, pos[k]));
  const lesson = data.lessons[li];
  const core = items[0];
  const oldBank = data.HCA_BANK[lid];
  items.forEach((q, k) => { if (oldBank[k].id !== q.id) throw new Error(`Id changed for ${lid} item ${k}: ${oldBank[k].id} -> ${q.id}`); });
  lesson.question = core.question;
  lesson.answers = core.answers.slice();
  lesson.correct = core.correct;
  lesson.rationales = core.rationales.slice();
  lesson.feedback = core.rationales[core.correct];
  data.HCA_BANK[lid] = items;
  data.P2_DATA.questions[lid] = [core.question, core.answers.slice(), core.correct, core.rationales.slice()];
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// runtime-data.js: replace the three constants in place.
let rt = fs.readFileSync(runtimePath, 'utf8');
const replaceConst = (name, value) => {
  const re = new RegExp(`^const ${name}=.*?;$`, 'm');
  if (!re.test(rt)) throw new Error('Constant not found in runtime-data.js: ' + name);
  rt = rt.replace(re, () => `const ${name}=${JSON.stringify(value)};`);
};
replaceConst('lessons', data.lessons);
replaceConst('HCA_BANK', data.HCA_BANK);
replaceConst('P2_DATA', data.P2_DATA);
fs.writeFileSync(runtimePath, rt);

// Sanity: the embedded constants must evaluate to exactly what data.json holds.
const ctx = vm.createContext({});
vm.runInContext(rt + ';this.__o={lessons,HCA_BANK,P2_DATA}', ctx);
for (const k of ['lessons', 'HCA_BANK', 'P2_DATA']) {
  if (JSON.stringify(ctx.__o[k]) !== JSON.stringify(data[k])) throw new Error('runtime-data.js out of sync for ' + k);
}
console.log(`Applied ${lessonIds.length * 3} questions to data.json and runtime-data.js`);
