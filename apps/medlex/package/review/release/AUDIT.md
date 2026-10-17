# MedLex final functional audit — 16 October 2026

The current downloadable and deployed build includes the Word Anatomy loading fix, draggable 3D word blocks and a shaded volumetric body-system navigator. HCA identity and all ten educational datasets are preserved.

## Fixes

- Shared Preview actions use the inline Library panel where present and open a full term page elsewhere.
- Word Anatomy safely handles missing terms/components, and its picker updates the component view.
- Both 3D scenes support pointer dragging, keyboard rotation, zoom, reset, pause/play, reduced motion and disposal on navigation. Canvas failure retains the atlas SVG fallback and system buttons.
- The private-site manifest requests credentials. This is a code/attribute fix; fresh authenticated browser acceptance is pending.
- Setup does not restart over an already active/completed onboarding flow.
- The academy home link has an explicit accessible name and separated visible text.
- Malformed percent-encoded term/part URLs no longer throw URIError.
- Leaving a worksheet warns for dirty records after a failed save, as well as pending saves.

## Current verification

- Seven regression suites passed: original data equality, migrations, IndexedDB and quota recovery, scheduling, audio controls, language help, worksheets, assignments, feedback, matching, onboarding and portfolio workflows.
- 418 DOM route/redirect checks passed, including all 26 modules × five tabs and every prefix/suffix detail route.
- All 1,480 term-detail markup profiles generated successfully.
- Mixed daily-session scoring, worksheet failure protection, actual AES-256-GCM export, independent decrypt/validation, import preview and wrong-password rejection passed.
- Two scenes passed synthetic pointer, release, keyboard, reset and reduced-motion checks. A mocked canvas executed over 92,000 draw commands without non-finite coordinates; this verifies code paths, not visual quality.
- 25 axe structural scans passed in JSDOM. Color-contrast was explicitly disabled because JSDOM does not render. These results are not a full WCAG conformance claim.
- The minified production HTML passed nine route smoke checks and key Preview, word-selection and scene-control interactions, without the development test bridge.
- Generated manifest/icons and service-worker cache/offline-fallback behavior were checked with in-memory mocks.

## Remaining acceptance limits

The supported browser-control capability was unavailable in this session. No fresh browser screenshots, viewport/overflow measurements, visual/contrast audit, native drag/touch performance, actual voice playback/recording, authenticated manifest fetch, real HTTPS installation or cross-browser/device acceptance is claimed. Earlier browser reports belong to earlier builds and must not be treated as current release evidence. The existing browser test scripts remain supplied so the external reviewer can rerun them.

Before a wider audience release, use a real phone and desktop browser to confirm the two scenes render and drag, the private manifest succeeds, worksheet Back/Forward/reload preserves drafts, print layout fits A4, audio works, and the app remains readable at 150% text/200% zoom. Review keyboard focus and contrast in light, dark and high-contrast themes.

## Reproduce

Run `npm ci`, `npm run build:test`, `npm test`, `npm run test:release`, `npm run build`, `node tests/release-production.cjs`, and `npm run test:offline`. The first release command uses DOM emulation; browser scripts are separate. Check `review/release/validation.json` for the exact downloadable HTML hash. The deployment archive and reviewer ZIP are different: the reviewer ZIP includes editable source and test fixtures.
