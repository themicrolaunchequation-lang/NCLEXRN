#!/usr/bin/env python3
"""Rules checker for Healthcare Crown Academy promo clips.

Run it on a project folder before rendering:

    python3 -I lib/check.py <proj> [--app Serein] [--json]

It reads <proj>/script.json, <proj>/music.json, <proj>/config.js and, when
they exist, <proj>/vo/durations.json and <proj>/cap/meta.json, then reports:

    ERROR    breaks one of the owner's rules, or will fail on upload.
    WARN     probably wrong; a person should look.
    NOTE     worth confirming against the app on screen.

Exit code is 1 if there is any ERROR, else 0, so it can gate a render:

    python3 -I lib/check.py myproj && sh lib/both.sh myproj MedLex-Topic

Nothing here reaches the network and nothing is modified.
"""
import json, os, re, sys, unicodedata

# ---------------------------------------------------------------- rules data

# Disclaimer each app must carry somewhere visible.
APP_RULES = {
    'Serein': {
        'needs': ['wellbeing support', 'not medical treatment'],
        'why': 'Serein is described as wellbeing support, never treatment.',
    },
    'GulfRegionNursing': {
        'needs': ['not official exam questions'],
        'also': ['SCFHS', 'DHP', 'DHA', 'DOH'],
        'whole_clip': True,
        'why': 'The Gulf disclaimer stays on screen for the whole clip.',
    },
    'Evinca': {
        'needs': ['not licensure'],
        'why': 'Evinca recognitions are not licensure, certification or accreditation.',
    },
    'Carecraft': {
        'needs': ['fictional'],
        'why': 'Carecraft scenarios are fictional, not clinical records.',
    },
    'LeanSixSigma': {'needs': [], 'why': ''},
    'MedLex': {'needs': [], 'why': ''},
    'Lumen': {'needs': [], 'why': ''},
}

# Wording that must never appear anywhere.
BANNED = [
    (r'\bdiscount\b', 'discount'),
    (r'\bpromo\s*code\b', 'promo code'),
    (r'\bcoupon\b', 'coupon'),
    (r'\bvoucher\b', 'voucher'),
    (r'\buse\s+code\b', '"use code"'),
    (r'\b\d{1,3}\s*%\s*off\b', 'N% off'),
    (r'\boff\s+your\s+first\b', '"off your first"'),
]

# Claims that need a qualifier nearby, or they overstate what the app gives.
OVERCLAIM = [
    (r'\baccredited\b', 'accredited',
     'Never call a certificate accredited. Say "educational certificate of completion".'),
    (r'\bguarantee(d|s)?\b', 'guarantee',
     'Do not guarantee a pass or an outcome.'),
    (r'\bcertified\s+by\b', 'certified by',
     'Implies a third party certifies it.'),
    (r'\bendorsed\b', 'endorsed',
     'Only acceptable inside the "Not endorsed by..." disclaimer.'),
    (r'\bofficial\b', 'official',
     'Only acceptable inside "not official exam questions".'),
]

# Things that must never be committed.
SECRETS = [
    (r'\bsk_(live|test)_[A-Za-z0-9]{8,}', 'Stripe secret key'),
    (r'\bwhsec_[A-Za-z0-9]{8,}', 'Stripe webhook secret'),
    (r'\beyJ[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}\.', 'JWT (possible service key)'),
    (r'service_role', 'Supabase service_role key'),
    (r'\bghp_[A-Za-z0-9]{20,}', 'GitHub token'),
    (r'(?i)\b(api[_-]?key|secret|password)\s*[:=]\s*["\'][^"\']{8,}', 'hard-coded credential'),
]

LEN_MIN, LEN_MAX = 50.0, 75.0      # AGENT-PROMPT section 1
TAIL_MIN, TAIL_MAX = 1.6, 1.8      # quality bar
HOOK_LANDS_BY = 2.0                # quality bar


class Report:
    def __init__(self):
        self.rows = []

    def add(self, level, where, msg, fix=''):
        self.rows.append({'level': level, 'where': where, 'msg': msg, 'fix': fix})

    error = lambda self, w, m, f='': self.add('ERROR', w, m, f)
    warn = lambda self, w, m, f='': self.add('WARN', w, m, f)
    note = lambda self, w, m, f='': self.add('NOTE', w, m, f)

    def count(self, level):
        return sum(1 for r in self.rows if r['level'] == level)


# ---------------------------------------------------------------- loading

def read(path):
    try:
        with open(path, encoding='utf-8') as fh:
            return fh.read()
    except OSError:
        return None


def js_strings(src):
    """Every single-, double- and back-quoted literal in a JS file."""
    out = []
    for m in re.finditer(r"'((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\"|`((?:[^`\\]|\\.)*)`", src, re.S):
        out.append(next(g for g in m.groups() if g is not None))
    return out


def strip_tags(s):
    return re.sub(r'<[^>]+>', ' ', s)


def norm(s):
    """Fold accents and collapse whitespace, for matching only."""
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'\s+', ' ', s).strip()


# ---------------------------------------------------------------- checks

def check_spoken(rep, lines):
    """script.json — what the voices actually say."""
    for ln in lines:
        text = ln.get('text', '')
        where = f"script.json:{ln.get('id', '?')}"
        flat = norm(text)

        # "LSS" must be spoken in full.
        if re.search(r'\bLSS\b', text):
            rep.error(where, 'Says "LSS" out loud.',
                      'Write "Lean Six Sigma" in the spoken text.')

        # "SNLE" must be spelled out letter by letter.
        if re.search(r'\bSNLE\b', text):
            rep.error(where, 'Says "SNLE" as a word.',
                      'Write "S N L E" so the voice spells it.')

        # Other initialisms a TTS voice will mangle.
        for ab in ('DHA', 'DOH', 'DHP', 'SCFHS', 'COPQ', 'DMAIC', 'SBAR', 'CLABSI'):
            if re.search(rf'\b{ab}\b', text):
                rep.note(where, f'Spoken text contains "{ab}".',
                         'Confirm the voice says it the way you want, or space the letters.')

        for pat, label in BANNED:
            if re.search(pat, flat, re.I):
                rep.error(where, f'Banned wording: {label}.',
                          'No discount or promo wording anywhere.')

        for pat, label, why in OVERCLAIM:
            if re.search(pat, flat, re.I):
                rep.warn(where, f'Says "{label}".', why)

        # Numbers must come from the app.
        for n in set(re.findall(r'\b\d[\d,]{1,}\b', text)):
            rep.note(where, f'Claims the figure {n}.',
                     'It must be visible in the app on screen.')


def check_voices(rep, lines):
    ids = [ln.get('id') for ln in lines]
    if len(ids) != len(set(ids)):
        dupes = {i for i in ids if ids.count(i) > 1}
        rep.error('script.json', f'Duplicate line id(s): {", ".join(sorted(map(str, dupes)))}.',
                  'Every id must be unique; the timeline keys on it.')

    voices = {ln.get('voice') for ln in lines if ln.get('voice')}
    if len(voices) < 2:
        rep.warn('script.json', 'Only one voice is used.',
                 'The pattern needs a narrator and a persona with a different accent.')

    for ln in lines:
        sp = ln.get('speed', 1.0)
        if not isinstance(sp, (int, float)) or not 0.7 <= sp <= 1.3:
            rep.warn(f"script.json:{ln.get('id', '?')}", f'speed is {sp}.',
                     'Keep speed between 0.7 and 1.3 or the voice distorts.')


def check_visible(rep, src, app):
    """config.js — captions, headlines, kinetic text and the end card."""
    strings = js_strings(src)
    joined = norm(strip_tags(' '.join(strings)))

    if re.search(r'\bLSS\b', ' '.join(strings)):
        rep.error('config.js', 'Visible text contains "LSS".',
                  'Write "Lean Six Sigma" in titles and captions too.')

    for pat, label in BANNED:
        if re.search(pat, joined, re.I):
            rep.error('config.js', f'Banned wording on screen: {label}.', '')

    # The promo-code end-card block must never be used.
    if re.search(r'\bpromo\b', src, re.I):
        rep.error('config.js', 'References the end-card promo block.',
                  'Remove it. The #cta .promo element must never be rendered.')

    for pat, label, why in OVERCLAIM:
        if re.search(pat, joined, re.I):
            # "not official exam questions" and "Not endorsed by" are the allowed uses.
            allowed = re.search(r'not\s+(official|endorsed)', joined, re.I)
            (rep.note if allowed else rep.warn)('config.js', f'Visible text says "{label}".', why)

    rules = APP_RULES.get(app, {})
    for needle in rules.get('needs', []):
        if needle.lower() not in joined.lower():
            rep.error('config.js', f'Missing required line for {app}: "{needle}".',
                      rules.get('why', ''))
    for needle in rules.get('also', []):
        if needle not in ' '.join(strings):
            rep.error('config.js', f'Gulf disclaimer does not name {needle}.',
                      'It must name SCFHS, DHP, DHA and DOH.')

    if rules.get('whole_clip') and not re.search(r'\bnote\s*:', src):
        rep.error('config.js', 'No bottom note set.',
                  'Gulf clips carry the disclaimer on screen for the whole clip, via the note field.')

    # Structure the pattern requires.
    for key, why in [
        ('cta', 'Every clip ends on the end card.'),
        ('scenes', 'The spec needs a scenes array.'),
    ]:
        if not re.search(rf'\b{key}\s*:', src):
            rep.error('config.js', f'No "{key}" in window.SPEC.', why)

    if not re.search(r"tr\s*:\s*['\"]pop['\"]", src) and 'callouts' not in src:
        rep.warn('config.js', 'No pop-up transition and no callouts found.',
                 'The quality bar asks for at least one pop-up to open.')

    if re.search(r'\bcursor\b', src) and 'click:true' not in src.replace(' ', ''):
        rep.warn('config.js', 'Cursor moves but never clicks.',
                 'Clicks with ripples are what make it read as a live recording.')


def check_secrets(rep, files):
    for name, src in files.items():
        if src is None:
            continue
        for pat, label in SECRETS:
            if re.search(pat, src):
                rep.error(name, f'Looks like a committed {label}.',
                          'Never put credentials in a project file.')


def check_timing(rep, proj, lines):
    path = os.path.join(proj, 'vo', 'durations.json')
    raw = read(path)
    if raw is None:
        rep.note('vo/durations.json', 'Not built yet, so length was not checked.',
                 'Run `sh lib/prep.sh <proj>` first to check the running time.')
        return
    try:
        dur = json.loads(raw)
    except json.JSONDecodeError:
        rep.error('vo/durations.json', 'Not valid JSON.', '')
        return

    total = 0.0
    for ln in lines:
        d = dur.get(ln.get('id'))
        if d is None:
            rep.error('vo/durations.json', f"No audio for line \"{ln.get('id')}\".",
                      'Re-run the voice step; the timeline will be wrong without it.')
            continue
        total += float(d) + float(ln.get('pre', 0) or 0) + float(ln.get('post', 0) or 0)

    if total < LEN_MIN:
        rep.error('timing', f'Runs {total:.1f} s, under the {LEN_MIN:.0f} s minimum.',
                  'Add a real demo line, not filler.')
    elif total > LEN_MAX:
        rep.error('timing', f'Runs {total:.1f} s, over the {LEN_MAX:.0f} s maximum.',
                  'Cut a line or tighten the gaps.')
    else:
        rep.note('timing', f'Runs {total:.1f} s. In range.', '')

    last = lines[-1] if lines else {}
    tail = float(last.get('post', 0) or 0)
    if tail and not TAIL_MIN <= tail <= TAIL_MAX:
        rep.warn('timing', f'Tail gap after the last word is {tail:.2f} s.',
                 f'The quality bar asks for {TAIL_MIN}–{TAIL_MAX} s, then a fade.')

    first = lines[0] if lines else {}
    pre = float(first.get('pre', 0) or 0)
    if pre > HOOK_LANDS_BY:
        rep.warn('timing', f'The first line starts at {pre:.2f} s.',
                 f'The hook should land inside {HOOK_LANDS_BY:.0f} s.')


def check_music(rep, proj):
    raw = read(os.path.join(proj, 'music.json'))
    if raw is None:
        rep.error('music.json', 'Missing.', 'Every clip gets its own score.')
        return
    try:
        m = json.loads(raw)
    except json.JSONDecodeError:
        rep.error('music.json', 'Not valid JSON.', '')
        return
    if 'seed' not in m:
        rep.error('music.json', 'No seed.', 'Each clip needs a unique seed, or scores repeat.')
    bpm = m.get('bpm')
    if isinstance(bpm, (int, float)) and not 60 <= bpm <= 140:
        rep.warn('music.json', f'bpm is {bpm}.', 'Expected 66–72 for calm apps, 90–108 otherwise.')
    if not m.get('prog'):
        rep.warn('music.json', 'No chord progression.', 'Give each clip its own.')


def luminance(hex_colour):
    h = hex_colour.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    f = lambda v: v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def contrast(a, b):
    la, lb = luminance(a), luminance(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def check_contrast(rep, proj):
    """Caption key colour against the darkest background the engine paints."""
    src = read(os.path.join(proj, 'config.js')) or ''
    css = read(os.path.join(os.path.dirname(__file__), 'engine.css')) or ''
    base = re.search(r'linear-gradient\(160deg,\s*(#[0-9a-fA-F]{3,6})', css)
    base = base.group(1) if base else '#071428'
    for m in set(re.findall(r"color\s*:\s*['\"](#[0-9a-fA-F]{3,6})['\"]", src)):
        r = contrast(m, base)
        if r < 4.5:
            rep.error('config.js', f'Caption colour {m} on {base} is {r:.1f}:1.',
                      'WCAG AA needs 4.5:1. Lighten the text or darken the background.')
        elif r < 7:
            rep.note('config.js', f'Caption colour {m} is {r:.1f}:1.', 'Passes AA, below AAA.')


def guess_app(proj, src):
    for name in APP_RULES:
        if name.lower().replace(' ', '') in os.path.basename(os.path.abspath(proj)).lower():
            return name
    m = re.search(r"brand\s*:\s*\[\s*['\"]([^'\"]+)", src or '')
    if m:
        want = m.group(1).replace(' ', '')
        for name in APP_RULES:
            if name.lower() == want.lower():
                return name
    return None


# ---------------------------------------------------------------- output

COLOUR = {'ERROR': '\033[31m', 'WARN': '\033[33m', 'NOTE': '\033[36m'}
RESET = '\033[0m'


def main(argv):
    args = [a for a in argv[1:] if not a.startswith('--')]
    flags = {a for a in argv[1:] if a.startswith('--')}
    if not args:
        print(__doc__)
        return 2
    proj = args[0]
    if not os.path.isdir(proj):
        print(f'No such project folder: {proj}')
        return 2

    app = None
    for a in argv[1:]:
        if a.startswith('--app='):
            app = a.split('=', 1)[1]
    if '--app' in argv:
        app = argv[argv.index('--app') + 1]

    rep = Report()
    script_raw = read(os.path.join(proj, 'script.json'))
    config_raw = read(os.path.join(proj, 'config.js'))

    lines = []
    if script_raw is None:
        rep.error('script.json', 'Missing.', '')
    else:
        try:
            lines = json.loads(script_raw)
            if isinstance(lines, dict):
                lines = lines.get('lines', [])
        except json.JSONDecodeError as e:
            rep.error('script.json', f'Not valid JSON: {e}.', '')

    if config_raw is None:
        rep.error('config.js', 'Missing.', '')

    app = app or guess_app(proj, config_raw)
    if app is None:
        rep.warn('project', 'Could not tell which app this is.',
                 'Pass --app <Name> so the right disclaimer is checked.')

    if lines:
        check_spoken(rep, lines)
        check_voices(rep, lines)
        check_timing(rep, proj, lines)
    if config_raw and app:
        check_visible(rep, config_raw, app)
    elif config_raw:
        check_visible(rep, config_raw, '')
    check_music(rep, proj)
    check_contrast(rep, proj)
    check_secrets(rep, {'script.json': script_raw, 'config.js': config_raw,
                        'music.json': read(os.path.join(proj, 'music.json')),
                        'cap.mjs': read(os.path.join(proj, 'cap.mjs'))})

    if '--json' in flags:
        print(json.dumps({'project': proj, 'app': app, 'findings': rep.rows,
                          'errors': rep.count('ERROR'), 'warnings': rep.count('WARN')}, indent=1))
        return 1 if rep.count('ERROR') else 0

    tty = sys.stdout.isatty()
    print(f'\n  {proj}' + (f'  ({app})' if app else '') + '\n')
    order = {'ERROR': 0, 'WARN': 1, 'NOTE': 2}
    for r in sorted(rep.rows, key=lambda x: order[x['level']]):
        tag = f"{COLOUR[r['level']]}{r['level']:<5}{RESET}" if tty else f"{r['level']:<5}"
        print(f"  {tag}  {r['where']}\n         {r['msg']}")
        if r['fix']:
            print(f"         → {r['fix']}")
    e, w = rep.count('ERROR'), rep.count('WARN')
    print(f"\n  {e} error{'s' * (e != 1)}, {w} warning{'s' * (w != 1)}, "
          f"{rep.count('NOTE')} to confirm.\n")
    if e:
        print('  Not safe to render yet.\n')
    return 1 if e else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
