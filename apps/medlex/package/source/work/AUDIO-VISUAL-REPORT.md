# English listening, term visuals and worldwide assistance

16 October 2026. A bounded follow-up to the existing MedLex app; later architecture phases remain paused.

## Result

- Shared English listening controls in Settings, word details and Pronunciation Studio. Actual device/browser English voices are grouped by accent; previews, term/definition playback, three speed presets, adjustable speed, Stop and refresh are available. Voices arriving through voiceschanged update the picker. Settings previews do not save until Save preferences; term/studio controls save directly.
- Existing name preferences remain supported. Optional voice URI and accent fields travel in v3 backups. An unavailable preference remains visible and playback chooses an available English voice; it never silently selects a non-English voice. There are no invented downloadable voices or custom cloud TTS endpoint. Online/device voice labels reflect the browser's localService flag.
- Device setup guidance explains how to find more English voices. Installed voices are not necessarily exposed by every browser. Actual audible playback and specialist pronunciation quality require device-level review; the automated voice logic uses four mocked English voices plus non-English and missing-voice cases.
- All 1,480 original term records have a system/organ cue; 43 original vector symbols are shared across appropriate contexts. Existing root meanings provide more specific organ choices where available. Source categories provide concept-type badges; a small set of existing word-part meanings supplies cues for uncategorized original teaching terms. Source records are unchanged.
- Study cards and word headers display compact cues. The expandable panel sits after the complete definition, with original chapter/root context and a chapter link. Atherosclerosis has a labelled artery-wall/plaque concept schematic. General icons are clearly described as schematic context cues, not disease-specific scans or precise anatomy. Practice prompts are unchanged so icons do not supply answer hints.

## Worldwide assistance

English remains visible. Every language below includes all 109 distinct word-part meanings from the term records, plus the short learning guides. That is 1,635 authored gloss entries. These are not complete translations of all 1,480 definitions, the 200 word-element tables, or the whole interface. Full-definition translation remains a separate, labelled Google Translate link that needs network access. Arabic and Urdu use RTL; other packs use LTR.

Arabic, Bengali, Chinese (Simplified), French, German, Hindi, Indonesian, Japanese, Korean, Portuguese, Russian, Spanish, Swahili, Turkish, Urdu.

The earlier release notes said 111 word-part meanings. The measured distinct count is 109; current notes and checks now use that count. No missing original part meaning was found. Translation glosses have not received independent native medical-translator sign-off; English source definitions remain visible for context.

International text uses native script fonts and explicit fallback families. The app performs no font request at runtime. Rendering QA used generic public Noto fonts installed only in the test browser environment; device script-font availability remains a platform dependency, alongside device speech voices.

## Validation

- Functional voice checks: late loading, English-only filtering, accent filtering, unsaved previews, presets, cancel/stop, URI/name persistence, backup round-trip, unavailable saved voice and no-English-voice handling. Four English and one non-English voices are mocked; this does not certify real-device audio quality.
- All 15 packs contain 109 nonempty glosses and seven localized guide explanations. All language choices round-trip through v3 validation; Urdu RTL and external translation targets were checked.
- Every term resolves a valid visual symbol; all SVG references resolve. Cards in module banks and the main library have cues.
- 225 browser layout views: 180 expanded term profiles (15 languages × four widths × three themes) and 45 library/module/settings/pronunciation views. No horizontal overflow; no detected visible text below 14px in the expanded term profile checks.
- 54 automated axe views across phone/desktop, three themes, representative scripts and the affected routes: zero detected violations. Two additional 150% text-size views passed. Automated checks are not a WCAG certification.
- Six script/font coverage checks cover Hindi, Bengali, Chinese, Japanese, Korean and Urdu, including Latin fallback; no missing code point in the tested font sets. Visual inspection covered the new cards, schematic, voice panel and phone layout.
- The ten original educational collections remain exactly equal at runtime to the supplied source. Migration/rollback, practice/SRS, Phase 0 worksheet/backup and 12 studio DOM regressions passed during the follow-up.

HTML: 1,113,481 bytes. Deterministic gzip: 367,256 bytes. This remains below the supplied 1.2MB uncompressed budget.

SHA-256: `2e3c72cd866531ffb23a6ddb793d541de789b7e70905dca9d6224ef988baefe3`.

No human medical/editorial, native translation or screen-reader sign-off is claimed. Physical-device audio, other browser engines and clinician review of visual teaching cues remain unverified.

## Implementation

`work/voice-tools.js`, `work/term-visuals.js`, `work/audio-visual.css`, `work/language-help/`, the existing profile/term/studio renderers and build injection are the feature sources. Tests and reports accompany them. No raster CDN assets, credentials, remote AI services or patient imagery were added.

## Primary references

- Web Speech API: https://webaudio.github.io/web-speech-api/
- Windows voice installation: https://support.microsoft.com/en-us/accessibility/windows/narrator/appendix-a-supported-languages-and-voices
- Apple speech settings: https://support.apple.com/guide/iphone/hear-whats-on-the-screen-or-typed-iph96b214f0/ios
- Mac speech settings: https://support.apple.com/guide/mac-help/have-your-mac-speak-text-thats-on-the-screen-mh27448/mac
- Android TTS settings: https://support.google.com/accessibility/android/answer/6006983
- Anatomy reference: https://medlineplus.gov/anatomy.html
- Artery/plaque context: https://medlineplus.gov/ency/article/000171.htm

The vector artwork and glosses are authored for MedLex. These links do not imply endorsement or review by the referenced organizations.
