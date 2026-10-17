/* Healthcare Crown Academy — home page behaviour.
   Plain ES2020, no dependencies. Every effect degrades to static content. */
(() => {
  'use strict';

  const cfg = Object.assign({ contactEmail: 'themicrolaunchequation@gmail.com' }, window.HCA_CONFIG || {});
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;

  /* ---------- Config-driven content ---------- */
  function applyConfig() {
    $$('[data-contact-email]').forEach((a) => {
      a.href = 'mailto:' + cfg.contactEmail;
      const icon = a.querySelector('svg');
      a.textContent = cfg.contactEmail;
      if (icon) a.prepend(icon);
    });
    const office = $('[data-registered-office]');
    if (office && cfg.registeredOffice) office.textContent = 'Registered office: ' + cfg.registeredOffice + '.';
    // Evinca deep links: HTML ships working absolute URLs; config can move the base.
    if (/^https:\/\/[^/]+$/.test(cfg.evincaUrl || '')) {
      $$('[data-evinca]').forEach((link) => { link.href = cfg.evincaUrl + link.dataset.evinca; });
    }

  // ICO registration badges
  if (/^Z[A-Z0-9]{5,9}$/.test(cfg.icoNumber || '')) {
    document.querySelectorAll('[data-ico-number]').forEach((el) => { el.textContent = cfg.icoNumber; });
    document.querySelectorAll('[data-ico-link]').forEach((a) => { a.href = 'https://ico.org.uk/ESDWebPages/Entry/' + cfg.icoNumber; });
    document.querySelectorAll('[data-ico-line]').forEach((el) => { el.textContent = 'Registered with the Information Commissioner\'s Office (ICO) for data protection, registration no. ' + cfg.icoNumber + '.'; });
    document.querySelectorAll('[data-ico]').forEach((el) => { el.hidden = false; });
  }
    $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  }

  /* ---------- Hero headline: split into words ---------- */
  function splitWords(el) {
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const span = document.createElement('span');
            span.className = 'split-word';
            span.style.setProperty('--w', String(i++));
            span.textContent = part;
            frag.append(span);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
    $$('.split-word', el).forEach((w) => w.setAttribute('aria-hidden', 'true'));
  }

  /* ---------- Header, progress, scrollspy ---------- */
  function initHeader() {
    const header = $('[data-header]');
    const bar = $('.scroll-progress span');
    const cssProgress = CSS.supports('animation-timeline: scroll()');
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 24);
      if (!cssProgress && bar) {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.setProperty('--progress', max > 0 ? String(y / max) : '0');
      }
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();

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

  /* ---------- Mobile menu ---------- */
  function initMenu() {
    const btn = $('[data-menu-toggle]');
    const menu = $('#mobile-menu');
    if (!btn || !menu) return;
    const setOpen = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      btn.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
      menu.hidden = !open;
    };
    btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) { setOpen(false); btn.focus(); }
    });
    matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- Theme toggle (with circular view transition) ---------- */
  function initTheme() {
    const btn = $('[data-theme-toggle]');
    if (!btn) return;
    const systemDark = matchMedia('(prefers-color-scheme: dark)');
    const current = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
    const label = () => btn.setAttribute('aria-label', current() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    label();
    systemDark.addEventListener('change', label);

    btn.addEventListener('click', (e) => {
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
          { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' }
        );
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
        el.style.setProperty('--rd', `${Math.min(siblings.indexOf(el), 6) * 70}ms`);
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- Count-up ---------- */
  function initCounters() {
    const els = $$('[data-count]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const end = Number(e.target.dataset.count);
        if (reduceMotion.matches || end === 0) return;
        const t0 = performance.now();
        const dur = 1400;
        const step = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 4);
          e.target.textContent = String(Math.round(end * eased));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Pointer effects: spotlight, tilt, magnetic ---------- */
  function initPointerFx() {
    if (!finePointer.matches) return;

    $$('[data-spotlight]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--sx', `${e.clientX - r.left}px`);
        card.style.setProperty('--sy', `${e.clientY - r.top}px`);
      });
    });

    if (reduceMotion.matches) return;

    $$('[data-tilt]').forEach((el) => {
      const max = 8;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`);
        el.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`);
        el.style.setProperty('--mx', `${px * 100}%`);
        el.style.setProperty('--my', `${py * 100}%`);
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });

    $$('[data-magnetic]').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Marquee: duplicate items for a seamless loop ---------- */
  function initMarquee() {
    $$('[data-marquee] .marquee-track').forEach((track) => {
      Array.from(track.children).forEach((li) => {
        const clone = li.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.append(clone);
      });
    });
  }

  /* ---------- Recognition record studio ---------- */
  function hashId(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return String((h >>> 0) % 1000000).padStart(6, '0');
  }

  function initStudio() {
    const form = $('[data-studio]');
    if (!form) return;
    const out = (k) => $(`[data-studio-out="${k}"]`);
    const fallback = { name: 'Your Name', country: 'Your country' };
    const year = new Date().getFullYear();
    const render = (changed) => {
      const v = {};
      $$('[data-studio-input]', form).forEach((el) => { v[el.dataset.studioInput] = el.value.trim(); });
      ['name', 'role', 'area', 'country'].forEach((k) => {
        const el = out(k);
        if (!el) return;
        el.textContent = v[k] || fallback[k] || '';
        if (k === changed && !reduceMotion.matches) {
          el.classList.remove('is-pop');
          void el.offsetWidth;
          el.classList.add('is-pop');
        }
      });
      out('id').textContent = `EV-${year}-${hashId([v.name, v.role, v.area, v.country].join('|'))}`;
    };
    form.addEventListener('input', (e) => render(e.target.dataset.studioInput));
    form.addEventListener('submit', (e) => e.preventDefault());
    render();
  }

  /* ---------- Steps: progress line follows scroll ---------- */
  function initSteps() {
    const list = $('[data-steps]');
    if (!list) return;
    const steps = $$('.step', list);
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = list.getBoundingClientRect();
      const vertical = innerWidth <= 960;
      const start = innerHeight * 0.75;
      const p = Math.max(0, Math.min(1, (start - r.top) / (r.height + innerHeight * 0.1)));
      list.style.setProperty('--line-progress', p.toFixed(3));
      steps.forEach((s, i) => {
        const threshold = vertical ? i / steps.length : i / (steps.length - 0.4);
        s.classList.toggle('is-lit', p > threshold + 0.02 || p >= 0.999);
      });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update, { passive: true });
    update();
  }

  /* ---------- Readiness check ---------- */
  function initReadiness() {
    const set = $('[data-ready]');
    if (!set) return;
    const boxes = $$('input[type=checkbox]', set);
    const ring = $('[data-ready-ring]');
    const score = $('[data-ready-score]');
    const title = $('[data-ready-title]');
    const msg = $('[data-ready-msg]');
    const cta = $('[data-ready-cta]');
    const ctaLabel = cta.firstChild;
    const states = [
      { max: 2, t: 'Start with your story', m: 'Sharing your story is free, and it\'s the best way to start gathering your evidence.', c: 'Share your story, free ' },
      { max: 4, t: 'You\'re getting close', m: 'Share your story now, and keep building the evidence for the statements you haven\'t ticked yet.', c: 'Share your story, free ' },
      { max: 5, t: 'You look ready to apply', m: 'You have the building blocks of a strong application. Join Evinca to hear when assessments open.', c: 'Join Evinca ' }
    ];
    const update = () => {
      const n = boxes.filter((b) => b.checked).length;
      const s = states.find((st) => n <= st.max);
      ring.closest('.score-ring').style.setProperty('--score-offset', String(100 - n * 20));
      ring.closest('.score-ring').classList.toggle('is-full', n === 5);
      score.textContent = String(n);
      title.textContent = s.t;
      msg.textContent = s.m;
      ctaLabel.textContent = s.c;
      if (n === 5 && !reduceMotion.matches) {
        const r = ring.getBoundingClientRect();
        confetti(r.left + r.width / 2, r.top + r.height / 2, 70);
      }
    };
    set.addEventListener('change', update);
    update();
  }

  /* ---------- Tabs (WAI-ARIA pattern) ---------- */
  function initTabs() {
    $$('[data-tabs]').forEach((wrap) => {
      const tabs = $$('[role=tab]', wrap);
      const indicator = $('.tab-indicator', wrap);
      const move = (tab) => {
        if (!indicator) return;
        indicator.style.width = `${tab.offsetWidth}px`;
        indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
      };
      const select = (tab, focus) => {
        tabs.forEach((t) => {
          const on = t === tab;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
        });
        move(tab);
        if (focus) tab.focus();
      };
      tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => select(tab));
        tab.addEventListener('keydown', (e) => {
          let j = null;
          if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
          if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
          if (e.key === 'Home') j = 0;
          if (e.key === 'End') j = tabs.length - 1;
          if (j !== null) { e.preventDefault(); select(tabs[j], true); }
        });
      });
      const selected = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
      requestAnimationFrame(() => move(selected));
      addEventListener('resize', () => move(tabs.find((t) => t.getAttribute('aria-selected') === 'true')), { passive: true });
      if (document.fonts) document.fonts.ready.then(() => move(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));
    });
  }

  /* ---------- Mission: words light up as you scroll ---------- */
  function initMissionWords() {
    const el = $('[data-words]');
    if (!el || reduceMotion.matches) return;
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', words.join(' '));
    el.textContent = '';
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'mw';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = w;
      el.append(s);
      if (i < words.length - 1) el.append(' ');
    });
    el.dataset.ready = '';
    const spans = $$('.mw', el);
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = el.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight * 0.85 - r.top) / (innerHeight * 0.55)));
      const lit = Math.round(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle('on', i < lit));
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- Confetti ---------- */
  let confettiRunning = false;
  function confetti(x = innerWidth / 2, y = innerHeight / 2, count = 140) {
    if (reduceMotion.matches || confettiRunning) return;
    const canvas = $('[data-confetti]');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const colors = ['#F3D99B', '#E8C170', '#D4A445', '#3FD8C2', '#7C9BFF', '#FFFFFF'];
    const parts = Array.from({ length: count }, () => {
      const a = Math.random() * Math.PI * 2;
      const v = 4 + Math.random() * 9;
      return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, s: 4 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: colors[(Math.random() * colors.length) | 0], life: 0 };
    });
    confettiRunning = true;
    const t0 = performance.now();
    const frame = (t) => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      const alive = t - t0 < 2600;
      parts.forEach((p) => {
        p.vy += 0.28; p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - (t - t0) / 2600);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      });
      if (alive) requestAnimationFrame(frame);
      else { ctx.clearRect(0, 0, innerWidth, innerHeight); confettiRunning = false; }
    };
    requestAnimationFrame(frame);
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

  async function sbPost(path, body, prefer) {
    const headers = { 'Content-Type': 'application/json', apikey: cfg.supabaseKey };
    if (prefer) headers.Prefer = prefer;
    const res = await fetch(cfg.supabaseUrl + path, { method: 'POST', headers, body: JSON.stringify(body), mode: 'cors', credentials: 'omit' });
    if (!res.ok) {
      let detail = '';
      try { detail = (await res.json()).message || ''; } catch (_) { /* not json */ }
      throw new Error(`HTTP ${res.status} ${detail}`.trim());
    }
  }
  const subscribe = (email, source) => sbPost('/rest/v1/rpc/subscribe', { p_email: email, p_source: source });
  const sendInquiry = (row) => sbPost('/rest/v1/inquiries', Object.assign({ status: 'new' }, row), 'return=minimal');

  const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  function mailtoFallback(subject, body) {
    return `mailto:${cfg.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  /* ---------- Join form ---------- */
  function initJoinForm() {
    const form = $('[data-join-form]');
    if (!form) return;
    const body = $('[data-form-body]', form);
    const success = $('[data-form-success]', form);
    const status = $('[data-form-status]', form);
    const submit = $('[data-submit]', form);

    // "Talk to us" on the institutions tab preselects the institution option.
    $$('[data-preset]').forEach((a) => a.addEventListener('click', () => {
      const radio = form.querySelector(`input[name=kind][value="${a.dataset.preset}"]`);
      if (radio) radio.checked = true;
      const partner = form.querySelector('input[name=interest][value="Partnership"]');
      if (partner) partner.checked = true;
    }));

    const setError = (name, text) => {
      const input = form.elements[name];
      const slot = $(`[data-error-for="${name}"]`, form);
      if (text) {
        input.setAttribute('aria-invalid', 'true');
        if (slot) { slot.textContent = text; slot.id = `err-${name}`; input.setAttribute('aria-describedby', slot.id); }
      } else {
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
        if (slot) slot.textContent = '';
      }
    };
    ['name', 'email'].forEach((n) => form.elements[n].addEventListener('input', () => setError(n, '')));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = '';
      status.classList.remove('is-error');
      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim();
      const email = String(fd.get('email') || '').trim().toLowerCase();
      let ok = true;
      if (name.length < 2) { setError('name', 'Please enter your name.'); ok = false; }
      if (!EMAIL_RE.test(email)) { setError('email', 'Please enter a valid email address.'); ok = false; }
      if (!ok) { form.querySelector('[aria-invalid="true"]').focus(); return; }

      // Honeypot: people never see this field, form-filling bots do.
      const isBot = String(fd.get('website') || '').trim() !== '';

      const kind = String(fd.get('kind') || 'professional');
      const interests = fd.getAll('interest').map(String);
      const note = String(fd.get('message') || '').trim();
      const kindLabel = { professional: 'Professional', team: 'Team', institution: 'Institution' }[kind] || kind;
      const message = [`Joining as: ${kindLabel}`, interests.length ? `Interested in: ${interests.join(', ')}` : '', note ? `\n${note}` : '', '\n(Sent from healthcarecrownacademy.co.uk)']
        .filter(Boolean).join('\n').slice(0, 4000);
      const row = {
        kind: kind === 'institution' ? 'institution' : 'contact',
        name: name.slice(0, 200),
        email,
        role: String(fd.get('role') || '').trim().slice(0, 200) || null,
        organization: String(fd.get('organization') || '').trim().slice(0, 200) || null,
        message
      };

      if (!backendReady()) {
        status.innerHTML = '';
        const a = document.createElement('a');
        a.href = mailtoFallback('Joining Evinca', `Name: ${name}\nEmail: ${email}\n${message}`);
        a.className = 'inline-link';
        a.textContent = 'Email us your details instead';
        status.append('Online sign-up is not available yet. ', a, '.');
        return;
      }

      form.classList.add('is-loading');
      submit.disabled = true;
      try {
        if (!isBot) await sendInquiry(row);
        if (fd.get('updates') && !isBot) {
          try { await subscribe(email, 'hca-home-join'); } catch (_) { /* the inquiry already landed */ }
        }
        $('[data-success-name]', form).textContent = name.split(' ')[0];
        body.hidden = true;
        success.hidden = false;
        success.focus();
        const r = form.getBoundingClientRect();
        confetti(r.left + r.width / 2, r.top + Math.min(r.height / 2, 200));
      } catch (err) {
        status.classList.add('is-error');
        status.innerHTML = '';
        const a = document.createElement('a');
        a.href = mailtoFallback('Joining Evinca', `Name: ${name}\nEmail: ${email}\n${message}`);
        a.className = 'inline-link';
        a.textContent = 'email us instead';
        status.append('Sorry, something went wrong. Please try again, or ', a, '.');
      } finally {
        form.classList.remove('is-loading');
        submit.disabled = false;
      }
    });

    $('[data-form-reset]', form).addEventListener('click', () => {
      form.reset();
      success.hidden = true;
      body.hidden = false;
      form.elements.name.focus();
    });
  }

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
      if (!backendReady()) {
        location.href = mailtoFallback('Subscribe me to updates', `Please add ${email} to your updates list.`);
        return;
      }
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
    const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (standalone) return;
    let deferred = null;
    addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferred = e;
      btn.hidden = false;
    });
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

  /* ---------- Free apps: a taste of each before opening it ---------- */
  function initApps() {
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
        const more = document.createElement('a');
        more.href = '/carecraft';
        more.textContent = 'Try today’s scenario in Carecraft →';
        result.append(lead, more);
        strongest.focus({ preventScroll: true });
      }));
    }

    const breath = $('[data-mini-breath]');
    if (breath) {
      const cue = $('[data-mb-cue]', breath);
      const start = $('[data-mb-start]', breath);
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
            cue.textContent = 'Ten seconds, well spent. Serein has more when you need them.';
            start.disabled = false;
            start.lastChild.textContent = 'One more breath';
          }, 10000)
        ];
      });
    }
  }

  function initServiceWorker() {
    if (!('serviceWorker' in navigator) || location.protocol !== 'https:') return;
    addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
  }

  /* ---------- Boot ---------- */
  applyConfig();
  const title = $('[data-split]');
  if (title && !reduceMotion.matches) splitWords(title);
  initHeader();
  initMenu();
  initTheme();
  initMarquee();
  initReveal();
  initCounters();
  initPointerFx();
  initStudio();
  initSteps();
  initReadiness();
  initTabs();
  initApps();
  initMissionWords();
  initJoinForm();
  initNewsForm();
  initInstall();
  initServiceWorker();

  const loaded = () => requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(loaded);
  } else {
    loaded();
  }
})();
