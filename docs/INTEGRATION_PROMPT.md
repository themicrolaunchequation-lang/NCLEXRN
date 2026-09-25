# Integration prompt: Laureate certificate + ID badge generators

Copy everything below the line into the AI assistant (or give it to the developer) that builds your external app.
Fill in the three `[…]` items at the top first.

---

## Your task

Integrate two ready-made generators into **[APP NAME]**, built with **[STACK, e.g. Next.js 14 + React / Vue 3 / Laravel + Blade / Flutter web]**:

1. **Laureate certificate**: a Lean Six Sigma certificate, A4 landscape (297 × 210 mm).
2. **Laureate ID badge**: a CR80 card (54 × 85.6 mm) with a front and a back.

The data comes from **[WHERE CERTIFIED PEOPLE LIVE IN THE APP, e.g. the `enrollments` table / Supabase `certificates` / our REST API `/api/graduates`]**.

Both generators are plain JavaScript files that draw onto an HTML `<canvas>`. They have no framework dependency and no build step, and they never touch the DOM except the canvas you give them. **Do not redesign or re-implement them.** Load them, pass the right data, and export the canvas.

### Source files (from GitHub repo `themicrolaunchequation-lang/nclexrn`)

| File | What it is |
|---|---|
| `certificate-engine/laureate-render.js` | Certificate renderer. Exposes `window.LaureateCertificate`. The badge renderer also uses its seal, fonts and helpers. |
| `id-badge/badge-render.js` | Badge renderer. Exposes `window.LaureateBadge`. **Load it after `laureate-render.js`.** |
| `certificate-engine/index.html`, `id-badge/index.html` | Reference apps showing forms, preview, PNG/PDF/ZIP export and batch CSV. Read them to see correct usage; don't ship them as they are. |

Copy the two `*-render.js` files into the app's static assets, for example `public/vendor/laureate/`. They set globals and also `module.exports`, so they work as `<script>` tags and as side-effect imports (`import '/vendor/laureate/laureate-render.js'`). Keep their load order.

### Dependencies

- **Fonts (required).** Google Fonts: Cinzel, Cormorant Garamond, Pinyon Script, Oswald, Shippori Mincho. Call `await LaureateCertificate.loadFonts()` before the first draw. It injects the stylesheet (`LaureateCertificate.FONTS_CSS`) and waits for the faces to load. If your CSP blocks `fonts.googleapis.com` and `fonts.gstatic.com`, self-host the same families under the same names.
- **QR code on the badge back (recommended).** Load `qrcode-generator` 1.4.4, which provides `window.qrcode`, before drawing badges. For example from `https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js` or `npm i qrcode-generator` assigned to `window.qrcode`. Without it, the badge draws a dashed "QR code" placeholder.
- **PDF export.** `jspdf` 2.x.
- **ZIP export (optional).** `jszip` 3.x.

### API

```js
// Certificate: 1123 × 794 logical units (A4 landscape at 96 dpi)
await LaureateCertificate.loadFonts();
const canvas = await LaureateCertificate.renderToCanvas(certData, 3); // 3369 × 2382 px, ~288 dpi
LaureateCertificate.draw(ctx, certData, scale);   // synchronous; draw into your own canvas sized W*scale × H*scale
                                                   // (images must already be loaded; use prepare() first)
const ready = await LaureateCertificate.prepare(certData); // resolves logo URL/Blob → image
LaureateCertificate.autoCredential('Green', '2026-09-25', 4718); // "LSS-GB-2026-04718"

// Badge: 540 × 856 logical units per side
const { front, back } = await LaureateBadge.renderToCanvases(badgeData, 1.25); // 675 × 1070 px each, ~318 dpi
LaureateBadge.drawFront(ctx, preparedData, scale); LaureateBadge.drawBack(ctx, preparedData, scale);
const prepared = await LaureateBadge.prepare(badgeData); // resolves logo + photo
LaureateBadge.qrPayload(badgeData); // the exact string encoded in the QR code
```

Every field is optional. Missing fields fall back to `LaureateCertificate.DEFAULTS` / `LaureateBadge.DEFAULTS`. **Those defaults are sample content** (Alexandra M. Reynolds, Aurelian Institute, aurelian.example). Always pass real values.

### Certificate data: map the app's fields to these keys

| Key | Type | Replace with |
|---|---|---|
| `name` | string | Recipient's full legal name. It auto-shrinks to fit. |
| `belt` | `'Yellow' \| 'Green' \| 'Black' \| 'Master Black'` | The level earned. It sets the belt colours, the sash and the credential code. |
| `date` | `'YYYY-MM-DD'` | Date conferred. It prints as "25 September 2026". |
| `cred` | string | **Unique credential number from the app's database.** Never generate it client-side for real issuance. |
| `institute` | string | Your organisation's legal name. |
| `subtitle` | string | Line under "Certificate", e.g. `of Professional Certification`. |
| `statement` | string | The certifying sentence. Up to about 4 lines; it shrinks to fit. It should end so that "Lean Six Sigma ___ Belt" completes it. |
| `verify` | string | Public verification address, e.g. `yourdomain.com/verify`. It prints in the footer. |
| `sig1Script`, `sig1Name`, `sig1Title` | string | Left signatory: script-font signature, printed name and title. |
| `sig2Script`, `sig2Name`, `sig2Title` | string | Right signatory. |
| `seal` | boolean | Holographic seal, bottom right. |
| `sealTop`, `sealBottom`, `sealLine1`, `sealLine2` | string | Seal texts: top arc, bottom arc and the two embossed centre lines. |
| `hanko`, `hankoText` | boolean, string (1–4 chars) | Red approval stamp over the left signature. Default `認定` ("certified"). Set `hanko:false` to remove it. |
| `logo` | URL, data: URL, Blob/File, `HTMLImageElement`, `ImageBitmap` or canvas | Your logo. It sits top-left inside the frame, up to 150 × 84 units. |
| `sealLogo` | boolean | `true` puts the logo inside the seal (replacing the centre text) instead of the corner. |

### Badge data

| Key | Type | Replace with |
|---|---|---|
| `name`, `title`, `organization` | string | Holder's name, job title, and department or company. |
| `belt`, `cred` | as above | |
| `issued`, `expires` | `'YYYY-MM-DD'` | Print as `25 SEP 2026`. |
| `photo` | same types as `logo` | Head-and-shoulders photo, portrait, at least 600 × 750 px. It is cover-cropped to 4:5. Without a photo the badge shows initials. |
| `logo` | image | Shown on an ivory plate, top-left on the front and top-centre on the back. |
| `institute`, `tagline` | string | Header text. `tagline` follows "LEAN SIX SIGMA ·". |
| `verify` | string | Printed on the back and used for the QR code. |
| `qrText` | string | Overrides the QR payload. The default is `https://{verify}/{cred}`. |
| `returnNotice`, `contact` | string | Back-of-card text. `contact` default is a placeholder: replace it. |
| `seal` | boolean | Small holographic seal on the photo corner. |

### Adding or replacing the logo

- Accept PNG (transparent background preferred), SVG or JPG, at least 600 px wide. Keep 3 MB as a sensible upload limit.
- Pass it as a `data:` URL, a `File`/`Blob` from an `<input type="file">`, or a URL.
- **If you pass a URL from another origin, it must be served with CORS** (`Access-Control-Allow-Origin`). Otherwise the canvas becomes "tainted" and `toBlob()` / `toDataURL()` throw a SecurityError. The renderer already sets `crossOrigin="anonymous"` for http(s) URLs. The simplest safe option is to serve logos from your own origin or convert them to data URLs server-side.
- Store the organisation's logo once, for example in an organisation settings row, and inject it into every render. Don't ask users to upload it for each certificate.
- Very wide logos (wordmarks) fit best in the corner. Square marks work best with `sealLogo: true`.

### Exporting

```js
// PNG
const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));

// Certificate PDF (A4 landscape)
const pdf = new jspdf.jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
pdf.addImage(canvasAt2_5x.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, 841.89, 595.28);

// Badge PDF (card size, front then back)
const card = new jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: [54, 85.6] });
card.addImage(front.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 54, 85.6);
card.addPage([54, 85.6], 'portrait');
card.addImage(back.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 54, 85.6);
```

For batches, loop and add pages to one PDF. Render certificates one at a time (`await` each), not all at once, to keep memory low.

### Where to put it in the app

1. **Issue flow (admin).** When a person passes, create the certificate record server-side with a unique `cred` (format `LSS-{YB|GB|BB|MBB}-{YYYY}-{serial}`), `belt`, `date` and the person's name. Then show a preview (a `<canvas>` drawn with `LaureateCertificate.draw`) and buttons for **Download PDF** and **Download PNG**. Add the same for the badge, with a photo upload.
2. **Learner dashboard.** "My certificate" and "My badge" cards that render from the stored record and offer downloads.
3. **Public verification page** at the address you put in `verify`, e.g. `/verify/:cred`. It looks up `cred` and shows the name, belt, issue date, expiry and status (valid, expired or revoked). **The QR code on every badge points here, so this route must exist before badges are printed.**
4. **Bulk issue (optional).** Admin uploads a CSV (`name, belt, date` for certificates; `name, title, organization, belt, issued, expires, photo` for badges) plus photos. The server assigns credentials, and the client renders one combined PDF. `index.html` in each folder shows the full batch flow.

A React component to start from:

```jsx
import { useEffect, useRef } from 'react';

export function CertificatePreview({ data }) {
  const ref = useRef(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const LC = window.LaureateCertificate;
      await LC.loadFonts(data);
      const ready = await LC.prepare(data);
      if (cancelled || !ref.current) return;
      LC.draw(ref.current.getContext('2d'), ready, 2);
    })();
    return () => { cancelled = true; };
  }, [data]);
  return <canvas ref={ref} width={1123 * 2} height={794 * 2} style={{ width: '100%', height: 'auto' }} />;
}
```

**Server-side rendering.** The renderers need a browser canvas and web fonts. To produce files on the server (for email attachments, say), run them in headless Chromium (Playwright or Puppeteer): load a minimal page with the two scripts, call `renderToCanvas`, and return `canvas.toDataURL()`. Don't port them to `node-canvas` unless you register the same fonts.

### Branding changes

- **Colours:** edit `NAVY`, `GOLD` and `PAPER` at the top of `laureate-render.js`, and `GOLD_LIGHT` / `IVORY` in `badge-render.js`.
- **Belt levels:** edit the `BELTS` map (`name`, `code`, `color`, `ink` for text on the belt, `stitch`). For example, add `'White': { name: 'White Belt', code: 'WB', color: '#EDEAE2', ink: '#1B2740', stitch: 'rgba(27,39,64,0.35)' }`, and add the option to your belt dropdown and to `normBelt()` if you use CSV import.
- **Layout:** the layout uses fixed coordinates tuned for print. Don't move elements unless asked, and never switch to HTML/CSS screenshots (html2canvas and similar), which break the engraving, seal and fonts.

### Before you finish, check that

- [ ] No sample content remains anywhere users see it: no "Alexandra M. Reynolds", "Aurelian Institute", "aurelian.example", "Helena Voss", "Marcus Adeyemi" or "[Street address · City · Phone]".
- [ ] Fonts finish loading before the first export. The certificate title must be the engraved italic serif, not a fallback font.
- [ ] Logo upload works and appears in the PNG and the PDF. A cross-origin logo exports without a SecurityError.
- [ ] Each credential number is unique and stored, and its QR code opens the live verification page for that person.
- [ ] The certificate PDF is one A4 landscape page. The badge PDF is two 54 × 85.6 mm pages per person.
- [ ] A 60-character name and a 6-line statement still fit (the renderers shrink text; confirm visually).
- [ ] Downloads work in your hosting context. Sandboxed iframes block `<a download>`, so trigger downloads from a top-level page.
