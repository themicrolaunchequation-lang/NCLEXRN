# Lumen: review and improvement plan

*Healthcare Crown Academy · Lumen clinical study studio · 15 October 2026*

This review comes from running the current file (`Lumen-clinical-study-studio-complete.html`, 16 MB) in Chromium at desktop width (1440 × 900) and phone width (390 × 844). I went through every page and dialog, ran a review session, and measured layout in the browser. Section 4 lists what this round fixes and adds. Section 5 is the roadmap for the rest. The ChatGPT brief in [`CHATGPT_PROMPT.md`](CHATGPT_PROMPT.md) covers that roadmap.

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

## 4. Done in this round (v3 layer)

Built as a separate layer (`lumen/src/hca-v3.js` and `hca-v3.css`) that `lumen/tools/build.mjs` injects into the app file. Existing code is not edited, and the build can be re-run on its own output. Output: `lumen/dist/Lumen-clinical-study-studio-v3.html`.

**Today**
- **Today's plan** sits at the top with three steps in order:
  1. Review the due cards (with an estimated time), or a "reviews are clear" state with when the next card is due.
  2. Continue reading, with page and progress bar.
  3. Exam countdown and today's review target, or "Set your exam date".
- A streak chip and a **Quick actions** button.
- **A Getting Started checklist** with six steps. They tick themselves off from real activity, and the checklist can be dismissed.
- **The welcome banner can be hidden** with one click (or from the palette). The choice is remembered.

**Command palette (Ctrl K, ⌘K or /)**
- It replaces the old search dialog.
- **Actions:** review due cards, continue reading, add a source, new card, new note, focus timer, set goal, theme, text size, export, back up, help.
- **Search:** sources, notes, highlights and cards, with matches highlighted and page references shown.
- Grouped results, fully keyboard driven, with an empty state. It is labelled as a dialog and combobox for screen readers.

**Keyboard**
- `G` then `T/L/S/N/M/P` to change page.
- `R` to review, `C` new card, `N` new note, `U` add source, `D` theme, `?` shortcut sheet.
- In a review: `Space` reveals, `1/2/3` rate Again, Good or Easy.
- Single-key shortcuts are paused in text fields and in the reading room.

**Scheduling**
- **Adaptive scheduling (FSRS-4.5, default parameters, 90% target recall).** The rating buttons now preview real intervals: Again 10 min, Good 4 days, Easy 14 days for a new card.
- Cards already on the ladder carry over smoothly from their current step.
- **The simple ladder is still available** in the goal dialog.
- The scheduling note on the Study page has been rewritten to match.

**Progress**
- A **Learning insights** panel: current and best streak, 30-day recall rate, reviews due in the next 7 days, and long-term cards (stable for 21+ days).
- An **18-week activity heatmap** with a table alternative, a **7-day review forecast**, and a **card maturity** bar (new / learning / long-term).

**Goal dialog**
- Exam name (default NCLEX-RN), date and daily review target.
- Choice of scheduler, with a plain-language explanation of each.
- A note that goals are study aids, not predictions.

**Fixes**
- All the phone overflow bugs in section 2.2. Every page now measures exactly 390 px on a 390 px phone.
- All six bottom tabs fit.
- Numbers display in Inter, so zero no longer looks like "O".
- The duplicate sidebar label is hidden.
- The sidebar quote card no longer clips: it shows in full where there is room and is left out on shorter screens.
- Filter controls share one height, and labels are at least 13.5 px.

**Checked**
- Builds the same output when re-run on its own output.
- No page errors on Today, Library, Study, Notes, Methods, Progress or the reader.
- Light and dark themes.
- A full review session driven by both mouse and keyboard.
- The palette, goal and shortcut dialogs.
- Stored card state after Again, Good and Easy (scheduled 10 min, 4 days and 14 days).

## 5. Roadmap

### Phase 1: Clean up the structure (1–2 weeks)
1. **Replace the banners on Library and Study with compact page headers.** Title, one line of context and the main action, under 160 px. Keep one dismissible banner, on Today only, for first-time users.
2. **Remove duplication.** Show the six methods only on the Methods page. Elsewhere, use a one-line link ("Try a method →"). Show the metric strip only where its numbers drive an action.
3. **Combine the reader's tools into one toolbar.**
   - Read, Annotate (pen / highlight / sticky / region in a single tool picker), Recall, and Page studio.
   - One side panel with up to three tabs on a single row.
   - Remove the separate "Study tools" button.
   - Add a "Focus" mode (F) that hides everything except the page.
4. **One set of components.**
   - Buttons in two sizes (40 and 46 px).
   - Inputs and selects at 44 px.
   - A segmented control with 14 px labels.
   - Eyebrow text at least 11 px with 0.12em letter-spacing.
   - Panels with one corner radius (6 px) and one shadow.
5. **Move workspace storage from `localStorage` to IndexedDB.** Migrate automatically on first load. Show a clear warning if storage fails, never a silent switch to session-only.
6. **Load the OCR engine (about 9 MB) only when first used.** Use a separate cached file, with the PWA service worker caching it after first use.

### Phase 2: NCLEX layer (2–3 weeks)
1. **Tag cards, notes and questions with NCLEX Client Needs categories.** The tags are optional and can be applied in bulk.
2. **Show recall by category** on Progress ("Pharmacological therapies: 72% recalled over 30 days"), with "practise weakest" as one click.
3. **Add NGN-style item types to Practice:**
   - Extended multiple response
   - Bow-tie
   - Matrix / grid
   - Highlight-in-text
   - Six-step case studies

   Write the content as illustrative samples with clear labels.
4. **Timed practice blocks** (25 / 50 / 75 items) with a review screen that links every rationale to its source page.
5. **Exam-week mode.** In the final 7 days, new cards are paused and reviews focus on the weakest categories.

### Phase 3: Smarter, still private (opt-in)
1. **FSRS tuned to each learner** from their own review history, once there are 400 or more reviews. Run it on the device and show the expected retention.
2. **Draft cards and questions from a page** (AI, off by default).
   - Preview exactly what text will be sent.
   - Every draft cites its page.
   - Drafts sit in an approval inbox and nothing is saved automatically.
3. **Feedback on "Explain it back".** Compare the learner's explanation with the source passage and point out what is missing, with quotes.
4. **Bring highlights back.** A step on Today shows two older highlights a day to turn into cards.
5. **"Hard" as a fourth rating** (FSRS grade 2). This needs the backup format and the restore checks to accept `hard`.

### Phase 4: Platform
1. **Recover or rebuild the original source** (Vite, React, TypeScript). Turn the v1–v3 override layers into real components, and stop editing minified variables.
2. **An installable app that works offline**, with an optional encrypted sync to the Evinca `platform_state` table for members who opt in.
3. **Quality gates:**
   - Playwright smoke tests (each page, a review session, the palette, the phone overflow check).
   - axe accessibility checks.
   - Lighthouse budgets: under 2.5 s to show the main content on a mid-range phone, and under 1.5 MB JavaScript on first load.

### How to measure progress
- **Day-7 return rate.**
- **Learners who review at least 5 days a week.**
- **Average 30-day recall rate.**
- **Clicks from opening the app to the first review**, with a target of 1.
- **Median time from upload to the first saved card.**

Measure on the device only, or with opt-in anonymous analytics, to keep the privacy promise.

---

*Sources consulted for the comparison: [RemNote: best Anki alternatives](https://www.remnote.com/blog/best-anki-alternatives), [Fast.io: best AI study tools 2026](https://fast.io/resources/best-ai-study-tools-2026/), [Mindomax: spaced repetition apps 2026](https://www.mindomax.com/best-spaced-repetition-apps-2026-anki-alternatives), [UWorld: best NCLEX prep app comparison 2026–27](https://nursing.uworld.com/best-nclex-prep-app/), [TestPrepPal: Archer vs UWorld 2026](https://testpreppal.com/nclex/question-bank/archer-review-vs-uworld). Several are written by vendors, so treat their rankings as opinion. The product research brief already inside Lumen (FlipHTML5, Flipsnack, NotebookLM, Acrobat, LiquidText, Readwise Reader, RemNote) was also used.*
