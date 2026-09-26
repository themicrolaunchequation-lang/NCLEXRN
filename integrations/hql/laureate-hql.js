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
