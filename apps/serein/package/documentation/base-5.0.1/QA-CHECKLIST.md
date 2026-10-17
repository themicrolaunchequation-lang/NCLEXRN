# Serein 5.0.1 QA checklist

Read AUDIT-REPORT.md for fixes and exact verification limits.

## Automated results

- [x] 33 catalogue, engine timing/duration, media, syntax and identity checks.
- [x] 67 navigation, settings, player, studios, journey, storage and privacy behaviour checks.
- [x] 84 preservation, portable syntax/media, routes, guides and size checks.
- [x] 10 hosted/portable worker install, cache retrieval, update and scope checks.
- [x] 247 new assertions across 42 scenarios, including storage conflicts, crypto cancellation, recovery and offline timeout.
- [x] 39 text pairs ≥4.5:1 and 18 border/focus pairs ≥3:1. Exact colours/ratios in RELEASE-METRICS.md.
- [x] Complete standalone HTML is below 1,500,000 bytes and has no external runtime script/style/font/image dependency.

These are jsdom/Node/Python checks. The following real-browser checks remain **unverified**, not passed by implication.

## Manual test script

1. **Viewport layout:** test 360, 390, 768, 1024 and 1440 px in a current browser. Visit all five destinations and all Library/Me segments. Check no horizontal page scroll, readable text, five mobile items and access to Toolkit from Today, topbar search and Library. Check Today’s primary pause is visible early and no sidebar help appears on hover.
2. **Keyboard and focus:** Tab through navigation, filters, search and all dialogs. Use Ctrl/Cmd K and /. Escape should close the topmost dialog and return focus. Start/exit a practice, open/close settings, open evidence and help. Check 44 px targets, visible focus, no traps and logical focus after completion. Test P, Space, arrows, R, F and ? outside text fields.
3. **Themes and motion:** test Light/Dark/Auto/High contrast, change the OS theme while Auto is selected, all reading sizes, focus mode and system/in-app reduced motion. Check no clipping at 200% zoom. Reduced motion should skip the Quick pause countdown and stop decorative movement.
4. **Practice modes:** run all 15 practices, 1/2/5-minute choices where offered, Watch first, orb/photo/text, continuous breathing, pace, external focus, self-paced grounding, step selection, seeking, pause/restart, Present and routine next. Check box corners and no-holds motion. Open support after selecting Uncomfortable; check before/after ratings and opt-in feedback saving.
5. **Native options:** on supported devices test local English voices/rates, generated rain/ocean/hum audio, low volume, screen wake/release, hardware media controls and Android vibration. Background/foreground, audio interruption and permissions must fail gently. No audio or vibration should start without choice.
6. **Storage/privacy:** create visit-only and saved journals/check-ins/contacts; reload. Test draft recovery, explicit saving, Undo deletion, bookmarks, plans and journey progress. Block browser storage or exhaust quota and confirm a clear notice with usable in-memory state.
7. **Encryption:** use disposable records. Enable lock, inspect storage for no plaintext journal/check-in/contact, lock manually/on hide/after timeout, try a wrong passcode, reload and unlock. Verify drafts survive same-tab reload. Export encrypted, import with correct/wrong passcodes, merge/replace, export plain only after consent, remove lock and clear all data. Confirm no queued write restores cleared records. Keep a backup before testing with real records.
8. **Routes and offline:** open old hashes, filtered Library links and a generated team link directly; test Back/Forward. Open the standalone HTML from file:// with network disabled. Host HTML + its sw.js over HTTPS, opt in to offline, reload offline and test update prompts. Test actual iOS/Android installation and manifest shortcuts. Missing worker must show an honest explanation.
9. **Accessibility:** use VoiceOver on iOS/macOS and TalkBack on Android. Check tab/segment names, dialog headings, form labels/errors, countdown announcements, insight chart descriptions and equivalent tables. Test a journal containing markup-looking text and verify it displays as text.
10. **Content and performance:** read each studio result and journey; verify all original guide/safety/source links. Test reminder .ics import in a calendar and selected weekdays/times. Test team links contain no personal fields. Measure Lighthouse mobile Performance/Accessibility/Best Practices and LCP/CLS/INP over throttled 4G; targets are ≥90/100/95, <2.5 s / <0.05 / <200 ms. No scores or timings were measured in this environment.

## Known limits and operational notes

- Offline core content includes images/fonts; external evidence/support pages need internet.
- Support links are UK-specific; local contacts are optional and not monitored.
- Native device APIs, secure context and available local voices vary by browser.
- Forgotten passcodes cannot be recovered; the lock covers journals, check-ins and contacts, not all settings/feedback/plans.
- Local-file and hosted editions have separate storage; use export/import to move records.
- Device layout, visual image quality, screen-reader compliance and Lighthouse remain release follow-up checks. Automated contrast checks cover semantic text pairs; translucent overlays, focus/border contrast and all composed states still need visual inspection.
