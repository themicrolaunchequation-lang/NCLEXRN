// Builds the timeline for one film from films.js + the voice paragraph times, and assembles the placed voice track.
// Usage: node tools/build.js <app> <50|180>
// Writes timeline/<app>-<len>.json and voice/<app>-<len>-placed.wav (48 kHz stereo, processed).
// Section anchors match MUSIC-PROMPTS.md: 50 s drop at 14 s, montage hit at 38 s, outro 44 s; 3 min drop at 23 s, peak 160 s, outro 170 s.
const F = require('../films.js'), fs = require('fs'), { execSync } = require('child_process');
const [app, L] = process.argv.slice(2), len = Number(L), a = F[app];
const paras = a[len === 50 ? 'film50' : 'film180'];
const vt = JSON.parse(fs.readFileSync(`voice/${app}-${L}-times.json`));
if (vt.paras.length !== paras.length) throw new Error(`paragraph mismatch ${vt.paras.length} vs ${paras.length}`);
const clipsInfo = JSON.parse(fs.readFileSync(`voice/${app}-${L}-clips.json`));
const vlen = clipsInfo.lens;
const total = len;
const A = len === 50
  ? { open: 0.6, worry: 8.0, logo: 14.0, screens: 16.6, montage: 38.0, offer: 44.0, end: 50 }
  : { open: 0.8, worry: 14.0, logo: 23.0, chapters: [26.0, 158.5], stats: 160.0, offer: 170.0, end: 180 };
const beats = [];
let prevEnd = 0;
const chapterIdx = paras.map((p, i) => p.beat === 'chapter' ? i : -1).filter(i => i >= 0);
paras.forEach((p, i) => {
  const b = { ...p, i };
  let start;
  if (p.beat === 'open') start = A.open;
  else if (p.beat === 'worry') start = Math.max(A.worry, prevEnd + 0.5);
  else if (p.beat === 'turn') { b.logo = Math.max(A.logo, prevEnd + 1.6); start = Math.max(prevEnd + 0.6, b.logo + 1.4 - vlen[i]); }
  else if (p.beat === 'screens') start = Math.max(A.screens, prevEnd + 0.6);
  else if (p.beat === 'montage') start = Math.max(A.montage - (len === 50 ? 0.8 : 0), prevEnd + 0.5);
  else if (p.beat === 'chapter') {
    const k = chapterIdx.indexOf(i), n = chapterIdx.length, [c0, c1] = A.chapters, step = (c1 - c0) / n;
    b.card = Math.max(c0 + k * step, prevEnd + 0.5); b.slotEnd = c0 + (k + 1) * step;
    start = b.card + 2.2;
  } else if (p.beat === 'stats') start = Math.max(A.stats + 0.6, prevEnd + 0.6);
  else if (p.beat === 'offer') start = Math.max(A.offer + 0.4, prevEnd + 0.6);
  b.vStart = +start.toFixed(3); b.vEnd = +(start + vlen[i]).toFixed(3); prevEnd = b.vEnd;
  beats.push(b);
});
// visual windows: each beat runs from its visual start to the next beat's visual start
const vis = b => b.beat === 'chapter' ? b.card : b.beat === 'turn' ? Math.min(b.vStart, b.logo - 1.2) - 0.3 : b.beat === 'open' ? 0 : b.beat === 'montage' ? (len === 50 ? A.montage : b.vStart - 0.3) : b.beat === 'stats' ? A.stats : b.beat === 'offer' ? A.offer : b.vStart - 0.4;
beats.forEach((b, i) => { b.t0 = +Math.max(0, vis(b)).toFixed(3); });
beats.forEach((b, i) => { b.t1 = i + 1 < beats.length ? beats[i + 1].t0 : total; });
const last = beats[beats.length - 1];
if (last.vEnd > total - 0.6) console.warn(`WARNING ${app}-${L}: voice ends at ${last.vEnd}s`);
// end card starts part way into the offer beat
last.endCard = +(Math.max(last.t0 + 2.6, Math.min(last.vStart + 1.2, total - 5.5))).toFixed(3);
const imgsAll = [...new Set(beats.flatMap(b => (b.imgs || []).map(x => Array.isArray(x) ? x[0] : x)).concat(a.openImgs))];
const out = { app, len, total, name: a.name, full: a.full || a.name, short: a.short || a.name, color: a.color, accent: a.accent, url: a.url, tagline: a.tagline,
  open: a.open, worry: a.worry, end: a.end, endings: a.endings, chapters: beats.filter(b => b.beat === 'chapter').map(b => ({ title: b.title, icon: b.icon })), beats, imgs: imgsAll };
fs.mkdirSync('timeline', { recursive: true });
fs.writeFileSync(`timeline/${app}-${L}.json`, JSON.stringify(out, null, 1));
// captions (SRT): each paragraph split into sentences, timed by character share
const srt = []; let n = 1;
const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, ss = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
beats.forEach(b => {
  const sents = b.say.match(/[^.?!]+[.?!]+/g) || [b.say]; const chars = sents.reduce((s, x) => s + x.length, 0); let t = b.vStart;
  sents.forEach(s => { const d = (b.vEnd - b.vStart) * s.length / chars; srt.push(`${n++}\n${ts(t)} --> ${ts(t + d)}\n${s.trim()}\n`); t += d; });
});
fs.mkdirSync('captions', { recursive: true });
fs.writeFileSync(`captions/${app}-${L}.srt`, srt.join('\n'));
// placed voice track
const inputs = [], filters = [];
beats.forEach((b, i) => {
  filters.push(`[${i}:a]aresample=24000,afade=t=in:d=0.02,afade=t=out:st=${Math.max(0, vlen[i] - 0.04)}:d=0.04,adelay=${Math.round(b.vStart * 1000)}|${Math.round(b.vStart * 1000)}[v${i}]`);
});
const mix = beats.map((_, i) => `[v${i}]`).join('') + `amix=inputs=${beats.length}:normalize=0,apad=whole_dur=${total},atrim=0:${total}`;
const chain = 'highpass=f=80,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1.2:g=2.5,deesser=i=0.4,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=3';
execSync(`ffmpeg -y -loglevel error ${beats.map((_, i) => `-i voice/clips/${app}-${L}-${i}.wav`).join(' ')} -filter_complex "${filters.join(';')};${mix},aresample=48000,${chain},pan=stereo|c0=c0|c1=c0[out]" -map "[out]" voice/${app}-${L}-placed.wav`);
console.log(app, L, beats.map(b => `${b.beat}@${b.t0}${b.logo ? '/logo' + b.logo : ''}(v${b.vStart}-${b.vEnd})`).join(' '));
