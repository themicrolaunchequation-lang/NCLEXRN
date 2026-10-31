/* Healthcare Crown Academy: home page behaviour.
   Plain ES2020, no dependencies. Every effect is an enhancement: with no JavaScript
   the page still shows all of its content, and links still work. */
(() => {
  'use strict';

  const cfg = Object.assign({ contactEmail: 'themicrolaunchequation@gmail.com' }, window.HCA_CONFIG || {});
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;
  const onScroll = (fn) => {
    let ticking = false;
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; fn(); }); } }, { passive: true });
    fn();
  };

  /* ---------- Config-driven content ---------- */
  function applyConfig() {
    $$('[data-contact-email]').forEach((a) => {
      a.href = 'mailto:' + cfg.contactEmail;
      if (!a.children.length) a.textContent = cfg.contactEmail;
    });
    const office = $('[data-registered-office]');
    if (office && cfg.registeredOffice) office.textContent = 'Registered office: ' + cfg.registeredOffice + '.';
    // Evinca deep links: the HTML ships working absolute URLs; config can move the base.
    if (/^https:\/\/[^/]+$/.test(cfg.evincaUrl || '')) {
      $$('[data-evinca]').forEach((link) => { link.href = cfg.evincaUrl + link.dataset.evinca; });
    }
    $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  }

  /* ---------- Header state and scrollspy ---------- */
  function initHeader() {
    const header = $('[data-header]');
    onScroll(() => header.classList.toggle('is-scrolled', window.scrollY > 24));
    const links = $$('.primary-nav a[href^="#"]');
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        const a = map.get(e.target.id);
        if (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Mobile menu: scroll lock, Esc, focus return ---------- */
  function initMenu() {
    const btn = $('[data-menu-toggle]');
    const menu = $('#mobile-menu');
    if (!btn || !menu) return;
    const isOpen = () => btn.getAttribute('aria-expanded') === 'true';
    const setOpen = (open, restoreFocus) => {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      btn.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
      menu.hidden = !open;
      root.classList.toggle('menu-open', open);
      if (open) { const first = $('a', menu); if (first) first.focus(); } else if (restoreFocus) btn.focus();
    };
    btn.addEventListener('click', () => setOpen(!isOpen()));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) { setOpen(false, true); return; }
      // Keep Tab inside the open menu and its toggle.
      if (e.key === 'Tab' && isOpen()) {
        const items = [btn, ...$$('a, button', menu)].filter((el) => el.offsetParent !== null);
        const i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    matchMedia('(min-width: 1041px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- Theme toggle (circular view transition) ---------- */
  function initTheme() {
    const btns = $$('[data-theme-toggle]');
    if (!btns.length) return;
    const systemDark = matchMedia('(prefers-color-scheme: dark)');
    const current = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
    const label = () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      btns.forEach((b) => b.setAttribute('aria-label', `Switch to ${next} theme`));
      $$('[data-theme-label]').forEach((s) => { s.textContent = next === 'dark' ? 'Dark theme' : 'Light theme'; });
    };
    label();
    systemDark.addEventListener('change', label);
    btns.forEach((btn) => btn.addEventListener('click', (e) => {
      const next = current() === 'dark' ? 'light' : 'dark';
      const apply = () => {
        root.dataset.theme = next;
        try { localStorage.setItem('hca-theme', next); } catch (_) { /* private mode */ }
        label();
      };
      if (!document.startViewTransition || reduceMotion.matches) { apply(); return; }
      const r = btn.getBoundingClientRect();
      const x = e.clientX || r.left + r.width / 2;
      const y = e.clientY || r.top + r.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      document.startViewTransition(apply).ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(() => {});
    }));
  }

  /* ---------- Hero: pointer light, looping audience strip, app chips light up their tile ---------- */
  function initHeroExtras() {
    const hero = $('[data-hero]');
    if (!hero) return;
    const track = hero.querySelector('.hx-track');
    if (track && !track.dataset.looped) { track.dataset.looped = '1'; [...track.children].forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); }); }
    if (!reduceMotion.matches && finePointer.matches) {
      hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); hero.style.setProperty('--mx', `${e.clientX - r.left}px`); hero.style.setProperty('--my', `${e.clientY - r.top}px`); });
    }
    const who = hero.querySelector('[data-who]');
    if (who) {
      const lines = [...who.querySelector('[data-who-lines]').content.querySelectorAll('p')];
      const say = who.querySelector('[data-who-say]');
      who.querySelectorAll('[data-who-i]').forEach((b) => b.addEventListener('click', () => {
        who.querySelectorAll('[data-who-i]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        say.innerHTML = lines[+b.dataset.whoI].innerHTML;
        say.classList.remove('is-swap'); void say.offsetWidth; say.classList.add('is-swap');
        place(b);
      }));
      // A gold pill slides behind the chosen role.
      const tabs = who.querySelector('[data-who-tabs]'), pill = who.querySelector('[data-who-pill]');
      const place = (b) => { if (!pill || !b) return; pill.style.width = `${b.offsetWidth}px`; pill.style.transform = `translateX(${b.offsetLeft}px)`;
        if (tabs.scrollWidth > tabs.clientWidth) tabs.scrollTo({ left: b.offsetLeft - (tabs.clientWidth - b.offsetWidth) / 2, behavior: reduceMotion.matches ? 'auto' : 'smooth' }); };
      const current = () => who.querySelector('[data-who-i][aria-pressed="true"]');
      requestAnimationFrame(() => place(current()));
      if (document.fonts) document.fonts.ready.then(() => place(current()));
      window.addEventListener('resize', () => place(current()));
    }
    const apps = [...hero.querySelectorAll('.hx-app')];
    apps.forEach((a) => {
      const tile = hero.querySelector(`.crown-tile[href="${a.getAttribute('href')}"]`);
      if (!tile) return;
      a.addEventListener('pointerenter', () => tile.classList.add('is-hot'));
      a.addEventListener('pointerleave', () => tile.classList.remove('is-hot'));
    });
    // Gently light up one app at a time until the visitor interacts.
    if (!reduceMotion.matches && apps.length) {
      let k = 0, stop = false;
      const tick = () => { if (stop) return; apps.forEach((a, i) => a.classList.toggle('is-lit', i === k)); k = (k + 1) % apps.length; };
      setTimeout(() => { tick(); const t = setInterval(() => (stop ? clearInterval(t) : tick()), 2200); }, 2000);
      hero.addEventListener('pointerdown', () => { stop = true; apps.forEach((a) => a.classList.remove('is-lit')); }, { once: true });
    }
  }

  /* ---------- The app crown: pointer tilt and a little scroll parallax ---------- */
  function initCrownStage() {
    const hero = $('[data-hero]');
    const crown = $('[data-crown]');
    if (!hero || !crown || reduceMotion.matches) return;
    if (finePointer.matches) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        crown.style.setProperty('--ry', `${(px * 5).toFixed(2)}deg`);
        crown.style.setProperty('--rx', `${(-py * 5).toFixed(2)}deg`);
      });
      hero.addEventListener('pointerleave', () => { crown.style.setProperty('--ry', '0deg'); crown.style.setProperty('--rx', '0deg'); });
    }
    onScroll(() => {
      const y = window.scrollY;
      if (y > innerHeight * 1.2) return;
      crown.style.setProperty('--py', `${(-y * 0.08).toFixed(1)}px`);
    });
  }

  /* ---------- Hero ring: the app screens turn on a carousel; the front one rests and pops, then it moves on ----------
     Hover pauses and lifts a screen, a side screen comes to the front on click or focus, and the front one plays its tour.
     Reduced motion keeps the still fan from the stylesheet. */
  function initCrownRing() {
    const crown = $('[data-crown]'), hero = $('[data-hero]');
    if (!crown || !hero || reduceMotion.matches) return;
    const tiles = $$('.crown-tile', crown);
    const N = tiles.length; if (N < 3) return;
    crown.classList.add('is-ring');
    const app = (t) => (t.className.match(/jewel-(\w+)/) || [])[1];
    let pos = Math.max(0, tiles.findIndex((t) => app(t) === 'medlex'));
    let from = pos, to = pos, t0 = 0, moving = false, restUntil = performance.now() + 3200, paused = 0, visible = true, raf = 0, hover = null;
    const REST = 3000, MOVE = 1150;
    const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const wrap = (d) => { d = ((d % N) + N) % N; return d > N / 2 ? d - N : d; };
    const front = () => ((Math.round(pos) % N) + N) % N;
    function layout() {
      const w = crown.clientWidth, narrow = w < 560;
      const R = w * (narrow ? 0.34 : 0.38), depth = narrow ? 320 : 560;
      tiles.forEach((t, i) => {
        const d = wrap(i - pos), a = (d * 2 * Math.PI) / N, c = Math.cos(a);
        const x = Math.sin(a) * R, z = (c - 1) * depth, y = (1 - c) * (narrow ? -6 : -14);
        const isFront = !moving && Math.abs(d) < 0.01;
        const pop = isFront ? 1.06 : t === hover ? 1.03 : 1;
        t.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), ${(y + (isFront ? -10 : t === hover ? -8 : 0)).toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${(-Math.sin(a) * 28).toFixed(2)}deg) scale(${pop})`;
        t.style.zIndex = String(Math.round(100 + c * 100));
        t.style.opacity = String(Math.max(0, Math.min(1, 0.25 + c * 0.9)).toFixed(3));
        t.classList.toggle('is-front', isFront);
        t.tabIndex = c > -0.2 ? 0 : -1;
        t.setAttribute('aria-hidden', c > -0.2 ? 'false' : 'true');
      });
    }
    function goTo(i) {
      const d = wrap(i - pos); if (Math.abs(d) < 0.01) return;
      from = pos; to = pos + d; t0 = performance.now(); moving = true; kick();
    }
    function tick(now) {
      raf = 0;
      if (moving) {
        const k = Math.min(1, (now - t0) / (MOVE * Math.max(1, Math.abs(to - from) * 0.6)));
        pos = from + (to - from) * ease(k);
        if (k >= 1) { pos = ((Math.round(to) % N) + N) % N; moving = false; restUntil = now + REST; }
      } else if (!paused && visible && now >= restUntil) { from = pos; to = pos + 1; t0 = now; moving = true; }
      layout();
      if (moving || (!paused && visible)) raf = requestAnimationFrame(tick);
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tiles.forEach((t, i) => {
      t.addEventListener('pointerenter', () => { paused++; hover = t; layout(); });
      t.addEventListener('pointerleave', () => { paused = Math.max(0, paused - 1); hover = null; restUntil = performance.now() + 1400; layout(); kick(); });
      t.addEventListener('focus', () => { paused++; goTo(i); });
      t.addEventListener('blur', () => { paused = Math.max(0, paused - 1); restUntil = performance.now() + 2000; kick(); });
      t.addEventListener('click', (e) => {
        if (i !== front() || moving) { e.preventDefault(); goTo(i); return; }
        if (window.HCATour && window.HCATour.has(app(t))) { e.preventDefault(); window.HCATour.open(app(t), t); }
      });
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; restUntil = performance.now() + 1200; kick(); }).observe(hero);
    document.addEventListener('visibilitychange', () => { visible = !document.hidden; restUntil = performance.now() + 1200; kick(); });
    addEventListener('resize', layout, { passive: true });
    layout(); kick();
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(text, ms = 4200) {
    const el = $('[data-toast]');
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, ms);
  }

  /* ---------- Backend (Supabase REST) ---------- */
  const backendReady = () => /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.supabaseUrl || '') && !!cfg.supabaseKey;
  async function sbPost(path, body) {
    const res = await fetch(cfg.supabaseUrl + path, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: cfg.supabaseKey }, body: JSON.stringify(body), mode: 'cors', credentials: 'omit' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
  const subscribe = (email, source) => sbPost('/rest/v1/rpc/subscribe', { p_email: email, p_source: source });
  const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const mailtoFallback = (subject, body) => `mailto:${cfg.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  /* ---------- Footer newsletter ---------- */
  function initNewsForm() {
    const form = $('[data-news-form]');
    if (!form) return;
    const status = $('[data-news-status]', form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.elements.email;
      const email = input.value.trim().toLowerCase();
      status.classList.remove('is-error');
      if (!EMAIL_RE.test(email)) {
        status.textContent = 'Please enter a valid email address.';
        status.classList.add('is-error');
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      if (!backendReady()) { location.href = mailtoFallback('Subscribe me to updates', `Please add ${email} to your updates list.`); return; }
      try {
        await subscribe(email, 'hca-home-footer');
        form.reset();
        status.textContent = 'You\'re subscribed. Welcome aboard!';
        toast('You\'re subscribed to Healthcare Crown Academy updates.');
      } catch (_) {
        status.textContent = 'Sorry, that didn\'t work. Please try again.';
        status.classList.add('is-error');
      }
    });
  }

  /* ---------- Install as an app (PWA) ---------- */
  function initInstall() {
    const btn = $('[data-install]');
    if (!btn) return;
    if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) return;
    let deferred = null;
    addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; btn.hidden = false; });
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) btn.hidden = false;
    btn.addEventListener('click', async () => {
      if (deferred) {
        deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice.outcome === 'accepted') btn.hidden = true;
        deferred = null;
      } else if (isIOS) {
        toast('Tap the Share button, then "Add to Home Screen".', 6000);
      }
    });
    addEventListener('appinstalled', () => { btn.hidden = true; toast('Installed. Find Crown Academy on your home screen.'); });
  }

  /* ---------- A taste of each app ---------- */
  const moreLink = (href, text) => { const a = document.createElement('a'); a.href = href; a.textContent = text; return a; };

  function initApps() {
    // MedLex: decode a word by its parts.
    const decode = $('[data-mini-decode]');
    if (decode) {
      const result = $('[data-md-result]', decode);
      const parts = $$('.md-part', decode);
      parts.forEach((btn) => btn.addEventListener('click', () => {
        if (btn.classList.contains('is-found')) return;
        btn.classList.add('is-found');
        btn.setAttribute('aria-pressed', 'true');
        $('small', btn).textContent = btn.dataset.meaning;
        const found = parts.filter((p) => p.classList.contains('is-found'));
        if (found.length < parts.length) { result.textContent = `${found.length} of ${parts.length} parts decoded`; return; }
        result.innerHTML = '';
        const def = document.createElement('p');
        const term = document.createElement('strong');
        term.textContent = 'Tachycardia';
        def.append(term, ' (fast + heart + condition): a heart rate faster than expected.');
        result.append(def, moreLink('https://medlex.healthcarecrownacademy.co.uk/', 'Decode 1,480 more in MedLex'));
      }));
    }

    // Lumen: flip a recall card, then rate it.
    const recall = $('[data-mini-recall]');
    if (recall) {
      const card = $('[data-rc-card]', recall);
      const back = $('[data-rc-back]', recall);
      const flip = $('[data-rc-flip]', recall);
      const rate = $('[data-rc-rate]', recall);
      const result = $('[data-rc-result]', recall);
      back.setAttribute('aria-hidden', 'true');
      flip.addEventListener('click', () => {
        card.classList.add('is-flipped');
        back.removeAttribute('aria-hidden');
        $('.rc-front', card).setAttribute('aria-hidden', 'true');
        flip.hidden = true;
        rate.hidden = false;
        result.textContent = 'Answer: 60 to 100 beats per minute. How did you do?';
        $('button', rate).focus({ preventScroll: true });
      });
      $$('[data-rc-grade]', rate).forEach((b) => b.addEventListener('click', () => {
        rate.hidden = true;
        result.innerHTML = '';
        const p = document.createElement('p');
        p.textContent = b.dataset.rcGrade === 'good'
          ? 'Nice. Lumen spaces this card out, so you see it again in a few days.'
          : 'No problem. Lumen brings this card back soon, until it sticks.';
        result.append(p, moreLink('https://lumen.healthcarecrownacademy.co.uk/', 'Make cards from your own notes in Lumen'));
      }));
    }

    // Carecraft: a 60-second scenario.
    const scenario = $('[data-mini-scenario]');
    if (scenario) {
      const result = $('[data-mini-result]', scenario);
      const options = $$('.mini-opts button', scenario);
      options.forEach((btn) => btn.addEventListener('click', () => {
        const strongest = options.find((o) => o.hasAttribute('data-correct'));
        options.forEach((o) => {
          o.disabled = true;
          if (o === strongest) o.classList.add('is-strongest');
          else if (o === btn) o.classList.add('is-chosen');
        });
        const right = btn === strongest;
        result.innerHTML = '';
        const lead = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = right ? 'Strongest choice. ' : 'A useful comparison. ';
        lead.append(strong, btn.dataset.why + (right ? '' : ' The strongest choice was B: ' + strongest.dataset.why));
        result.append(lead, moreLink('https://carecraft.healthcarecrownacademy.co.uk/', 'Try today’s scenario in Carecraft'));
      }));
    }

    // Serein: one guided breath.
    const breath = $('[data-mini-breath]');
    if (breath) {
      const cue = $('[data-mb-cue]', breath);
      const start = $('[data-mb-start]', breath);
      const label = start.querySelector('span');
      let timers = [];
      start.addEventListener('click', () => {
        timers.forEach(clearTimeout);
        start.disabled = true;
        breath.classList.remove('is-out');
        breath.classList.add('is-in');
        cue.textContent = 'Breathe in, gently…';
        timers = [
          setTimeout(() => { breath.classList.replace('is-in', 'is-out'); cue.textContent = '…and let it go, slowly.'; }, 4000),
          setTimeout(() => {
            breath.classList.remove('is-out');
            cue.textContent = 'Ten seconds, well spent.';
            start.disabled = false;
            label.textContent = 'One more breath';
          }, 10000)
        ];
      });
    }
  }

  /* ---------- Reserve a plan (pricing) ---------- */
  function initReserve() {
    const form = $('[data-reserve-form]');
    if (!form) return null;
    const wrap = $('#reserve');
    const body = $('[data-reserve-body]', form);
    const success = $('[data-reserve-success]', form);
    const status = $('[data-reserve-status]', form);
    const submit = $('[data-reserve-submit]', form);
    const select = $('[data-reserve-plan]', form);
    const email = form.elements.email;
    const err = $('[data-error-for="email"]', form);
    const planName = () => select.options[select.selectedIndex].text;
    const fallback = (lead, linkText) => {
      status.innerHTML = '';
      const a = document.createElement('a');
      a.className = 'inline-link';
      a.href = mailtoFallback('Reserve a plan: ' + planName(), `Please reserve the ${planName()} plan for ${email.value.trim()}.`);
      a.textContent = linkText;
      status.append(lead, a, '.');
    };
    email.addEventListener('input', () => { email.removeAttribute('aria-invalid'); email.removeAttribute('aria-describedby'); err.textContent = ''; });
    select.addEventListener('change', () => {
      $$('.price-card[data-plan]').forEach((c) => c.classList.toggle('is-picked', c.dataset.plan === select.value));
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = '';
      status.classList.remove('is-error');
      const value = email.value.trim().toLowerCase();
      if (!EMAIL_RE.test(value)) {
        err.textContent = 'Please enter a valid email address.';
        err.id = 'err-r-email';
        email.setAttribute('aria-invalid', 'true');
        email.setAttribute('aria-describedby', err.id);
        email.focus();
        return;
      }
      const isBot = String(form.elements.website.value || '').trim() !== '';
      if (!backendReady()) { status.classList.add('is-error'); fallback('Online reservations are not available yet. ', 'Email us to reserve instead'); return; }
      form.classList.add('is-loading');
      submit.disabled = true;
      try {
        if (!isBot) await subscribe(value, 'plan-' + select.value);
        if (form.elements.updates.checked && !isBot) {
          try { await subscribe(value, 'hca-home-plan-updates'); } catch (_) { /* the reservation already landed */ }
        }
        $('[data-reserve-name]', form).textContent = planName();
        body.hidden = true;
        success.hidden = false;
        success.focus();
      } catch (_) {
        status.classList.add('is-error');
        fallback('Sorry, we could not save that (are you offline?). Please try again, or ', 'email us instead');
      } finally {
        form.classList.remove('is-loading');
        submit.disabled = false;
      }
    });
    return {
      select: (plan) => { if (select.querySelector(`option[value="${plan}"]`)) select.value = plan; },
      open: () => {
        body.hidden = false;
        success.hidden = true;
        wrap.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
        email.focus({ preventScroll: true });
      }
    };
  }

  /* ---------- Crown Suite: app launcher, "what do you want more of?", pricing ---------- */
  function initCrown() {
    const launcher = $('[data-launcher]');
    if (launcher) {
      const btn = $('[data-launcher-toggle]', launcher);
      const dock = $('#app-dock');
      const set = (open, focusFirst) => {
        btn.setAttribute('aria-expanded', String(open));
        dock.hidden = !open;
        if (open && focusFirst) $('a', dock).focus();
      };
      btn.addEventListener('click', (e) => set(dock.hidden, e.detail === 0));
      document.addEventListener('click', (e) => { if (!launcher.contains(e.target)) set(false); });
      launcher.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !dock.hidden) { set(false); btn.focus(); }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          const items = $$('a', dock);
          const i = items.indexOf(document.activeElement);
          e.preventDefault();
          if (dock.hidden) { set(true, true); return; }
          items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
        }
      });
      dock.addEventListener('focusout', (e) => { if (!launcher.contains(e.relatedTarget)) set(false); });
    }

    // [monthly, yearly] in GBP. Keep in step with the price cards in home.html.
    // Serein is free for everyone, so it has no price and never counts as a paid app.
    const prices = { medlex: [2.99, 19.99], lumen: [4.99, 34.99], carecraft: [2.99, 19.99], crown: [5.99, 39.99] };
    const PLANS = ['crown', 'gulf', 'lss'];
    // Founding-member line disappears after its end date.
    $$('[data-until]').forEach((el) => { if (Date.now() > Date.parse(el.dataset.until)) el.hidden = true; });
    const reserve = initReserve();
    const pickPlan = (plan, scroll) => {
      if (!PLANS.includes(plan)) return;
      $$('.price-card[data-plan]').forEach((c) => c.classList.toggle('is-picked', c.dataset.plan === plan));
      if (reserve) reserve.select(plan);
      const card = document.getElementById('plan-' + plan);
      if (scroll && card) card.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
    };
    $$('[data-reserve]').forEach((b) => b.addEventListener('click', () => {
      pickPlan(b.dataset.reserve, false);
      if (reserve) reserve.open();
    }));
    const asked = new URLSearchParams(location.search).get('plan');
    // Single apps are part of the Crown Pass, so old links such as ?plan=medlex show the Crown Pass.
    const wanted = ['medlex', 'carecraft', 'lumen'].includes(asked) ? 'crown' : asked;
    if (wanted && PLANS.includes(wanted)) {
      pickPlan(wanted, false);
      // Let the browser settle on #pricing first, then bring the chosen card into view.
      setTimeout(() => pickPlan(wanted, true), 350);
    }

    const names = { medlex: 'MedLex', lumen: 'Lumen', carecraft: 'Carecraft', serein: 'Serein', evinca: 'Evinca', snle: 'Gulf Region Nursing', lss: 'Lean Six Sigma Green Belt' };
    const urls = {
      snle: 'https://snle.healthcarecrownacademy.co.uk/',
      lss: 'https://lss.healthcarecrownacademy.co.uk/',
      medlex: 'https://medlex.healthcarecrownacademy.co.uk/',
      lumen: 'https://lumen.healthcarecrownacademy.co.uk/',
      carecraft: 'https://carecraft.healthcarecrownacademy.co.uk/',
      serein: 'https://serein.healthcarecrownacademy.co.uk/',
      evinca: (/^https:\/\/[^/]+$/.test(cfg.evincaUrl || '') ? cfg.evincaUrl : 'https://evinca.healthcarecrownacademy.co.uk') + '/en'
    };
    const preview = $('.crown-preview');
    if (preview) {
      const label = $('[data-crown-label]');
      const price = $('[data-crown-price]');
      const cta = $('[data-crown-cta]');
      const open = $('[data-crown-open]');
      const openLabel = open.firstChild;
      const defaults = { label: label.textContent, price: price.textContent, open: openLabel.textContent, href: open.getAttribute('href') };
      let ctaPlan = null;
      // The button links straight to the live plans page (/subscribe?plan=...).
      const order = [];
      const count = $('[data-crown-count]'), meter = $('[data-crown-meter]'), total = $$('[data-interests] .interest').length;
      const cheer = (n) => (n === 0 ? '' : n === 1 ? ' · great start' : n < 4 ? ' · your crown is taking shape' : n < total ? ' · now that is a crown' : ' · the full crown!');
      const extras = () => [order.includes('snle') && 'The Gulf Pass covers all four Gulf exams and includes the Crown Pass: US$29 for 1 month, US$50 for 3 or US$69 for 6.', order.includes('lss') && 'The Lean Six Sigma Green Belt toolkit is US$99 for 12 months, paid once.', order.includes('serein') && 'Serein is free for everyone.', order.includes('evinca') && 'Evinca stories are free.'].filter(Boolean).join(' ');
      $$('[data-combo]').forEach((c) => c.addEventListener('click', () => {
        const want = c.dataset.combo.split(',');
        $$('[data-interests] .interest').forEach((b) => { if ((b.getAttribute('aria-pressed') === 'true') !== want.includes(b.dataset.app)) b.click(); });
        $$('[data-combo]').forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
        // A role button also shows a one-line suggestion for that role.
        const say = $('[data-combo-say]'), lines = $('[data-combo-lines]');
        if (say && lines && c.dataset.say) {
          const line = lines.content.querySelectorAll('p')[+c.dataset.say];
          if (line) { say.innerHTML = line.innerHTML; say.hidden = false; say.classList.remove('is-swap'); void say.offsetWidth; say.classList.add('is-swap'); }
        }
      }));
      // The crown drawing: a lit jewel sends out a small burst of sparks and a shimmer runs along the outline.
      const art = $('[data-crw]', preview), tpl = art && $('.crw-burst-tpl', art), shine = art && $('.crw-shine', art);
      const celebrate = (app) => {
        const gem = art && $('.crw-gem-' + app, art);
        if (!gem || reduceMotion.matches) return;
        const burst = tpl.cloneNode(true);
        burst.setAttribute('class', 'crw-burst');
        burst.setAttribute('transform', 'translate(' + gem.getAttribute('cx') + ' ' + gem.getAttribute('cy') + ')');
        art.appendChild(burst);
        setTimeout(() => burst.remove(), 1000);
        shine.classList.remove('is-run');
        void shine.getBoundingClientRect();
        shine.classList.add('is-run');
      };
      $$('[data-interests] .interest').forEach((b) => b.addEventListener('click', () => {
        const app = b.dataset.app;
        const i = order.indexOf(app);
        if (i >= 0) order.splice(i, 1); else order.push(app);
        b.setAttribute('aria-pressed', String(i < 0));
        Object.keys(names).forEach((k) => preview.toggleAttribute('data-' + k, order.includes(k)));
        preview.toggleAttribute('data-crw-full', order.length === total);
        if (i < 0) celebrate(app);
        if (count) { count.parentNode.lastChild.textContent = ' of ' + total + ' jewels lit' + cheer(order.length); count.textContent = String(order.length); }
        if (meter) meter.style.width = (100 * order.length / total) + '%';
        const paid = order.filter((k) => prices[k]);
        // One answer: the Gulf Pass if a Gulf exam is picked (it includes the Crown Pass), otherwise the Crown Pass.
        ctaPlan = order.includes('snle') ? 'gulf' : paid.length ? 'crown' : null;
        cta.setAttribute('href', ctaPlan ? '/subscribe?plan=' + ctaPlan : '/subscribe');
        cta.textContent = ctaPlan === 'gulf' ? 'Get the Gulf Pass' : ctaPlan === 'crown' ? 'Try the Crown Pass free' : 'See plans';
        if (!order.length) {
          label.textContent = defaults.label;
          price.textContent = defaults.price;
          openLabel.textContent = defaults.open;
          open.setAttribute('href', defaults.href);
          return;
        }
        const first = order[0];
        openLabel.textContent = 'Open ' + names[first] + ' free ';
        open.setAttribute('href', urls[first]);
        label.textContent = 'Your crown: ' + order.map((k) => names[k]).join(' + ');
        price.innerHTML = '';
        if (!paid.length) { price.textContent = extras() + ' Start whenever you are ready.'; return; }
        const best = document.createElement('strong');
        best.textContent = 'Crown Pass';
        price.append('Start free. The ', best, ' unlocks ' + paid.map((k) => names[k]).join(' and ') + ' and every other app for £' + prices.crown[0].toFixed(2) + ' a month or £' + prices.crown[1].toFixed(2) + ' a year, with 7 days free.');
        const more = extras().replace(/ ?Serein is free for everyone\.| ?Evinca stories are free\./g, '');
        if (more) price.append(' ' + more.trim());
      }));
    }

    $$('[data-billing]').forEach((b) => b.addEventListener('click', () => {
      const y = b.dataset.billing === 'y';
      $$('[data-billing]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $$('.price-card [data-m]').forEach((el) => { el.textContent = y ? el.dataset.y : el.dataset.m; });
      $$('.price-card [data-per]').forEach((el) => { el.textContent = y ? '/year' : '/month'; });
      $$('.price-card [data-note-m]').forEach((el) => { el.textContent = y ? el.dataset.noteY : el.dataset.noteM; });
    }));
  }

  function initServiceWorker() {
    if (!('serviceWorker' in navigator) || location.protocol !== 'https:') return;
    addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
  }

  /* ---------- Boot ---------- */
  applyConfig();
  initHeader();
  initMenu();
  initTheme();
  initCrownStage(); initHeroExtras();
  initCrownRing();
  initApps();
  initCrown();
  initNewsForm();
  initInstall();
  initServiceWorker();
})();
