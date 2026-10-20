/* Runs data-oc="fn(args)" on click, replacing inline onclick attributes. Arguments: numbers, quoted strings, true/false/null, or nested calls. No eval. */
(function () {
  'use strict';
  function parse(src) {
    let i = 0; const ws = () => { while (src[i] === ' ') i++; };
    function value() {
      ws(); const c = src[i];
      if (c === "'" || c === '"') { let s = ''; i++; while (i < src.length && src[i] !== c) { if (src[i] === '\\') i++; s += src[i++]; } i++; return { v: s }; }
      const m = /^(-?\d+(?:\.\d+)?|true|false|null|this|event|[A-Za-z_$][\w$]*)/.exec(src.slice(i)); if (!m) throw new Error('bad argument'); i += m[0].length;
      if (src[i] === '(') { i++; const args = []; ws(); if (src[i] === ')') i++; else { for (;;) { args.push(value()); ws(); if (src[i] === ',') { i++; continue; } if (src[i] === ')') { i++; break; } throw new Error('bad call'); } } return { call: m[0], args }; }
      const w = m[0]; if (/^-?\d/.test(w)) return { v: parseFloat(w) }; if (w === 'true') return { v: true }; if (w === 'false') return { v: false }; if (w === 'null') return { v: null }; return { ref: w };
    }
    const seq = []; for (;;) { seq.push(value()); ws(); if (src[i] === ';') { i++; ws(); if (i >= src.length) break; continue; } break; } return { seq };
  }
  function run(n, ctx) {
    if (n.seq) { let r; n.seq.forEach(x => { r = run(x, ctx); }); return r; }
    if ('v' in n) return n.v;
    if (n.ref) return n.ref === 'this' ? ctx.el : n.ref === 'event' ? ctx.ev : window[n.ref];
    const fn = window[n.call]; if (typeof fn !== 'function') return undefined;
    return fn.apply(ctx.el, n.args.map(a => run(a, ctx)));
  }
  document.addEventListener('click', ev => {
    const el = ev.target.closest && ev.target.closest('[data-oc]'); if (!el) return;
    try { run(parse(el.getAttribute('data-oc')), { el, ev }); } catch (e) { console.warn('data-oc', e.message); }
  });
})();
