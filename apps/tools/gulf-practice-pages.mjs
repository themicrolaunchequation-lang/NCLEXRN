// Builds the four Gulf "practice questions" guide pages from the studio's FREE questions only.
// Input: apps/tools/gulf-practice-free.json (questions 1-10 that the live studio already serves publicly).
// Output: site/guides/gulf/<exam>-practice-questions.html, using the Dubai guide page as the layout template.
// Usage: node apps/tools/gulf-practice-pages.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const SITE = 'https://healthcarecrownacademy.co.uk';
const APP = 'https://snle.healthcarecrownacademy.co.uk';
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'apps/tools/gulf-practice-free.json'), 'utf8'));
const template = fs.readFileSync(path.join(ROOT, 'site/guides/gulf/dubai-dha-nursing-exam.html'), 'utf8');
const TODAY = '2026-11-08', TODAY_TEXT = '8 November 2026';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tile = (ed, k) => data.editions[ed].tiles.find((t) => t.k === k);

// The Saudi and Abu Dhabi editions share the same free questions (Q0001-Q0010), so each page shows a different half.
const PAGES = [
  { ed: 'saudi', slug: 'saudi-snle-practice-questions', name: 'Saudi SNLE', short: 'SNLE', reg: 'SCFHS', guide: 'saudi-snle-nursing-exam', qs: data.shared.slice(0, 5) },
  { ed: 'dubai', slug: 'dubai-dha-practice-questions', name: 'Dubai DHA', short: 'DHA', reg: 'DHA', guide: 'dubai-dha-nursing-exam', qs: data.dubai },
  { ed: 'qatar', slug: 'qatar-dhp-practice-questions', name: 'Qatar DHP', short: 'DHP', reg: 'DHP', guide: 'qatar-dhp-nursing-exam', qs: data.qatar },
  { ed: 'abudhabi', slug: 'abu-dhabi-doh-practice-questions', name: 'Abu Dhabi DOH', short: 'DOH', reg: 'DOH', guide: 'abu-dhabi-doh-nursing-exam', qs: data.shared.slice(5, 10) },
];

function faqs(p) {
  const e = data.editions[p.ed], q = tile(p.ed, 'Questions'), t = tile(p.ed, 'Time'), m = tile(p.ed, 'Pass mark');
  const pass = p.ed === 'abudhabi'
    ? 'DOH reports a pass or fail result and does not publish its pass mark.'
    : p.ed === 'saudi' ? 'SCFHS reports a scaled score from 200 to 800. The pass mark is 500.'
    : `The published pass mark is ${m.v}.`;
  return [
    [`How many questions are in the ${p.name} nursing exam?`, `${e.intro}`],
    [`What is the ${p.short} exam pass mark?`, pass],
    [`How many times can I take the ${p.short} exam?`, e.retake],
    [`Are these real ${p.short} exam questions?`, `No. ${data.disclaimer} They are written to match the exam's style and topics.`],
    [`Where can I practise more ${p.short} questions?`, `The Gulf Nursing Licensure Studio has 10 free questions for each exam. The Gulf Pass unlocks the full bank of 1,297 questions, with mock exams, for all four Gulf exams.`],
  ];
}

function question(q, i) {
  const opts = q.options.map((o) => `<button type="button"${o.label === q.key ? ' data-ok' : ''}>${esc(o.label)}. ${esc(o.text)}</button>`).join('');
  const why = [`<b>Answer: ${esc(q.key)}.</b> ${esc(q.rationale)}`, q.trap ? `<b>Trap to avoid:</b> ${esc(q.trap)}` : ''].filter(Boolean).join(' ');
  return `<div class="g-q"><p><b>Question ${i + 1}.</b> ${esc(q.stem)}</p>${opts}<div class="g-why" hidden>${why}</div></div>`;
}

function page(p) {
  const n = p.qs.length, e = data.editions[p.ed];
  const title = `${p.name} nursing exam practice questions: ${n} free questions with answers`;
  const desc = `${n} free ${p.name} nursing exam practice questions with answers and the reasoning behind each one, plus FAQs on the format and pass mark. Original practice material.`;
  const url = `${SITE}/guides/gulf/${p.slug}`;
  const appUrl = `${APP}/#exam/${p.ed}`;
  const F = faqs(p);
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Guides', item: `${SITE}/guides` },
    { '@type': 'ListItem', position: 2, name: 'Gulf nursing exams', item: `${SITE}/guides/gulf/compare-gulf-nursing-exams` },
    { '@type': 'ListItem', position: 3, name: `${p.name} practice questions`, item: url }] };
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: F.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  const facts = ['Questions', 'Time', 'Pass mark'].map((k) => tile(p.ed, k)).map((t) => `<div class="g-fact"><b>${esc(t.v)}</b><span>${esc(t.k)}</span></div>`).join('');
  const others = PAGES.filter((o) => o !== p).map((o) => `<li><a href="/guides/gulf/${o.slug}">${o.name} practice questions</a></li>`).join('');

  const article = `<article class="container prose g-wrap">
<nav class="g-crumbs" aria-label="Breadcrumb"><a href="/guides">Guides</a> / <a href="/guides/gulf/compare-gulf-nursing-exams">Gulf nursing exams</a> / <a href="/guides/gulf/${p.guide}">${p.name}</a></nav>
<p class="eyebrow">Gulf Region nursing exams</p><h1 class="section-title">${esc(p.name)} nursing exam practice questions</h1><p class="g-lead">${n} free practice questions for the ${esc(e.fullName)}, taken from our Gulf Nursing Licensure Studio. Tap an answer to see if you are right and why.</p>
<p class="g-updated">By Healthcare Crown Academy · Last updated <time datetime="${TODAY}">${TODAY_TEXT}</time></p><div class="g-facts">${facts}</div>
<p class="g-note">${esc(data.disclaimer)}</p>
<h2>${n} free ${esc(p.short)} practice questions</h2><div class="g-quiz" data-next="Try the 10 free questions in the studio to keep going.">${p.qs.map(question).join('')}<p class="g-score" aria-live="polite"></p></div>
<aside class="g-cta"><h2>Keep practising for the ${esc(p.short)} exam</h2><p>Try 10 questions free in the studio. The Gulf Pass covers all four Gulf exams, with 1,297 clinically reviewed questions, mock exams and 67 clinical reasoning tools. Paid once, never renews.</p><a class="g-btn" href="${appUrl}">Try 10 questions free</a><a class="g-alt" href="/subscribe?exam=${p.ed}">See the Gulf Pass</a></aside>
<h2>${esc(p.short)} exam questions people ask</h2>${F.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}
<p>Read the full <a href="/guides/gulf/${p.guide}">${esc(p.name)} exam guide</a> for the format, topics and a 7-day study plan.</p>
<h2>Practice questions for the other Gulf exams</h2><ul class="g-grid">${others}<li><a href="/guides/gulf/compare-gulf-nursing-exams">Compare all four</a></li></ul>
`;

  let h = template;
  const swap = (re, to, label) => { if (!re.test(h)) throw Error(`template changed: ${label}`); h = h.replace(re, to); };
  swap(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`, 'title');
  swap(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`, 'description');
  swap(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`, 'canonical');
  swap(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`, 'og:title');
  swap(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`, 'og:description');
  swap(/<script type="application\/ld\+json">\{"@context": "https:\/\/schema.org", "@type": "BreadcrumbList".*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(crumbs)}</script>`, 'breadcrumb ld');
  swap(/<script type="application\/ld\+json">\{"@context": "https:\/\/schema.org", "@type": "Article".*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(faqLd)}</script>`, 'article ld');
  swap(/<article class="container prose g-wrap">[\s\S]*?<\/article>/, article + '  </article>', 'article');
  return h;
}

for (const p of PAGES) {
  const out = path.join(ROOT, 'site/guides/gulf', p.slug + '.html');
  fs.writeFileSync(out, page(p));
  console.log('wrote', path.relative(ROOT, out), p.qs.length, 'questions');
}
