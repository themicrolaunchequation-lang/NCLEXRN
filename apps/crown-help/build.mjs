// Crown Help: turn docs/crown-help/CROWN-HELP-CATALOGUE.md into site/assets/crown-help/data.json.
// The catalogue is the single source of truth: edit answers there, then run `node apps/crown-help/build.mjs`.
// The build stops with a clear message if an entry has no answer or a button has no destination.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../..');
const SRC = path.join(ROOT, 'docs/crown-help/CROWN-HELP-CATALOGUE.md');
const OUT = path.join(ROOT, 'site/assets/crown-help/data.json');
const md = fs.readFileSync(SRC, 'utf8');

const SITE = 'https://healthcarecrownacademy.co.uk';
const APP = n => `https://${n}.healthcarecrownacademy.co.uk`;
const EV = APP('evinca') + '/en';
const G = SITE + '/guides';

// Every button label in the catalogue needs a destination.
// url: link · ask: send this text as a question · email: open the email form on this topic · act: widget action
const BUTTONS = {
  'Abu Dhabi DOH guide': { url: G + '/gulf/abu-dhabi-doh-nursing-exam' },
  'Account and sign-in': { ask: 'I have a problem with my account or signing in' },
  'An app': { ask: 'Which app is right for me?' },
  'Ask about a team pilot': { email: 'Teams and organisations' },
  'Cancel and get a refund': { url: SITE + '/account' },
  'Check Companies House': { url: 'https://find-and-update.company-information.service.gov.uk/company/17501904' },
  'Check the ICO register': { url: 'https://ico.org.uk/ESDWebPages/Entry/ZC273259' },
  'Clinical coder': { pick: 'coder' },
  'Compare Gulf exams guide': { url: G + '/gulf/compare-gulf-nursing-exams' },
  'Compare the Gulf exams': { url: G + '/gulf/compare-gulf-nursing-exams' },
  'Control chart calculator': { url: SITE + '/tools/control-chart-calculator' },
  'Corrections policy': { url: EV },
  'Cpk calculator': { url: SITE + '/tools/process-capability-cpk-calculator' },
  'Create a free account': { url: SITE + '/account' },
  'Dubai DHA guide': { url: G + '/gulf/dubai-dha-nursing-exam' },
  'Educator or leader': { pick: 'leader' },
  'Email billing support': { email: 'Billing and refunds' },
  'Email our team': { email: 'Billing and refunds' },
  'Email the Evinca team': { email: 'Evinca' },
  'Email us about student pricing': { email: 'Billing and refunds' },
  'Email us if you need help': { email: 'Something isn\'t working' },
  'Email us now': { email: 'Account and sign-in' },
  'Email us to cancel': { email: 'Billing and refunds' },
  'Email us to switch': { email: 'Billing and refunds' },
  'Email us': { email: '' },
  'Evinca FAQ': { url: EV },
  'Free control chart calculator': { url: SITE + '/tools/control-chart-calculator' },
  'Free guide: SBAR': { url: G + '/carecraft/sbar' },
  'Free guide: active recall': { url: G + '/study/active-recall-for-nursing-students' },
  'Free guide: medical word parts': { url: G + '/medical-word-parts' },
  'Get help': { act: 'serein-help' },
  'Guide: how to thank a nurse': { url: G + '/how-to-thank-a-nurse' },
  'Gulf licence exam': { pick: 'gulf' },
  'Healthcare assistant / carer': { pick: 'hca' },
  'Help me choose an app': { ask: 'Which app is right for me?' },
  'How we review': { url: EV },
  'Is it cheaper in my country?': { ask: 'Is it cheaper in my country?' },
  'It works now': { act: 'resolved' },
  'My account': { url: SITE + '/account' },
  'Nominate someone': { url: EV },
  'Nurse or doctor': { pick: 'nurse' },
  'Open Carecraft': { url: APP('carecraft') },
  'Open Get help in Serein': { act: 'serein-help' },
  'Open Guides': { url: G },
  'Open Lumen': { url: APP('lumen') },
  'Open MedLex': { url: APP('medlex') },
  'Open Serein': { url: APP('serein') },
  'Open my account': { url: SITE + '/account' },
  'Open the Green Belt': { url: APP('lss') },
  'Open the studio': { url: APP('snle') },
  'Plans and prices': { ask: 'How much does it cost?' },
  'Postgraduate': { pick: 'postgrad' },
  'Privacy notice': { url: SITE + '/privacy' },
  'Qatar guide': { url: G + '/gulf/qatar-dhp-nursing-exam' },
  'Refund policy': { url: SITE + '/refunds' },
  'Report a content error': { email: 'Content correction' },
  'Report this question': { email: 'Content correction' },
  'Reset password': { url: SITE + '/account' },
  'SNLE guide': { url: G + '/gulf/saudi-snle-nursing-exam' },
  'See plans': { url: SITE + '/subscribe' },
  'See the exam guides': { url: G + '/gulf/compare-gulf-nursing-exams' },
  'Send a data protection complaint': { email: 'Privacy and data' },
  'Send a data request': { email: 'Privacy and data' },
  'Send feedback on this scenario': { email: 'Content correction' },
  'Send to our team': { email: 'Complaint' },
  'Share a quote': { email: 'Other' },
  'Sigma level calculator': { url: SITE + '/tools/sigma-level-dpmo-calculator' },
  'Sign in': { url: SITE + '/account' },
  'Something isn\'t working': { ask: 'Something isn\'t working' },
  'Start a 2-minute reset': { url: APP('serein') },
  'Start free': { url: SITE + '/account' },
  'Still broken → Email us': { email: 'Something isn\'t working' },
  'Stop renewal': { url: SITE + '/account' },
  'Student': { pick: 'student' },
  'Talk to a person': { email: '' },
  'Update card': { url: SITE + '/account' },
  'Visit Evinca': { url: EV },
  'What\'s free?': { ask: 'What is free?' },
  'What\'s in the paid plans?': { ask: 'What is included in the Crown Pass?' },
  'Wording policy': { url: EV },
};

// Extra phrasings for entries whose "People say" line is missing or thin.
const EXTRA = {
  'G-10': 'use it without internet, no internet, no wifi on placement, works offline',
  'B-04': 'took money twice, charged two times, double payment, took money from my account',
  'P-09': 'licence for my nurses, licences for staff, licence for 20 nurses, accounts for my team',
  'N-01': 'dha questions, doh questions, qatar questions, snle questions, gulf questions, what is the gulf studio, gulf region nursing, snle app, saudi nursing exam app, prometric',
  'N-05': 'one pass for all exams, dha and snle one pass, two exams one pass',
  'N-13': 'how long is the gulf pass, gulf pass length, gulf pass duration',
  'E-05': 'thank a nurse, say thank you to a nurse, thank my nurse',
  'E-03': 'is evinca a licence, is evinca a qualification',
  'LSS-04': 'green belt login, green belt sign in not working, green belt password',
  'G-11': 'is my data sold, do you sell my data',
  'G-05': 'is it safe to pay, safe payment, secure payment',
  'X-01': 'what should I give for, chest pain, pain relief, what medication should, treat my, dose, dosage, symptoms, my patient, is this normal, medical advice, diagnose',
  'Z-92': 'contact you, contact us, how to contact, get in touch, your email address',
  'T-01': 'page is blank, white screen, app won\'t open, nothing loads',
  'G-01': 'what is this website, who are you, what is healthcare crown academy, about you, about the company, who runs this',
  'G-02': 'I am a student nurse where do I start, new to this where to begin, which app should I use, which app for me, best app for me, what should I use first',
  'G-07': 'daily crown, what is daily crown, crown jewels, light my crown',
  'P-03': 'what do I get with crown pass, crown pass benefits, what does crown pass include, premium features',
  'P-10': 'vat invoice, invoice for my employer, receipt for expenses',
  'B-07': 'no receipt email, confirmation email missing, did not get a receipt',
  'A-04': 'reset email never arrived, password reset email not received, no reset link',
  'A-07': 'one login for all apps, same account for all apps, single sign on',
  'D-02': 'upload patient notes, patient information in notes, patient data',
  'D-04': 'complain to the ICO, ICO complaint, privacy complaint',
  'L-05': 'back up lumen, lumen backup, backup my library, move lumen to new laptop',
  'C-03': 'carecraft cpd, carecraft certificate, carecraft revalidation',
  'N-03': 'give me exam answers, answers to my exam, real snle questions, real exam questions, actual exam questions, leaked questions, recall questions',
  'LSS-03': 'green belt certificate accredited, iassc certification, asq certification',
  'LSS-05': 'green belt access code, organisation access code, redeem a code',
  'Z-01': 'partner with you, partnership, collaborate, work together, reseller, affiliate',
  'Z-03': 'are you hiring, jobs, careers, vacancy, work for you, volunteer, write questions for you',
  'Z-05': 'love this app, thank you, great app, amazing, love it, well done',
  'M-01': 'what is medlex, medlex, medical terminology app, medical words app',
  'L-01': 'what is lumen, lumen, flashcards, recall cards app',
  'C-01': 'what is carecraft, carecraft, care skills app, scenarios',
  'S-01': 'what is serein, serein, wellbeing app, breathing',
  'E-01': 'what is evinca, evinca, recognition, award, honor',
  'LSS-01': 'what is green belt, lean six sigma, lss, dmaic, quality improvement',
  'M-02': 'free medlex, medlex free modules',
  'C-02': 'free carecraft, carecraft free lessons',
  'N-02': 'free gulf questions, free snle questions',
  'LSS-02': 'green belt price, lss cost, is green belt in crown pass',
  'E-02': 'evinca price, evinca fees, evinca cost',
  'Z-02': 'press, journalist, interview, media',
  'N-06': 'snle questions number, how long is snle, pass mark, dha exam questions, doh exam',
  'F-02': 'free calculators, free tools, spc calculator',
  'M-03': 'start medlex, how to use medlex',
  'L-03': 'lumen files uploaded, where lumen stores',
  'N-11': 'wrong answer gulf, question wrong snle',
};

// Answers that change on a date (ISO date, from which the alternative applies).
const DATED = {
  'P-06': { from: '2027-02-01', answer: 'The founding offer ended on 31 January 2027. The yearly Crown Pass is **£39.99 a year**, or £5.99 a month, for new members. Members who joined at the founding price renew at £39.99 a year too.' },
  'LSS-02': { from: '2027-02-01', answer: 'US$149 for 12 months, paid once. It\'s a separate app with its own sign-in, not part of the Crown Pass, and the same price in every country.' },
};

const ROUTES = { 'Answer': 'answer', 'Answer + offer email': 'offer', 'Email': 'email' };
const TOPICS = ['Billing and refunds', 'Account and sign-in', 'Something isn\'t working', 'Content correction', 'Privacy and data', 'Complaint', 'Teams and organisations', 'Evinca', 'Green Belt', 'Partnership or press', 'Other'];

const errors = [];
const intents = [];
const body = md.slice(md.indexOf('## Part C'), md.indexOf('## Part D'));
const blocks = body.split(/\n(?=\*\*[A-Z]+-\d+ · )/).slice(1);
for (const raw of blocks) {
  const head = raw.match(/^\*\*([A-Z]+-\d+) · (.+?)\*\*(?:\s*\*\((.+?)\)\*)?/);
  const id = head[1];
  const title = head[2].replace(/\s+$/, '');
  const lines = raw.split('\n').slice(1);
  const e = { id, title, say: [], answer: '', buttons: [], route: 'answer', topic: '' };
  let mode = '';
  const answer = [];
  const follow = {};
  for (const line of lines) {
    if (/^#{2,3} /.test(line) || /^---/.test(line)) break;
    let m;
    if ((m = line.match(/^People say: (.*)/))) { e.say = m[1].split(/,\s*/).map(s => s.replace(/\*/g, '').trim()).filter(Boolean); mode = ''; continue; }
    if ((m = line.match(/^Answer: (.*)/))) { answer.push(m[1]); mode = 'answer'; continue; }
    if ((m = line.match(/^Buttons: (.*)/))) { e.buttons = [...m[1].matchAll(/\[([^\]]+)\]/g)].map(x => x[1]); mode = ''; continue; }
    if (/^Follow-ups:/.test(line)) { mode = 'follow'; continue; }
    if ((m = line.match(/^Route: (.*)/))) {
      const r = m[1];
      const base = Object.keys(ROUTES).sort((a, b) => b.length - a.length).find(k => r.startsWith(k));
      if (!base) errors.push(`${id}: unknown route "${r}"`);
      e.route = ROUTES[base] || 'answer';
      const t = r.match(/topic: ([^;)—]+)/);
      if (t) e.topic = t[1].trim();
      if (/priority/.test(r)) e.priority = true;
      mode = ''; continue;
    }
    if (/^\*\*(Shown only|\[CONFIRM)/.test(line)) { if (/Shown only/.test(line)) e.onlyIf = 'test-mode'; continue; }
    if (mode === 'answer' && line.trim() && !/^>/.test(line)) answer.push(line);
    if (mode === 'follow') { const f = line.match(/^- (.+?) → "(.+)"$/); if (f) follow[f[1].trim()] = f[2]; }
  }
  // "S-04 · Crisis / distress" has an arrow-style definition: use the fixed crisis script.
  if (id === 'S-04') { e.crisis = true; e.answer = ''; }
  else e.answer = answer.join('\n').trim();
  if (!e.answer && !e.crisis) errors.push(`${id}: no answer`);
  if (Object.keys(follow).length) e.follow = follow;
  if (EXTRA[id]) e.say.push(...EXTRA[id].split(/,\s*/));
  if (DATED[id]) e.dated = DATED[id];
  if (e.topic && !TOPICS.some(t => e.topic.startsWith(t))) errors.push(`${id}: unknown topic "${e.topic}"`);
  if (e.topic) e.topic = TOPICS.find(t => e.topic.startsWith(t));
  for (const b of e.buttons) if (!BUTTONS[b]) errors.push(`${id}: button "${b}" has no destination in BUTTONS`);
  e.app = { M: 'medlex', L: 'lumen', C: 'carecraft', S: 'serein', N: 'gulf', E: 'evinca', LSS: 'lss' }[id.split('-')[0]] || '';
  intents.push(e);
}

// Who-are-you follow-ups of G-02, keyed by picker value.
const PICK = { student: 'Student', postgrad: 'Postgraduate', hca: 'HCA / carer', nurse: 'Nurse or doctor', gulf: 'Gulf licence', coder: 'Clinical coder', leader: 'Educator / leader' };
const g02 = intents.find(i => i.id === 'G-02');
const picks = {};
for (const [k, label] of Object.entries(PICK)) {
  const text = g02 && g02.follow && g02.follow[label];
  if (!text) errors.push(`G-02: follow-up "${label}" missing`);
  picks[k] = text;
}

// Crisis script (Part A4), copied word for word.
const a4 = md.slice(md.indexOf('### A4.'), md.indexOf('## Part B'));
const crisis = a4.split('\n').filter(l => l.startsWith('>')).map(l => l.replace(/^>\s?/, '')).join('\n').trim();
if (!/999/.test(crisis) || !/116 123/.test(crisis)) errors.push('Crisis script not found or incomplete');

// Suggested questions per page (Part D).
const chips = {};
const partD = md.slice(md.indexOf('## Part D'), md.indexOf('## Part E'));
const KEY = { 'Home': 'home', 'Plans page': 'plans', 'Account page': 'account', 'MedLex': 'medlex', 'Lumen': 'lumen', 'Carecraft': 'carecraft', 'Serein': 'serein', 'Gulf studio': 'gulf', 'Evinca': 'evinca', 'Green Belt': 'lss', 'Guides': 'guides', 'Legal pages': 'legal' };
for (const row of partD.split('\n')) {
  const m = row.match(/^\| ([^|]+) \| ([^|]+) \|$/);
  if (m && KEY[m[1].trim()]) chips[KEY[m[1].trim()]] = m[2].split('·').map(s => s.trim());
}
if (Object.keys(chips).length < 12) errors.push('Part D chips: expected 12 rows, found ' + Object.keys(chips).length);

if (errors.length) { console.error('Crown Help build stopped:\n- ' + errors.join('\n- ')); process.exit(1); }

const data = { v: new Date().toISOString().slice(0, 10), topics: TOPICS, buttons: BUTTONS, picks, crisis, chips, intents: intents.map(({ follow, ...i }) => i) };
fs.writeFileSync(OUT, JSON.stringify(data));
console.log(`Crown Help: ${intents.length} intents, ${Object.keys(chips).length} chip sets, ${(fs.statSync(OUT).size / 1024).toFixed(1)} KB -> ${path.relative(ROOT, OUT)}`);
