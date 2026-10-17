# HCA MedLex upgrade — 15 October 2026

## Foundations and identity

Embedded the supplied HCA Inter variable and Playfair Display WOFF2 fonts, adapted the supplied crest to M, added publisher details, increased undersized legacy text and touch targets, and introduced HCA light/dark semantic theme variables, text scaling, higher contrast and explicit motion overrides.

## Navigation and daily learning

Replaced nine competing sidebar entries with six principal destinations. Added mobile bottom navigation, scrim, explicit close button, keyboard containment, legacy route redirects and route titles. Rebuilt Today as a learning dashboard with a continue card, daily curated word, reviews and 13-system carousel. Added Learn path/grid/system choices and Explore view links. Removed conflicting module sequence labels in favour of chapter numbers.

## Learning and records

Retained all medical content exactly at runtime. Hid duplicated definitions and generic templated examples in term sheets. Bounded recall to 20 items, added four SRS ratings, improved meaning distractor selection, and introduced Build a Word, Listen & Spell, Match a Meaning and a ten-item alternating recall/meaning session. Added activity tracking, streaks, milestone records, progress heatmap, per-system familiarity and calendar export.

Migrated records into medlex-v3, left old storage keys untouched, preserved all ten educational collections, added v3 export/import, typed reset and undo, and consolidated DOM event subscriptions and router definitions. Retained existing teaching and export functions.

## Size and validation

- Before: 2,039,965 bytes.
- After: see the included `validation.json` for exact final bytes (approximately 0.95 MB).
- Anatomy images are stored once and compressed; repeated data fields use a lossless compact representation.
- DOM route and functional checks: passed with zero captured JavaScript errors.
- Educational-content equality: passed for TERMS, PREFIXES, SUFFIXES, LESSONS, CASES, CONFUSIONS, CODE_QUESTIONS, QUOTES, CHAPTERS and COURSE_MODULES.
- Migration, untouched rollback keys, v3 round-trip, additional practice modes and four SRS ratings: passed.
- Before/after axe: not measured. Lighthouse: not measured. Screenshots and cross-browser visual QA: not completed because no browser binary was available and browser download attempts failed.

See README.md for the remaining requested acceptance work. No unperformed tests or scores are reported as passed.

# Connected Learning Expansion

## Learning experiences

Added the studio hub, adaptive pathway, baseline assessment, confidence capture, resumable sessions, clinical interpretation, everyday explanation, confusable-term questions, a five-pair matching board, a schematic body-system atlas and connected learning journeys. Expanded pronunciation tools with optional local recording and added documentation-verification worksheets.

## Teaching, evidence and editorial review

Added assignment creation, learner/educator packs, outcome-linked activities, local educator feedback with assignment linkage, evidence inspection, learner evidence import, portfolio reporting and feedback CSV export. Original course attempts and quiz records are included in portfolio reports.

Introduced labelled editorial overlays with source and reviewer declarations. The original medical records remain unchanged. Human medical-editor sign-off is not claimed or fabricated.

## Usability and data

Added skippable three-step onboarding, useful information panels, focus mode, reading spacing and searchable Word Lab suggestions. Added AES-GCM encrypted backup export/decrypt/preview/restore while retaining ordinary v2/v3 import/export and untouched rollback keys. No cloud accounts or shared classroom service are simulated.

## Design and performance

Kept HCA navy, teal, ivory, copper, gold, original crest family and publisher identity. Added genuine Playfair semibold and italic font faces alongside variable Inter. Compressed repeated term/affix field storage without changing reconstructed records. The complete expanded app remains below 1,000,000 bytes.

## QA corrections

Chromium testing became available through an npm browser distribution. Fixed legacy dark-button, selected-filter, toast and module-tab contrast; corrected accessible names, search ARIA, question progress labelling and recall-card naming. Added explicit focus placement in adaptive questions.

The source package includes DOM/integrity tests, browser task-flow tests, route and interactive-state axe audits, responsive checks, screenshots and raw reports. See `validation.json` for exact final counts and scores. Remaining human work is medical/curriculum review and cross-browser/screen-reader validation; authenticated account synchronisation would be a separate hosted extension.

## Final measured validation

- Final app: 998844 bytes; original: 2039965 bytes.
- 82 full axe page/theme/state checks: zero violations.
- 168 responsive route/width checks: zero horizontal overflow and zero visible text below 12 px.
- Content equality, migration, untouched rollback keys, studio flows, encrypted recovery, synthetic microphone recording and playback: passed.
- Lighthouse: Accessibility 100, Best Practices 100. Performance score unavailable because trace screenshots were not captured.
- Automated results are Chromium-specific; human medical, curriculum, screen-reader and cross-browser review remain distinct.

## Workspace fit and activity tools · 15 October 2026

- Full-width content beside the sidebar; shorter module headings, compact tabs, corrected search icon alignment, four-column term banks on wide screens and responsive activity grids.
- Original vector illustrations distinguish collaborative classroom tasks from independent recall work.
- Every original classroom/independent activity opens an editable workspace with a task-matched five-row grid: word components, spelling, sorting, explanation or classification verification. Includes group roles, recall, verification and evidence fields.
- Drafts persist locally within the existing backup model; blank and completed printable worksheets download as standalone HTML. Learners can save written evidence to their existing portfolio, explicitly as self-review.
- About controls on module tabs, term/course/practice cards, section headings and studios; navigation hover/focus guidance; keyboard/touch-accessible information dialogs. Five concise prompts cover what, why, when, how and who.
- Research mini-infographics cite Freeman et al. (2014) and Larsen et al. (2013), identify the studied populations, and distinguish research findings from learner results.
- Embedded HCA font outlines retained in subsets covering the app text and Latin-1; JavaScript minified without renaming public top-level interfaces. Original medical data and migration checks retained.


## Guided editor and contextual help · 15 October 2026

- Blank worksheet now opens a guided editor with Prepare, Work, Verify and Keep steps. Resume, multiple retained worksheets, editable working grids, starter words, companion-record disclosures, self-review and optional recall date are integrated. Printable exports remain optional within Keep.
- Replaced large automatic hover panels with visible Start here guidance and labelled click-to-open teaching guides. Removed sidebar hover and extra information icons on ordinary cards and module tabs.
- Added eight distinct vector illustrations and action icons, with brief animations respecting reduced motion.
- Kept the original medical data, local progress, portfolio model and private hosting audience. New interaction/content tests and CSS parsing pass; rendered-browser verification is not newly claimed.


## Phase 0 · review defects D1–D18 · 16 October 2026

Moved the guided worksheet to a deep-linked page, fixed phone grid and desktop labels, added genuine save/failure feedback and recoverable export, made activity actions state-aware, corrected search/settings/theme controls, fixed exact recall intervals and milestone copy, aligned Today rows, clipped/tokenised art, increased typography and compacted the phone module header. Added DOM, keyboard, route/state, text-size, overflow, motion and axe regressions. All original medical data and migration tests remain unchanged. See PHASE-0-REPORT.md and validation.json for measured results.

The previous guided.js and activity-art.js files were unused source duplicates and were removed; their current implementations remain in the feature source. The legacy build is retained until Phase 1. Work stops after Phase 0 for review.

## 2026-10-16 — Meaning guides and optional assisting language

- Widened word-detail dialogs to viewport-aware gutters; word-part cards fill their column, with a two-column context layout on larger screens.
- Added concise hover/focus meanings, persistent click/tap explanations, Escape dismissal and an inline guide to prefixes, roots, suffixes and combining vowels.
- Added optional Arabic, Spanish and French assistance in onboarding, Settings and word details; 109 existing word-part meanings have offline learning glosses. Arabic text uses RTL.
- Added a separate, labelled online translation link for full definitions. No remote request runs on hover.
- Preserved all ten original educational collections, legacy rollback keys, v3 progress, worksheets, SRS and studio features. Later architecture phases remain paused.

- Learning roles list Doctor first and rename Student to Trainee; existing Student profiles are normalized to Trainee when loaded.

## 2026-10-16 — English listening, term visuals and worldwide assistance

- Added dynamic English voice discovery, accent filters, preview, saved voice URI/name, speed presets, Stop, refresh and guidance for adding device voices. Shared controls are available in Settings, term details and Pronunciation Studio.
- Added 43 original SVG learning symbols covering all 1,480 terms, contextual category badges, expandable visual guides and a labelled artery/plaque schematic. Assessment prompts remain unchanged.
- Expanded offline word-part assistance from three to 15 languages, with all 109 existing meanings covered (1,635 glosses), localized short guides and RTL Urdu support. Corrected the earlier count of 111 to the measured 109.
- Preserved the ten original educational collections, role updates, progress, SRS, worksheets and existing studio features. Phase 1 remains paused.

## 16 October 2026 — Phase 1 authoring migration

Current development has moved to root `src/` and the Vite build. These legacy
patch files remain historical inputs; see root README and review/phase1.
