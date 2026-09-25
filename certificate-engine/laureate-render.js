/*!
 * Laureate certificate renderer — draws the Lean Six Sigma "Laureate" certificate on a canvas.
 * No dependencies. Exposes window.LaureateCertificate (also module.exports when bundled).
 *
 *   await LaureateCertificate.loadFonts();                      // once, before the first draw
 *   const canvas = await LaureateCertificate.renderToCanvas(data, 3);   // 3369 x 2382 px
 *   LaureateCertificate.draw(ctx, data, scale);                 // draw into your own canvas (W*scale x H*scale)
 *
 * data: see LaureateCertificate.DEFAULTS. data.logo may be an image URL, data: URL, Blob/File,
 * HTMLImageElement, ImageBitmap or canvas; renderToCanvas() resolves URLs/Blobs for you.
 */
(function (root) {
'use strict';
const W = 1123, H = 794;
const NAVY = '#1B2740', GOLD = '#A8864A', PAPER = '#F6F1E5';
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const BELTS = {
  'Yellow':       { name:'Yellow Belt',       code:'YB',  color:'#D9A91F', ink:'#1A1406', stitch:'rgba(26,20,6,0.5)' },
  'Green':        { name:'Green Belt',        code:'GB',  color:'#245A3D', ink:'#F4EBD6', stitch:'rgba(244,235,214,0.5)' },
  'Black':        { name:'Black Belt',        code:'BB',  color:'#0B0B0B', ink:'#D4B26A', stitch:'rgba(212,178,106,0.6)' },
  'Master Black': { name:'Master Black Belt', code:'MBB', color:'#0B0B0B', ink:'#D4B26A', stitch:'rgba(212,178,106,0.6)' }
};
const DEFAULTS = {
  name:'Alexandra M. Reynolds', belt:'Green', date:'2026-09-25', cred:'LSS-GB-2026-04718',
  institute:'Aurelian Institute of Process Excellence', subtitle:'of Professional Certification',
  statement:'having fulfilled every requirement of the program, including the certification examination and a completed DMAIC improvement project, is hereby recognized as a certified practitioner of',
  verify:'aurelian.example/verify',
  sig1Script:'Helena Voss', sig1Name:'Dr. Helena Voss', sig1Title:'Director of Certification',
  sig2Script:'M. Adeyemi', sig2Name:'Marcus Adeyemi, MBB', sig2Title:'Chair, Examination Board',
  seal:true, sealTop:'LEAN SIX SIGMA', sealBottom:'GENUINE · CERTIFIED', sealLine1:'OFFICIAL', sealLine2:'CERTIFIED',
  hanko:true, hankoText:'認定',
  logo:null, sealLogo:false
};

const rad = (d) => d * Math.PI / 180;
function fmtDate(iso){
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return iso || '';
  return (+m[3]) + ' ' + MONTHS[+m[2]-1] + ' ' + m[1];
}
function yearOf(iso){ const m = /^(\d{4})/.exec(iso || ''); return m ? m[1] : String(new Date().getFullYear()); }
function beltOf(d){ return BELTS[d.belt] || BELTS['Green']; }
function autoCred(belt, iso, serial){ return 'LSS-' + (BELTS[belt]||BELTS.Green).code + '-' + yearOf(iso) + '-' + String(serial).padStart(5,'0'); }
function slug(s){ return (s||'certificate').normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'certificate'; }
function spacedWidth(ctx, t, sp){ let w = 0; const cs = [...t]; for (const c of cs) w += ctx.measureText(c).width; return w + sp * Math.max(0, cs.length - 1); }
function drawSpaced(ctx, t, x, y, sp, align){
  const w = spacedWidth(ctx, t, sp);
  let cx = align === 'center' ? x - w/2 : align === 'right' ? x - w : x;
  ctx.textAlign = 'left';
  for (const c of [...t]) { ctx.fillText(c, cx, y); cx += ctx.measureText(c).width + sp; }
  return w;
}
function fitSize(ctx, t, fontFn, size, maxW, min, sp){
  let s = size;
  for (; s > min; s -= 1) { ctx.font = fontFn(s); if ((sp ? spacedWidth(ctx, t, sp(s)) : ctx.measureText(t).width) <= maxW) break; }
  ctx.font = fontFn(s); return s;
}
function wrap(ctx, text, maxW){
  const words = (text||'').split(/\s+/).filter(Boolean); const lines = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line); return lines;
}
function rrect(ctx, x, y, w, h, r){
  ctx.beginPath(); ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h); ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r); ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y); ctx.closePath();
}
function ellipseAt(ctx, cx, cy, rx, ry, rotDeg){ ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, rad(rotDeg), 0, Math.PI*2); ctx.stroke(); }

function isDrawable(x){
  return !!x && typeof x === 'object' && (('naturalWidth' in x && x.naturalWidth > 0) || ('width' in x && x.width > 0 && !('naturalWidth' in x)));
}
function drawContain(ctx, img, x, y, w, h, align){
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height; if (!iw || !ih) return;
  const k = Math.min(w / iw, h / ih), dw = iw * k, dh = ih * k;
  const dx = align === 'left' ? x : x + (w - dw) / 2;
  ctx.drawImage(img, dx, y + (h - dh) / 2, dw, dh);
}

/* ---------- certificate renderer (1123 × 794 logical units) ---------- */
const CURVE = 'M0 180 C 150 180 225 168 275 120 C 315 72 345 12 380 12 C 415 12 445 72 485 120 C 535 168 610 180 760 180';

function drawCertificate(ctx, d, s){
  const belt = beltOf(d);
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.textBaseline = 'alphabetic';

  // paper + crosshatch
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(27,39,64,0.028)'; ctx.beginPath();
  for (let x = -H; x < W; x += 6) { ctx.moveTo(x, H); ctx.lineTo(x + H, 0); } ctx.stroke();
  ctx.strokeStyle = 'rgba(168,134,74,0.035)'; ctx.beginPath();
  for (let x = -H; x < W; x += 6) { ctx.moveTo(x, 0); ctx.lineTo(x + H, H); } ctx.stroke();

  // guilloche rosette watermark
  ctx.save(); ctx.strokeStyle = 'rgba(27,39,64,0.055)'; ctx.lineWidth = 0.8;
  for (let k = 0; k < 12; k++) ellipseAt(ctx, 561, 400, 300, 96, k*15);
  ctx.beginPath(); ctx.arc(561, 400, 300, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(561, 400, 306, 0, Math.PI*2); ctx.stroke();
  ctx.restore();

  // engraved bell curve with spec limits
  ctx.save(); ctx.translate(181, 238);
  const curve = new Path2D(CURVE);
  [[0,0.28,1.2],[5,0.18,0.8],[10,0.12,0.8],[15,0.08,0.8]].forEach(([dy,a,lw]) => {
    ctx.save(); ctx.translate(0, dy); ctx.strokeStyle = 'rgba(168,134,74,'+a+')'; ctx.lineWidth = lw; ctx.stroke(curve); ctx.restore();
  });
  ctx.setLineDash([3,4]); ctx.strokeStyle = 'rgba(168,134,74,0.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(38, 40); ctx.lineTo(38, 196); ctx.moveTo(722, 40); ctx.lineTo(722, 196); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();

  // guilloche frame band
  ctx.save();
  ctx.beginPath(); ctx.rect(22, 22, 1079, 750); ctx.rect(46, 46, 1031, 702); ctx.clip('evenodd');
  const waves = (y0, amp, color, lw, inv) => {
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath();
    for (let oy = 22; oy < 772; oy += 16) {
      const y = oy + y0; ctx.moveTo(22, y);
      for (let x = 22; x < 1101; x += 22) {
        ctx.quadraticCurveTo(x + 5.5, y + (inv ? amp : -amp), x + 11, y);
        ctx.quadraticCurveTo(x + 16.5, y + (inv ? -amp : amp), x + 22, y);
      }
    }
    ctx.stroke();
  };
  waves(8, 8, 'rgba(27,39,64,0.8)', 0.7, false);
  waves(8, 8, 'rgba(27,39,64,0.8)', 0.7, true);
  waves(4, 8, GOLD, 0.5, true);
  waves(12, 8, GOLD, 0.5, false);
  ctx.restore();
  ctx.strokeStyle = NAVY; ctx.lineWidth = 1.5; ctx.strokeRect(22, 22, 1079, 750);
  ctx.lineWidth = 1; ctx.strokeRect(46, 46, 1031, 702);
  ctx.strokeStyle = GOLD; ctx.lineWidth = 0.8; ctx.strokeRect(54, 54, 1015, 686);
  [[46,46],[1077,46],[46,748],[1077,748]].forEach(([x,y]) => {
    ctx.fillStyle = PAPER; ctx.strokeStyle = GOLD; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = NAVY; ctx.lineWidth = 0.6;
    [0,45,90,135].forEach(r => ellipseAt(ctx, x, y, 13, 4.5, r));
  });

  // belt sash across the top-right corner
  ctx.save(); ctx.translate(1010, 110); ctx.rotate(rad(45));
  ctx.shadowColor = 'rgba(27,39,64,0.3)'; ctx.shadowBlur = 14 * s; ctx.shadowOffsetY = 6 * s;
  ctx.fillStyle = belt.color; ctx.fillRect(-210, -28, 420, 56);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-210, -27.5); ctx.lineTo(210, -27.5); ctx.moveTo(-210, 27.5); ctx.lineTo(210, 27.5); ctx.stroke();
  ctx.setLineDash([3,3]); ctx.strokeStyle = belt.stitch;
  ctx.beginPath(); ctx.moveTo(-210, -20.5); ctx.lineTo(210, -20.5); ctx.moveTo(-210, 20.5); ctx.lineTo(210, 20.5); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = belt.ink;
  const sashSize = fitSize(ctx, belt.name.toUpperCase(), (z) => '700 ' + z + 'px Cinzel, Georgia, serif', 14, 270, 9, (z) => z * 0.22);
  drawSpaced(ctx, belt.name.toUpperCase(), 0, 5, sashSize * 0.22, 'center');
  ctx.restore();

  // issuer logo, top-left inside the frame
  if (isDrawable(d.logo) && !d.sealLogo) drawContain(ctx, d.logo, 84, 76, 150, 84, 'left');

  // header
  const CX = 561;
  ctx.fillStyle = NAVY;
  const instSize = fitSize(ctx, d.institute, (z) => '600 ' + z + 'px Cinzel, Georgia, serif', 14, 600, 9, (z) => z * 0.36);
  drawSpaced(ctx, d.institute, CX, 91, instSize * 0.36, 'center');

  ctx.strokeStyle = GOLD; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(CX-130, 112); ctx.lineTo(CX-18, 112); ctx.moveTo(CX+18, 112); ctx.lineTo(CX+130, 112); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(CX, 105); ctx.lineTo(CX+7, 112); ctx.lineTo(CX, 119); ctx.lineTo(CX-7, 112); ctx.closePath(); ctx.stroke();
  ctx.fillStyle = GOLD;
  [[CX,2],[CX-14,1.2],[CX+14,1.2]].forEach(([x,r]) => { ctx.beginPath(); ctx.arc(x, 112, r, 0, Math.PI*2); ctx.fill(); });

  hatchedTitle(ctx, 'Certificate', CX, 192, s);

  ctx.fillStyle = '#7A6232';
  const subSize = fitSize(ctx, d.subtitle, (z) => '500 ' + z + 'px Cinzel, Georgia, serif', 15, 640, 9, (z) => z * 0.4);
  drawSpaced(ctx, d.subtitle, CX, 225, subSize * 0.4, 'center');

  ctx.fillStyle = '#3A4760'; ctx.font = 'italic 400 20px "Cormorant Garamond", Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText('This is to certify that', CX, 265);

  // recipient name + double rule
  ctx.fillStyle = NAVY;
  fitSize(ctx, d.name, (z) => '500 ' + z + 'px "Cormorant Garamond", Georgia, serif', 60, 715, 30);
  ctx.textAlign = 'center'; ctx.fillText(d.name, CX, 326);
  const nw = Math.min(803, ctx.measureText(d.name).width + 88);
  ctx.fillStyle = GOLD; ctx.fillRect(CX - nw/2, 342, nw, 1); ctx.fillRect(CX - nw/2, 344.5, nw, 1);

  // statement
  let bs = 18, lines;
  for (; bs >= 14; bs -= 1) { ctx.font = '400 ' + bs + 'px "Cormorant Garamond", Georgia, serif'; lines = wrap(ctx, d.statement, 670); if (lines.length <= 4) break; }
  lines = lines.slice(0, 6);
  const lh = bs * 1.5;
  ctx.fillStyle = '#2E3A52'; ctx.textAlign = 'center';
  lines.forEach((l, i) => ctx.fillText(l, CX, 378 + i * lh));
  const last = 378 + (lines.length - 1) * lh;

  // program line with belt swatch
  const beltY = Math.min(last + 44, 560);
  let ps = 27;
  const pf = (z) => '600 ' + z + 'px Cinzel, Georgia, serif';
  for (; ps > 16; ps -= 1) { ctx.font = pf(ps); if (spacedWidth(ctx,'Lean Six Sigma',ps*.1) + spacedWidth(ctx,belt.name,ps*.1) + 62 <= 800) break; }
  ctx.font = pf(ps);
  const w1 = spacedWidth(ctx, 'Lean Six Sigma', ps*.1), w2 = spacedWidth(ctx, belt.name, ps*.1);
  const x0 = CX - (w1 + 62 + w2) / 2;
  ctx.fillStyle = NAVY; drawSpaced(ctx, 'Lean Six Sigma', x0, beltY, ps*.1, 'left');
  ctx.fillStyle = belt.color; ctx.fillRect(x0 + w1 + 14, beltY - ps*0.52, 34, 9);
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1; ctx.strokeRect(x0 + w1 + 14.5, beltY - ps*0.52 + .5, 33, 8);
  ctx.fillStyle = NAVY; drawSpaced(ctx, belt.name, x0 + w1 + 62, beltY, ps*.1, 'left');

  // signatures
  sigBlock(ctx, 295, d.sig1Script, d.sig1Name, d.sig1Title);
  sigBlock(ctx, 625, d.sig2Script, d.sig2Name, d.sig2Title);
  if (d.hanko && (d.hankoText||'').trim()) hanko(ctx, 417, 595, [...d.hankoText.trim()].slice(0,4));

  if (d.seal) { ctx.save(); ctx.translate(832, 546); ctx.scale(0.89, 0.89); drawSeal(ctx, d); ctx.restore(); }

  // footer
  ctx.fillStyle = '#3A4760'; ctx.font = '500 12px Cinzel, Georgia, serif';
  drawSpaced(ctx, 'Credential No. ' + d.cred, 110, 724, 1.92, 'left');
  drawSpaced(ctx, 'Conferred ' + fmtDate(d.date), 561, 724, 1.92, 'center');
  drawSpaced(ctx, 'Verify · ' + d.verify, 1013, 724, 1.92, 'right');
}

function hatchedTitle(ctx, text, cx, baseline, s){
  const font = 'italic 600 84px "Cormorant Garamond", Georgia, serif';
  ctx.font = font; const w = ctx.measureText(text).width; const pad = 24, hh = 120;
  const oc = document.createElement('canvas'); oc.width = Math.ceil((w + pad*2) * s); oc.height = Math.ceil(hh * s);
  const o = oc.getContext('2d'); o.scale(s, s);
  o.fillStyle = '#3E4C6E'; o.fillRect(0, 0, w + pad*2, hh);
  o.fillStyle = NAVY; for (let y = 0; y < hh; y += 2.4) o.fillRect(0, y, w + pad*2, 1.2);
  o.globalCompositeOperation = 'destination-in';
  o.font = font; o.textBaseline = 'alphabetic'; o.fillStyle = '#000'; o.fillText(text, pad, 95);
  ctx.save(); ctx.font = font; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(168,134,74,0.35)';
  ctx.fillText(text, cx - w/2 + 1, baseline + 1); ctx.restore();
  ctx.drawImage(oc, cx - w/2 - pad, baseline - 95, w + pad*2, hh);
}

function sigBlock(ctx, cx, script, name, title){
  ctx.fillStyle = NAVY; ctx.textAlign = 'center';
  fitSize(ctx, script || '', (z) => z + 'px "Pinyon Script", cursive', 36, 270, 18);
  ctx.fillText(script || '', cx, 630);
  ctx.fillRect(cx - 145, 640.5, 290, 1);
  ctx.fillStyle = '#2E3A52';
  fitSize(ctx, name || '', (z) => '400 ' + z + 'px "Cormorant Garamond", Georgia, serif', 16, 290, 11);
  ctx.fillText(name || '', cx, 662);
  fitSize(ctx, title || '', (z) => '400 ' + z + 'px "Cormorant Garamond", Georgia, serif', 16, 290, 11);
  ctx.fillText(title || '', cx, 683);
}

function hanko(ctx, cx, cy, chars){
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rad(-6)); ctx.globalAlpha = 0.88;
  ctx.fillStyle = '#A8322D'; rrect(ctx, -29, -29, 58, 58, 5); ctx.fill();
  ctx.strokeStyle = PAPER; ctx.lineWidth = 1.5; rrect(ctx, -24.25, -24.25, 48.5, 48.5, 2); ctx.stroke();
  ctx.fillStyle = PAPER; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (chars.length <= 2) {
    ctx.font = '700 ' + (chars.length === 1 ? 30 : 19) + 'px "Shippori Mincho", serif';
    if (chars.length === 1) ctx.fillText(chars[0], 0, 1);
    else { ctx.fillText(chars[0], 0, -9.5); ctx.fillText(chars[1], 0, 10.5); }
  } else {
    ctx.font = '700 15px "Shippori Mincho", serif';
    const pos = [[9,-9],[9,9],[-9,-9],[-9,9]];
    chars.forEach((c, i) => ctx.fillText(c, pos[i][0], pos[i][1] + 1));
  }
  ctx.restore(); ctx.textBaseline = 'alphabetic';
}

/* holographic seal, drawn in a 200 × 200 box */
function starPath(){
  const p = new Path2D();
  for (let k = 0; k < 24; k++) {
    const a = rad(k*15 - 90), b = a + rad(7.5);
    const x1 = 100 + 97.5*Math.cos(a), y1 = 100 + 97.5*Math.sin(a);
    const x2 = 100 + 87*Math.cos(b), y2 = 100 + 87*Math.sin(b);
    if (k === 0) p.moveTo(x1, y1); else p.lineTo(x1, y1);
    p.lineTo(x2, y2);
  }
  p.closePath(); return p;
}
function arcText(ctx, text, r, top, sp){
  const cs = [...text]; const ws = cs.map(c => ctx.measureText(c).width);
  const total = ws.reduce((a,b) => a + b, 0) + sp * Math.max(0, cs.length - 1);
  const span = total / r;
  ctx.textAlign = 'center';
  let a = top ? -Math.PI/2 - span/2 : Math.PI/2 + span/2;
  cs.forEach((c, i) => {
    const mid = top ? a + (ws[i]/2)/r : a - (ws[i]/2)/r;
    ctx.save(); ctx.translate(100 + r*Math.cos(mid), 100 + r*Math.sin(mid));
    ctx.rotate(top ? mid + Math.PI/2 : mid - Math.PI/2);
    ctx.fillText(c, 0, 0); ctx.restore();
    a = top ? a + (ws[i] + sp)/r : a - (ws[i] + sp)/r;
  });
}
function starShape(ctx, cx, cy, r){
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = rad(-90 + i*36), rr = i % 2 ? r*0.45 : r; ctx.lineTo(cx + rr*Math.cos(a), cy + rr*Math.sin(a)); }
  ctx.closePath(); ctx.fill();
}
function drawSeal(ctx, d){
  const star = starPath();
  ctx.save(); ctx.translate(1.6, 2.6); ctx.fillStyle = 'rgba(95,99,108,0.25)'; ctx.fill(star); ctx.restore();
  ctx.save(); ctx.clip(star);
  const holo = ctx.createLinearGradient(12, 18, 188, 182);
  [['0','#E3E5EB'],['0.12','#C9E6F6'],['0.24','#F3D4E8'],['0.36','#F1EFC9'],['0.48','#CFEEDC'],['0.6','#D8D0F3'],['0.72','#ECEDF2'],['0.84','#C6E0F4'],['1','#F2D8E3']].forEach(([o,c]) => holo.addColorStop(+o, c));
  ctx.fillStyle = holo; ctx.fillRect(0, 0, 200, 200);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.35;
  [20,24,28,32,36,40,44,48,82,85,88,91,94].forEach(r => { ctx.beginPath(); ctx.arc(100, 100, r, 0, Math.PI*2); ctx.stroke(); });
  ctx.strokeStyle = 'rgba(158,163,174,0.3)';
  [0,30,60,90,120,150].forEach(r => ellipseAt(ctx, 100, 100, 46, 16, r));
  ctx.fillStyle = 'rgba(154,158,168,0.3)'; ctx.font = '500 12px Oswald, "Arial Narrow", sans-serif'; ctx.textAlign = 'left';
  [[44,150,'ORIGINAL'],[120,176,'ORIGINAL'],[118,60,'GENUINE']].forEach(([x,y,t]) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rad(-28)); ctx.fillText(t, 0, 0); ctx.restore(); });
  const sheen = ctx.createRadialGradient(84, 76, 0, 84, 76, 132);
  sheen.addColorStop(0, 'rgba(255,255,255,0.8)'); sheen.addColorStop(0.5, 'rgba(255,255,255,0.12)'); sheen.addColorStop(1, 'rgba(127,131,141,0.38)');
  ctx.fillStyle = sheen; ctx.fillRect(0, 0, 200, 200);
  const streak = ctx.createLinearGradient(0, 0, 200, 200);
  streak.addColorStop(0, 'rgba(255,255,255,0)'); streak.addColorStop(0.4, 'rgba(255,255,255,0)'); streak.addColorStop(0.5, 'rgba(255,255,255,0.7)'); streak.addColorStop(0.6, 'rgba(255,255,255,0)'); streak.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = streak; ctx.fillRect(0, 0, 200, 200);
  ctx.restore();

  ctx.strokeStyle = '#838792'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.arc(100, 100, 79, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(100, 100, 53, 0, Math.PI*2); ctx.stroke();

  ctx.fillStyle = '#696D77';
  const arcFont = (z) => '500 ' + z + 'px Oswald, "Arial Narrow", sans-serif';
  const top = (d.sealTop || '').toUpperCase(), bot = (d.sealBottom || '').toUpperCase();
  let z = 11.5; ctx.font = arcFont(z); while (z > 7 && spacedWidth(ctx, top, 1.6) > 62 * 2.4) { z -= 0.5; ctx.font = arcFont(z); }
  arcText(ctx, top, 62, true, 1.6);
  z = 11.5; ctx.font = arcFont(z); while (z > 7 && spacedWidth(ctx, bot, 1.6) > 71 * 2.4) { z -= 0.5; ctx.font = arcFont(z); }
  arcText(ctx, bot, 71, false, 1.6);

  ctx.fillStyle = '#7A7E88';
  for (let i = -2; i <= 2; i++) { starShape(ctx, 100 + i*9, 68, 3.2); starShape(ctx, 100 + i*9, 134, 3.2); }

  const emboss = (t, y) => {
    t = (t || '').toUpperCase(); let fz = 22;
    ctx.font = '700 ' + fz + 'px Oswald, "Arial Narrow", sans-serif';
    while (fz > 10 && spacedWidth(ctx, t, 0.5) > 94) { fz -= 1; ctx.font = '700 ' + fz + 'px Oswald, "Arial Narrow", sans-serif'; }
    ctx.fillStyle = '#FFFFFF'; drawSpaced(ctx, t, 100.8, y + 0.8, 0.5, 'center');
    ctx.fillStyle = '#4D515A'; drawSpaced(ctx, t, 99.4, y - 0.6, 0.5, 'center');
    ctx.fillStyle = '#7C808A'; drawSpaced(ctx, t, 100, y, 0.5, 'center');
  };
  if (d.sealLogo && isDrawable(d.logo)) {
    ctx.save(); ctx.beginPath(); ctx.arc(100, 100, 50, 0, Math.PI*2); ctx.clip();
    drawContain(ctx, d.logo, 62, 76, 76, 48, 'center'); ctx.restore();
  } else { emboss(d.sealLine1, 98); emboss(d.sealLine2, 121); }
}

/* ---------- fonts ---------- */
const FONT_SPECS = ['600 14px Cinzel','500 14px Cinzel','700 14px Cinzel','italic 600 84px "Cormorant Garamond"','italic 400 20px "Cormorant Garamond"','500 60px "Cormorant Garamond"','400 18px "Cormorant Garamond"','36px "Pinyon Script"','500 12px Oswald','700 22px Oswald'];
async function ensureFonts(d){
  const jobs = FONT_SPECS.map(f => document.fonts.load(f).catch(() => null));
  jobs.push(document.fonts.load('700 19px "Shippori Mincho"', (d && d.hankoText) || '認定').catch(() => null));
  await Promise.all(jobs);
}


/* ---------- assets ---------- */
function loadImage(src){
  return new Promise((res, rej) => {
    if (!src) return res(null);
    if (typeof src === 'object' && !(src instanceof Blob)) return res(src);
    const img = new Image();
    const url = src instanceof Blob ? URL.createObjectURL(src) : src;
    if (typeof src === 'string' && /^https?:/i.test(src)) img.crossOrigin = 'anonymous';
    img.onload = () => { if (src instanceof Blob) URL.revokeObjectURL(url); res(img); };
    img.onerror = () => rej(new Error('Could not load the logo image. Use a PNG, JPG or SVG served with CORS, or a data: URL.'));
    img.src = url;
  });
}
async function prepare(data){
  const d = Object.assign({}, DEFAULTS, data || {});
  if (d.logo && !isDrawable(d.logo)) d.logo = await loadImage(d.logo);
  return d;
}
async function renderToCanvas(data, scale){
  const s = scale || 3; const d = await prepare(data);
  await ensureFonts(d);
  const c = document.createElement('canvas'); c.width = Math.round(W * s); c.height = Math.round(H * s);
  drawCertificate(c.getContext('2d'), d, s); return c;
}
const FONTS_CSS = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=Pinyon+Script&family=Oswald:wght@500;700&family=Shippori+Mincho:wght@700&display=swap';
function injectFonts(){
  if (typeof document === 'undefined' || document.querySelector('link[data-laureate-fonts]')) return;
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = FONTS_CSS; l.setAttribute('data-laureate-fonts', ''); document.head.appendChild(l);
}

const api = {
  W, H, BELTS, DEFAULTS, MONTHS, FONTS_CSS,
  draw: (ctx, data, scale) => drawCertificate(ctx, Object.assign({}, DEFAULTS, data || {}), scale || 1),
  renderToCanvas, prepare, loadImage, injectFonts,
  loadFonts: (data) => { injectFonts(); return ensureFonts(data); },
  autoCredential: autoCred, formatDate: fmtDate, beltInfo: (b) => BELTS[b] || BELTS.Green,
  /* shared drawing kit, used by the ID badge renderer */
  drawSeal: (ctx, data) => drawSeal(ctx, Object.assign({}, DEFAULTS, data || {})),
  util: { rad, spacedWidth, drawSpaced, fitSize, wrap, rrect, ellipseAt, drawContain, isDrawable, starShape, hanko },
  colors: { NAVY, GOLD, PAPER }
};
if (typeof module === 'object' && module.exports) module.exports = api;
root.LaureateCertificate = api;
})(typeof window !== 'undefined' ? window : globalThis);
