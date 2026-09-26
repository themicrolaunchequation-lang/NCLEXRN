# Prompt: replace the LSS Toolkit certificate with the Laureate design

Paste everything below the line into the AI agent that edits the **LSS Master Toolkit** (`LSS-Toolkit-v14.html`, Health Quality Leaders Ltd).

---

## Goal

Replace the HTML/CSS certificate that `renderCertificate(cert)` builds inside `#certPaperWrap` with the **Laureate** certificate. Laureate is drawn on a `<canvas>` by three small JavaScript files. Also add an optional **ID badge**.

**Keep all existing data flow exactly as it is:** `lss_reg`, `lss_exam`, `lss_cert`, `issueCertificate(reissue)`, `randCode()`, `openCert()`, the admin preview, the pass mark and the "Re-issue with current name" button. Only the drawing changes.

Reference implementation: repo `themicrolaunchequation-lang/nclexrn`, branch `claude/loving-lamport-ejff7v`. The working demo is `integrations/hql/demo.html`. It mirrors `issueCertificate()` and draws with the toolkit's real crest and signature.

## Files to bring in

| File | Purpose |
|---|---|
| `certificate-engine/laureate-render.js` | Certificate renderer (`window.LaureateCertificate`). |
| `id-badge/badge-render.js` | ID badge renderer (`window.LaureateBadge`). Optional; only needed for badges. |
| `integrations/hql/laureate-hql.js` | Adapter (`window.LaureateHQL`). Turns an `lss_cert` record into the Laureate layout using the toolkit's constants, `CREST_URI`, `SIG_URI` and the existing QR payload. |

The toolkit is a single self-contained HTML file, so **inline the three files as `<script>` blocks**, in this order:

1. The toolkit's existing inline `qrcode.js`. It already exposes `qrcode(typeNumber, level)`, which is the API the renderers call. They find it whether it is declared with `var`, `function` or `const`.
2. `laureate-render.js`
3. `badge-render.js`
4. `laureate-hql.js`

`CREST_URI` and `SIG_URI` only need to exist by the time a certificate is drawn, not when these scripts load. The adapter reads the top-level `const CREST_URI` / `const SIG_URI` directly. Don't copy or re-encode the images.

Add to `<head>`:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=Pinyon+Script&family=Oswald:wght@500;700&family=Shippori+Mincho:wght@700&display=swap">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

jsPDF is only needed for **Download PDF**. If the toolkit must work fully offline, inline jsPDF too, or offer PNG only. The fonts are required for the engraved look. If they can't load, the canvas falls back to Georgia and similar fonts, which still works but looks plainer.

## Code changes

### 1. Replace the template in `renderCertificate`

Keep the old function under a new name so it can be restored in one line:

```javascript
// was: function renderCertificate(cert){ ... innerHTML template ... paintAssets(); renderCertQr(cert); }
const renderCertificateClassic = renderCertificate;   // keep only if you want a fallback toggle

function renderCertificate(cert){
  const wrap = document.getElementById("certPaperWrap");
  LaureateHQL.renderCertificate(wrap, cert).catch(err => {
    console.warn("Laureate render failed, using classic certificate:", err);
    renderCertificateClassic(cert);
  });
}
```

- `LaureateHQL.renderCertificate` waits for the fonts, draws at 2× for a crisp preview and replaces the wrapper's contents with `<canvas id="certPaper" class="laureate-cert-canvas">`.
- `paintAssets()` and `renderCertQr()` are no longer needed for the certificate: the crest, signature and QR code are drawn on the canvas. Leave them in place for any other screens that use `data-asset` images.
- Names are drawn as canvas text, so they can't inject HTML. `escapeHtmlLocal` isn't needed on this path.

### 2. How the toolkit fields land on the certificate (the adapter does this)

| Toolkit source | Where it appears |
|---|---|
| `cert.name` (from `lss_reg.name`) | Large name under "This is to certify that". It auto-shrinks for long names. |
| `cert.org` (from `lss_reg.org`) | Small caps line under the name. Omitted when empty. |
| `COURSE_TITLE` | Programme line with the green belt swatch: "Lean Six Sigma Green Belt in Healthcare". |
| `ISSUER` | Header, signature block and QR payload. |
| `CREST_URI` | Crest, top-left inside the engraved frame. |
| `SIG_URI` | Signature above "Authorised Course Director / Health Quality Leaders Ltd". |
| `cert.score`, `cert.preview` | Footer "Assessment 96% · Passed", or "Preview (admin)". |
| `cert.code` | Footer "Certificate ID LSSGB-XXXX-XXXX". |
| `cert.issuedAt` | Footer "Date issued 26 September 2026". |
| `cert.preview === true` | Red diagonal **SPECIMEN** overprint, replacing the `LSS • GB` watermark. |
| QR payload | **Unchanged**: the same multi-line text as `renderCertQr()` (name, org, course, issuer, score, ID, issued date). |
| Disclaimer | The original "Educational Certificate of Completion…" text, in two lines at the bottom. |

To change any wording without editing the renderer, call this once at startup (all keys are optional):

```javascript
LaureateHQL.configure({
  courseTitle: COURSE_TITLE,            // keep in sync with the toolkit constant
  issuer: ISSUER,
  beltLabel: "Green Belt · Healthcare", // text on the corner sash
  subtitle: "of Completion",
  statement: "has successfully completed the professional learning program and assessment for",
  learning: "demonstrating applied competence across Define, Measure, Analyze, Improve, and Control, including statistical process control, capability analysis, and root-cause methods.",
  directorTitle: "Authorised Course Director",
  disclaimer: "Educational Certificate of Completion. …",
  watermark: "LSS • GB",
  sealTop: "LEAN SIX SIGMA", sealBottom: "HEALTHCARE · GREEN BELT", sealLine1: "OFFICIAL", sealLine2: "CERTIFIED",
  belt: "Green"                         // "Yellow" | "Green" | "Black" | "Master Black" for other courses
});
```

To use a different crest or signature, pass `crest:` or `signature:` with a data URI or URL. Otherwise the adapter uses `CREST_URI` and `SIG_URI`.

### 3. Download buttons in the certificate modal

```html
<button type="button" id="certDownloadPdf">Download PDF</button>
<button type="button" id="certDownloadPng">Download PNG</button>
<button type="button" id="certDownloadBadge">Download ID badge</button>
```

```javascript
$("certDownloadPdf").addEventListener("click", () => LaureateHQL.downloadCertificate(getCert(), "pdf"));
$("certDownloadPng").addEventListener("click", () => LaureateHQL.downloadCertificate(getCert(), "png"));
$("certDownloadBadge").addEventListener("click", () => LaureateHQL.downloadBadge(getCert()));
```

- **PDF:** one A4 landscape page.
- **PNG:** 3369 × 2382 px (about 288 dpi).
- **Badge:** a 54 × 85.6 mm PDF, front then back. The badge uses the same name, organisation, ID, date, score, crest and QR payload.
- Filenames are `HQL-Certificate_<name>_<code>.pdf/.png` and `HQL-Badge_<name>.pdf`.
- Disable a button while its download is running.

To show the badge inside the modal as well: `LaureateHQL.renderBadge(document.getElementById("certBadgeWrap"), getCert())`.

### 4. Printing

If the modal has a Print button, update its print CSS so the canvas fills a landscape page:

```css
@media print {
  @page { size: A4 landscape; margin: 0; }
  #certPaperWrap canvas { width: 100% !important; height: auto !important; box-shadow: none !important; }
}
```

The screen canvas is drawn at 2×, which prints fine. For best quality, point Print at the PDF download instead.

### 5. What not to change

- Don't change `issueCertificate`, `randCode`, the storage keys, the pass mark or the admin-preview rules. Re-issue already works: it writes a new `cert.name` and `cert.code`, and `renderCertificate(cert)` redraws.
- Don't move coordinates inside `laureate-render.js`. The layout shrinks the statement, programme line and learning text to fit, and it is tuned for print.
- Don't screenshot the old HTML with html2canvas or similar.

## Test (browser console, after the change)

```javascript
const testCert = { issued: true, name: "Dr. Jane Doe", org: "Metropolitan Healthcare Trust",
  score: 96, preview: false, code: "LSSGB-9K2M-7XLP", issuedAt: Date.now() };
await LaureateHQL.renderCertificate(document.getElementById("certPaperWrap"), testCert);
console.log("canvas:", document.querySelector("#certPaperWrap canvas")?.width === 2246);
console.log("qr text:", LaureateHQL.qrPayload(testCert).includes("ID: LSSGB-9K2M-7XLP"));
await LaureateHQL.renderCertificate(document.getElementById("certPaperWrap"), { ...testCert, preview: true, code: "PREVIEW-9K2M-7XLP" }); // SPECIMEN overprint
```

Acceptance checklist:

- [ ] A passing learner sees their **registered name** and organisation. After editing the name in settings, "Re-issue with current name" shows the new name and a new code.
- [ ] Admin preview for a non-passing user shows **SPECIMEN**, "Preview (admin)" and a `PREVIEW-` code.
- [ ] The crest (top-left) and the course director signature (bottom-left) appear, with no white box around the signature.
- [ ] Scanning the QR code with a phone shows the same text as before.
- [ ] The PDF is one A4 landscape page, the PNG is 3369 × 2382, and the badge PDF has two card-size pages.
- [ ] A 60-character name still fits on one line.
- [ ] With the network off, the certificate still renders (fallback fonts), and the classic template is used only if rendering throws.
