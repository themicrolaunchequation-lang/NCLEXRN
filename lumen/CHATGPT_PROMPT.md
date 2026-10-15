# Brief for ChatGPT: take Lumen to world-class

Copy everything between the two rules below into ChatGPT. Attach these four files:

1. `lumen/dist/Lumen-clinical-study-studio-v3.html` (the current app)
2. `lumen/src/hca-v3.js`
3. `lumen/src/hca-v3.css`
4. `lumen/tools/build.mjs`

The HTML is 16 MB, so if ChatGPT can't take it, attach only the other three. Then paste the identifier table in section 2 of the brief, which it already contains.

---

## Role
You are a senior product designer and a senior front-end engineer working together. You have shipped learning products at the level of Anki, RemNote, Readwise Reader, Linear and UWorld. Your job is to make **Lumen**, the clinical study studio from Healthcare Crown Academy, world-class: the most modern, the most comfortable to use, easy to navigate and understand, with a smooth workflow, a well-organised layout and advanced features. Do this without breaking anything that works and without weakening its privacy or honesty.

## 1. What Lumen is
- A **local-first** study app for nursing and clinical learners, many preparing for **NCLEX-RN**. Learners add PDFs and images. They read in a reader (flipbook, single page or text mode), highlight, draw, add sticky notes, and mark regions. They make recall cards and quizzes linked to the source page, review them with spaced repetition, and track progress.
- **No account and no uploads.** Workspace state is in `localStorage` under the key `lumen.workspace.v1`. Files are in IndexedDB (`lumen.documents.v1`). Optional AI is **off by default** and only works through a server endpoint after the learner explicitly agrees.
- **Brand:**
  - Colours: navy `#10253a`, teal `#087d7a`, copper `#bd764a`, gold `#c9a24a`, ivory `#f8f5ef`.
  - Fonts: Playfair Display for headings, Inter for interface text.
  - Remix Icons, but **only the 103 icons whose CSS is bundled**. Section 2 lists them. Do not use any other icon name: it will render blank.
- **Tone:** calm, editorial, encouraging, never guilt-tripping. Samples are labelled "illustrative". Progress is described as study *process*, **never** as clinical competence or a predicted exam result. Keep these rules.

## 2. How the code is built (read this carefully)
The app is **one compiled HTML file**: a Vite and React bundle with the OCR engine, pdf.js and fonts inlined. **There is no original source.** All changes are made by *override layers*. These are scripts placed in the same module scope **just before** `(0,g.createRoot)(document.getElementById(\`root\`)).render(...)`. They wrap components by reassigning their minified names. Version v3 (attached) is the current layer. It is injected by `lumen/tools/build.mjs` between the markers `/*HCA3:BEGIN*/ … /*HCA3:END*/` (JS) and `<style id="hca-v3"> … </style><!--/hca-v3-->` (CSS). The build can be re-run on its own output.

Identifiers you can rely on inside the layer scope:

| Name | What it is |
|---|---|
| `_` | React (`_.useState`, `_.useEffect`, `_.useMemo`, `_.useRef`, `_.Fragment`, `_.useContext`) |
| `HC` | `React.createElement` |
| `y()` | Workspace context hook. Returns `{ state, setState, route, navigate(route), openBook(id, page?), modal, setModal({type,...}), toast(text, kind?), startReview(cards), exportStudyPack(), backupWorkspace(), restoreWorkspace, timer, startTimer, pauseTimer, resetTimer, readerFocus, setReaderFocus, reviewFilter, setReviewFilter, aiConfig, storageMode, importSources, removeBook }` |
| Routes | `home`, `library`, `studio`, `notes`, `methods`, `progress`, `reader` |
| Modal types | `upload`, `book`, `card` (`{bookId,page,excerpt?}` or `{card}` to edit), `note`, `review`, `quiz`, `search` (now the v3 command palette), `help`, `tour`, `settings`, `privacy`, `transcript`, `ai`, `research`, `confirm`, `hca3-goals`, `hca3-keys`, `hca-method`, `hca-resize`, plus older `hca-*` types |
| `A` | Dialog: `HC(A, { title, eyebrow, onClose, footer, className }, children)`. It has a focus trap and closes on Escape. |
| `k` | Button: `HC(k, { variant: 'primary'\|'secondary'\|'soft'\|'light', icon, onClick }, label)`. Helper: `HCABtn(label, onClick, variant, icon)` |
| `E` / `HCAIcon(name)` | Remix icon |
| `HCAEyebrow(text)`, `HCAMetric({...})`, `HCAFooter` | HCA helpers |
| `we(cards)` | Cards that are due |
| `Te(card, rating)` | Scheduler. v3 replaced it with FSRS-4.5 plus the ladder fallback. `rating` is one of `again`, `good`, `easy`. The backup checks **only accept these three**. |
| `ke` | Today page (v3 wraps it with Today's plan and Getting Started) |
| `HCAProgress` | Progress page (v3 adds the Learning insights panel) |
| `rs` | Dialog router (v3: `HCA3DialogRouter` → command palette, goal and shortcut dialogs, plus `HCA3Runtime` for global keys) |
| `Me` | Study page |
| `qo` | Settings |
| `ys` | Reader workspace |
| `ms` | Annotated page |
| `gs` | Recall text |
| `HCAMethodPage` | Methods page |
| `je` | Notes page |

State shape (`state`):
- `books[]`: `{id, title, kind:'demo'|…, count, page, subject?, thumbnail?}`
- `cards[]`: `{id, bookId, page, question, answer, due, step, reviews, fsrs?:{s,d,last}, lapses?}`
- `notes[]`: `{id, bookId, page, title?, text, kind?, createdAt}`
- `highlights[]`: `{id, bookId, page, text, rects, color, createdAt}`
- `reviewLog[]`: `{id, cardId, bookId, rating, at}`
- `practiceSessions[]`
- `ink[]`
- `practiceMasks{}`
- `settings`: `{theme, interfaceScale, hcaScheduler:'fsrs'|'ladder', hcaHero:'on'|'off', …}`
- `hcaGoals`: `{examName, examDate, dailyReviews}`
- `hcaOnboard`: `{opened, dismissed}`
- `lastBookId`
- `focusSeconds`

Bundled icon names (use only these):
`add-circle-line add-line arrow-down-line arrow-down-s-line arrow-go-back-line arrow-left-down-line arrow-left-line arrow-left-s-line arrow-right-line arrow-right-s-line arrow-right-up-line arrow-up-line attachment-2 book-2-line book-open-line bookmark-fill bookmark-line brain-line check-double-fill check-double-line check-line checkbox-blank-circle-line checkbox-circle-line close-line cloud-off-line command-line contrast-drop-line crop-line dashboard-line delete-bin-line double-quotes-l download-line draggable edit-line error-warning-line expand-diagonal-line external-link-line eye-line eye-off-line file-copy-line file-pdf-2-line file-text-line filter-3-line flashlight-line focus-2-line focus-3-line folder-line font-size fullscreen-exit-line fullscreen-line gallery-line graduation-cap-line grid-line heart-pulse-line history-line home-5-line image-line information-line keyboard-box-line layout-column-line layout-row-line leaf-line lightbulb-line links-line list-check list-ordered list-unordered loader-4-line lock-line magic-line mark-pen-line medal-line menu-line moon-line more-2-fill pause-fill play-fill question-line quote-text refresh-line restart-line scissors-cut-line search-line send-plane-2-line settings-4-line shield-check-line side-bar-line sparkling-2-line stack-line stethoscope-line sticky-note-line subtract-line sun-line text time-line timer-line upload-2-line upload-cloud-2-line volume-mute-line volume-up-line wifi-off-line zoom-in-line zoom-out-line`

### Rules for any change
1. **Deliver a new layer `hca-v4.js` and `hca-v4.css`**, with its own markers `/*HCA4:BEGIN*/…/*HCA4:END*/` and `<style id="hca-v4">…</style><!--/hca-v4-->`. Extend `build.mjs` so it injects v4 after v3 and can still be re-run on its own output. Do not edit the minified bundle by hand. If you must change copy inside the bundle, do it as an exact string replacement in `build.mjs` that fails loudly if the string is not found.
2. Wrap components (`const prev = X; X = function(props){ … HC(prev, props) … }`). Don't replace them wholesale unless the task says so. Prefix every new name with `HCA4` to avoid clashing with minified names.
3. To reorder an existing page's sections without editing it, use the v3 pattern. Render a wrapper with `display:flex; flex-direction:column` containing your new sections and the original page. Give the original's root `display: contents`, then use `order` (see `.hca3-shell` in `hca-v3.css`).
4. **Never** break backup and restore. Any new state keys must be optional, and restoring an older backup must still work. If you add a rating like `hard`, update the restore check with an exact string replacement in `build.mjs`.
5. Use only the CSS variables already defined: `--canvas --surface --surface-2 --ink --ink-strong --muted --line --green --green-light --copper --gold --navy --shadow`. Every new style must work in `:root[data-theme=dark]`, honour `:root[data-motion=reduced]` and `prefers-reduced-motion`, and meet **WCAG 2.2 AA**: 4.5:1 text contrast, visible focus, 24 × 24 px minimum targets (aim for 44), full keyboard use, and correct roles and labels.
6. Phone first. **No page may be wider than the screen at 360, 390 or 414 px.** Use `minmax(0,1fr)` and `min-width:0`.
7. Don't invent clinical facts. Any new sample content (questions, rationales) must be labelled "Illustrative sample · not clinical guidance", must be original, and must be written to be checked against a named open source such as OpenStax.

## 3. Already done in v3 (don't redo; build on it)
- Today's plan: due reviews, continue reading, exam countdown and daily target. Streak chip and Quick actions button. Getting Started checklist (6 steps). Welcome banner can be hidden.
- Ctrl K / ⌘K / `/` palette with actions and search across sources, notes, highlights and cards.
- Shortcuts: `G`+letter, `R C N U D ?`, and `Space` / `1` / `2` / `3` during a review.
- FSRS-4.5 scheduler, with the ladder as an option and interval previews on the rating buttons.
- Progress insights: streak, 30-day recall rate, 7-day forecast, maturity bar, 18-week heatmap.
- Goal dialog. Phone overflow fixes. Inter numerals. Duplicate sidebar label hidden. Sidebar card clipping fixed. One control height.

## 4. Your tasks, in priority order
Finish each task, with its acceptance criteria met, before starting the next.

### Task 1: Remove the clutter from the information structure
- On Library (`.library-hero` or its equivalent) and Study (`.studio-hero` or its equivalent), replace the big promotional banners with compact headers under 160 px tall: eyebrow, title, one-line description and the main action. Keep a link "What is spaced recall?" that opens the existing explanation.
- Show the six method cards (`HCAMethodCards`) **only** on Methods. On Today and Study, replace them with one row: "Six ways to practise → Methods".
- Hide the metric strip on Notes and Study when every value is 0. Show a single helpful empty state instead.
- **Accept when:** on a 1440 × 900 screen, the first thing that can be acted on is visible without scrolling on every page, and no block of content appears on more than one page.

### Task 2: One reader toolbar
- Combine the reader's top toolbar, the side panel's pen tools and the "Study tools" button into **one toolbar** with four groups:
  - **Read** (Flipbook / Single / Text, Fit width / Fit page, zoom)
  - **Annotate** (one tool picker: Select, Highlight, Pen, Sticky note, Mark region, Eraser, with colour and width in a small popover)
  - **Recall** (cover page, make card from selection)
  - **Page studio**
- The side panel gets at most three tabs on one row: Notes on this page, Cards on this page, Lookup.
- Add **Focus mode** (`F`), which hides everything except the page and the page arrows. `Esc` leaves it.
- Reader keys: `←` / `→` change page, `H` highlight, `P` pen, `S` sticky note, `V` select, `[` / `]` zoom, `T` toggle the side panel. Show them in the `?` sheet when in the reader.
- **Accept when:** every reader action can be reached in two clicks or fewer, and each action exists in exactly one place.

### Task 3: One set of components
Write one shared CSS block:
- Buttons: 40 px (compact) and 46 px (default).
- Inputs and selects: 44 px.
- Segmented controls: 40 px with 14 px labels.
- Eyebrow text: at least 11 px with 0.12em spacing.
- Panels: one corner radius (6 px) and one shadow token.
- Type scale: 48 / 34 / 26 / 20 / 16 / 14 / 12.

Apply it to every filter bar (Library, Notes, Study) and every dialog footer.
- **Accept when:** no visible text is below 12 px, and no row mixes control heights.

### Task 4: Storage you can trust
- Move the workspace from `localStorage` to IndexedDB (a new `workspace` store in `lumen.documents.v1`, or a new database). Do this by wrapping the save and load path:
  - On first load, migrate from `localStorage` once.
  - Keep a small `localStorage` pointer as a fallback.
  - Debounce saves (about 500 ms) and also save on `visibilitychange` (hidden).
- If saving fails, show a persistent warning bar with "Download a backup now". Never fall back silently.
- **Accept when:** a workspace with 10,000 review-log entries and 2 MB of ink saves and reloads with nothing lost.

### Task 5: Load the OCR engine only when needed
The three `<script type="application/octet-stream">` blocks with ids `lumen-ocr-core`, `lumen-ocr-worker` and `lumen-ocr-lang` hold about 9 MB.
- Stop decoding them until OCR is first requested.
- Better still, have the build optionally write them to a separate `lumen-ocr.bin` file that is fetched on demand, with the inline version kept as a fallback.
- **Accept when:** the main content of Today appears in under 2.5 s on a simulated mid-range phone (Lighthouse "Slow 4G", 4× CPU slowdown), and OCR still works.

### Task 6: NCLEX features
1. **Client Needs tags.** Add optional `tags: string[]` to cards and notes, with these values:
   - Management of Care
   - Safety and Infection Control
   - Health Promotion and Maintenance
   - Psychosocial Integrity
   - Basic Care and Comfort
   - Pharmacological and Parenteral Therapies
   - Reduction of Risk Potential
   - Physiological Adaptation

   Add a tag picker to the card and note dialogs (wrap them), and bulk tagging in Study.
2. **Recall by category** on Progress. Use horizontal bars with numbers, a table alternative, and a "Practise weakest" button that starts a review filtered to that category.
3. **NGN-style practice items** in the Practice lab:
   - Extended multiple response
   - Matrix / grid
   - Bow-tie
   - Highlight-in-text
   - A six-step case study (Recognise cues → Analyse cues → Prioritise hypotheses → Generate solutions → Take action → Evaluate outcomes)

   Ship 6 original illustrative items, clearly labelled. Use partial-credit scoring that matches the published NGN approach (+/−, 0/1, rationale scoring), and say plainly that it is a practice approximation.
4. **Timed blocks** of 25 / 50 / 75 items, with a results screen whose rationales link to the source page.
5. **Exam-week mode.** When `hcaGoals.examDate` is 7 or fewer days away, Today's plan pauses new cards and adds "Review your 3 weakest categories".

### Task 7: Smarter, still private
1. **FSRS tuned per learner.** Once there are 400 or more reviews in `reviewLog`, fit the 17 FSRS-4.5 weights on the device (gradient descent on log loss, in a Web Worker). Show "Expected recall at your target: 90% → 91.4%" and let the learner apply or revert. Store the weights in `settings.hcaFsrsWeights`. `HCA3Fsrs` must read them when present.
2. **Bring highlights back.** Today's plan gets an optional fourth step, "From your highlights", showing two highlights older than 7 days with buttons for "Make a card" and "Not now".
3. **A fourth "Hard" rating** (FSRS grade 2) in the review dialog. Update the backup checks to accept `hard` through an exact string replacement in `build.mjs`.
4. **Draft cards from a page with AI** (only when `aiConfig.configured`).
   - Show the exact excerpt that will be sent.
   - Get explicit consent each session.
   - Put drafts in an approval inbox, each citing its page. Nothing is saved without approval.
   - Write clear disclaimer copy.

## 5. Quality checks (run them and report the results)
- **Playwright** at 1440 × 900 and 390 × 844:
  - Open every page; there must be no `pageerror`.
  - `document.documentElement.scrollWidth` must be ≤ the viewport width on every page.
  - The palette opens with Ctrl K, filters, and runs a command.
  - A review session completes with keyboard only.
  - Backup → reset → restore gives back identical state.
  - Light and dark screenshots of each page.
- **axe-core**: zero serious or critical issues on each page and dialog.
- **Lighthouse** (mobile): Performance ≥ 85, Accessibility = 100, Best Practices ≥ 95.
- **Re-run check**: running `build.mjs` on its own output produces a byte-identical file.

## 6. What to deliver
1. `lumen/src/hca-v4.js` and `lumen/src/hca-v4.css`, with comments only where the reason is not obvious from the code.
2. The updated `lumen/tools/build.mjs`.
3. A short `CHANGELOG.md` entry: what changed, why, and how it was tested.
4. Before and after screenshots of each page at desktop and phone width.
5. A list of anything you could not finish and why.

Work through the tasks in order. Ask before changing the brand, the privacy model or the honesty rules. When in doubt, choose the calmer, simpler option. The goal is for a tired nurse after a 12-hour shift to open Lumen and know within three seconds what to do next.

---
