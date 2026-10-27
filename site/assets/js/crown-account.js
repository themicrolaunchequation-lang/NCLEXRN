/* Crown Suite account: one sign-in across healthcarecrownacademy.co.uk, MedLex, Carecraft, Serein, Lumen and Evinca.
   Reads the shared session cookie written by the account site (hca-auth.0, .1, ...), refreshes it when it
   expires, asks the database what this person can open (crown_entitlements) and shows an account button.
   Exposes window.HCA for app paywalls:
     HCA.ready              Promise<entitlements> ({signed_in, admin, crown, medlex|carecraft|serein|lumen: 'free'|'premium'})
     HCA.signIn(mode?)      go to the account site ('signup' for a new account)
     HCA.locked(app)        true when free-plan limits apply to this app right now (gates on, not premium/admin)
     HCA.gate(app, what, allowed)  runs allowed() if premium, else opens the paywall (async, resolves true/false)
     HCA.limit(kind, count) Lumen quotas: kind 'source' (free 3) or 'card' (free 50); count = how many the person
                            already has. Returns true if one more is allowed, else opens the paywall and returns false.
                            Lumen calls `window.HCA && HCA.gate && HCA.gate('source', count)`; gate(kind, number)
                            is an alias of limit(kind, number). Always true while gates are off.
     HCA.paywall(app, what) open the upgrade dialog;  HCA.upgrade(app) go to pricing.
     HCA.session(force?)    Promise<{access_token, email, name, expires_at}|null>, refreshed when near expiry (force = refresh now);
                            rejects if the network is down during a needed refresh.  HCA.token(force?) is just its access_token (or null).
                            Use it to call the project's own functions as the signed-in person; never store or log the token.
   Per-app free limits are chosen by <meta name="hca-app" content="medlex|carecraft|serein|lumen">.
   Gates are on (GATES_LIVE): free-plan limits apply until someone has a plan. Turn them off with GATES_LIVE = false.
   Plain ES2020, no dependencies. Works signed out and offline (everything stays free-tier). */
(() => {
  'use strict';
  const SUPABASE = 'https://ujeofxfbwivjmgrxqdcl.supabase.co';
  const KEY = 'sb_publishable_ie1qqB5QnaqUZPitNPfQCg__M46e7JL';
  const ACCOUNT = 'https://account.healthcarecrownacademy.co.uk/en';
  const COOKIE = 'hca-auth', CHUNK = 3000, DOMAIN = 'healthcarecrownacademy.co.uk';
  const onCrown = location.hostname === DOMAIN || location.hostname.endsWith('.' + DOMAIN);
  // App availability switch. Set an app to false to hide every link to it (home page, app menus,
  // account menu, Daily Crown) until its address works. One place for the whole suite.
  const LIVE = { snle: true, lss: true };
  const FREE = { signed_in: false, admin: false, medlex: 'free', carecraft: 'free', serein: 'free', lumen: 'free', crown: false };

  const readCookie = (n) => { const c = document.cookie.split('; ').find((x) => x.startsWith(n + '=')); return c ? decodeURIComponent(c.slice(n.length + 1)) : null; };
  const writeCookie = (n, v, age) => { document.cookie = `${n}=${encodeURIComponent(v)}; ${onCrown ? 'Domain=.' + DOMAIN + '; ' : ''}Path=/; Max-Age=${age}; Secure; SameSite=Lax`; };
  function load() { let s = '', i = 0, p; while ((p = readCookie(`${COOKIE}.${i}`)) !== null) { s += p; i++; } try { return i ? JSON.parse(s) : null; } catch { return null; } }
  function clear() { for (let i = 0; readCookie(`${COOKIE}.${i}`) !== null; i++) writeCookie(`${COOKIE}.${i}`, '', 0); }
  function save(session) { clear(); const v = JSON.stringify(session); for (let i = 0; i * CHUNK < v.length; i++) writeCookie(`${COOKIE}.${i}`, v.slice(i * CHUNK, (i + 1) * CHUNK), 31536000); }

  // One refresh at a time: refresh tokens rotate, so two overlapping refreshes (account button + an app) must share a request.
  let refreshing = null;
  async function session(force) {
    let s = load();
    if (!s || !s.refresh_token) return null;
    if (force || !s.expires_at || s.expires_at * 1000 < Date.now() + 60000) {
      refreshing = refreshing || (async () => {
        const r = await fetch(`${SUPABASE}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: s.refresh_token }) });
        if (!r.ok) { if (r.status === 400 || r.status === 401) clear(); return null; }
        const n = await r.json();
        if (!n.expires_at && n.expires_in) n.expires_at = Math.floor(Date.now() / 1000) + n.expires_in;
        save(n);
        return n;
      })().finally(() => { refreshing = null; });
      s = await refreshing;
    }
    return s;
  }
  /** The signed-in person's session for apps that call their own Supabase functions: {access_token, email, name, expires_at} or null.
      Rejects only when the network is unreachable while a refresh is needed (callers should treat that as "offline", not "signed out"). */
  async function currentSession(force) {
    const s = await session(force);
    return s && s.access_token ? { access_token: s.access_token, email: s.user?.email || '', name: s.user?.user_metadata?.full_name || '', expires_at: s.expires_at || 0 } : null;
  }

  async function entitlements() {
    try {
      const s = await session();
      if (!s) return { ...FREE };
      const r = await fetch(`${SUPABASE}/rest/v1/rpc/crown_entitlements`, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + s.access_token, 'Content-Type': 'application/json' }, body: '{}' });
      const e = r.ok ? await r.json() : null;
      return e && e.signed_in ? { ...FREE, ...e, email: s.user?.email || '', name: s.user?.user_metadata?.full_name || '' } : { ...FREE };
    } catch { return { ...FREE }; }
  }

  const signInURL = (mode) => `${ACCOUNT}/sign-in?${mode === 'signup' ? 'mode=signup&' : ''}next=${encodeURIComponent(location.href)}`;
  async function signOut() {
    const s = load();
    clear();
    if (s?.access_token) fetch(`${SUPABASE}/auth/v1/logout`, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + s.access_token } }).catch(() => {});
    location.reload();
  }

  const css = `.hca-acct{position:relative;font:600 14px/1.2 Inter,Geist,system-ui,sans-serif;z-index:999;white-space:nowrap}
.hca-acct.floating{position:fixed;left:calc(16px + env(safe-area-inset-left,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px))}
.hca-acct-btn{white-space:nowrap;display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:4px 14px 4px 4px;border-radius:999px;border:1px solid rgba(232,193,112,.55);background:#0B1530;color:#F8F5EF;cursor:pointer;box-shadow:0 8px 24px -10px rgba(5,10,24,.6)}
.hca-acct-btn.signed-out{padding:0 16px;background:linear-gradient(135deg,#F3D99B,#D4A445 60%,#B8862B);color:#1B1404;border:0}
.hca-acct-btn:focus-visible{outline:3px solid #F1C56E;outline-offset:3px}
.hca-av{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#F3D99B,#B8862B);color:#1B1404;font-weight:700}
.hca-tag{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#E8C170}
.hca-menu{position:absolute;right:0;top:calc(100% + 10px);width:260px;padding:10px;border-radius:16px;background:#0B1530;border:1px solid rgba(232,193,112,.35);box-shadow:0 20px 50px -12px rgba(5,10,24,.7);color:#EEF1F8;display:grid;gap:4px}
.hca-acct.floating .hca-menu{right:auto;left:0;top:auto;bottom:calc(100% + 10px)}
.hca-menu[hidden]{display:none}
.hca-menu p{margin:4px 8px 8px;font-weight:400;color:#AEB8D0;font-size:13px;overflow-wrap:anywhere}
.hca-menu a,.hca-menu button{display:block;width:100%;text-align:left;padding:10px;border-radius:10px;color:#EEF1F8;background:none;border:0;font:inherit;text-decoration:none;cursor:pointer}
.hca-menu a:hover,.hca-menu button:hover,.hca-menu a:focus-visible,.hca-menu button:focus-visible{background:rgba(243,217,155,.12);outline:none}
.hca-menu .gold{color:#F3D99B}
.hca-acct.floating.right{left:auto;right:calc(16px + env(safe-area-inset-right,0px))}
.hca-acct.floating.right .hca-menu{left:auto;right:0}
.hca-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.hca-ico{width:20px;height:20px;display:none}
@media (max-width:760px){
.hca-acct.floating,.hca-acct.floating.right{top:calc(8px + env(safe-area-inset-top,0px));bottom:auto;left:auto;right:calc(8px + env(safe-area-inset-right,0px))}
.hca-acct.floating .hca-acct-btn{width:44px;height:44px;min-height:44px;padding:0;justify-content:center;opacity:.92}
.hca-acct.floating .hca-acct-btn .hca-tag,.hca-acct.floating .hca-acct-btn .hca-lbl{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.hca-acct.floating .hca-ico{display:block}
.hca-acct.floating .hca-menu,.hca-acct.floating.right .hca-menu{left:auto;right:0;bottom:auto;top:calc(100% + 8px);max-width:calc(100vw - 16px)}
}
@media print{.hca-acct{display:none}}
.hca-pay{width:min(460px,calc(100% - 24px));max-width:100%;padding:0;border:1px solid rgba(232,193,112,.5);border-radius:24px;background:radial-gradient(120% 90% at 50% 0%,#15254D,#081128 70%);color:#EEF1F8;font:400 15px/1.5 Inter,Geist,system-ui,sans-serif;box-shadow:0 30px 80px rgba(5,10,24,.6)}
.hca-pay::backdrop{background:rgba(5,10,24,.72);backdrop-filter:blur(4px)}
.hca-pay-in{padding:28px}
.hca-pay-eye{margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.14em;color:#E8C170}
.hca-pay h2{margin:0 0 8px;font:500 28px/1.15 'Playfair Display',Fraunces,Georgia,serif;color:#F8F5EF}
.hca-pay-lead{margin:0 0 14px;color:#C7D0E4}
.hca-pay ul{margin:0 0 16px;padding:0;list-style:none;display:grid;gap:6px}
.hca-pay li{padding-left:22px;position:relative}.hca-pay li::before{content:"◆";position:absolute;left:0;color:#E8C170;font-size:11px;top:3px}
.hca-pay-price{margin:0 0 18px;color:#C7D0E4}.hca-pay-price b{color:#F3D99B}
.hca-pay-row{display:flex;flex-wrap:wrap;gap:10px}
.hca-pay-go{display:inline-flex;align-items:center;min-height:44px;padding:0 20px;border-radius:999px;background:linear-gradient(135deg,#F3D99B,#D4A445 60%,#B8862B);color:#1B1404;font-weight:700;text-decoration:none}
.hca-pay-alt{min-height:44px;padding:0 16px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:none;color:#EEF1F8;font:inherit;font-weight:600;cursor:pointer}
.hca-pay :focus-visible{outline:3px solid #F1C56E;outline-offset:3px}`;

  function render(host, e) {
    const initials = (e.name || e.email || '?').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join('');
    const plan = e.admin ? 'Admin' : e.crown ? 'Crown Pass' : ['medlex', 'carecraft', 'serein', 'lumen'].some((k) => e[k] === 'premium') ? 'Member+' : 'Free';
    host.innerHTML = '';
    const btn = document.createElement('button');
    btn.type = 'button';
    if (!e.signed_in) {
      btn.className = 'hca-acct-btn signed-out';
      btn.setAttribute('aria-label', 'Sign in');
      btn.innerHTML = '<svg class="hca-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.2 4-6.5 8-6.5s7.2 2.3 8 6.5"/></svg><span class="hca-lbl">Sign in</span>';
      btn.addEventListener('click', () => { location.href = signInURL(); });
      host.append(btn);
      return;
    }
    btn.className = 'hca-acct-btn';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Your account: ' + plan);
    btn.innerHTML = `<span class="hca-av" aria-hidden="true"></span><span class="hca-tag"></span>`;
    btn.firstChild.textContent = initials;
    btn.lastChild.textContent = plan;
    const menu = document.createElement('div');
    menu.className = 'hca-menu';
    menu.hidden = true;
    const who = document.createElement('p');
    who.textContent = e.email;
    menu.append(who);
    const link = (text, href, cls) => { const a = document.createElement('a'); a.href = href; a.textContent = text; if (cls) a.className = cls; menu.append(a); };
    link('My account', `${ACCOUNT}/account`);
    if (!e.crown && !e.admin) link('Upgrade to the Crown Pass', 'https://healthcarecrownacademy.co.uk/#pricing', 'gold');
    link('MedLex', 'https://medlex.healthcarecrownacademy.co.uk/');
    link('Carecraft', 'https://carecraft.healthcarecrownacademy.co.uk/');
    link('Serein', 'https://serein.healthcarecrownacademy.co.uk/');
    link('Lumen', 'https://lumen.healthcarecrownacademy.co.uk/');
    if (LIVE.snle) link('Gulf Region Nursing', 'https://snle.healthcarecrownacademy.co.uk/');
    link('Evinca', 'https://evinca.healthcarecrownacademy.co.uk/en');
    if (e.admin) link('Crown admin', `${ACCOUNT}/account/admin`, 'gold');
    const out = document.createElement('button');
    out.type = 'button';
    out.textContent = 'Sign out';
    out.addEventListener('click', signOut);
    menu.append(out);
    const set = (open) => { menu.hidden = !open; btn.setAttribute('aria-expanded', String(open)); if (open) menu.querySelector('a').focus(); };
    btn.addEventListener('click', () => set(menu.hidden));
    document.addEventListener('click', (ev) => { if (!host.contains(ev.target)) set(false); });
    host.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { set(false); btn.focus(); } });
    host.append(btn, menu);
  }

  const ready = entitlements();
  let ent = null;
  ready.then((e) => { ent = e; });

  /* ---------- Free and paid limits ----------
     On since paid plans opened (26 Oct 2026).
     The "Get help" support in Serein and every app's first steps always stay free. */
  const GATES_LIVE = true;
  const gatesOn = GATES_LIVE || new URLSearchParams(location.search).get('gates') === 'on';
  const NAMES = { medlex: 'MedLex', carecraft: 'Carecraft', serein: 'Serein', lumen: 'Lumen' };
  const PERKS = {
    medlex: ['All 26 modules and 1,480 terms', '56 illustrated guides', 'Spaced practice and worksheets'],
    carecraft: ['All 30 lessons and 90 visual guides', 'All 22 practice activities', 'Smart Review'],
    serein: ['All 15 practices', 'Journeys, routines and insights', 'Team toolkit'],
    lumen: ['More Academy AI help each day', 'Unlimited sources and recall cards', 'Focus planner'],
  };
  // Must match the pricing section on the home page and public.crown_plans (monthly).
  const PRICE = { medlex: '£2.99/month', carecraft: '£2.99/month', serein: 'free', lumen: '£4.99/month' };
  const CROWN_PRICE = '£5.99/month';
  function paywall(app, what) {
    document.querySelector('.hca-pay')?.remove();
    const d = document.createElement('dialog');
    d.className = 'hca-pay';
    d.setAttribute('aria-labelledby', 'hca-pay-title');
    const signedIn = ent && ent.signed_in;
    d.innerHTML = `<div class="hca-pay-in"><p class="hca-pay-eye">${NAMES[app].toUpperCase()} PREMIUM</p><h2 id="hca-pay-title"></h2><p class="hca-pay-lead"></p><ul></ul>
<p class="hca-pay-price">${NAMES[app]} on its own <b>${PRICE[app]}</b>, or every app with the Crown Pass <b>${CROWN_PRICE}</b>. Codes can be used at checkout.</p>
<div class="hca-pay-row"><a class="hca-pay-go" href="https://healthcarecrownacademy.co.uk/subscribe?plan=${encodeURIComponent(app)}">See plans</a>${signedIn ? '' : '<button type="button" class="hca-pay-alt" data-in>I already have a plan</button>'}<button type="button" class="hca-pay-alt" data-close>Not now</button></div></div>`;
    d.querySelector('h2').textContent = what ? `Unlock ${what}` : `Unlock all of ${NAMES[app]}`;
    d.querySelector('.hca-pay-lead').textContent = `This is part of ${NAMES[app]} premium. Everything you have done so far stays yours.`;
    for (const t of PERKS[app]) { const li = document.createElement('li'); li.textContent = t; d.querySelector('ul').append(li); }
    d.addEventListener('click', (e) => { if (e.target.closest('[data-close]') || e.target === d) d.close(); if (e.target.closest('[data-in]')) location.href = signInURL(); });
    d.addEventListener('close', () => d.remove());
    document.body.append(d);
    d.showModal();
    d.querySelector('.hca-pay-go').focus();
  }
  const premium = (app, e = ent) => !!(e && (e.admin || e.crown || e[app] === 'premium'));
  /** True when free-plan limits apply to `app` right now. Before entitlements load, a gated preview counts as locked. */
  // Serein is free for everyone: never locked.
  const locked = (app) => gatesOn && app !== 'serein' && !premium(app);
  /** Runs `allowed` if this person has premium for the app; otherwise shows the paywall. */
  async function gate(app, what, allowed) {
    const e = ent || await ready;
    if (!gatesOn || app === 'serein' || premium(app, e)) { if (allowed) allowed(); return true; }
    paywall(app, what);
    return false;
  }
  // Lumen free plan: up to 3 sources and 50 recall cards.
  const LIMITS = { source: { max: 3, what: 'more than 3 sources' }, card: { max: 50, what: 'more than 50 recall cards' } };
  const alias = { 'lumen-source': 'source', 'lumen-card': 'card', sources: 'source', cards: 'card' };
  /** Lumen quota check: true if one more `kind` is allowed given `count` already used; else paywall and false. */
  function limit(kind, count) {
    const l = LIMITS[alias[kind] || kind];
    if (!l || !locked('lumen') || !(Number(count) >= l.max)) return true;
    paywall('lumen', l.what);
    return false;
  }

  // Carecraft and MedLex gate inside their own code (entry points and router) through HCA.locked;
  // see apps/carecraft/build-web.mjs and apps/medlex/build-web.mjs. Serein gates at its practice player.

  // Daily Crown: one first-party cookie shared by the four apps and the home page. Nothing leaves the browser.
  // {d: 'YYYY-MM-DD' (last active day), a: apps done that day, s: streak in days, best}. The streak counts a day once anything is done.
  const DAILY = (() => {
    const KEY = 'hca-daily', APPS = ['medlex', 'carecraft', 'serein', 'lumen', 'snle'].filter((a) => LIVE[a] !== false);
    const pad = (n) => String(n).padStart(2, '0');
    const key = (t) => t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
    const today = () => key(new Date());
    const yesterday = () => { const t = new Date(); t.setDate(t.getDate() - 1); return key(t); };
    const read = () => {
      let st = { d: '', a: [], s: 0, best: 0 };
      try {
        const m = document.cookie.split('; ').find((c) => c.startsWith(KEY + '='));
        const v = m && JSON.parse(decodeURIComponent(m.slice(KEY.length + 1)));
        if (v && typeof v === 'object') st = { d: /^\d{4}-\d{2}-\d{2}$/.test(v.d) ? v.d : '', a: Array.isArray(v.a) ? v.a.filter((x) => APPS.includes(x)) : [], s: Math.max(0, +v.s || 0), best: Math.max(0, +v.best || 0) };
      } catch { /* a damaged cookie is treated as empty */ }
      return st;
    };
    const write = (st) => {
      try {
        const host = location.hostname, shared = /(^|\.)healthcarecrownacademy\.co\.uk$/.test(host);
        document.cookie = KEY + '=' + encodeURIComponent(JSON.stringify(st)) + '; Path=/; Max-Age=31536000; SameSite=Lax' + (shared ? '; Domain=.healthcarecrownacademy.co.uk' : '') + (location.protocol === 'https:' ? '; Secure' : '');
      } catch { /* cookies blocked: Daily Crown simply stays empty */ }
    };
    /** What to show now: today's apps, and a streak that has lapsed reads as 0 (kindly: it restarts at 1 with the next activity). */
    const get = () => {
      const st = read(), t = today(), live = st.d === t, alive = live || st.d === yesterday();
      return { d: st.d, a: live ? st.a : [], s: alive ? st.s : 0, best: st.best, total: APPS.length, apps: APPS.slice(), today: t };
    };
    const done = (app) => {
      if (!APPS.includes(app)) return get();
      const st = read(), t = today();
      if (st.d === t) {
        if (st.a.includes(app)) return get();
        st.a.push(app);
      } else {
        st.s = st.d === yesterday() ? st.s + 1 : 1;
        st.d = t; st.a = [app];
      }
      st.best = Math.max(st.best, st.s);
      write(st);
      try { window.dispatchEvent(new CustomEvent('hca-daily', { detail: get() })); } catch { /* ignore */ }
      return get();
    };
    return { get, done, apps: APPS };
  })();

  /** Stripe checkout for a plan id (e.g. 'crown-month', 'gulf-qatar-1m'). country = ISO code for regional pricing.
      Signed-out people go to sign-in first and come back here. Resolves {error} instead of redirecting on failure. */
  async function billing(body) {
    const s = await session();
    if (!s) { location.href = signInURL(); return { error: 'sign_in_required' }; }
    try {
      const r = await fetch(`${SUPABASE}/functions/v1/crown-billing`, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + s.access_token, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, return_url: location.href.split('#')[0].replace(/[?&]checkout=[^&]*(&session_id=[^&]*)?/, '') }) });
      const j = await r.json().catch(() => ({ error: 'payment_request_failed' }));
      if (j.url && /^https:\/\/(checkout|billing)\.stripe\.com\//.test(j.url)) { location.href = j.url; return j; }
      return j;
    } catch { return { error: 'offline' }; }
  }

  window.HCA = {
    checkout: (plan, country, consent) => billing({ action: 'checkout', plan, country, consent: consent === true }),
    refund: (kind) => billing({ action: 'refund', kind }),
    manageBilling: () => billing({ action: 'portal' }),
    ready,
    daily: DAILY,
    signIn: (mode) => { location.href = signInURL(mode); },
    gate: (app, what, allowed) => (typeof what === 'number' || alias[app] || LIMITS[app]) && !NAMES[app] ? limit(app, what) : gate(app, what, allowed),
    locked,
    limit,
    paywall,
    session: currentSession,
    token: async (force) => (await currentSession(force))?.access_token || null,
    live: { ...LIVE },
    upgrade: (app) => { location.href = 'https://healthcarecrownacademy.co.uk/subscribe?plan=' + encodeURIComponent(app || 'crown'); },
    get gatesOn() { return gatesOn; },
  };

  /* Home page: a quiet summary of today's Daily Crown, only for people who have used an app. */
  function dailyHome() {
    const el = document.querySelector('[data-daily-home]'); if (!el) return;
    const D = DAILY.get(); if (!D.a.length && !D.s) return;
    const N = { medlex: 'MedLex · one word', carecraft: 'Carecraft · one scenario', serein: 'Serein · one breath', lumen: 'Lumen · cards due', snle: 'Gulf Region Nursing · one clinical decision' };
    const U = { medlex: 'https://medlex.healthcarecrownacademy.co.uk/#today', carecraft: 'https://carecraft.healthcarecrownacademy.co.uk/#today', serein: 'https://serein.healthcarecrownacademy.co.uk/#today', lumen: 'https://lumen.healthcarecrownacademy.co.uk/#today', snle: 'https://snle.healthcarecrownacademy.co.uk/#home' };
    el.querySelector('[data-daily-title]').textContent = D.a.length >= D.total ? 'All ' + D.total + ' done today. Lovely.' : D.a.length + ' of ' + D.total + ' done today';
    el.querySelector('[data-daily-line]').textContent = D.s > 0 ? D.s + '-day streak' + (D.best > D.s ? ' · best ' + D.best : '') : 'One small step starts a streak.';
    const ul = el.querySelector('[data-daily-list]'); ul.textContent = '';
    D.apps.forEach((a) => { const li = document.createElement('li'), x = document.createElement('a'); li.className = D.a.includes(a) ? 'is-done' : ''; x.href = U[a]; x.textContent = N[a] + (D.a.includes(a) ? ' ✓' : ''); li.append(x); ul.append(li); });
    el.hidden = false;
  }

  function hideOffline() {
    for (const [app, on] of Object.entries(LIVE)) {
      if (on) continue;
      document.querySelectorAll(`.jewel-${app}, a[href*="//${app}.healthcarecrownacademy.co.uk"]`).forEach((el) => { el.style.display = 'none'; el.setAttribute('aria-hidden', 'true'); });
    }
  }

  function mount() {
    hideOffline();
    dailyHome();
    const style = document.createElement('style');
    style.textContent = css;
    document.head.append(style);
    let host = document.querySelector('[data-crown-account]');
    if (!host) {
      host = document.createElement('div');
      host.className = 'floating';
      // A page can move the floating button: <meta name="hca-account-position" content="right">
      if (document.querySelector('meta[name="hca-account-position"]')?.content === 'right') host.classList.add('right');
      document.body.append(host);
    }
    host.classList.add('hca-acct');
    ready.then((e) => render(host, e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
