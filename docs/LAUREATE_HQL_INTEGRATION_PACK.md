# Laureate Certificate Integration Pack — LSS Master Toolkit (Health Quality Leaders Ltd)

**For the AI agent editing `LSS-Toolkit-v14.html`.** This one file holds everything you need: the brief (Parts 1–6), the complete code (Part 7) and the tests (Part 8). You don't need to fetch anything else.

---

## Part 1 — Goal and hard rules

**Goal:** replace the HTML/CSS certificate that `renderCertificate(cert)` builds inside `#certPaperWrap` with the **Laureate** certificate, which is drawn on a `<canvas>`. Add **Download PDF / PNG** buttons and an optional **ID badge** download.

**Hard rules:**

1. **Keep the data flow exactly as it is.** Don't change `lss_reg`, `lss_exam`, `lss_cert`, `issueCertificate(reissue)`, `randCode()`, `openCert()`, `isAdmin()`, `PASS_PCT`, the admin preview or "Re-issue with current name". Only the drawing changes.
2. **Don't edit the code in Part 7.** Paste it as it is. Change wording only through `LaureateHQL.configure({...})` (Part 5).
3. **Don't re-encode, copy or move `CREST_URI` / `SIG_URI`.** The adapter reads the existing top-level constants.
4. **Keep the QR payload text as it is.** The adapter rebuilds exactly the same multi-line text as `renderCertQr()`, so existing scans keep working.
5. **Keep a fallback.** If drawing throws, show the classic certificate.
6. **Don't use html2canvas** or any other DOM-screenshot tool.

---

## Part 2 — What the new certificate shows (the adapter maps it for you)

| Toolkit source | Where it appears on the Laureate certificate |
|---|---|
| `cert.name` (from `lss_reg.name`) | Large name under "This is to certify that". It auto-shrinks for long names. |
| `cert.org` (from `lss_reg.org`) | Small caps line under the name. Omitted when empty. |
| `COURSE_TITLE` | Programme line with a green belt swatch: "Lean Six Sigma Green Belt in Healthcare". |
| `ISSUER` | Header, signature block, QR payload. |
| `CREST_URI` | Crest, top-left inside the engraved guilloche frame. |
| `SIG_URI` | Signature above "Authorised Course Director / Health Quality Leaders Ltd". A white background blends away. |
| `cert.score`, `cert.preview` | Footer: "Assessment 96% · Passed", or "Preview (admin)". |
| `cert.code` | Footer: "Certificate ID LSSGB-XXXX-XXXX". |
| `cert.issuedAt` | Footer: "Date issued 26 September 2026". |
| `cert.preview === true` | Red diagonal **SPECIMEN** overprint, replacing the faint `LSS • GB` watermark. |
| QR code | Centre of the bottom row, captioned "SCAN TO VERIFY". Same payload text as today. |
| Disclaimer | The original "Educational Certificate of Completion…" text, two lines at the bottom. |

Other design elements: the hatched "Certificate" title and "of Completion", a green corner sash reading "Green Belt · Healthcare", a holographic seal bottom-right, an engraved bell curve and rosette watermark, and an A4 landscape page (1123 × 794 layout units).

---

## Part 3 — Install (four steps)

### Step 1 — Fonts and jsPDF in `<head>`

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=Pinyon+Script&family=Oswald:wght@500;700&family=Shippori+Mincho:wght@700&display=swap">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

- The **fonts** give the engraved look. Without the network the canvas uses Georgia and similar fallbacks and still works.
- **jsPDF** is only for PDF download. If the toolkit must work fully offline, inline jsPDF 2.5.1 as a `<script>` block instead.

### Step 2 — Paste the bundle (Part 7)

Paste the whole Part 7 code as **one `<script>` block**, placed **after** the toolkit's inline `qrcode.js`. The renderer calls `qrcode(0,'M')` and finds it whether it is declared with `var`, `function` or `const`.

`CREST_URI` and `SIG_URI` only need to exist when a certificate is drawn, not when the bundle loads.

### Step 3 — Replace `renderCertificate`

Rename the existing function to keep it as the fallback, then add the new one:

```javascript
// Rename the existing template function (keep its body unchanged):
function renderCertificateClassic(cert){
  /* ...existing body: wrap.innerHTML = `<article class="certificate-paper">...`; paintAssets(); renderCertQr(cert); ... */
}

// New renderer: same name and signature, so every existing caller (openCert, issueCertificate, re-issue) keeps working.
function renderCertificate(cert){
  const wrap = document.getElementById("certPaperWrap");
  LaureateHQL.renderCertificate(wrap, cert).catch(function(err){
    console.warn("Laureate render failed, using classic certificate:", err);
    renderCertificateClassic(cert);
  });
}
```

- `LaureateHQL.renderCertificate` waits for the fonts, draws at 2× and replaces the wrapper's contents with `<canvas id="certPaper" class="laureate-cert-canvas">`, sized `width:100%; height:auto`.
- The crest, signature and QR code are drawn on the canvas. `paintAssets()` and `renderCertQr()` are no longer called for the certificate. Leave them defined for other screens.
- Names are canvas text, not HTML, so there is no injection risk. `escapeHtmlLocal` isn't needed on this path.
- If any code looked up `#certQrImg` or `.cert-learner-name`, it no longer exists. Search for such references and remove or guard them.

### Step 4 — Download buttons in the certificate modal

Add next to the existing certificate actions:

```html
<button type="button" id="certDownloadPdf">Download PDF</button>
<button type="button" id="certDownloadPng">Download PNG</button>
<button type="button" id="certDownloadBadge">Download ID badge</button>
```

```javascript
function lockWhile(btn, job){
  btn.disabled = true;
  return job().catch(function(e){ console.error("Download failed:", e); }).finally(function(){ btn.disabled = false; });
}
$("certDownloadPdf").addEventListener("click", function(e){ lockWhile(e.currentTarget, function(){ return LaureateHQL.downloadCertificate(getCert(), "pdf"); }); });
$("certDownloadPng").addEventListener("click", function(e){ lockWhile(e.currentTarget, function(){ return LaureateHQL.downloadCertificate(getCert(), "png"); }); });
$("certDownloadBadge").addEventListener("click", function(e){ lockWhile(e.currentTarget, function(){ return LaureateHQL.downloadBadge(getCert()); }); });
```

Show these buttons only when a certificate is issued, following the same condition the modal already uses. Use the toolkit's own toast or error UI in place of `console.error` if it has one.

**Outputs:**

| Output | Format |
|---|---|
| Certificate PDF | One A4 landscape page. |
| Certificate PNG | 3369 × 2382 px (≈ 288 dpi). |
| ID badge PDF | Two 54 × 85.6 mm pages (CR80 card), front then back. |
| Filenames | `HQL-Certificate_<name>_<code>.pdf` / `.png`, `HQL-Badge_<name>.pdf`. |

**Optional:** show the badge in the modal with `LaureateHQL.renderBadge(document.getElementById("certBadgeWrap"), getCert())` in a new `<div id="certBadgeWrap">`.

---

## Part 4 — Printing

If there is a Print button or print stylesheet for `.certificate-paper`, replace it with:

```css
@media print {
  @page { size: A4 landscape; margin: 0; }
  body * { visibility: hidden; }
  #certPaperWrap, #certPaperWrap * { visibility: visible; }
  #certPaperWrap { position: fixed; inset: 0; }
  #certPaperWrap canvas { width: 100% !important; height: auto !important; box-shadow: none !important; }
}
```

The PDF download gives the best print quality.

---

## Part 5 — Changing wording (optional, no code edits)

Call this once after the bundle loads. Every key is optional; the defaults below are already set.

```javascript
LaureateHQL.configure({
  courseTitle: COURSE_TITLE,                // keep in sync with the toolkit constant
  issuer: ISSUER,
  belt: "Green",                            // "Yellow" | "Green" | "Black" | "Master Black"
  beltLabel: "Green Belt · Healthcare",     // corner sash + badge tagline
  title: "Certificate",
  subtitle: "of Completion",
  statement: "has successfully completed the professional learning program and assessment for",
  learning: "demonstrating applied competence across Define, Measure, Analyze, Improve, and Control, including statistical process control, capability analysis, and root-cause methods.",
  directorTitle: "Authorised Course Director",
  disclaimer: "Educational Certificate of Completion. It confirms completion of this program's stated learning requirements and assessment. It does not constitute professional licensure, board certification, academic credit, CME, or CPD accreditation.",
  watermark: "LSS • GB",
  sealTop: "LEAN SIX SIGMA", sealBottom: "HEALTHCARE · GREEN BELT", sealLine1: "OFFICIAL", sealLine2: "CERTIFIED",
  crest: null,        // null = use CREST_URI; or pass another data URI / URL
  signature: null,    // null = use SIG_URI
  certKey: "lss_cert"
});
```

---

## Part 6 — API reference (what Part 7 exposes)

| Call | Returns / does |
|---|---|
| `LaureateHQL.renderCertificate(elOrId, cert, scale=2)` | Promise of a canvas. Replaces the element's contents. |
| `LaureateHQL.renderBadge(elOrId, cert)` | Promise of `{front, back}` canvases, shown side by side. |
| `LaureateHQL.downloadCertificate(cert, "pdf" \| "png")` | Starts a download. |
| `LaureateHQL.downloadBadge(cert)` | Starts a badge PDF download. |
| `LaureateHQL.certificatePDF(cert)`, `.certificatePNG(cert)`, `.badgePDF(cert)` | Promise of a Blob, for upload or email. |
| `LaureateHQL.certificateData(cert)` | The renderer's data object, for inspection. |
| `LaureateHQL.qrPayload(cert)` | The exact QR text. |
| `LaureateHQL.readCert()` | The parsed `lss_cert`, or null. |
| `LaureateHQL.ready()` | Promise that resolves when the fonts are loaded. |
| `LaureateCertificate.*`, `LaureateBadge.*` | Low-level renderers. You won't need them directly. |

`cert` may be omitted in every call; the adapter then reads `lss_cert` from localStorage.

---

## Part 7 — Complete code (paste as one `<script>` block after the toolkit's `qrcode.js`)

```javascript
/*! Laureate × Health Quality Leaders: certificate + ID badge renderers and LSS Toolkit adapter (single-file bundle).
 * Contents: 1) laureate-render.js  2) badge-render.js  3) laureate-hql.js
 * Paste as ONE <script> block after the toolkit's qrcode.js. Exposes window.LaureateCertificate, window.LaureateBadge, window.LaureateHQL.
 */
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
  logo:null, sealLogo:false,
  // optional layout fields (used by integrations such as the HQL adapter)
  title:'Certificate', certifyLine:'This is to certify that', org:'', programText:'', learning:'', sashText:'',
  signatories:2, sig1Image:null, sig2Image:null,
  qr:false, qrText:'', qrCaption:'Scan to verify',
  footer:null, disclaimer:'', specimen:false, watermarkText:''
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
  const sashLabel = (d.sashText || belt.name).toUpperCase();
  const sashSize = fitSize(ctx, sashLabel, (z) => '700 ' + z + 'px Cinzel, Georgia, serif', 14, 270, 9, (z) => z * 0.22);
  drawSpaced(ctx, sashLabel, 0, 5, sashSize * 0.22, 'center');
  ctx.restore();

  // optional faint text watermark behind the content
  if ((d.watermarkText || '').trim()) {
    ctx.save(); ctx.fillStyle = 'rgba(27,39,64,0.035)'; ctx.font = '700 150px Cinzel, Georgia, serif';
    drawSpaced(ctx, d.watermarkText.trim(), 561, 470, 12, 'center'); ctx.restore();
  }

  // issuer logo / crest, top-left inside the frame (tall crests get a taller box)
  if (isDrawable(d.logo) && !d.sealLogo) {
    const iw = d.logo.naturalWidth || d.logo.width, ih = d.logo.naturalHeight || d.logo.height;
    if (iw / ih < 1.3) drawContain(ctx, d.logo, 80, 70, 118, 128, 'left');
    else drawContain(ctx, d.logo, 84, 76, 150, 84, 'left');
  }

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

  hatchedTitle(ctx, d.title || 'Certificate', CX, 192, s);

  ctx.fillStyle = '#7A6232';
  const subSize = fitSize(ctx, d.subtitle, (z) => '500 ' + z + 'px Cinzel, Georgia, serif', 15, 640, 9, (z) => z * 0.4);
  drawSpaced(ctx, d.subtitle, CX, 225, subSize * 0.4, 'center');

  ctx.fillStyle = '#3A4760'; ctx.font = 'italic 400 20px "Cormorant Garamond", Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText(d.certifyLine == null ? 'This is to certify that' : d.certifyLine, CX, 265);

  // recipient name + double rule
  ctx.fillStyle = NAVY;
  fitSize(ctx, d.name, (z) => '500 ' + z + 'px "Cormorant Garamond", Georgia, serif', 60, 715, 30);
  ctx.textAlign = 'center'; ctx.fillText(d.name, CX, 326);
  const nw = Math.min(803, ctx.measureText(d.name).width + 88);
  ctx.fillStyle = GOLD; ctx.fillRect(CX - nw/2, 342, nw, 1); ctx.fillRect(CX - nw/2, 344.5, nw, 1);

  // body block: organisation, statement, program line, learning outcomes (shrinks to fit)
  const plan = planBody(ctx, d, belt, 345, 552);
  if (plan.orgY) {
    ctx.fillStyle = '#5E6674'; ctx.font = '600 12px Cinzel, Georgia, serif';
    const org = d.org.toUpperCase(); const oz = fitSize(ctx, org, (z) => '600 ' + z + 'px Cinzel, Georgia, serif', 12, 700, 8, (q) => q * 0.16);
    drawSpaced(ctx, org, CX, plan.orgY, oz * 0.16, 'center');
  }
  ctx.fillStyle = '#2E3A52'; ctx.textAlign = 'center'; ctx.font = '400 ' + plan.st + 'px "Cormorant Garamond", Georgia, serif';
  plan.stLines.forEach((l, i) => ctx.fillText(l, CX, plan.stY + i * plan.st * 1.5));
  drawProgramLine(ctx, d, belt, CX, plan.prY, plan.pr);
  if (plan.leLines.length) {
    ctx.fillStyle = '#3A4760'; ctx.textAlign = 'center'; ctx.font = 'italic 400 ' + plan.le + 'px "Cormorant Garamond", Georgia, serif';
    plan.leLines.forEach((l, i) => ctx.fillText(l, CX, plan.leY + i * plan.le * 1.45));
  }

  // signatures (and QR in the second slot when enabled)
  const single = d.signatories === 1 || d.qr;
  sigBlock(ctx, 295, d.sig1Script, d.sig1Name, d.sig1Title, d.sig1Image);
  if (!single) sigBlock(ctx, 625, d.sig2Script, d.sig2Name, d.sig2Title, d.sig2Image);
  if (d.qr) qrBlock(ctx, 625, d);
  if (d.hanko && (d.hankoText||'').trim()) hanko(ctx, 417, 595, [...d.hankoText.trim()].slice(0,4));

  const disc = (d.disclaimer || '').trim();
  if (d.seal) {
    ctx.save();
    if (disc) { ctx.translate(850, 536); ctx.scale(0.78, 0.78); } else { ctx.translate(832, 546); ctx.scale(0.89, 0.89); }
    drawSeal(ctx, d); ctx.restore();
  }

  // footer + optional disclaimer
  const fy = disc ? 702 : 724;
  const foot = Array.isArray(d.footer) && d.footer.length ? d.footer : ['Credential No. ' + d.cred, 'Conferred ' + fmtDate(d.date), 'Verify · ' + d.verify];
  ctx.fillStyle = '#3A4760'; ctx.font = '500 12px Cinzel, Georgia, serif';
  if (foot[0]) drawSpaced(ctx, foot[0], 110, fy, 1.92, 'left');
  if (foot[1]) drawSpaced(ctx, foot[1], 561, fy, 1.92, 'center');
  if (foot[2]) drawSpaced(ctx, foot[2], 1013, fy, 1.92, 'right');
  if (disc) {
    let z = 12, dl;
    for (; z >= 9; z -= 0.5) { ctx.font = 'italic 400 ' + z + 'px "Cormorant Garamond", Georgia, serif'; dl = wrap(ctx, disc, 900); if (dl.length <= 2) break; }
    ctx.fillStyle = '#56617A'; ctx.textAlign = 'center';
    dl.slice(0, 2).forEach((l, i) => ctx.fillText(l, CX, 721 + i * z * 1.2));
  }

  // specimen overprint for previews
  if (d.specimen) {
    ctx.save(); ctx.translate(561, 420); ctx.rotate(rad(-18));
    ctx.font = '700 150px Cinzel, Georgia, serif'; ctx.fillStyle = 'rgba(168,50,45,0.13)';
    drawSpaced(ctx, 'SPECIMEN', 0, 50, 18, 'center'); ctx.restore();
  }
}

function planBody(ctx, d, belt, top, limit){
  const variants = [[18,27,15],[17,24,14],[16,22,13],[15,20,12.5],[14,18,12]];
  let plan = null;
  for (const [st, pr, le] of variants) {
    let cur = top; const orgY = (d.org || '').trim() ? cur + 24 : 0; if (orgY) cur = orgY;
    ctx.font = '400 ' + st + 'px "Cormorant Garamond", Georgia, serif';
    const stLines = wrap(ctx, d.statement, 670).slice(0, 5);
    const stY = cur + (orgY ? 30 : 33);
    const lastSt = stY + (stLines.length - 1) * st * 1.5;
    const prY = lastSt + pr * 1.6;
    ctx.font = 'italic 400 ' + le + 'px "Cormorant Garamond", Georgia, serif';
    const leLines = (d.learning || '').trim() ? wrap(ctx, d.learning, 720).slice(0, 3) : [];
    const leY = prY + le * 2.1;
    const bottom = leLines.length ? leY + (leLines.length - 1) * le * 1.45 : prY;
    plan = { st, pr, le, orgY, stLines, stY, prY, leLines, leY };
    if (bottom <= limit) break;
  }
  return plan;
}

function drawProgramLine(ctx, d, belt, CX, y, size){
  const pf = (z) => '600 ' + z + 'px Cinzel, Georgia, serif';
  const text = (d.programText || '').trim();
  if (text) {
    let ps = size; for (; ps > 12; ps -= 1) { ctx.font = pf(ps); if (spacedWidth(ctx, text, ps*.06) + 48 <= 820) break; }
    ctx.font = pf(ps); const w = spacedWidth(ctx, text, ps*.06); const x0 = CX - (w + 48) / 2;
    ctx.fillStyle = belt.color; ctx.fillRect(x0, y - ps*0.52, 34, 9);
    ctx.strokeStyle = GOLD; ctx.lineWidth = 1; ctx.strokeRect(x0 + .5, y - ps*0.52 + .5, 33, 8);
    ctx.fillStyle = NAVY; drawSpaced(ctx, text, x0 + 48, y, ps*.06, 'left');
    return;
  }
  let ps = size;
  for (; ps > 12; ps -= 1) { ctx.font = pf(ps); if (spacedWidth(ctx,'Lean Six Sigma',ps*.1) + spacedWidth(ctx,belt.name,ps*.1) + 62 <= 800) break; }
  ctx.font = pf(ps);
  const w1 = spacedWidth(ctx, 'Lean Six Sigma', ps*.1), w2 = spacedWidth(ctx, belt.name, ps*.1);
  const x0 = CX - (w1 + 62 + w2) / 2;
  ctx.fillStyle = NAVY; drawSpaced(ctx, 'Lean Six Sigma', x0, y, ps*.1, 'left');
  ctx.fillStyle = belt.color; ctx.fillRect(x0 + w1 + 14, y - ps*0.52, 34, 9);
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1; ctx.strokeRect(x0 + w1 + 14.5, y - ps*0.52 + .5, 33, 8);
  ctx.fillStyle = NAVY; drawSpaced(ctx, belt.name, x0 + w1 + 62, y, ps*.1, 'left');
}

function qrBlock(ctx, cx, d){
  const size = 100, x = cx - size/2, y = 540;
  ctx.fillStyle = '#FFFDF8'; ctx.fillRect(x - 8, y - 8, size + 16, size + 16);
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1; ctx.strokeRect(x - 7.5, y - 7.5, size + 15, size + 15);
  const lib = getQrLib();
  const text = d.qrText || ('Certificate ' + (d.cred || '') + ' · ' + (d.name || ''));
  if (typeof lib === 'function') {
    try {
      const qr = lib(0, 'M'); qr.addData(text); qr.make();
      const n = qr.getModuleCount(), cell = size / n; ctx.fillStyle = NAVY;
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) ctx.fillRect(x + c*cell, y + r*cell, cell + 0.3, cell + 0.3);
    } catch (e) { qrPlaceholder(ctx, x, y, size); }
  } else qrPlaceholder(ctx, x, y, size);
  ctx.fillStyle = '#3A4760'; ctx.font = '500 11px Cinzel, Georgia, serif';
  drawSpaced(ctx, (d.qrCaption || 'Scan to verify').toUpperCase(), cx, y + size + 27, 2, 'center');
}
/* qrcode-generator API: qrcode(typeNumber, level). Works whether the host declares it as window.qrcode or a global const. */
function getQrLib(){
  try { if (typeof qrcode === 'function') return qrcode; } catch (e) {}
  return root.qrcode;
}
function qrPlaceholder(ctx, x, y, size){
  ctx.save(); ctx.strokeStyle = NAVY; ctx.setLineDash([5,4]); ctx.strokeRect(x + 1, y + 1, size - 2, size - 2); ctx.restore();
  ctx.fillStyle = NAVY; ctx.font = '600 14px Oswald, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('QR', x + size/2, y + size/2 + 5);
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

function sigBlock(ctx, cx, script, name, title, image){
  ctx.fillStyle = NAVY; ctx.textAlign = 'center';
  if (isDrawable(image)) {
    const iw = image.naturalWidth || image.width, ih = image.naturalHeight || image.height;
    const k = Math.min(260 / iw, 76 / ih), dw = iw * k, dh = ih * k;
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(image, cx - dw/2, 637 - dh, dw, dh); ctx.restore();
  } else {
    fitSize(ctx, script || '', (z) => z + 'px "Pinyon Script", cursive', 36, 270, 18);
    ctx.fillText(script || '', cx, 630);
  }
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
  for (const k of ['logo', 'sig1Image', 'sig2Image']) if (d[k] && !isDrawable(d[k])) d[k] = await loadImage(d[k]);
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
  getQrLib,
  drawSeal: (ctx, data) => drawSeal(ctx, Object.assign({}, DEFAULTS, data || {})),
  util: { rad, spacedWidth, drawSpaced, fitSize, wrap, rrect, ellipseAt, drawContain, isDrawable, starShape, hanko },
  colors: { NAVY, GOLD, PAPER }
};
if (typeof module === 'object' && module.exports) module.exports = api;
root.LaureateCertificate = api;
})(typeof window !== 'undefined' ? window : globalThis);

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

/*!
 * LaureateHQL: adapter between the LSS Master Toolkit (Health Quality Leaders Ltd) and the
 * Laureate certificate + ID badge renderers.
 *
 * Load order:  qrcode.js (the app's own, or qrcode-generator) → laureate-render.js → badge-render.js → laureate-hql.js
 *
 * It reads the toolkit's existing records unchanged:
 *   lss_cert = { issued, name, org, score, preview, code, issuedAt }
 * and its existing assets (the CREST_URI / SIG_URI constants), then draws the certificate on a canvas.
 *
 *   LaureateHQL.renderCertificate(document.getElementById('certPaperWrap'), cert);   // replaces the HTML template
 *   LaureateHQL.downloadCertificate(cert, 'pdf');                                   // or 'png'
 *   LaureateHQL.renderBadge(el, cert);  LaureateHQL.downloadBadge(cert);
 */
(function (root) {
'use strict';
const LC = root.LaureateCertificate;
if (!LC) throw new Error('Load laureate-render.js before laureate-hql.js');

/* Toolkit constants. Override with LaureateHQL.configure({...}) if the app's values change. */
const CONFIG = {
  courseTitle: 'Lean Six Sigma Green Belt in Healthcare',
  issuer: 'Health Quality Leaders Ltd',
  belt: 'Green',
  beltLabel: 'Green Belt · Healthcare',
  title: 'Certificate',
  subtitle: 'of Completion',
  statement: 'has successfully completed the professional learning program and assessment for',
  learning: 'demonstrating applied competence across Define, Measure, Analyze, Improve, and Control, including statistical process control, capability analysis, and root-cause methods.',
  directorTitle: 'Authorised Course Director',
  disclaimer: "Educational Certificate of Completion. It confirms completion of this program's stated learning requirements and assessment. It does not constitute professional licensure, board certification, academic credit, CME, or CPD accreditation.",
  watermark: 'LSS • GB',
  sealTop: 'LEAN SIX SIGMA',
  sealBottom: 'HEALTHCARE · GREEN BELT',
  sealLine1: 'OFFICIAL',
  sealLine2: 'CERTIFIED',
  crest: null,       // image source; defaults to the app's CREST_URI
  signature: null,   // image source; defaults to the app's SIG_URI
  certKey: 'lss_cert'
};
function configure(over){ Object.assign(CONFIG, over || {}); return CONFIG; }

/* The toolkit declares `const CREST_URI` / `const SIG_URI` at top level: those are global bindings, not window properties. */
function crest(){ if (CONFIG.crest) return CONFIG.crest; try { if (typeof CREST_URI !== 'undefined') return CREST_URI; } catch (e) {} return root.CREST_URI || null; }
function signature(){ if (CONFIG.signature) return CONFIG.signature; try { if (typeof SIG_URI !== 'undefined') return SIG_URI; } catch (e) {} return root.SIG_URI || null; }

function localDay(ts){ const d = new Date(ts || Date.now()); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function shortDay(ts){ const d = new Date(ts || Date.now()); return String(d.getDate()).padStart(2,'0') + ' ' + LC.MONTHS[d.getMonth()].slice(0,3).toUpperCase() + ' ' + d.getFullYear(); }
function slug(s){ return (s || 'certificate').normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'certificate'; }

/* Same payload as the toolkit's renderCertQr(), so existing scans keep reading the same text. */
function qrPayload(cert){
  return 'LSS GREEN BELT — CERTIFICATE OF COMPLETION\n' +
    'Name: ' + cert.name + (cert.org ? '\nOrg: ' + cert.org : '') + '\n' +
    'Course: ' + CONFIG.courseTitle + '\n' +
    'Issuer: ' + CONFIG.issuer + '\n' +
    'Score: ' + cert.score + '%\n' +
    'ID: ' + cert.code + '\n' +
    'Issued: ' + new Date(cert.issuedAt || Date.now()).toISOString().slice(0, 10);
}
function assessment(cert){ return cert.preview ? 'Preview (admin)' : (cert.score != null ? cert.score + '% · Passed' : 'Passed'); }

/* lss_cert → certificate renderer data. Names are drawn on canvas, so no HTML escaping is needed. */
function certificateData(cert){
  cert = cert || {};
  return {
    name: cert.name || '', org: cert.org || '', belt: CONFIG.belt, date: localDay(cert.issuedAt), cred: cert.code || '',
    institute: CONFIG.issuer, title: CONFIG.title, subtitle: CONFIG.subtitle,
    statement: CONFIG.statement, programText: CONFIG.courseTitle, learning: CONFIG.learning, sashText: CONFIG.beltLabel,
    signatories: 1, sig1Image: signature(), sig1Script: '', sig1Name: CONFIG.directorTitle, sig1Title: CONFIG.issuer,
    qr: true, qrText: qrPayload(cert), qrCaption: 'Scan to verify',
    footer: ['Date issued ' + LC.formatDate(localDay(cert.issuedAt)), 'Assessment ' + assessment(cert), 'Certificate ID ' + (cert.code || '')],
    disclaimer: CONFIG.disclaimer,
    specimen: !!cert.preview, watermarkText: cert.preview ? '' : CONFIG.watermark,
    logo: crest(), sealLogo: false, hanko: false,
    seal: true, sealTop: CONFIG.sealTop, sealBottom: CONFIG.sealBottom, sealLine1: CONFIG.sealLine1, sealLine2: CONFIG.sealLine2
  };
}

/* lss_cert → ID badge renderer data (optional feature). */
function badgeData(cert, extra){
  cert = cert || {};
  return Object.assign({
    name: cert.name || '', title: CONFIG.courseTitle, organization: cert.org || '', belt: CONFIG.belt,
    cred: cert.code || '', issued: localDay(cert.issuedAt), expires: '',
    facts: [['Certificate ID', cert.code || ''], ['Issued', shortDay(cert.issuedAt)], ['Assessment', cert.preview ? 'Preview' : (cert.score != null ? cert.score + '%' : '—')]],
    institute: CONFIG.issuer, tagline: CONFIG.beltLabel, verify: '', qrText: qrPayload(cert),
    returnNotice: CONFIG.disclaimer, contact: CONFIG.issuer, logo: crest(), seal: true, photo: null
  }, extra || {});
}

function readCert(){ try { return JSON.parse(localStorage.getItem(CONFIG.certKey) || 'null'); } catch (e) { return null; } }
function el(target){ return typeof target === 'string' ? document.getElementById(target) : target; }

/* Draw the certificate into a container (e.g. #certPaperWrap), replacing its contents. Resolves to the canvas. */
async function renderCertificate(target, cert, scale){
  const wrap = el(target); if (!wrap) throw new Error('Certificate container not found');
  const c = await LC.renderToCanvas(certificateData(cert || readCert()), scale || 2);
  c.className = 'laureate-cert-canvas'; c.id = 'certPaper';
  c.setAttribute('role', 'img'); c.setAttribute('aria-label', 'Certificate of Completion for ' + ((cert || readCert() || {}).name || ''));
  c.style.cssText = 'display:block;width:100%;height:auto;max-width:100%';
  wrap.replaceChildren(c);
  return c;
}
async function renderBadge(target, cert, extra){
  const LB = root.LaureateBadge; if (!LB) throw new Error('Load badge-render.js to use badges');
  const wrap = el(target); if (!wrap) throw new Error('Badge container not found');
  const { front, back } = await LB.renderToCanvases(badgeData(cert || readCert(), extra), 1.25);
  const box = document.createElement('div'); box.style.cssText = 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px';
  [front, back].forEach((c, i) => { c.style.cssText = 'display:block;width:100%;height:auto;border-radius:12px'; c.setAttribute('aria-label', i ? 'Badge back' : 'Badge front'); box.appendChild(c); });
  wrap.replaceChildren(box);
  return { front, back };
}

const toBlob = (c, type, q) => new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error('Could not encode the image')), type, q));
function jsPDF(){ const lib = root.jspdf && root.jspdf.jsPDF; if (!lib) throw new Error('Load jsPDF to export PDF'); return lib; }

async function certificatePNG(cert){ return toBlob(await LC.renderToCanvas(certificateData(cert), 3), 'image/png'); }
async function certificatePDF(cert){
  const Pdf = jsPDF(); const c = await LC.renderToCanvas(certificateData(cert), 2.5);
  const pdf = new Pdf({ orientation: 'landscape', unit: 'pt', format: 'a4', compress: true });
  pdf.addImage(c.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, 841.89, 595.28, undefined, 'FAST');
  return pdf.output('blob');
}
async function badgePDF(cert, extra){
  const LB = root.LaureateBadge; if (!LB) throw new Error('Load badge-render.js to use badges');
  const Pdf = jsPDF(); const { front, back } = await LB.renderToCanvases(badgeData(cert, extra), 1.25);
  const pdf = new Pdf({ orientation: 'portrait', unit: 'mm', format: [54, 85.6], compress: true });
  pdf.addImage(front.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 54, 85.6, undefined, 'FAST');
  pdf.addPage([54, 85.6], 'portrait');
  pdf.addImage(back.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 54, 85.6, undefined, 'FAST');
  return pdf.output('blob');
}
function download(blob, filename){
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
}
async function downloadCertificate(cert, format){
  cert = cert || readCert(); const base = 'HQL-Certificate_' + slug(cert && cert.name) + '_' + slug(cert && cert.code);
  if (format === 'png') download(await certificatePNG(cert), base + '.png');
  else download(await certificatePDF(cert), base + '.pdf');
}
async function downloadBadge(cert, extra){
  cert = cert || readCert(); download(await badgePDF(cert, extra), 'HQL-Badge_' + slug(cert && cert.name) + '.pdf');
}

const api = {
  CONFIG, configure, qrPayload, certificateData, badgeData, readCert,
  renderCertificate, renderBadge, certificatePNG, certificatePDF, badgePDF,
  downloadCertificate, downloadBadge, download,
  ready: () => LC.loadFonts()
};
if (typeof module === 'object' && module.exports) module.exports = api;
root.LaureateHQL = api;
})(typeof window !== 'undefined' ? window : globalThis);
```

---

## Part 8 — Verify

Run this in the browser console after the change, with the certificate modal open:

```javascript
const testCert = { issued: true, name: "Dr. Jane Doe", org: "Metropolitan Healthcare Trust",
  score: 96, preview: false, code: "LSSGB-9K2M-7XLP", issuedAt: Date.now() };

await LaureateHQL.renderCertificate("certPaperWrap", testCert);
console.log("canvas drawn:", document.querySelector("#certPaperWrap canvas")?.width === 2246);
console.log("QR text kept:", LaureateHQL.qrPayload(testCert).startsWith("LSS GREEN BELT — CERTIFICATE OF COMPLETION"));
console.log("crest found:", !!LaureateHQL.certificateData(testCert).logo, "signature found:", !!LaureateHQL.certificateData(testCert).sig1Image);

// Admin preview → SPECIMEN overprint and "Preview (admin)"
await LaureateHQL.renderCertificate("certPaperWrap", { ...testCert, preview: true, code: "PREVIEW-9K2M-7XLP" });
```

**Acceptance checklist:**

- [ ] A passing learner sees their **registered name** and organisation.
- [ ] After changing the name in settings, **Re-issue with current name** shows the new name and a new `LSSGB-` code.
- [ ] Admin preview for a non-passing user shows **SPECIMEN**, "Preview (admin)" and a `PREVIEW-` code.
- [ ] The **crest** is top-left and the **course director signature** is bottom-left, with no white box around it.
- [ ] Scanning the **QR code** with a phone shows the same text as the old certificate.
- [ ] The **PDF** is one A4 landscape page. The **PNG** is 3369 × 2382. The **badge PDF** has two card-size pages.
- [ ] A 60-character name still fits on one line. The disclaimer fits in two lines.
- [ ] Blocking the fonts or throwing inside `LaureateHQL.renderCertificate` shows the classic certificate as the fallback. No blank modal.
- [ ] No console errors on open, issue, re-issue or download.

When you're done, report back:

- the lines you changed
- the result of each checklist item
- any existing references to `#certQrImg` or `.cert-learner-name` you removed
