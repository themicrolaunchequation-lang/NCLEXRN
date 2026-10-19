/* Serein guided practice: 3D lungs for the breathing tide.
 * Raw WebGL, procedural geometry only (two lobed lungs from deformed spheres, a trachea and a branching bronchial tree).
 * The lungs expand, brighten and fill with drifting air on the in-breath, and settle and dim on the out-breath, driven
 * directly by the practice engine's phase and progress so they stay in step with the count.
 * Falls back to a flat canvas drawing without WebGL, holds still-ish under reduced motion, stops when the tab is hidden,
 * and frees every GL resource on dispose(). Replaces Serein.Orb (the plain sphere) for the tide. */
(function (g) {
  'use strict';
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = p => 0.5 - 0.5 * Math.cos(Math.PI * clamp(p, 0, 1));
  const norm3 = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /* ---- the breathing shape, shared by the shader and the 2D fallback ---- */
  const CENTRE = [0, 0.18, 0];
  function breathe(p, b) {
    const low = smooth(0.7, -0.9, p[1]);
    const dx = (p[0] - CENTRE[0]) * (1 + (0.1 + 0.05 * low) * b);
    const dz = (p[2] - CENTRE[2]) * (1 + (0.15 + 0.06 * low) * b);
    const dy = (p[1] - CENTRE[1]) * (1 + 0.04 * b);
    return [CENTRE[0] + dx, CENTRE[1] + dy - 0.1 * low * b, CENTRE[2] + dz];
  }

  /* ---- lung surface: a sphere deformed into a tapered, lobed lung ---- */
  function lungPoint(th, ph, side) {
    const py0 = Math.cos(th), r0 = Math.sin(th), cx = Math.cos(ph), cz = Math.sin(ph);
    // a fuller, rounder silhouette than a plain sphere: dome at the top, broad shoulders, wide base
    const fill = 0.78, rr = Math.pow(r0, fill), py = Math.sign(py0) * Math.pow(Math.abs(py0), 0.92);
    const px = rr * cx, pz = rr * cz;
    const t = (1 - py) / 2;
    const wprof = 0.64 + 0.36 * smooth(0, 0.62, t), dprof = 0.66 + 0.34 * smooth(0, 0.5, t);
    let x = px * 0.54 * wprof, y = py, z = pz * 0.46 * dprof;
    const medial = px * side < 0;
    if (medial) x *= 0.58;
    x -= side * 0.06 * smooth(0.1, 1, py);
    // fissures: shallow grooves that split the lung into lobes
    const n1 = norm3([-side * 0.45, 0.8, 0.25]);
    let groove = 0.07 * Math.exp(-Math.pow(dot([px, py, pz], n1) / 0.085, 2));
    if (side < 0) { // right lung has a third lobe
      const d2 = py - 0.34, w = smooth(-0.2, 0.4, pz) * smooth(0, 0.35, px * side);
      groove += 0.06 * Math.exp(-Math.pow(d2 / 0.055, 2)) * w;
    }
    const k = 1 - groove;
    x *= k; z *= k; y *= 1 - groove * 0.4;
    if (side > 0) { // cardiac notch on the left lung
      const dd = Math.pow(px + 0.7, 2) + Math.pow(py + 0.35, 2) + Math.pow(pz - 0.55, 2);
      x += side * 0.2 * Math.exp(-dd / 0.2);
    }
    // the root of the lung, where the airway enters
    const hh = Math.pow(px * side + 0.8, 2) + Math.pow(py - 0.15, 2) + Math.pow(pz, 2);
    x += side * 0.06 * Math.exp(-hh / 0.06);
    // a little organic irregularity
    const w = 1 + 0.018 * Math.sin(5.1 * px + 2.3 * py + 1.1) * Math.cos(4.2 * pz - 1.7 * py);
    x *= w; z *= w;
    return [side * 0.6 + x, y * 0.95 - 0.08, z];
  }
  function buildLung(side, nt, np) {
    const verts = (nt + 1) * (np + 1), pos = new Float32Array(verts * 6), idx = new Uint16Array(nt * np * 6);
    const centre = [side * 0.6, -0.08, 0];
    let o = 0;
    for (let i = 0; i <= nt; i++) {
      const th = clamp(i / nt * Math.PI, 1e-3, Math.PI - 1e-3);
      for (let j = 0; j <= np; j++) {
        const ph = j / np * Math.PI * 2, e = 1e-3;
        const p = lungPoint(th, ph, side);
        const a = lungPoint(th + e, ph, side), b = lungPoint(th - e, ph, side), c = lungPoint(th, ph + e, side), d = lungPoint(th, ph - e, side);
        let n = cross([a[0] - b[0], a[1] - b[1], a[2] - b[2]], [c[0] - d[0], c[1] - d[1], c[2] - d[2]]);
        if (Math.hypot(n[0], n[1], n[2]) < 1e-9) n = [p[0] - centre[0], p[1] - centre[1], p[2] - centre[2]];
        n = norm3(n);
        if (dot(n, [p[0] - centre[0], p[1] - centre[1], p[2] - centre[2]]) < 0) n = [-n[0], -n[1], -n[2]];
        pos[o++] = p[0]; pos[o++] = p[1]; pos[o++] = p[2]; pos[o++] = n[0]; pos[o++] = n[1]; pos[o++] = n[2];
      }
    }
    let q = 0;
    for (let i = 0; i < nt; i++) for (let j = 0; j < np; j++) {
      const a = i * (np + 1) + j, b = a + 1, c = a + np + 1, d = c + 1;
      idx[q++] = a; idx[q++] = b; idx[q++] = c; idx[q++] = b; idx[q++] = d; idx[q++] = c;
    }
    return { pos, idx };
  }

  /* ---- airways: trachea, two main bronchi and a branching tree inside each lung ---- */
  function buildAirways() {
    const rand = rng(11), tubes = [], paths = [], lines = [];
    const SEG = 8;
    const top = [0, 1.34, 0];
    let maxAlong = 0;
    function tube(points, r0, r1, along0, rings) {
      // returns {pos:[x,y,z,nx,ny,nz,along]*} and index data; pushes into tubes
      const n = points.length, pos = [], idx = [];
      let nrm = null, acc = along0;
      for (let i = 0; i < n; i++) {
        const prev = points[Math.max(0, i - 1)], next = points[Math.min(n - 1, i + 1)];
        const tg = norm3([next[0] - prev[0], next[1] - prev[1], next[2] - prev[2]]);
        if (!nrm) { const ref = Math.abs(tg[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]; nrm = norm3(cross(tg, ref)); }
        else { const d = dot(nrm, tg); nrm = norm3([nrm[0] - d * tg[0], nrm[1] - d * tg[1], nrm[2] - d * tg[2]]); }
        const bn = cross(tg, nrm);
        if (i > 0) acc += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1], points[i][2] - points[i - 1][2]);
        const f = i / (n - 1);
        let rad = lerp(r0, r1, f);
        if (rings) rad *= 1 + 0.07 * Math.max(0, Math.sin(acc * 78));
        for (let s = 0; s <= SEG; s++) {
          const a = s / SEG * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
          const nx = c * nrm[0] + sn * bn[0], ny = c * nrm[1] + sn * bn[1], nz = c * nrm[2] + sn * bn[2];
          pos.push(points[i][0] + rad * nx, points[i][1] + rad * ny, points[i][2] + rad * nz, nx, ny, nz, acc);
        }
      }
      for (let i = 0; i < n - 1; i++) for (let s = 0; s < SEG; s++) {
        const a = i * (SEG + 1) + s, b = a + 1, c = a + SEG + 1, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
      tubes.push({ pos, idx });
      maxAlong = Math.max(maxAlong, acc);
      return acc;
    }
    // a gently curved airway: a Hermite curve from the start, leaving along dir, to a point a little off to one side
    function bend(p0, dir, len, steps, wob) {
      const d2 = norm3([dir[0] + (rand() - 0.5) * wob, dir[1] + (rand() - 0.5) * wob - 0.05, dir[2] + (rand() - 0.5) * wob]);
      const p1 = [p0[0] + (dir[0] + d2[0]) * 0.5 * len, p0[1] + (dir[1] + d2[1]) * 0.5 * len, p0[2] + (dir[2] + d2[2]) * 0.5 * len];
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps, h00 = 2 * t * t * t - 3 * t * t + 1, h10 = t * t * t - 2 * t * t + t, h01 = -2 * t * t * t + 3 * t * t, h11 = t * t * t - t * t;
        pts.push([0, 1, 2].map(k => h00 * p0[k] + h10 * len * dir[k] + h01 * p1[k] + h11 * len * d2[k]));
      }
      return { pts, dir: d2 };
    }
    function inside(p, side) {
      const rx = 0.42 * (0.68 + 0.32 * smooth(0.8, -0.6, p[1]));
      const dx = (p[0] - side * 0.7) / rx, dy = (p[1] + 0.1) / 0.84, dz = p[2] / 0.34;
      return dx * dx + dy * dy + dz * dz < 1.0;
    }
    function rotateAround(v, axis, ang) {
      const c = Math.cos(ang), s = Math.sin(ang), d = dot(axis, v), x = cross(axis, v);
      return norm3([v[0] * c + x[0] * s + axis[0] * d * (1 - c), v[1] * c + x[1] * s + axis[1] * d * (1 - c), v[2] * c + x[2] * s + axis[2] * d * (1 - c)]);
    }
    function branch(start, dir, len, rad, depth, along, side, trail) {
      const seg = bend(start, dir, len, 7, 0.35), end = seg.pts[seg.pts.length - 1];
      const a1 = tube(seg.pts, rad, rad * 0.82, along, false);
      lines.push({ pts: seg.pts, r: rad, a0: along, a1 });
      const path = trail.concat(seg.pts.slice(1));
      if (depth >= 4) { paths.push(path); return; }
      let any = false;
      for (let k = 0; k < 2; k++) {
        const ref = Math.abs(seg.dir[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        const ax = norm3(cross(seg.dir, ref));
        const around = rotateAround(ax, seg.dir, depth * 1.1 + k * Math.PI + rand() * 0.4);
        let cd = rotateAround(seg.dir, around, 0.38 + rand() * 0.3);
        // lean towards the middle of the lung so the tree fills it rather than leaving it
        const toC = norm3([side * 0.68 - end[0], -0.05 - end[1], -end[2]]);
        cd = norm3([cd[0] + toC[0] * 0.35, cd[1] + toC[1] * 0.35, cd[2] + toC[2] * 0.35]);
        let nl = len * (0.72 + rand() * 0.08), ok = false;
        for (let tries = 0; tries < 4 && !ok; tries++) {
          const probe = [end[0] + cd[0] * nl, end[1] + cd[1] * nl, end[2] + cd[2] * nl];
          if (inside(probe, side)) ok = true; else nl *= 0.72;
        }
        if (!ok) continue;
        any = true;
        branch(end, cd, nl, rad * 0.74, depth + 1, a1, side, path);
      }
      if (!any) paths.push(path);
    }
    // trachea, with faint cartilage rings
    const trachea = [];
    for (let i = 0; i <= 14; i++) trachea.push([0, lerp(top[1], 0.66, i / 14), 0]);
    const tEnd = tube(trachea, 0.085, 0.075, 0, true);
    lines.push({ pts: trachea, r: 0.085, a0: 0, a1: tEnd });
    const trail0 = [[0, 1.95, 0]].concat(trachea.slice(2));
    for (const side of [-1, 1]) {
      const root = [side * 0.04, 0.66, 0], hil = [side * 0.44, 0.3, 0.0];
      const mainPts = [];
      for (let i = 0; i <= 8; i++) { const f = i / 8; mainPts.push([lerp(root[0], hil[0], f), lerp(root[1], hil[1], f) - 0.05 * Math.sin(f * Math.PI), 0]); }
      const aMain = tube(mainPts, 0.062, 0.052, tEnd, false);
      lines.push({ pts: mainPts, r: 0.062, a0: tEnd, a1: aMain });
      // inside the lung the main airway splits into its lobes: three on the right, two on the left
      const lobes = side < 0
        ? [[[side * 0.55, 0.7, 0.12], 0.34], [[side * 0.95, -0.05, 0.26], 0.36], [[side * 0.3, -0.9, 0.0], 0.52]]
        : [[[side * 0.5, 0.75, 0.1], 0.4], [[side * 0.3, -0.9, 0.0], 0.56]];
      const entry = [side * 0.52, 0.2, 0.0];
      const stem = [hil, [lerp(hil[0], entry[0], 0.5), lerp(hil[1], entry[1], 0.5), 0], entry];
      const aStem = tube(stem, 0.052, 0.046, aMain, false);
      lines.push({ pts: stem, r: 0.052, a0: aMain, a1: aStem });
      for (const [d, len] of lobes) branch(entry, norm3(d), len, 0.034, 0, aStem, side, trail0.concat(mainPts.slice(1), stem.slice(1)));
    }
    return { tubes, paths, lines, maxAlong };
  }
  function mergeTubes(tubes, maxAlong) {
    let nv = 0, ni = 0;
    for (const t of tubes) { nv += t.pos.length / 7; ni += t.idx.length; }
    const pos = new Float32Array(nv * 7), idx = new Uint16Array(ni);
    let vo = 0, io = 0, base = 0;
    for (const t of tubes) {
      for (let i = 0; i < t.pos.length; i += 7) { for (let k = 0; k < 6; k++) pos[vo++] = t.pos[i + k]; pos[vo++] = t.pos[i + 6] / maxAlong; }
      for (let i = 0; i < t.idx.length; i++) idx[io++] = t.idx[i] + base;
      base += t.pos.length / 7;
    }
    return { pos, idx };
  }
  function pathData(paths) {
    return paths.map(pts => {
      const acc = [0];
      for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
      return { pts, acc, len: acc[acc.length - 1] };
    });
  }
  function onPath(path, u, out) {
    const d = u * path.len;
    let i = 1; while (i < path.acc.length - 1 && path.acc[i] < d) i++;
    const f = clamp((d - path.acc[i - 1]) / ((path.acc[i] - path.acc[i - 1]) || 1), 0, 1), a = path.pts[i - 1], b = path.pts[i];
    out[0] = lerp(a[0], b[0], f); out[1] = lerp(a[1], b[1], f); out[2] = lerp(a[2], b[2], f);
  }

  /* ---- matrices (column-major) ---- */
  function perspective(fov, aspect, n, f) { const t = 1 / Math.tan(fov / 2), nf = 1 / (n - f); return [t / aspect, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]; }
  function mul(a, b) { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }
  function rotY(a) { const c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; }
  function rotX(a) { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; }
  function trans(x, y, z) { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]; }
  const mat3 = m => [m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]];

  /* ---- shaders ---- */
  const BREATHE = `
    uniform mediump float uB;
    vec3 breathe(vec3 p){
      float low=smoothstep(.7,-.9,p.y);
      vec3 c=vec3(0.,.18,0.);
      vec3 d=p-c;
      d.x*=1.+(.1+.05*low)*uB;
      d.z*=1.+(.15+.06*low)*uB;
      d.y*=1.+.04*uB;
      p=c+d; p.y-=.1*low*uB;
      return p;
    }`;
  const VS_LUNG = `attribute vec3 aPos;attribute vec3 aNor;uniform mat4 uMVP;uniform mat3 uRot;varying vec3 vN;varying vec3 vW;varying float vY;${BREATHE}
    void main(){vec3 p=breathe(aPos);vN=uRot*aNor;vW=uRot*p;vY=p.y;gl_Position=uMVP*vec4(p,1.);}`;
  const FS_LUNG = `precision mediump float;varying vec3 vN;varying vec3 vW;varying float vY;uniform mediump float uB;uniform float uPass;uniform vec3 uEye;uniform float uTime;
    void main(){
      vec3 N=normalize(vN); if(uPass>.5)N=-N;
      vec3 V=normalize(uEye-vW);
      float ndv=clamp(dot(N,V),0.,1.);
      float fres=pow(1.-ndv,2.2);
      vec3 L=normalize(vec3(-.45,.7,.85));
      float diff=clamp(dot(N,L)*.5+.5,0.,1.);
      vec3 deep=vec3(.05,.25,.25),sage=vec3(.27,.58,.49),hi=vec3(.80,.95,.88);
      vec3 col=mix(deep,sage,diff*.7+.12*uB);
      col+=vec3(.04,.10,.07)*uB*(.5-.5*vY);
      float spec=pow(max(dot(reflect(-L,N),V),0.),30.);
      col+=hi*spec*.34;
      col+=vec3(.36,.74,.62)*fres*(.4+.55*uB);
      col*=.78+.4*uB;
      float a=.2+.46*fres+.12*uB;
      if(uPass>.5)a*=.55;
      a=clamp(a,0.,.9);
      gl_FragColor=vec4(col*a,a);
    }`;
  const VS_AIR = `attribute vec3 aPos;attribute vec3 aNor;attribute float aAlong;uniform mat4 uMVP;uniform mat3 uRot;varying vec3 vN;varying float vA;${BREATHE}
    void main(){vec3 p=breathe(aPos);vN=uRot*aNor;vA=aAlong;gl_Position=uMVP*vec4(p,1.);}`;
  const FS_AIR = `precision mediump float;varying vec3 vN;varying float vA;uniform float uFlow;uniform float uGlow;
    void main(){
      float band=exp(-pow((vA-uFlow)/.1,2.))*step(-.2,uFlow);
      float tr=smoothstep(.24,.0,vA);
      vec3 base=vec3(.3,.78,.66);
      float gl=.2+.8*uGlow+.5*tr*uGlow;
      float rim=pow(1.-abs(normalize(vN).z),2.)*.35;
      vec3 col=base*(gl+rim)+vec3(.85,1.,.95)*band*.9;
      float a=clamp(.55+.3*band+.25*tr*uGlow,0.,.95)*smoothstep(0.,.05,vA+.012);
      gl_FragColor=vec4(col*a,a);
    }`;
  const VS_DOT = `attribute vec3 aPos;attribute vec2 aDot;uniform mat4 uMVP;uniform float uPx;varying float vAl;${BREATHE}
    void main(){vec3 p=breathe(aPos);vec4 q=uMVP*vec4(p,1.);gl_Position=q;gl_PointSize=aDot.x*uPx/q.w;vAl=aDot.y;}`;
  const FS_DOT = `precision mediump float;varying float vAl;
    void main(){float d=length(gl_PointCoord-.5)*2.;float a=smoothstep(1.,.0,d);a*=a*vAl;gl_FragColor=vec4(vec3(.8,1.,.93)*a,a);}`;
  const VS_HALO = `attribute vec2 aP;varying vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`;
  const FS_HALO = `precision mediump float;varying vec2 vUv;uniform float uB;uniform float uAspect;
    void main(){vec2 d=(vUv-vec2(.5,.52))*vec2(uAspect,1.);float r=dot(d,d);float a=exp(-r*5.5)*(.1+.3*uB);
      vec3 c=vec3(.28,.68,.58)*a;gl_FragColor=vec4(c,a*.9);}`;

  /* ---- the component ---- */
  const NS = 'http://www.w3.org/2000/svg';
  class LungsOrb {
    constructor(canvas, fallback) {
      this.legacyCanvas = canvas; this.legacyFallback = fallback; this.host = canvas.parentElement;
      this.reduced = false; this.frame = 0; this.mode = 'none'; this.cv = null; this.gl = null; this.ctx2 = null;
      this.getSnap = null; this.model = { b: 0.32, kind: 'ready', p: 0, glow: 0.3, flow: -1, playing: false };
      this.quality = 1; this.yaw = 0; this.pitch = 0; this.px = 0; this.py = 0; this.t0 = performance.now(); this.frames = 0; this.last = 0; this.idle = 0;
      this.onVis = () => { if (!document.hidden && this.getSnap && !this.frame) this.loop(); };
      this.onPtr = e => { const r = this.host.getBoundingClientRect(); this.px = clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1); this.py = clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1); };
      this.disposed = true;
      canvas.hidden = true; if (fallback) fallback.hidden = true;
      if (g.SereinPlayer) g.SereinPlayer.attachLungs(this);
    }
    /* ---- lifecycle ---- */
    ensure() {
      if (!this.disposed && this.cv && this.cv.isConnected) return;
      this.release();
      this.disposed = false;
      const cv = document.createElement('canvas');
      cv.className = 'sp-lungs'; cv.setAttribute('aria-hidden', 'true'); cv.dataset.spMode = 'pending';
      this.host.insertBefore(cv, this.legacyCanvas);
      this.cv = cv;
      let ok = false;
      try { ok = this.initGL(cv); } catch (e) { ok = false; }
      if (!ok) { this.releaseGL(); cv.remove(); const c2 = document.createElement('canvas'); c2.className = 'sp-lungs'; c2.setAttribute('aria-hidden', 'true'); this.host.insertBefore(c2, this.legacyCanvas); this.cv = c2; this.ctx2 = c2.getContext('2d'); this.mode = this.ctx2 ? '2d' : 'none'; if (!this.air) this.makeAir(); }
      this.cv.dataset.spMode = this.mode;
      this.host.dataset.lungs = this.mode;
      document.addEventListener('visibilitychange', this.onVis);
      this.host.addEventListener('pointermove', this.onPtr, { passive: true });
    }
    makeAir() {
      this.air = buildAirways();
      this.paths = pathData(this.air.paths);
      this.nPart = 150;
      this.parts = Array.from({ length: this.nPart }, (_, i) => ({ path: this.paths[i % this.paths.length], off: ((i * 0.6180339) % 1), size: 0.7 + ((i * 0.37) % 1) * 1.1, jit: [((i * 0.731) % 1 - 0.5) * 0.05, ((i * 0.419) % 1 - 0.5) * 0.05, ((i * 0.263) % 1 - 0.5) * 0.04] }));
    }
    initGL(cv) {
      const gl = cv.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'low-power', preserveDrawingBuffer: false }) || cv.getContext('experimental-webgl');
      if (!gl) return false;
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s)); return s; };
      const prog = (vs, fs) => { const p = gl.createProgram(), a = sh(gl.VERTEX_SHADER, vs), b = sh(gl.FRAGMENT_SHADER, fs); gl.attachShader(p, a); gl.attachShader(p, b); gl.linkProgram(p); gl.deleteShader(a); gl.deleteShader(b); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(p)); return p; };
      this.gl = gl; this.res = { buffers: [], programs: [] };
      const buf = (target, data, usage) => { const b = gl.createBuffer(); gl.bindBuffer(target, b); gl.bufferData(target, data, usage || gl.STATIC_DRAW); this.res.buffers.push(b); return b; };
      this.pLung = prog(VS_LUNG, FS_LUNG); this.pAir = prog(VS_AIR, FS_AIR); this.pDot = prog(VS_DOT, FS_DOT); this.pHalo = prog(VS_HALO, FS_HALO);
      this.res.programs.push(this.pLung, this.pAir, this.pDot, this.pHalo);
      const loc = (p, n) => gl.getAttribLocation(p, n), uni = (p, n) => gl.getUniformLocation(p, n);
      this.u = {};
      for (const [k, p, names] of [['lung', this.pLung, ['uMVP', 'uRot', 'uB', 'uPass', 'uEye', 'uTime']], ['air', this.pAir, ['uMVP', 'uRot', 'uB', 'uFlow', 'uGlow']], ['dot', this.pDot, ['uMVP', 'uB', 'uPx']], ['halo', this.pHalo, ['uB', 'uAspect']]]) { this.u[k] = {}; for (const n of names) this.u[k][n] = uni(p, n); }
      this.a = { lung: [loc(this.pLung, 'aPos'), loc(this.pLung, 'aNor')], air: [loc(this.pAir, 'aPos'), loc(this.pAir, 'aNor'), loc(this.pAir, 'aAlong')], dot: [loc(this.pDot, 'aPos'), loc(this.pDot, 'aDot')], halo: [loc(this.pHalo, 'aP')] };
      this.lungs = [-1, 1].map(side => { const m = buildLung(side, 54, 72); return { vb: buf(gl.ARRAY_BUFFER, m.pos), ib: buf(gl.ELEMENT_ARRAY_BUFFER, m.idx), n: m.idx.length }; });
      if (!this.air) this.makeAir();
      const merged = mergeTubes(this.air.tubes, this.air.maxAlong);
      this.airGeo = { vb: buf(gl.ARRAY_BUFFER, merged.pos), ib: buf(gl.ELEMENT_ARRAY_BUFFER, merged.idx), n: merged.idx.length };
      this.dotData = new Float32Array(this.nPart * 5);
      this.dotBuf = buf(gl.ARRAY_BUFFER, this.dotData, gl.DYNAMIC_DRAW);
      this.haloBuf = buf(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]));
      cv.addEventListener('webglcontextlost', this.lost = e => { e.preventDefault(); this.switchTo2D(); }, false);
      this.mode = 'webgl';
      return true;
    }
    switchTo2D() {
      if (this.mode === '2d') return;
      const wasRunning = !!this.frame;
      this.releaseGL();
      if (this.cv) this.cv.remove();
      const c2 = document.createElement('canvas'); c2.className = 'sp-lungs'; c2.setAttribute('aria-hidden', 'true');
      this.host.insertBefore(c2, this.legacyCanvas);
      this.cv = c2; this.ctx2 = c2.getContext('2d'); this.mode = this.ctx2 ? '2d' : 'none'; c2.dataset.spMode = this.mode; this.host.dataset.lungs = this.mode;
      if (wasRunning && this.getSnap) this.loop();
    }
    releaseGL() {
      const gl = this.gl;
      if (gl) {
        try {
          for (const b of this.res.buffers) gl.deleteBuffer(b);
          for (const p of this.res.programs) gl.deleteProgram(p);
          const ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext();
        } catch { /* context already gone */ }
      }
      if (this.cv && this.lost) this.cv.removeEventListener('webglcontextlost', this.lost);
      this.gl = null; this.res = null;
    }
    release() {
      this.stop(); this.releaseGL();
      if (this.cv) { this.cv.remove(); this.cv = null; }
      this.ctx2 = null; this.mode = 'none';
      document.removeEventListener('visibilitychange', this.onVis);
      this.host.removeEventListener('pointermove', this.onPtr);
    }
    dispose() { this.release(); this.disposed = true; delete this.host.dataset.lungs; }

    /* ---- model: where the breath is, straight from the practice engine ---- */
    read(s) {
      const eng = g.Serein && g.Serein.player && g.Serein.player.engine, m = this.model;
      if (!s || !eng) return m;
      let title = '';
      try { title = (eng.phases()[s.index] || {}).title || s.title || ''; } catch { title = s.title || ''; }
      const kind = /out/i.test(title) ? 'out' : /in\b/i.test(title) ? 'in' : /hold/i.test(title) ? 'holdFull' : /rest/i.test(title) ? 'holdEmpty' : 'in';
      const p = clamp(s.progress || 0, 0, 1);
      m.kind = kind; m.p = p; m.playing = s.state === 'playing';
      if (s.state === 'ready') { m.b = 0.3; m.glow = 0.28; m.flow = -1; m.kind = 'ready'; return m; }
      if (s.state === 'complete') { m.b = 0.35; m.glow = 0.3; m.flow = -1; m.kind = 'ready'; return m; }
      let b = kind === 'in' ? ease(p) : kind === 'out' ? 1 - ease(p) : kind === 'holdFull' ? 1 : 0;
      let glow = kind === 'in' ? 0.3 + 0.7 * ease(p) : kind === 'out' ? 0.2 + 0.7 * (1 - ease(p)) * 0.8 : kind === 'holdFull' ? 0.85 : 0.18;
      m.flow = kind === 'in' ? p * 1.25 - 0.1 : kind === 'out' ? 1.15 - p * 1.25 : -1;
      const pulse = (kind === 'holdFull' || kind === 'holdEmpty') ? Math.sin((performance.now() - this.t0) / 1000 * 2.2) * 0.06 : 0;
      glow = clamp(glow + pulse, 0, 1);
      if (this.still()) { b = 0.5 + (b - 0.5) * 0.4; glow = 0.45 + (glow - 0.45) * 0.4; m.flow = -1; }
      m.b = b; m.glow = glow;
      return m;
    }
    still() { return this.reduced || document.body.classList.contains('reduce-motion'); }
    /* The controller calls this on every tick; it draws a frame itself when no animation loop is running. */
    sync(s) {
      this.read(s);
      if (this.frame || this.disposed || !this.playerOpen()) return;
      const now = performance.now();
      if (now - (this.lastSync || 0) < (this.cost || 0) * 3) return; // a slow device is not asked for more than it can give
      this.lastSync = now; this.render(false); this.cost = (this.cost || 0) * 0.7 + (performance.now() - now) * 0.3;
    }
    playerOpen() { const p = document.querySelector('#player'); return !!(p && p.open); }
    draw() { if (!this.playerOpen()) return; this.ensure(); this.render(false); }
    start(getSnapshot) {
      this.stop(); this.getSnap = getSnapshot;
      if (!this.playerOpen()) return;
      this.ensure(); this.loop();
    }
    loop() {
      cancelAnimationFrame(this.frame); this.frame = 0;
      if (this.disposed || !this.getSnap) return;
      this.frame = requestAnimationFrame(now => {
        this.frame = 0;
        if (document.hidden || !this.playerOpen()) return;
        this.adapt(now);
        const s = this.getSnap();
        this.read(s);
        this.render(true, now);
        this.loop();
      });
    }
    stop() { cancelAnimationFrame(this.frame); this.frame = 0; }

    /* A slow device quietly renders at a lower resolution instead of stuttering. */
    adapt(now) {
      if (this.lastNow) {
        const dt = now - this.lastNow;
        if (dt < 400) { this.avg = this.avg ? this.avg * 0.9 + dt * 0.1 : dt; this.nAvg = (this.nAvg || 0) + 1; }
        if (this.nAvg > 24 && this.avg > 42 && this.quality > 0.55) { this.quality = Math.max(0.55, this.quality - 0.15); this.nAvg = 0; this.avg = 0; }
      }
      this.lastNow = now;
    }
    /* ---- rendering ---- */
    size() {
      const r = this.cv.getBoundingClientRect(), dpr = Math.min(1.75, g.devicePixelRatio || 1) * this.quality;
      const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
      if (this.cv.width !== w || this.cv.height !== h) { this.cv.width = w; this.cv.height = h; }
      return [w, h];
    }
    render(animating, now) {
      if (this.disposed || !this.cv) return;
      const tms = performance.now(), t = (tms - this.t0) / 1000;
      this.frames++;
      const st = this.still();
      // idle sway of about 15 degrees each way, plus a little pointer parallax
      const sway = st ? 0 : Math.sin(t * 0.26) * 0.26;
      this.yaw += ((sway + this.px * 0.12) - this.yaw) * 0.12; this.pitch += ((this.py * 0.07 - 0.04) - this.pitch) * 0.1;
      if (this.mode === 'webgl') this.renderGL(t); else if (this.mode === '2d') this.render2D(t);
      this.cv.dataset.b = this.model.b.toFixed(3);
    }
    renderGL(t) {
      const gl = this.gl; if (!gl) return;
      const [w, h] = this.size(); gl.viewport(0, 0, w, h);
      const m = this.model, aspect = w / h, fov = 34 * Math.PI / 180, tn = Math.tan(fov / 2);
      const dist = Math.max(1.3 / tn, 1.36 / (tn * aspect)) * 1.04;
      const proj = perspective(fov, aspect, 0.5, 20), view = trans(0, -0.18, -dist);
      const rot = mul(rotX(this.pitch), rotY(this.yaw)), mvp = mul(proj, mul(view, rot)), rot3 = mat3(rot);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      // halo
      gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(this.pHalo); gl.bindBuffer(gl.ARRAY_BUFFER, this.haloBuf);
      gl.enableVertexAttribArray(this.a.halo[0]); gl.vertexAttribPointer(this.a.halo[0], 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(this.u.halo.uB, m.glow); gl.uniform1f(this.u.halo.uAspect, aspect); gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.disableVertexAttribArray(this.a.halo[0]);
      // airways first, so they show through the glass of the lungs
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(true);
      gl.useProgram(this.pAir); gl.bindBuffer(gl.ARRAY_BUFFER, this.airGeo.vb); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.airGeo.ib);
      const A = this.a.air; gl.enableVertexAttribArray(A[0]); gl.enableVertexAttribArray(A[1]); gl.enableVertexAttribArray(A[2]);
      gl.vertexAttribPointer(A[0], 3, gl.FLOAT, false, 28, 0); gl.vertexAttribPointer(A[1], 3, gl.FLOAT, false, 28, 12); gl.vertexAttribPointer(A[2], 1, gl.FLOAT, false, 28, 24);
      gl.uniformMatrix4fv(this.u.air.uMVP, false, mvp); gl.uniformMatrix3fv(this.u.air.uRot, false, rot3);
      gl.uniform1f(this.u.air.uB, m.b); gl.uniform1f(this.u.air.uFlow, m.flow); gl.uniform1f(this.u.air.uGlow, m.glow);
      gl.drawElements(gl.TRIANGLES, this.airGeo.n, gl.UNSIGNED_SHORT, 0);
      gl.disableVertexAttribArray(A[2]);
      // lungs: far wall, then near wall, as translucent glass
      gl.depthMask(false); gl.enable(gl.CULL_FACE);
      gl.useProgram(this.pLung);
      const L = this.a.lung; gl.enableVertexAttribArray(L[0]); gl.enableVertexAttribArray(L[1]);
      gl.uniformMatrix4fv(this.u.lung.uMVP, false, mvp); gl.uniformMatrix3fv(this.u.lung.uRot, false, rot3);
      gl.uniform1f(this.u.lung.uB, m.b); gl.uniform1f(this.u.lung.uTime, t); gl.uniform3f(this.u.lung.uEye, 0, 0.18, dist);
      for (const pass of [1, 0]) {
        gl.cullFace(pass ? gl.FRONT : gl.BACK); gl.uniform1f(this.u.lung.uPass, pass);
        for (const lung of this.lungs) {
          gl.bindBuffer(gl.ARRAY_BUFFER, lung.vb); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lung.ib);
          gl.vertexAttribPointer(L[0], 3, gl.FLOAT, false, 24, 0); gl.vertexAttribPointer(L[1], 3, gl.FLOAT, false, 24, 12);
          gl.drawElements(gl.TRIANGLES, lung.n, gl.UNSIGNED_SHORT, 0);
        }
      }
      gl.disableVertexAttribArray(L[0]); gl.disableVertexAttribArray(L[1]);
      // drifting air
      gl.disable(gl.CULL_FACE); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      this.fillDots(m, t);
      gl.useProgram(this.pDot); gl.bindBuffer(gl.ARRAY_BUFFER, this.dotBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.dotData);
      const D = this.a.dot; gl.enableVertexAttribArray(D[0]); gl.enableVertexAttribArray(D[1]);
      gl.vertexAttribPointer(D[0], 3, gl.FLOAT, false, 20, 0); gl.vertexAttribPointer(D[1], 2, gl.FLOAT, false, 20, 12);
      gl.uniformMatrix4fv(this.u.dot.uMVP, false, mvp); gl.uniform1f(this.u.dot.uB, m.b); gl.uniform1f(this.u.dot.uPx, h * 0.021);
      gl.drawArrays(gl.POINTS, 0, this.nPart);
      gl.disableVertexAttribArray(D[0]); gl.disableVertexAttribArray(D[1]);
      gl.depthMask(true); gl.disable(gl.BLEND);
    }
    fillDots(m, t) {
      const out = [0, 0, 0], d = this.dotData, stag = 0.8;
      const moving = m.kind === 'in' || m.kind === 'out', quiet = this.still();
      for (let i = 0; i < this.nPart; i++) {
        const q = this.parts[i];
        let u, al;
        if (moving && !quiet) {
          const f = clamp(m.p * (1 + stag) - q.off * stag, 0, 1);
          u = m.kind === 'in' ? f : 1 - f;
          al = smooth(0, 0.07, u) * (1 - smooth(0.88, 1, u)) * (0.9 + 0.1 * Math.sin(t * 3 + i));
        } else {
          // holds and rests: a few faint motes shimmer where the air is
          u = 0.25 + q.off * 0.7; al = (m.kind === 'holdFull' ? 0.22 : 0.07) * (0.5 + 0.5 * Math.sin(t * 1.4 + i * 1.7)) * (quiet ? 0.5 : 1);
        }
        onPath(q.path, u, out);
        const o = i * 5;
        d[o] = out[0] + q.jit[0]; d[o + 1] = out[1] + q.jit[1]; d[o + 2] = out[2] + q.jit[2]; d[o + 3] = q.size; d[o + 4] = clamp(al, 0, 1) * 0.9;
      }
    }

    /* ---- flat fallback: the same lungs, drawn on a 2D canvas ---- */
    render2D(t) {
      const c = this.ctx2; if (!c) return;
      const [w, h] = this.size(), m = this.model;
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
      const u = Math.min(w / 2.9, h / 2.7), cx = w / 2, cy = h / 2 + u * 0.12;
      const P = p => { const q = breathe([p[0], p[1], 0], m.b); return [cx + q[0] * u + Math.sin(this.yaw) * q[2] * u, cy - (q[1] + 0.02) * u]; };
      const halo = c.createRadialGradient(cx, cy, 0, cx, cy, u * 1.9);
      halo.addColorStop(0, `rgba(95,184,158,${0.1 + 0.26 * m.glow})`); halo.addColorStop(1, 'rgba(95,184,158,0)');
      c.fillStyle = halo; c.fillRect(0, 0, w, h);
      // lungs
      for (const side of [-1, 1]) {
        const shape = [[0.08, 0.86], [0.12, 0.28], [0.1, -0.2], [0.16, -0.7], [0.46, -0.96], [0.66, -0.52], [0.7, 0.2], [0.66, 0.8], [0.36, 0.97], [0.1, 0.84]];
        const pts = shape.map(([x, y]) => P([side * x, y - 0.08, 0]));
        c.beginPath(); c.moveTo((pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2);
        for (let i = 1; i <= pts.length; i++) { const a = pts[i % pts.length], b = pts[(i + 1) % pts.length]; c.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
        c.closePath();
        const gr = c.createLinearGradient(cx + side * u * 0.7, cy - u, cx + side * u * 0.1, cy + u);
        gr.addColorStop(0, `rgba(${90 + 50 * m.glow | 0},${170 + 55 * m.glow | 0},${150 + 40 * m.glow | 0},${0.22 + 0.5 * m.glow})`); gr.addColorStop(1, `rgba(26,96,96,${0.3 + 0.4 * m.glow})`);
        c.fillStyle = gr; c.fill(); c.lineWidth = Math.max(1.5, u * 0.012); c.strokeStyle = `rgba(190,245,225,${0.25 + 0.55 * m.glow})`; c.stroke();
      }
      // airways
      c.lineCap = 'round'; c.lineJoin = 'round';
      for (const ln of this.air.lines) {
        const pts = ln.pts.map(P);
        c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
        const band = m.flow >= 0 ? Math.exp(-Math.pow(((ln.a0 + ln.a1) / 2 / this.air.maxAlong - m.flow) / 0.14, 2)) : 0;
        c.strokeStyle = `rgba(${150 + 90 * band | 0},${235},${215},${0.35 + 0.4 * m.glow + 0.3 * band})`; c.lineWidth = Math.max(1, ln.r * u * 1.8); c.stroke();
      }
      // air
      c.fillStyle = 'rgba(220,255,240,0.8)';
      const out = [0, 0, 0], moving = m.kind === 'in' || m.kind === 'out';
      if (moving && !this.still()) for (let i = 0; i < this.nPart; i += 2) {
        const q = this.parts[i], f = clamp(m.p * 1.8 - q.off * 0.8, 0, 1), uu = m.kind === 'in' ? f : 1 - f;
        const al = smooth(0, 0.07, uu) * (1 - smooth(0.88, 1, uu)); if (al < 0.05) continue;
        onPath(q.path, uu, out); const [x, y] = P(out); c.globalAlpha = al * 0.8; c.beginPath(); c.arc(x, y, Math.max(1.2, u * 0.012 * q.size), 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
    }
    /* for tests */
    debug() { return { mode: this.mode, frames: this.frames, yaw: this.yaw, pitch: this.pitch, running: !!this.frame, quality: this.quality, model: Object.assign({}, this.model), size: this.cv ? [this.cv.width, this.cv.height] : null, disposed: this.disposed, buffers: this.res ? this.res.buffers.length : 0 }; }
    readPixels() {
      if (!this.cv) return null;
      this.render(false);
      const tmp = document.createElement('canvas'); tmp.width = this.cv.width; tmp.height = this.cv.height;
      const c = tmp.getContext('2d'); c.drawImage(this.cv, 0, 0);
      return c.getImageData(0, 0, tmp.width, tmp.height).data;
    }
  }

  g.SereinLungs = { LungsOrb, breathe, buildLung, buildAirways, lungPoint };
  g.Serein = g.Serein || {};
  g.Serein.Orb = LungsOrb;
})(globalThis);
