/* HCA v4 — Lumen experience layer, injected after v3 (see lumen/tools/build.mjs).
   Same rules as v3: wrap existing components, never edit them. The few changes that have to
   live inside the bundle (tag fields in the card and note dialogs, the Hard rating, the backup
   check) are exact string patches in build.mjs. */

/* ---------- Storage: the workspace moves from localStorage (about 5 MB) to IndexedDB ----------
   load (me) and save (I) are the only two places that touch the saved workspace. IndexedDB is
   read once before the first render (top-level await), so the app still loads synchronously.
   A copy is still mirrored to localStorage while it fits, so older versions of the file keep working. */
const HCA4 = { legacyLoad: me, Notes: je, Dialogs: rs, Plan: HCA3TodayPlan, Commands: HCA3Commands };
const HCA4Store = { db: null, record: null, failed: false };
const HCA4_STAMP_KEY = 'lumen.workspace.v4.mirror';
const HCA4_MIRROR_LIMIT = 2_400_000; // characters; localStorage quotas are about 5 MB of UTF-16

function HCA4OpenDb() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(new Error('IndexedDB is unavailable.'));
    const req = indexedDB.open('lumen.workspace.v4', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('kv');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB is blocked.'));
  });
}

function HCA4Read(db, key) {
  return new Promise((resolve, reject) => {
    const req = db.transaction('kv').objectStore('kv').get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function HCA4Write(db, key, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('kv', 'readwrite');
    tx.objectStore('kv').put(value, key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('The save was aborted.'));
  });
}

try {
  HCA4Store.db = await Promise.race([HCA4OpenDb(), new Promise((_, reject) => setTimeout(() => reject(new Error('IndexedDB timed out.')), 2500))]);
  HCA4Store.record = await HCA4Read(HCA4Store.db, 'workspace');
} catch {
  HCA4Store.db = null;
}

function HCA4Parse(json) {
  try {
    const s = JSON.parse(json);
    return s?.version === 1 && Array.isArray(s.books) ? { ...pe(), ...s, settings: { ...pe().settings, ...s.settings } } : null;
  } catch { return null; }
}

me = function HCA4Load() {
  const fromDb = HCA4Store.record?.json ? HCA4Parse(HCA4Store.record.json) : null;
  if (!fromDb) return HCA4.legacyLoad(); // first run on v4: migrate whatever localStorage holds
  let mirror = null, stamp = null;
  try { mirror = localStorage.getItem(de); stamp = JSON.parse(localStorage.getItem(HCA4_STAMP_KEY) || 'null'); } catch {}
  // A mirror whose length no longer matches what v4 last wrote was saved by an older version
  // of Lumen after v4 ran, so it holds the newer work.
  if (mirror && stamp && stamp.length !== mirror.length) return HCA4Parse(mirror) || fromDb;
  return fromDb;
};

function HCA4StorageProblem(detail) {
  HCA4Store.failed = true;
  window.dispatchEvent(new CustomEvent('hca4-storage', { detail }));
}

I = function HCA4Save(state) {
  let json;
  try { json = JSON.stringify(state); } catch { HCA4StorageProblem('serialize'); return false; }
  const savedAt = Date.now();
  let mirrored = false;
  if (fe && json.length <= HCA4_MIRROR_LIMIT) {
    try {
      localStorage.setItem(de, json);
      localStorage.setItem(HCA4_STAMP_KEY, JSON.stringify({ savedAt, length: json.length }));
      mirrored = true;
    } catch {}
  }
  if (!HCA4Store.db) {
    if (!mirrored) HCA4StorageProblem('no-storage');
    return mirrored;
  }
  HCA4Write(HCA4Store.db, 'workspace', { json, savedAt })
    .then(() => { if (HCA4Store.failed) { HCA4Store.failed = false; window.dispatchEvent(new CustomEvent('hca4-storage', { detail: 'ok' })); } })
    .catch(() => HCA4StorageProblem(mirrored ? 'db-only' : 'all'));
  return true;
};

/* ---------- Shared bits ---------- */
const HCA4Categories = [
  ['moc', 'Management of Care'],
  ['sic', 'Safety and Infection Control'],
  ['hpm', 'Health Promotion and Maintenance'],
  ['psy', 'Psychosocial Integrity'],
  ['bcc', 'Basic Care and Comfort'],
  ['ppt', 'Pharmacological and Parenteral Therapies'],
  ['rrp', 'Reduction of Risk Potential'],
  ['pha', 'Physiological Adaptation'],
];
const HCA4CategoryName = id => HCA4Categories.find(c => c[0] === id)?.[1] || id;

function HCA4TagPicker({ value = [], onChange }) {
  const toggle = id => onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id]);
  return HC('fieldset', { className: 'hca4-tags' },
    HC('legend', {}, 'NCLEX Client Needs ', HC('span', {}, '(optional)')),
    HC('div', { className: 'hca4-tag-list' }, HCA4Categories.map(([id, name]) =>
      HC('button', { key: id, type: 'button', className: `hca4-tag ${value.includes(id) ? 'on' : ''}`, 'aria-pressed': value.includes(id), onClick: () => toggle(id) },
        value.includes(id) && HCAIcon('check-line'), name))));
}

/* ---------- Less clutter: Study, Notes ---------- */
function HCA4MethodsLink() {
  const ctx = y();
  return HC('div', { className: 'hca4-methods-link' },
    HC('span', { className: 'hca4-methods-icons', 'aria-hidden': 'true' }, ['stack-line', 'brain-line', 'layout-column-line', 'eye-off-line', 'shield-check-line', 'history-line'].map(i => HC('span', { key: i }, HCAIcon(i)))),
    HC('div', {}, HC('strong', {}, 'Six ways to practise'), HC('span', {}, 'Active recall, explain it back, compare, visual recall, evidence lens and spaced return.')),
    HCABtn('Open Methods', () => ctx.navigate('methods'), 'secondary', 'arrow-right-line'));
}

function HCA4PracticeCard() {
  const ctx = y(), log = ctx.state.hcaNgnLog || [];
  const last = log.length ? log[log.length - 1] : null;
  return HC('section', { className: 'hca4-ngn-card' },
    HC('span', { className: 'hca4-ngn-icon', 'aria-hidden': 'true' }, HCAIcon('stethoscope-line')),
    HC('div', {},
      HCAEyebrow('NCLEX-STYLE PRACTICE · ILLUSTRATIVE'),
      HC('h2', {}, 'Practise the newer NCLEX item types.'),
      HC('p', {}, `Six original practice items: select all that apply, matrix, bow-tie, highlight and drop-down. Scored with partial credit, with a rationale for every answer.${last ? ` Last set: ${last.score} of ${last.max} points.` : ''}`)),
    HC('div', { className: 'hca4-ngn-actions' },
      HCABtn('Start practice', () => ctx.setModal({ type: 'hca4-ngn', timed: false }), 'primary', 'play-fill'),
      HCABtn('Timed (9 min)', () => ctx.setModal({ type: 'hca4-ngn', timed: true }), 'secondary', 'timer-line')));
}

Me = function HCA4Study() {
  const ctx = y(), empty = !ctx.state.cards.length;
  return HC('div', { className: `hca-study-shell hca4-study ${empty ? 'no-cards' : ''}` },
    HC(HCAOriginalStudy, {}),
    HC('div', { className: 'hca-study-extras page-content' }, HC(HCA4PracticeCard), HC(HCA4MethodsLink), HC(HCAFooter, {})));
};

je = function HCA4Notes() {
  const ctx = y(), empty = !ctx.state.notes.length && !ctx.state.highlights.length;
  return HC('div', { className: `hca4-notes ${empty ? 'is-empty' : ''}` }, HC(HCA4.Notes), HC('div', { className: 'page-content hca4-notes-foot' }, HC(HCAFooter, {})));
};

/* ---------- NCLEX: bulk tagging ---------- */
function HCA4TagDialog({ onClose }) {
  const ctx = y(), s = ctx.state;
  const [category, setCategory] = _.useState(HCA4Categories[0][0]), [untaggedOnly, setUntaggedOnly] = _.useState(true);
  const [source, setSource] = _.useState('all'), [picked, setPicked] = _.useState(() => new Set());
  const titleOf = id => s.books.find(b => b.id === id)?.title || 'Source';
  const list = s.cards.filter(c => (source === 'all' || c.bookId === source) && (!untaggedOnly || !(c.tags || []).length));
  const toggle = id => setPicked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const apply = remove => {
    ctx.setState(st => ({ ...st, cards: st.cards.map(c => {
      if (!picked.has(c.id)) return c;
      const tags = new Set(c.tags || []);
      remove ? tags.delete(category) : tags.add(category);
      return { ...c, tags: [...tags] };
    }) }));
    ctx.toast(`${picked.size} card${picked.size === 1 ? '' : 's'} ${remove ? 'untagged from' : 'tagged'} “${HCA4CategoryName(category)}”.`);
    setPicked(new Set());
  };
  return HC(A, { title: 'Tag your cards.', eyebrow: 'NCLEX CLIENT NEEDS', onClose, className: 'hca4-tag-dialog',
    footer: HC(_.Fragment, {},
      HC('span', { className: 'modal-footnote' }, `${picked.size} selected`),
      HCABtn('Remove tag', () => apply(true), 'secondary', 'close-line', { disabled: !picked.size }),
      HCABtn('Add tag', () => apply(false), 'primary', 'check-line', { disabled: !picked.size })) },
    HC('p', { className: 'hca-small' }, 'Tags let Progress show recall by category and let you practise your weakest area. You can also tag a card when you create or edit it.'),
    HC('div', { className: 'hca4-tag-controls' },
      HC('label', {}, 'Category', HC('select', { value: category, onChange: e => setCategory(e.target.value) }, HCA4Categories.map(([id, name]) => HC('option', { key: id, value: id }, name)))),
      HC('label', {}, 'Source', HC('select', { value: source, onChange: e => setSource(e.target.value) }, HC('option', { value: 'all' }, 'All sources'), s.books.map(b => HC('option', { key: b.id, value: b.id }, b.title)))),
      HC('label', { className: 'hca4-check' }, HC('input', { type: 'checkbox', checked: untaggedOnly, onChange: e => setUntaggedOnly(e.target.checked) }), 'Untagged cards only')),
    HC('div', { className: 'hca4-tag-select-all' },
      HC('button', { type: 'button', className: 'text-link', onClick: () => setPicked(new Set(list.map(c => c.id))) }, `Select all ${list.length}`),
      HC('button', { type: 'button', className: 'text-link', onClick: () => setPicked(new Set()) }, 'Clear')),
    list.length
      ? HC('ul', { className: 'hca4-tag-cards' }, list.map(c => HC('li', { key: c.id },
          HC('label', {}, HC('input', { type: 'checkbox', checked: picked.has(c.id), onChange: () => toggle(c.id) }),
            HC('span', {}, HC('strong', {}, c.question), HC('small', {}, `${titleOf(c.bookId)} · p. ${c.page}${(c.tags || []).length ? ` · ${(c.tags || []).map(HCA4CategoryName).join(', ')}` : ''}`))))))
      : HC('p', { className: 'hca-sidecar-empty' }, untaggedOnly ? 'Every card here already has a tag.' : 'No cards yet. Make a card in the reader or the Study page first.'));
}

/* ---------- NCLEX: recall by category on Progress ---------- */
function HCA4CategoryStats(s) {
  const since = HCA3StartOfDay(-29).getTime();
  const log = (s.reviewLog || []).filter(l => l.at >= since);
  const ngn = s.hcaNgnLog || [];
  return HCA4Categories.map(([id, name]) => {
    const cards = s.cards.filter(c => (c.tags || []).includes(id)), ids = new Set(cards.map(c => c.id));
    const reviews = log.filter(l => ids.has(l.cardId)), recalled = reviews.filter(l => l.rating !== 'again').length;
    const items = ngn.flatMap(set => (set.items || []).filter(i => i.category === id));
    const pts = items.reduce((n, i) => n + i.score, 0), max = items.reduce((n, i) => n + i.max, 0);
    return { id, name, cards, reviews: reviews.length, rate: reviews.length ? recalled / reviews.length : null, practice: max ? pts / max : null };
  });
}

function HCA4CategoryPanel() {
  const ctx = y(), s = ctx.state, stats = HCA4CategoryStats(s);
  const tagged = stats.some(c => c.cards.length) || (s.hcaNgnLog || []).length;
  const scored = stats.filter(c => c.rate !== null || c.practice !== null);
  const score = c => Math.min(c.rate ?? 1, c.practice ?? 1);
  const weakest = scored.filter(c => c.cards.length).sort((a, b) => score(a) - score(b))[0];
  const practise = c => { const due = we(c.cards); ctx.startReview(due.length ? due : c.cards); };
  const pct = v => (v === null ? '—' : `${Math.round(v * 100)}%`);
  return HC('section', { className: 'hca-panel hca4-categories', 'aria-labelledby': 'hca4-cat-title' },
    HC('div', { className: 'hca-section-head' },
      HC('div', {}, HCAEyebrow('NCLEX CLIENT NEEDS'), HC('h2', { id: 'hca4-cat-title' }, 'Recall by category.')),
      HC('div', { className: 'hca4-cat-actions' },
        weakest && HCABtn(`Practise weakest: ${weakest.name}`, () => practise(weakest), 'primary', 'play-fill'),
        HCABtn('Tag cards', () => ctx.setModal({ type: 'hca4-tags' }), 'secondary', 'list-check'))),
    !tagged
      ? HC('p', { className: 'hca4-cat-empty' }, 'Tag your cards with NCLEX Client Needs categories, or complete an NCLEX-style practice set on the Study page, to see where your recall is strongest and weakest.')
      : HC(_.Fragment, {},
        HC('div', { className: 'hca4-cat-rows', role: 'list' }, stats.map(c => HC('div', { key: c.id, role: 'listitem', className: `hca4-cat-row ${c.cards.length || c.practice !== null ? '' : 'muted'}` },
          HC('span', { className: 'hca4-cat-name' }, c.name),
          HC('span', { className: 'hca4-cat-bar', 'aria-hidden': 'true' }, HC('span', { style: { width: `${(c.rate ?? 0) * 100}%` } })),
          HC('span', { className: 'hca4-cat-num' }, pct(c.rate)),
          HC('span', { className: 'hca4-cat-meta' }, `${c.cards.length} card${c.cards.length === 1 ? '' : 's'} · ${c.reviews} review${c.reviews === 1 ? '' : 's'}${c.practice !== null ? ` · practice ${pct(c.practice)}` : ''}`),
          c.cards.length ? HC('button', { className: 'text-link', onClick: () => practise(c), 'aria-label': `Practise ${c.name}` }, 'Practise') : HC('span', {})))),
        HC('details', { className: 'hca-data-details' }, HC('summary', {}, 'View as a table'),
          HC('table', {}, HC('thead', {}, HC('tr', {}, ['Category', 'Cards', 'Reviews (30 days)', 'Recall rate', 'Practice score'].map(h => HC('th', { key: h }, h)))),
            HC('tbody', {}, stats.map(c => HC('tr', { key: c.id }, HC('td', {}, c.name), HC('td', {}, c.cards.length), HC('td', {}, c.reviews), HC('td', {}, pct(c.rate)), HC('td', {}, pct(c.practice)))))))),
    HC('p', { className: 'hca-small' }, 'Recall rate is the share of reviews in the last 30 days not rated “Again”. It describes your practice, not exam readiness.'));
}

HCAProgress = function HCA4Progress() {
  return HC('div', { className: 'page-content hca-progress-page hca3-shell hca3-progress hca4-progress' },
    HC(HCA3Insights), HC(HCA4CategoryPanel), HC(HCA3.Progress));
};

/* ---------- Today: exam week and resurfaced highlights ---------- */
function HCA4ExamWeek() {
  const ctx = y(), s = ctx.state, goals = HCA3Goals(s), days = HCA3DaysUntil(goals.examDate);
  if (days === null || days < 0 || days > 7) return null;
  const stats = HCA4CategoryStats(s).filter(c => c.cards.length && c.rate !== null).sort((a, b) => a.rate - b.rate).slice(0, 3);
  const cards = stats.flatMap(c => c.cards), unique = [...new Map(cards.map(c => [c.id, c])).values()];
  return HC('section', { className: 'hca4-examweek', 'aria-label': 'Exam week' },
    HCAIcon('graduation-cap-line'),
    HC('div', {},
      HC('strong', {}, days === 0 ? `${goals.examName} is today. Keep it light.` : `Exam week: ${days} day${days === 1 ? '' : 's'} to go.`),
      HC('span', {}, stats.length
        ? `Review what you know instead of starting new material. Your weakest categories: ${stats.map(c => c.name).join(', ')}.`
        : 'Review what you know instead of starting new material. Tag cards by category to focus on your weakest areas.')),
    stats.length ? HCABtn('Review weakest areas', () => ctx.startReview(unique), 'primary', 'play-fill') : HCABtn('Tag cards', () => ctx.setModal({ type: 'hca4-tags' }), 'secondary', 'list-check'));
}

function HCA4Resurface() {
  const ctx = y(), s = ctx.state, today = new Date().toLocaleDateString('en-CA');
  const skipped = s.hcaResurface?.day === today ? s.hcaResurface.skipped || [] : [];
  const carded = new Set(s.cards.map(c => `${c.bookId}:${c.page}`));
  const old = s.highlights.filter(h => h.text && h.createdAt < Date.now() - 7 * HCA3.DAY && !carded.has(`${h.bookId}:${h.page}`) && !skipped.includes(h.id));
  if (!old.length) return null;
  const seed = [...today].reduce((n, ch) => n + ch.charCodeAt(0), 0), h = old[seed % old.length];
  const book = s.books.find(b => b.id === h.bookId);
  const skip = () => ctx.setState(st => ({ ...st, hcaResurface: { day: today, skipped: [...skipped, h.id] } }));
  return HC('section', { className: 'hca4-resurface', 'aria-label': 'From your highlights' },
    HC('div', { className: 'hca4-resurface-head' }, HCAEyebrow('FROM YOUR HIGHLIGHTS'), HC('span', { className: 'hca-small' }, `${book?.title || 'Source'} · p. ${h.page} · saved ${Ce(h.createdAt)}`)),
    HC('blockquote', {}, `“${h.text.length > 320 ? `${h.text.slice(0, 320)}…` : h.text}”`),
    HC('div', { className: 'hca4-resurface-actions' },
      HCABtn('Make a card', () => ctx.setModal({ type: 'card', bookId: h.bookId, page: h.page, excerpt: h.text }), 'primary', 'add-circle-line'),
      HCABtn('Open page', () => ctx.openBook(h.bookId, h.page), 'secondary', 'book-open-line'),
      HC('button', { className: 'text-link', onClick: skip }, 'Not today')));
}

// The Today page is a flex column (see .hca3-shell), so these siblings are placed with CSS order.
HCA3TodayPlan = function HCA4TodayPlan() {
  return HC(_.Fragment, {}, HC(HCA4ExamWeek), HC(HCA4.Plan), HC(HCA4Resurface), HC(HCA4MethodsLink));
};

/* ---------- NCLEX-style practice lab (original, illustrative items) ----------
   Scoring follows the published NGN partial-credit approach as a practice approximation:
   "+/-" (each correct choice +1, each wrong choice -1, never below 0) for select-all and
   highlight items; "0/1" (one point per correct row, blank or group) for matrix, bow-tie and
   drop-down items. */
const HCA4Items = [
  {
    id: 'furosemide', type: 'multi', category: 'ppt', label: 'Select all that apply',
    stem: 'A client with heart failure takes oral furosemide 40 mg every morning. Which findings should the nurse report to the prescriber?',
    options: [
      ['k', 'Serum potassium 3.1 mEq/L', true],
      ['wt', 'Weight 0.5 kg lower than yesterday', false],
      ['bp', 'Blood pressure 128/76 lying, 98/60 standing, with dizziness', true],
      ['uo', 'Urine output 60 mL per hour', false],
      ['cramp', 'New leg cramps and muscle weakness', true],
      ['na', 'Serum sodium 139 mEq/L', false],
    ],
    rationale: 'Loop diuretics waste potassium. A level below about 3.5 mEq/L, and cramps with weakness, suggest hypokalaemia, which raises the risk of dysrhythmias. A large drop in pressure on standing with dizziness is orthostatic hypotension from volume loss and a fall risk. Gradual weight loss, normal urine output and a normal sodium are expected or reassuring.',
  },
  {
    id: 'pneumonia', type: 'matrix', category: 'pha', label: 'Matrix: indicated or not indicated', rowLabel: 'Nursing action',
    stem: 'A client is admitted with community-acquired pneumonia. Temperature 38.6 °C, productive cough, SpO₂ 93% on room air. For each nursing action, choose whether it is indicated.',
    columns: ['Indicated', 'Not indicated'],
    rows: [
      ['Collect a sputum specimen before the first antibiotic dose', 0],
      ['Encourage oral fluids unless they are restricted', 0],
      ['Raise the head of the bed to a semi-Fowler or Fowler position', 0],
      ['Withhold an antipyretic until the temperature reaches 40 °C', 1],
      ['Keep the client lying flat to reduce oxygen demand', 1],
    ],
    rationale: 'Specimens taken before antibiotics give more reliable cultures. Fluids help thin secretions and replace losses from fever. An upright position improves lung expansion. Fever should be treated as prescribed rather than left to rise, and lying flat reduces lung expansion.',
  },
  {
    id: 'hypoglycemia', type: 'bowtie', category: 'pha', label: 'Bow-tie',
    stem: 'A client with type 1 diabetes is shaky, sweating and anxious before lunch. Capillary blood glucose is 52 mg/dL (2.9 mmol/L). The client is alert and able to swallow.',
    groups: [
      { key: 'condition', title: 'Condition most likely', pick: 1, options: [['hypo', 'Hypoglycaemia', true], ['dka', 'Diabetic ketoacidosis', false], ['hhs', 'Hyperosmolar hyperglycaemic state', false], ['hypok', 'Hypokalaemia', false]] },
      { key: 'actions', title: 'Two actions to take', pick: 2, options: [['carb', 'Give 15 g of fast-acting carbohydrate by mouth', true], ['recheck', 'Recheck blood glucose in 15 minutes', true], ['insulin', 'Give the scheduled rapid-acting insulin', false], ['rest', 'Ask the client to rest and skip the meal', false], ['abg', 'Obtain an arterial blood gas', false]] },
      { key: 'monitor', title: 'Two parameters to monitor', pick: 2, options: [['bg', 'Blood glucose', true], ['loc', 'Level of consciousness', true], ['uo', 'Urine output', false], ['na', 'Serum sodium', false], ['plt', 'Platelet count', false]] },
    ],
    rationale: 'Tremor, sweating and anxiety with a glucose below 70 mg/dL (3.9 mmol/L) point to hypoglycaemia. Because the client is alert and can swallow, treat with about 15 g of fast-acting carbohydrate and recheck in 15 minutes, repeating if still low. Watch glucose and mental status, which shows whether the brain is getting enough glucose. Insulin would worsen it, and skipping the meal risks a further fall.',
  },
  {
    id: 'postop', type: 'highlight', category: 'rrp', label: 'Highlight the findings that need follow-up',
    stem: 'Day 1 after abdominal surgery. Click each finding that requires immediate follow-up.',
    tokens: [
      ['t', 'Temperature 37.4 °C.', false], ['hr', 'Heart rate 124 per minute.', true], ['bp', 'Blood pressure 92/58 mm Hg.', true],
      ['rr', 'Respiratory rate 18 per minute.', false], ['spo2', 'SpO₂ 96% on room air.', false],
      ['drsg', 'Abdominal dressing saturated with bright red drainage.', true], ['pain', 'Reports pain 4 out of 10.', false], ['void', 'Voided 300 mL.', false],
    ],
    rationale: 'A fast heart rate, falling blood pressure and a dressing soaked with bright red blood together suggest bleeding and early hypovolaemic shock. These need immediate assessment and escalation. A slightly raised temperature on day 1, moderate pain and normal breathing, oxygen saturation and voiding are not urgent on their own.',
  },
  {
    id: 'postop-cloze', type: 'dropdown', category: 'rrp', label: 'Drop-down',
    stem: 'Using the same client, complete the sentence.',
    parts: ['The client is most at risk for ', 0, ' as shown by the ', 1, ', so the nurse should first ', 2, '.'],
    blanks: [
      [['hem', 'haemorrhage', true], ['inf', 'wound infection', false], ['ile', 'paralytic ileus', false]],
      [['vit', 'rising heart rate, falling blood pressure and bleeding dressing', true], ['temp', 'temperature of 37.4 °C', false], ['pain', 'pain score of 4', false]],
      [['assess', 'assess the client and notify the surgeon promptly', true], ['change', 'change the dressing and recheck in 4 hours', false], ['walk', 'help the client walk to improve circulation', false]],
    ],
    rationale: 'The pattern of tachycardia, hypotension and fresh bleeding points to haemorrhage. Waiting or treating it as routine delays care. Assess the client and escalate promptly, following local protocols.',
  },
  {
    id: 'warfarin', type: 'matrix', category: 'ppt', label: 'Matrix: appropriate teaching or not', rowLabel: 'Teaching statement',
    stem: 'A client is starting warfarin. For each statement in the teaching plan, choose whether it is appropriate.',
    columns: ['Appropriate', 'Not appropriate'],
    rows: [
      ['Keep the amount of vitamin K–rich foods you eat steady from week to week', 0],
      ['Use a soft-bristled toothbrush and an electric razor', 0],
      ['Take aspirin if you get a headache', 1],
      ['Report black, tarry stools or blood in your urine', 0],
      ['If you miss a dose, take double the next day', 1],
    ],
    rationale: 'Steady vitamin K intake keeps the INR stable. Soft brushes and electric razors reduce bleeding. Aspirin adds to bleeding risk, so pain relief should be discussed with the prescriber or pharmacist. Signs of bleeding must be reported. Missed doses should not be doubled; the client should follow the prescriber’s instructions.',
  },
];

function HCA4ItemMax(item) {
  if (item.type === 'multi') return item.options.filter(o => o[2]).length;
  if (item.type === 'highlight') return item.tokens.filter(t => t[2]).length;
  if (item.type === 'matrix') return item.rows.length;
  if (item.type === 'bowtie') return item.groups.reduce((n, g) => n + g.pick, 0);
  return item.blanks.length;
}

function HCA4ItemScore(item, answer = {}) {
  const plusMinus = (list, picked) => Math.max(0, list.reduce((n, o) => n + (picked[o[0]] ? (o[2] ? 1 : -1) : 0), 0));
  if (item.type === 'multi') return plusMinus(item.options, answer);
  if (item.type === 'highlight') return plusMinus(item.tokens, answer);
  if (item.type === 'matrix') return item.rows.reduce((n, r, i) => n + (answer[i] === r[1] ? 1 : 0), 0);
  if (item.type === 'bowtie') return item.groups.reduce((n, g) => n + g.options.filter(o => o[2] && (answer[g.key] || []).includes(o[0])).length, 0);
  return item.blanks.reduce((n, b, i) => n + (b.find(o => o[2])?.[0] === answer[i] ? 1 : 0), 0);
}

function HCA4Item({ item, answer, setAnswer, checked }) {
  const mark = ok => (checked ? (ok ? 'right' : 'wrong') : '');
  if (item.type === 'multi' || item.type === 'highlight') {
    const list = item.type === 'multi' ? item.options : item.tokens;
    return HC('div', { className: item.type === 'multi' ? 'hca4-choices' : 'hca4-highlight' }, list.map(([id, text, ok]) =>
      HC('button', { key: id, type: 'button', className: `${answer[id] ? 'on' : ''} ${checked && (answer[id] || ok) ? mark(ok === !!answer[id]) : ''}`, 'aria-pressed': !!answer[id], disabled: checked, onClick: () => setAnswer({ ...answer, [id]: !answer[id] }) },
        item.type === 'multi' && HCAIcon(answer[id] ? 'checkbox-circle-line' : 'checkbox-blank-circle-line'), text,
        checked && ok && HC('span', { className: 'hca4-key' }, ' · correct answer'))));
  }
  if (item.type === 'matrix') {
    return HC('table', { className: 'hca4-matrix' },
      HC('thead', {}, HC('tr', {}, HC('th', {}, item.rowLabel), item.columns.map(c => HC('th', { key: c }, c)))),
      HC('tbody', {}, item.rows.map(([text, right], i) => HC('tr', { key: i, className: checked ? mark(answer[i] === right) : '' },
        HC('th', { scope: 'row' }, text, checked && answer[i] !== right && HC('span', { className: 'hca4-key' }, ` · answer: ${item.columns[right]}`)),
        item.columns.map((c, ci) => HC('td', { key: c }, HC('input', { type: 'radio', name: `${item.id}-${i}`, 'aria-label': `${text}: ${c}`, checked: answer[i] === ci, disabled: checked, onChange: () => setAnswer({ ...answer, [i]: ci }) })))))));
  }
  if (item.type === 'bowtie') {
    return HC('div', { className: 'hca4-bowtie' }, item.groups.map(g => {
      const picked = answer[g.key] || [];
      const toggle = id => setAnswer({ ...answer, [g.key]: picked.includes(id) ? picked.filter(x => x !== id) : picked.length < g.pick ? [...picked, id] : [...picked.slice(1), id] });
      return HC('fieldset', { key: g.key, className: `hca4-bow-${g.key}` }, HC('legend', {}, g.title),
        g.options.map(([id, text, ok]) => HC('button', { key: id, type: 'button', 'aria-pressed': picked.includes(id), disabled: checked, className: `${picked.includes(id) ? 'on' : ''} ${checked && (picked.includes(id) || ok) ? mark(ok === picked.includes(id)) : ''}`, onClick: () => toggle(id) }, text)));
    }));
  }
  let blank = 0;
  return HC('p', { className: 'hca4-cloze' }, item.parts.map((part, i) => {
    if (typeof part === 'string') return HC('span', { key: i }, part);
    const b = part, options = item.blanks[b], right = options.find(o => o[2])[0];
    blank++;
    return HC('select', { key: i, 'aria-label': `Blank ${blank}`, value: answer[b] || '', disabled: checked, className: checked ? mark(answer[b] === right) : '', onChange: e => setAnswer({ ...answer, [b]: e.target.value }) },
      HC('option', { value: '' }, 'Choose…'), options.map(([id, text]) => HC('option', { key: id, value: id }, text)));
  }));
}

function HCA4PracticeDialog({ onClose, timed }) {
  const ctx = y(), limit = timed ? 9 * 60 : 0;
  const [index, setIndex] = _.useState(0), [answers, setAnswers] = _.useState({}), [checked, setChecked] = _.useState({});
  const [left, setLeft] = _.useState(limit), [done, setDone] = _.useState(false), saved = _.useRef(false);
  const item = HCA4Items[index];
  const results = HCA4Items.map(it => ({ itemId: it.id, category: it.category, score: HCA4ItemScore(it, answers[it.id]), max: HCA4ItemMax(it) }));
  const total = results.reduce((n, r) => n + r.score, 0), max = results.reduce((n, r) => n + r.max, 0);
  const finish = () => {
    setDone(true);
    if (saved.current) return;
    saved.current = true;
    ctx.setState(s => ({ ...s, hcaNgnLog: [...(s.hcaNgnLog || []), { id: ue(), at: Date.now(), timed: !!timed, score: total, max, items: results }].slice(-200) }));
  };
  _.useEffect(() => {
    if (!timed || done) return;
    if (left <= 0) { finish(); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, done]);
  const clock = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  const footer = done
    ? HC(_.Fragment, {}, HCABtn('Close', onClose, 'secondary', 'close-line'), HCABtn('Try again', () => { setAnswers({}); setChecked({}); setIndex(0); setDone(false); setLeft(limit); saved.current = false; }, 'primary', 'restart-line'))
    : HC(_.Fragment, {},
      HCABtn('Back', () => setIndex(i => Math.max(0, i - 1)), 'secondary', 'arrow-left-line', { disabled: index === 0 }),
      !timed && !checked[item.id] && HCABtn('Check answer', () => setChecked({ ...checked, [item.id]: true }), 'secondary', 'check-line'),
      index < HCA4Items.length - 1 ? HCABtn('Next item', () => setIndex(i => i + 1), 'primary', 'arrow-right-line') : HCABtn('Finish and score', finish, 'primary', 'check-double-line'));
  return HC(A, { title: done ? 'Your practice set.' : item.label, eyebrow: done ? `${timed ? 'TIMED · ' : ''}NCLEX-STYLE PRACTICE · ILLUSTRATIVE` : `ITEM ${index + 1} OF ${HCA4Items.length} · ${HCA4CategoryName(item.category).toUpperCase()}${timed ? ` · ${clock} LEFT` : ''}`, onClose, className: 'hca4-ngn', footer },
    done
      ? HC('div', { className: 'hca4-ngn-results' },
        HC('p', { className: 'hca4-ngn-total' }, HC('strong', {}, `${total} / ${max}`), ' points with partial credit'),
        HC('ol', {}, HCA4Items.map((it, i) => HC('li', { key: it.id },
          HC('div', { className: 'hca4-ngn-result-head' }, HC('strong', {}, it.label), HC('span', {}, `${results[i].score} / ${results[i].max}`)),
          HC('p', { className: 'hca-small' }, HCA4CategoryName(it.category)),
          HC('details', {}, HC('summary', {}, 'Rationale'), HC('p', {}, it.rationale))))),
        HC('p', { className: 'hca-small' }, 'Original illustrative items, not clinical guidance and not a prediction of exam results. Check every rationale against your course materials and current guidelines, for example OpenStax Pharmacology for Nurses or Medical-Surgical Nursing. Scoring approximates the published NGN partial-credit rules.'))
      : HC('div', { className: 'hca4-ngn-item' },
        HC('p', { className: 'hca4-ngn-stem' }, item.stem),
        HC(HCA4Item, { item, answer: answers[item.id] || {}, setAnswer: a => setAnswers({ ...answers, [item.id]: a }), checked: !!checked[item.id] }),
        checked[item.id] && HC('div', { className: 'hca4-ngn-rationale' },
          HC('strong', {}, `${HCA4ItemScore(item, answers[item.id])} of ${HCA4ItemMax(item)} points`), HC('p', {}, item.rationale)),
        HC('p', { className: 'hca-small' }, 'Illustrative sample · not clinical guidance')));
}

/* ---------- Palette commands, shortcuts and runtime ---------- */
HCA3Commands = function HCA4Commands(ctx) {
  return [...HCA4.Commands(ctx),
    { group: 'Actions', icon: 'stethoscope-line', label: 'NCLEX-style practice set', run: () => ctx.setModal({ type: 'hca4-ngn', timed: false }) },
    { group: 'Actions', icon: 'list-check', label: 'Tag cards by NCLEX category', run: () => ctx.setModal({ type: 'hca4-tags' }) }];
};

const HCA4ReaderKeys = [
  ['Next or previous page', ['→', '←']], ['Search in this source', ['F']], ['Highlight selected text', ['H']], ['Pen', ['P']],
  ['Sticky note', ['N']], ['Mark a region and add a note', ['M']], ['Bookmark the page', ['B']],
  ['Show or hide the study panel', ['T']], ['Focus mode (hide everything but the page)', ['Z']], ['Leave focus mode', ['Esc']],
];

function HCA4KeysDialog({ onClose }) {
  const ctx = y(), inReader = ctx.route === 'reader';
  const keyRow = ([label, keys, extra]) => HC(_.Fragment, { key: label }, HC('dt', {}, label),
    HC('dd', {}, keys.map((k2, i) => HC(_.Fragment, { key: i }, i > 0 && HC('span', { className: 'then' }, keys[0] === 'Ctrl' || keys[0] === '⌘' ? '+' : keys[0] === 'G' ? 'then' : '·'), HC('kbd', {}, k2))), extra && HC('span', { className: 'then' }, extra)));
  const general = HCA3Keymap.filter(([label]) => !label.startsWith('In a review'));
  const review = HCA3Keymap.filter(([label]) => label.startsWith('In a review'));
  const section = (title, rows) => HC('section', { key: title, className: 'hca4-keys-section' }, HC('h3', {}, title), HC('dl', { className: 'hca3-keylist' }, rows.map(keyRow)));
  return HC(A, { title: 'Keyboard shortcuts.', eyebrow: 'MOVE FASTER', onClose, className: 'hca3-keys' },
    HC('p', { className: 'hca-small' }, 'Single-key shortcuts work outside text fields.'),
    inReader ? [section('In the reading room', HCA4ReaderKeys), section('Everywhere else', general)] : [section('Everywhere', general), section('In the reading room', HCA4ReaderKeys)],
    section('During a review', review));
}

function HCA4StorageBar() {
  const ctx = y(), [problem, setProblem] = _.useState(HCA4Store.failed ? 'all' : null);
  _.useEffect(() => {
    const on = e => setProblem(e.detail === 'ok' ? null : e.detail);
    window.addEventListener('hca4-storage', on);
    return () => window.removeEventListener('hca4-storage', on);
  }, []);
  if (!problem) return null;
  return HC('div', { className: 'hca4-storage-bar', role: 'alert' },
    HCAIcon('error-warning-line'),
    HC('span', {}, problem === 'db-only'
      ? 'Your latest work could not be saved to this browser’s main storage. A smaller copy was kept, but download a backup now to be safe.'
      : 'Your latest work could not be saved in this browser. Download a backup now so nothing is lost.'),
    HCABtn('Download backup', () => ctx.backupWorkspace(), 'light', 'download-line'),
    HC('button', { className: 'hca3-icon-btn', 'aria-label': 'Dismiss this warning', onClick: () => setProblem(null) }, HCAIcon('close-line')));
}

function HCA4Runtime() {
  const ctx = y(), latest = _.useRef(ctx);
  latest.current = ctx;
  _.useEffect(() => {
    const flush = () => { if (document.visibilityState === 'hidden') I(latest.current.state); };
    document.addEventListener('visibilitychange', flush);
    return () => document.removeEventListener('visibilitychange', flush);
  }, []);
  _.useEffect(() => {
    const onKey = e => {
      const c = latest.current;
      if (c.route !== 'reader' || c.modal || e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector('[role="dialog"]') || e.target.closest?.('input,textarea,select,[contenteditable="true"],[contenteditable=""]')) return;
      const key = e.key.toLowerCase();
      if (e.key === '?') { e.preventDefault(); e.stopImmediatePropagation(); c.setModal({ type: 'hca3-keys' }); }
      else if (key === 'z') { e.preventDefault(); c.setReaderFocus(!c.readerFocus); }
      else if (e.key === 'Escape' && c.readerFocus) { e.preventDefault(); c.setReaderFocus(false); }
      else if (key === 't') { const toggle = document.querySelector('.companion-toggle, .hca-sidecar-header [aria-label="Close study tools"]'); if (toggle) { e.preventDefault(); toggle.click(); } }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);
  return HC(HCA4StorageBar);
}

rs = function HCA4DialogRouter() {
  const ctx = y(), type = ctx.modal?.type, close = () => ctx.setModal(null);
  const own = type === 'hca4-ngn' ? HC(HCA4PracticeDialog, { onClose: close, timed: !!ctx.modal.timed })
    : type === 'hca4-tags' ? HC(HCA4TagDialog, { onClose: close })
    : type === 'hca3-keys' ? HC(HCA4KeysDialog, { onClose: close })
    : HC(HCA4.Dialogs);
  return HC(_.Fragment, {}, HC(HCA4Runtime), own);
};
