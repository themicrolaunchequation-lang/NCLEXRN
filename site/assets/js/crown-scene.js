/* The 3D crown scene: builds and draws everything. Runs in a background worker (crown-worker.js) where the browser
   allows it, so preparing the graphics never freezes the page; otherwise on the page itself (crown-3d.js).
   It knows nothing about the page: each frame it is given the story state and returns where the jewel name tags go. */
import * as THREE from '../vendor/three/three.module.min.js';
import { MeshSurfaceSampler } from '../vendor/three/addons/MeshSurfaceSampler.js';
import { EffectComposer } from '../vendor/three/addons/EffectComposer.js';
import { RenderPass } from '../vendor/three/addons/RenderPass.js';
import { UnrealBloomPass } from '../vendor/three/addons/UnrealBloomPass.js';
import { OutputPass } from '../vendor/three/addons/OutputPass.js';

const makeCanvas = (R) => { if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(R, R); const c = document.createElement('canvas'); c.width = c.height = R; return c; };
/* ---------- six jewels, six tools: each app's own icon (the same drawings as the Start here cards), drawn in gold dust ---------- */
const ICONS = [
  [['M4 5h9a3 3 0 013 3v11a2 2 0 00-2-2H4z', 'M20 5h-3', 'M19.7 17.7L22 20'], [[17.5, 15.5, 3]]],   // MedLex: book and magnifier
  [['M9 18h6M10 21h4', 'M12 3a6 6 0 00-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0012 3z'], []],   // Lumen: light bulb
  [['M4 5h11a2 2 0 012 2v6a2 2 0 01-2 2H9l-4 3v-3H4a2 2 0 01-2-2V7a2 2 0 012-2z', 'M19 9h1a2 2 0 012 2v5a2 2 0 01-2 2h-1v3l-3-3h-3'], []],   // Carecraft: conversation
  [['M5 19c0-8 5-13 15-14-1 10-6 15-14 15', 'M5 19l7-7'], []],   // Serein: leaf
  [['M6 3v6a5 5 0 0010 0V3', 'M11 14v2a4 4 0 008 0v-2'], [[19, 12, 2]]],   // Gulf Region Nursing: stethoscope
  [['M8.5 14L7 22l5-3 5 3-1.5-8', 'M9.5 9l1.8 1.8L15 7.5'], [[12, 9, 6]]]   // Evinca: medal
];
function paintFigure(i) {
  const R = 320, c = makeCanvas(R);
  const x = c.getContext('2d', { willReadFrequently: true }); x.scale(R / 512, R / 512);
  x.translate(124, 150); x.scale(11, 11);   // a 24-unit icon becomes a 264px drawing under the crown
  x.strokeStyle = '#fff'; x.lineWidth = 1.7; x.lineCap = 'round'; x.lineJoin = 'round';
  const [paths, circles] = ICONS[i];
  paths.forEach((d) => x.stroke(new Path2D(d)));
  circles.forEach(([cx, cy, r]) => { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.stroke(); });
  return c;
}
function sampleFigure(c, n) {
  const R = c.width, a = c.getContext('2d').getImageData(0, 0, R, R).data;
  let h = null;   // a blurred copy gives each figure a soft, rounded depth
  try { const b = makeCanvas(R); const bx = b.getContext('2d', { willReadFrequently: true }); bx.filter = 'blur(12px)'; if (bx.filter.indexOf('blur') >= 0) { bx.drawImage(c, 0, 0); h = bx.getImageData(0, 0, R, R).data; } } catch (e) { h = null; }
  const fill = [], edge = [];
  for (let y = 1; y < R - 1; y++) for (let x = 1; x < R - 1; x++) {
    const k = (y * R + x) * 4 + 3; if (a[k] < 128) continue;
    (a[k - 4] < 128 || a[k + 4] < 128 || a[k - R * 4] < 128 || a[k + R * 4] < 128 ? edge : fill).push(y * R + x);
  }
  const out = new Float32Array(n * 4), s = 512 / R;
  for (let i = 0; i < n; i++) {
    const isE = Math.random() < 0.34, list = isE ? edge : fill, q = list[(Math.random() * list.length) | 0];
    const px = (q % R + Math.random()) * s, py = (((q / R) | 0) + Math.random()) * s, d = h ? h[q * 4 + 3] / 255 : 0.6;
    out[i * 4] = (px - 256) / 256; out[i * 4 + 1] = (100 - py) / 256;
    out[i * 4 + 2] = (d * 0.24 + (Math.random() - 0.5) * 0.03) * (Math.random() < 0.6 ? 1 : -0.4); out[i * 4 + 3] = isE ? 1 : 0;
  }
  return out;
}

export function buildScene(canvas, { small, narrow, dpr }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(dpr || 1, small ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#050b1c');
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  // lights: warm key, cool academy-blue rim, gold glow inside the crown
  const key = new THREE.DirectionalLight('#ffe9c4', 1.5); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight('#6f8cff', 2.2); rim.position.set(-4, 2, -3); scene.add(rim);
  const inner = new THREE.PointLight('#ffcf73', 2, 2.4, 2); inner.position.set(0, 0.25, 0); scene.add(inner);

  /* ---------- the crown ---------- */
  const crown = new THREE.Group(); scene.add(crown);
  // Gold, pearl and jewel surfaces sample small painted "lit spheres" (matcaps) instead of live reflections:
  // the same polished look, and almost nothing for the graphics card to prepare (live reflections froze some computers).
  const matcap = (stops, hi, rim) => {
    const R = 256, c = makeCanvas(R), x = c.getContext('2d');
    const g = x.createRadialGradient(R * 0.46, R * 0.42, R * 0.05, R * 0.5, R * 0.5, R * 0.5);
    stops.forEach(([o, col]) => g.addColorStop(o, col)); x.fillStyle = g; x.fillRect(0, 0, R, R);
    const add = (cx, cy, r, col) => { const h = x.createRadialGradient(cx * R, cy * R, 0, cx * R, cy * R, r * R); h.addColorStop(0, col); h.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = h; x.fillRect(0, 0, R, R); };
    x.globalCompositeOperation = 'lighter';
    add(0.36, 0.3, 0.34, hi[0]); add(0.33, 0.27, 0.09, hi[1]); add(0.66, 0.78, 0.3, hi[2]);
    if (rim) add(0.82, 0.62, 0.28, rim);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const goldCap = matcap([[0, '#f3cf7a'], [0.45, '#c8922f'], [0.78, '#6d4510'], [1, '#2a1904']], ['rgba(255,236,186,.75)', 'rgba(255,252,236,.95)', 'rgba(255,200,110,.35)'], 'rgba(120,150,255,.35)');
  const darkCap = matcap([[0, '#8a6220'], [0.6, '#4b3210'], [1, '#1c1204']], ['rgba(255,214,140,.25)', 'rgba(255,230,180,.3)', 'rgba(200,140,60,.15)'], null);
  const pearlCap = matcap([[0, '#fffaf0'], [0.55, '#e6dcc6'], [0.85, '#a89a80'], [1, '#5d5446']], ['rgba(255,255,255,.7)', 'rgba(255,255,255,.95)', 'rgba(255,230,210,.3)'], 'rgba(150,170,255,.3)');
  const gold = new THREE.MeshMatcapMaterial({ matcap: goldCap, transparent: true });
  const goldDark = new THREE.MeshMatcapMaterial({ matcap: darkCap, transparent: true, side: THREE.DoubleSide });
  const pearlM = new THREE.MeshMatcapMaterial({ matcap: pearlCap, transparent: true });

  // band: a lathe profile with raised rims
  const prof = [[0.93, -0.17], [0.99, -0.17], [1.03, -0.15], [1.03, -0.125], [0.995, -0.11], [1.005, 0.11], [1.05, 0.125], [1.05, 0.15], [1.02, 0.17], [0.95, 0.17], [0.93, -0.17]].map(([x, y]) => new THREE.Vector2(x, y));
  const band = new THREE.Mesh(new THREE.LatheGeometry(prof, 160), gold); crown.add(band);
  const bandIn = new THREE.Mesh(new THREE.CylinderGeometry(0.935, 0.935, 0.34, 96, 1, true), goldDark); crown.add(bandIn);
  // pearls along both rims
  const pearlG = new THREE.SphereGeometry(0.016, 14, 10);
  const pearls = new THREE.InstancedMesh(pearlG, pearlM, 72); const mtx = new THREE.Matrix4();
  for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2; mtx.makeTranslation(Math.cos(a) * 1.05, 0.172, Math.sin(a) * 1.05); pearls.setMatrixAt(i, mtx); }
  crown.add(pearls);

  // six app jewels on the band, each in a gold setting
  const APPS = [['MedLex', 'Understand', '#3557D6'], ['Lumen', 'Study', '#8B6CF0'], ['Carecraft', 'Practise', '#0F8A86'], ['Serein', 'Restore', '#5FB89E'], ['Gulf Region Nursing', 'Prepare', '#347A9A'], ['Evinca', 'Be recognised', '#D9532F']];
  const gemG = new THREE.OctahedronGeometry(0.085, 0); gemG.scale(1, 1.2, 0.55);
  const setG = new THREE.TorusGeometry(0.094, 0.014, 12, 40);
  const gems = APPS.map((app, i) => {
    const a = Math.PI / 2 + i * Math.PI / 3, g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({ color: app[2], metalness: 0.1, roughness: 0.14, emissive: new THREE.Color(app[2]), emissiveIntensity: 0.1, flatShading: true, transparent: true });
    const gem = new THREE.Mesh(gemG, m); gem.position.z = 0.02; g.add(gem);
    const set = new THREE.Mesh(setG, gold); g.add(set);
    g.position.set(Math.cos(a) * 1.03, 0.0, Math.sin(a) * 1.03); g.lookAt(Math.cos(a) * 3, 0.0, Math.sin(a) * 3);
    crown.add(g); return { g, m, app, a };
  });

  // six points between the jewels; the front one tallest, with the large centre jewel (no cross)
  const points = [];
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 2 + Math.PI / 6 + i * Math.PI / 3 - Math.PI / 6 * 1, front = i === 0;
    const h = front ? 0.62 : i % 2 ? 0.34 : 0.46;
    const cone = new THREE.Mesh(new THREE.LatheGeometry([0, 0.05, 0.075, 0.07, 0.05, 0.028, 0.01, 0].map((r, k, arr) => new THREE.Vector2(r, k / (arr.length - 1) * h)), 32), gold);
    const holder = new THREE.Group(); holder.add(cone);
    holder.position.set(Math.cos(a) * 1.0, 0.16, Math.sin(a) * 1.0); holder.lookAt(0, 0.16, 0); holder.rotateX(-0.1);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(front ? 0.06 : 0.034, 24, 18), front ? new THREE.MeshMatcapMaterial({ matcap: pearlCap, color: '#ffe7b0', transparent: true }) : pearlM);
    tip.position.y = h + (front ? 0.05 : 0.025); holder.add(tip);
    crown.add(holder); points.push(holder);
  }

  // the heartbeat engraved around the band, with a travelling pulse of light
  const ecg = [];
  for (let i = 0; i <= 720; i++) {
    const t = i / 720, a = t * Math.PI * 2, k = ((t * 6) % 1);   // six beats, one under each point
    let y = -0.055;
    if (k > 0.42 && k < 0.47) y += (k - 0.42) / 0.05 * 0.03;
    else if (k >= 0.47 && k < 0.5) y += 0.03 - (k - 0.47) / 0.03 * 0.07;
    else if (k >= 0.5 && k < 0.54) y += -0.04 + (k - 0.5) / 0.04 * 0.13;
    else if (k >= 0.54 && k < 0.58) y += 0.09 - (k - 0.54) / 0.04 * 0.13;
    else if (k >= 0.58 && k < 0.62) y += -0.04 + (k - 0.58) / 0.04 * 0.04;
    ecg.push(new THREE.Vector3(Math.cos(a + 0.52) * 1.012, y, Math.sin(a + 0.52) * 1.012));
  }
  const ecgU = { uTime: { value: 0 }, uGlow: { value: 0.35 } };
  const ecgMat = new THREE.ShaderMaterial({ uniforms: ecgU, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    vertexShader: 'varying float vU; void main(){ vU=uv.x; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform float uTime,uGlow; varying float vU; void main(){ float d=fract(vU-uTime*0.12); float p=exp(-d*24.)+exp(-(1.-d)*220.); vec3 c=mix(vec3(1.,.78,.36),vec3(1.,.97,.86),p); gl_FragColor=vec4(c*(uGlow+p*2.2),1.); }' });
  const ecgMesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ecg, true), 720, 0.0085, 6, true), ecgMat); ecgMesh.renderOrder = 10; crown.add(ecgMesh);

  /* ---------- particles: the crown's own surface, to burst and reassemble ---------- */
  const N = small ? 9000 : 18000, pos = new Float32Array(N * 3), dir = new Float32Array(N * 3), col = new Float32Array(N * 3), rnd = new Float32Array(N);
  crown.updateMatrixWorld(true);
  const sources = [band, ...points.map((p) => p.children[0]), ...gems.map((g) => g.g.children[0])];
  const samplers = sources.map((m) => { const geo = m.geometry.clone(); geo.applyMatrix4(m.matrixWorld); return new MeshSurfaceSampler(new THREE.Mesh(geo)).build(); });
  const v = new THREE.Vector3(), goldC = new THREE.Color('#e9c06a');
  for (let i = 0; i < N; i++) {
    const s = i % 10 < 6 ? 0 : i % 10 < 9 ? 1 + (i % 6) : 7 + (i % 6);
    samplers[Math.min(s, samplers.length - 1)].sample(v);
    pos.set([v.x, v.y, v.z], i * 3);
    const d = new THREE.Vector3(v.x, v.y * 0.6 + 0.5, v.z * 0.7).normalize().multiplyScalar(0.5 + Math.random() * 1.1).add(new THREE.Vector3((Math.random() - 0.5) * 0.5, Math.random() * 0.5, (Math.random() - 0.5) * 0.3));
    dir.set([d.x, d.y, d.z], i * 3);
    const c = s >= 7 ? new THREE.Color(APPS[(s - 7) % 6][2]) : goldC; col.set([c.r, c.g, c.b], i * 3); rnd[i] = Math.random();
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('aDir', new THREE.BufferAttribute(dir, 3));
  pg.setAttribute('aCol', new THREE.BufferAttribute(col, 3)); pg.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
  const FIGS = [], figAt = (i) => FIGS[i] || (FIGS[i] = sampleFigure(paintFigure(i), N));   // icons 3-6 are made later, in spare time
  const aFa = new THREE.BufferAttribute(new Float32Array(figAt(0)), 4).setUsage(THREE.DynamicDrawUsage);
  const aFb = new THREE.BufferAttribute(new Float32Array(figAt(1)), 4).setUsage(THREE.DynamicDrawUsage);
  pg.setAttribute('aFa', aFa); pg.setAttribute('aFb', aFb);
  const pU = { uBurst: { value: 0 }, uShow: { value: 0 }, uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() }, uFig: { value: 0 }, uMix: { value: 0 }, uFigPt: { value: narrow ? 1.8 : 1 }, uFigOnly: { value: 1 },
    uCrownM: { value: new THREE.Matrix4() }, uFigM: { value: new THREE.Matrix4() }, uCa: { value: new THREE.Color(APPS[0][2]) }, uCb: { value: new THREE.Color(APPS[1][2]) } };
  const pMat = new THREE.ShaderMaterial({ uniforms: pU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute vec3 aDir,aCol; attribute float aRnd; attribute vec4 aFa,aFb;
      uniform float uBurst,uTime,uPx,uFig,uMix,uFigPt,uFigOnly; uniform mat4 uCrownM,uFigM; uniform vec3 uCa,uCb; varying vec3 vC; varying float vA;
      void main(){ float b=smoothstep(0.,1.,clamp(uBurst*1.2-aRnd*0.2,0.,1.)); vec3 p=position+aDir*b*0.95;
        p.x+=sin(uTime*.7+aRnd*20.)*0.04*b; p.y+=cos(uTime*.6+aRnd*17.)*0.04*b;
        vec3 pc=(uCrownM*vec4(p,1.)).xyz;
        float m=smoothstep(0.,1.,clamp(uMix*1.4-aRnd*0.4,0.,1.)); vec4 f=mix(aFa,aFb,m);
        vec3 fl=f.xyz+aDir*m*(1.-m)*0.5; fl.z+=sin(uTime*1.3+aRnd*30.)*0.012;
        vec3 pf=(uFigM*vec4(fl,1.)).xyz;
        float g=smoothstep(0.,1.,clamp(uFig*1.3-aRnd*0.3,0.,1.));
        vec3 w=mix(pc,pf,g)+aDir*g*(1.-g)*1.2;
        vec4 mv=viewMatrix*vec4(w,1.); gl_Position=projectionMatrix*mv;
        gl_PointSize=min(uPx*4.5,uPx*(1.6+aRnd*1.8-g*0.5+f.w*g*0.5)*(5.2/-mv.z)*(1.+g*(uFigPt-1.)));
        vec3 jc=mix(uCa,uCb,m)*1.35; vec3 fc=mix(mix(vec3(.91,.75,.42),jc,.65),mix(jc,vec3(1.),.18),f.w);
        vC=mix(aCol,fc,g); vA=(0.55+0.45*aRnd)*mix(1.,(0.55+0.45*f.w)*smoothstep(-1.75,-1.6,f.y),g)*mix(1.,smoothstep(0.2,0.75,g),uFigOnly); }`,
    fragmentShader: 'uniform float uShow; varying vec3 vC; varying float vA; void main(){ float r=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,r); gl_FragColor=vec4(vC*1.6*a*vA*uShow,a*vA*uShow); }' });
  const cloud = new THREE.Points(pg, pMat); cloud.renderOrder = 11; cloud.frustumCulled = false; scene.add(cloud);
  const fig = new THREE.Object3D();

  // gold dust in the room
  const D = small ? 500 : 1200, dp = new Float32Array(D * 3);
  for (let i = 0; i < D; i++) dp.set([(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 7, -Math.random() * 8 + 1], i * 3);
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: '#e8c170', size: 0.018, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(dust);

  /* ---------- post: soft bloom on the gold highlights and the pulse ---------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), small ? 0.22 : 0.3, 0.45, 0.93); composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const tmp = new THREE.Vector3();
  let W = 1, H = 1, last = 0, spin = 0, figP = -1;
  const setFig = (p) => { if (p === figP) return; figP = p; aFa.array.set(figAt(p)); aFb.array.set(figAt(Math.min(p + 1, 5))); aFa.needsUpdate = aFb.needsUpdate = true; pU.uCa.value.set(APPS[p][2]); pU.uCb.value.set(APPS[Math.min(p + 1, 5)][2]); };
  function resize(w, h) {
    W = w; H = h;
    renderer.setSize(W, H, false); composer.setSize(W, H); bloom.resolution.set(W / 2, H / 2);
    camera.aspect = W / H; camera.updateProjectionMatrix(); pU.uPx.value = renderer.getPixelRatio() * (H / 900);
  }
  // S: the story state; t: seconds; mx, my: smoothed pointer; tagVis: how visible the jewel name tags are
  function render({ S, t, mx, my, tagVis }) {
    const dt = Math.min(0.1, Math.max(0, t - last)); last = t; spin += dt * 0.12 * S.spin;
    const k = camera.aspect < 0.95 ? Math.min(2.1, 0.92 / camera.aspect) : 1;   // narrow screens: pull back, crown in the top half
    crown.position.set(S.x, S.y * k, 0); crown.scale.setScalar(S.cs);
    let ang = S.rot + spin;
    if (S.face > 0) { const to = S.who * Math.PI / 3, near = to + Math.PI * 2 * Math.round((ang - to) / (Math.PI * 2)); ang += (near - ang) * S.face; }
    crown.rotation.set(S.tilt + my * 0.08, ang + mx * 0.25 * (1 - S.face * 0.7), 0);
    camera.position.set(Math.sin(mx * 0.2) * 0.3, S.camY * k, S.dist * k); camera.lookAt(S.x * 0.35, (S.y + 0.1) * (k > 1 ? 0.2 : 1) + S.ly * (k > 1 ? k : 1), 0);
    crown.updateMatrixWorld(); pU.uCrownM.value.copy(crown.matrixWorld);
    fig.position.copy(crown.position); fig.rotation.set(0, 0, 0); fig.lookAt(camera.position); fig.rotateY(Math.sin(t * 0.35) * 0.2 + mx * 0.45);
    fig.scale.setScalar(S.cs * 3.1); fig.updateMatrixWorld(); pU.uFigM.value.copy(fig.matrixWorld);
    const w = Math.max(0, Math.min(5, S.who)), p = Math.min(4, Math.floor(w)); setFig(p); pU.uMix.value = w - p; pU.uFig.value = S.fig; pU.uFigOnly.value = S.burst > 0.01 ? 0 : 1;
    ecgU.uTime.value = t; ecgU.uGlow.value = S.glow;
    pU.uTime.value = t; pU.uBurst.value = S.burst; pU.uShow.value = Math.min(1, S.burst * 3 + S.fig * 2.5);
    const solid = S.solid;
    [gold, goldDark, pearlM, ...gems.map((g) => g.m), points[0].children[1].material].forEach((m) => { m.opacity = solid; m.depthWrite = solid > 0.98; });
    ecgMat.uniforms.uGlow.value = S.glow * solid; ecgMesh.visible = solid > 0.04;
    inner.intensity = 4 + S.glow * 4;
    gems.forEach((g, i) => { g.m.emissiveIntensity = 0.35 + S.jewel * (0.35 + 0.2 * Math.sin(t * 2.4 + i)) + S.face * Math.max(0, 1 - Math.abs(S.who - i) * 1.6) * 1.4; });
    dust.rotation.y = t * 0.01;
    // jewel name tags: screen position and visibility for each
    const tags = gems.map((gm) => {
      gm.g.getWorldPosition(tmp); const facing = tmp.clone().sub(crown.position).normalize().dot(camera.position.clone().sub(tmp).normalize());
      tmp.project(camera); const px = (tmp.x + 1) / 2 * W, edge = Math.max(0, Math.min(1, (Math.min(px, W - px) - 50) / 40));
      return [px, (1 - tmp.y) / 2 * H, tagVis * edge * Math.max(0, Math.min(1, facing * 3))];
    });
    composer.render();
    return tags;
  }
  // prepare the graphics programs, draw once, then make the remaining icons
  async function warm() {
    if (renderer.compileAsync) { try { await renderer.compileAsync(scene, camera); } catch (e) { /* compiled on first frame instead */ } }
    [2, 3, 4, 5].forEach((i, k) => setTimeout(() => figAt(i), 600 + k * 250));
  }
  return { resize, render, warm };
}
