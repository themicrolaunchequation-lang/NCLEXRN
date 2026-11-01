/* ---------- Tool windows: minimise when the screen changes, a dock to bring them back, and Close all ---------- */
// Minimised windows stay mounted (hidden), so anything typed in them is kept until the learner closes them.
function HCAWinTitle(k) { return ({ board: 'Board', canvas: 'Canvas', timer: 'Timer', planner: 'Planner', blurt: 'Blurt', labs: 'Labs', techniques: 'Techniques', calc: 'Calculator', guide: 'Desk guide', appguide: 'App guide', saved: 'Your work' })[k] || k; }
function HCAWinIcon(k) { return ({ board: 'layout-column-line', canvas: 'edit-line', timer: 'timer-line', planner: 'time-line', blurt: 'brain-line', labs: 'heart-pulse-line', techniques: 'lightbulb-line', calc: 'stethoscope-line', saved: 'shield-check-line' })[k] || 'question-line'; }
function HCAWinOpenKeys(s = HCA7UI.state) { const d = s.desk || {}, keys = Object.keys(d).filter(k => d[k]); if (s.calc) keys.push('calc'); return keys; }
// called by HCA7Set: a window that has just opened or closed is never left minimised
function HCAWinFix(prev) {
  const s = HCA7UI.state, m = s.min; if (!m) return;
  const was = k => k === 'calc' ? !!prev.calc : !!(prev.desk || {})[k], now = k => k === 'calc' ? !!s.calc : !!(s.desk || {})[k];
  let n = null;
  for (const k of Object.keys(m)) if (m[k] && (!now(k) || !was(k))) { n = n || { ...m }; n[k] = false; }
  if (n) HCA7UI.state = { ...s, min: n };
}
function HCAWinIsMin(k) { return !!(HCA7UI.state.min || {})[k]; }
function HCAWinMinimise(k) { HCA7Set(s => ({ min: { ...(s.min || {}), [k]: true } })); }
function HCAWinRestore(k) { HCA7Set(s => ({ min: { ...(s.min || {}), [k]: false } })); }
function HCAWinMinimiseAll() { const keys = HCAWinOpenKeys(); if (keys.length) HCA7Set(s => { const m = { ...(s.min || {}) }; keys.forEach(k => { m[k] = true; }); return { min: m }; }); }
function HCAWinOnRoute() { HCAWinMinimiseAll(); }
function HCAWinCloseAll() {
  const s = HCA7UI.state;
  if ((s.desk || {}).blurt && document.querySelector('.hca8-win textarea')?.value && !confirm('Close all windows? Text in the Blurt pad that you have not saved will be lost.')) return;
  HCA7Set({ desk: {}, calc: false, min: {} });
}
// sidebar and command openers: a minimised window comes back instead of closing
function HCAWinToggle(k) {
  const s = HCA7UI.state, open = k === 'calc' ? !!s.calc : !!(s.desk || {})[k];
  if (open && HCAWinIsMin(k)) return HCAWinRestore(k);
  if (k === 'calc') HCA7Set(x => ({ calc: !x.calc })); else HCA7Set(x => ({ desk: { ...(x.desk || {}), [k]: !(x.desk || {})[k] } }));
}
function HCAWinMinBtn({ id, title }) {
  return HC('button', { type: 'button', className: 'hca3-icon-btn', 'aria-label': `Minimise ${title}`, title: 'Minimise', onClick: () => HCAWinMinimise(id) }, HCAIcon('subtract-line'));
}
function HCAWinDock() {
  const ui = HCA7Use(), keys = HCAWinOpenKeys(ui), min = ui.min || {};
  if (!keys.length) return null;
  const hidden = keys.filter(k => min[k]);
  return HC('div', { className: 'hcaw-dock', role: 'toolbar', 'aria-label': 'Open tool windows' },
    hidden.map(k => HC('button', { key: k, type: 'button', className: 'hcaw-chip', title: `Show ${HCAWinTitle(k)}`, onClick: () => HCAWinRestore(k) }, HCAIcon(HCAWinIcon(k)), HC('span', {}, HCAWinTitle(k)))),
    hidden.length < keys.length && HC('button', { type: 'button', className: 'hcaw-chip', title: 'Minimise every open window', onClick: HCAWinMinimiseAll }, HCAIcon('subtract-line'), HC('span', {}, 'Minimise all')),
    HC('button', { type: 'button', className: 'hcaw-chip hcaw-close', title: 'Close every tool window', onClick: HCAWinCloseAll }, HCAIcon('close-line'), HC('span', {}, 'Close all windows')));
}
