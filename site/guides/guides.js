/* Guides and free tools: quick checks, list filter and the improvement calculators. No tracking, no network. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Quick check: each .g-q has buttons; the right one carries data-ok.
  const quiz = $('.g-quiz');
  if (quiz) {
    let done = 0, right = 0; const total = $$('.g-q', quiz).length, score = $('.g-score');
    quiz.addEventListener('click', (e) => {
      const b = e.target.closest('.g-q button'); if (!b) return;
      const q = b.closest('.g-q'); if (q.dataset.done) return;
      q.dataset.done = '1'; done++;
      const ok = b.hasAttribute('data-ok'); if (ok) right++;
      b.classList.add(ok ? 'ok' : 'no'); $$('button[data-ok]', q).forEach((x) => x.classList.add('ok'));
      const why = $('.g-why', q); if (why) why.hidden = false;
      if (score && done === total) score.textContent = `You got ${right} out of ${total}.` + (right === total ? ' Well done.' : ' Try the free MedLex lessons to lock it in.');
    });
  }

  // Filter a list of links as you type.
  const filter = $('.g-filter');
  if (filter) filter.addEventListener('input', () => {
    const v = filter.value.trim().toLowerCase();
    $$('[data-f]').forEach((li) => { li.hidden = v && !li.dataset.f.includes(v); });
  });

  const nums = (t) => String(t || '').split(/[\s,;]+/).map(Number).filter((n) => Number.isFinite(n));
  const fmt = (n, d = 3) => Number.isFinite(n) ? (Math.abs(n) >= 1000 ? n.toFixed(0) : n.toFixed(d)) : '—';
  const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
  const mrBar = (a) => { let s = 0; for (let i = 1; i < a.length; i++) s += Math.abs(a[i] - a[i - 1]); return s / (a.length - 1); };
  const fact = (v, l) => `<div class="g-fact"><b>${v}</b><span>${l}</span></div>`;
  // Inverse standard normal (Acklam's rational approximation).
  function invNorm(p) {
    const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
    const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
    const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
    const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
    const pl = 0.02425;
    if (p <= 0 || p >= 1) return NaN;
    if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - pl) { const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    const q = p - 0.5, r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }

  const calc = $('[data-calc]'); if (!calc) return;
  const out = $('.g-out'), kind = calc.dataset.calc;
  const run = () => {
    const f = (n) => $(`[name="${n}"]`, calc)?.value;
    if (kind === 'cpk') {
      const x = nums(f('data')), lsl = parseFloat(f('lsl')), usl = parseFloat(f('usl'));
      if (x.length < 2 || !(Number.isFinite(lsl) || Number.isFinite(usl))) { out.innerHTML = '<p>Enter at least 2 values and one specification limit.</p>'; return; }
      const m = mean(x), sOverall = sd(x), sWithin = mrBar(x) / 1.128;
      const idx = (s) => { const up = Number.isFinite(usl) ? (usl - m) / (3 * s) : NaN, lo = Number.isFinite(lsl) ? (m - lsl) / (3 * s) : NaN;
        return { both: Number.isFinite(usl) && Number.isFinite(lsl) ? (usl - lsl) / (6 * s) : NaN, k: Math.min(...[up, lo].filter(Number.isFinite)) }; };
      const w = idx(sWithin), o = idx(sOverall);
      out.innerHTML = '<div class="g-facts">' + fact(fmt(w.both, 2), 'Cp (within, from moving range)') + fact(fmt(w.k, 2), 'Cpk (within)') + fact(fmt(o.both, 2), 'Pp (overall)') + fact(fmt(o.k, 2), 'Ppk (overall)') +
        fact(fmt(m), 'Mean') + fact(fmt(sOverall), 'Overall standard deviation') + fact(fmt(sWithin), 'Within standard deviation (MR̄ ÷ 1.128)') + fact(x.length, 'Values') + '</div>' +
        `<p>${w.k >= 1.33 ? 'Cpk is 1.33 or more: the process usually sits well inside the limits.' : w.k >= 1 ? 'Cpk is between 1 and 1.33: the process fits, with little margin.' : 'Cpk is below 1: some results are likely to fall outside the limits.'} Check the process is stable on a control chart before trusting these numbers.</p>`;
    } else if (kind === 'sigma') {
      const u = parseFloat(f('units')), o = parseFloat(f('opps')), dft = parseFloat(f('defects'));
      if (!(u > 0 && o > 0 && dft >= 0)) { out.innerHTML = '<p>Enter units, opportunities per unit and defects.</p>'; return; }
      const dpmo = dft / (u * o) * 1e6, yieldP = 1 - dft / (u * o), lt = invNorm(yieldP);
      out.innerHTML = '<div class="g-facts">' + fact(fmt(dpmo, 0), 'Defects per million opportunities (DPMO)') + fact((yieldP * 100).toFixed(3) + '%', 'Yield (no defect)') +
        fact(Number.isFinite(lt) ? fmt(lt + 1.5, 2) : (dft === 0 ? '6+' : '—'), 'Sigma level (with the usual 1.5 shift)') + fact(Number.isFinite(lt) ? fmt(lt, 2) : '—', 'Sigma level (no shift)') + '</div>' +
        '<p>The 1.5 shift is a Six Sigma convention for long-term drift. Say which version you report.</p>';
    } else if (kind === 'imr') {
      const x = nums(f('data'));
      if (x.length < 3) { out.innerHTML = '<p>Enter at least 3 values, in time order.</p>'; return; }
      const m = mean(x), mr = mrBar(x), ucl = m + 2.66 * mr, lcl = m - 2.66 * mr, mrUcl = 3.267 * mr;
      const outside = x.map((v, i) => [v, i]).filter(([v]) => v > ucl || v < lcl);
      const W = 640, H = 220, pad = 30, lo = Math.min(lcl, ...x), hi = Math.max(ucl, ...x), Y = (v) => H - pad - (v - lo) / (hi - lo || 1) * (H - 2 * pad), X = (i) => pad + i * (W - 2 * pad) / (x.length - 1);
      const line = (v, c, t) => `<line x1="${pad}" x2="${W - pad}" y1="${Y(v)}" y2="${Y(v)}" stroke="${c}" stroke-dasharray="${t}"/>`;
      const svg = `<svg class="g-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Individuals control chart">${line(ucl, '#c0392b', '5 4')}${line(m, '#2e8b57', '0')}${line(lcl, '#c0392b', '5 4')}` +
        `<polyline fill="none" stroke="currentColor" stroke-width="1.5" points="${x.map((v, i) => X(i) + ',' + Y(v)).join(' ')}"/>` +
        x.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="3.5" fill="${v > ucl || v < lcl ? '#c0392b' : 'currentColor'}"/>`).join('') +
        `<text x="${W - pad}" y="${Y(ucl) - 4}" text-anchor="end" font-size="11" fill="#c0392b">UCL ${fmt(ucl, 2)}</text><text x="${W - pad}" y="${Y(lcl) + 13}" text-anchor="end" font-size="11" fill="#c0392b">LCL ${fmt(lcl, 2)}</text></svg>`;
      out.innerHTML = '<div class="g-facts">' + fact(fmt(m), 'Centre line (mean)') + fact(fmt(ucl), 'Upper control limit') + fact(fmt(lcl), 'Lower control limit') + fact(fmt(mr), 'Average moving range (MR̄)') + fact(fmt(mrUcl), 'Moving range upper limit') + fact(outside.length, 'Points outside the limits') + '</div>' + svg +
        `<p>${outside.length ? 'Points outside the limits suggest a special cause: look at what happened at those times.' : 'No points are outside the limits. Also look for runs of 8 or more on one side of the centre line.'} Limits use 2.66 × MR̄ and 3.267 × MR̄, the standard constants for individuals charts.</p>`;
    }
  };
  calc.addEventListener('input', run); calc.addEventListener('submit', (e) => { e.preventDefault(); run(); }); run();
})();
