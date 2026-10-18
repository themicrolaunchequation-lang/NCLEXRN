/* Crown Suite account: one sign-in across healthcarecrownacademy.co.uk, MedLex, Carecraft, Serein and Evinca.
   Reads the shared session cookie written by the account site (hca-auth.0, .1, ...), refreshes it when it
   expires, asks the database what this person can open (crown_entitlements) and shows an account button.
   Exposes window.HCA = { ready: Promise<entitlements>, signIn(), upgrade(app) } for app paywalls.
   Plain ES2020, no dependencies. Works signed out and offline (everything stays free-tier). */
(() => {
  'use strict';
  const SUPABASE = 'https://ujeofxfbwivjmgrxqdcl.supabase.co';
  const KEY = 'sb_publishable_ie1qqB5QnaqUZPitNPfQCg__M46e7JL';
  const ACCOUNT = 'https://account.healthcarecrownacademy.co.uk/en';
  const COOKIE = 'hca-auth', CHUNK = 3000, DOMAIN = 'healthcarecrownacademy.co.uk';
  const onCrown = location.hostname === DOMAIN || location.hostname.endsWith('.' + DOMAIN);
  const FREE = { signed_in: false, admin: false, medlex: 'free', carecraft: 'free', serein: 'free', crown: false };

  const readCookie = (n) => { const c = document.cookie.split('; ').find((x) => x.startsWith(n + '=')); return c ? decodeURIComponent(c.slice(n.length + 1)) : null; };
  const writeCookie = (n, v, age) => { document.cookie = `${n}=${encodeURIComponent(v)}; ${onCrown ? 'Domain=.' + DOMAIN + '; ' : ''}Path=/; Max-Age=${age}; Secure; SameSite=Lax`; };
  function load() { let s = '', i = 0, p; while ((p = readCookie(`${COOKIE}.${i}`)) !== null) { s += p; i++; } try { return i ? JSON.parse(s) : null; } catch { return null; } }
  function clear() { for (let i = 0; readCookie(`${COOKIE}.${i}`) !== null; i++) writeCookie(`${COOKIE}.${i}`, '', 0); }
  function save(session) { clear(); const v = JSON.stringify(session); for (let i = 0; i * CHUNK < v.length; i++) writeCookie(`${COOKIE}.${i}`, v.slice(i * CHUNK, (i + 1) * CHUNK), 31536000); }

  async function session() {
    let s = load();
    if (!s || !s.refresh_token) return null;
    if (!s.expires_at || s.expires_at * 1000 < Date.now() + 60000) {
      const r = await fetch(`${SUPABASE}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: s.refresh_token }) });
      if (!r.ok) { if (r.status === 400 || r.status === 401) clear(); return null; }
      s = await r.json();
      if (!s.expires_at && s.expires_in) s.expires_at = Math.floor(Date.now() / 1000) + s.expires_in;
      save(s);
    }
    return s;
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

  const css = `.hca-acct{position:relative;font:600 14px/1.2 Inter,Geist,system-ui,sans-serif;z-index:2147483000}
.hca-acct.floating{position:fixed;left:16px;bottom:16px}
.hca-acct-btn{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:4px 14px 4px 4px;border-radius:999px;border:1px solid rgba(232,193,112,.55);background:#0B1530;color:#F8F5EF;cursor:pointer;box-shadow:0 8px 24px -10px rgba(5,10,24,.6)}
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
@media (max-width:760px){.hca-acct.floating{bottom:84px}}
.hca-acct.floating.right{left:auto;right:16px;bottom:84px}
.hca-acct.floating.right .hca-menu{left:auto;right:0}
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
    const plan = e.admin ? 'Admin' : e.crown ? 'Crown Pass' : ['medlex', 'carecraft', 'serein'].some((k) => e[k] === 'premium') ? 'Member+' : 'Free';
    host.innerHTML = '';
    const btn = document.createElement('button');
    btn.type = 'button';
    if (!e.signed_in) {
      btn.className = 'hca-acct-btn signed-out';
      btn.textContent = 'Sign in';
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
     Switched off until paid plans can be bought (GATES_LIVE). Preview with ?gates=on.
     The "Get help" support in Serein and every app's first steps always stay free. */
  const GATES_LIVE = false;
  const gatesOn = GATES_LIVE || new URLSearchParams(location.search).get('gates') === 'on';
  const NAMES = { medlex: 'MedLex', carecraft: 'Carecraft', serein: 'Serein', lumen: 'Lumen' };
  const PERKS = {
    medlex: ['All 26 modules and 1,480 terms', '56 illustrated guides', 'Spaced practice and worksheets', 'Completion certificate'],
    carecraft: ['All 30 lessons and 90 visual guides', 'All 22 practice activities', 'Smart Review', 'Completion certificate'],
    serein: ['All 15 practices', 'Journeys, routines and insights', 'Team toolkit', 'Participation certificate'],
    lumen: ['More Academy AI help each day', 'Unlimited sources and notes', 'Recall cards and focus planner', 'Study certificate'],
  };
  function paywall(app, what) {
    document.querySelector('.hca-pay')?.remove();
    const d = document.createElement('dialog');
    d.className = 'hca-pay';
    d.setAttribute('aria-labelledby', 'hca-pay-title');
    const signedIn = ent && ent.signed_in;
    d.innerHTML = `<div class="hca-pay-in"><p class="hca-pay-eye">CROWN PASS · ${NAMES[app].toUpperCase()}</p><h2 id="hca-pay-title"></h2><p class="hca-pay-lead"></p><ul></ul>
<p class="hca-pay-price"><b>£9.99/month</b> for every app, or ${NAMES[app]} on its own. Codes can be used at checkout.</p>
<div class="hca-pay-row"><a class="hca-pay-go" href="https://healthcarecrownacademy.co.uk/?plan=${app}#pricing">See plans</a>${signedIn ? '' : '<button type="button" class="hca-pay-alt" data-in>I already have a plan</button>'}<button type="button" class="hca-pay-alt" data-close>Not now</button></div></div>`;
    d.querySelector('h2').textContent = what ? `Unlock ${what}` : `Unlock all of ${NAMES[app]}`;
    d.querySelector('.hca-pay-lead').textContent = `This is part of ${NAMES[app]} premium. Everything you have done so far stays yours.`;
    for (const t of PERKS[app]) { const li = document.createElement('li'); li.textContent = t; d.querySelector('ul').append(li); }
    d.addEventListener('click', (e) => { if (e.target.closest('[data-close]') || e.target === d) d.close(); if (e.target.closest('[data-in]')) location.href = signInURL(); });
    d.addEventListener('close', () => d.remove());
    document.body.append(d);
    d.showModal();
    d.querySelector('.hca-pay-go').focus();
  }
  /** Runs `allowed` if this person has premium for the app; otherwise shows the paywall. */
  async function gate(app, what, allowed) {
    const e = ent || await ready;
    if (!gatesOn || e.admin || e[app] === 'premium') { allowed(); return true; }
    paywall(app, what);
    return false;
  }

  const appName = document.querySelector('meta[name="hca-app"]')?.content;
  let replaying = false;
  function guardClicks(test) {
    document.addEventListener('click', (ev) => {
      if (replaying || !gatesOn) return;
      const hit = test(ev.target);
      if (!hit) return;
      if (ent && (ent.admin || ent[appName] === 'premium')) return;
      ev.preventDefault(); ev.stopImmediatePropagation();
      gate(appName, hit.what, () => { replaying = true; try { hit.el.click(); } finally { replaying = false; } });
    }, true);
  }
  if (appName === 'serein') {
    const free = new Set(['tide', 'ground', 'desk']);
    guardClicks((t) => { const el = t.closest('[data-practice]'); return el && !free.has(el.dataset.practice) ? { el, what: 'this practice' } : null; });
  }
  if (appName === 'carecraft') {
    // Published by the Carecraft build: the first 6 lessons and first 3 activities are free.
    const freeLessons = () => new Set(window.CC_FREE?.lessons || []);
    const freeActs = () => new Set(window.CC_FREE?.activities || []);
    guardClicks((t) => {
      const el = t.closest('[data-action="lesson"],[data-action="scenario-lesson"],[data-action="activity"]');
      if (!el) return null;
      const id = el.dataset.arg0;
      if (el.dataset.action === 'activity') return freeActs().has(id) ? null : { el, what: 'this practice activity' };
      return freeLessons().has(id) ? null : { el, what: 'this lesson' };
    });
  }
  if (appName === 'medlex') {
    const free = new Set(['ch1', 'ch2', 'prefixes']);
    const check = () => {
      if (!gatesOn) return;
      const m = location.hash.match(/^#(?:learn\/)?module(?:\/([^/?&]+)|\?(?:.*&)?id=([^&]+))/);
      const id = m && decodeURIComponent(m[1] || m[2]);
      if (!id || free.has(id)) return;
      gate('medlex', 'this module', () => {}).then((ok) => { if (!ok) history.replaceState(null, '', '#learn'), dispatchEvent(new HashChangeEvent('hashchange')); });
    };
    addEventListener('hashchange', check);
    ready.then(check);
  }
  window.HCA = {
    ready,
    signIn: (mode) => { location.href = signInURL(mode); },
    gate,
    paywall,
    upgrade: (app) => { location.href = 'https://healthcarecrownacademy.co.uk/?plan=' + encodeURIComponent(app || 'crown') + '#pricing'; },
  };

  function mount() {
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
