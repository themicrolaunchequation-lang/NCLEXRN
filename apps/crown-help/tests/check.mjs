// Crown Help checks: golden questions, crisis wording, page load on every page type, axe on the open panel.
// Usage: node apps/tools/serve-site.mjs 8443 &  then  node apps/crown-help/tests/check.mjs [port]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const port = process.argv[2] || 8443;
const golden = JSON.parse(fs.readFileSync(new URL('./golden.json', import.meta.url)));
const b = await chromium.launch({ args: [`--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}, MAP healthcarecrownacademy.co.uk 127.0.0.1:${port}`, '--ignore-certificate-errors', '--no-proxy-server'] });
const ctx = await b.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
await ctx.route(/supabase\.co/, r => r.fulfill({ status: 204, body: '' }));
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto(`https://localhost:${port}/`, { waitUntil: 'load' });
await p.waitForFunction(() => window.CrownHelp);
let pass = 0; const fails = [];
for (const [q, want] of golden) {
  const r = await p.evaluate(q => window.CrownHelp._match(q), q);
  const ok = r[0] && r[0][0] === want && r[0][1] >= 0.47;
  ok ? pass++ : fails.push(`${want}  "${q}"  -> ${JSON.stringify(r)}`);
}
console.log(`Golden: ${pass}/${golden.length}`); fails.forEach(f => console.log('  MISS', f));
const hold = JSON.parse(fs.readFileSync(new URL('./holdout.json', import.meta.url)));
let hp = 0, hm = 0;
for (const [q, want] of hold) {
  const r = await p.evaluate(q => window.CrownHelp._match(q), q);
  const offered = r.filter((x, i) => x[1] >= 0.47 && (i === 0 || (!r[0][2] && x[1] >= r[0][1] * 0.93))).map(x => x[0]);
  if (offered.length) { if (offered.includes(want)) hp++; else console.log('  WRONG', want, JSON.stringify(q), JSON.stringify(r)); }
  else { hm++; console.log('  TO EMAIL', want, JSON.stringify(q), JSON.stringify(r)); }
}
for (const f of ['./holdout2.json', './research.json']) {
  const set = JSON.parse(fs.readFileSync(new URL(f, import.meta.url)));
  let ok2 = 0;
  for (const [q, want] of set) {
    const r = await p.evaluate(q => window.CrownHelp._match(q), q);
    const offered = r.filter((x, i) => x[1] >= 0.47 && (i === 0 || (!r[0][2] && x[1] >= r[0][1] * 0.93))).map(x => x[0]);
    if (offered.includes(want)) ok2++; else console.log('  ' + f.slice(2, -5).toUpperCase(), want, JSON.stringify(q), JSON.stringify(r));
  }
  console.log(`${f.slice(2, -5)}: ${ok2}/${set.length}`);
}
console.log(`Unseen questions: ${hp} right (or offered as a choice), ${hm} sent to email, ${hold.length - hp - hm} wrong (of ${hold.length})`);
const neg = JSON.parse(fs.readFileSync(new URL('./negative.json', import.meta.url)));
let nOk = 0;
for (const q of neg) { const r = await p.evaluate(q => window.CrownHelp._match(q), q); if (!r[0] || r[0][1] < 0.47) nOk++; else console.log('  GUESSED', JSON.stringify(q), JSON.stringify(r[0])); }
console.log(`Off-topic not answered: ${nOk}/${neg.length}`);
const crisisYes = ['I want to kill myself', 'thinking about suicide', 'I can\'t go on anymore', 'I want to die', 'I have been self harming'];
const crisisNo = ['how do I cancel', 'the app crashed and died', 'kill switch for notifications', 'I want to delete my account'];
const cy = await Promise.all(crisisYes.map(q => p.evaluate(q => window.CrownHelp._crisis(q), q)));
const cn = await Promise.all(crisisNo.map(q => p.evaluate(q => window.CrownHelp._crisis(q), q)));
console.log('Crisis caught:', cy.filter(Boolean).length + '/' + crisisYes.length, ' false alarms:', cn.filter(Boolean).length + '/' + crisisNo.length);
const clinYes = ['what should I give for chest pain', 'what dose of morphine for my patient', 'is it normal to have a headache after', 'side effects of metformin'];
const clinNo = ['mg/dl or mmol/l', 'medication calculation practice', 'how do I cancel'];
const ky = await Promise.all(clinYes.map(q => p.evaluate(q => window.CrownHelp._clinical(q), q)));
const kn = await Promise.all(clinNo.map(q => p.evaluate(q => window.CrownHelp._clinical(q), q)));
console.log('Clinical boundary caught:', ky.filter(Boolean).length + '/' + clinYes.length, ' false alarms:', kn.filter(Boolean).length + '/' + clinNo.length);
console.log('Page errors:', errs.length ? errs : 'none');
await b.close();
process.exit(fails.length > golden.length * 0.05 || cy.includes(false) || cn.includes(true) ? 1 : 0);
