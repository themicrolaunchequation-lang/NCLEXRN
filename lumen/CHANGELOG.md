# Lumen changelog

## v4.1: 16 October 2026

- **OCR now works when Lumen is opened straight from your computer** (`file://`), not only from a website. Before, "Extract printed text locally" stopped at "Loading English recognition model…" and then showed "OCR could not complete". The browser refused to load the OCR engine as a separate in-memory file. The engine and its worker now load as one script, so nothing has to be fetched while OCR runs.
- **The upload consent checkbox sits beside its sentence again**, instead of below it.
- **The smoke test now checks OCR**, so it now has 13 checks.
- **Tested:** the reported failure was reproduced through the real screens (upload a scanned page, open it, open the transcript editor, press Extract), then the new build was confirmed to fill in the page text. OCR works both from a local file and over http.

## v4: 15 October 2026

The second round of the improvement plan. Built with `node lumen/tools/build.mjs <input> [output]` from the original file or any earlier build; the result is the same either way.

### Less clutter
- **Library:** the large "Your books belong with you" banner is now a one-line privacy note.
- **Study:**
  - The "Less rereading" banner is now a compact bar that keeps its three buttons.
  - The method cards are replaced by a one-row link to Methods.
- **Today:**
  - The six method cards are replaced by the same one-row link.
  - The welcome banner shows only until a learner's first review or first uploaded source. Learners can still show or hide it themselves.
- **Notes and Study:** the row of zero counts is hidden until there is something to count.
- **Notes:** the page now has the same footer as the others.

### Consistent controls
- **Filter bars** on Library, Study and Notes are one 48px row with 14px labels. Some labels were 9–10px and heights ranged from 36px to 62px.
- **Dialogs:** labels and fields are at least 13px and 15px, and confirmation buttons are readable.
- **Contrast:** the selected focus-timer length now passes WCAG contrast (it was 4.2:1).

### Storage you can trust
- **The workspace is now saved in IndexedDB.** localStorage holds only about 5 MB, and heavy users could hit that limit.
- **Existing workspaces move over on first load.** A copy is still mirrored to localStorage while it fits, so older versions of the file keep working.
- **Saves also happen when the tab is hidden.**
- **If saving fails, a warning appears** with a **Download backup** button. The app no longer drops silently to session-only storage.

### Reader
- **The study panel's four tabs** sit on one row instead of two.
- **New keys:**
  - `T` shows or hides the study panel.
  - `Z` turns focus mode on or off; `Esc` also leaves it.
  - `?` opens the shortcut list with the reading-room keys first.

### NCLEX
- **Client Needs tags** (8 categories):
  - The card and note dialogs have a tag picker.
  - A bulk "Tag your cards" dialog is available from the palette and Progress.
- **Recall by category** on Progress: a bar and percentage per category, card and review counts, a practice score, and a table alternative. A **Practise weakest** button starts a review of that category.
- **Exam week:** within 7 days of the exam date, Today shows a banner that points to the weakest categories, with a one-click review.
- **NCLEX-style practice set** on Study (and in the palette):
  - Six original, illustrative items: select all that apply, two matrix items, bow-tie, highlight, and drop-down.
  - Partial-credit scoring approximates the published NGN rules (+/− and 0/1).
  - Each item has a rationale. You can check answers as you go, or take the set timed (9 minutes).
  - Results are saved and feed the category view.

### Learning
- **A fourth rating, Hard.** It uses FSRS grade 2, including the hard penalty. On the simple ladder, Hard repeats the current step instead of moving up.
- **Review keys** are now `1` Again, `2` Hard, `3` Good, `4` Easy.
- **Backups accept the Hard rating.** Older backups restore as before.
- **"From your highlights"** on Today:
  - Brings back one highlight older than 7 days that has no card yet.
  - Offers **Make a card** (opens a fill-in-the-blank draft), **Open page** or **Not today**.

### OCR
- **Fixed a bug in the original file that stopped OCR from ever starting.** The OCR library treated the engine's in-memory (blob) address as a folder and added a file name to it. OCR now reads a test image correctly in under a second.
- **The OCR engine is gzipped** and unpacked only when OCR is first used. The file shrinks from 16.0 MB to 12.9 MB.

### How it was tested
- `lumen/tests/smoke.mjs`: 12 checks pass, at 1440px wide and on 360, 390 and 414px phones.
- Separate Playwright runs covered:
  - Moving a workspace from localStorage to IndexedDB
  - Exam-week mode
  - Resurfaced highlights
  - Backup → restore with Hard ratings, tags and practice results kept
  - The storage-failure warning
  - Bulk tagging
  - OCR over http
  - Light and dark screenshots of the new screens
- axe-core found no serious or critical issues on Today, the Study extras, Progress, the palette, all six practice items, and the tag and goal dialogs.
- Re-running the build on its own output gives a byte-identical file.

## v3: 15 October 2026
- **Today's plan,** a Getting Started checklist, and a welcome banner that can be hidden.
- **Command palette:** Ctrl K, ⌘K or `/`.
- **Keyboard shortcuts.**
- **FSRS-4.5 scheduling,** with the simple ladder as an option.
- **Learning insights on Progress.**
- **Goal dialog.**
- **Fixes:** phone overflow, numerals, the duplicate sidebar label and the clipped sidebar card.
