/* Plans page: three plans (Crown Pass, Gulf Pass, Green Belt), country pricing for the Crown Pass, and Stripe checkout through window.HCA. */
(() => {
  const SUPABASE = 'https://ujeofxfbwivjmgrxqdcl.supabase.co';
  const KEY = 'sb_publishable_ie1qqB5QnaqUZPitNPfQCg__M46e7JL';
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const ERR = {
    already_subscribed: 'You already have an active plan. Use “Stop renewal or update card” below to change it.',
    plan_unavailable: 'That plan is not available any more.',
    payments_unavailable: 'Payments are not open yet. Please try again soon.',
    no_customer: 'There is no plan on this account yet.',
    consent_required: 'Please confirm that you want access to start now.',
    consent_outdated: 'Our terms were just updated. Please reload this page and tick the boxes again.',
    nothing_to_refund: 'We could not find a payment to refund on this account.',
    already_refunded: 'The instant refund button has already been used for this on your account. Your legal right to cancel still applies: email themicrolaunchequation@gmail.com and we will deal with it.',
    outside_window: 'Your 14-day cancellation period has ended, so there is no change-of-mind refund. You can still stop renewal at any time. If something went wrong or does not work as described, email themicrolaunchequation@gmail.com and we will put it right.',
    offline: 'You seem to be offline. Please check your connection.',
  };
  // Short notices (errors, info) appear as a toast at the bottom of the screen, wherever the person is.
  const msg = (t, tone = 'error') => {
    const el = $('[data-toast]'); if (!el) return;
    clearTimeout(msg.timer);
    if (!t) { el.hidden = true; return; }
    el.dataset.tone = tone; $('[data-toast-text]').textContent = t; el.hidden = false;
    if (tone === 'info') msg.timer = setTimeout(() => { el.hidden = true; }, 7000);
  };
  const APP = { crown: ['the Crown Pass', '/'], medlex: ['MedLex', '/medlex/'], carecraft: ['Carecraft', '/carecraft/'], lumen: ['Lumen', '/lumen/'] };
  const EXAM = { saudi: 'Saudi SNLE', qatar: 'Qatar DHP', dubai: 'Dubai DHA', abudhabi: 'Abu Dhabi DOH' };
  const GULF = 'https://snle.healthcarecrownacademy.co.uk/';
  function describe(plan) {
    const g = /^gulf-(\w+)-(\d+)m$/.exec(plan || '');
    if (g && g[1] === 'all') return { name: `the Gulf Pass for ${g[2]} months: all four Gulf exams, plus the Crown Pass`, go: GULF, cta: 'Open the exam studio' };
    if (g) return { name: `the ${EXAM[g[1]] || 'Gulf Region'} exam pass for ${g[2]} month${g[2] === '1' ? '' : 's'}`, go: GULF, cta: 'Open the exam studio' };
    const key = String(plan || '').split('-')[0];
    const a = APP[key] || APP.crown;
    return { name: a[0], go: a[1], cta: APP[key] && key !== 'crown' ? `Open ${a[0]}` : 'Start learning', trial: !key || key === 'crown' };
  }
  // Big, clear confirmation card for good news: a payment, a refund or a cancelled trial.
  function result({ tone = 'success', kicker, title, amount, text, steps = [], go, cta, fine = '' }) {
    const d = $('[data-result]'); if (!d || !d.showModal) { msg(`${title}. ${text}`, 'info'); return; }
    $('.sp-result-in').dataset.tone = tone;
    $('[data-result-kicker]').textContent = kicker;
    $('[data-result-title]').textContent = title;
    const am = $('[data-result-amount]'); am.hidden = !amount; am.innerHTML = amount || '';
    $('[data-result-text]').textContent = text;
    $('[data-result-steps]').innerHTML = steps.map((x) => `<li>${x}</li>`).join('');
    const g = $('[data-result-go]'); g.hidden = !go; if (go) { g.href = go; g.textContent = cta; }
    $('[data-result-fine]').textContent = fine;
    const icon = $('.sp-result-icon'); icon.replaceWith(icon.cloneNode(true)); // replay the tick animation
    d.showModal();
  }
  const get = async (path) => { const r = await fetch(`${SUPABASE}/rest/v1/${path}`, { headers: { apikey: KEY } }); if (!r.ok) throw new Error(r.status); return r.json(); };
  const money = (amount, cur) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: cur.toUpperCase(), minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2 }).format(amount).replace(/^US\$/, 'US$');
  // List prices are built in so the page never shows blanks; the database overrides them when it loads.
  let plans = { 'crown-month': { amount_gbp: 5.99 }, 'crown-year': { amount_gbp: 39.99 }, 'crown-year-founding': { amount_gbp: 29.99, available_until: '2027-01-31T23:59:59Z' } };
  const PASS = { '3m': { usd: 50, months: 3 }, '6m': { usd: 69, months: 6 } }; // Gulf Pass, the same in every country (gulf_exam_plans)
  let bands = {}, regional = {}, period = 'year', len = '6m';

  const band = () => bands[$('[data-sub-country]').value] || 'A';
  function price(id) {
    const b = band(), r = regional[id + ':' + b], p = plans[id];
    if (b !== 'A' && r) return { amount: Number(r.amount), cur: r.currency };
    return p ? { amount: Number(p.amount_gbp), cur: 'gbp' } : null;
  }
  const fmt = (x) => (x ? money(x.amount, x.cur) : '');
  const founding = () => { const f = plans['crown-year-founding']; return Boolean(f) && !(f.available_until && Date.parse(f.available_until) < Date.now()); };
  // The plan the Crown Pass button buys: the founding first year while it lasts, otherwise the chosen period.
  const crownPlan = () => (period === 'year' && founding() ? 'crown-year-founding' : `crown-${period}`);

  function render() {
    const m = price('crown-month'), y = price('crown-year'), now = price(crownPlan());
    const was = $('[data-crown-was]');
    $('[data-crown-price]').textContent = fmt(now);
    $('[data-crown-per]').textContent = period === 'year' ? (crownPlan() === 'crown-year-founding' ? '/first year' : '/year') : '/month';
    was.hidden = true; // no struck-through comparison price (CMA pricing guidance)
    const note = $('[data-crown-note]');
    if (period === 'month') note.textContent = y && m ? `Or ${fmt(y)} a year and save ${money(m.amount * 12 - y.amount, m.cur)}.` : 'Billed monthly.';
    else if (crownPlan() === 'crown-year-founding') note.textContent = `Founding price for your first year. Then ${fmt(y)} a year. Offer ends 31 January 2027.`;
    else note.textContent = y ? `About ${money(y.amount / 12, y.cur)} a month, billed yearly.` : '';
    const tn = $('[data-trial-note]');
    if (tn && now) {
      const first = new Date(Date.now() + 7 * 864e5).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      tn.textContent = `£0 today. Then ${fmt(now)} on ${first}, renewing automatically${crownPlan() === 'crown-year-founding' ? ` at ${fmt(y)} a year` : ''}. Cancel before then and you pay nothing.`;
    }
    $('[data-sub-band]').textContent = band() === 'A' ? 'Prices in pounds sterling.' : 'Fair pricing for your country, in US dollars.';
    const g = PASS[len];
    $('[data-gulf-price]').textContent = money(g.usd, 'usd');
    $('[data-gulf-per]').textContent = `/${g.months} months`;
    $('[data-gulf-note]').textContent = `Paid once, never renews. About ${money(g.usd / g.months, 'usd')} a month.`;
    for (const b of $$('[data-period]')) b.setAttribute('aria-checked', String(b.dataset.period === period));
    for (const b of $$('[data-len]')) b.setAttribute('aria-checked', String(b.dataset.len === len));
  }

  // Ask for express consent to start access now (UK Consumer Contracts Regulations 2013) before every checkout.
  function consent() {
    const d = $('[data-consent-dialog]'), box = $('[data-consent-box]'), adult = $('[data-adult-box]'), go = $('[data-consent-go]');
    if (!d || !d.showModal) return Promise.resolve(window.confirm('I am 18 or over (or a parent or guardian paying), and I ask for my access to start now, during my 14-day cancellation period. I understand that if I cancel within that period I get a full refund within 3 days of paying, and after that a refund minus the days I have used.\n\nPress OK to confirm and continue to secure payment.'));
    box.checked = false; adult.checked = false; go.disabled = true;
    box.onchange = adult.onchange = () => { go.disabled = !(box.checked && adult.checked); };
    d.showModal();
    return new Promise((res) => { d.onclose = () => res(d.returnValue === 'ok' && box.checked && adult.checked); });
  }

  async function askRefund() {
    const d = $('[data-refund-dialog]');
    d.showModal();
    const kind = await new Promise((res) => { d.onclose = () => res(d.returnValue); });
    if (kind !== 'subscription' && kind !== 'gulf') return;
    msg('Working out your refund…', 'info');
    const q = await HCA.refund(kind, true);
    if (q && q.error) { if (q.error !== 'sign_in_required') msg(ERR[q.error] || 'Something went wrong. Please try again in a moment.'); return; }
    msg('');
    // Show the exact amount first; nothing changes until the person confirms.
    const c = $('[data-refund-confirm]');
    $('[data-rc-title]').textContent = q.trial ? 'Cancel your free trial?' : `You will get back ${money(q.amount, q.currency)}`;
    $('[data-rc-text]').textContent = q.trial
      ? 'Your trial ends now and nothing is taken from your card.'
      : `${q.name}: you paid ${money(q.paid, q.currency)}. ${q.full ? 'This is a full refund, because it is within 3 days of paying.' : `This is the price minus the days you have used (price × days used ÷ days in the period).`} Your paid access ends as soon as you confirm. If the law gives you more, email us and we will pay the difference.`;
    c.showModal();
    const yes = await new Promise((res) => { c.onclose = () => res(c.returnValue === 'ok'); });
    if (!yes) return;
    msg('Sending your refund…', 'info');
    const r = await HCA.refund(kind);
    if (r && r.error) { if (r.error !== 'sign_in_required') msg(ERR[r.error] || 'Something went wrong. Please try again in a moment.'); return; }
    msg('');
    if (r.trial) return result({ tone: 'neutral', kicker: 'Trial cancelled', title: 'You have not been charged', text: 'Your free trial has ended and nothing will be taken from your card.',
      steps: ['Your free features and saved work stay in your account.', 'You can start a plan again whenever you like.'] });
    const amt = r.amount != null ? money(r.amount, r.currency) : '';
    const when = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    result({ tone: 'refund', kicker: 'Refund confirmed', title: 'Your money is on its way', amount: `${amt}<small>${r.full ? 'Full refund' : 'Unused part'}</small>`,
      text: 'We have sent the refund to the card you paid with.',
      steps: ['It usually reaches your card in 5 to 10 working days, depending on your bank.', 'Your paid access has ended. Your free features and saved work stay.', 'Stripe will email you a receipt for the refund.'],
      fine: `Refunded on ${when}. Questions? themicrolaunchequation@gmail.com` });
  }

  let prelaunch = false;
  async function buy(btn, plan) {
    if (!window.HCA || (prelaunch && plan !== 'manage')) return;
    if (plan !== 'manage' && !(await consent())) return;
    const label = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'Opening secure checkout…'; msg('');
    if (plan !== 'manage') try { sessionStorage.setItem('hca-buying', plan); } catch { /* optional */ }
    const r = plan === 'manage' ? await HCA.manageBilling() : await HCA.checkout(plan, $('[data-sub-country]').value, true);
    btn.disabled = false; btn.innerHTML = label;
    if (r && r.error && r.error !== 'sign_in_required') msg(ERR[r.error] || 'Something went wrong. Please try again in a moment.');
  }

  function radios(group, attr, set) {
    const items = $$(group);
    items.forEach((b, i) => b.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return; e.preventDefault(); const n = items[(i + d + items.length) % items.length]; set(n.dataset[attr]); n.focus();
    }));
  }

  async function init() {
    const sel = $('[data-sub-country]');
    const names = new Intl.DisplayNames(['en'], { type: 'region' });
    const codes = 'AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN VU WS XK YE ZA ZM ZW'.split(' ');
    const opts = codes.map((c) => { let n = c; try { n = names.of(c) || c; } catch { /* keep code */ } return [c, n]; }).sort((a, b) => a[1].localeCompare(b[1]));
    for (const [c, n] of opts) sel.add(new Option(n, c));
    let guess = 'GB';
    try { guess = localStorage.getItem('hca-country') || ((navigator.languages || [navigator.language]).map((l) => /-([A-Z]{2})$/i.exec(l)).find(Boolean) || [, 'GB'])[1].toUpperCase(); } catch { /* default */ }
    sel.value = codes.includes(guess) ? guess : 'GB';
    sel.addEventListener('change', () => { try { localStorage.setItem('hca-country', sel.value); } catch { /* ignore */ } render(); });

    $$('[data-period]').forEach((b) => b.addEventListener('click', () => { period = b.dataset.period; render(); }));
    $$('[data-len]').forEach((b) => b.addEventListener('click', () => { len = b.dataset.len; render(); }));
    radios('[data-period]', 'period', (v) => { period = v; render(); });
    radios('[data-len]', 'len', (v) => { len = v; render(); });
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-refund-open]')) { askRefund(); return; }
      if (e.target.closest('[data-result-close]')) { $('[data-result]').close(); return; }
      if (e.target.closest('[data-toast-close]')) { msg(''); return; }
      const b = e.target.closest('[data-buy-crown],[data-buy-gulf],[data-manage]'); if (!b) return;
      if (b.hasAttribute('data-buy-crown')) buy(b, crownPlan());
      else if (b.hasAttribute('data-buy-gulf')) buy(b, `gulf-all-${len}`);
      else buy(b, 'manage');
    });
    render();

    const [b, r, p, gp] = await Promise.allSettled([get('crown_country_bands?select=iso,band'), get('crown_regional_prices?select=plan_id,band,currency,amount'),
      get('crown_plans?select=id,amount_gbp,available_until,active&product=eq.crown'), get('gulf_exam_plans?select=id,months,amount_usd&id=like.gulf-all-*&active=is.true')]);
    if (b.status === 'fulfilled') bands = Object.fromEntries(b.value.map((x) => [x.iso, x.band]));
    if (r.status === 'fulfilled') regional = Object.fromEntries(r.value.map((x) => [x.plan_id + ':' + x.band, x]));
    if (p.status === 'fulfilled' && p.value.length) plans = Object.fromEntries(p.value.filter((x) => x.active).map((x) => [x.id, x]));
    if (gp.status === 'fulfilled') for (const x of gp.value) { const k = `${x.months}m`; if (PASS[k]) PASS[k].usd = Number(x.amount_usd); }
    render();

    // Deep links from app paywalls and the home page: ?plan=crown|medlex|carecraft|lumen|gulf|lss, ?exam=saudi|qatar|dubai|abudhabi
    const q = new URLSearchParams(location.search);
    const pl = q.get('plan') || '', ex = q.get('exam') || '';
    const target = EXAM[ex] || pl === 'gulf' || pl.startsWith('gulf-') ? 'gulf' : pl === 'lss' ? 'lss' : APP[pl] ? 'crown' : '';
    const hint = target === 'gulf' ? (EXAM[ex] ? `${EXAM[ex]} is included, with the other three Gulf exams.` : '')
      : target === 'crown' && pl !== 'crown' ? `${APP[pl][0]} is included in the Crown Pass, with every other app.` : '';
    const card = target && document.querySelector(`[data-card="${target}"]`);
    if (card) {
      card.classList.add('is-picked');
      const h = $(`[data-hint="${target}"]`); if (h && hint) { h.textContent = hint; h.hidden = false; }
      setTimeout(() => card.scrollIntoView({ block: 'center' }), 200);
    }
    let bought = ''; try { bought = sessionStorage.getItem('hca-buying') || ''; sessionStorage.removeItem('hca-buying'); } catch { /* optional */ }
    if (q.get('checkout') === 'success') {
      const w = describe(bought);
      const charge = new Date(Date.now() + 7 * 864e5).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
      result({ tone: 'success', kicker: w.trial ? 'Free trial started' : 'Payment confirmed', title: 'Welcome to Healthcare Crown', text: `You now have ${w.name}.`,
        steps: [w.trial ? `Everything is unlocked now. Your first payment is on ${charge}, unless you cancel before then.` : 'Your access switches on within a minute. If a page still looks locked, refresh it once.',
          w.trial ? 'Cancel any time with “Stop renewal or update card” on this page.' : 'Stripe has emailed you a receipt.', 'Changed your mind? Full refund within 3 days, or the unused part within 14 days, with “Cancel and get a refund” on this page.'],
        go: w.go, cta: w.cta });
    }
    if (q.get('checkout') === 'cancelled') msg('Checkout was cancelled. Nothing was charged.', 'info');
    if (q.get('refund') === '1') { history.replaceState(null, '', location.pathname); askRefund(); }
    if (q.get('checkout')) history.replaceState(null, '', location.pathname + location.hash);
    try {
      const s = await (await fetch(`${SUPABASE}/functions/v1/crown-billing`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: '{"action":"status"}' })).json();
      if (s.configured && !s.livemode) {
        // Payments are not live yet. Only the owner and approved testers see the test checkout.
        const e = window.HCA ? await HCA.ready.catch(() => null) : null;
        const box = $('[data-sub-mode]');
        if (e && (e.admin || e.tester)) { box.hidden = false; }
        else {
          prelaunch = true;
          box.innerHTML = '<b>Paid plans open very soon.</b> Everything free is open now: start free, no card needed.';
          box.classList.remove('sp-test'); box.classList.add('sp-soon'); box.hidden = false;
          $$('[data-buy-crown],[data-buy-gulf]').forEach((x) => { x.disabled = true; x.textContent = 'Opening soon'; });
        }
      }
    } catch { /* informational only */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
