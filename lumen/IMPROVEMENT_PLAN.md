# Lumen: review and improvement plan

*Healthcare Crown Academy · Lumen clinical study studio · 15 October 2026*

This review comes from running the current file (`Lumen-clinical-study-studio-complete.html`, 16 MB) in Chromium at desktop width (1440 × 900) and phone width (390 × 844). I went through every page and dialog, ran a review session, and measured layout in the browser. Section 4 lists what two rounds of work have fixed and added. Section 5 lists what is left. The ChatGPT brief in [`CHATGPT_PROMPT.md`](CHATGPT_PROMPT.md) covers what is left.

---

## 1. What already works well

Keep these. They set Lumen apart, and any redesign should protect them.

- **Clear identity.** The navy, teal and copper palette, Playfair headings and Inter body text look editorial and calm. Most study apps look like dashboards. Lumen looks like a study.
- **Local-first privacy.** No account and no uploads. AI is off by default, and the app says so plainly. That builds trust with clinicians.
- **Everything links to its source.** Notes, highlights, cards and quizzes all carry a book and page reference. This is the core idea of the product and it is done well.
- **A strong reader.** It has flipbook, single-page and text modes, pen, highlight, sticky notes, region marking, OCR for scanned pages, and a "recall this page" cover.
- **Good accessibility foundations.** There is a skip link and visible focus rings. Charts have table alternatives, and there are settings for reduced motion and larger text.
- **Honest copy.** Samples are labelled "illustrative". Progress is described as study process, not competence.

## 2. What holds it back

### 2.1 People can't see what to do next
- **Today opens with a 420 px marketing banner** ("Read deeply. Think clearly."). It sits above everything a returning learner needs: due cards, where they stopped reading, and their goal. On a laptop the first useful action is below the fold.
- **The same banner pattern repeats** on Library ("Your books belong with you") and Study ("Less rereading"). About 40% of the first screen on each page is promotion.
- **Content is duplicated.** The six method cards appear on Today, Study and Methods. The metric strip appears on Today, Study, Notes and Progress, often showing four zeros.
- **There is no goal.** NCLEX learners plan around an exam date. Lumen had no exam date, no daily target and no countdown. UWorld and Archer both build their study planners around that date.

### 2.2 Visual and layout bugs (measured)
| Issue | Where | Evidence |
|---|---|---|
| Page is **458 px wide on a 390 px phone**, so it scrolls sideways | Today | The "Continue your chapter" and focus timer grid did not collapse. The timer kept two columns inside one. |
| **"Progress" is pushed off the bottom tab bar** | All pages, phone | Six tabs at their natural width are wider than the screen. |
| Page **10 px too wide** on every phone page | Top bar | Hidden hover tooltips on the right-hand icons extend past the screen edge. |
| Library filter tabs wider than the screen | Library, phone | The segmented control did not wrap or scroll. |
| **Zero reads as the letter "O"** ("O cards") | All metric tiles, focus timer | Playfair's zero is a round letterform. |
| Academy name printed twice; the second copy is cut off ("HEALTHCARE CROWN ACADEM") | Sidebar | A duplicate label under the logo. |
| Quote card clipped mid-word ("Understand" cut in half) | Sidebar, screens under ~1000 px tall | Fixed-height card with more content than fits. |
| Controls of mixed sizes in one row: 60 px search, 44 px select, 40 px buttons, 11 px labels | Library, Notes and Study filter bars | Uneven rhythm, and some text is hard to read. |

### 2.3 Learning engine
- **Fixed review ladder (1 / 3 / 7 / 14 / 30 / 60 days).** Every card follows the same steps whether it is easy or hard. Anki's current default and RemNote both use FSRS. Comparisons credit it with roughly 20–30% fewer reviews than older schedulers at the same retention.
- **Reviews needed the mouse.** You could not reveal or rate an answer from the keyboard. The dialog's first focus lands on Close, so pressing Space closed the session.
- **Progress was a 7-day bar chart.** It had no streak, no recall rate, no view of upcoming reviews and no sense of how many cards are well learned.

### 2.4 Speed and navigation
- Ctrl K searched content but could not *do* anything. There were no shortcuts between pages and no list of shortcuts.
- **The reader has three overlapping tool surfaces.** There is a top toolbar (Pen, Highlight, Sticky note, Mark + note, Recall page, Page studio, ⋯), a side panel with four tabs in two rows plus its own pen tools, and a separate "Study tools" button. New users don't know which to use.

### 2.5 Architecture risks (for whoever maintains it)
- **No source code.** The file is a compiled Vite and React bundle. Every change since has been made by reassigning minified names (`ke`, `rs`, `Me`, `qo`, `ys`…). Each layer wraps the one before it. This works, but it is fragile: any rebuild from the original source renames those variables.
- **16 MB in one file.** About 9 MB of that is the OCR engine and its English data, loaded on every visit even though most sessions never run OCR.
- **The whole workspace is saved to `localStorage`.** That includes up to 10,000 review-log entries, ink strokes and notes. Browsers allow about 5 MB there. When the limit is reached the app quietly switches to session-only storage, so heavy users could lose work on reload. Files are already stored in IndexedDB; the workspace should be too.

## 3. Ideas from similar apps, taken further

| App | What it does well | What Lumen should take, and the improvement |
|---|---|---|
| **Anki / RemNote** | FSRS scheduling; reviews entirely from the keyboard | Adaptive scheduling with the ladder kept as an option, interval previews on each rating button, and Space / 1 / 2 / 3 keys. **Further:** tune FSRS to each learner using their own review history, which Lumen already records. |
| **UWorld / Archer (NCLEX)** | Study planner built around the exam date; results by category; NGN item types | Exam countdown and daily target on Today. **Further:** tag cards and questions with NCLEX Client Needs categories, show recall by category, and add NGN-style case studies, bow-tie and matrix items to Practice. |
| **NotebookLM / Acrobat Study** | Quizzes and cards generated from your sources, with citations | **Further:** opt-in "draft cards from this page". Every draft cites its page, nothing is saved until the learner approves it, and only the excerpt they preview leaves the device. |
| **Readwise Reader** | Keyboard-first reading; highlights resurface in a daily review | Shortcuts throughout. **Further:** a "From your highlights" step on Today that brings back two older highlights to turn into cards. |
| **LiquidText** | Excerpts linked across documents on a canvas | **Further:** a "Connections" view that links notes from different sources around one concept, such as preload. |
| **Linear / Raycast** | Command palette; g-then-letter navigation | A Ctrl K palette with actions, sources, notes, highlights and cards, plus G-then-letter page shortcuts and a `?` sheet listing them. |
| **Duolingo / GitHub** | Streaks and an activity heatmap | A gentle streak with no guilt messaging ("study today to keep it"), an 18-week heatmap, and a review forecast. |
| **Notion / Linear onboarding** | A short checklist that ticks itself off | "Learn Lumen in six small steps", which ticks automatically and can be dismissed. |

## 4. What is done

Both rounds are separate layers that `lumen/tools/build.mjs` injects into the app file, so the original code stays untouched. The current app is `lumen/dist/Lumen-clinical-study-studio.html`. [`CHANGELOG.md`](CHANGELOG.md) has the full list and how each round was tested.

### Round 1 (v3)
- **Today's plan** at the top:
  1. Review due cards, with an estimated time.
  2. Continue reading, with a progress bar.
  3. Exam countdown and daily target.
- **Today also has** a gentle streak, a Getting Started checklist, and a welcome banner that can be hidden.
- **Command palette** (Ctrl K, ⌘K or /): actions plus search across sources, notes, highlights and cards.
- **Keyboard shortcuts:** `G`+letter to change page; `R C N U D ?`.
- **Adaptive scheduling (FSRS-4.5)**, with the simple ladder as an option and real intervals shown on the rating buttons.
- **Progress insights:** streak, 30-day recall rate, 7-day forecast, card maturity, and an 18-week activity heatmap.
- **Goal dialog:** exam name, date, daily target and scheduler.
- **Fixes:** every phone overflow in section 2.2, the bottom tab bar, "0" reading as "O", the duplicate sidebar label, and the clipped sidebar card.

### Round 2 (v4)
- **Less clutter:**
  - The Library and Study banners are now a one-line note and a compact action bar.
  - The method cards appear only on Methods; elsewhere a one-row link replaces them.
  - Rows of zero counts are hidden.
  - The welcome banner steps aside after a learner's first review or upload.
- **Consistent controls:** filter bars are one 48px row with 14px labels (some were 9–10px). Dialog text is readable. One contrast failure is fixed.
- **Storage you can trust:**
  - The workspace is saved in IndexedDB, with automatic migration and a localStorage mirror.
  - Saves also happen when the tab is hidden.
  - If saving fails, a warning offers a backup download.
- **Reader:** the panel tabs sit on one row. `T` toggles the panel, `Z` turns focus mode on or off, and `Esc` leaves it. `?` lists the reader keys.
- **NCLEX:**
  - Client Needs tags in the card and note dialogs, plus bulk tagging.
  - Recall by category on Progress, with "Practise weakest".
  - An exam-week banner.
  - Six original NGN-style practice items (select all that apply, matrix, bow-tie, highlight, drop-down) with partial-credit scoring, rationales and a timed mode.
- **Learning:**
  - A fourth rating, Hard (keys `1–4`), which backups accept.
  - "From your highlights" brings back one older highlight a day as a ready-made card draft.
- **OCR:**
  - Fixed the bugs in the original file that stopped OCR from starting, including when the file is opened from a computer.
  - The engine is now compressed, so the file is 12.9 MB instead of 16.0 MB.

## 5. What is still to do

### Next (1–2 weeks)
1. **Redesign the reader toolbar.**
   - One toolbar with four groups: Read, Annotate (a single tool picker with colour and width), Recall and Page studio.
   - Remove the separate "Study tools" button.
   - v4 tidied the panel and added keys, but every action should exist in exactly one place.
2. **A larger practice bank.**
   - Timed blocks of 25, 50 or 75 items need far more than six questions.
   - Write them against the learner's own sources, so every rationale links to a page.
   - Add a six-step case study (recognise cues → evaluate outcomes).
3. **Make the file smaller.**
   - Cut the icon font down to the 103 icons in use: about 540 KB of embedded text, of which a few KB are needed.
   - Optionally, for web-hosted copies, serve the OCR engine as a separate cached file.
   - Measure with Lighthouse on a mid-range phone.

### Later: smarter, still private (opt-in)
1. **Tune FSRS to each learner** from their own review history once there are 400 or more reviews. Run it on the device and show the expected recall.
2. **Draft cards and questions from a page** (AI, off by default; needs the server endpoint):
   - Preview exactly what will be sent.
   - Every draft cites its page.
   - Drafts wait in an approval inbox.
3. **Feedback on "Explain it back".** Compare the learner's explanation with the source passage and quote what is missing.
4. **A "Connections" view** that links notes from different sources around one concept.

### Platform
1. **Recover or rebuild the original source** (Vite, React, TypeScript). Turn the v1–v4 layers into real components, and stop wrapping minified names.
2. **An installable app that works offline**, with an optional encrypted sync to the Evinca `platform_state` table for members who opt in.
3. **Run `lumen/tests/smoke.mjs` and axe on every change** (in CI once there is a pipeline), and add Lighthouse budgets.

### How to measure progress
- **Day-7 return rate.**
- **Learners who review at least 5 days a week.**
- **Average 30-day recall rate.**
- **Clicks from opening the app to the first review**, with a target of 1.
- **Median time from upload to the first saved card.**

Measure on the device only, or with opt-in anonymous analytics, to keep the privacy promise.

---

*Sources consulted for the comparison: [RemNote: best Anki alternatives](https://www.remnote.com/blog/best-anki-alternatives), [Fast.io: best AI study tools 2026](https://fast.io/resources/best-ai-study-tools-2026/), [Mindomax: spaced repetition apps 2026](https://www.mindomax.com/best-spaced-repetition-apps-2026-anki-alternatives), [UWorld: best NCLEX prep app comparison 2026–27](https://nursing.uworld.com/best-nclex-prep-app/), [TestPrepPal: Archer vs UWorld 2026](https://testpreppal.com/nclex/question-bank/archer-review-vs-uworld). Several are written by vendors, so treat their rankings as opinion. The product research brief already inside Lumen (FlipHTML5, Flipsnack, NotebookLM, Acrobat, LiquidText, Readwise Reader, RemNote) was also used.*
