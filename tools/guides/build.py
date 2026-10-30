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

tpl = open(os.path.join(SITE, 'refunds.html'), encoding='utf-8').read()
HEAD = tpl[:tpl.index('<title>')]
THEME = re.search(r'<meta name="theme-color".*?<script src="/assets/js/page.js" defer></script>', tpl, re.S).group(0)
HEADER = tpl[tpl.index('<body'):tpl.index('<main')]
FOOTER = tpl[tpl.index('</main>') + len('</main>'):]

def page(path, title, desc, body, crumbs, ld=None):
    url = BASE + path
    lds = [{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": BASE + u} for i, (n, u) in enumerate(crumbs + [(title.split(' | ')[0], path)])]}]
    if ld: lds.append(ld)
    cr = ' / '.join(f'<a href="{u}">{E(n)}</a>' for n, u in crumbs)
    out = (HEAD + f'<title>{E(title)}</title>\n<meta name="description" content="{E(desc)}">\n<link rel="canonical" href="{url}">\n'
           f'<meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(desc)}"><meta property="og:url" content="{url}"><meta property="og:type" content="article">\n'
           + THEME + '\n<link rel="stylesheet" href="/guides/guides.css">\n<script src="/guides/guides.js" defer></script>\n'
           + ''.join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>\n' for x in lds)
           + '</head>\n' + HEADER + '<main id="main" class="section">\n  <article class="container prose g-wrap">\n'
           + f'<nav class="g-crumbs" aria-label="Breadcrumb">{cr}</nav>\n' + body + '\n  </article>\n</main>' + FOOTER)
    f = os.path.join(SITE, path.strip('/') + '.html')
    os.makedirs(os.path.dirname(f), exist_ok=True); open(f, 'w', encoding='utf-8').write(out); URLS.append(path)

def cta(title, text, href, label, alt=None):
    a = f'<a class="g-alt" href="{alt[0]}">{E(alt[1])}</a>' if alt else ''
    return f'<aside class="g-cta"><h2>{E(title)}</h2><p>{E(text)}</p><a class="g-btn" href="{href}">{E(label)}</a>{a}</aside>'

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

random.seed(7)
order = sorted(parts, key=lambda k: (parts[k]['kind'], parts[k]['form'].lower()))
for i, slug in enumerate(order):
    p = parts[slug]; kind = NAME[p['kind']]
    same = [k for k in order if parts[k]['kind'] == p['kind'] and k != slug]
    near = [order[(i + d) % len(order)] for d in (1, 2, 3, 4, -1, -2)]
    near = [k for k in near if parts[k]['kind'] == p['kind']][:4] or same[:4]
    words = words_for(p)
    def q(target):
        t = parts[target]; wrong = random.sample([parts[k]['meaning'] for k in same if parts[k]['meaning'] != t['meaning']], 3)
        opts = wrong + [t['meaning']]; random.shuffle(opts)
        btn = ''.join(f'<button type="button"{" data-ok" if o == t["meaning"] else ""}>{E(o)}</button>' for o in opts)
        return f'<div class="g-q"><p>What does {E(t["form"])} mean?</p>{btn}<div class="g-why" hidden>{E(t["form"])} means {E(t["meaning"])}.' + (f' Example: {E(t["example"])}.' if t['example'] else '') + '</div></div>'
    ex = f' A common example is <b>{E(p["example"])}</b>.' if p['example'] else ''
    wl = ''.join(f'<li><b>{E(g["term"])}</b>: {E(g["plain"])}</li>' for g in words)
    body = (f'<p class="eyebrow">Medical {kind}</p>\n<h1 class="section-title">{E(p["form"])} meaning</h1>\n'
            f'<p class="g-lead">The medical {kind} <b>{E(p["form"])}</b> means <b>{E(p["meaning"])}</b>.{ex}</p>\n'
            + (f'<h2>Words that use {E(p["form"])}</h2><ul>{wl}</ul>' if words else '')
            + '<h2>How to decode a medical word</h2><p>Split the word into its parts: a prefix at the front, a root in the middle and a suffix at the end. Read the suffix first, then the prefix, then the root. Learn each part once and you can read many new words.</p>'
            + f'<h2>Quick check</h2><p>Five questions. Tap an answer to see if you are right.</p><div class="g-quiz">{q(slug)}{"".join(q(k) for k in near)}</div><p class="g-score" aria-live="polite"></p>'
            + '<h2>Related word parts</h2><ul class="g-grid">' + ''.join(f'<li><a href="/guides/medical-word-parts/{k}">{E(parts[k]["form"])}<small>{E(parts[k]["meaning"])}</small></a></li>' for k in near) + '</ul>'
            + cta('Learn medical words by their parts', 'MedLex teaches 1,480 terms in 26 body-system modules, with spaced practice. The starter lessons are free, with no card.', 'https://medlex.healthcarecrownacademy.co.uk/', 'Start MedLex free', ('/guides/medical-word-parts', 'All word parts')))
    ld = {"@context": "https://schema.org", "@type": "DefinedTerm", "name": p['form'], "description": f'Medical {kind} meaning {p["meaning"]}', "inDefinedTermSet": BASE + '/guides/medical-word-parts'}
    page(f'/guides/medical-word-parts/{slug}', f'{p["form"]} meaning: medical {kind} explained | MedLex',
         f'{p["form"]} is a medical {kind} meaning {p["meaning"]}. See example words and test yourself with a free 5-question check.',
         body, [('Guides', '/guides'), ('Medical word parts', '/guides/medical-word-parts')], ld)

def grid(kind):
    ks = [k for k in order if parts[k]['kind'] == kind]
    return f'<ul class="g-grid">' + ''.join(f'<li data-f="{E((parts[k]["form"] + " " + parts[k]["meaning"]).lower())}"><a href="/guides/medical-word-parts/{k}">{E(parts[k]["form"])}<small>{E(parts[k]["meaning"])}</small></a></li>' for k in ks) + '</ul>', len(ks)
gp, np_ = grid('prefix'); gsx, ns = grid('suffix'); gr, nr = grid('root')
page('/guides/medical-word-parts', 'Medical prefixes, suffixes and roots: meanings A to Z | MedLex',
     f'Free list of {np_} medical prefixes, {ns} suffixes and {nr} combining forms with meanings and examples. Search the list and test yourself.',
     '<p class="eyebrow">MedLex guide</p><h1 class="section-title">Medical prefixes, suffixes and roots</h1>'
     f'<p class="g-lead">Most medical words are built from a few parts. Learn the parts and you can read words you have never seen. This free list has {np_} prefixes, {ns} suffixes and {nr} combining forms, each with a meaning and a quick check.</p>'
     '<input class="g-filter" type="search" placeholder="Search, for example cardi or inflammation" aria-label="Search word parts">'
     f'<h2>Prefixes</h2>{gp}<h2>Suffixes</h2>{gsx}<h2>Combining forms</h2>{gr}'
     + cta('Practise them every day', 'MedLex turns these parts into short lessons and spaced practice. Free to start.', 'https://medlex.healthcarecrownacademy.co.uk/', 'Start MedLex free'),
     [('Guides', '/guides')])

# ---------------- Gulf exam guides ----------------
G = json.load(open(os.path.join(ROOT, 'tools/guides/gulf-profiles.json'), encoding='utf-8'))
P, RN = G['PROFILES'], G['RETAKE_NOTES']
META = {'snle': ('saudi', 'saudi-snle-nursing-exam', 'Saudi SNLE nursing exam', 'Saudi Arabia'),
        'qatar': ('qatar', 'qatar-dhp-nursing-exam', 'Qatar DHP nursing exam', 'Qatar'),
        'dubai': ('dubai', 'dubai-dha-nursing-exam', 'Dubai DHA nursing exam', 'Dubai'),
        'abudhabi': ('abudhabi', 'abu-dhabi-doh-nursing-exam', 'Abu Dhabi DOH nursing exam', 'Abu Dhabi')}
hrs = lambda m: f'{m // 60} hours' + (f' {m % 60} minutes' if m % 60 else '')
STUDY = ['Day 1: read the official guide and note the topics, time and rules.', 'Day 2: do 30 mixed practice questions and list your weak topics.',
         'Day 3: study your two weakest topics, then answer 30 questions on them.', 'Day 4: priority and safety questions: airway, breathing, circulation, then risk.',
         'Day 5: a timed block of questions at exam pace. Review every miss and why.', 'Day 6: a full mock if one is available, or two timed blocks. Review again.',
         'Day 7: light review only. Check your ID, booking and test-centre rules. Sleep.']
def gulf_page(k):
    p = P[k]; ex, slug, short, place = META[k]
    rows = [('Regulator', p['regulator']), ('Questions', p['questions']), ('Time', hrs(p['minutes']) + (' (two 120-minute blocks with a break)' if p.get('blocks') else '')), ('Pass standard', p['pass'])]
    dom = [d for d in p['domains']]
    known = all(d['count'] for d in dom)
    dtable = ('<div class="g-scroll"><table class="g-table"><thead><tr><th>Topic</th><th>Questions</th><th>Share</th></tr></thead><tbody>' + ''.join(
        f'<tr><td>{E(d["label"])}</td><td>{d["count"]}</td><td>{round(d["count"] * 100 / p["questions"])}%</td></tr>' for d in dom) + '</tbody></table></div>') if known else (
        '<p>The regulator has not published how many questions come from each topic. Study the main nursing areas evenly:</p><ul>' + ''.join(f'<li>{E(d["label"])}</li>' for d in dom) + '</ul>')
    src = ''.join(f'<li><a href="{E(s["url"])}" rel="noopener">{E(s["label"])}</a></li>' for s in p['sources'])
    body = (f'<p class="eyebrow">Gulf Region nursing exams</p><h1 class="section-title">{E(short)}: format, topics and how to prepare</h1>'
            f'<p class="g-lead">The {E(p["fullName"])} is set by the {E(p["regulator"])}. It has {p["questions"]} multiple-choice questions over {hrs(p["minutes"])}. Here is what the official sources say, where they disagree, and a 7-day plan.</p>'
            '<div class="g-facts">' + ''.join(f'<div class="g-fact"><b>{E(v)}</b><span>{E(l)}</span></div>' for l, v in [('Questions', p['questions']), ('Time', hrs(p['minutes']))]) + '</div>'
            '<table class="g-table g-kv"><tbody>' + ''.join(f'<tr><th>{E(l)}</th><td>{E(v)}</td></tr>' for l, v in rows) + '</tbody></table>'
            f'<p>{E(p["formatNote"])}</p><h2>Topics</h2>{dtable}'
            f'<h2>How many attempts?</h2><p>{E(RN.get(ex if ex != "saudi" else "snle", RN.get(k, "")))}</p>'
            '<h2>A 7-day study plan</h2><ol>' + ''.join(f'<li>{E(s)}</li>' for s in STUDY) + '</ol>'
            f'<h2>Official sources</h2><p>Rules change. Always check the regulator before you book.</p><ul>{src}</ul>'
            '<p class="g-note">We are an independent study provider. Our questions are original practice material, not official exam questions, and we are not endorsed by SCFHS, DHP, DHA or DOH.</p>'
            + cta(f'Practise for the {place} exam', 'Try 10 free questions now. The Gulf Pass covers all four Gulf exams: 1,297 clinically reviewed questions, mock exams and 67 clinical reasoning tools, paid once.',
                  f'https://snle.healthcarecrownacademy.co.uk/#exam/{k}', 'Try 10 free questions', (f'/subscribe?exam={ex}', 'See the Gulf Pass'))
            + '<h2>Other Gulf exams</h2><ul class="g-grid">' + ''.join(f'<li><a href="/guides/gulf/{META[o][1]}">{E(META[o][2])}</a></li>' for o in P if o != k) + '<li><a href="/guides/gulf/compare-gulf-nursing-exams">Compare all four</a></li></ul>')
    page(f'/guides/gulf/{slug}', f'{short} 2026: format, topics, pass mark and 7-day plan',
         f'{p["fullName"]}: {p["questions"]} questions, {hrs(p["minutes"])}, pass standard, topics, attempts and official sources, plus a free 7-day study plan.',
         body, [('Guides', '/guides'), ('Gulf nursing exams', '/guides/gulf/compare-gulf-nursing-exams')],
         {"@context": "https://schema.org", "@type": "Article", "headline": f'{short}: format, topics and how to prepare', "dateModified": "2026-10-30", "author": {"@type": "Organization", "name": "Healthcare Crown Academy"}, "publisher": {"@type": "Organization", "name": "Healthcare Crown Academy"}})
for k in P: gulf_page(k)
cmp = ('<div class="g-scroll"><table class="g-table"><thead><tr><th>Exam</th><th>Regulator</th><th>Questions</th><th>Time</th><th>Pass standard</th><th>Topic weights published?</th></tr></thead><tbody>' + ''.join(
    f'<tr><td><a href="/guides/gulf/{META[k][1]}">{E(META[k][2])}</a></td><td>{E(P[k]["regulator"])}</td><td>{P[k]["questions"]}</td><td>{hrs(P[k]["minutes"])}</td><td>{E(P[k]["pass"])}</td><td>{"Yes" if all(d["count"] for d in P[k]["domains"]) else "No"}</td></tr>' for k in P) + '</tbody></table></div>')
page('/guides/gulf/compare-gulf-nursing-exams', 'SNLE vs DHP vs DHA vs DOH: Gulf nursing exams compared (2026)',
     'Compare the Saudi SNLE, Qatar DHP, Dubai DHA and Abu Dhabi DOH nursing exams: questions, time, pass standard and topics, from official sources.',
     '<p class="eyebrow">Gulf Region nursing exams</p><h1 class="section-title">The four Gulf nursing exams compared</h1>'
     '<p class="g-lead">Where you want to work decides which exam you sit: Saudi Arabia (SNLE), Qatar (DHP), Dubai (DHA) or Abu Dhabi (DOH). Dubai and Abu Dhabi are both in the UAE but use different regulators.</p>'
     + cmp + '<p class="g-note">Figures come from each regulator\'s published documents, linked on each exam page. Where sources disagree we say so. Check with the regulator before you book.</p>'
     + cta('One pass, all four exams', 'The Gulf Pass covers SNLE, DHP, DHA and DOH, and includes the Crown Pass. From US$29 for 1 month, paid once, never renews.', '/subscribe?plan=gulf', 'See the Gulf Pass', ('https://snle.healthcarecrownacademy.co.uk/', 'Try 10 free questions')),
     [('Guides', '/guides')])

# ---------------- Free improvement calculators ----------------
LSS = cta('Use 30 DMAIC tools on your own project', 'The Lean Six Sigma Green Belt for Healthcare toolkit has 9 live statistics engines, 10 simulations, a knowledge exam and a Certificate of Completion. Free to try.', 'https://lss.healthcarecrownacademy.co.uk/', 'Try the toolkit free')
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
for l in LESSONS:
    free = l['id'] in FREE_CC
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
            + cta('One real situation, 60 seconds a day', 'Carecraft trains what to say and do: 30 short lessons, 90 visual guides and practice that targets your weak spots. The first lessons are free.', CC, 'Start Carecraft free' if free else 'See the answer in Carecraft', ('/guides/carecraft', 'All situations')))
    page(f'/guides/carecraft/{l["id"]}', f'{l["title"]}: a practical guide for nurses and carers | Carecraft', l['description'] + ' A short practical guide with a real situation to try.',
         body, [('Guides', '/guides'), ('Carecraft situations', '/guides/carecraft')],
         {"@context": "https://schema.org", "@type": "LearningResource", "name": l['title'], "description": l['description'], "learningResourceType": "Scenario", "isAccessibleForFree": free})
page('/guides/carecraft', 'Real situations in care: what to say and do | Carecraft',
     'Short practical guides for nurses, students and carers: communication, handover, safety, escalation, dignity and teamwork, each with a real situation to try.',
     '<p class="eyebrow">Carecraft guides</p><h1 class="section-title">Real situations in care: what to say and do</h1><p class="g-lead">Each guide covers one moment that matters on shift, with the steps and a situation to try.</p><ul class="g-grid">'
     + ''.join(f'<li><a href="/guides/carecraft/{l["id"]}">{E(l["title"])}<small>{E(l["tag"])}{" · free" if l["id"] in FREE_CC else ""}</small></a></li>' for l in LESSONS) + '</ul>'
     + cta('60 seconds a day', 'Start with the free Carecraft lessons. No card needed.', CC, 'Start Carecraft free'), [('Guides', '/guides')])

# ---------------- Serein practices ----------------
ss = open(glob.glob(os.path.join(SITE, 'serein/app.*.js'))[0], encoding='utf-8').read()
j = ss.rfind('[', 0, ss.index('{"id":"tide"'))
PRACT, _ = json.JSONDecoder().raw_decode(ss[j:])
SR = 'https://serein.healthcarecrownacademy.co.uk/'
for p in PRACT:
    steps = ''.join(f'<li><b>{E(a)}</b>. {E(b)}</li>' for a, b in p.get('steps', []))
    body = (f'<p class="eyebrow">Serein · {E(p["category"])} · {E(p["duration"])}</p><h1 class="section-title">{E(p["title"])}</h1><p class="g-lead">{E(p["desc"])}</p>'
            + (f'<p>{E(p["instruction"])}</p>' if p.get('instruction') else '') + f'<h2>Steps</h2><ol>{steps}</ol>'
            + f'<p class="g-note"><b>Safety:</b> {E(p["safety"])}</p>'
            + '<p>Serein offers short calming practices. It is not a treatment and does not replace professional care. If you are struggling, talk to someone you trust or your doctor.</p>'
            + cta('Do it with a guide', 'Serein guides you through this practice with gentle timing and sound. Always free, for everyone who cares for others.', SR, 'Open Serein free', ('/guides/serein', 'All practices')))
    page(f'/guides/serein/{p["id"]}', f'{p["title"]}: a {p["duration"]} {p["category"].lower()} practice for healthcare staff | Serein', p['desc'] + ' Steps, safety notes and a free guided version.',
         body, [('Guides', '/guides'), ('Serein practices', '/guides/serein')])
page('/guides/serein', 'Short calming practices for nurses and carers | Serein',
     'Fifteen short breathing, grounding and movement practices for healthcare staff, with steps and safety notes. Always free.',
     '<p class="eyebrow">Serein guides</p><h1 class="section-title">Short calming practices for people who care for others</h1><p class="g-lead">Each practice takes a few minutes and fits into a break or the walk to the car.</p><ul class="g-grid">'
     + ''.join(f'<li><a href="/guides/serein/{p["id"]}">{E(p["title"])}<small>{E(p["category"])} · {E(p["duration"])}</small></a></li>' for p in PRACT) + '</ul>'
     + cta('Always free', 'Serein has no paywall. Open it on your phone and start.', SR, 'Open Serein'), [('Guides', '/guides')])

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
         + cta('Do this with your own notes', 'Lumen turns your lecture PDFs and photos of notes into recall cards with spaced practice and a focus planner. Free to start.', LU, 'Start Lumen free', ('/guides', 'More guides')),
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
page('/guides', 'Free guides and tools for healthcare learners | Healthcare Crown Academy',
     'Free medical word-part dictionary, Gulf nursing exam guides (SNLE, DHP, DHA, DOH) and improvement calculators for healthcare staff.',
     '<p class="eyebrow">Free guides</p><h1 class="section-title">Free guides and tools</h1><p class="g-lead">Short, practical guides from the makers of MedLex, the Gulf Region Nursing studio and the Green Belt toolkit. Free to read, no sign-in.</p>'
     f'<h2>Medical words</h2><ul class="g-grid"><li><a href="/guides/medical-word-parts">Prefixes, suffixes and roots<small>{np_ + ns + nr} word parts, A to Z</small></a></li><li><a href="/medlex/learn/canvas/lessons/prefixes">Free lesson: medical prefixes</a></li><li><a href="/medlex/learn/canvas/lessons/suffixes">Free lesson: medical suffixes</a></li></ul>'
     '<h2>Gulf nursing exams</h2><ul class="g-grid"><li><a href="/guides/gulf/compare-gulf-nursing-exams">Compare all four exams</a></li>' + ''.join(f'<li><a href="/guides/gulf/{META[k][1]}">{E(META[k][2])}</a></li>' for k in P) + '</ul>'
     '<h2 id="tools">Free improvement tools</h2><ul class="g-grid">' + ''.join(f'<li><a href="/tools/{s}">{E(t)}</a></li>' for s, _, t, *_ in tools) + '</ul>',
     [('Home', '/')])

json.dump(URLS, open(os.path.join(ROOT, 'tools/guides/urls.json'), 'w'), indent=0)
# Keep the guides in the main sitemap, between markers, so one submitted sitemap covers everything.
sm = os.path.join(SITE, 'sitemap.xml'); x = open(sm, encoding='utf-8').read()
x = re.sub(r'\s*<!-- guides:start -->.*?<!-- guides:end -->', '', x, flags=re.S)
block = '\n  <!-- guides:start -->\n' + ''.join(f'  <url><loc>{BASE}{u}</loc><lastmod>2026-10-30</lastmod><priority>{"0.8" if u.count("/") <= 2 else "0.6"}</priority></url>\n' for u in URLS) + '  <!-- guides:end -->'
open(sm, 'w', encoding='utf-8').write(x.replace('</urlset>', block + '\n</urlset>'))
print(len(URLS), 'pages;', np_, 'prefixes', ns, 'suffixes', nr, 'combining forms')
