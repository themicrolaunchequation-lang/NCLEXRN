/*!
 * Laureate ID badge renderer — CR80 portrait card (54 × 85.6 mm), front and back, drawn on a canvas.
 * Requires laureate-render.js (window.LaureateCertificate) for fonts, the holographic seal and helpers.
 * Optional: qrcode-generator (window.qrcode) for a real QR code on the back; without it a placeholder is drawn.
 *
 *   await LaureateBadge.loadFonts();
 *   const { front, back } = await LaureateBadge.renderToCanvases(data, 1.25);   // 675 × 1070 px each (≈318 dpi)
 *   LaureateBadge.drawFront(ctx, data, scale); LaureateBadge.drawBack(ctx, data, scale);
 *
 * data: see LaureateBadge.DEFAULTS. data.photo and data.logo accept an image URL, data: URL, Blob/File,
 * HTMLImageElement, ImageBitmap or canvas; renderToCanvases() resolves URLs/Blobs for you.
 */
(function (root) {
'use strict';
const LC = root.LaureateCertificate;
if (!LC) throw new Error('Load laureate-render.js before badge-render.js');
const { rad, spacedWidth, drawSpaced, fitSize, wrap, rrect, drawContain, isDrawable } = LC.util;
const { NAVY, GOLD, PAPER } = LC.colors;
const W = 540, H = 856;
const GOLD_LIGHT = '#D4B26A', IVORY = '#F3EBDD';

const DEFAULTS = {
  name: 'Alexandra M. Reynolds',
  title: 'Continuous Improvement Lead',
  organization: 'Operations Excellence Office',
  belt: 'Green',
  cred: 'LSS-GB-2026-04718',
  issued: '2026-09-25',
  expires: '2029-09-25',
  institute: 'Aurelian Institute of Process Excellence',
  tagline: 'Certified Professional',
  verify: 'aurelian.example/verify',
  qrText: '',
  returnNotice: 'This card remains the property of the issuing institute. If found, please return it to the address below or report it at the verification page.',
  contact: '[Street address · City · Phone]',
  seal: true,
  facts: null,        // optional [[label, value] × 3] replacing Credential / Issued / Valid until
  photo: null,
  logo: null
};

function fmt(iso){ return LC.formatDate(iso); }
function shortDate(iso){
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); if (!m) return iso || '';
  return m[3] + ' ' + LC.MONTHS[+m[2]-1].slice(0,3).toUpperCase() + ' ' + m[1];
}
function qrPayload(d){
  if (d.qrText) return d.qrText;
  let base = (d.verify || '').trim(); if (!/^https?:\/\//i.test(base)) base = 'https://' + base;
  return base.replace(/\/+$/, '') + '/' + encodeURIComponent(d.cred || '');
}
function initials(name){
  return (name || '').split(/\s+/).filter(w => /^[A-Za-zÀ-ɏ]/.test(w)).map(w => w[0].toUpperCase()).filter((c, i, a) => i === 0 || i === a.length - 1).join('');
}

function waveRows(ctx, x0, y0, x1, y1, color, lw, amp, step){
  ctx.strokeStyle = color; ctx.lineWidth = lw;
  [false, true].forEach(inv => {
    ctx.beginPath();
    for (let y = y0 + step/2; y < y1; y += step) {
      ctx.moveTo(x0, y);
      for (let x = x0; x < x1; x += 22) {
        ctx.quadraticCurveTo(x + 5.5, y + (inv ? amp : -amp), x + 11, y);
        ctx.quadraticCurveTo(x + 16.5, y + (inv ? -amp : amp), x + 22, y);
      }
    }
    ctx.stroke();
  });
}
function paper(ctx){
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(27,39,64,0.03)'; ctx.beginPath();
  for (let x = -H; x < W; x += 6) { ctx.moveTo(x, H); ctx.lineTo(x + H, 0); } ctx.stroke();
}
function logoPlate(ctx, img, x, y, w, h){
  ctx.fillStyle = IVORY; rrect(ctx, x, y, w, h, 8); ctx.fill();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1; rrect(ctx, x + 3.5, y + 3.5, w - 7, h - 7, 6); ctx.stroke();
  drawContain(ctx, img, x + 10, y + 8, w - 20, h - 16, 'center');
}
function isTall(img){ const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height; return iw / ih < 1.3; }
function drawCover(ctx, img, x, y, w, h){
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height; if (!iw || !ih) return;
  const k = Math.max(w / iw, h / ih), dw = iw * k, dh = ih * k;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2.6, dw, dh);
}

/* ---------------- front ---------------- */
function drawFront(ctx, data, s){
  const d = Object.assign({}, DEFAULTS, data || {});
  const belt = LC.beltInfo(d.belt);
  ctx.setTransform(s, 0, 0, s, 0, 0); ctx.textBaseline = 'alphabetic';
  paper(ctx);

  // engraved navy head band
  ctx.fillStyle = NAVY; ctx.fillRect(0, 0, W, 156);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 156); ctx.clip();
  waveRows(ctx, 0, 0, W, 156, 'rgba(212,178,106,0.16)', 0.6, 7, 14);
  ctx.strokeStyle = 'rgba(212,178,106,0.35)'; ctx.lineWidth = 1;
  ctx.save(); ctx.translate(-110, 10); ctx.scale(1, 0.72); ctx.stroke(new Path2D('M0 180 C 150 180 225 168 275 120 C 315 72 345 12 380 12 C 415 12 445 72 485 120 C 535 168 610 180 760 180')); ctx.restore();
  ctx.restore();
  ctx.fillStyle = GOLD; ctx.fillRect(0, 156, W, 2); ctx.fillRect(0, 161, W, 1);

  const hasLogo = isDrawable(d.logo);
  const instFont = (z) => '600 ' + z + 'px Cinzel, Georgia, serif';
  ctx.fillStyle = GOLD_LIGHT;
  if (hasLogo) {
    const tall = isTall(d.logo), tx = tall ? 138 : 170;
    if (tall) drawContain(ctx, d.logo, 26, 14, 96, 104, 'center'); else logoPlate(ctx, d.logo, 28, 26, 124, 72);
    ctx.font = instFont(15); const lines = wrap(ctx, (d.institute || '').toUpperCase(), 360).slice(0, 3);
    const top = 62 - (lines.length - 1) * 11;
    lines.forEach((l, i) => { const z = fitSize(ctx, l, instFont, 15, 372, 9, (q) => q * 0.08); drawSpaced(ctx, l, tx, top + i * 22, z * 0.08, 'left'); });
  } else {
    ctx.font = instFont(16); const lines = wrap(ctx, (d.institute || '').toUpperCase(), 440).slice(0, 2);
    lines.forEach((l, i) => { const z = fitSize(ctx, l, instFont, 16, 470, 9, (q) => q * 0.14); drawSpaced(ctx, l, W/2, (lines.length === 1 ? 70 : 58) + i * 26, z * 0.14, 'center'); });
  }
  ctx.fillStyle = 'rgba(243,235,221,0.85)';
  const tag = ('Lean Six Sigma · ' + (d.tagline || '')).toUpperCase();
  const tz = fitSize(ctx, tag, (z) => '500 ' + z + 'px Cinzel, Georgia, serif', 12, 480, 8, (q) => q * 0.3);
  drawSpaced(ctx, tag, W/2, 132, tz * 0.3, 'center');

  // photo with double gold frame
  const px = 150, py = 190, pw = 240, ph = 300;
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(px - 10, py - 10, pw + 20, ph + 20);
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1; ctx.strokeRect(px - 9.5, py - 9.5, pw + 19, ph + 19); ctx.strokeRect(px - 5.5, py - 5.5, pw + 11, ph + 11);
  ctx.save(); ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip();
  if (isDrawable(d.photo)) drawCover(ctx, d.photo, px, py, pw, ph);
  else {
    ctx.fillStyle = '#E4DCCB'; ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = '#CFC4AE';
    ctx.beginPath(); ctx.arc(px + pw/2, py + 118, 58, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(px + pw/2, py + ph + 20, 112, 118, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#6B6252'; ctx.font = '600 44px "Cormorant Garamond", Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText(initials(d.name) || '?', px + pw/2, py + 133);
  }
  ctx.restore();

  if (d.seal) { ctx.save(); ctx.translate(344, 426); ctx.scale(0.5, 0.5); LC.drawSeal(ctx, { sealTop: 'LEAN SIX SIGMA', sealBottom: 'GENUINE · CERTIFIED', sealLine1: 'OFFICIAL', sealLine2: 'CERTIFIED', logo: d.logo, sealLogo: false }); ctx.restore(); }

  // identity
  ctx.fillStyle = NAVY; ctx.textAlign = 'center';
  fitSize(ctx, d.name, (z) => '600 ' + z + 'px "Cormorant Garamond", Georgia, serif', 44, 470, 22);
  ctx.fillText(d.name || '', W/2, 562);
  ctx.fillStyle = '#3A4760';
  fitSize(ctx, d.title, (z) => 'italic 400 ' + z + 'px "Cormorant Garamond", Georgia, serif', 23, 470, 14);
  ctx.fillText(d.title || '', W/2, 594);
  ctx.fillStyle = '#7A6232';
  const org = (d.organization || '').toUpperCase();
  const oz = fitSize(ctx, org, (z) => '500 ' + z + 'px Cinzel, Georgia, serif', 12, 470, 8, (q) => q * 0.2);
  drawSpaced(ctx, org, W/2, 622, oz * 0.2, 'center');

  // stitched belt stripe
  ctx.fillStyle = belt.color; ctx.fillRect(0, 646, W, 64);
  ctx.fillStyle = GOLD; ctx.fillRect(0, 646, W, 1); ctx.fillRect(0, 709, W, 1);
  ctx.setLineDash([3,3]); ctx.strokeStyle = belt.stitch; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 653.5); ctx.lineTo(W, 653.5); ctx.moveTo(0, 702.5); ctx.lineTo(W, 702.5); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = belt.ink;
  const bl = belt.name.toUpperCase();
  const bz = fitSize(ctx, bl, (z) => '700 ' + z + 'px Cinzel, Georgia, serif', 24, 470, 12, (q) => q * 0.22);
  drawSpaced(ctx, bl, W/2, 687, bz * 0.22, 'center');

  // facts
  const facts = Array.isArray(d.facts) && d.facts.length === 3 ? d.facts
    : [['Credential', d.cred], ['Issued', shortDate(d.issued)], ['Valid until', shortDate(d.expires)]];
  const cols = [[98].concat(facts[0]), [290].concat(facts[1]), [450].concat(facts[2])];
  cols.forEach(([x, label, value], i) => {
    ctx.fillStyle = '#7A6232'; ctx.font = '600 11px Cinzel, Georgia, serif';
    drawSpaced(ctx, label.toUpperCase(), x, 748, 1.6, 'center');
    ctx.fillStyle = NAVY;
    fitSize(ctx, value || '—', (z) => '500 ' + z + 'px Oswald, "Arial Narrow", sans-serif', 17, i === 0 ? 172 : 136, 10);
    ctx.textAlign = 'center'; ctx.fillText(value || '—', x, 772);
  });
  ctx.fillStyle = 'rgba(168,134,74,0.5)'; ctx.fillRect(203, 736, 1, 44); ctx.fillRect(373, 736, 1, 44);

  // engraved foot strip
  ctx.fillStyle = NAVY; ctx.fillRect(0, 812, W, 44);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 812, W, 44); ctx.clip();
  waveRows(ctx, 0, 812, W, 856, 'rgba(212,178,106,0.3)', 0.6, 6, 14); ctx.restore();
  ctx.fillStyle = GOLD; ctx.fillRect(0, 810, W, 2);
}

/* ---------------- back ---------------- */
function drawBack(ctx, data, s){
  const d = Object.assign({}, DEFAULTS, data || {});
  const belt = LC.beltInfo(d.belt);
  ctx.setTransform(s, 0, 0, s, 0, 0); ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = NAVY; ctx.fillRect(0, 0, W, H);
  waveRows(ctx, 0, 0, W, H, 'rgba(212,178,106,0.07)', 0.6, 7, 14);
  ctx.save(); ctx.strokeStyle = 'rgba(243,235,221,0.06)'; ctx.lineWidth = 0.8;
  for (let k = 0; k < 12; k++) { ctx.beginPath(); ctx.ellipse(W/2, 330, 230, 74, rad(k*15), 0, Math.PI*2); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1; ctx.strokeRect(18.5, 18.5, W - 37, H - 37);
  ctx.strokeStyle = 'rgba(168,134,74,0.5)'; ctx.strokeRect(24.5, 24.5, W - 49, H - 49);

  let y = 86;
  if (isDrawable(d.logo)) {
    if (isTall(d.logo)) { drawContain(ctx, d.logo, W/2 - 50, 40, 100, 96, 'center'); y = 164; }
    else { logoPlate(ctx, d.logo, W/2 - 70, 44, 140, 64); y = 142; }
  }
  ctx.fillStyle = GOLD_LIGHT;
  const inst = (d.institute || '').toUpperCase();
  const iz = fitSize(ctx, inst, (z) => '600 ' + z + 'px Cinzel, Georgia, serif', 14, 460, 8, (q) => q * 0.16);
  drawSpaced(ctx, inst, W/2, y, iz * 0.16, 'center');

  // QR on an ivory plate
  const qs = 228, qx = W/2 - qs/2, qy = y + 40;
  ctx.fillStyle = IVORY; rrect(ctx, qx - 16, qy - 16, qs + 32, qs + 32, 10); ctx.fill();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1; rrect(ctx, qx - 11.5, qy - 11.5, qs + 23, qs + 23, 7); ctx.stroke();
  drawQR(ctx, qrPayload(d), qx, qy, qs);

  let t = qy + qs + 56;
  ctx.fillStyle = IVORY; ctx.textAlign = 'center'; ctx.font = 'italic 400 19px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('Scan to verify this credential', W/2, t);
  ctx.fillStyle = GOLD_LIGHT; fitSize(ctx, d.verify, (z) => '500 ' + z + 'px Oswald, "Arial Narrow", sans-serif', 14, 440, 9);
  ctx.fillText(d.verify || '', W/2, t + 24);
  ctx.fillStyle = IVORY;
  const cz = fitSize(ctx, d.cred, (z) => '500 ' + z + 'px Oswald, "Arial Narrow", sans-serif', 28, 440, 14, (q) => q * 0.12);
  drawSpaced(ctx, d.cred || '', W/2, t + 68, cz * 0.12, 'center');

  ctx.fillStyle = 'rgba(243,235,221,0.82)'; ctx.textAlign = 'center';
  let nz = 17, lines;
  for (; nz >= 12; nz--) { ctx.font = '400 ' + nz + 'px "Cormorant Garamond", Georgia, serif'; lines = wrap(ctx, d.returnNotice, 440); if (lines.length <= 4) break; }
  lines.slice(0, 5).forEach((l, i) => ctx.fillText(l, W/2, t + 112 + i * nz * 1.35));

  ctx.fillStyle = 'rgba(243,235,221,0.6)'; ctx.fillRect(W/2 - 130, 714, 260, 1);
  ctx.fillStyle = 'rgba(243,235,221,0.7)'; ctx.font = '500 10px Cinzel, Georgia, serif';
  drawSpaced(ctx, 'HOLDER SIGNATURE', W/2, 732, 2, 'center');

  ctx.fillStyle = GOLD_LIGHT;
  const ctz = fitSize(ctx, d.contact, (z) => '500 ' + z + 'px Cinzel, Georgia, serif', 11, 460, 7, (q) => q * 0.1);
  drawSpaced(ctx, d.contact || '', W/2, 772, ctz * 0.1, 'center');

  ctx.fillStyle = belt.color; ctx.fillRect(0, 800, W, 56);
  ctx.fillStyle = GOLD; ctx.fillRect(0, 800, W, 1);
  ctx.setLineDash([3,3]); ctx.strokeStyle = belt.stitch; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 807.5); ctx.lineTo(W, 807.5); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = belt.ink; ctx.font = '600 13px Cinzel, Georgia, serif';
  drawSpaced(ctx, ('Lean Six Sigma ' + belt.name).toUpperCase(), W/2, 836, 3, 'center');
}

function drawQR(ctx, text, x, y, size){
  const lib = LC.getQrLib();
  if (typeof lib !== 'function') {
    ctx.fillStyle = NAVY; ctx.font = '600 16px Oswald, sans-serif'; ctx.textAlign = 'center';
    ctx.strokeStyle = NAVY; ctx.lineWidth = 2; ctx.setLineDash([6,5]); ctx.strokeRect(x + 1, y + 1, size - 2, size - 2); ctx.setLineDash([]);
    ctx.fillText('QR code', x + size/2, y + size/2 + 6); return;
  }
  const qr = lib(0, 'M'); qr.addData(text); qr.make();
  const n = qr.getModuleCount(), cell = size / n;
  ctx.fillStyle = NAVY;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) ctx.fillRect(x + c*cell, y + r*cell, cell + 0.35, cell + 0.35);
}

async function prepare(data){
  const d = Object.assign({}, DEFAULTS, data || {});
  if (d.logo && !isDrawable(d.logo)) d.logo = await LC.loadImage(d.logo);
  if (d.photo && !isDrawable(d.photo)) d.photo = await LC.loadImage(d.photo);
  return d;
}
async function renderToCanvases(data, scale){
  const s = scale || 1.25; const d = await prepare(data);
  await LC.loadFonts();
  const mk = (fn) => { const c = document.createElement('canvas'); c.width = Math.round(W * s); c.height = Math.round(H * s); fn(c.getContext('2d'), d, s); return c; };
  return { front: mk(drawFront), back: mk(drawBack) };
}

const api = {
  W, H, DEFAULTS, CARD_MM: { w: 54, h: 85.6 },
  drawFront, drawBack, renderToCanvases, prepare, qrPayload,
  loadFonts: () => LC.loadFonts(), loadImage: LC.loadImage
};
if (typeof module === 'object' && module.exports) module.exports = api;
root.LaureateBadge = api;
})(typeof window !== 'undefined' ? window : globalThis);
