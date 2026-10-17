# MedLex · Healthcare Crown Academy

## Current release: illustrated learning, wider pages and annotation workspace

This is a browser-based medical terminology learning app. It contains 26 course modules, 1,480 terminology records, 100 prefixes, 100 suffixes/clinical endings, guided activities, practice, written worksheets, progress records and teaching tools. The original learning collections remain unchanged in this release.

The app contains 56 raster infographics in six collections. The latest expansion adds four pitfalls posters, four clinical-concept posters, five illustrated direction/position guides and three memory sheets containing 18 new cues. There are now 68 original memory cues. The Today page retains its welcome composition, animated visual-guide display, motion control, real daily activity, resume links and floating interactive app guide.

## 17 October continuation audit

The updated viewer has checks for width fit, all three ink tools, colors and sizes, undo/redo, note creation and editing, safe literal text, pointer and keyboard movement, deletion, poster isolation, backup validation, reload persistence and storage-failure recovery. The seven general regression suites and the Today guide checks also pass. These are automated emulator checks; they do not replace a rendered browser review.


Closing a poster opened from a direct link now keeps it closed while searching or switching gallery groups. Navigating away while an image-backup file is being read discards its unfinished preview. Once a restore has started, its image saves continue and report completion without requiring the old page to remain open. Navigation regression checks cover all three cases with deferred reads and IndexedDB writes.

The supported native browser testing capability was unavailable for this audit. Automated DOM, storage, production-build and service-worker checks do not verify device rendering, touch behavior, fullscreen behavior or visual contrast. Independent medical-editor review of the teaching content also remains pending.

## Start and navigate

Open Today to begin or resume a ten-item daily session. Review what is due, strengthen a skill, and meet words from the current module. Alternatively, open Learn and choose a topic. The sidebar is the stable map: Today, Learn, Practice, Infographics, Progress, Library, Teach when enabled, and Settings. Mobile navigation provides the main destinations and the menu opens the remaining sections.

The floating **How to use MedLex** button on Today opens a seven-part field guide. Click the topic buttons or use arrow keys/Home/End on them. Previous and Next move through the guide. Destination links take you directly to the relevant feature. Escape or Close dismisses the guide and returns focus to the opener. Navigating away closes it.

## Learn

Each module has Overview, Words, Practice, Activities and Resources. Read the outline, explore definitions, practise the terms, apply your learning and check the references. Outcomes are self-ratings and proposed alignment statements; they do not certify competence. A supplied curriculum document and educator verification are still needed for formal curriculum alignment.

The body-system terminology banks include thirteen systems with 100 terms each. Other terminology covers foundations and clinical concepts. Prefix/suffix banks contain variants and extensions; their ordering does not claim a measured frequency ranking.

## Library and word analysis

Search by term, meaning or listed variant. Filter by body system, initial letter, saved/familiar status and word components. Preview a term, then open its full page for definition, plain-language meaning, pronunciation, context and curated word components. Component clues do not replace a verified complete definition. Eponyms and abbreviations may need a reference rather than a forced split.

Word lab and body atlas provide interactive learning scenes. Controls and motion follow the app’s preferences. Selected word labels can show a short meaning on focus/hover; deeper explanations are inline or explicitly opened. Sidebar help does not rely on hover.

## Practice and records

Practice includes meaning, context, spelling, word construction, listening/spelling, matching and confusable terms. Recall cards require an answer attempt before revealing, followed by an honest rating. Device speech depends on installed browser/operating-system voices. It is a learning aid rather than a pronunciation assessment.

Objective responses feed the meaning/spelling/components/context records. Familiarity and outcome ticks are kept separate from objective results. Daily activity and streaks reflect recorded work; rest-day handling does not invent practice results.

## Infographics

The visual library has six groups: Decode & pronounce (9), Common pitfalls (6), Memory cues (8), Directions & position (8), Body systems (14), Clinical concepts (11). Search across topics or choose a group. Open a poster to use the flip viewer, keyboard arrows, Home/End, zoom, Fit 50%, Full width, fullscreen or touch swipe in Hand mode at Fit width. The popup now opens at a comfortable desktop size. Use **Popup size − / +** beside Close to switch among Compact, Comfortable and Wide; your choice is remembered on this device. Phones use a full-screen viewer. These buttons resize the window. On desktop, the poster opens at 50% of the available popup width to show more of the tall board. **Fit 50%** restores that overview after zooming, while **Full width** uses the image area for close reading. On narrow phones the overview automatically uses full width for legibility. Scroll vertically for the rest of a tall poster. The group menu jumps to a collection. Study text opens the text transcript, checking references and recall answer. Production prompts and related-module controls have been removed from the visual library.

All 56 posters show MedLex, Healthcare Crown Academy and the crest branding. All are illustrated raster posters made with the built-in image-generation tool. The five schematic direction/position versions have been replaced with painted educational posters matching the earlier collection. The app uses optimized WebPs. Original PNGs are supplied in the earlier 40-image archive and the new 16-image archive. Independent medical-editor sign-off is pending.

The 68 memory cues are original MedLex memory cues for common word parts. They are not a verified “50 most common” popularity list, official definitions or validated clinical rules. Always retrieve the real meaning after using a cue.

## Drawing and notes in the viewer

The top editing toolbar stays on one line. On narrow screens, scroll that row horizontally. Hand scrolls or pans the poster. Pen draws a fine opaque line; Marker is broader and translucent; Highlighter uses a wide transparent stroke. Choose an ink color and Fine, Medium or Bold. Sticky note selects note placement: click the poster, or focus the image stage and press Enter. Write inside a note, drag its header or use arrow keys on the header to move it, and choose Yellow, Mint, Blue, Rose or Lilac. The color selector changes the selected note and the next note. Delete removes one note. Undo, Redo and Clear apply to the current poster; Clear can be undone. Edit history resets when changing posters, while committed marks and notes persist.

Drawings and notes save per poster on this device. Changing pages or zoom does not transfer marks to another poster. Export notes downloads a JSON backup of all annotated posters. Restore notes backup is in the Infographics backup panel and previews which poster collections will be replaced. Notes backups are separate from learning backups and imported-image backups. A storage failure keeps the current work available for export and shows an unsaved status. Included poster files stay unchanged; Download image exports the underlying poster, and the notes backup carries editable marks and text.

Shortcuts outside text fields: V Hand, P Pen, M Marker, H Highlighter, N Sticky note, Ctrl/Cmd+Z Undo and Ctrl/Cmd+Shift+Z Redo. Note text and note-move controls keep their own arrow keys. See `docs/ANNOTATION-VIEWER.md` for the control map and maintenance notes.

## Worksheets and portfolio

Start a classroom or independent activity from a module. The worksheet steps are Prepare, Work, Verify and Keep. Autosave, recovery export and recent versions help preserve drafts. Wait for a pending save before leaving. Verify using the companion material, then retain the work in your portfolio. Today links to the latest worksheet. Reflection rubrics and written responses are distinct from scored objective questions.

## Teach

Educator/Teach mode exposes assignment preparation, proposed curriculum mapping, learning packs, editorial review and research evidence. Human review remains central. Research pages describe source populations and limits; they do not claim that this app has reproduced the same learning outcomes.

## Preferences and accessibility

Pages use the available width with a 1 cm desktop gutter beside the sidebar and responsive smaller gutters. Default text is now 18 CSS pixels at a normal browser font setting; the existing text-size preference scales from that larger base. Settings controls profile, assisting language, readable text, theme, high contrast, reduced motion, daily goal and speech. English remains the reference language. The Today motion button can pause its decorative movement; reduced motion in Settings or the device takes priority. The new guide and infographic viewer use native modal dialogs and labelled controls.

Structural accessibility checks are included, but native browser/device testing and visual contrast/layout checks require a browser review. See the validation records for scope.

## Data, backup and offline

Learning records remain local to the browser. Export a normal or encrypted learning backup before changing devices or clearing browser data. Encryption uses the existing app’s passphrase workflow. A forgotten passphrase cannot be recovered from the app.

Imported infographic replacements have their own image database and separate image backup. A learning-progress backup does not contain them or infographic annotations. Drawings and sticky notes have a third, separate notes backup. Failed image saves can remain visible for the session; export that image backup before closing. Included posters are part of the release and do not require a personal image backup.

The hosted app loads raster posters as needed. Its service worker caches the shell and attempts to cache posters. The complete downloadable `MedLex.html` embeds all 56 posters, so opening that file locally includes the full collection without fetching separate image assets. The live app and local file use different browser storage contexts; transfer learning records using export/import.

## Deployment and files

The deployment archive includes source, lockfile, tests, docs, `dist`, Vercel and Netlify configuration, the complete HTML, and a smaller prebuilt static-upload ZIP. Use Node 24 and `npm ci --include=dev`, then `npm run build`. The output directory is `dist`. The production build checks the complete HTML against the current host’s 25 MiB per-file limit. Original PNG downloads retain their full resolution; app WebPs are optimized for delivery. Vercel and Netlify configuration in the archive specifies that build/output setup. For a manual static upload use the prebuilt ZIP’s contents.

`dist/index.html` is the compact hosted entry. `dist/infographics` holds the 56 WebPs. `dist/MedLex.html` is the complete standalone file. Keep all hosted output files together. No server database or private API key is needed by this app. Host access controls are separate from the local learning-data design; a standalone file does not reproduce the original host’s account gate.

## Maintaining this project without chat history

Start with this guide, the included earlier full handbook, `README.md`, `CHANGELOG.md`, `docs/infographics/README.md`, the current infographic catalog, and review reports. The code is modular vanilla JavaScript with Vite. `src/main.js` installs the app, feature controllers and offline support. `src/router` manages routes. `src/state` manages preferences and storage. `src/features` contains learning areas. `src/styles` contains the brand and feature styles. Original content is in `src/data/records`; preserve those collections unless making an explicit editorial change.

Run `npm run build:test`, `npm test`, `npm run test:infographics`, and `node tests/welcome.cjs` for the current functional checks. Build production with `npm run build`, then run the production smoke and worker tests. Review evidence distinguishes emulator checks from browser checks. Do not treat a previous passing report as evidence for an untested future change.


## Latest teaching expansion

The new guides cover look-alike roots, singular/plural forms, suffix interpretation limits, abbreviation ambiguity, sign/symptom/syndrome/diagnosis, time course versus severity, screening/diagnosis/prognosis, infection/colonization/contamination/inflammation, standard body planes, median/parasagittal/oblique planes, patient positions, movement pairs and abdominal quadrants. Memory sheets add vessel, tissue and process-ending cues. Read `docs/infographics/EXAM-EXPANSION-GUIDE.md` for the full index, separate teacher key, references and proposed next curriculum priorities. Original course datasets remain unchanged.
