# MedLex — Phase 0 with meaning and language help

The app remains one offline HTML file with embedded HCA fonts, artwork and unchanged educational data. Open MedLex.html in a modern browser; no network, login or runtime package installation is required for the downloaded version.

## Current experience

Today, Learn, Explore, Practice, Progress and Tools are retained. All original modules, word elements, Word Lab, knowledge checks, cases, spelling/components/classification/coding practice, recall, matching, clinical interpretation, patient explanation, pronunciation/recording, assignment packs, editorial overlays, portfolio/feedback, curriculum mapping, calendar, import/export, encrypted recovery and reset/undo remain available.

The worksheet is now a full page with a bookmarkable URL. It supports four steps, row cards on phones, a desktop table, draft switching/duplication/deletion with undo, row controls, optional starter words, deliberate reference disclosures, portfolio evidence and printable exports. Completion and scored results remain separate from written self-review. Save status reflects the real local write result; blocked storage permits a recovery export.

The avatar opens preferences, Settings and backup tools. Module downloads use a disclosure. Retained module tabs scroll in one row and support arrow keys. The search palette groups terms, parts, modules, activities, studios and actions; Ctrl/Cmd+K or / opens it. Sidebar hover panels are absent. Existing learning guides and research retain their original population, source and limitations.

## Meaning and language help

Word-detail dialogs now use a wide, responsive layout, with equal-width word-part cards and short hover/focus meanings. Click or tap keeps the meaning visible. Question-mark labels explain the definition and context cards. A simple word-part guide is available as an inline disclosure.

Setup, Settings and the word dialog offer an optional assisting language: Arabic, Bengali, Simplified Chinese, French, German, Hindi, Indonesian, Japanese, Korean, Portuguese, Russian, Spanish, Swahili, Turkish or Urdu. All 109 distinct meanings used by the existing term word parts have authored learning glosses in each language; English stays visible. Arabic and Urdu glosses use right-to-left text. These are word-part and guide translations, not a complete translation of every term definition or the whole application. Full English definitions have a separate, explicitly online Google Translate link. No translation request occurs on hover.

## English listening and term visuals

Settings, Pronunciation Studio and word details share an English voice picker with accent filtering, voice previews, three speed presets, a continuous speed control, Stop audio, refresh and device setup guidance. Only voices actually exposed by the browser are listed. Voices load asynchronously; the picker updates without resetting the rest of the form. Settings previews use unsaved choices; word/studio controls persist their choices. English voice names and URIs are retained in v3 backups, with an English fallback if a saved voice is unavailable on a different device. Local/online service labels come from the browser. Medical TTS pronunciation and real-device availability are not guaranteed.

All 1,480 term records have a contextual visual cue using 43 original vector symbols. A chapter/system icon, a more specific provided root where possible, and source concept-type badges appear in study cards and word headers. Expand Visual learning cue beneath the full definition for a larger illustration, original root clues and a chapter link. Atherosclerosis has a labelled artery/plaque concept schematic. These icons are learning cues, not 1,480 diagnostic images; practice-answer screens were not decorated with clues.

International script text uses the device's script fonts, with explicit Windows/Noto fallback families. Browser script-rendering QA used locally available Noto fonts. No runtime font/image service or translation request runs on hover.

## Data and trust

All ten original educational collections are preserved exactly at runtime: 1,480 terms, 100 prefixes, 100 suffixes and 26 modules. No independent clinical/editorial sign-off or curriculum accreditation is claimed. CONTENT_BACKLOG.md is unchanged. Use fictional examples, not patient information. Optional TTS and microphone capabilities depend on the browser/device; recordings remain in the tab and are not included in backups.

Progress remains in medlex-v3. Older rollback keys are left untouched. Export/import transfers progress between browsers or devices; there are no cloud accounts or simulated account sync. See MIGRATION.md for the Phase 0 boundary and future v4 work.

## Build and tests

The Phase 0 build deliberately retains the legacy Python injector. Install Python requirements, then `npm ci --prefix work/testdeps` and `python work/upgrade.py` from source/. This writes MedLex.html. Copy it to ../dist/index.html for hosting. The new Vite/npm build is a Phase 1 deliverable, not a claim of this release.

From source/ run:

- `node work/tests/audio-visual.cjs`
- `node work/tests/audio-visual-browser.cjs`
- `node work/tests/language-help.cjs`
- `node work/tests/language-layout.cjs`
- `node work/tests/guided-dom.cjs`
- `node work/tests/integrity.cjs`
- `node work/tests/expansion-dom.cjs`
- `node work/tests/phase0-audit.cjs`
- `node work/tests/phase0-flows.cjs`
- `node work/tests/phase0-after-extra.cjs`
- `node work/tests/phase0-worksheet-layout.cjs`

For `language-layout.cjs`, set `MEDLEX_CHROMIUM` to an existing Chromium executable when needed; otherwise the installed @sparticuz launcher is used. New evidence is written to work/language-qa/.

Browser tests use Playwright Core and the Linux @sparticuz/chromium distribution. They write evidence into work/phase0/. Other platforms need a supported Chromium installation/launcher. Runtime use of the final HTML is independent of these development dependencies.

## Validation and phase boundary

AUDIO-VISUAL-REPORT.md describes the current voice, visual and worldwide-language follow-up. LANGUAGE-HELP-REPORT.md describes the current bounded UI/language follow-up. PHASE-0-REPORT.md maps D1–D18 to changes and source files. validation.json records only measured checks. Screenshots and raw audit reports accompany the review package. Automated Chromium checks do not certify WCAG compliance or clinical accuracy. Human screen-reader/medical/curriculum review, physical devices, other browser engines, final performance targets and full print-quality verification remain open.

Per the supplied prompt, work stops after Phase 0 for review. ES modules/Vite, the complete design-system/IA changes, FSRS, IndexedDB and v4 exports belong to subsequent phases.
