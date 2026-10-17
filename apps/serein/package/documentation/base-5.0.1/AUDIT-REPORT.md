# Serein 5.0.1 — pre-publication audit

16 October 2026. HCA branding, original educational content, migration and the private audience are preserved.

**Automated audit passed after fixes. Real-browser/device verification is outstanding.** This is a code and DOM/VM audit, not clinical validation, a penetration-test certificate or WCAG certification.

| Check group | Passed |
|---|---:|
| Catalogue, engine, syntax, media and identity | 33 |
| Existing behaviour/privacy checks | 67 |
| New regression assertions across 42 scenarios | 247 |
| Content preservation and standalone packaging | 84 |
| Hosted/portable workers | 10 |
| Text contrast pairs, minimum 4.5:1 | 39 |
| Border/focus pairs, minimum 3:1 | 18 |
| **Total** | **498** |

Coverage includes all five destinations, Library/Me segments, 15 players, 14 guides, six studios, three full journeys, four-practice routines, journals, check-ins, saved collections, settings, sharing, imports/exports, encryption and offline distributions. Device APIs use controlled mocks, which do not establish device compatibility.

## Findings fixed

| Area | Finding and fix |
|---|---|
| Studio/journey reopening | Current routes could suppress reopening. Explicit navigation reopens the tool without duplicate history entries. |
| Rapid navigation | Delayed searches could write to removed controls. State updates immediately; stale callbacks are cancelled or ignored. |
| Skip to content | The anchor could redirect to Today. It now focuses main without changing the route. |
| Today | Check-in actions survive updates; an all-excluded recommendation state retains a proper heading and settings route. |
| Box visual | A residual box could overlay another practice. Visibility is scoped, edges are present and no-holds exhalation shrinks correctly. |
| Grounding focus | Noticing buttons were replaced when selected. Stable elements now preserve keyboard focus. |
| Pause semantics | Help/settings/search/shortcuts/media pause could advance self-paced grounding. They now pause without advancing. |
| Quick pause | Opening another sheet could leave its countdown running. Settings/help/search cancel it. |
| Replay feedback | Repeat runs reused response identity and before-rating. Replay creates a fresh optional record. |
| Timer | Minute-boundary rounding could display too little time. Total seconds are rounded once. |
| Player layout | Text-only guidance fills the content width; playback controls can wrap. |
| Device callbacks | Late wake-lock grants are released after exit. Media handlers/metadata clear, and the engine pauses on exit. |
| Clipboard | Missing clipboard support now offers manual selection/copy of the generated team link. |
| Import validation | Malformed arrays, missing secure UUIDs and future schema versions are handled safely. |
| Encryption cancellation | Clear data invalidates in-flight setup/unlock/removal, preventing later restoration. Overlapping privacy operations are guarded. |
| Auto-lock | A tab hidden during setup finishes locked; locking clears private search/import buffers and Undo references. |
| Import rollback | Quota failures no longer report success. Existing records remain; successful replacement clears the old unsent draft. |
| Corrupt storage | Original unreadable bytes are protected from writes and available as a recovery download. |
| Multiple tabs | Stale writes cannot overwrite a newer archive or another tab's encryption changes. Local edits remain in memory for export. |
| Pending changes | Leaving during encryption/saving requests an unsaved-work prompt, subject to browser support. |
| Privacy wording | Saving labels describe the active encrypted mode. |
| Contrast | Faint Light/Dark borders were strengthened. All measured text, border and focus token pairs pass. |
| Offline setup | Bounded waits recover from a worker/cache operation that never finishes and re-enable retry. |
| Calendar files | UTF-8 lines fold at 75 bytes; titles are escaped and days/time validated. |
| Image lifecycle | One lazy observer is reused and detached elements are released. |
| Topbar | The earlier desktop search-width fix remains covered by a regression check. |

## Regression scenarios

- PASS — Every studio and journey reopens from its existing route
- PASS — Pending searches survive navigation without stale DOM writes
- PASS — Quick check-in status survives Today updates
- PASS — Box graphics never overlay another practice
- PASS — Self-paced noticing keeps keyboard focus
- PASS — Help, settings and search pause self-paced practices
- PASS — Opening settings cancels Quick pause countdown
- PASS — Replay creates a separate optional feedback record
- PASS — Timer rounds across minute boundaries correctly
- PASS — No-holds Box breathing shrinks on its out phase
- PASS — Media controls pause grounding and are removed on exit
- PASS — Late wake-lock grants are released after player exit
- PASS — Team share has a manual-copy fallback without clipboard API
- PASS — Invalid array shapes and missing secure UUID do not break migration
- PASS — Plain import merges contacts and records without dropping existing data
- PASS — Replace import removes the old unsubmitted draft
- PASS — Quota failure rolls back import and reports failure
- PASS — Unreadable stored data is protected and downloadable
- PASS — Clearing data cancels encryption setup before it can write
- PASS — Clearing data cancels an in-flight unlock without restoring plaintext
- PASS — Clearing data cancels an in-flight lock removal
- PASS — Writes use fresh IVs and never leak locked fields
- PASS — Tab hidden during lock setup finishes locked
- PASS — Leaving while encryption is pending triggers an unsaved-work prompt
- PASS — Encrypted entry forms describe their actual saving mode
- PASS — Private search and import buffers clear when records lock
- PASS — All routed controls have names, IDs are unique and image alternatives exist
- PASS — Desktop search width defeats the original fixed-icon rule
- PASS — Skip to content retains the current page and route
- PASS — Repeated navigation does not create duplicate history entries
- PASS — Four-practice routines can reorder, complete and exit cleanly
- PASS — Every journey completes, revisits, unmarks and resets
- PASS — Journal editing, deletion and Undo preserve the intended record
- PASS — Every guide can be saved, reopened and removed from the collection
- PASS — Encrypted imports retain encryption by default and reject a wrong passcode
- PASS — Only one lazy image observer is retained across route changes
- PASS — Unicode calendar exports fold correctly and retain selected days
- PASS — Offline setup times out instead of trapping its prepare button
- PASS — A stale tab cannot overwrite a newer encrypted browser archive
- PASS — Exiting a playing practice leaves its engine paused
- PASS — Audit release version is consistent in the UI and metadata
- PASS — Today remains understandable when all suggestions are excluded

## Publication checks still required

The supported browser QA capability was unavailable. DOM tests cannot establish visual layout, native dialog focus, screen-reader output or hardware behaviour. Before public release:

1. Test 360/390/768/1024/1440 px and 200% zoom: topbar, sheets, filters and player without clipping or horizontal page scroll.
2. Test keyboard, VoiceOver and TalkBack: focus return, nested dialogs, skip link, names/announcements and chart tables.
3. Check all themes and system/in-app reduced motion.
4. On supported devices, test local voice, ambient audio, vibration, wake lock and hardware media controls, including interruption/backgrounding.
5. Test HTTPS offline preparation, disconnected reload, update/install shortcuts and the standalone file without internet.
6. Measure Lighthouse and LCP/CLS/INP on the intended host. No scores or timings were measured here.

External support/reference destinations are preserved; their current external availability was not verified by this automated audit. No connected care team, monitoring or clinical-treatment claim is introduced. Encryption covers journals/check-ins/contacts; feedback, preferences, plans and learning progress remain outside the lock as disclosed.
