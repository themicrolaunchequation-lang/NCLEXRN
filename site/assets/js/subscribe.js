/* Plans page: shows the price for the chosen billing country and starts Stripe checkout through window.HCA. */
(() => {
  const SUPABASE = 'https://ujeofxfbwivjmgrxqdcl.supabase.co';
  const KEY = 'sb_publishable_ie1qqB5QnaqUZPitNPfQCg__M46e7JL';
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const msg = (t) => { $('[data-sub-msg]').textContent = t; };
  const ERR = {
    already_subscribed: 'You already have an active plan. Use "Manage or cancel my plan" to change it.',
    plan_unavailable: 'That plan is not available any more.',
    payments_unavailable: 'Payments are not open yet. Please try again soon.',
    no_customer: 'There is no plan on this account yet.',
    offline: 'You seem to be offline. Please check your connection.',
  };
  const get = async (path) => { const r = await fetch(`${SUPABASE}/rest/v1/${path}`, { headers: { apikey: KEY } }); if (!r.ok) throw new Error(r.status); return r.json(); };
  const money = (amount, cur) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: cur.toUpperCase(), minimumFractionDigits: 2 }).format(amount);
  let bands = {}, regional = {}, plans = {};

  function guessCountry() {
    try { const m = (navigator.languages || [navigator.language]).map((l) => /-([A-Z]{2})$/i.exec(l)).find(Boolean); return m ? m[1].toUpperCase() : 'GB'; } catch { return 'GB'; }
  }
  function render() {
    const c = $('[data-sub-country]').value, band = bands[c] || 'A';
    for (const el of $$('[data-price]')) {
      const id = el.dataset.price, r = regional[id + ':' + band], p = plans[id];
      el.textContent = band !== 'A' && r ? money(r.amount, r.currency) : p ? money(p.amount_gbp, 'gbp') : '';
    }
    $('[data-sub-band]').textContent = band === 'A' ? 'Prices in pounds sterling, VAT included where it applies.' : 'Reduced prices for your country, in US dollars.';
    const f = plans['crown-year-founding'];
    $('[data-founding]').hidden = !f || (f.available_until && Date.parse(f.available_until) < Date.now());
  }

  async function init() {
    const sel = $('[data-sub-country]');
    const names = new Intl.DisplayNames(['en'], { type: 'region' });
    const codes = 'AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN VU WS XK YE ZA ZM ZW'.split(' ');
    const opts = codes.map((c) => { let n = c; try { n = names.of(c) || c; } catch { /* keep code */ } return [c, n]; }).sort((a, b) => a[1].localeCompare(b[1]));
    for (const [c, n] of opts) sel.add(new Option(n, c));
    const g = guessCountry(); sel.value = codes.includes(g) ? g : 'GB';
    sel.addEventListener('change', render);
    try {
      const [b, r, p] = await Promise.all([get('crown_country_bands?select=iso,band'), get('crown_regional_prices?select=plan_id,band,currency,amount'), get('crown_plans?select=id,amount_gbp,available_until,active')]);
      bands = Object.fromEntries(b.map((x) => [x.iso, x.band]));
      regional = Object.fromEntries(r.map((x) => [x.plan_id + ':' + x.band, x]));
      plans = Object.fromEntries(p.filter((x) => x.active).map((x) => [x.id, x]));
    } catch { msg('Prices could not be loaded. Please refresh the page.'); }
    render();

    const q = new URLSearchParams(location.search);
    if (q.get('checkout') === 'success') msg('Thank you. Your payment went through and your plan will be active within a minute.');
    if (q.get('checkout') === 'cancelled') msg('Checkout was cancelled. Nothing was charged.');
    try {
      const s = await (await fetch(`${SUPABASE}/functions/v1/crown-billing`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: '{"action":"status"}' })).json();
      $('[data-sub-mode]').hidden = !(s.configured && !s.livemode);
    } catch { /* status is informational */ }

    document.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-plan],[data-manage]'); if (!b || !window.HCA) return;
      b.disabled = true; msg('Opening secure checkout…');
      const r = b.dataset.manage !== undefined ? await HCA.manageBilling() : await HCA.checkout(b.dataset.plan, $('[data-sub-country]').value);
      b.disabled = false;
      if (r && r.error) msg(ERR[r.error] || 'Something went wrong. Please try again.' + (r.detail ? ' (' + r.detail + ')' : ''));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
