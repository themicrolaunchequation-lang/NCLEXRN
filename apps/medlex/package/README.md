> Current illustrated release: see [the current release guide](docs/CURRENT-RELEASE-GUIDE.md). The app now includes 56 raster infographics in six groups, a redesigned Today page, a seven-part floating app guide, wider readable pages and a width-fitted annotation viewer. The hosted entry loads images as needed; the complete `MedLex.html` embeds all 56. Earlier phase notes below describe the preceding release.

# MedLex — HCA medical terminology · v4

MedLex is a local-first terminology learning app. Open `dist/MedLex.html` directly
for the offline app. `dist/index.html` is the smaller hosted entry and loads the
56 raster posters from `dist/infographics/`. Keep that folder with the hosted entry. No account, external font, CDN, analytics or server is required by the app.
The original HCA crest, embedded Inter/Playfair fonts, company footer and all ten
canonical curriculum collections are retained. Source is `src/`, not the historical
Python patch scripts under `source/work/`.

## Build and verify

Node 22.12+ (verified on Node 24):

```sh
npm ci
npm run build:test
npm test
npm run test:browser
npm run test:journeys
npm run test:states
npm run test:encryption
npm run test:print
npm run build
npm run test:offline
npm run test:performance
```

Browser scripts use Playwright Chromium. Set `MEDLEX_CHROMIUM` to an available
executable; scripts record reports under `review/remaining` and captures under
`MEDLEX_QA_OUTPUT`. Change the documented default scratch output paths for a new
machine. Test builds expose a scoped test bridge; production does not.
`tests/browser.mjs` and phase0 browser scripts are historical Phase 1 comparisons;
current browser commands above supersede their old UI selectors.

## What changed in Phases 2–6

- A semantic-token design layer, consolidated feature styles, responsive desktop
  sidebar/tablet rail/mobile navigation, readable cards, focus and reduced motion.
- Today, Learn, Practice, Library and Progress navigation; Teach is available to
  educators or through Teach mode. Old links redirect to their current screens.
- Five module tabs; dense searchable terms with a full term page; contextual
  illustrations and accessible explanations; two-step optional-language setup.
- Editable guided four-step worksheets, reference sheets on phones, real save
  status, ten distinct draft snapshots, restoration, duplicate and recovery export.
- Resumable interleaved daily practice, spelling feedback, targeted review,
  four-skill estimates, progress insights, Classic/FSRS scheduling and v4 storage.
- Separate appearance/profile and Data/offline settings; backup and encrypted
  backup compatibility; branded A4 worksheet, learner pack and portfolio exports.
- Hosted manifest/service worker and installation guidance. The downloaded HTML
  works without these extra hosting files.

## Source layout and preservation

`src/data/records/` contains the ten original collections. Build-time lossless
compression is decoded lazily; tests compare the complete runtime values with
the original app. `src/state/` owns migration, IndexedDB, fallback and queued writes;
`src/router/` owns canonical routes and legacy aliases; `src/ui/` owns components,
escaping and page composition; `src/features/` owns learning and editing flows.
Styles are `fonts.css`, retained `legacy-components.css`, semantic `tokens.css`
and current `components.css`. Exact duplicate legacy rules were removed; retained
feature styles keep older practice/editor flows intact.

Both fflate and ts-fsrs are bundled locally with their MIT license notices.
`package-lock.json` pins the installed versions. PWA assets are generated into
`dist/`; build output remains a self-contained HTML below the 1.2 MB target.

## Practical limits

Voice choices reflect voices actually installed on the device; accents and
availability differ across browsers. All 15 existing assisting languages remain;
curated meaning help covers 109 gloss sets, not a claim of complete translation.
System/organ illustrations are schematic learning cues, not diagnostic images.
Time, mastery and recall forecasts are estimates. Self-review does not confer
clinical competence or automatically mark an educator-reviewed activity complete.

No backend, accounts, cloud sync, AI grading or clinical sign-off was added.
The editorial backlog and pending-curriculum status remain unchanged. Records
are local to each browser origin; use export/import to move them between the
website and a downloaded file. Read `MIGRATION.md` before testing recovery.

## Verification scope

Final reports and phase notes are in `review/remaining/`. Browser evidence is
Chromium only. The service-worker cache logic is unit-tested with mocked browser
storage; actual HTTPS installation/offline behavior still needs a device/browser
acceptance pass. Performance timings are local automation measurements, not field
Core Web Vitals. Historical checkpoints precede final QA fixes; use the final
`MedLex-Worldwide.html` for external review.


## Latest loading/3D audit (16 October 2026)

The current verification record is `review/release/AUDIT.md` and `review/release/validation.json`. These supersede prior release-readiness claims. Fresh browser rendering was unavailable for this update; the new automated scans use DOM emulation and mocked canvas/worker APIs. Run `npm run build:test`, `npm test`, and `npm run test:release` for current functional checks, then `npm run build` and `node tests/release-production.cjs` for the production smoke.


## Infographics viewer

26 branded visual study boards and their complete generation prompts are available at #infographics immediately after Practice in the sidebar. See docs/infographics/README.md for image imports, separate image backups, keyboard controls and current verification limits. Run npm run test:infographics after build:test.
