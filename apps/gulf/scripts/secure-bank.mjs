// Moves the paid Gulf question bank out of the public files (run by build.mjs after the studio is built).
// Public: data.*.js keeps only questions Q0001 to Q0010; gulf-cfg.*.js keeps edition items numbered 1 to 10.
// Private: the full set is compiled into dist/_worker.js, served only at /api/gulf-content to a signed-in person
// whose crown_entitlements show a valid Gulf pass (or admin). _routes.json limits the worker to /api/*.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

const FREE_MAX = 10;
const num = (id) => { const m = String(id || '').match(/(\d+)/); return m ? +m[1] : 0; };
function literalEnd(src, i) { // index just after the JSON array/object that starts at src[i]
  let depth = 0, j = i, inStr = false, esc = false;
  for (; j < src.length; j++) {
    const c = src[j];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true; else if (c === '[' || c === '{') depth++; else if (c === ']' || c === '}') { depth--; if (depth === 0) return j + 1; }
  }
  throw Error('secure-bank: unterminated literal');
}
const strip = (ds) => ds.map((d) => ({ ...d, qs: [] }));
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex').slice(0, 12);

export function secureBank(out, bootSrc) {
  const A = path.join(out, 'assets');
  const files = fs.readdirSync(A);
  const dataName = files.find((f) => /^data\.[0-9a-f]+\.js$/.test(f));
  const cfgName = files.find((f) => /^gulf-cfg\.[0-9a-f]+\.js$/.test(f));
  if (!dataName || !cfgName) throw Error('secure-bank: data or config file not found');
  const dataSrc = fs.readFileSync(path.join(A, dataName), 'utf8');
  const cfgSrc = fs.readFileSync(path.join(A, cfgName), 'utf8');

  // The final question list, exactly as the browser would see it (the data file filters some items itself).
  const win = {}; vm.runInNewContext(dataSrc, { window: win, Set, JSON, Object, Array });
  const all = win.SNLE_QUESTIONS;
  if (!Array.isArray(all) || all.length < 100) throw Error('secure-bank: unexpected question list');
  const cw = {}; vm.runInNewContext(cfgSrc, { window: cw });
  const extra = (cw.GULF_CONFIG && cw.GULF_CONFIG.extra) || {};

  // Public data file: replace the question literal with the free questions only.
  const key = 'window.SNLE_QUESTIONS=';
  const i = dataSrc.indexOf(key) + key.length;
  const j = literalEnd(dataSrc, i);
  const free = all.filter((q) => /^Q\d+$/.test(q.id) && num(q.id) <= FREE_MAX);
  const publicData = dataSrc.slice(0, i) + JSON.stringify(free) + dataSrc.slice(j);
  const publicExtra = Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, (v || []).filter((q) => num(q.id) <= FREE_MAX)]));
  const publicCfg = 'window.GULF_CONFIG=' + JSON.stringify({ ...cw.GULF_CONFIG, extra: publicExtra }) + ';';

  const rename = (oldName, src, base) => {
    const n = `${base}.${sha(src)}.js`; fs.unlinkSync(path.join(A, oldName)); fs.writeFileSync(path.join(A, n), src); return n;
  };
  // Clinical dossiers: the cases (questions and answers) are paid; titles and summaries stay public.
  const appName = files.find((f) => /^app\.[0-9a-f]+\.js$/.test(f));
  const dosName = files.find((f) => /^dossiers\.[0-9a-f]+\.js$/.test(f));
  let dossiers = null, dossiersLib = null, newApp = appName, newDos = dosName;
  if (appName) {
    const a = fs.readFileSync(path.join(A, appName), 'utf8'), k = 'const CLINICAL_DOSSIERS=', at = a.indexOf(k);
    if (at > -1) { const s0 = at + k.length, e0 = literalEnd(a, s0); dossiers = JSON.parse(a.slice(s0, e0));
      newApp = rename(appName, a.slice(0, s0) + '(window.GULF_DOSSIERS||' + JSON.stringify(strip(dossiers)) + ')' + a.slice(e0), 'app'); }
  }
  if (dosName) {
    const a = fs.readFileSync(path.join(A, dosName), 'utf8'), k = 'window.SNLE_DOSSIERS=', at = a.indexOf(k);
    if (at > -1) { const s0 = at + k.length, e0 = literalEnd(a, s0); dossiersLib = JSON.parse(a.slice(s0, e0));
      newDos = rename(dosName, a.slice(0, s0) + '(window.GULF_DOSSIERS_LIB||' + JSON.stringify(strip(dossiersLib)) + ')' + a.slice(e0), 'dossiers'); }
  }
  const newData = rename(dataName, publicData, 'data');
  const newCfg = rename(cfgName, publicCfg, 'gulf-cfg');
  const bootName = `gulf-boot.${sha(bootSrc)}.js`;
  fs.writeFileSync(path.join(A, bootName), bootSrc);

  // Pages: point to the new files, then let the loader run every studio script after gulf-pre, in order.
  const names = [[dataName, newData], [cfgName, newCfg], [appName, newApp], [dosName, newDos]].filter(([o]) => o);
  let pages = 0;
  for (const f of fs.readdirSync(out).filter((x) => x.endsWith('.html'))) {
    const p = path.join(out, f); let h = fs.readFileSync(p, 'utf8');
    for (const [o, n] of names) h = h.split('/assets/' + o).join('/assets/' + n);
    if (!/\/assets\/(data|dossiers|app)\.[0-9a-f]+\.js/.test(h)) { fs.writeFileSync(p, h); continue; }
    const m = h.match(/<script defer src="\/assets\/gulf-pre\.[0-9a-f]+\.js"><\/script>/);
    if (!m) throw Error('secure-bank: gulf-pre not found in ' + f);
    const at = h.indexOf(m[0]) + m[0].length, head = h.indexOf('</head>', at), zone = h.slice(at, head);
    const rest = [...zone.matchAll(/<script defer src="([^"]+)"><\/script>/g)].map((x) => x[1]);
    h = h.slice(0, at) + `<script defer src="/assets/${bootName}" data-rest='${JSON.stringify(rest)}'></script>` + zone.replace(/<script defer src="[^"]+"><\/script>/g, '') + h.slice(head);
    fs.writeFileSync(p, h); pages++;
  }
  // Service worker and any other text file that names the old files.
  for (const f of ['sw.js']) {
    const p = path.join(out, f); if (!fs.existsSync(p)) continue;
    let s = fs.readFileSync(p, 'utf8'); for (const [o, n] of names) s = s.split(o).join(n);
    if (!s.includes(bootName)) s = s.replace('SHELL=[', 'SHELL=[' + JSON.stringify('/assets/' + bootName) + ',');
    fs.writeFileSync(p, s);
  }

  // Private worker: only /api/gulf-content, everything else is served as static files (see _routes.json).
  const body = JSON.stringify({ questions: all, extra, dossiers, dossiersLib });
  const worker = `// Generated by scripts/secure-bank.mjs. Serves the full Gulf question bank to Gulf Pass holders only.
const SB = 'https://ujeofxfbwivjmgrxqdcl.supabase.co';
const KEY = 'sb_publishable_ie1qqB5QnaqUZPitNPfQCg__M46e7JL';
const BODY = ${JSON.stringify(body)};
const H = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff' };
const no = (status, error) => new Response(JSON.stringify({ error }), { status, headers: H });
export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (u.pathname !== '/api/gulf-content') return env.ASSETS.fetch(req);
    if (req.method !== 'GET') return no(405, 'method_not_allowed');
    const auth = req.headers.get('authorization') || '';
    if (!/^Bearer [A-Za-z0-9._-]{20,}$/.test(auth)) return no(401, 'sign_in_required');
    let e;
    try {
      const r = await fetch(SB + '/rest/v1/rpc/crown_entitlements', { method: 'POST', headers: { apikey: KEY, Authorization: auth, 'Content-Type': 'application/json' }, body: '{}' });
      if (!r.ok) return no(401, 'sign_in_required');
      e = await r.json();
    } catch { return no(503, 'try_again'); }
    const now = Date.now();
    const ok = e && e.signed_in && (e.admin === true || Object.values(e.gulf || {}).some((d) => Date.parse(d) > now));
    if (!ok) return no(403, 'gulf_pass_required');
    return new Response(BODY, { headers: H });
  },
};
`;
  fs.writeFileSync(path.join(out, '_worker.js'), worker);
  fs.writeFileSync(path.join(out, '_routes.json'), JSON.stringify({ version: 1, include: ['/api/*'], exclude: [] }));
  return { free: free.length, total: all.length, extra: Object.values(extra).reduce((n, v) => n + (v || []).length, 0), pages, newData, newCfg, bootName, workerKB: Math.round(worker.length / 1024) };
}
