# Serein 5.1.1 · Rich raster infographics · 16 October 2026

- Replaced all twelve SVG infographic cards with genuinely generated, informative raster posters; retained original PNGs.
- Added optimised WebP images and separate thumbnails, correct image downloads, and dynamic image dimensions.
- Added human-centred scenes, explanatory illustrations, practical examples and source context, preserving Serein/HCA branding.
- Kept selectable text, click-to-open references, all reader navigation and privacy behaviour.
- Reviewed generated wording/numbers visually and corrected the sleep poster's action numbering and an unsourced temperature illustration.
- Updated source, generation prompts, both offline distributions, regression checks and independent deployment package.

# Serein 5.1.0 · Educational infographics · 16 October 2026

- Added 12 original, branded educational SVG infographics and a reader immediately after Toolkit in the sidebar.
- Added mobile Toolkit access, topic filters, previous/next controls, thumbnail selection, direct links, global search, keyboard navigation, optional page-turn animation, touch gestures, a genuinely enlarged panning view and SVG downloads.
- Kept practical text in the page, with sources and limitations behind deliberate clicks. No sidebar hover help or automatic rotation.
- Included WHO's September 2026 working-age estimate (16% in 2023), plus NHS, NHS inform, CDC/NIOSH, HSE, AHRQ and PLOS ONE references. Exercise counts are distinct from effect statistics.
- Added twelve self-contained `/infographics:` generation prompts, each requiring the existing logo and both company/app names.
- Updated hosted and portable offline distributions. No data-schema change; existing personal records and optional encryption behaviour are preserved.

# Serein v5.0 — release notes

All remaining implementation phases (1–4), following the completed Phase 0.

## 5.0.1 — pre-publication audit

- Fixed reopening/navigation, skip link, stale searches, pausing/replay/visuals, timer rounding and sharing fallback.
- Hardened encryption cancellation, operation overlap, multi-tab conflicts, corrupt-data recovery, import rollback and unload warnings.
- Improved privacy labels, borders/focus contrast, offline retry, calendar folding and lazy-image lifecycle.
- 247 new assertions across 42 scenarios; 498 total automated checks pass. Real-browser/device verification remains outstanding.
- Schema remains version 5, using serein-hca-v3. The private audience is unchanged.



## Added

- Five destination desktop navigation and mobile Today / Library / Quick pause / Me / Support navigation. Canonical deep links, old-route redirects and back/forward navigation.
- Compact Today recommendation with shift-aware moments, time choice, check-in, unfinished work and an optional quote.
- Searchable Library with practice, guide and journey segments, filter sheet and removable active filters. Practice details before starting.
- Skippable three-step onboarding and consolidated Me settings, records and data controls.
- Optional support contacts, visible UK support links and global Get help access.
- Light, Dark, Auto and High contrast themes, reading sizes, focus mode and reduced-motion support.
- Player settings sheet, progress ring, completion actions, Quick pause countdown, keyboard shortcuts and optional local voice, synthesised ambient audio, wake lock, media controls and Android haptics where supported.
- Optional journal lock: PBKDF2 SHA-256 with 310,000 iterations, random 16-byte salt, AES-256-GCM and fresh 12-byte IVs. Journals, check-ins and contacts encrypted at rest; inactivity/hide locking, encrypted draft recovery, encrypted exports and explicit plain-export consent.
- Mood calendar and paired before/after dots with accessible tables, response summaries and helpful-moment counts. Empty entries are not interpreted as low mood.
- Fuzzy command search with actions and recent choices, shift reminder presets and team-pause links containing only practice settings.
- One public Serein namespace, structured modules, English copy catalogue, keyed DOM updates, lazy media resolution and an isolated diagnostic self-test.

## Changed

- Replaced the stacked CSS layers with one mobile-first stylesheet and shared design tokens. Breakpoints: 600, 1024 and 1440 px.
- Unified Reflect and My space in Me; studios have plain-language labels; all six original studios and all three journeys remain reachable.
- Personal records retain explicit saving choices. Version 5 continues using serein-hca-v3 and accepts earlier exports and the serein-demo-v1 migration.
- Re-encoded existing raster assets as WebP; subset all four fonts and the crest’s embedded S glyph. Original media/content remain in Git history and the Phase 0 backup.
- The portable document embeds its media map without changing catalogue paths. It works without network dependencies; source/help links require internet. HTTPS offline caching remains opt-in.

## Fixed

- Follow-up: desktop topbar search uses its content width and a single-line label, preventing vertical letters and overlap with Get help. Mobile retains the icon-only control.

- Focus loss on same-page updates, duplicate filter IDs, search access on narrow layouts and player settings return focus.
- Auto-theme updates and reduced-motion countdown behaviour.
- Plaintext records and drafts are removed when encryption is enabled; wrong passcodes reveal no records. Clearing data invalidates queued encrypted writes.
- Raised-surface light-theme link contrast, box-guide selector mismatch and countdown interception of player controls.

## Removed

- Redundant stylesheet files and automatic information overlays on navigation/cards/tabs. Useful explanations stay in content; longer context opens on deliberate clicks. Sidebar has no hover help.

## Validation and limits

498 automated checks passed: 33 catalogue/engine/media, 67 behaviour/privacy, 247 audit, 84 release/preservation, 10 worker and 57 contrast checks. This is automated DOM/VM validation, not a browser-layout or WCAG certification. Actual device layout, screen-reader behaviour, installability, native media APIs and Lighthouse remain manual. See QA-CHECKLIST.md and RELEASE-METRICS.md.

## Use

Open Serein-v5.0.html directly for core offline use. For HTTPS hosting, keep it beside sw.js, then choose Me → Settings → App & reminders → Make available offline. The modular hosted worker is a separate generated file; do not interchange it with this portable companion.

Personal browser data is tied to its origin or local-file location. Export before moving between local and hosted editions. Forgotten lock passcodes cannot be recovered. The lock protects the selected records at rest, not an already unlocked device or malicious code running in the page. Saved plans, practice feedback/preferences, favourites and journey progress remain outside the lock, as disclosed in the app.
