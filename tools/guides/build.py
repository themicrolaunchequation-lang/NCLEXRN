#!/usr/bin/env python3
"""Builds the public guide pages and free tools into site/guides and site/tools.
Data: MedLex free lessons (prefixes, suffixes, word structure, vocabulary), the MedLex glossary,
and the Gulf exam profiles (tools/guides/gulf-profiles.json, exported from the Gulf studio).
Run: python3 tools/guides/build.py   (from the NCLEXRN folder). Prints the URLs it wrote."""
import json, re, html, os, glob, random
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, 'site'); BASE = 'https://healthcarecrownacademy.co.uk'
E = lambda s: html.escape(str(s), quote=True)
URLS = []
import shutil
for d in ('guides/medical-word-parts', 'guides/gulf', 'guides/carecraft', 'guides/serein', 'guides/study', 'tools'):
    shutil.rmtree(os.path.join(SITE, d), ignore_errors=True)
for f_ in glob.glob(os.path.join(SITE, 'guides', '*.html')) + [os.path.join(SITE, 'guides.html')]:
    if os.path.exists(f_): os.remove(f_)

tpl = open(os.path.join(SITE, 'refunds.html'), encoding='utf-8').read()
HEAD = tpl[:tpl.index('<title>')]
THEME = re.search(r'<meta name="theme-color".*?<script src="/assets/js/page.js" defer></script>', tpl, re.S).group(0)
HEADER = tpl[tpl.index('<body'):tpl.index('<main')]
FOOTER = tpl[tpl.index('</main>') + len('</main>'):]

def page(path, title, desc, body, crumbs, ld=None, wide=False):
    url = BASE + path
    lds = [{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": BASE + u} for i, (n, u) in enumerate(crumbs + [(title.split(' | ')[0], path)])]}]
    if ld: lds.append(ld)
    cr = ' / '.join(f'<a href="{u}">{E(n)}</a>' for n, u in crumbs)
    out = (HEAD + f'<title>{E(title)}</title>\n<meta name="description" content="{E(desc)}">\n<link rel="canonical" href="{url}">\n'
           f'<meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(desc)}"><meta property="og:url" content="{url}"><meta property="og:type" content="article">\n'
           + THEME + '\n<link rel="stylesheet" href="/guides/guides.css">\n<script src="/guides/guides.js" defer></script>\n'
           + ''.join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>\n' for x in lds)
           + '</head>\n' + HEADER + '<main id="main" class="section">\n  <article class="container prose ' + ('g-hub' if wide else 'g-wrap') + '">\n'
           + f'<nav class="g-crumbs" aria-label="Breadcrumb">{cr}</nav>\n' + body + '\n  </article>\n</main>' + FOOTER)
    f = os.path.join(SITE, path.strip('/') + '.html')
    os.makedirs(os.path.dirname(f), exist_ok=True); open(f, 'w', encoding='utf-8').write(out); URLS.append(path)

SHOT = lambda name, cap, href: (f'<figure class="g-shot"><a href="{href}"><img src="/guides/img/{name}.webp" loading="lazy" alt="{E(cap)}"></a>'
                                f'<figcaption><b>Inside the app.</b> {E(cap)}</figcaption></figure>')
def cta(title, text, href, label, alt=None, img=None):
    a = f'<a class="g-alt" href="{alt[0]}">{E(alt[1])}</a>' if alt else ''
    return (SHOT(img[0], img[1], href) if img else '') + f'<aside class="g-cta"><h2>{E(title)}</h2><p>{E(text)}</p><a class="g-btn" href="{href}">{E(label)}</a>{a}</aside>'

# ---------------- MedLex word parts ----------------
def lesson(slug):
    s = open(os.path.join(SITE, 'medlex/learn/canvas/lessons', slug + '.html'), encoding='utf-8').read()
    return json.loads(re.search(r'id="canvasConfig">(.*?)</script>', s, re.S).group(1))['terms']
gs = open(glob.glob(os.path.join(SITE, 'medlex/glossary.*.js'))[0], encoding='utf-8').read()
GLOSS = json.loads(gs[gs.index('['):gs.rindex(']') + 1])
clean = lambda t: re.sub(r'\s*Think, then flip.*$', '', t or '').strip()
parts = {}
def add(kind, form, meaning, example):
    form, meaning = clean(form), clean(meaning).rstrip('.')
    if not form or not meaning or len(meaning) > 90: return
    slug = re.sub(r'[^a-z0-9]+', '-', form.lower()).strip('-') + '-' + {'prefix': 'prefix', 'suffix': 'suffix', 'root': 'combining-form'}[kind]
    if slug in parts: return
    parts[slug] = dict(kind=kind, form=form, meaning=meaning[0].lower() + meaning[1:] if meaning[:2] != meaning[:2].upper() else meaning, example=clean(example))
for t in lesson('prefixes'):
    if t['category'] in ('Core', 'Extended') and t['form'].endswith('-'): add('prefix', t['form'], t['meaning'], t['example'])
for t in lesson('suffixes'):
    if t['form'].startswith('-') and t['meaning']: add('suffix', t['form'], t['meaning'], t['example'])
for sl in ('basic-word-structure', 'building-vocabulary'):
    for t in lesson(sl):
        if re.fullmatch(r'[a-z]+/[aeio]( · [a-z]+/[aeio])?', t['form'].strip()) and t['meaning']:
            m, _, ex = t['meaning'].partition('|'); add('root', t['form'], m.strip(), (t['example'] or ex).strip())
NAME = {'prefix': 'prefix', 'suffix': 'suffix', 'root': 'combining form'}

def stems(form, kind):
    out = []
    for f in re.split(r'\s*[/·,]\s*(?=[a-z-])', form):
        f = f.strip().strip('-').lower()
        if kind == 'root': f = form.split('/')[0].strip().lower()
        if len(f) >= (2 if kind == 'prefix' else 3): out.append(f)
    return list(dict.fromkeys(out))
def words_for(p):
    hits = []
    for g in GLOSS:
        w = g['term'].lower()
        for s in stems(p['form'], p['kind']):
            ok = w.startswith(s) if p['kind'] == 'prefix' else w.endswith(s) if p['kind'] == 'suffix' else (s in w and len(s) >= 4) or w.startswith(s)
            if ok: hits.append(g); break
    return hits[:8]

# One curated A-Z page (no thin per-part pages). Only clear, self-contained meanings are kept.
BAD = ('spelling', 'corresponding', 'assimilated', 'sometimes', 'depends', 'form of', 'variant', 'before a vowel', ' or -', '/')
def ok(p): return len(p['meaning']) <= 48 and not any(b in p['meaning'].lower() for b in BAD) and len(p['form']) <= 18
def tidy(m):
    m = m.split(';')[0].replace(', depending on context', '').strip().rstrip(',')
    return m[0].upper() + m[1:]
BAD = BAD + ('form used',)
CLEAN = {k: dict(v, meaning=tidy(v['meaning'])) for k, v in parts.items() if ok(v)}
# Drop a single root when a combined entry already lists it (for example dermat/o inside derm/o · dermat/o).
combined = {f.strip() for v in CLEAN.values() if v['kind'] == 'root' and '·' in v['form'] for f in v['form'].split('·')}
CLEAN = {k: v for k, v in CLEAN.items() if not (v['kind'] == 'root' and '·' not in v['form'] and v['form'].strip() in combined)}
order = sorted(CLEAN, key=lambda k: (CLEAN[k]['kind'], CLEAN[k]['form'].strip('-').lower()))
random.seed(11)
def quizq(k, pool):
    t = CLEAN[k]; wrong = random.sample([CLEAN[x]['meaning'] for x in pool if CLEAN[x]['meaning'] != t['meaning']], 3)
    opts = wrong + [t['meaning']]; random.shuffle(opts)
    return (f'<div class="g-q"><p>What does {E(t["form"])} mean?</p>' + ''.join(f'<button type="button"{" data-ok" if o == t["meaning"] else ""}>{E(o)}</button>' for o in opts)
            + f'<div class="g-why" hidden>{E(t["form"])} means {E(t["meaning"].lower())}' + (f', as in {E(t["example"])}.' if t['example'] else '.') + '</div></div>')
COMMON = ['cardi-o-combining-form', 'itis-suffix', 'tachy-prefix', 'brady-prefix', 'ectomy-suffix', 'hepat-o-combining-form', 'hyper-prefix', 'algia-suffix', 'nephr-o-combining-form', 'scopy-suffix']
quiz_keys = [k for k in COMMON if k in CLEAN][:8]
for k in order:
    if len(quiz_keys) >= 8: break
    if k not in quiz_keys: quiz_keys.append(k)
def group(kind):
    ks = [k for k in order if CLEAN[k]['kind'] == kind]
    return ('<ul class="g-dict">' + ''.join(
        f'<li id="{k}" data-f="{E((CLEAN[k]["form"] + " " + CLEAN[k]["meaning"] + " " + CLEAN[k]["example"]).lower())}"><b>{E(CLEAN[k]["form"])}</b><span>{E(CLEAN[k]["meaning"])}</span>'
        + (f'<i>{E(CLEAN[k]["example"])}</i>' if CLEAN[k]['example'] else '') + '</li>' for k in ks) + '</ul>', len(ks))
gp, np_ = group('prefix'); gsx, ns = group('suffix'); gr, nr = group('root')
page('/guides/medical-word-parts', 'Medical prefixes, suffixes and roots: meanings and examples | MedLex',
     f'{np_} medical prefixes, {ns} suffixes and {nr} combining forms with plain meanings and examples, plus a free quick check. From the MedLex course.',
     '<p class="eyebrow">MedLex guide</p><h1 class="section-title">Medical prefixes, suffixes and roots</h1>'
     '<p class="g-lead">Most medical words are built from a few small parts. Learn the parts once and you can read words you have never seen before.</p>'
     '<div class="g-break" aria-label="Example"><span><b>tachy</b> fast</span><span>+</span><span><b>card</b> heart</span><span>+</span><span><b>ia</b> condition</span><span>=</span><span><b>tachycardia</b>: a fast heart rate</span></div>'
     '<h2>Quick check: 8 common parts</h2><p>Tap an answer to see if you are right.</p><div class="g-quiz">' + ''.join(quizq(k, order) for k in quiz_keys) + '</div><p class="g-score" aria-live="polite"></p>'
     f'<h2>Find a word part</h2><input class="g-filter" type="search" placeholder="Try cardi, kidney or inflammation" aria-label="Search word parts">'
     '<p class="g-note">UK and US English spell some parts differently, for example -aemia and -emia, or haemat/o and hemat/o. Both mean the same.</p>'
     f'<h2>Prefixes <small class="g-count">{np_}</small></h2><p>A prefix sits at the front and changes the meaning: where, how much, how fast.</p>{gp}'
     f'<h2>Suffixes <small class="g-count">{ns}</small></h2><p>A suffix sits at the end and tells you the kind of word: a condition, a procedure, a test.</p>{gsx}'
     f'<h2>Combining forms <small class="g-count">{nr}</small></h2><p>A combining form is the root plus a linking vowel. It names the body part or idea.</p>{gr}'
     + cta('Learn them for good', 'MedLex teaches 1,480 terms in 26 body-system modules, with short daily practice. The starter lessons are free, with no card.', 'https://medlex.healthcarecrownacademy.co.uk/', 'Start MedLex free', img=('mx-term', 'MedLex shows every word as colour-coded parts, with the plain meaning and the clinical definition.')),
     [('Guides', '/guides')])

# ---------------- Gulf exam guides ----------------
G = json.load(open(os.path.join(ROOT, 'tools/guides/gulf-profiles.json'), encoding='utf-8'))
P = G['PROFILES']
# Customer-facing wording, written from the verified exam profiles (tools/guides/gulf-profiles.json). Where official
# documents disagree or say nothing, we say so plainly and point to the regulator.
EX = {
 'snle': dict(ex='saudi', slug='saudi-snle-nursing-exam', short='Saudi SNLE', place='Saudi Arabia',
   time='4 hours', timeNote='Two blocks of 100 questions, 120 minutes each, with a break between them.',
   pass_='500', passNote='A scaled score of 500, on a scale from 200 to 800. It is not a percentage.',
   attempts='The SCFHS applicant guide describes up to four attempts a year, but other SCFHS pages describe the limits differently. Check your own allowance with SCFHS before you book.'),
 'qatar': dict(ex='qatar', slug='qatar-dhp-nursing-exam', short='Qatar DHP', place='Qatar',
   time='3 hours', timeNote='The current DHP exam page lists 3 hours. An older official blueprint says 3½ hours, so confirm the time when you book.',
   pass_='50%', passNote='DHP publishes 50% as the minimum score.',
   attempts='DHP documents describe up to five attempts for nurses. Confirm with DHP before you book.'),
 'dubai': dict(ex='dubai', slug='dubai-dha-nursing-exam', short='Dubai DHA', place='Dubai',
   time='3 hours', timeNote='The 3 hours includes registration and the introduction, so the question time is a little shorter.',
   pass_='50%', passNote='DHA publishes 50% as the pass mark. Results are reported as pass or fail.',
   attempts='Across UAE health authorities you generally have three attempts. A fourth needs permission, and after a third failure there can be a wait before trying again. Confirm with DHA.'),
 'abudhabi': dict(ex='abudhabi', slug='abu-dhabi-doh-nursing-exam', short='Abu Dhabi DOH', place='Abu Dhabi',
   time='3 hours', timeNote='A 2024 DOH circular describes the Registered Nurse exam as 150 multiple-choice questions over 3 hours.',
   pass_='Ask DOH', passNote='DOH has not published the pass mark in the documents we checked. Ask DOH when you book.',
   attempts='UAE-wide rules generally allow three attempts, with a possible final attempt subject to approval. Confirm with DOH.'),
}
STUDY = [('Day 1', 'Read the official guide. Note the topics, the time and the rules.'), ('Day 2', 'Answer 30 mixed questions. List your weakest topics.'),
         ('Day 3', 'Study your two weakest topics, then answer 30 questions on them.'), ('Day 4', 'Priority and safety: airway, breathing, circulation, then risk.'),
         ('Day 5', 'Answer a timed block at exam pace. Review every miss and why.'), ('Day 6', 'Take a full mock, or two timed blocks, and review again.'),
         ('Day 7', 'Light review only. Check your ID, booking and test-centre rules, then sleep.')]
def gulf_page(k):
    p, x = P[k], EX[k]
    known = all(d['count'] for d in p['domains'])
    topics = ('<ul class="g-bars">' + ''.join(f'<li><span>{E(d["label"])}</span><b>{d["count"]} questions</b><i style="--w:{round(d["count"] * 100 / p["questions"])}%"></i></li>' for d in p['domains']) + '</ul>'
              if known else '<p>The regulator has not published how many questions come from each topic. Expect the main nursing areas:</p><ul>' + ''.join(f'<li>{E(d["label"])}</li>' for d in p['domains']) + '</ul>')
    src = ''.join(f'<li><a href="{E(s_["url"])}" rel="noopener">{E(s_["label"])}</a></li>' for s_ in p['sources'])
    body = (f'<p class="eyebrow">Gulf Region nursing exams</p><h1 class="section-title">{E(x["short"])} nursing exam: what to expect and how to prepare</h1>'
            f'<p class="g-lead">The {E(p["fullName"])} is set by the {E(p["regulator"])}. Here is the format, the topics and a 7-day plan, from the regulator\'s own documents.</p>'
            '<div class="g-facts">' + ''.join(f'<div class="g-fact"><b>{E(v)}</b><span>{E(l)}</span></div>' for v, l in [(p['questions'], 'Questions'), (x['time'], 'Time'), (x['pass_'], 'Pass mark')]) + '</div>'
            f'<h2>Format</h2><p>{E(x["timeNote"])}</p><p>{E(x["passNote"])}</p>'
            f'<h2>Topics</h2>{topics}<h2>Attempts</h2><p>{E(x["attempts"])}</p>'
            '<h2>A 7-day study plan</h2><ol class="g-days">' + ''.join(f'<li><b>{d}</b> {E(t)}</li>' for d, t in STUDY) + '</ol>'
            f'<h2>Official sources</h2><p>Rules change, so check the regulator before you book.</p><ul>{src}</ul>'
            '<p class="g-note">Healthcare Crown Academy is an independent study provider. Our questions are original practice material, not official exam questions. We are not endorsed by SCFHS, DHP, DHA or DOH.</p>'
            + cta(f'Practise for the {x["place"]} exam', 'Try 10 questions free. The Gulf Pass covers all four Gulf exams, with 1,297 clinically reviewed questions, mock exams and 67 clinical reasoning tools. Paid once, never renews.',
                  f'https://snle.healthcarecrownacademy.co.uk/#exam/{k}', 'Try 10 questions free', (f'/subscribe?exam={x["ex"]}', 'See the Gulf Pass'), img=('gr-qb', 'Every question shows the reasoning, a clinical pearl and the trap to avoid.'))
            + '<h2>The other Gulf exams</h2><ul class="g-grid">' + ''.join(f'<li><a href="/guides/gulf/{EX[o]["slug"]}">{E(EX[o]["short"])}</a></li>' for o in P if o != k) + '<li><a href="/guides/gulf/compare-gulf-nursing-exams">Compare all four</a></li></ul>')
    page(f'/guides/gulf/{x["slug"]}', f'{x["short"]} nursing exam: format, topics, pass mark and a 7-day plan',
         f'{x["short"]} Registered Nurse exam: {p["questions"]} questions in {x["time"]}, the pass mark, the topics, attempts and a free 7-day study plan, from official sources.',
         body, [('Guides', '/guides'), ('Gulf nursing exams', '/guides/gulf/compare-gulf-nursing-exams')],
         {"@context": "https://schema.org", "@type": "Article", "headline": f'{x["short"]} nursing exam: what to expect and how to prepare', "dateModified": "2026-10-30", "author": {"@type": "Organization", "name": "Healthcare Crown Academy"}, "publisher": {"@type": "Organization", "name": "Healthcare Crown Academy"}})
for k in P: gulf_page(k)
cards = '<div class="g-cards">' + ''.join(
    f'<a class="g-card" href="/guides/gulf/{EX[k]["slug"]}"><span class="g-tag">{E(EX[k]["place"])}</span><b>{E(EX[k]["short"])}</b><small>{E(P[k]["regulator"])}</small>'
    f'<dl><div><dt>Questions</dt><dd>{P[k]["questions"]}</dd></div><div><dt>Time</dt><dd>{E(EX[k]["time"])}</dd></div><div><dt>Pass mark</dt><dd>{E(EX[k]["pass_"])}</dd></div></dl><span class="g-more">Full guide</span></a>' for k in P) + '</div>'
page('/guides/gulf/compare-gulf-nursing-exams', 'SNLE, DHP, DHA or DOH? The Gulf nursing exams compared',
     'Which Gulf nursing exam do you need? Compare the Saudi SNLE, Qatar DHP, Dubai DHA and Abu Dhabi DOH exams: questions, time and pass mark, from official sources.',
     '<p class="eyebrow">Gulf Region nursing exams</p><h1 class="section-title">Which Gulf nursing exam do you need?</h1>'
     '<p class="g-lead">It depends on where you want to work. Saudi Arabia, Qatar, Dubai and Abu Dhabi each have their own regulator and exam. Dubai and Abu Dhabi are both in the UAE but use different exams.</p>'
     + cards + '<p class="g-note">Figures come from each regulator\'s published documents, linked on each exam guide. Check with the regulator before you book.</p>'
     + cta('One pass, all four exams', 'The Gulf Pass covers SNLE, DHP, DHA and DOH and includes the Crown Pass. From US$29 for 1 month, paid once, never renews.', '/subscribe?plan=gulf', 'See the Gulf Pass', ('https://snle.healthcarecrownacademy.co.uk/', 'Try 10 questions free'), img=('gr-landing', 'One studio for Saudi Arabia, Qatar, Dubai and Abu Dhabi.')),
     [('Guides', '/guides')])
META = {k: (EX[k]['ex'], EX[k]['slug'], EX[k]['short'] + ' nursing exam', EX[k]['place']) for k in P}

# ---------------- Free improvement calculators ----------------
LSS = cta('Use 30 DMAIC tools on your own project', 'The Lean Six Sigma Green Belt for Healthcare toolkit has 9 live statistics engines, 10 simulations, a knowledge exam and a Certificate of Completion. Free to try.', 'https://lss.healthcarecrownacademy.co.uk/', 'Try the toolkit free', img=('ls-spc', 'The toolkit charts your own ward data and flags real signals, not noise.'))
SAMPLE = '12.1 11.8 12.4 12.0 11.6 12.3 12.2 11.9 12.5 12.0 11.7 12.1 12.2 11.9 12.0'
tools = [
 ('process-capability-cpk-calculator', 'cpk', 'Process capability calculator: Cp, Cpk, Pp and Ppk', 'Free Cp, Cpk, Pp and Ppk calculator. Paste your data and specification limits; get within and overall capability with a plain-English reading.',
  'Paste your measurements in time order, then enter the lower and/or upper specification limit.',
  f'<label style="grid-column:1/-1">Measurements (spaces or commas)<textarea name="data">{SAMPLE}</textarea></label><label>Lower specification limit (LSL)<input name="lsl" inputmode="decimal" value="11"></label><label>Upper specification limit (USL)<input name="usl" inputmode="decimal" value="13"></label>',
  '<h2>Cp, Cpk, Pp and Ppk in plain words</h2><ul><li><b>Cp</b> compares the width of the limits with the spread of the process.</li><li><b>Cpk</b> also checks how centred the process is. It uses the nearer limit.</li><li><b>Within</b> results use the short-term spread from the moving range (MR̄ ÷ 1.128). <b>Overall</b> results (Pp, Ppk) use the standard deviation of all the data.</li><li>A common target is Cpk of 1.33 or more.</li></ul>'),
 ('sigma-level-dpmo-calculator', 'sigma', 'Sigma level and DPMO calculator', 'Free DPMO and sigma level calculator for healthcare and service processes. Enter units, opportunities and defects.',
  'Count how many units you checked, how many ways each could go wrong, and how many defects you found.',
  '<label>Units checked<input name="units" inputmode="numeric" value="500"></label><label>Opportunities for a defect per unit<input name="opps" inputmode="numeric" value="4"></label><label>Defects found<input name="defects" inputmode="numeric" value="18"></label>',
  '<h2>Example from a ward</h2><p>You audit 500 medicine administrations. Each has 4 checks that could be missed (patient, drug, dose, time). You find 18 missed checks. DPMO = 18 ÷ (500 × 4) × 1,000,000 = 9,000.</p>'),
 ('control-chart-calculator', 'imr', 'Control chart calculator (individuals and moving range)', 'Free I-MR control chart calculator: paste values in time order to get the centre line, control limits and points out of control, with a chart.',
  'Paste one value per time period, in time order, for example daily waiting times in minutes.',
  '<label style="grid-column:1/-1">Values in time order<textarea name="data">34 31 38 29 33 36 30 35 32 41 33 30 37 34 58 33 31</textarea></label>',
  '<h2>Reading the chart</h2><ul><li>Points outside the red limits point to a special cause worth investigating.</li><li>A run of 8 or more points on one side of the centre line suggests the process has shifted.</li><li>Do not change a stable process because of one bad day: that adds variation.</li></ul>'),
]
for slug, kind, title, desc, intro, fields, extra in tools:
    page(f'/tools/{slug}', title + ' | Free tool', desc,
         f'<p class="eyebrow">Free improvement tool</p><h1 class="section-title">{E(title)}</h1><p class="g-lead">{E(intro)} Everything runs in your browser; nothing is uploaded.</p>'
         f'<form class="g-calc" data-calc="{kind}">{fields}</form><div class="g-out" aria-live="polite"></div>{extra}' + LSS
         + '<h2>More free tools</h2><ul class="g-grid">' + ''.join(f'<li><a href="/tools/{s}">{E(t)}</a></li>' for s, _, t, *_ in tools if s != slug) + '</ul>',
         [('Guides', '/guides'), ('Free tools', '/guides#tools')],
         {"@context": "https://schema.org", "@type": "WebApplication", "name": title, "applicationCategory": "EducationalApplication", "operatingSystem": "Any", "offers": {"@type": "Offer", "price": "0", "priceCurrency": "GBP"}})

# ---------------- Carecraft situations ----------------
cs = open(glob.glob(os.path.join(SITE, 'carecraft/app.*.js'))[0], encoding='utf-8').read()
LESSONS, _ = json.JSONDecoder().raw_decode(cs[cs.index('const lessons=') + len('const lessons='):])
REFS = {k: {'name': n, 'url': u} for k, n, u in re.findall(r'"([a-z0-9-]+)":\{"name":"([^"]+)","url":"([^"]+)"\}', cs)}
FREE_CC = [l['id'] for l in LESSONS[:6]]
CC = 'https://carecraft.healthcarecrownacademy.co.uk/'
for l in LESSONS[:6]:
    free = True
    refs = ''.join(f'<li><a href="{E(REFS[r]["url"])}" rel="noopener">{E(REFS[r]["name"])}</a></li>' for r in l.get('refs', []) if r in REFS)
    steps = ''.join(f'<li><b>{E(a)}</b>. {E(b)}</li>' for a, b in l['steps'])
    if free:
        opts = ''.join(f'<button type="button"{" data-ok" if i == l["correct"] else ""}>{E(a)}</button>' for i, a in enumerate(l['answers']))
        scen = f'<div class="g-quiz"><div class="g-q"><p>{E(l["question"])}</p>{opts}<div class="g-why" hidden>{E(l["feedback"])}</div></div></div><p class="g-score" aria-live="polite"></p>'
        how = f'<h2>What to do</h2><ol>{steps}</ol>'
    else:
        scen = f'<div class="g-q"><p>{E(l["question"])}</p>' + ''.join(f'<p style="font-weight:400!important">{chr(65 + i)}. {E(a)}</p>' for i, a in enumerate(l['answers'])) + '</div><p>The answer, with why each option is right or wrong, is in Carecraft.</p>'
        how = '<h2>What you will practise</h2><ul>' + ''.join(f'<li>{E(a)}</li>' for a, _ in l['steps']) + '</ul>'
    body = (f'<p class="eyebrow">Carecraft · {E(l["tag"])}</p><h1 class="section-title">{E(l["title"])}</h1><p class="g-lead">{E(l["description"])}</p>'
            + how + f'<p class="g-note"><b>Key point:</b> {E(l["takeaway"])}</p><h2>Try a real situation</h2>{scen}'
            + (f'<h2>Reflect</h2><p>{E(l["reflect"])}</p>' if free and l.get('reflect') else '')
            + (f'<h2>Evidence and guidance</h2><ul>{refs}</ul>' if refs else '')
            + cta('One real situation, 60 seconds a day', 'Carecraft trains what to say and do: 30 short lessons, 90 visual guides and practice that targets your weak spots. The first lessons are free.', CC, 'Start Carecraft free' if free else 'See the answer in Carecraft', ('/guides/carecraft', 'All situations'), img=('cc-scenario', 'One real situation a day: choose a reply and see why the strongest one works.')))
    page(f'/guides/carecraft/{l["id"]}', f'{l["title"]}: a practical guide for nurses and carers | Carecraft', l['description'] + ' A short practical guide with a real situation to try.',
         body, [('Guides', '/guides'), ('Carecraft situations', '/guides/carecraft')],
         {"@context": "https://schema.org", "@type": "LearningResource", "name": l['title'], "description": l['description'], "learningResourceType": "Scenario", "isAccessibleForFree": free})
page('/guides/carecraft', 'Real situations in care: what to say and do | Carecraft',
     'Short practical guides for nurses, students and carers: communication, handover, safety, escalation, dignity and teamwork, each with a real situation to try.',
     '<p class="eyebrow">Carecraft guides</p><h1 class="section-title">Real situations in care: what to say and do</h1><p class="g-lead">Six moments that matter on every shift. Each guide gives the steps, a real situation to try and the evidence behind it.</p><ul class="g-grid">'
     + ''.join(f'<li><a href="/guides/carecraft/{l["id"]}">{E(l["title"])}<small>{E(l["tag"])}</small></a></li>' for l in LESSONS[:6]) + '</ul>'
     + f'<p>The Carecraft app has {len(LESSONS)} lessons like these, with visual guides and practice that targets your weak spots.</p>'
     + cta('60 seconds a day', 'Start with the free Carecraft lessons. No card needed.', CC, 'Start Carecraft free', img=('cc-scenario', 'One real situation a day: choose a reply and see why the strongest one works.')), [('Guides', '/guides')])

# ---------------- Serein practices ----------------
ss = open(glob.glob(os.path.join(SITE, 'serein/app.*.js'))[0], encoding='utf-8').read()
j = ss.rfind('[', 0, ss.index('{"id":"tide"'))
PRACT, _ = json.JSONDecoder().raw_decode(ss[j:])
SR = 'https://serein.healthcarecrownacademy.co.uk/'
sec = ''.join(
    f'<section class="g-prac" id="{p["id"]}"><p class="g-tag">{E(p["category"])} · {E(p["duration"])}</p><h2>{E(p["title"])}</h2><p>{E(p["desc"])}</p>'
    + '<ol>' + ''.join(f'<li><b>{E(a)}.</b> {E(b)}</li>' for a, b in p.get('steps', [])) + '</ol>'
    + f'<p class="g-safe"><b>Safety:</b> {E(p["safety"])}</p></section>' for p in PRACT)
page('/guides/serein', 'Short calming practices for nurses and carers | Serein',
     'Fifteen short breathing, grounding and movement practices for healthcare staff, each with steps and safety notes. Free, with a guided version in Serein.',
     '<p class="eyebrow">Serein guide</p><h1 class="section-title">Short calming practices for people who care for others</h1>'
     '<p class="g-lead">Each practice takes one to five minutes and fits into a break or the walk to the car. Pick one, read the steps, and try it now.</p>'
     '<ul class="g-grid">' + ''.join(f'<li><a href="#{p["id"]}">{E(p["title"])}<small>{E(p["category"])} · {E(p["duration"])}</small></a></li>' for p in PRACT) + '</ul>'
     + sec + '<p class="g-note">Serein offers short calming practices. It is not a treatment and does not replace professional care. If you are struggling, talk to someone you trust or your doctor.</p>'
     + cta('Do them with a guide', 'Serein guides you through every practice with gentle timing and sound. Always free, for everyone who cares for others.', SR, 'Open Serein free', img=('sr-breathe', 'Follow the glowing breath at your own pace. Nothing is monitored.')),
     [('Guides', '/guides')])

# ---------------- Study skills (Lumen) ----------------
LU = 'https://lumen.healthcarecrownacademy.co.uk/'
STUDYG = [
 ('active-recall-for-nursing-students', 'Active recall for nursing students', 'Test yourself instead of rereading: a simple method to remember lectures for longer.',
  ['Close your notes and write down everything you remember about one topic.', 'Open your notes and mark what you missed or got wrong.', 'Turn each gap into a short question you can answer in one line.', 'Answer those questions again tomorrow, without looking first.'],
  'Rereading feels productive because the page looks familiar. Trying to remember is harder, and that effort is what makes memory stick. Use your own lecture slides as the source, so what you practise matches what you are taught.'),
 ('spaced-repetition-study-plan', 'Spaced repetition: a simple study plan', 'Review just before you forget: how to space your revision so it lasts until the exam.',
  ['Learn a topic today and test yourself on it.', 'Review it again after 1 day.', 'Then after about 3 days, then a week, then a few weeks.', 'If you get a card wrong, bring it back sooner.'],
  'Spacing reviews out takes less total time than cramming and lasts longer. A card system can schedule this for you so you only see what is due.'),
 ('turn-lecture-slides-into-flashcards', 'How to turn lecture slides into flashcards', 'A 10-minute method to turn one lecture into recall cards you will actually use.',
  ['Skim the slides and highlight only what you would be asked about.', 'Write one question per highlight, with a short answer.', 'Keep one idea per card. Split long cards.', 'Add a card for each mistake you make in practice questions.'],
  'Good cards are short and specific. "What does -itis mean?" works better than "Explain inflammation". Make cards from your own course material so they match your exams.'),
 ('exam-week-study-plan', 'Exam week: a calm study plan', 'How to use the last 7 days before an exam: what to study, when to stop, and how to sleep.',
  ['List every topic and mark it strong, okay or weak.', 'Spend most time on weak topics, with short tests, not rereading.', 'Do one timed practice session to rehearse the real thing.', 'The night before: light review only, then sleep.'],
  'Sleep helps you keep what you learned during the day. A tired brain recalls less, so an all-nighter usually costs more than it gains.'),
]
for slug, title, desc, steps, why in STUDYG:
    page(f'/guides/study/{slug}', f'{title} | Lumen', desc,
         f'<p class="eyebrow">Study skills</p><h1 class="section-title">{E(title)}</h1><p class="g-lead">{E(desc)}</p><h2>How to do it</h2><ol>' + ''.join(f'<li>{E(x)}</li>' for x in steps) + f'</ol><h2>Why it works</h2><p>{E(why)}</p>'
         + cta('Do this with your own notes', 'Lumen turns your lecture PDFs and photos of notes into recall cards with spaced practice and a focus planner. Free to start.', LU, 'Start Lumen free', ('/guides', 'More guides'), img=('lm-magnify', 'Read closely, magnify, highlight and turn what matters into recall cards.')),
         [('Guides', '/guides'), ('Study skills', '/guides#study')])

# ---------------- Evinca: thank a nurse ----------------
EV = 'https://evinca.healthcarecrownacademy.co.uk/en'
page('/guides/how-to-thank-a-nurse', 'How to thank a nurse who cared for you (and make it count) | Evinca',
     'Simple ways to thank a nurse, midwife or carer, what to write, and how to share your thanks so their work is recognised.',
     '<p class="eyebrow">Evinca guide</p><h1 class="section-title">How to thank a nurse who cared for you</h1><p class="g-lead">A specific thank-you means more than a general one. Say what they did, and what it changed for you.</p>'
     '<h2>What to write</h2><ol><li>Their name or role, and the ward or service.</li><li>The moment you remember: what they did or said.</li><li>What it changed for you or your family.</li><li>A simple thank you.</li></ol>'
     '<h2>An example</h2><p class="g-note">“To the night nurse on Ward 7 who sat with my mother when she was frightened on 3 March: you stayed until she slept and explained everything to me in the morning. It made a hard week bearable. Thank you.”</p>'
     '<h2>Where to send it</h2><ul><li>To the ward or service directly, or to the hospital’s patient experience team.</li><li>Through Evinca’s thank-you page: it takes a minute and your message reaches them through the hospital. Never include medical details you would not want shared.</li></ul>'
     + cta('Send your thanks through Evinca', 'Write a few words to the nurse, doctor or member of staff who cared for you. Evinca passes your message to them through the hospital.', EV + '/thank', 'Say thank you', (EV + '/register', 'See the Honorees Register')),
     [('Guides', '/guides')])

# ---------------- Guides hub ----------------
FEAT = [
 ('/guides/gulf/compare-gulf-nursing-exams', 'gr-landing-card', 'Gulf nursing exams', 'Which Gulf exam do you need?', 'SNLE, DHP, DHA or DOH: questions, time and pass mark side by side.'),
 ('/guides/medical-word-parts', 'mx-term-card', 'Medical words', 'Decode any medical word', f'{np_ + ns + nr} prefixes, suffixes and roots with plain meanings and a quick check.'),
 ('/tools/control-chart-calculator', 'ls-spc-card', 'Free tool', 'Signal or noise? Chart your ward data', 'Paste your numbers. Get control limits and a chart in seconds.'),
 ('/guides/carecraft/communication', 'cc-scenario-card', 'Care situations', 'Would you say the right thing?', 'Try a real ward situation and see why the strongest reply works.'),
 ('/guides/serein', 'sr-breathe-card', 'Wellbeing', 'Calm in two minutes', '15 short practices for a hard shift, with steps and safety notes.'),
 ('/guides/how-to-thank-a-nurse', 'ex-comein-card', 'Say thank you', 'Thank the nurse who cared for you', 'What to write, an example, and how your words reach them.'),
]
feat = '<div class="g-feats">' + ''.join(
    f'<a class="g-feat" href="{h}"><span class="g-img"><img src="/guides/img/{i}.webp" alt="" loading="{"eager" if n < 2 else "lazy"}"></span><span class="g-tag">{E(t)}</span><b>{E(ti)}</b><span class="g-desc">{E(d)}</span></a>'
    for n, (h, i, t, ti, d) in enumerate(FEAT)) + '</div>'
li = lambda items: '<ul class="g-grid">' + ''.join(f'<li><a href="{h}">{E(t)}' + (f'<small>{E(sm)}</small>' if sm else '') + '</a></li>' for h, t, sm in items) + '</ul>'
page('/guides', 'Free guides and tools for nurses and healthcare students | Healthcare Crown Academy',
     'Free, practical guides from Healthcare Crown Academy: Gulf nursing exams, medical word parts, real care situations, study skills, calming practices and quality improvement tools.',
     '<p class="eyebrow">Free guides</p><h1 class="section-title">Free guides and tools</h1><p class="g-lead">Practical guides from the makers of MedLex, Carecraft, Serein, Lumen, the Gulf Region Nursing studio and the Green Belt toolkit. Free to read, no sign-in.</p>'
     '<h2>Start here</h2>' + feat
     + '<h2>Gulf nursing exams</h2>' + li([('/guides/gulf/compare-gulf-nursing-exams', 'Compare all four exams', '')] + [(f'/guides/gulf/{EX[k]["slug"]}', EX[k]['short'] + ' guide', EX[k]['place']) for k in P])
     + '<h2>Care situations</h2>' + li([(f'/guides/carecraft/{l["id"]}', l['title'], l['tag']) for l in LESSONS[:6]])
     + '<h2 id="study">Study skills</h2>' + li([(f'/guides/study/{s_}', t_, '') for s_, t_, *_ in STUDYG])
     + '<h2 id="tools">Free quality improvement tools</h2>' + li([(f'/tools/{s_}', t_, '') for s_, _, t_, *_ in tools])
     + '<h2>Medical words, wellbeing and thanks</h2>' + li([('/guides/medical-word-parts', 'Medical prefixes, suffixes and roots', ''), ('/guides/serein', 'Short calming practices', '15 practices'), ('/guides/how-to-thank-a-nurse', 'How to thank a nurse', '')]),
     [('Home', '/')], wide=True)

json.dump(URLS, open(os.path.join(ROOT, 'tools/guides/urls.json'), 'w'), indent=0)
# Keep the guides in the main sitemap, between markers, so one submitted sitemap covers everything.
sm = os.path.join(SITE, 'sitemap.xml'); x = open(sm, encoding='utf-8').read()
x = re.sub(r'\s*<!-- guides:start -->.*?<!-- guides:end -->', '', x, flags=re.S)
block = '\n  <!-- guides:start -->\n' + ''.join(f'  <url><loc>{BASE}{u}</loc><lastmod>2026-10-30</lastmod><priority>{"0.8" if u.count("/") <= 2 else "0.6"}</priority></url>\n' for u in URLS) + '  <!-- guides:end -->'
open(sm, 'w', encoding='utf-8').write(x.replace('</urlset>', block + '\n</urlset>'))
print(len(URLS), 'pages;', np_, 'prefixes', ns, 'suffixes', nr, 'combining forms')
