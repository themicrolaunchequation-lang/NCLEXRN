## 17 October 2026 — Illustrated replacements and annotation workspace

Replaced the five direction/position schematics with illustrated raster posters matching the earlier collection. Pages now use the available width with a 1 cm desktop sidebar gutter, a larger text base and responsive mobile gutters. Removed production-prompt and related-module controls from Infographics. Posters open fitted to width and support a single-row toolbar with Hand, Pen, Marker, Highlighter, ink sizes/colors, colored sticky notes, undo/redo, clear and a study drawer. Notes and drawings save per poster, with separate validated export/restore and visible storage-failure recovery. Added annotation interaction, persistence, keyboard and structural-accessibility checks; the Today guide and deployment documentation reflect the new behavior. Optimized the five replacement WebPs to meet the current host’s standalone-file limit and added a build-time size guard. Original PNGs retain their full resolution. Fresh native browser/device review remains pending.

## 17 October 2026 — Sixteen exam-focused infographic additions

Expanded the visual library to 56 posters: four new pitfalls guides, four clinical-concept guides, five precise direction/position PNG schematics and three memory sheets with 18 new cues. The library now contains 68 original memory cues. New topics carry a NEW marker and appear first within their collections. Counts, prompt exports, the welcome guide, the complete HTML and offline poster caching include the expanded collection. New posters retain text transcripts, recall questions/answers, related modules and checking references. Independent medical-editor review remains pending.

## 17 October 2026 — Infographic navigation and backup continuity

Fixed the gallery reopening a previously deep-linked poster after Close followed by search or a group change. Backup previews now discard reads that finish after leaving their page; restores that have already started finish saving without accessing a removed status panel. Added deferred-read/write navigation regression checks. The current release uses 40 generated raster posters in six groups and the redesigned Today page with its seven-part floating guide. The earlier SVG entry below records the preceding release.

## 16 October 2026 — Infographics shelf

Added 26 branded SVG study boards and /infographics: prompts, a sidebar destination after Practice, flip/zoom/pan reader, readable transcripts, recall questions, local raster replacement and separate image backup/restore. No original educational collection or learning record schema changed. Verification scope: docs/infographics/README.md.

## 16 October 2026 — loading, 3D and final functional audit

Fixed shared Preview destinations, malformed term URLs, dirty worksheet departure warnings, onboarding race and manifest credential attributes. Added offline draggable 3D word anatomy and body navigation with accessible controls, reduced motion and canvas fallback. Added all-module, word-part, term-profile, synthetic-pointer, structural accessibility and production smoke checks. Fresh browser rendering remains unverified; see review/release/AUDIT.md.

# MedLex changelog

## 2026-10-16 · Phases 2–6 · v4.0.0

The user requested completion of all remaining phases without intermediate review
stops. Phase checkpoints are included for traceability; final QA fixes are in the
final release and Phase 6 snapshot.

### Phase 2 · Design system

Introduced HCA semantic colors, navy dark/high-contrast modes, Inter interface
headings, Playfair page titles, consistent controls/icons, focus and motion rules.
Consolidated seven retained feature stylesheets and removed exact duplicate rules.
Primary files: `src/styles/`, `src/ui/components/modern.js`.

### Phase 3 · Navigation

Added the five learner areas, role-aware Teach, canonical routes and old-link
redirects, profile/data separation, contextual help and keyboard area shortcuts.
Removed repeated Start Here and studio-promotion banners.
Primary files: `index.html`, `src/router/`, `src/ui/page.js`, modern controller.

### Phase 4 · Screens

Rebuilt Today, Learn, the five module tabs, illustrated classroom/independent
activities, Library and full term/word-part pages, Practice, Progress and Teach.
Retained original tools, outcome wording, references, assignments and editorial
controls. Worksheets are guided editable pages with phone reference sheets.
Primary files: `src/features/modern/`, library and worksheet features.

### Phase 5 · Advanced features

Added resumable daily practice, four-skill estimates, letter-level spelling
feedback, targeted revision, optional bundled FSRS, IndexedDB v4 migration,
rollback/fallback recovery, ten draft snapshots, local insights, installation
support and branded A4 exports. Existing encrypted backups remain compatible.
Primary files: storage/offline adapters, daily/FSRS engines, worksheet/studio
features, settings/data, `public/`, `scripts/finalize-build.mjs`.

### Phase 6 · QA and polish

Fixed heading hierarchy, revealed-card contrast, library route resolution,
mobile illustration layout, focus restoration, hidden-control styles, grid
alignment, slow term-search rendering and learner-pack branding during QA.

Measured final results: 372 route layout checks at four widths/three themes;
186 route, 108 state and 24 worksheet axe checks without violations; 16
functional journeys; 31 old-route redirects; 62 layouts at 150% text; nine zoom
reflow-surrogate layouts; exact ten-collection content equality; v1/v2→v3→v4
and v3→v4 migration/reload; quota recovery; old/new encrypted backups; Classic
and FSRS interval checks; and three branded A4 documents. Chromium only.

Local production measurement at 4× CPU throttle: FCP 336 ms; Terms fill-to-result
161.7 ms; palette 139.8 ms; no external requests. These are automation timings,
not field INP. Final HTML: **921,722 bytes**, gzip level 9: **443,552 bytes**.
Previous Phase 1 HTML: 825,643 bytes, gzip 418,346 bytes. Gzip uses a zero mtime.
The target remains ≤1,200,000 uncompressed bytes.

`validation.json` and `review/remaining/` contain measured results and scope
limits. README and MIGRATION describe build, recovery, device/browser acceptance
and retained compatibility styles. `CONTENT_BACKLOG.md` is copied unchanged from
the original backlog; no missing curriculum, clinical facts or reviewer approval
were invented. Before/after captures and synthetic print examples are in the
review ZIP. Historical Phases 0 and 1 are documented in `source/work/CHANGELOG.md`
and `review/phase1/CHANGELOG.md` respectively.

## Illustrated library and Today welcome

- Replaced SVG infographic boards with 40 generated raster posters; included original PNG archive and optimized WebPs.
- Added five decoding/reading guides, two pitfalls guides, fifty original mnemonic cues across five posters, and two direction posters.
- Organized all infographics into six collections with filters, search, grouped sections, and viewer group navigation.
- Redesigned Today with a branded welcome, real activity, resume links, animated poster composition, motion control and visual-learning shortcuts.
- Added a seven-part floating app guide with keyboard navigation, direct destinations, Escape/focus return and route cleanup.
- Kept the hosted entry compact with lazy poster URLs; standalone HTML embeds all included posters. Updated offline caching for raster assets.
