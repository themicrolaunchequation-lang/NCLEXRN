# Meaning and language-help follow-up — 16 October 2026

This bounded follow-up implements the screenshot requests after Phase 0. Phase 1 and later architecture changes remain paused.

## Experience

- Word-detail dialogs fill the viewport with 40px gutters from 720px upward, capped at 1600px wide; phones use 12px gutters. At 1920px the cap leaves 160px gutters.
- Definition cards use the panel width. Anatomy and context share two columns at 1100px and above; smaller screens stack them. Word-part cards divide the available column evenly and wrap when needed.
- Each word part shows its unchanged English contribution on hover or keyboard focus. Clicking or tapping pins that meaning inside the content. Escape dismisses a tooltip before the dialog. Native browser-title duplicates are removed from these targets.
- Question-mark labels provide short explanations. Clicking pins the guide; a separate inline disclosure explains prefix, root, suffix and combining vowel. Essential definitions remain visible.
- Setup, Settings and each word detail offer English-only, Arabic, Spanish or French assistance. The chosen preference is saved in v3 progress and included in backups. Arabic glosses use RTL and preserve English alongside them.
- All 109 distinct English meanings used by the original term word parts have authored learning glosses in each of the three assisting languages. This does not translate every full definition or the entire UI. The Word Lab shares these word-part tips and pinned glosses.
- Full definitions have a separate labelled Google Translate link when an assisting language is chosen. Opening it shares only that public definition; hovering performs no remote translation request. This optional service needs network access and is clearly labelled as machine translation.
- Learning roles list Doctor first, followed by Trainee, Nurse, Allied health, Clinical coder, Educator and Other. New profiles default to Trainee; existing Student profiles are shown as Trainee. Doctor is retained across setup, Settings and backups.

## Measured validation

- 60 term-dialog layouts: 390, 768, 1024, 1440 and 1920px × light, dark and high contrast × English-only and all three assisting languages. No horizontal overflow or visible text below 14px.
- 24 automated axe views: term details with the inline guide and pinned meaning; onboarding; Settings. Phone and desktop, light/dark/high contrast. Zero detected violations; this is not a WCAG certification.
- Three additional term-profile checks at 150% text size: 390, 768 and 1440px; no horizontal overflow.
- Actual Chromium pointer-hover, keyboard focus/Enter/Escape, touchscreen tap and language-switch interactions passed. No page errors.
- Functional checks cover onboarding and Settings, Doctor/Trainee ordering and legacy display, language persistence, v3 backup round-trip, invalid-language rejection, glossary coverage, Arabic direction, pinned meanings and translation-link boundaries.
- The original ten educational collections remain exactly equal to the supplied original at runtime. Legacy keys, v3 migration, practice, SRS and Phase 0 worksheet/backup regressions passed. Twelve studio DOM regressions also passed during this follow-up.

## Output and scope

HTML: 1,055,900 bytes. Deterministic gzip: 344,907 bytes. Still below the supplied 1.2MB uncompressed budget.

SHA-256: `e00465da6f05c89b0ef36e75bf9ecb2af3c438053831db435ad560657e00d673`.

No educational definitions, statistics or word-part source records were changed. Learning glosses are authored assistance and have not received independent medical-translator sign-off. The English definition remains the reference. The app does not imply that the assisting-language pack is a full medical dictionary.

Browser verification used automated Chromium plus visual inspection of the desktop word panel, phone pinned meaning and setup. Other browser engines, physical devices and human screen-reader review remain unverified. This package's screenshots and reports describe this follow-up; source/work/PHASE-0-REPORT.md and earlier reports describe the previous release.

## Reference links

- Original English word-part records are preserved from the supplied app.
- General word-part reference: https://medlineplus.gov/appendixa.html
- Additional dictionary lookup: https://www.emro.who.int/home-page/information-resources/umd.html

These links are references for checking terminology; they do not imply that WHO or NLM reviewed or supplied this app's translations.
