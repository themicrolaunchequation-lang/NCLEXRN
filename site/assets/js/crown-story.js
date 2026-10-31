/* Healthcare Crown Academy: "The Heartbeat Crown" hero.
   One WebGL point cloud tells five scenes as you scroll:
   0 gold dust · 1 a heartbeat line · 2 the line rises into the crown (three jewels, no cross) · 3 six app orbs · 4 a small crown above the call to action.
   Real HTML text carries every message; the canvas is decoration (aria-hidden). Reduced motion or no WebGL → a still layout. */
(() => {
  'use strict';
  const root = document.querySelector('[data-cs]');
  if (!root) return;
  const canvas = root.querySelector('.cs-canvas');
  const scenes = [...root.querySelectorAll('[data-s]')];
  const dots = [...root.querySelectorAll('[data-cs-dot]')];
  const labels = [...root.querySelectorAll('[data-orb]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const gl = !reduce.matches && canvas && canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  if (!gl) { root.classList.add('cs-static'); return; }
  root.classList.add('cs-live');

  const LAST = 4;
  const small = Math.min(innerWidth, innerHeight) < 700;
  const N = small ? 5200 : 10000;

  /* ---------- shapes (logo coordinates: a 64 × 64 box, y down) ---------- */
  const CROWN = [[8, 41], [16.5, 41], [21, 26.5], [26.2, 38], [32, 20], [37.8, 38], [43, 26.5], [47.5, 41], [56, 41]];
  const BASE = [[18, 48], [46, 48]];
  const JEWELS = [[21, 19.6, 2.6], [43, 19.6, 2.6], [32, 12.6, 3.2]];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  function along(poly, t) { // point at fraction t along a polyline
    const segs = []; let L = 0;
    for (let i = 1; i < poly.length; i++) { const d = Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]); segs.push(d); L += d; }
    let x = t * L;
    for (let i = 0; i < segs.length; i++) { if (x <= segs[i] || i === segs.length - 1) { const k = Math.min(1, x / segs[i]); return [poly[i][0] + (poly[i + 1][0] - poly[i][0]) * k, poly[i][1] + (poly[i + 1][1] - poly[i][1]) * k]; } x -= segs[i]; }
    return poly[poly.length - 1];
  }
  const lg = (p, s, cx, cy) => [cx + (p[0] - 32) / 24 * s, cy - (p[1] - 30) / 24 * s]; // logo → world

  // App orbs: colours from the site's jewel palette.
  const APPS = [['MedLex', '#3557D6'], ['Lumen', '#8B6CF0'], ['Carecraft', '#0F8A86'], ['Serein', '#5FB89E'], ['Gulf', '#347A9A'], ['Evinca', '#D4A445']];
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

  let aspect = 0, orbs = [];
  function layoutOrbs() {
    const wide = aspect > 0.9, out = [];
    if (wide) { for (let i = 0; i < 6; i++) { const u = i / 5 - 0.5; out.push([u * 2.15 * Math.min(1.25, aspect), -0.42 + 0.16 * Math.cos(u * Math.PI)]); } }
    else { const hw = aspect * 1.55; for (let i = 0; i < 6; i++) { const r = Math.floor(i / 3), c = i % 3; out.push([(c - 1) * hw * 0.62, -0.32 - r * 0.42]); } }
    return out;
  }

  const A = [0, 1, 2, 3, 4].map(() => new Float32Array(N * 3));
  const R = new Float32Array(N * 4), T = new Float32Array(N * 3);
  function build() {
    const fig = Math.min(1, aspect * 0.95);           // figure scale: shrink on narrow screens
    orbs = layoutOrbs();
    for (let i = 0; i < N; i++) {
      const o = i * 3, q = Math.random();
      // 0 · dust
      A[0][o] = rnd(-1.15, 1.15) * Math.max(1, aspect) * 1.25; A[0][o + 1] = rnd(-1.25, 1.25); A[0][o + 2] = rnd(-1, 1);
      // 1 · heartbeat across the screen, the crown-shaped beat in the middle
      const span = Math.max(1, aspect) * 1.35, beat = q < 0.55;
      let p1;
      if (beat) p1 = lg(along(CROWN, Math.random()), 0.95 * fig, 0, -0.24);
      else { const side = Math.random() < 0.5 ? -1 : 1, edge = lg([side < 0 ? 8 : 56, 41], 0.95 * fig, 0, -0.24); p1 = [edge[0] + side * Math.random() * (span - Math.abs(edge[0])), edge[1]]; }
      A[1][o] = p1[0]; A[1][o + 1] = p1[1] + gauss() * 0.004; A[1][o + 2] = gauss() * 0.03;
      // 2 · the crown: line, base bar, three jewels (the centre one the largest)
      let p2, z2 = gauss() * 0.04;
      if (q < 0.7) p2 = lg(along(CROWN, Math.random()), 1.02 * fig, 0, -0.24);
      else if (q < 0.82) p2 = lg(along(BASE, Math.random()), 1.02 * fig, 0, -0.24);
      else { const j = q < 0.875 ? 0 : q < 0.93 ? 1 : 2, J = JEWELS[j], a = Math.random() * 6.283, r = Math.pow(Math.random(), 0.8) * J[2] * 0.5; p2 = lg([J[0] + Math.cos(a) * r, J[1] + Math.sin(a) * r], 1.02 * fig, 0, -0.24); z2 = 0.15; }
      A[2][o] = p2[0] + gauss() * 0.004; A[2][o + 1] = p2[1] + gauss() * 0.004; A[2][o + 2] = z2;
      // 3 · six app orbs, a few particles tracing the ring that joins them
      const k = i % 6, c = orbs[k];
      if (q < 0.9) { const r = Math.abs(gauss()) * 0.06 * Math.max(0.7, fig); const a = Math.random() * 6.283; A[3][o] = c[0] + Math.cos(a) * r; A[3][o + 1] = c[1] + Math.sin(a) * r; A[3][o + 2] = gauss() * 0.1; }
      else { const t = Math.random(), m = Math.min(5, Math.floor(t * 5)), f = t * 5 - m, a = orbs[m], b = orbs[Math.min(5, m + 1)]; A[3][o] = a[0] + (b[0] - a[0]) * f; A[3][o + 1] = a[1] + (b[1] - a[1]) * f + gauss() * 0.01; A[3][o + 2] = 0; }
      const tc = hex(APPS[k][1]); T[o] = tc[0]; T[o + 1] = tc[1]; T[o + 2] = tc[2];
      // 4 · a small crown above the call to action
      let p4;
      if (q < 0.7) p4 = lg(along(CROWN, Math.random()), 0.42 * fig, 0, 0.5);
      else if (q < 0.82) p4 = lg(along(BASE, Math.random()), 0.42 * fig, 0, 0.5);
      else { const j = q < 0.875 ? 0 : q < 0.93 ? 1 : 2, J = JEWELS[j], a = Math.random() * 6.283, r = Math.pow(Math.random(), 0.8) * J[2] * 0.5; p4 = lg([J[0] + Math.cos(a) * r, J[1] + Math.sin(a) * r], 0.42 * fig, 0, 0.5); }
      A[4][o] = p4[0] + gauss() * 0.003; A[4][o + 1] = p4[1] + gauss() * 0.003; A[4][o + 2] = 0;
      // per particle: delay, shade, size, phase (jewel particles a little larger and brighter)
      const p = i * 4; R[p] = Math.random(); R[p + 1] = Math.random(); R[p + 2] = q >= 0.82 ? rnd(1.1, 1.5) : rnd(0.55, 1.15); R[p + 3] = Math.random();
    }
    for (let s = 0; s < 5; s++) { gl.bindBuffer(gl.ARRAY_BUFFER, bufs[s]); gl.bufferData(gl.ARRAY_BUFFER, A[s], gl.STATIC_DRAW); }
    gl.bindBuffer(gl.ARRAY_BUFFER, bufR); gl.bufferData(gl.ARRAY_BUFFER, R, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufT); gl.bufferData(gl.ARRAY_BUFFER, T, gl.STATIC_DRAW);
  }

  /* ---------- shaders ---------- */
  const VS = `
  attribute vec3 a0,a1,a2,a3,a4; attribute vec4 aR; attribute vec3 aT;
  uniform float uS,uTime,uAspect,uDpr,uH; uniform vec2 uMouse;
  varying vec3 vC; varying float vA;
  vec3 pick(float i){ return i<0.5?a0:i<1.5?a1:i<2.5?a2:i<3.5?a3:a4; }
  void main(){
    float s=clamp(uS,0.,4.), i=floor(min(s,3.999)), f=s-i;
    float d=aR.x*0.38, t=smoothstep(d,d+0.6,f);
    vec3 p=mix(pick(i),pick(i+1.),t);
    float mid=sin(t*3.14159);
    p.xy+=vec2(-p.y,p.x)*mid*0.18*(aR.w-0.5);                       // a soft swirl while particles travel
    float dust=1.-smoothstep(0.,0.7,s);
    p+=vec3(sin(uTime*.35+aR.w*6.28+p.y*2.1),cos(uTime*.28+aR.x*6.28+p.x*1.7),0.)*(0.006+0.07*dust);
    p.xy+=uMouse*(p.z+0.3)*0.035;
    float persp=1./(1.55-p.z*0.32);
    gl_Position=vec4(p.x*persp/uAspect,p.y*persp,0.,1.);
    float pulseX=mod(uTime*0.55,3.4)-1.7;
    float beat=exp(-pow((p.x-pulseX)*5.,2.))*(1.-min(abs(s-1.),1.));
    float jewel=step(1.1,aR.z)*(1.-min(abs(s-2.),1.)+1.-min(abs(s-4.),1.));
    vec3 gold=mix(vec3(.72,.53,.17),vec3(.98,.88,.64),aR.y);
    float tint=1.-min(abs(s-3.),1.);
    vC=mix(gold,aT*1.25,tint*0.82)*(0.85+beat*1.6+jewel*0.7);
    vA=(0.55+0.45*aR.y)*(0.6+0.4*persp)*(1.+0.7*dust);
    gl_PointSize=aR.z*uDpr*(1.6+2.2*persp+beat*2.5+jewel*1.0+dust*1.6)*uH;
  }`;
  const FS = `precision mediump float; varying vec3 vC; varying float vA;
  void main(){ float r=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,r); a*=a; gl_FragColor=vec4(vC*a*vA,a*vA); }`;
  function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s)); return s; }
  const prog = gl.createProgram();
  try { gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw Error('link'); }
  catch (e) { root.classList.remove('cs-live'); root.classList.add('cs-static'); return; }
  gl.useProgram(prog);
  const bufs = [0, 1, 2, 3, 4].map(() => gl.createBuffer()), bufR = gl.createBuffer(), bufT = gl.createBuffer();
  const bind = (buf, name, n) => { const l = gl.getAttribLocation(prog, name); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 0, 0); };
  const U = (n) => gl.getUniformLocation(prog, n);
  const uS = U('uS'), uTime = U('uTime'), uAspect = U('uAspect'), uDpr = U('uDpr'), uMouse = U('uMouse'), uH = U('uH');
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  /* ---------- size, scroll, pointer ---------- */
  let dpr = 1, W = 1, H = 1;
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2); W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); gl.viewport(0, 0, canvas.width, canvas.height);
    const na = W / H, rebuild = Math.abs(na - aspect) > 0.05; aspect = na;
    if (rebuild) { build(); [0, 1, 2, 3, 4].forEach((s) => bind(bufs[s], 'a' + s, 3)); bind(bufR, 'aR', 4); bind(bufT, 'aT', 3); }
  }
  let target = 0, stage = 0, mx = 0, my = 0, tmx = 0, tmy = 0;
  function progress() {
    const r = root.getBoundingClientRect(), total = r.height - innerHeight;
    target = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) * LAST : 0;
  }
  addEventListener('scroll', progress, { passive: true });
  addEventListener('resize', () => { resize(); progress(); });
  addEventListener('pointermove', (e) => { tmx = (e.clientX / innerWidth - 0.5) * 2; tmy = -(e.clientY / innerHeight - 0.5) * 2; }, { passive: true });

  const ease = (x) => x * x * (3 - 2 * x);
  const header = document.querySelector('[data-header]');
  function paintText() {
    if (header) header.classList.toggle('cs-over', root.getBoundingClientRect().bottom > 80);
    root.style.setProperty('--cs', stage.toFixed(3));
    scenes.forEach((el) => {
      const i = +el.dataset.s, span = el.dataset.span ? +el.dataset.span : 0;
      const dist = stage < i ? i - stage : stage > i + span ? stage - i - span : 0;
      const o = ease(Math.max(0, 1 - dist * 2.2));
      el.style.opacity = o.toFixed(3);
      el.style.transform = `translate3d(0,${((stage < i ? 1 : -1) * dist * 40).toFixed(1)}px,0)`;
      el.style.visibility = o < 0.02 ? 'hidden' : 'visible';
      el.classList.toggle('is-on', o > 0.6);
    });
    const cur = Math.round(stage);
    dots.forEach((d, i) => d.classList.toggle('is-on', i === cur));
    // labels under the app orbs
    const lo = ease(Math.max(0, 1 - Math.abs(stage - 3) * 2.2));
    labels.forEach((el, i) => {
      const c = orbs[i]; if (!c) return; const persp = 1 / 1.55;
      el.style.left = ((c[0] * persp / aspect + 1) / 2 * 100).toFixed(2) + '%';
      el.style.top = ((1 - (c[1] - 0.13) * persp) / 2 * 100).toFixed(2) + '%';
      el.style.opacity = lo.toFixed(3); el.style.visibility = lo < 0.02 ? 'hidden' : 'visible';
    });
  }

  let visible = true, last = performance.now(), t0 = last;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) requestAnimationFrame(frame); }).observe(root);
  function frame(now) {
    if (!visible || document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    stage += (target - stage) * Math.min(1, dt * 6);
    mx += (tmx - mx) * dt * 3; my += (tmy - my) * dt * 3;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uS, stage); gl.uniform1f(uTime, (now - t0) / 1000); gl.uniform1f(uAspect, aspect);
    gl.uniform1f(uDpr, dpr); gl.uniform2f(uMouse, mx, my); gl.uniform1f(uH, Math.min(1.25, Math.max(0.8, H / 900)));
    gl.drawArrays(gl.POINTS, 0, N);
    paintText();
    requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) { last = performance.now(); requestAnimationFrame(frame); } });
  resize(); progress(); stage = target; requestAnimationFrame(frame);
})();
