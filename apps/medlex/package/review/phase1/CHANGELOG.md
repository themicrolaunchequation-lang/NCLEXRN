# Phase 1 — architecture, 16 October 2026

Replaced the Python injection build with framework-free ES modules and Vite.
The deliverable remains one offline HTML file; the hosted mirror is identical.

- One canonical implementation per named application function, explicit imports,
  separated data/state/router/components/features/styles, and a JSDoc store.
- Complete page/panel composition replaces route patching and its DOM observer.
  Term rows reconcile by key. Settings reuse a form template without opening a
  hidden dialog. User text uses the existing shared `esc()` function.
- All ten original educational collections are readable JSON source and remain
  byte-equivalent when serialised at runtime. Lossless bundled payloads parse on
  first use. Search indexing runs in idle time, retaining matching/ranking order.
- Preserved v1/v2 migration, v3 backups, drafts, evidence, role aliases, real-device
  voice controls, 15 assisting languages, 109 translated word-part meanings and
  43 contextual visual symbols. No medical content or claims changed.
- Corrected a stale search debounce callback after closing the palette; it now
  safely returns when its target is gone. Word Lab's input/controls now belong to
  its template, avoiding the old duplicate-button/render-replacement sequence.
- Retained and documented the historical build in `source/work/` as legacy.

No intentional visual redesign. Phase 2 remains the next review checkpoint.
The original seven module tabs, navigation and current page layouts are retained.

## Verification

`npm run build:test && npm test && npm run build` passed. The suite includes
lazy decoding, store subscriptions, pure selectors, exact content equality,
v1/v2 migration with untouched legacy keys, v3 round-trip, SRS intervals,
worksheet editing/export/save failure/recovery, all studios, voice discovery,
voice fallback, all 15 languages, RTL and visual references.

Real Chromium workflow checks passed 18 regression scenarios plus storage
recovery, 24 worksheet axe audits, and 21 modal/text-scale checks. The route audit
passed 336 route/theme/width combinations plus eight old route redirects, with
zero console errors, horizontal overflow or visible text below 14 px.

Before/after captures cover all 28 main routes at 390/1440 px in light/dark
(224 PNGs). All text, image sizes and top-level page geometry match. See
`visual-comparison.json` for exact pixels and minor rasterisation differences;
these are not represented as pixel-perfect equality when pixels differ.
Both full screenshot audits have zero axe WCAG A/AA violations. Automated checks
are not a substitute for a screen-reader or real mobile-device review.

At 4× CPU throttling from a local file, FCP was 308 ms. Terms filtering took
143 ms and palette search 18 ms, including automation overhead; these are
interaction timing proxies, not a field INP measurement. No external HTTP
requests occurred during loading or search. Optional online reference/translation
links and browser-provided online voices retain their explicit online behaviour.

## File sizes

Node gzip level 9, same runtime for both files:

| Build | Standalone bytes | Gzip bytes |
| --- | ---: | ---: |
| Previous | 1,113,481 | 366,915 |
| Phase 1 | 825,643 | 416,261 |

The standalone file is 25.9% smaller and remains under 1,200,000 bytes. Gzip is
13.4% larger because lossless dataset compression is embedded as base64; this
tradeoff is recorded rather than claiming a transfer-size reduction. See
`size.json` for exact SHA-256 fingerprints.

## Changed files

Root `index.html`, `package.json`, lockfile, `vite.config.js`, `scripts/`, all
canonical `src/` modules, ported/extended `tests/`, `README.md`, `MIGRATION.md`,
these review results, and both output HTML files. The review ZIP contains the
full source, licenses, original review prompt, all screenshots and test evidence.
The medical editorial backlog is unchanged.
