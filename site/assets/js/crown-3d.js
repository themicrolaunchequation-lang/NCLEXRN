/* Healthcare Crown Academy: the 3D crown hero (Three.js + GSAP ScrollTrigger, both self-hosted).
   A gold crown with an engraved heartbeat, six app jewels and six points (no cross). Scroll story:
   0 hero · 1 one band (one account) · 2 six jewels (six apps) · 3 the heartbeat (care at the core) · 4 earn your crown (burst and reassemble).
   Text is real HTML; the canvas is decoration. Reduced motion or no WebGL keeps the still poster. */
import * as THREE from '../vendor/three/three.module.min.js';
import { RoomEnvironment } from '../vendor/three/addons/RoomEnvironment.js';
import { MeshSurfaceSampler } from '../vendor/three/addons/MeshSurfaceSampler.js';
import { EffectComposer } from '../vendor/three/addons/EffectComposer.js';
import { RenderPass } from '../vendor/three/addons/RenderPass.js';
import { UnrealBloomPass } from '../vendor/three/addons/UnrealBloomPass.js';
import { OutputPass } from '../vendor/three/addons/OutputPass.js';

const root = document.querySelector('[data-cx]');
const canvas = root && root.querySelector('.cx-canvas');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function still() { root && root.classList.add('cx-still'); }

(function start() {
  if (!root || !canvas || reduce || !window.gsap || !window.ScrollTrigger) return still();
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); } catch (e) { return still(); }
  const gsap = window.gsap; gsap.registerPlugin(window.ScrollTrigger);
  const small = Math.min(innerWidth, innerHeight) < 700;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#050b1c');
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  // lights: warm key, cool academy-blue rim, gold glow inside the crown
  const key = new THREE.DirectionalLight('#ffe9c4', 1.5); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight('#6f8cff', 2.2); rim.position.set(-4, 2, -3); scene.add(rim);
  const inner = new THREE.PointLight('#ffcf73', 2, 2.4, 2); inner.position.set(0, 0.25, 0); scene.add(inner);

  /* ---------- the crown ---------- */
  const crown = new THREE.Group(); scene.add(crown);
  const gold = new THREE.MeshPhysicalMaterial({ color: '#c99a3e', metalness: 1, roughness: 0.3, clearcoat: 0.25, clearcoatRoughness: 0.35, transparent: true });
  const goldDark = new THREE.MeshPhysicalMaterial({ color: '#6e4e17', metalness: 1, roughness: 0.55, transparent: true, side: THREE.DoubleSide });
  const pearlM = new THREE.MeshPhysicalMaterial({ color: '#efe4cc', metalness: 0, roughness: 0.38, clearcoat: 0.4, transparent: true });

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
    const m = new THREE.MeshPhysicalMaterial({ color: app[2], metalness: 0.05, roughness: 0.06, clearcoat: 1, ior: 2.2, emissive: new THREE.Color(app[2]), emissiveIntensity: 0.1, flatShading: true, transparent: true });
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
    const tip = new THREE.Mesh(new THREE.SphereGeometry(front ? 0.06 : 0.034, 24, 18), front ? new THREE.MeshPhysicalMaterial({ color: '#f6dfa4', metalness: 0.3, roughness: 0.12, clearcoat: 1, emissive: new THREE.Color('#e8c170'), emissiveIntensity: 0.25, transparent: true }) : pearlM);
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
  const pU = { uBurst: { value: 0 }, uShow: { value: 0 }, uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() } };
  const pMat = new THREE.ShaderMaterial({ uniforms: pU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute vec3 aDir,aCol; attribute float aRnd; uniform float uBurst,uTime,uPx; varying vec3 vC; varying float vA;
      void main(){ float b=smoothstep(0.,1.,clamp(uBurst*1.2-aRnd*0.2,0.,1.)); vec3 p=position+aDir*b*0.95;
        p.x+=sin(uTime*.7+aRnd*20.)*0.04*b; p.y+=cos(uTime*.6+aRnd*17.)*0.04*b;
        vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; gl_PointSize=min(uPx*4.5,uPx*(1.6+aRnd*1.8)*(5.2/-mv.z)); vC=aCol; vA=0.55+0.45*aRnd; }`,
    fragmentShader: 'uniform float uShow; varying vec3 vC; varying float vA; void main(){ float r=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,r); gl_FragColor=vec4(vC*1.6*a*vA*uShow,a*vA*uShow); }' });
  const cloud = new THREE.Points(pg, pMat); cloud.renderOrder = 11; crown.add(cloud);

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

  /* ---------- the scroll story ---------- */
  const S = { x: small ? 0 : 1.15, y: small ? 0.75 : -0.05, rot: -0.35, tilt: 0.22, dist: 5.6, camY: 1.15, burst: 0, glow: 0.35, jewel: 0, solid: 1 };
  const fade = (sel, o) => gsap.to(root.querySelectorAll(sel), { autoAlpha: o, y: o ? 0 : -24, duration: 0.4, ease: 'power2.out' });
  const steps = [...root.querySelectorAll('[data-step]')];
  steps.forEach((el, i) => { if (i) gsap.set(el, { autoAlpha: 0, y: 24 }); });
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut', duration: 1 },
    scrollTrigger: { trigger: root, start: 'top top', end: () => '+=' + innerHeight * (small ? 4 : 4.6), scrub: 0.8, pin: root.querySelector('.cx-pin'), anticipatePin: 1,
      onUpdate: (st) => { const s = Math.round(st.progress * 4); root.querySelectorAll('[data-cx-nav]').forEach((b, i) => b.classList.toggle('is-on', i === s)); } } });
  const show = (i, at) => { tl.to(steps.filter((_, k) => k !== i), { autoAlpha: 0, y: -24, duration: 0.3 }, at); tl.to(steps[i], { autoAlpha: 1, y: 0, duration: 0.4 }, at + '+=0.3'); };
  // 1 · one band
  tl.addLabel('s1').to(S, { x: small ? 0 : 1.1, y: small ? 0.72 : -0.1, rot: 0.9, tilt: 0.5, dist: 5.0, camY: 2.0 }, 's1'); show(1, 's1');
  // 2 · six jewels
  tl.addLabel('s2').to(S, { x: small ? 0 : 1.05, y: small ? 0.72 : -0.05, rot: 0.9 + Math.PI * 1.05, tilt: 0.1, dist: 4.6, camY: 0.75, jewel: 1 }, 's2'); show(2, 's2');
  // 3 · the heartbeat
  tl.addLabel('s3').to(S, { x: small ? 0 : 0.8, y: small ? 0.5 : 0, rot: 0.9 + Math.PI * 1.6, tilt: 0.0, dist: 3.7, camY: 0.3, jewel: 0.3, glow: 1.4 }, 's3'); show(3, 's3');
  // 4 · earn your crown: burst into gold, hold, then come back together
  tl.addLabel('s4').to(S, { x: small ? 0 : 1.25, y: small ? 0.75 : -0.02, rot: 0.9 + Math.PI * 2.25, tilt: 0.24, dist: 5.4, camY: 1.2, glow: 0.5, jewel: 0.6, duration: 1.2 }, 's4')
    .to(S, { burst: 1, solid: 0, duration: 0.4, ease: 'power3.out' }, 's4')
    .to(S, { burst: 0, solid: 1, duration: 0.5, ease: 'power3.inOut' }, 's4+=0.6'); show(4, 's4');
  tl.to({}, { duration: 0.25 });
  root.querySelectorAll('[data-cx-nav]').forEach((b, i) => b.addEventListener('click', () => {
    const st = tl.scrollTrigger; scrollTo({ top: st.start + (st.end - st.start) * i / 4, behavior: 'smooth' });
  }));

  /* ---------- labels that follow the jewels ---------- */
  const tags = [...root.querySelectorAll('[data-gem]')];
  const tmp = new THREE.Vector3();

  /* ---------- size and frame loop ---------- */
  let W = 0, H = 0;
  function resize() {
    W = root.clientWidth; H = innerHeight;
    renderer.setSize(W, H, false); composer.setSize(W, H); bloom.resolution.set(W / 2, H / 2);
    camera.aspect = W / H; camera.updateProjectionMatrix(); pU.uPx.value = renderer.getPixelRatio() * (H / 900);
  }
  addEventListener('resize', resize);
  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth - 0.5); ty = (e.clientY / innerHeight - 0.5); }, { passive: true });
  const clock = new THREE.Clock(); let running = true;
  new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) renderer.setAnimationLoop(frame); else renderer.setAnimationLoop(null); }).observe(root);
  const header = document.querySelector('[data-header]'), after = document.getElementById('after');
  const darkHeader = () => header && header.classList.toggle('cs-over', (after || root).getBoundingClientRect().bottom > 80);
  addEventListener('scroll', darkHeader, { passive: true }); darkHeader();
  function frame() {
    const t = clock.getElapsedTime();
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    const k = camera.aspect < 0.95 ? Math.min(2.1, 0.92 / camera.aspect) : 1;   // narrow screens: pull back, crown in the top half
    crown.position.set(S.x, S.y * k, 0);
    crown.rotation.set(S.tilt + my * 0.08, S.rot + t * 0.12 + mx * 0.25, 0);
    camera.position.set(Math.sin(mx * 0.2) * 0.3, S.camY * k, S.dist * k); camera.lookAt(S.x * 0.35, (S.y + 0.1) * (k > 1 ? 0.2 : 1), 0);
    ecgU.uTime.value = t; ecgU.uGlow.value = S.glow;
    pU.uTime.value = t; pU.uBurst.value = S.burst; pU.uShow.value = Math.min(1, S.burst * 3);
    const solid = S.solid;
    [gold, goldDark, pearlM, ...gems.map((g) => g.m), points[0].children[1].material].forEach((m) => { m.opacity = solid; m.depthWrite = solid > 0.98; });
    ecgMat.uniforms.uGlow.value = S.glow * solid; ecgMesh.visible = solid > 0.04;
    inner.intensity = 4 + S.glow * 4;
    gems.forEach((g, i) => { g.m.emissiveIntensity = 0.1 + S.jewel * (0.35 + 0.2 * Math.sin(t * 2.4 + i)); });
    dust.rotation.y = t * 0.01;
    // jewel name tags
    const vis = Math.max(0, 1 - Math.abs(tl.time() - tl.labels.s2 - 0.6) * 1.4);
    tags.forEach((el, i) => {
      const g = gems[i].g; g.getWorldPosition(tmp); const facing = tmp.clone().sub(crown.position).normalize().dot(camera.position.clone().sub(tmp).normalize());
      tmp.project(camera); const o = vis * Math.max(0, Math.min(1, facing * 3));
      el.style.transform = `translate(${((tmp.x + 1) / 2 * W).toFixed(1)}px,${((1 - tmp.y) / 2 * H).toFixed(1)}px)`;
      el.style.opacity = o.toFixed(3); el.style.visibility = o < 0.02 ? 'hidden' : 'visible';
    });
    composer.render();
  }
  resize(); root.classList.add('cx-live'); renderer.setAnimationLoop(frame);
  requestAnimationFrame(() => { root.classList.add('cx-ready'); window.ScrollTrigger.refresh(); });
})();
