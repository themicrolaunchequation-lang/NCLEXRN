# Carecraft / Healthcare Crown Academy — v4.4.0

Self-contained healthcare learning app: 30 lessons, 90 prompts, 22 original activities, 13 topic-matched research summaries, private notes and Smart Review. The final functionality audit and fixes are in [Carecraft-v4.0.1-Audit.md](Carecraft-v4.0.1-Audit.md). All requested phases are implemented; see [CHANGELOG.md](CHANGELOG.md) and [Carecraft-v4.0-Report.md](Carecraft-v4.0-Report.md).

## Use

Open `dist/Carecraft-v4.4.0.html` directly from disk. Images, fonts, styles and scripts are embedded; no runtime package installation is required. The release number is in the page title and sidebar. `dist/index.html` and `dist/carecraft.html` are identical current copies. Earlier named downloads remain unchanged.

The optional `dist/installable/` contains an HTTPS-hosted PWA bundle. Its service worker caches only its own app shell. Native installation/offline caching still requires browser verification. Direct disk users should use the single HTML file.

## Build and verification

`node build.mjs` builds the standalone release from the committed generated data/engines and `src/v4` modules. It needs only Node. `node scripts/package-installable.mjs` builds the installable shell (committed icon files are reused); zip that directory for distribution.

To regenerate retained engines after source changes: install/provide Acorn, then `node scripts/assemble-v4.cjs`. Set `CARECRAFT_ACORN_MODULE` to an absolute module path if needed. The linker removes unreachable legacy renderers and translates activity handlers into a delegated action registry at build time; no eval or inline handlers ship. `scripts/extract-v4.cjs` and `scripts/style-v4.cjs` are historical one-time extraction tools and require jsdom; ordinary builds do not run them.

Run `node test-v4.cjs` with jsdom available, optionally through `CARECRAFT_JSDOM_MODULE`. The 40 retained regression groups, 36 release-audit groups and 13 visual-guide / Today groups pass (89 total). Run `node --expose-gc --max-old-space-size=4096 test-release-audit.cjs` and `node test-infographics.cjs` for the latter groups. This does not verify rendered layout, screen readers, native dialog focus, contrast measurements, Lighthouse or PWA installation. The report identifies these manual checks.

## Source and data

`src/v4/store.js` owns additive migration, validation, debounced writes and backup import/export. `app.js` owns the shell and route lifecycle; `views.js` owns page rendering and `home.js` owns Today and its optional app guide; `features.js`, `learning.js` and `events.js` implement learning workflows and delegated interaction. `design.css` defines the shared design system; `engines.css` contains consolidated retained activity styles. Data and retained engines are generated from preserved baseline content. Earlier source remains in Git but is excluded from the v4 runtime. `reachability.json` documents the linking result.

Storage remains `localStorage['carecraft-v1']` with additive schemaVersion 4 migrations, including old schemaVersion 2 backups. Existing and unknown keys are retained. Data stays in the browser on its current origin; export a backup before changing browsers/origins. No server sync, analytics, microphone or camera is used. Speech reads only with an available local English browser voice.

HCA branding, crest and embedded Playfair/Inter fonts are retained; font licenses are in `dist/licenses`. Registration certificates and private registration numbers are excluded. This is educational practice, not accreditation, patient-specific advice or verified clinical competence. Study results retain their populations and limitations; simulation numbers are explicitly fictional. Independent clinical peer review remains pending.

## Visual learning guides — current release

Every Learn card and lesson toolbar opens a three-page branded PNG infographic reader: Understand, Apply and Remember. The selectors sit above the image in a sticky control area. The 90 complete raster graphics use lesson wording, worked examples and reflections, the original HCA crest, and full company/app names. The reader includes previous/next controls, Arrow/Home/End keys, touch swipe at fit zoom, 100/150/200% zoom, PNG download and accessible transcripts. Motion follows system and app reduced-motion settings. Production and prompt downloads are not part of the app.

Implementation: `src/v4/infographics.js`. The committed PNG pages in `src/v4/assets/infographics/` are embedded at build time; no runtime image service or SVG infographic renderer is used. Original scene crops and the previous composition source remain authoring resources. No new research claims were introduced by this visual update. Real-browser rendering, pointer gestures and native file downloads remain unverified in this environment.

## Raster visual learning — v4.3.0

Learn displays the complete 30-lesson library by default. Each lesson begins with a reading brief and has three core ideas, a worked example, a check and reflection. Ninety complete branded PNG infographic pages are available in the clickable lesson previews and the three-page viewer; Save image downloads PNG. The pages use original generated scenes, with no runtime infographic SVG.

## Today and the optional app guide — v4.4.0

Today now has a personal greeting, original welcome illustration, time controls, direct routes into Learn / Practice / Toolkit, saved-session continuation, real learning counts and a reflection panel. The floating How to use Carecraft button opens five interactive guide chapters with working app shortcuts. Motion respects system and saved preferences. Infographic page selectors are above the image in a sticky control area. Production prompts and generation downloads have been removed from the app. Switching theme preserves raster lesson previews.

## Learning Studio — v4.5.0

Each lesson can be learned as a 14-slide journey (cover, three ideas, three infographic spotlight tours, a worked example,
three checks, a reflection and a recap) with pen, marker, highlighter, shapes, text and laser tools. It is built by
`src/v4/studio.js` on the shared engine in `apps/shared/hca-studio.*`; entry points are the Learn intro, a "Learn as slides"
control on every lesson card and a launch card on the lesson page. Poster regions: `python3 ../tools/poster-regions.py
src/v4/assets/infographics src/v4/studio-regions.json` after changing the infographic PNGs.
