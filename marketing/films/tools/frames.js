// Usage: node tools/frames.js <app-len> <16x9|9x16> <out.mp4> [ending] [t0] [t1]
// Renders frames t0..t1 (seconds) with Playwright and pipes them into ffmpeg (silent H.264, 30 fps).
// Or: node tools/frames.js <app-len> <ar> --stills <dir> t1,t2,...  -> PNG stills for checking.
const { chromium } = require('playwright'), { spawn } = require('child_process'), fs = require('fs');
const [film, ar, out, a4, a5, a6] = process.argv.slice(2);
const [W, H] = ar === '9x16' ? [1080, 1920] : [1920, 1080];
(async () => {
  const b = await chromium.launch({ args: ['--disable-gpu-vsync', '--force-color-profile=srgb'] });
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  const stills = out === '--stills';
  const ending = stills ? 'before' : (a4 || 'before');
  await p.goto(`http://127.0.0.1:8790/NCLEXRN/marketing/films/tools/render.html?film=${film}&ending=${ending}`);
  const { total } = await p.evaluate(() => window.ready);
  if (stills) {
    fs.mkdirSync(a4, { recursive: true });
    for (const t of a5.split(',').map(Number)) { await p.evaluate(t => render(t), t); await p.screenshot({ path: `${a4}/${film}-${ar}-${String(t).padStart(5, '0')}.png` }); }
    await b.close(); return;
  }
  const t0 = Number(a5 || 0), t1 = Number(a6 || total), fps = 30;
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const f0 = Math.round(t0 * fps), f1 = Math.round(t1 * fps); let last = Date.now();
  for (let f = f0; f < f1; f++) {
    await p.evaluate(t => render(t), f / fps);
    const buf = await p.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 300 === 0) { console.log(film, ar, ending, `${((f - f0) / (f1 - f0) * 100).toFixed(0)}%`, `${(300 / ((Date.now() - last) / 1000)).toFixed(1)} fps`); last = Date.now(); }
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
})();
