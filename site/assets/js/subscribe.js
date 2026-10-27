/* Plans page: monthly/yearly toggle, country pricing, Gulf Region exam passes, and Stripe checkout through window.HCA. */
(() => {
  const SUPABASE = 'https://ujeofxfbwivjmgrxqdcl.supabase.co';
  const KEY = 'sb_publishable_ie1qqB5QnaqUZPitNPfQCg__M46e7JL';
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const ERR = {
    already_subscribed: 'You already have an active plan. Use “Manage or cancel my plan” to change it.',
    plan_unavailable: 'That plan is not available any more.',
    payments_unavailable: 'Payments are not open yet. Please try again soon.',
    no_customer: 'There is no plan on this account yet.',
    consent_required: 'Please confirm that you want access to start now.',
    nothing_to_refund: 'We could not find a payment to refund on this account.',
    already_refunded: 'This account has already had an automatic refund for this. Please email themicrolaunchequation@gmail.com and we will help.',
    outside_window: 'Automatic refunds are available within 14 days of your first payment. Please email themicrolaunchequation@gmail.com if something went wrong.',
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
  function describe(plan) {
    const g = /^gulf-(\w+)-(\d+)m$/.exec(plan || '');
    if (g) return { name: `the ${EXAM[g[1]] || 'Gulf Region'} exam pass for ${g[2]} month${g[2] === '1' ? '' : 's'}`, go: 'https://snle.healthcarecrownacademy.co.uk/', cta: 'Open the exam studio' };
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
  const money = (amount, cur) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: cur.toUpperCase(), minimumFractionDigits: 2 }).format(amount).replace(/^US\$/, 'US$');
  // List prices are built in so the page never shows blanks; the database overrides them when it loads.
  let plans = { 'crown-month': { amount_gbp: 5.99 }, 'crown-year': { amount_gbp: 39.99 }, 'crown-year-founding': { amount_gbp: 29.99, available_until: '2027-01-31T23:59:59Z' },
    'medlex-month': { amount_gbp: 2.99 }, 'medlex-year': { amount_gbp: 19.99 }, 'carecraft-month': { amount_gbp: 2.99 }, 'carecraft-year': { amount_gbp: 19.99 },
    'lumen-month': { amount_gbp: 4.99 }, 'lumen-year': { amount_gbp: 34.99 } };
  let bands = {}, regional = {}, period = 'year', exam = 'saudi';

  const band = () => bands[$('[data-sub-country]').value] || 'A';
  function price(id) {
    const b = band(), r = regional[id + ':' + b], p = plans[id];
    if (b !== 'A' && r) return { amount: Number(r.amount), cur: r.currency };
    return p ? { amount: Number(p.amount_gbp), cur: 'gbp' } : null;
  }
  const fmt = (x) => (x ? money(x.amount, x.cur) : '');

  function render() {
    for (const el of $$('[data-price]')) el.textContent = fmt(price(el.dataset.price));
    for (const el of $$('[data-show]')) {
      const app = el.dataset.show, m = price(app + '-month'), y = price(app + '-year');
      const note = $(`[data-sub-note="${app}"]`);
      if (period === 'year' && y) {
        el.textContent = money(y.amount / 12, y.cur);
        note.textContent = `Billed ${fmt(y)} a year` + (m ? ` · save ${money(m.amount * 12 - y.amount, y.cur)}` : '');
      } else if (m) {
        el.textContent = fmt(m);
        note.textContent = y ? `Billed monthly · or ${fmt(y)} a year` : 'Billed monthly';
      }
    }
    for (const el of $$('[data-per]')) el.textContent = '/month';
    const parts = ['medlex', 'carecraft', 'lumen'].map((a) => price(a + '-month')).filter(Boolean);
    if (parts.length === 3) $('[data-worth]').textContent = money(parts.reduce((n, x) => n + x.amount, 0), parts[0].cur);
    $('[data-sub-band]').textContent = band() === 'A' ? 'Prices in pounds sterling. VAT included where it applies.' : 'Fair pricing for your country, in US dollars.';
    const f = plans['crown-year-founding'];
    $('[data-founding]').hidden = !f || (f.available_until && Date.parse(f.available_until) < Date.now());
    for (const b of $$('[data-period]')) b.setAttribute('aria-checked', String(b.dataset.period === period));
    for (const b of $$('[data-exam]')) b.setAttribute('aria-checked', String(b.dataset.exam === exam));
  }

  // Ask for express consent to start access now (UK Consumer Contracts Regulations 2013) before every checkout.
  function consent() {
    const d = $('[data-consent-dialog]'), box = $('[data-consent-box]'), go = $('[data-consent-go]');
    if (!d || !d.showModal) return Promise.resolve(window.confirm('Your access starts straight away. Full refund within 3 days of paying; within 14 days you get back the unused part. Continue?'));
    box.checked = false; go.disabled = true;
    box.onchange = () => { go.disabled = !box.checked; };
    d.showModal();
    return new Promise((res) => { d.onclose = () => res(d.returnValue === 'ok' && box.checked); });
  }

  async function askRefund() {
    const d = $('[data-refund-dialog]');
    d.showModal();
    const kind = await new Promise((res) => { d.onclose = () => res(d.returnValue); });
    if (kind !== 'subscription' && kind !== 'gulf') return;
    msg('Checking your payment…', 'info');
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

  async function buy(btn, plan) {
    if (!window.HCA) return;
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
    $$('[data-exam]').forEach((b) => b.addEventListener('click', () => { exam = b.dataset.exam; render(); }));
    radios('[data-period]', 'period', (v) => { period = v; render(); });
    radios('[data-exam]', 'exam', (v) => { exam = v; render(); });
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-refund-open]')) { askRefund(); return; }
      if (e.target.closest('[data-result-close]')) { $('[data-result]').close(); return; }
      if (e.target.closest('[data-toast-close]')) { msg(''); return; }
      const b = e.target.closest('[data-buy],[data-plan],[data-pass],[data-manage]'); if (!b) return;
      if (b.dataset.buy) buy(b, `${b.dataset.buy}-${period}`);
      else if (b.dataset.plan) buy(b, b.dataset.plan);
      else if (b.dataset.pass) buy(b, `gulf-${exam}-${b.dataset.pass}`);
      else buy(b, 'manage');
    });
    render();

    const [b, r, p] = await Promise.allSettled([get('crown_country_bands?select=iso,band'), get('crown_regional_prices?select=plan_id,band,currency,amount'), get('crown_plans?select=id,amount_gbp,available_until,active')]);
    if (b.status === 'fulfilled') bands = Object.fromEntries(b.value.map((x) => [x.iso, x.band]));
    if (r.status === 'fulfilled') regional = Object.fromEntries(r.value.map((x) => [x.plan_id + ':' + x.band, x]));
    if (p.status === 'fulfilled' && p.value.length) plans = Object.fromEntries(p.value.filter((x) => x.active).map((x) => [x.id, x]));
    render();

    const q = new URLSearchParams(location.search);
    // Deep links from app paywalls: ?plan=medlex|carecraft|lumen|crown, ?exam=saudi|qatar|dubai|abudhabi
    const ex = q.get('exam'); if (['saudi', 'qatar', 'dubai', 'abudhabi'].includes(ex)) { exam = ex; render(); document.querySelector('.sp-gulf')?.scrollIntoView({ block: 'center' }); }
    const pl = q.get('plan'); const card = pl && document.querySelector(`[data-buy="${CSS.escape(pl)}"]`)?.closest('.sp-card');
    if (card) { card.classList.add('is-picked'); setTimeout(() => card.scrollIntoView({ block: 'center' }), 200); }
    let bought = ''; try { bought = sessionStorage.getItem('hca-buying') || ''; sessionStorage.removeItem('hca-buying'); } catch { /* optional */ }
    if (q.get('checkout') === 'success') {
      const w = describe(bought);
      const charge = new Date(Date.now() + 7 * 864e5).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
      result({ tone: 'success', kicker: w.trial ? 'Free trial started' : 'Payment confirmed', title: 'Welcome to Healthcare Crown', text: `You now have ${w.name}.`,
        steps: [w.trial ? `Everything is unlocked now. Your first payment is on ${charge}, unless you cancel before then.` : 'Your access switches on within a minute. If a page still looks locked, refresh it once.',
          w.trial ? 'Cancel any time with “Manage or cancel my plan” on this page.' : 'Stripe has emailed you a receipt.', 'Changed your mind? Full refund within 3 days, or the unused part within 14 days, with “Request a refund” on this page.'],
        go: w.go, cta: w.cta });
    }
    if (q.get('checkout') === 'cancelled') msg('Checkout was cancelled. Nothing was charged.', 'info');
    if (q.get('checkout')) history.replaceState(null, '', location.pathname + location.hash);
    try {
      const s = await (await fetch(`${SUPABASE}/functions/v1/crown-billing`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: '{"action":"status"}' })).json();
      $('[data-sub-mode]').hidden = !(s.configured && !s.livemode);
    } catch { /* informational only */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
