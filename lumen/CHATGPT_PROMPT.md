# Brief for ChatGPT: take Lumen to world-class

Copy everything between the two rules below into ChatGPT. Attach these files:

1. `lumen/dist/Lumen-clinical-study-studio.html` (the current app, 12.9 MB)
2. `lumen/src/hca-v3.js` and `lumen/src/hca-v3.css`
3. `lumen/src/hca-v4.js` and `lumen/src/hca-v4.css`
4. `lumen/tools/build.mjs`
5. `lumen/tests/smoke.mjs`

If ChatGPT can't take the HTML, leave it out. The brief already contains the identifier table it needs.

---

## Role
You are a senior product designer and a senior front-end engineer working together. You have shipped learning products at the level of Anki, RemNote, Readwise Reader, Linear and UWorld. Your job is to make **Lumen**, the clinical study studio from Healthcare Crown Academy, world-class: the most modern, the most comfortable to use, easy to navigate and understand, with a smooth workflow, a well-organised layout and advanced features. Do this without breaking anything that works and without weakening its privacy or honesty.

## 1. What Lumen is
- A **local-first** study app for nursing and clinical learners, many preparing for **NCLEX-RN**. Learners add PDFs and images. They read in a reader (flipbook, single page or text mode), highlight, draw, add sticky notes, and mark regions. They make recall cards and quizzes linked to the source page, review them with spaced repetition, and track progress.
- **No account and no uploads.** Workspace state is saved in IndexedDB (`lumen.workspace.v4`, store `kv`, key `workspace`), with a mirror in `localStorage` under `lumen.workspace.v1`. Files are in IndexedDB (`lumen.documents.v1`). Optional AI is **off by default** and only works through a server endpoint after the learner explicitly agrees.
- **Brand:**
  - Colours: navy `#10253a`, teal `#087d7a`, copper `#bd764a`, gold `#c9a24a`, ivory `#f8f5ef`.
  - Fonts: Playfair Display for headings, Inter for interface text.
  - Remix Icons, but **only the 103 icons whose CSS is bundled**. Section 2 lists them. Do not use any other icon name: it will render blank.
- **Tone:** calm, editorial, encouraging, never guilt-tripping. Samples are labelled "illustrative". Progress is described as study *process*, **never** as clinical competence or a predicted exam result. Keep these rules.

## 2. How the code is built (read this carefully)
The app is **one compiled HTML file**: a Vite and React bundle with the OCR engine, pdf.js and fonts inlined. **There is no original source.** All changes are made by *override layers*. These are scripts placed in the same module scope **just before** `(0,g.createRoot)(document.getElementById(\`root\`)).render(...)`. They wrap components by reassigning their minified names. Two layers exist, v3 and v4 (attached). `lumen/tools/build.mjs` injects them in order between markers such as `/*HCA4:BEGIN*/ … /*HCA4:END*/` (JS) and `<style id="hca-v4"> … </style><!--/hca-v4-->` (CSS). It also applies a short list of exact patches inside the bundle (`PATCHES`) and gzips the OCR engine. The build can be re-run on its own output. v4 uses a top-level `await` to read IndexedDB before the first render.

Identifiers you can rely on inside the layer scope:

| Name | What it is |
|---|---|
| `_` | React (`_.useState`, `_.useEffect`, `_.useMemo`, `_.useRef`, `_.Fragment`, `_.useContext`) |
| `HC` | `React.createElement` |
| `y()` | Workspace context hook. Returns `{ state, setState, route, navigate(route), openBook(id, page?), modal, setModal({type,...}), toast(text, kind?), startReview(cards), exportStudyPack(), backupWorkspace(), restoreWorkspace, timer, startTimer, pauseTimer, resetTimer, readerFocus, setReaderFocus, reviewFilter, setReviewFilter, aiConfig, storageMode, importSources, removeBook }` |
| Routes | `home`, `library`, `studio`, `notes`, `methods`, `progress`, `reader` |
| Modal types | `upload`, `book`, `card` (`{bookId,page,excerpt?}` or `{card}` to edit), `note`, `review`, `quiz`, `search` (the v3 command palette), `help`, `tour`, `settings`, `privacy`, `transcript`, `ai`, `research`, `confirm`, `hca3-goals`, `hca3-keys` (v4 shortcut sheet), `hca4-ngn` (`{timed}`), `hca4-tags`, `hca-method`, `hca-resize`, plus older `hca-*` types |
| `A` | Dialog: `HC(A, { title, eyebrow, onClose, footer, className }, children)`. It has a focus trap and closes on Escape. |
| `k` | Button: `HC(k, { variant: 'primary'\|'secondary'\|'soft'\|'light', icon, onClick }, label)`. Helper: `HCABtn(label, onClick, variant, icon)` |
| `E` / `HCAIcon(name)` | Remix icon |
| `HCAEyebrow(text)`, `HCAMetric({...})`, `HCAFooter` | HCA helpers |
| `we(cards)` | Cards that are due |
| `Te(card, rating)` | Scheduler: FSRS-4.5 (`HCA3Fsrs`, weights `HCA3W`) with the ladder fallback. `rating` is `again`, `hard`, `good` or `easy`; the backup check accepts all four. |
| `me()` / `I(state)` | Workspace load and save, redirected by v4 to IndexedDB (`HCA4Load`, `HCA4Save`). |
| `ke` | Today page (v3 shell; `HCA3TodayPlan` is wrapped by v4 to add exam week, resurfaced highlights and the methods link) |
| `HCAProgress` | Progress page (v3 insights, then v4 recall by category) |
| `HCA3Commands(ctx)` | Palette commands (v4 adds its own) |
| `rs` | Dialog router: v4 `HCA4DialogRouter` → v3 `HCA3DialogRouter` → older routers. Each mounts its runtime (global keys, storage warning). |
| `Me` | Study page (v4 `HCA4Study`: original page, practice card, methods link) |
| `qo` | Settings |
| `ys` | Reader workspace |
| `ms` | Annotated page |
| `gs` | Recall text |
| `HCAMethodPage` | Methods page |
| `je` | Notes page (v4 wraps it) |
| `HCA4TagPicker`, `HCA4Categories`, `HCA4Items` | Tag picker, the 8 Client Needs categories, and the practice items |

State shape (`state`):
- `books[]`: `{id, title, kind:'demo'|…, count, page, subject?, thumbnail?}`
- `cards[]`: `{id, bookId, page, question, answer, due, step, reviews, fsrs?:{s,d,last}, lapses?, tags?:string[]}`
- `notes[]`: `{id, bookId, page, title?, text, kind?, createdAt, tags?:string[]}`
- `highlights[]`: `{id, bookId, page, text, rects, color, createdAt}`
- `reviewLog[]`: `{id, cardId, bookId, rating, at}`
- `practiceSessions[]`
- `ink[]`
- `practiceMasks{}`
- `settings`: `{theme, interfaceScale, hcaScheduler:'fsrs'|'ladder', hcaHero:'on'|'off', …}`
- `hcaGoals`: `{examName, examDate, dailyReviews}`
- `hcaOnboard`: `{opened, dismissed}`
- `hcaNgnLog[]`: `{id, at, timed, score, max, items:[{itemId, category, score, max}]}`
- `hcaResurface`: `{day, skipped[]}`
- `lastBookId`
- `focusSeconds`

Bundled icon names (use only these):
`add-circle-line add-line arrow-down-line arrow-down-s-line arrow-go-back-line arrow-left-down-line arrow-left-line arrow-left-s-line arrow-right-line arrow-right-s-line arrow-right-up-line arrow-up-line attachment-2 book-2-line book-open-line bookmark-fill bookmark-line brain-line check-double-fill check-double-line check-line checkbox-blank-circle-line checkbox-circle-line close-line cloud-off-line command-line contrast-drop-line crop-line dashboard-line delete-bin-line double-quotes-l download-line draggable edit-line error-warning-line expand-diagonal-line external-link-line eye-line eye-off-line file-copy-line file-pdf-2-line file-text-line filter-3-line flashlight-line focus-2-line focus-3-line folder-line font-size fullscreen-exit-line fullscreen-line gallery-line graduation-cap-line grid-line heart-pulse-line history-line home-5-line image-line information-line keyboard-box-line layout-column-line layout-row-line leaf-line lightbulb-line links-line list-check list-ordered list-unordered loader-4-line lock-line magic-line mark-pen-line medal-line menu-line moon-line more-2-fill pause-fill play-fill question-line quote-text refresh-line restart-line scissors-cut-line search-line send-plane-2-line settings-4-line shield-check-line side-bar-line sparkling-2-line stack-line stethoscope-line sticky-note-line subtract-line sun-line text time-line timer-line upload-2-line upload-cloud-2-line volume-mute-line volume-up-line wifi-off-line zoom-in-line zoom-out-line`

### Rules for any change
1. **Deliver a new layer `hca-v5.js` and `hca-v5.css`**, and add `'v5'` to `LAYERS` in `build.mjs`. The build must still be re-run safely on its own output. Do not edit the minified bundle by hand. If something inside the bundle must change, add an entry to `PATCHES` in `build.mjs`; each entry must match exactly once or the build stops.
2. Wrap components (`const prev = X; X = function(props){ … HC(prev, props) … }`). Don't replace them wholesale unless the task says so. Prefix every new name with `HCA5` to avoid clashing with minified names.
3. To reorder an existing page's sections without editing it, use the v3 pattern. Render a wrapper with `display:flex; flex-direction:column` containing your new sections and the original page. Give the original's root `display: contents`, then use `order` (see `.hca3-shell` in `hca-v3.css`).
4. **Never** break backup and restore. Any new state keys must be optional, and restoring an older backup must still work. If restore must accept something new (for example, another rating), add a `PATCHES` entry for the restore check, as v4 did for `hard`.
5. Use only the CSS variables already defined: `--canvas --surface --surface-2 --ink --ink-strong --muted --line --green --green-light --copper --gold --navy --shadow`. Every new style must work in `:root[data-theme=dark]`, honour `:root[data-motion=reduced]` and `prefers-reduced-motion`, and meet **WCAG 2.2 AA**: 4.5:1 text contrast, visible focus, 24 × 24 px minimum targets (aim for 44), full keyboard use, and correct roles and labels.
6. Phone first. **No page may be wider than the screen at 360, 390 or 414 px.** Use `minmax(0,1fr)` and `min-width:0`.
7. Don't invent clinical facts. Any new sample content (questions, rationales) must be labelled "Illustrative sample · not clinical guidance", must be original, and must be written to be checked against a named open source such as OpenStax.

## 3. Already done (don't redo; build on it)
- **v3:**
  - Today's plan, a gentle streak, the Getting Started checklist.
  - Ctrl K palette with actions and search.
  - `G`+letter and single-key shortcuts.
  - FSRS-4.5 with interval previews.
  - Progress insights (streak, recall rate, forecast, maturity, heatmap).
  - Goal dialog.
  - Phone overflow fixes.
- **v4:**
  - IndexedDB storage with migration, a localStorage mirror, saving when the tab is hidden, and a warning bar if saving fails.
  - Compact Library and Study headers; methods only on Methods; empty counts hidden; a welcome banner only for newcomers.
  - 48px filter rows with 14px labels.
  - Reader panel tabs on one row; `T`, `Z` and `Esc` keys; a reader section in `?`.
  - Client Needs tags (card and note dialogs, plus bulk tagging), recall by category with "Practise weakest", and an exam-week banner.
  - Six NGN-style practice items with partial credit and a timed mode.
  - A Hard rating (keys `1–4`).
  - "From your highlights" on Today.
  - OCR fixed (it now runs from a local file or a website, with the engine and worker loaded as one script), and the engine gzipped (16.0 → 12.9 MB).

## 4. Your tasks, in priority order
Finish each task, with its acceptance criteria met, before starting the next.

### Task 1: One reader toolbar
- Rebuild the reader's top toolbar (`HCAReaderToolbar`) into **four groups**:
  - **Read:** Flipbook / Single / Text, Fit width / Fit page, zoom.
  - **Annotate:** one tool picker with Select, Highlight, Pen, Sticky note, Mark region and Eraser. Colour and width go in a small popover, not in the side panel.
  - **Recall:** cover the page, or make a card from the selection.
  - **Page studio.**
- Remove the separate "Study tools" header button. `T` and the toolbar open the panel.
- Keep the existing reader keys (← → F H P N M B) and the v4 keys (T Z Esc).
- **Accept when:** every reader action is reachable in two clicks or fewer, each action exists in exactly one place, and the toolbar fits at 1280px without wrapping.

### Task 2: A larger practice bank and timed blocks
- **Grow the practice bank to at least 60 original, illustrative items**, spread across the 8 Client Needs categories. Use the same item types plus a six-step case study (Recognise cues → Analyse cues → Prioritise hypotheses → Generate solutions → Take action → Evaluate outcomes).
- **Keep the existing scoring rules.**
- **Every rationale names an open source to check against**, for example OpenStax Pharmacology for Nurses or Medical-Surgical Nursing.
- **Add timed blocks of 25, 50 or 75 items**, drawn by weakest category first. The results screen shows the score by category and lets the learner make a recall card from any rationale.
- **Accept when:** a 25-item block can be finished with the keyboard only, and its results update Progress → Recall by category.

### Task 3: A smaller, faster file
- **Cut the embedded Remix icon font (about 540 KB of text) down to the 103 icons in use**, as a build step. Fail the build if a used icon is missing.
- **Optionally**, for copies hosted on the web, write the OCR engine to a separate file that is fetched and cached on first use. Keep the single-file build as the default.
- **Accept when:** the file is under 12 MB, and on Lighthouse mobile (Slow 4G, 4× CPU slowdown) the main content of Today appears in under 2.5 s.

### Task 4: FSRS tuned to each learner
- **Once there are 400 or more reviews in `reviewLog`, fit the 17 FSRS-4.5 weights on the device**, in a Web Worker, using gradient descent on log loss.
- **Show the expected recall before and after**, and let the learner apply or revert.
- **Store the weights in `settings.hcaFsrsWeights`.** `HCA3Fsrs` must use them when present.
- **Accept when:** applying and then reverting leaves every card's due date unchanged until its next review.

### Task 5: Draft cards from a page with AI (only when `aiConfig.configured`)
- **Show the exact excerpt that will be sent**, and get explicit consent each session.
- **Drafts go to an approval inbox**, each citing its page. Nothing is saved without approval.
- **Write clear disclaimer copy**, and change nothing when AI is not configured.

### Task 6: Feedback on "Explain it back", and a Connections view
- **Explain it back:** compare the learner's explanation with the source passage and list what is missing, quoting the source. Do this without AI using key-term matching; use AI only if it is configured and the learner consents.
- **Connections:** a view that groups notes and highlights from different sources under one concept name the learner chooses.

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
- **Smoke test**: `node lumen/tests/smoke.mjs` passes. Extend it for every new feature.

## 6. What to deliver
1. `lumen/src/hca-v5.js` and `lumen/src/hca-v5.css`, with comments only where the reason is not obvious from the code.
2. The updated `lumen/tools/build.mjs`.
3. A new entry in `lumen/CHANGELOG.md`: what changed, why, and how it was tested.
4. Before and after screenshots of each page at desktop and phone width.
5. A list of anything you could not finish and why.

Work through the tasks in order. Ask before changing the brand, the privacy model or the honesty rules. When in doubt, choose the calmer, simpler option. The goal is for a tired nurse after a 12-hour shift to open Lumen and know within three seconds what to do next.

---
