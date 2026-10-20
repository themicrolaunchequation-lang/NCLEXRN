// Accessibility audit of every supplied lesson deck and quest (WCAG 2 A/AA). usage: node medlex-lessons-axe.mjs [light|dark]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const AXE = fs.readFileSync('/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8'), scheme = process.argv[2] || 'light';
const decks = JSON.parse(fs.readFileSync('apps/medlex/learn/decks.json', 'utf8')).map(d => d.file.replace(/\.html$/, '')).concat(['quest-prefixes', 'quest-roots', 'quest-suffixes']);
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server', '--ignore-certificate-errors', '--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:8443'] });
const ctx = await br.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme, ignoreHTTPSErrors: true }); const agg = {};
for (const f of decks) {
  const p = await ctx.newPage(); await p.goto(`https://medlex.healthcarecrownacademy.co.uk/medlex/learn/${f}.html`, { waitUntil: 'load' }); await p.waitForTimeout(700);
  await p.evaluate(AXE); const v = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] })).violations.map(x => ({ id: x.id, impact: x.impact, n: x.nodes.length, sel: x.nodes.slice(0, 2).map(n => String(n.target).slice(0, 60)), help: x.help })));
  for (const x of v) { const k = x.id + ' | ' + x.impact; (agg[k] ||= { files: [], nodes: 0, sel: x.sel, help: x.help }); agg[k].files.push(f); agg[k].nodes += x.n; }
  await p.close();
}
for (const [k, a] of Object.entries(agg).sort((a, b) => b[1].nodes - a[1].nodes)) console.log(k.padEnd(34), 'files', String(a.files.length).padStart(2), 'nodes', String(a.nodes).padStart(4), '|', a.help, '|', a.sel.join(' ; '));
console.log('violation types:', Object.keys(agg).length);
await br.close();
