/* Healthcare Crown Academy: the 3D crown hero (Three.js + GSAP ScrollTrigger, both self-hosted).
   A gold crown with an engraved heartbeat, six app jewels and six points (no cross). Scroll story:
   0 hero · 1 one band (one account) · 2 six jewels (six apps) · 3 the heartbeat (care at the core) ·
   4 who it's for (each app's tool, drawn in gold dust under the crown) · 5 earn your crown.
   This file runs the story, the steps and the text. The drawing (crown-scene.js) runs in a background worker
   (crown-worker.js) where the browser allows it, so the page never freezes while the graphics are prepared.
   Sound is optional and made live in the browser (crown-sound.js).
   Text is real HTML; the canvas is decoration. Reduced motion or no WebGL keeps the still poster. */
import { createSound } from './crown-sound.js';

const root = document.querySelector('[data-cx]');
const canvas = root && root.querySelector('.cx-canvas');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function still() { root && root.classList.add('cx-still'); }
const whenIdle = () => new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(r, { timeout: 1500 }) : setTimeout(r, 200)));

(function start() {
  if (!root || !canvas || reduce || !window.gsap || !window.ScrollTrigger) return still();
  const gsap = window.gsap; gsap.registerPlugin(window.ScrollTrigger);
  const small = Math.min(innerWidth, innerHeight) < 700;   // lighter effects on small screens
  const narrow = matchMedia('(max-width: 760px)').matches, short = !narrow && innerHeight < 760;   // phone layout by width; short laptop screens keep the small crown clear of the header

  /* ---------- the scroll story ---------- */
  const S = { x: narrow ? 0 : 1.15, y: narrow ? 0.75 : -0.05, rot: -0.35, tilt: 0.22, dist: 5.6, camY: 1.15, burst: 0, glow: 0.35, jewel: 0, solid: 1, cs: 1, ly: 0, face: 0, spin: 1, fig: 0, who: 0 };
  const fade = (sel, o) => gsap.to(root.querySelectorAll(sel), { opacity: o, y: o ? 0 : -24, duration: 0.4, ease: 'power2.out' });
  // Steps and people fade with opacity only, never visibility, so screen readers can read all six messages and
  // every person in order. The one on screen is marked is-active; the others ignore the pointer (crown-3d.css),
  // and keyboard focus on any of them brings it on screen (see focusin below).
  const steps = [...root.querySelectorAll('[data-step]')];
  steps.forEach((el, i) => { el.classList.toggle('is-active', !i); if (i) gsap.set(el, { opacity: 0, y: 24 }); });
  const persons = [...root.querySelectorAll('[data-person]')];
  persons.forEach((el, i) => { el.classList.toggle('is-active', !i); if (i) gsap.set(el, { opacity: 0, y: 16 }); });
  const navs = [...root.querySelectorAll('[data-cx-nav]')], chips = [...root.querySelectorAll('[data-person-go]')];
  let marks = [0], snd = null, sceneI = 0, who = -1, total = 11, stepping = false;
  // The timeline is played by steps (one scroll, swipe, key or click each); the page scroll only follows it.
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut', duration: 1 } });
  const show = (i, at) => { tl.to(steps.filter((_, k) => k !== i), { opacity: 0, y: -24, duration: 0.3 }, at); tl.to(steps[i], { opacity: 1, y: 0, duration: 0.4 }, at + '+=0.3'); };
  const person = (i, at) => { tl.to(persons.filter((_, k) => k !== i), { opacity: 0, y: -16, duration: 0.25 }, at); tl.to(persons[i], { opacity: 1, y: 0, duration: 0.35 }, at + 0.25); };
  // 1 · one band
  tl.addLabel('s1').to(S, { x: narrow ? 0 : 1.1, y: narrow ? 0.72 : -0.1, rot: 0.9, tilt: 0.5, dist: narrow ? 5.9 : 5.7, camY: 2.0 }, 's1'); show(1, 's1');
  // 2 · six jewels
  tl.addLabel('s2').to(S, { x: narrow ? 0 : 1.05, y: narrow ? 0.72 : -0.05, rot: 0.9 + Math.PI * 1.05, tilt: 0.1, dist: narrow ? 5.5 : 4.6, camY: 0.75, jewel: 1 }, 's2'); show(2, 's2');
  // 3 · the heartbeat
  tl.addLabel('s3').to(S, { x: narrow ? 0 : 0.95, y: narrow ? 0.5 : 0, rot: 0.9 + Math.PI * 1.6, tilt: 0.0, dist: narrow ? 5.3 : 4.4, camY: 0.3, jewel: 0.3, glow: 1.4 }, 's3'); show(3, 's3');
  // 4 · who it's for: the crown settles on a person made of gold dust and turns to show their jewel
  tl.addLabel('s4').to(S, { x: narrow ? 0 : 1.25, y: narrow ? 0.98 : 0.86, cs: narrow ? 0.5 : 0.36, tilt: 0.3, dist: 5.6, camY: narrow ? 1.05 : 0.45, ly: narrow ? 0.05 : short ? -0.84 : -1.02,
    face: 1, spin: 0, glow: 0.5, jewel: 0.15, fig: 1, who: 0, duration: 1.1 }, 's4'); show(4, 's4'); person(0, tl.labels.s4 + 0.3);
  const whoAt = [tl.labels.s4 + 0.9];
  for (let i = 1; i < 6; i++) { tl.addLabel('p' + i, '+=0.6'); tl.to(S, { who: i, duration: 0.75 }, 'p' + i); person(i, tl.labels['p' + i] + 0.2); whoAt.push(tl.labels['p' + i] + 0.7); }
  tl.to({}, { duration: 0.5 });
  // 5 · earn your crown: back to full size, burst into gold, then come back together
  tl.addLabel('s5').to(S, { x: narrow ? 0 : 1.25, y: narrow ? 0.75 : -0.02, rot: 0.9 + Math.PI * 2.25, tilt: 0.24, dist: 5.4, camY: 1.2, ly: 0, cs: 1, face: 0, spin: 1, fig: 0, glow: 0.5, jewel: 0.6, duration: 1.1 }, 's5')
    .to(S, { burst: 1, solid: 0, duration: 0.4, ease: 'power3.out' }, 's5+=0.9')
    .to(S, { burst: 0, solid: 1, duration: 0.5, ease: 'power3.inOut' }, 's5+=1.4'); show(5, 's5');
  tl.to({}, { duration: 0.3 });
  total = tl.duration();
  marks = [0, tl.labels.s1, tl.labels.s2, tl.labels.s3, tl.labels.s4, tl.labels.s5];
  /* ---------- one scroll, swipe, key or click = one step of the story ---------- */
  const stops = [0, tl.labels.s1 + 1, tl.labels.s2 + 1, tl.labels.s3 + 1, ...whoAt, total];
  // chapter shown in the navigator: the nearest stop (00-03, 04 for the six people, 05 at the end)
  const sceneAt = (t) => { let n = 0, d = 1e9; stops.forEach((x, i) => { if (Math.abs(x - t) < d) { d = Math.abs(x - t); n = i; } }); return n <= 3 ? n : n < stops.length - 1 ? 4 : 5; };
  const setScene = (t) => { const k = sceneAt(t); navs.forEach((b, i) => { b.classList.toggle('is-on', i === k); if (i === k) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); }); steps.forEach((el, i) => el.classList.toggle('is-active', i === k)); if (k !== sceneI) { sceneI = k; if (snd) { snd.scene(k); if (k === 5) snd.crown(); } } };
  const st = window.ScrollTrigger.create({ trigger: root, start: 'top top', end: () => '+=' + innerHeight * total * (small ? 0.78 : 0.9), pin: root.querySelector('.cx-pin'), anticipatePin: 1,
    // scrollbar drags, links and scrolling in from below: follow the scroll smoothly
    onUpdate: (self) => { if (stepping) return; const t = self.progress * total; gsap.to(tl, { time: t, duration: 0.45, ease: 'power2.out', overwrite: true }); setScene(t); } });
  const yAt = (t) => st.start + (st.end - st.start) * Math.min(1, t / total);
  const inStory = () => scrollY >= st.start - 2 && scrollY <= st.end + 2;
  let cur = 0, lastStep = 0, lastInput = 0;
  const nearest = () => { if (stepping) return cur; const t = st.progress * total; let k = 0, b = 1e9; stops.forEach((x, i) => { const d = Math.abs(x - t); if (d < b) { b = d; k = i; } }); return k; };
  const go = (n) => {
    n = Math.max(0, Math.min(stops.length - 1, n)); cur = n; lastStep = performance.now(); stepping = true;
    const t = stops[n]; scrollTo({ top: yAt(t), behavior: 'instant' }); setScene(t);
    const d = Math.min(1.3, 0.75 + Math.abs(t - tl.time()) * 0.1);
    gsap.to(tl, { time: t, duration: d, ease: 'power2.inOut', overwrite: true, onComplete: () => { stepping = false; } });
  };
  const canStep = (dir) => { const n = nearest() + dir; return n >= 0 && n < stops.length; };
  const step = (dir) => { if (!canStep(dir)) return false; go(nearest() + dir); return true; };
  // A new gesture (a pause in the input) moves one step; trackpad momentum and fast repeats are absorbed.
  const fresh = (now) => now - lastInput > 140 && now - lastStep > 420;
  addEventListener('wheel', (e) => {
    if (!inStory() || Math.abs(e.deltaY) < 2) return;
    const now = performance.now(), isNew = fresh(now); lastInput = now;
    const dir = e.deltaY > 0 ? 1 : -1;
    if (!canStep(dir) && !stepping) return;   // first or last step: let the page scroll on
    e.preventDefault(); if (isNew) step(dir);
  }, { passive: false });
  let ty0 = null;
  addEventListener('touchstart', (e) => { ty0 = inStory() ? e.touches[0].clientY : null; }, { passive: true });
  addEventListener('touchmove', (e) => { if (ty0 === null) return; const dir = ty0 - e.touches[0].clientY > 0 ? 1 : -1; if (stepping || canStep(dir)) e.preventDefault(); }, { passive: false });
  addEventListener('touchend', (e) => { if (ty0 === null) return; const dy = ty0 - e.changedTouches[0].clientY; ty0 = null; if (Math.abs(dy) > 30 && performance.now() - lastStep > 320) step(dy > 0 ? 1 : -1); }, { passive: true });
  addEventListener('keydown', (e) => {
    if (!inStory() || e.target.closest('input,textarea,select,[contenteditable]')) return;
    const dir = ['ArrowDown', 'PageDown', ' '].includes(e.key) ? 1 : ['ArrowUp', 'PageUp'].includes(e.key) ? -1 : 0;
    if (!dir || (!canStep(dir) && !stepping)) return; e.preventDefault(); if (performance.now() - lastStep > 320) step(dir);
  });
  root.querySelector('.cx-pin').addEventListener('click', (e) => { if (!e.target.closest('a,button,input')) step(1); });
  const navStop = [0, 1, 2, 3, 4, stops.length - 1];
  navs.forEach((b, i) => b.addEventListener('click', () => go(navStop[i])));
  chips.forEach((b, i) => b.addEventListener('click', () => go(4 + i)));
  // Keyboard: focusing a link or button in a step or person that is not on screen moves the story there first.
  root.addEventListener('focusin', (e) => {
    const st = e.target.closest('[data-step]'); if (!st) return;
    const p = e.target.closest('[data-person]'), pi = persons.indexOf(p), si = steps.indexOf(st);
    if (pi >= 0) { if (nearest() !== 4 + pi) go(4 + pi); } else if (sceneI !== si) go(navStop[si]);
  });
  window.__cx = { tl, st, stops, go };   // for testing

  /* ---------- optional sound ---------- */
  const sb = root.querySelector('[data-cx-sound]'), sl = root.querySelector('[data-cx-sound-label]');
  if (sb) sb.addEventListener('click', () => {
    try { if (!snd) { snd = createSound(); snd.scene(sceneI); } } catch (e) { sb.hidden = true; return; }
    if (snd.on) snd.stop(); else snd.start();
    sb.setAttribute('aria-pressed', String(snd.on)); sl.textContent = snd.on ? 'Sound on' : 'Sound off';
  });

  /* ---------- jewel name tags, placed from the scene's numbers ---------- */
  const tags = [...root.querySelectorAll('[data-gem]')];
  const placeTags = (list) => { if (!list) return; tags.forEach((el, i) => { const [x, y, o] = list[i] || [0, 0, 0];
    el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`; el.style.opacity = o.toFixed(3); el.style.visibility = o < 0.02 ? 'hidden' : 'visible'; }); };

  /* ---------- the drawing: a background worker where possible, otherwise this page ---------- */
  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth - 0.5); ty = (e.clientY / innerHeight - 0.5); }, { passive: true });
  const t0 = performance.now();
  const nums = () => { const o = {}; for (const k in S) if (typeof S[k] === 'number') o[k] = S[k]; return o; };   // plain numbers only (GSAP adds its own data)
  const snap = () => ({ S: nums(), t: (performance.now() - t0) / 1000, mx, my, tagVis: Math.max(0, 1 - Math.abs(tl.time() - tl.labels.s2 - 0.6) * 1.4) });
  const size = () => ({ W: root.clientWidth, H: innerHeight });
  const hqq = new URLSearchParams(location.search).get('hq');   // testing switch: ?hq=1 or ?hq=0
  const opts = { small, narrow, dpr: devicePixelRatio || 1, hq: hqq === null ? undefined : hqq === '1' };
  const ready = () => root.classList.add('cx-ready');
  setTimeout(() => { if (!root.classList.contains('cx-ready')) still(); }, 15000);   // never leave the picture breathing for ever
  let engine = null, handedOver = false;
  if (canvas.transferControlToOffscreen && typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined') {
    try {
      const off = canvas.transferControlToOffscreen(); handedOver = true;
      const wk = new Worker(new URL('./crown-worker.js', import.meta.url), { type: 'module' });
      let live = false, busy = true;
      const fail = () => { still(); wk.terminate(); engine = null; };
      wk.onmessage = ({ data }) => {
        if (data.type === 'ready') { live = true; busy = false; window.__cx.gfx = { hq: data.hq, programs: data.programs }; ready(); }
        else if (data.type === 'tags') { busy = false; placeTags(data.tags); }
        else if (data.type === 'fail') fail();
      };
      wk.onerror = fail;
      wk.postMessage({ type: 'init', canvas: off, opts, ...size(), state: snap() }, [off]);
      engine = { resize: () => wk.postMessage({ type: 'resize', ...size() }), frame: () => { if (live && !busy) { busy = true; wk.postMessage({ type: 'frame', state: snap() }); } } };
    } catch (e) { engine = null; if (handedOver) still(); }
  }
  if (!engine && !handedOver) {
    // no background canvas: build on this page once it has finished loading
    whenIdle().then(() => import('./crown-scene.js')).then(async ({ buildScene }) => {
      let sc; try { sc = buildScene(canvas, opts); } catch (e) { return still(); }
      const s = size(); sc.resize(s.W, s.H); await sc.warm();
      engine = { resize: () => { const z = size(); sc.resize(z.W, z.H); }, frame: () => placeTags(sc.render(snap())) };
      ready();
    }).catch(still);
  }
  addEventListener('resize', () => engine && engine.resize());

  /* ---------- frame loop: smooth the pointer, update chips and sound, ask for a drawing ---------- */
  let running = true, looping = false;
  new IntersectionObserver(([e]) => { running = e.isIntersecting; if (snd) snd.level(running ? 1 : 0); if (running && !looping) { looping = true; requestAnimationFrame(loop); } }).observe(root);
  const header = document.querySelector('[data-header]'), after = document.getElementById('after');
  const darkHeader = () => header && header.classList.toggle('cs-over', (after || root).getBoundingClientRect().bottom > 80);
  addEventListener('scroll', darkHeader, { passive: true }); darkHeader();
  function loop() {
    if (!running) { looping = false; return; }
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    const near = Math.round(Math.max(0, Math.min(5, S.who)));
    if (S.fig > 0.6 && near !== who) { who = near; if (snd) snd.jewel(near); chips.forEach((c, i) => c.classList.toggle('is-on', i === near)); persons.forEach((el, i) => el.classList.toggle('is-active', i === near)); const row = chips[near] && chips[near].parentNode; if (row && row.scrollWidth > row.clientWidth) row.scrollTo({ left: chips[near].offsetLeft - 20, behavior: 'smooth' }); }
    if (engine) engine.frame();
    requestAnimationFrame(loop);
  }
  root.classList.add('cx-live');
  requestAnimationFrame(() => window.ScrollTrigger.refresh());
})();
