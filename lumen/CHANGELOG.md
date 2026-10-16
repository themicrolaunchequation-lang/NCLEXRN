# Lumen changelog

## v6: 16 October 2026

### Academy AI: AI for members, with no keys
- **Academy AI is now the first AI engine.** Members sign in once with their Evinca email and password (AI providers → Academy AI). From then on, summaries and every question type work with nothing to set up.
- **Runs on the Academy's own service.** This is a Supabase Edge Function, `lumen-ai`, that holds the Academy's paid Gemini and Groq keys. The keys never reach the browser.
- **Daily allowance by Evinca level.** The defaults are 15, 30 and 60 requests a day, plus an Academy-wide daily ceiling that caps spending. The dialog shows how many requests are left today.
- **Shared answer store.** A request that another member already sent is answered from the store and does not use the allowance.
- **Fallback is unchanged.** When the allowance is used up or the service is busy, Lumen moves on to any key the member added, then browser AI, local AI and source tools. A request is given back if no provider answers.
- **The sign-in is kept like the keys.** It stays in this browser (or this tab only) and is never included in backups. **Sign out** removes it.
- **Wording:** the AI dialog and Page studio now name Academy AI next to "your own keys".
- **Not deployed yet.** `ACADEMY_AI.md` explains the choice for 500+ members, the cost (about $40 a month typical, at most about $125 with the default ceiling) and the setup steps.

### How it was tested
- **Edge Function handler:** 12 unit tests with simulated Supabase and providers. They cover sign-in, Evinca level, allowance, ceiling, fallback on 429, 5xx or no connection, the refund, the cache, size limits, and that prompt text is never logged.
- **Migration:** run twice in an in-process Postgres. It checks the allowance counting, the refund and the Academy-wide ceiling.
- **Smoke test:** 17 checks. The new ones cover:
  - a wrong password is refused, then sign-in succeeds
  - questions arrive from Academy AI
  - a used-up allowance falls back to the learner's Groq key
  - no key or sign-in token appears in a backup
- **Accessibility:** axe found no serious issues in the AI dialog, at 1440px and on a 390px phone, in light and dark themes.

## v5: 16 October 2026

### AI with your own keys
- **New "AI providers and keys" dialog** (Ctrl K → "AI providers", and the AI link in Settings). It lists 13 providers:
  - Free tiers: Gemini, Groq, OpenRouter free models, Mistral, SambaNova, NVIDIA NIM
  - Trials: Cerebras, Cohere, Hugging Face
  - Paid: OpenAI, Anthropic, DeepSeek
  - Your own server: Ollama or LM Studio
- **Each provider has:** a key field, a link to get a key, **Load models** (asks the provider for its current list; OpenRouter is filtered to free models), **Test connection**, a daily request count, and arrows to set the order.
- **Automatic fallback.** Lumen tries your providers in order, then browser AI, then the local model, then source tools (no AI). On a quota error it reads the provider's retry hint and rests that provider: about a minute for per-minute limits, longer for daily limits. A refused key rests for a day. Each result shows what happened with every provider.
- **Keys are stored apart from the workspace.** They never appear in backups or exports. "Remember on this device" can be turned off, and **Remove all keys** wipes them.
- **Before any text leaves the device**, Lumen shows how much will be sent and to whom, and asks you to confirm it contains no patient-identifiable information.

### Every question type
- **Page studio was rebuilt.** Choose an engine and a summary style (key points, structured notes, clinical pearls and red flags, plain language), then the question types and how many (3–15).
- **14 types:**
  - Multiple choice, select all that apply, true or false
  - Matrix and matrix multiple response
  - Bow-tie, highlight, drop-down cloze
  - Drag and drop (word bank, which works by dragging or by tapping), ordered response
  - Calculation (unit and tolerance), short answer (self-marked against a model answer)
  - Case studies with exhibit tabs and the six clinical-judgement steps
  - Flashcards, which become recall cards
- **AI drafts must quote the page.** Lumen checks each draft's quote against the page and leaves out any it cannot match.
- **Question bank.** Save drafts after checking them; filter by type, category or source; practise untimed or timed (1.5 minutes per item). Results feed Progress → Recall by category, and every rationale links back to its page.

### Also
- `FREE_AI_PROVIDERS.md`: researched free tiers, privacy notes, sources, and how the fallback works.
- `ICON_LIBRARY_PROMPT.md`: the design for a drag-and-drop, resizable clinical sticker library, plus a prompt for an external research agent to collect 300 openly licensed icons.
- **Smoke test:** 15 checks. The new ones cover AI questions through a mocked provider and keys staying out of backups.

### How it was tested
- **Real providers could not be reached from the build environment**, so the AI was tested against mocked Gemini and Groq endpoints. The scenarios covered:
  - a daily quota that falls back to the next provider
  - a per-minute limit (rests about a minute)
  - a server error
  - every provider failing (falls back to source tools)
  - recovery
- **All 14 question types** were rendered, answered, checked and scored. One draft with a quote that is not on the page was rejected.
- **Bank and practice:** the bank, practice and backup-without-keys flows all passed.
- **Accessibility:** axe found no serious issues in the new dialogs.
- **Phones:** the AI dialog fits a 390 px phone.

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
