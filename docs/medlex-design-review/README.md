# MedLex Learn design review

This draft makes Learn cards consistent, records actual slide visits and restores the last slide when continuing. It applies shared lesson and pop-up styles across the 29 decks, and separates Word parts from the slide engine and Library so studios can open independently.

## Changes

- Learn uses a responsive 1–3 column collection with numbered cards, credited cover thumbnails, purpose, slide count, approximate first-pass time, explicit state, a native progress bar and Start / Continue / Review. The status filters use lesson progress; outcomes and practice remain separate links. Time estimates are approximate (0.75 minutes per slide), not time to master every flash card or detail panel.
- The viewer has clearer objectives and word-part cards, stronger body text, fewer redundant corner symbols, and stronger pop-up headers, imagery and keyboard focus. Visual study key remains available in the sidebar. Existing medical wording, meanings and references are preserved.
- Five exact anatomical concept keys reuse the supplied credited raster illustrations; the study key also uses the supplied study-material illustration for the book concept. Original artwork provenance is retained. No new diagnostic claims or patient images are introduced.
- Word parts has a dedicated 20,496-byte bundle, a loading skeleton and prefetch on link hover or keyboard focus (respecting Save Data). The previous cold route loaded a 74,458-byte engine followed by a 282,490-byte Library bundle. Studios use more of the page width, capped on very wide screens. Staggered card entry, card entry transitions and permanent graphics-layer hints are removed in embedded studios; pop-ups appear at their final size immediately.
- Viewer changes remain in `apps/tools/medlex-embed-fit.mjs` and are scoped to `html.hca-embed`. Its second run produces identical generated CSS and script hashes. `site/medlex/` was rebuilt from sources; other apps were not changed.

## Validation

| Check | Result |
| --- | --- |
| Medical markup and term data | Unchanged in all 29 source decks; see `content-invariance.json` |
| Lesson loading, cards, viewer and quests | `medlex-lessons-check.mjs`: ALL OK |
| Lesson accessibility | `medlex-lessons-axe.mjs`: zero violation types in light and dark |
| Library | `lib-check.mjs`: 87/87 |
| MedLex Learning Studio | `studio-check.mjs`, MedLex only: 76/76 |
| Word parts complete quick suite | `wordparts-check.mjs --quick`: 911/911 |
| Studio hero and resize matrix | All three studios × four requested sizes × light/dark: 211/211 |
| Immediate mobile targets | All three studios × light/dark: 19/19 |
| New card/progress/loader regressions | `medlex-learn-design-check.mjs`: 54/54 |
| Full lesson interaction audit | All 29 decks, 634 slides and the audit's interactive-state plan at 1440×800, light/dark: zero final failing findings after corrected-case reruns |
| Other lesson sizes | Every slide's initial state plus viewer chrome/dialogs at 1920×940, 1024×700 and 390×844, light/dark: zero failing findings |

`validation-summary.json` identifies the final result selected for each deck and theme. Initial runs caught objective-card, compound-word and gestational-age layout problems; these were corrected and rerun. Running several browsers while rebuilding also produced transient resource errors and a browser crash, so affected cases were rerun after builds finished. Some early Word parts matrix failures were reproduced as card-entry animation geometry; the final target and hero/resize checks pass after removing the entry motion.

The deck audit now prunes hidden subtrees while walking text. Its findings were identical to the previous walker on six representative cardiovascular slides; `audit-equivalence.json` records the comparison. This improves audit speed without removing slide states or fault categories.

The existing check scripts assume the paths in the handoff (`/opt/node22` and `/opt/pw-browsers`). In this environment, an untracked runner only redirected those dependency/browser paths to the available Playwright Core, Chromium and axe-core installations. It also selected MedLex from the shared Studio check; Carecraft was not exercised or changed. The new check supports `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` directly.

## Performance

The comparison uses the original commit `24337da` and this redesign, served separately over local HTTPS. Five fresh browser contexts per studio and version alternate before/after order at 1440×800, with unrelated external services stubbed. The report distinguishes route entry, iframe load, and the time until all card entry animations have finished. Studio pages request no images or web fonts; the relevant work is scripts, layout and entry animation.

| Studio | Route entry before → after | Frame load before → after | Cards ready before → after |
| --- | ---: | ---: | ---: |
| Prefix | 171 → 123 ms | 309 → 316 ms | 1292 → 344 ms |
| Root | 160 → 101 ms | 337 → 364 ms | 1590 → 408 ms |
| Suffix | 176 → 139 ms | 416 → 449 ms | 1473 → 1146 ms |

Medians of five runs. Final measurements and samples are recorded in `performance-summary.json`. These are local measurements, not a claim about production network latency.

## Remaining work and limits

- The requested complete replacement of flat mnemonic/icon artwork is **not finished**. This change reuses suitable existing raster images for five exact concepts and a study-material image; many original symbols and semantic diagrams remain.
- Shared styles apply to every deck, but this is not a bespoke reauthoring of all 634 slides and every detail panel. Dense tables and nested study banks retain much of their existing structure.
- The non-strict layout audit passes. Small-text, small-image and internal-scrolling warnings remain, particularly when the fixed 1280×720 stage is scaled to a phone. Reading view has larger text, but the strict readability target is not met throughout every slide state.
- The 44px touch-target checks cover app and Word studio controls. Scaled in-slide controls are not all 44 physical pixels at phone width.
- Full interaction-state coverage was run at 1440×800. The other three sizes cover all initial slides and viewer chrome/dialogs, rather than repeating every in-slide interaction at every size. Word studio hero/resize and mobile target checks cover the requested matrix.
- Remote account, AI and subscription services were stubbed or not exercised. No clinical fact check is claimed; the medical markup and terminology data were preserved.
- Forty-two before/after screenshots are included in [the comparison gallery](GALLERY.md): 12 representative slides, Learn/cards, four pop-up views and all three studios.

## Reproduce

```sh
node apps/tools/medlex-embed-fit.mjs
(cd apps/medlex && node build-web.mjs)
node apps/tools/serve-site.mjs 8443
```

Run the check scripts listed above using the handoff's Chromium host-resolver and proxy guidance. The new regression check accepts an output directory and port; its module/browser paths can be set through environment variables. Local baseline and screenshot-capture helpers are in the session's untracked `work/medlex/` directory.
