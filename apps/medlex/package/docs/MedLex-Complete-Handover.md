# MedLex Complete Application Handover

Healthcare Crown Academy
Application v4 | 16 October 2026

This manual preserves the working product, operating procedures and technical context needed to continue without the original conversations.

## A Purpose and ownership

MedLex is a browser based medical terminology learning app for healthcare learners, practitioners and educators. The product belongs to the Healthcare Crown Academy project and retains its HCA identity. This manual describes the working v4 application and its maintenance handover as at 16 October 2026. It is intended for the owner, a future developer, an educator and an external reviewer.

The handover is designed to stand on its own after the development conversations are deleted. The deployment archive includes editable source, original course datasets, current build output, deployment settings, tests, validation evidence and a brief for a replacement agent. It contains no hosting credentials or copies of the owner's browser learning records. The app can be maintained and deployed without recovering the chat.

Current live address: https://medlex-hca.bouncyfield17.chatgpt.site
The existing publication is private to the selected ChatGPT owner account. The app itself has no account system. Vercel and Netlify deployments are separate projects; their access controls must be chosen in those platforms. The current private access setting is not transferred by uploading static files.

Release source commit: 8bf6ba89b265ad01568aacf2b5a0ca5e531e2ba5. Existing Sites publication version: 9. This archive adds portable hosting configuration and documentation around that release. It does not change the educational application behavior.

## B Preserve your work before deleting the chat

1. Download this manual, the deployment ZIP and the standalone MedLex HTML to a device or storage account you control. Keep a second copy outside this shared ChatGPT account.
2. Open the current live app in the same browser profile where you have been studying. Go to Settings, then Data and offline, and use Export full backup. This step must be performed by you because your real browser records are not present in the source files.
3. If desired, make an encrypted export and store its passphrase separately. Check that the download exists before clearing browser data or closing an unsaved worksheet.
4. Download important worksheets, portfolio reports and educator packs separately when they are needed as records. A copy of application code is not a copy of your learning progress.
5. Deploy to a hosting account you control, open the new address, and import the backup. Confirm your name, saved words, worksheet drafts, review queue and portfolio before retiring the old copy.
6. Give a future developer the deployment ZIP and docs/NEXT-AGENT.md. Keep the old deployment available until the new one has passed the acceptance checks in this manual.

Browser storage is separated by origin. The current ChatGPT Site, a Vercel URL, a Netlify URL and an HTML file opened from disk should be treated as different learning spaces. There is no automatic cross device, cross browser or cross host synchronization. Downloaded HTML cannot inherit records just because its code matches the website.

## C Release contents

| Item | Purpose |
|---|---|
| MedLex-Complete-Handover.docx | Editable owner and developer manual |
| MedLex-Complete-Handover.md | Plain text version for future agents and version control |
| MedLex.html | Complete standalone app that opens locally without login |
| MedLex-Live-Link.html | Small online launcher for the existing private publication |
| MedLex-Deployment.zip | Source, prebuilt site, Vercel and Netlify configuration and this manual |
| dist/index.html | Production entry point to upload to a static host |
| dist/MedLex.html | Byte equivalent downloadable app entry point |
| dist/manifest.webmanifest and sw.js | Hosted installation and offline shell support |
| public and dist icons | App icons in SVG and 192 and 512 pixel PNG forms |
| docs and review/release | Operating instructions, inventories, change decisions and exact test scope |

The root index.html is the Vite source entry. Do not open it directly from disk as a substitute for the production HTML. Use MedLex.html or dist/index.html. The dist folder is ready for manual static upload; the project root is ready for a source repository build.

## D Audience and learning roles

The setup flow offers Doctor, Trainee, Nurse, Allied health, Clinical coder, Educator and Other. Doctor appears first, while the default learner role is Trainee. Existing Student profiles are displayed as Trainee. Role, name, assisting language and daily goal can be changed later in Settings.

Teach navigation appears for Educators or when Teach mode is enabled. This is a local presentation preference, not identity verification, authorization or a secured teacher account. Any person with access to the browser profile can potentially reach its local data. Educator feedback and editorial review names are entered by people; the app does not authenticate their qualifications.

Use the app for terminology learning, documentation literacy and fictional practice. It does not diagnose, prescribe, automatically assign clinical classification codes, verify a professional qualification or award clinical competence. Do not introduce real patient information into learning worksheets.

## E Course coverage

The preserved collection contains 1,480 unique terms, 100 prefix forms, 100 suffixes or clinical endings, 24 chapters, 26 course modules, seven foundation lessons, ten fictional cases, six confusable term comparisons, eight coding questions and four original learning quotations. There are 128 classroom activity records and 78 independent study activity records across the modules.

Thirteen body system banks contain 100 terms each. Some module term lists reuse words from the same underlying collection, so adding module counts does not produce the number of unique terms. Prefix and suffix modules use separate element banks even though their words arrays are empty. Other specialist modules typically contain 20 linked terms. The selected prefix forms include variants and less common forms; the collection is not a frequency ranked top 100.

The exact preserved source is src/data/records. Generated compressed modules under src/data/collections are build output derived from those records. Do not edit the compressed modules instead of the JSON records. The complete original module definitions, including outlines, outcomes, suggested activities and references, are also supplied in docs/MODULE-CATALOG.json.

Learning outcomes are proposed course outcomes. Exact mapping to an independently supplied curriculum is not certified as complete. An educator should record the required curriculum mapping and medical review before using the course as a formally approved assessment.

## F Navigation and first use

The main areas are Today, Learn, Practice, Library, Progress, Teach and Settings. The desktop uses a sidebar, intermediate widths use a compact rail, and phones have a bottom navigation bar. Navigation help is deliberately not attached as a large sidebar hover panel.

First use presents optional two step setup. Choose role and assisting language, then daily goal and appearance. Setup can be skipped and preferences remain editable. Today shows a useful next action, reviews and available work to resume. Learn offers the module pathway, grid and system views. Practice provides focused sessions and specialist studios. Library is the reference workspace. Progress distinguishes forms of learning evidence.

Each module has five current tabs: Overview, Words, Practice, Activities and Resources. Overview combines the outline with outcomes. Activities combines classroom and independent tasks with a clear activity type selector. Older URLs for Outline, Outcomes, Term Bank, Classroom, Independent Study and References redirect into these current tabs.

Use the global search control or Ctrl K on Windows and Command K on Mac. The slash key opens search outside text fields. The g then t, l, p, b or r shortcuts open Today, Learn, Practice, Library and Progress. The question mark opens shortcut help. Escape closes a dialog; it does not discard a full page worksheet.

## G The terminology library

Search covers terms, definitions, plain wording, aliases and component meanings. The Library supports collection filters, word parts, alphabet navigation, sorting, compact rows and grid view. It begins with a bounded set of rows and offers more results rather than rendering every card immediately. Search indexing is prepared during idle time when supported.

A preview stays in the Library preview area when that panel is present. Shared Preview buttons on module pages open the complete term page instead. This distinction fixes the missing panel JavaScript error found during development.

Term pages show the English term, companion definition, plain language wording when present, curated word parts, example, notes, related words, listening controls, schematic visual support and the four skill record. A learner can save a word, mark it self rated familiar, add it to review or practise the word. Previous and next links use the available term list.

Component meanings are shown where components are actually recorded; the app does not split every term by guessing from its spelling. Original thin entries remain preserved, and editorial additions are separate overlays. Do not describe every entry as independently medically reviewed. Full definition translation is an explicitly online external link, not an offline translation engine.

## H Word Anatomy and the atlas

Word Anatomy is reached through Library and the Word Lab route. Search for a term with curated components, select it from the suggestions, then click a colored component to see its meaning and role. Root, prefix, suffix and combining vowel colors are supported by text labels. The English term and full clinical definition remain the reference point.

The Word Anatomy scene uses raised CSS 3D blocks. The atlas uses a shaded, volumetric canvas mesh and clickable body system markers. This is a simplified schematic navigator, not a detailed anatomical model. Text system buttons provide the same selection route and remain available when canvas cannot be used.

Drag with a mouse or one finger to rotate. Focus the scene and use arrow keys to rotate, plus or minus to zoom and Home to reset. Visible buttons provide turn, zoom, reset and play or pause controls. Reduced motion suppresses automatic rotation. Scenes dispose their listeners and animation frames when pages are replaced, and remember their view for the session. Background and offscreen animation is paused.

The canvas uses capped device pixel ratio and a software mesh rather than a downloaded 3D model or online renderer. The fallback remains usable if canvas setup fails. Visual quality, native touch behavior and actual rendering performance still need a fresh real browser check on the final build.

## I Practice and adaptive learning

Daily practice is a resumable mixed session. It combines due reviews, recent errors and words from the current module, with meaning, spelling, components and context questions. A typical mixed session contains ten items; explicit skill modes use a shorter set. Confidence is recorded before reveal. Answers are checked against the current exercise, followed by explanatory feedback and a deliberate next action.

A separate adaptive pathway offers baseline and targeted practice, using learning events to prioritize weaker dimensions and missed words. A learner can start from a term, a root or recent mistakes. Build a Word uses curated components. Matching uses five term and meaning pairs. Confusable Terms focuses on the six preserved comparison records. Spelling accepts listed variants rather than arbitrary approximations.

Four recall ratings are available: Again, Hard, Good and Easy. Recall sessions are bounded to avoid an endless review task. Classic scheduling and FSRS are available; the displayed interval and the committed schedule use the same calculation. FSRS is supplied by the bundled ts-fsrs dependency, with fuzz disabled and a maximum interval of 180 days. Changing scheduler does not immediately rewrite old due dates; an existing card is converted when it is next rated.

Skill scores are estimates from objective answer events, not a medical competency model. Current masteryFor uses the last twelve objective events for each skill, adjusts for time since the latest event and reaches full evidence weight after three events. It is an app heuristic rather than a validated examination score. Familiarity self ratings remain separate from those estimates.

## J Clinical and communication studios

Clinical Note Studio highlights known terminology in fictional clinical text. The learner writes an interpretation and compares it with companion wording. The rubric checks preserved meaning, separation of stated facts from assumptions, recognition of uncertainty and an appropriate verification step. The response is saved as a reflection, not automatically graded by an AI model.

Patient Explanation Studio asks the learner to explain a term in everyday language. Its checklist considers core meaning, jargon, qualifiers, uncertainty, avoidance of unsupported diagnosis or treatment claims and checking the listener's understanding. A companion example supports self review. Written work can later receive educator entered feedback.

Documentation and Coding Studio asks for the documented concept, missing information, jurisdiction, classification edition and verification route. It supports coding literacy rather than code assignment. The existing references include Australian ICD 10 AM, ACHI and ACS resources; a worldwide learner must identify the applicable local classification and edition.

The connected learning journey links a system and word to component study, fictional context, everyday explanation and later recall. It shares the learning record with the rest of the app rather than creating a separate account or disconnected course.

## K Classroom and independent worksheets

Classroom and Independent Study activities have illustrated cards and editable worksheets. Start worksheet opens a full page route, not a download only control or cramped modal. Existing drafts can be resumed. Starting another worksheet preserves older drafts. The URL includes module, activity type, activity index and a sheet identifier, with the current step in a query parameter.

Prepare introduces the task, guidance and optional starter words. Work provides the writing fields and task appropriate grid. Verify presents companion records and space to document how the response was checked. Keep supports reflection, a next recall date, evidence saving and optional export. These four steps remain visible in the editor navigation.

Rows can be added or removed with a recovery action. The app autosaves drafts, offers draft switching and keeps up to ten distinct autosaved worksheet snapshots. Restoring a version replaces the current working copy while leaving other worksheets in place. Blank exports exclude the learner's filled responses; completed exports preserve them. HTML worksheets can be opened and printed, with A4 intended as the worksheet print format.

The save status follows actual storage results: Saving, Saved or Not saved. A failed write leaves the newest response in memory and permits recovery export. A warning is shown before following a link away from a dirty worksheet. Browser or process termination can still lose uncommitted edits. If Not saved appears, export before closing the tab. Saving a reflection does not automatically certify outcome completion or educator approval.

## L Teaching and editorial work

The educator workspace builds assignments by module and activity, connects proposed outcomes, and generates downloadable learner packs and answer guidance. Packs and portfolio exports use academy branding. Educators can inspect evidence and record rubric based feedback locally. The portfolio preserves the basis of an item so that objective answers, self review and educator entered feedback are not conflated.

Editorial review adds plain wording, examples, source details and review information as overlays. It preserves the original term data and does not automatically turn a draft into graded content. Reviewer names and dates are local declarations, not independently verified sign off. CONTENT_BACKLOG.md documents outstanding content enrichment work.

Teaching evidence is deliberately placed in the teaching area. Research figures should retain their source, population, date and limitations. Personal progress charts should come from actual learner events. Do not put invented percentages into feature help or imply that a general educational study measures this app's effectiveness.

Teach mode is not a learning management system. There is no roster, institutional tenancy, class server, central gradebook, secure role based permission system or automatic assignment delivery. Share generated packs or evidence files through a channel chosen by the owner.

## M Progress and the learning portfolio

Progress summarizes activity, learning dimensions, review needs, module status and the available evidence. The app keeps separate concepts: saved, self rated familiar, answered correctly, review scheduling and written or educator reviewed work. A completed module or a filled worksheet does not imply clinical competence.

Portfolio entries can contain exercise evidence, reflections, editorial or teaching artifacts and feedback. Learners can inspect their basis, export reports and retain evidence separately from the app. Reading controls offer focus mode and line spacing. Rest day recording does not invent successful answers or practice events.

Time values, streaks, recall intervals and skill forecasts are learning aids. Browser activity time is not proof of attentive study. A local report is not a tamper resistant transcript or professional certification. Backups are the reliable way to move the whole working record to another browser origin.

## N Languages voice and recording

English remains visible. The assisting language list contains Arabic, Spanish, French, Portuguese, Hindi, Urdu, Bengali, Chinese, German, Russian, Indonesian, Japanese, Korean, Turkish and Swahili. The choice is available during setup, in Settings and in word detail contexts. Arabic and Urdu assistance uses right to left direction.

The offline assistance covers 109 distinct curated word part meaning sets in all fifteen packs, along with short learning guides where provided. This is not a complete translated interface, textbook or medical dictionary. Online full definition translation links leave the app and require a connection. The owner should review language wording with competent speakers before treating it as clinically reliable translation.

Voice controls list English voices supplied by the browser and device, group available accents, refresh when voices load, and provide previews, speed presets, a speed range and a Stop control. The app does not download a new professional medical voice. Some device voices may rely on online services. Availability and pronunciation differ between devices.

Pronunciation Studio offers optional local recording for self comparison, with a one minute limit and playback. Microphone permission and secure browser support are needed. There is no automatic pronunciation score or verified phonetic guide. Do not assume a recording is preserved forever by a JSON backup; export any audio that must be retained independently.

## O HCA identity and interaction rules

The retained identity includes the HCA crest, Healthcare Crown Academy name and footer, embedded Inter and Playfair Display fonts, navy, teal, ivory or warm surfaces, copper and gold. Runtime font family aliases include Studio and Editorial. The company footer includes company number 17501904 and ICO ZC273259 as existing supplied content; this manual does not independently verify those registrations.

Current light theme semantic tokens include navy #10253A, teal #076D69, copper #99512C, gold #9A7026, text #10253A, background #F5F6F5 and warm surface #FFFDFA. Earlier brand artwork uses other copper and gold values; current semantic tokens were adjusted for readability. Dark and high contrast modes have their own values. Update tokens rather than scattering replacement colors through feature code.

Content should fill the workspace beside the sidebar with a compact hierarchy and readable text. Essential instructions belong in the page. Detailed explanations open by deliberate click or tap. Tooltips are for short, relevant meanings and must also work with keyboard focus or tap. Do not restore large sidebar hover panels, repeat guidance in multiple boxes, or use unrelated statistics to decorate a task.

Use schematic visuals at the moment they clarify a term. Avoid visual hints that reveal an answer before the learner responds. Keep icons consistent, preserve motion controls and reduced motion, retain touch and keyboard alternatives, and do not introduce religious imagery or quotations. No new raster image generation is required to build the current package.

## P Architecture and source map

MedLex is a static client side application written with JavaScript ES modules, HTML and CSS. Vite and vite-plugin-singlefile build the production site into a self contained HTML file. fflate supplies lossless compressed data decoding; ts-fsrs supplies scheduling. No backend, API secret, database server or external font CDN is required for the core app.

| Path | Responsibility |
|---|---|
| src/main.js and src/bootstrap.js | Startup, feature wiring and retained event handlers |
| src/router | Hash route resolution, legacy redirects, navigation and page focus |
| src/state | Runtime store, selectors, settings, migration, validation and persistence |
| src/data/records | Ten canonical uncompressed educational datasets |
| src/data/collections and lazy.js | Generated lossless modules and lazy runtime decoding |
| src/features/modern | Current navigation screens and controllers |
| src/features/library | Term details, illustrations, Word Anatomy and 3D scenes |
| src/features/practice | Sessions, quizzes, spelling, recall and scheduling |
| src/features/studios | Clinical, explanation, coding, teaching and portfolio tools |
| src/features/worksheet | Full page worksheet routes, fields, drafts and versions |
| src/features/settings | Profile, voice and assisting language controls |
| src/ui and src/styles | Page composition, dialogs, help, components and visual tokens |
| scripts | Data packing, test bridge generation and build finalization |
| public | App icons and static host headers copied into dist |
| tests and review/release | Reproducible checks and the latest scoped results |

Historical Python injection scripts are not the current build system. The included original HTML under source/upload supports integrity comparisons. Account specific Sites configuration and Git authentication are intentionally excluded from the portable project.

## Q Data schemas and storage

The runtime uses a single shared store with state, course and a compatible app.v3 projection. The name app.v3 does not mean the exported release is v3. It supports retained feature APIs while persistence and exports use v4 records.

IndexedDB database MedLex-v4 is version 4 and has profile, terms, sessions, activity, drafts, portfolio and overlays stores. Splitting and reassembling a record preserves the compatible course and expansion fields. A newer stored timestamp takes priority over an older mirror. Writes use queued immutable snapshots and transactions for changed categories.

The profile holds name, role, goal, theme, motion, text scale, contrast, voice and assisting language preferences. Term records hold saved and familiar flags and scheduling state. Expansion holds learning events, artifacts, drafts, editorial overlays, assignments, feedback, reading preferences and newer session or worksheet history fields.

localStorage medlex-v3 remains a rollback mirror for this release; medlex-v4 can hold v4 metadata or the fallback record depending on the backend. Original medlex-v1 and medlex-course-v2 keys are read for migration without being rewritten. If IndexedDB is blocked, the app falls back to localStorage and exposes its status. The source archive contains the schemas and empty defaults, not the owner's real data.

## R Backups imports and recovery

Full JSON exports use backup version 4 and data schemaVersion 4. The app continues accepting validated v2 and v3 backups. Use Settings then Data and offline for full export or import. Import previews allow the user to inspect a record before replacing current local work. Export the current record first if both histories matter.

Encrypted exports use AES 256 GCM with a random sixteen byte salt and twelve byte IV. PBKDF2 SHA 256 derives the key from the passphrase with 250,000 iterations. The export format records its algorithm and parameters. Encryption uses Web Crypto in the browser. A matching passphrase of at least twelve characters is required by the export form. The app cannot recover a forgotten password.

A full backup is not a server backup or automatic synchronization. Plain JSON and filled worksheet HTML are readable documents. Keep them in an owner controlled location. The downloadable source and deployable app contain no login credentials and do not require any secret environment variables.

If storage fails, keep the tab open, export the newest record, then resolve quota or browser storage restrictions. If a page looks older after an update, export first, refresh and check the current deployment. Clear a service worker or site cache only after securing the local learning record; clearing all site data may remove progress. For rollback, deploy a previous code artifact and restore a compatible backup, rather than assuming an older app understands every new field.

## S Offline hosting and live access

The standalone MedLex.html embeds the application code, style, fonts, data and current visual assets. It opens without login and can study offline. External reference pages, online translation and some device voices still require a connection. Microphone and installation behavior depends on browser capabilities and security rules.

Hosted builds include a manifest, icons and a service worker. HTTPS or localhost is required for registration. The generated worker uses a content derived cache name, preloads the shell, deletes older MedLex caches and uses network first navigation with a cached fallback. It does not intercept unrelated external origins. Installation options such as Add to Home Screen vary by device.

The live launcher HTML is intentionally small: it offers a link to the existing online app and is not the application itself. Opening it still needs internet and access to the private ChatGPT publication. For independent availability, deploy the included app to your own hosting account. A static Vercel or Netlify deployment does not automatically inherit the current owner's private account gate.

The package publishes only dist. Source code, tests, manuals and the original integrity fixture stay outside that publish directory in source builds. The app has no patient record service, analytics integration or remote learner database.

## T Build and local maintenance

Use Node.js 24 and npm. The archive includes .nvmrc and a package engine declaration; package-lock.json records the installed dependency versions. Runtime dependencies are bundled for the user. Development dependencies must be installed on the build host because Vite and its plugins are build tools.

From the extracted project root run:
```sh
npm ci --include=dev
npm run build
```
The build packs original JSON records, runs Vite and finalizes the single HTML file, manifest, icons and content versioned service worker. The result is dist. Run npm run dev for development when a local development server is appropriate; do not use the source index directly as the final offline app.

For functional verification run:
```sh
npm run build:test
npm test
npm run test:release
npm run build
node tests/release-production.cjs
npm run test:offline
```
The test build exposes a development test bridge. Production HTML must not expose window.__MEDLEX_TEST__. Browser scripts require a suitable Chromium executable and configuration on the review machine. Current checked in browser scripts include historical output path defaults; adjust those or set their supported MEDLEX environment overrides before running elsewhere.

Change canonical data with stable IDs, update the UI or feature source, rebuild, run integrity and workflow checks, export a sample migration backup and inspect the exact production build. Keep package-lock.json with the source. Never replace current source with an older download solely because its filename looks similar.

## U Deploy to Vercel

For a source managed deployment, extract MedLex-Deployment.zip and place its contents at the root of a repository you control. Import that repository as a new Vercel project. Choose the directory containing package.json and vercel.json as the project root. The supplied configuration uses framework null for Other, installation npm ci --include=dev, build npm run build and output directory dist. Use Node.js 24. No application environment secrets are required.

The project builds a static site. Its navigation uses hashes, so no catch all SPA rewrite is needed for normal routes such as /#library/lab. Keep real sw.js, manifest and icon requests distinct from the app HTML. The supplied headers ask the browser to revalidate the service worker and manifest.

For a no build alternative, use the separate MedLex-Static-Upload.zip included in the main archive. Extract it, then deploy that folder with the Vercel CLI or the platform's available static project workflow. Its own vercel.json disables install and build and publishes the current directory. Do not select the main archive root when you intend to use this prebuilt configuration.

After deployment, open the returned address, check Word Anatomy and the atlas, import a copy of your backup, and complete the acceptance checks. Choose project access controls in Vercel before sharing the link. No Vercel project or external account deployment is created by this handover task.

Official configuration reference checked 16 October 2026: https://vercel.com/docs/project-configuration/vercel-json

## V Deploy to Netlify

For a repository deployment, import the extracted project into your Netlify account. Use the repository root, the included netlify.toml, build command npm ci --include=dev && npm run build, publish directory dist and Node.js 24. Netlify may install dependencies before the configured command; the explicit clean install in that command ensures the locked build dependencies are available.

For manual upload, open https://app.netlify.com/drop and upload the extracted dist folder or the contents of MedLex-Static-Upload.zip. The uploaded folder must contain index.html at its top level together with sw.js, manifest.webmanifest and the icons. Upload built files rather than src or an unbuilt source entry. This path does not need Node or a cloud build to serve the already built app.

The dist _headers file includes cache revalidation for the entry HTML, service worker and manifest. Hash navigation works without a catch all redirect. Check the deployed URL before adding a custom domain, then import a backup and verify it. A changed host or custom domain is a new origin and will not silently inherit the old local records.

Use the hosting dashboard's rollback or upload a known previous dist for a code rollback. Code rollback does not roll back browser learning records. Retain the old build, current backup and a record of which source commit produced each release.

Official references checked 16 October 2026:
https://docs.netlify.com/build/configure-builds/file-based-configuration/
https://docs.netlify.com/deploy/create-deploys/

## W Validation and release limits

The latest functional audit passed seven regression suites covering data equality, legacy migration, storage readback and quota recovery, Classic and FSRS scheduling, voice controls, language support, editable worksheets, assignments, feedback, matching, onboarding and portfolio actions. All ten educational collections matched the preserved original.

There were 418 DOM page and redirect checks, generation checks for all 1,480 term profiles, a complete mixed practice session and actual Web Crypto encrypted export and import preview checks including a wrong passphrase. The 3D scenes passed synthetic pointer, release, keyboard, zoom, reset, reduced motion and cleanup checks. A mocked canvas exercised drawing paths with finite coordinates.

Twenty five axe structural scans passed in JSDOM with color contrast explicitly disabled. The minified production HTML passed nine route smoke checks without the test bridge. Generated manifest icons and offline worker cache logic passed mocked API tests. These are scoped automated results, not a full accessibility conformance claim or evidence of clinical effectiveness.

Fresh rendered browser checks were unavailable for this release. Visual layout, contrast, real touch and drag performance, microphone and voice playback, actual HTTPS installation and authenticated manifest requests still need real browser acceptance. Earlier Chromium screenshots and larger audit counts refer to earlier builds and must not be reported as new evidence for this final release. The current reports and build hash are under review/release.

## X Acceptance checklist and troubleshooting

| Symptom | Action |
|---|---|
| Blank source page opened from disk | Open MedLex.html or dist/index.html instead of root index.html |
| Host serves source rather than app | Set publish or output directory to dist and rebuild |
| Existing records appear missing | Use the same browser and origin, or import the old backup |
| Worksheet shows Not saved | Keep the tab open and export recovery before closing |
| Audio unavailable | Refresh device voices, select an installed English voice and check browser audio |
| Microphone blocked | Use HTTPS, allow microphone permission and check device support |
| Atlas is simplified or uses fallback | Use system buttons; verify canvas and final browser rendering |
| Word selection is unrecognized | Choose a suggested term with curated components |
| Full translation does not load offline | Use offline component help or reconnect for the external link |
| A page appears stale after deployment | Export first, refresh and inspect service worker or host cache |
| Encrypted import fails | Check the original file and passphrase; no password recovery exists |

Before sharing a new host, test Today, all module tabs, Library search, term preview, complete term page and historical links. Complete a daily session and confirm feedback. Create, edit, reload, resume and export a worksheet. Confirm saving with storage available and recovery when storage is blocked. Export and import a synthetic JSON and encrypted backup.

On desktop and a real phone, test both 3D scenes by pointer and keyboard, text at 150 percent, layout at 200 percent browser zoom, light, dark and high contrast themes, focus order, dialogs, hover and tap meanings, and reduced motion. Print a worksheet and learner pack. Check voices, recording permission, installed offline behavior and update behavior. Keep failed results with their exact build hash and browser version.

## Y Known limits and future work

The course remains a local first learning companion. It has no cloud sync, secured accounts, institutional enrollment, automatic AI marking, verified professional voice library, complete multilingual medical dictionary or independently authenticated reviewer signatures. These are separate development projects rather than hidden configuration switches.

Independent medical editorial review, expanded distinct term examples, formal curriculum mapping and language review remain work for appropriate reviewers. Some original expanded entries are brief or templated; preservation does not certify their depth. The editorial backlog is included so a future agent does not mistake an unchanged dataset for finished review.

Potential later work includes secure opt in synchronization, authenticated educator review, more detailed reviewed anatomy, recordings with dependable independent export, accessibility acceptance on assistive technology and performance monitoring on real devices. Do not add these by silently uploading learner content to a new external AI or storage service.

Changing the whole interface, medical content, storage schema or user data model should be a separate scoped change with backups and migration tests. Prioritize unfinished verification and content review before adding more decorative features.

## Z Continuing without this conversation

The project can be handed to another agent or developer using the ZIP, this manual and docs/NEXT-AGENT.md. The current application is already built; the next maintainer should first reproduce the build and inspect current reports, then work on a small agreed change. They should not reconstruct the app from the development conversation or start another Python injection layer.

Preserve the HCA identity, 26 modules, 1,480 terms, 200 element records, fifteen assisting languages, voices, worksheet drafts, learning evidence and existing backup compatibility. Keep English visible, offer clear recovery, retain keyboard and touch support, and keep essential guidance inline. Do not claim independent medical review, clinical competence, automated grading or full translation where the app does not provide it.

The deployment ZIP contains enough source and data to rebuild the static application. The separate learning backup contains your personal progress. Store both independently. The live launcher only points to the existing account bound publication; a deployment in your own hosting account is the independent live copy.

Useful starting files are README-DEPLOY.md, docs/NEXT-AGENT.md, docs/REQUIREMENTS-AND-DECISIONS.md, docs/MODULE-CATALOG.json, MIGRATION.md, CONTENT_BACKLOG.md and review/release/AUDIT.md. Any future release should update its manual, validation scope, source identifier, checksums and deployment instructions together.

## Appendix Module catalogue

| Module | Title | Term links or element bank | Classroom | Independent |
|---|---|---|---|---|
| ch1 | Basic word structure | 20 | 5 | 3 |
| ch2 | Building a medical vocabulary | 20 | 5 | 3 |
| prefixes | 100 prefix forms | 100 elements | 4 | 3 |
| suffixes | 100 suffixes & clinical endings | 100 elements | 4 | 3 |
| ch3 | The human body | 20 | 5 | 3 |
| ch4 | Musculoskeletal system | 100 | 5 | 3 |
| ch5 | Integumentary system | 100 | 5 | 3 |
| ch6 | Haematology | 100 | 5 | 3 |
| ch7 | Lymphatic & immune systems | 100 | 5 | 3 |
| ch8 | Endocrine system | 100 | 5 | 3 |
| ch9 | Cardiovascular system | 100 | 5 | 3 |
| ch10 | Respiratory system | 100 | 5 | 3 |
| ch11 | Digestive system | 100 | 5 | 3 |
| ch12 | Nervous system | 100 | 5 | 3 |
| ch13 | The senses | 100 | 5 | 3 |
| ch14 | Urinary system | 100 | 5 | 3 |
| ch15 | Male reproductive system | 100 | 5 | 3 |
| ch16 | Female reproductive system | 100 | 5 | 3 |
| ch17 | Obstetrics & neonatology | 20 | 5 | 3 |
| ch18 | Mental health | 20 | 5 | 3 |
| ch19 | Oncology | 20 | 5 | 3 |
| ch20 | Infectious & parasitic diseases | 20 | 5 | 3 |
| ch21 | Radiology & nuclear medicine | 20 | 5 | 3 |
| ch22 | Pharmacology | 20 | 5 | 3 |
| ch23 | Complementary & alternative therapies | 20 | 5 | 3 |
| ch24 | Public health & research | 20 | 5 | 3 |

These are exact module record counts. Full section text, outcomes, task descriptions and references are preserved in docs/MODULE-CATALOG.json and src/data/records/COURSE_MODULES.json. The separate 1,480 term collection supplies term definitions and related fields. Do not sum the linked module words to infer unique terms.

## Appendix File integrity and references

The packaged standalone HTML is the same application build as the latest private publication. Its SHA 256 digest before hosting configuration files are added is:
94c3ea598f325bd04a81dde3514866e43510ebb3515cf90e17eeeb468f4b33b5
Its size is 935,006 bytes. Packaging adds deployment settings and manuals without changing those HTML bytes. CHECKSUMS.sha256 records the final package members separately.

Existing educational reference: Walker, Wood and Nicol, Mastering Medical Terminology, third edition, Elsevier Australia, 2021. The textbook PDF is not included in this handover. Some reference links in the app point to account specific resources and will not be public for other users. Chapter background is not a claim that every extended term entry is reproduced in that reference.

Additional existing reference destinations include MedlinePlus medical words and word parts, the National Cancer Institute dictionary, CDC epidemiology resources, WHO terminology resources, NCCIH and IHACPA. Verify live source dates, editions and permissions before changing teaching or classification claims.

The software bundles fflate and ts-fsrs with MIT notices. Those notices are included. HCA brand assets, embedded fonts, illustrations and educational text do not receive a blanket open source license from this archive. Confirm original rights and font or imagery provenance for redistribution. No original textbook PDF, hosting tokens, account cookies, Git history or private learner backup is included.

Hosting configuration references were checked against Vercel and Netlify official documentation on 16 October 2026. Platform interfaces can change; the explicit build command and publish directory are the enduring settings to verify.
