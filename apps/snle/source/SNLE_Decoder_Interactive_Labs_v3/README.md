# SNLE Decoder Interactive Labs — version 3

Nine self-contained HTML files plus an index. No build step, no CDN, no network calls.
Drop the folder into your app and link to `SNLE_Decoder_Lab_Index.html`.

---

## What changed and why

### 1. The hotspots now sit on the right part of the poster

This was the most damaging problem in version 1. Several labs had regions that pointed at
the wrong content, so clicking a topic highlighted something unrelated.

The worst case was Lab 05. The nine lead-in rows were spaced 9% apart in the data, but the
rows on the poster are 4.7% apart. By row 7, "Anticipate" was highlighting a region roughly
half a poster away from the anticipate row. Labs 01, 02, 03 and 07 had smaller versions of
the same drift.

Every region in all nine labs was remeasured against the source image and checked with
rendered overlays. Sections that live in two places on a poster — for example Lab 07, where
"absolute wording" is trap 3 and "false reassurance" is trap 8 — now highlight both.

### 2. Wrong answers no longer counted as mastery

`updateProgress` counted any answered exercise as complete, regardless of whether it was
correct. A learner could answer everything wrong and see 100%.

Progress is now two separate numbers:

- **Exercises mastered** — you have answered it correctly.
- **First-attempt accuracy** — correct on the first try, with no hint. This is the number
  that predicts exam performance, and it cannot be farmed by retrying.

### 3. Four exercises per section, two of them full case scenarios

Each section now has **four** exercises instead of two:

- two **decoding exercises** that train the specific skill on the poster
- two **applied cases** written in full SNLE format: a complete clinical vignette with
  observations, a real lead-in, and four plausible options

That is **130 new case items**, bringing the series to **260 exercises**. Applied cases carry
an "Applied case" tag in the exercise header so learners can see which kind they are on.

Every case was written so the distractors are the ones that actually tempt candidates:
clamping a disconnected chest tube, treating a quiet chest in asthma as improvement,
escalating a mild hypoglycaemia before treating it, giving an antihistamine when the voice
has already gone hoarse.

### 4. Each section now teaches before it tests

Version 1 dropped learners straight into questions, and the "lesson" box only repeated the
one-line section summary. Every one of the 65 sections now opens on a **Learn** tab with:

- why this is tested on the SNLE
- the concept in plain prose
- a worked example, with the reasoning written out
- the words and cues to watch
- the classic mistake
- a one-line memory hook

### 5. Every answer option is explained, not just the key

All 232 multiple-choice items now carry an explanation for each option, including why each
distractor loses. Knowing that "analgesia is reasonable but lower priority" is what transfers
to the real exam; knowing that C was correct does not.

In **Coach mode** all four explanations appear after you answer. In **Exam mode** you see the
key and the option you picked, and a timer runs.

### 6. Interaction and pacing

| Was | Now |
| --- | --- |
| Options graded the instant you clicked | Select, then submit — you can change your mind |
| Ordering tasks could only be fully reset | Tap any placed step to remove just that one |
| Hotspots invisible until hover | Numbered pins always visible; the poster dims and spotlights the active region |
| Poster shrunk into a column, unreadable on phones | Zoom to 400%, drag to pan, double-tap, fullscreen |
| No hints | Progressive hint per exercise; using one is tracked |
| No way to revisit mistakes | "Review missed" queues every wrong exercise across the page |
| Poster first on mobile, ~3 screens before anything interactive | Section list first on mobile, poster below as reference |
| No glossary | 24 key terms, tappable inline in the teaching text |
| No orientation | First-run walkthrough, re-openable from "How it works" |

Also added: `Learn / Practice / Recap` tabs, per-section recap with a retry path, keyboard
control (`1`–`9` select, `Enter` submit, `←`/`→` navigate, `Esc` close), three badges,
dark mode, `prefers-reduced-motion` support, and a completion celebration.

### 7. Files are about five times smaller

The posters were 1.7 MB PNGs. They are now WebP at quality 92 — visually identical when
magnified, which I checked against the originals at 2× before committing to it.

| | v1 | v2 |
| --- | --- | --- |
| Per lab | ~2.4 MB | ~490 KB |
| Whole series | 22 MB | 4.4 MB |
| Exercises | 130 | 260 |

### 8. The index is now a dashboard

It reads each lab's saved progress and shows series completion, exercises mastered, labs
finished, and overall first-attempt accuracy. The main button continues from the first
unfinished lab. The nine labs are grouped into three stages — read the question, find the
evidence, choose the answer — so the sequence is visible rather than implied.

### 9. Larger, adjustable type and a wider micro-lab

The micro-lab dialog now opens at **80% of the viewport width** (capped at 1460px) and the
text inside it is set from a single scale variable, defaulting to **150% of the previous
size**. A text control in the dialog header steps that from 100% to 200%, and the choice is
remembered.

Because a wide dialog with long lines is harder to read, not easier, the Learn tab uses the
extra width as a **second column** (concept and worked example on the left; cues, pitfall,
memory hook and evidence on the right) while prose stays at a comfortable measure. Practice
and Recap keep a single readable column. On phones the dialog is full width and the scale is
capped so nothing overflows.

### 10. Research evidence for every lab

Each lab now carries a "Why this lab matters" panel with a pull quote and two study findings,
and the most relevant finding also appears in every section's Learn tab. The index carries a
series-level band.

**Every figure was checked against the primary source or a peer-reviewed citing source before
it was included.** The evidence used:

| Claim | Source |
| --- | --- |
| 35% of new graduates met acceptable clinical judgment on the PBDS | del Bueno, *Nursing Education Perspectives*, 2005;26(5):278–282 |
| 23% met entry-level competency (>5,000 graduates, 140+ programmes, 21 states) | Kavanagh & Szweda, *Nursing Education Perspectives*, 2017;38(2):57–62 |
| 9% demonstrated adequate clinical judgment (2016–2020 data) | Kavanagh & Sharpnack, *OJIN*, 2021;26(1) |
| 84% of ward patients who arrested had documented deterioration within 8 hours | Schein et al., *Chest*, 1990;98(6):1388–1392 |
| Respiratory rate above 27/min was the strongest predictor of ward cardiac arrest | Fieselmann 1993, reviewed in Cretikos et al., *MJA*, 2008;188(11):657–659 |
| Practice testing and spaced practice were the only two of ten techniques rated high utility | Dunlosky et al., *Psychological Science in the Public Interest*, 2013;14(1):4–58 |
| Feedback reduces the negative effects of multiple-choice testing | Butler & Roediger, *Memory & Cognition*, 2008;36(3):604–616 |
| The NCJMM drew on 100+ nursing experts and data from 200,000+ candidates | NCSBN, Clinical Judgment Measurement Model |
| Clinical judgment begins with noticing; four-phase model | Tanner, *Journal of Nursing Education*, 2006 |
| Item-writing taxonomy; a valid lead-in is answerable with the options covered | Haladyna, Downing & Rodriguez, *Applied Measurement in Education*, 2002;15(3):309–334 |

---

## Integration notes

**Progress storage.** Each lab writes to `localStorage` under `snle-decoder-v2-<num>`.
Progress saved by version 1 is imported automatically the first time a learner opens the new
file, so nobody loses their place. All storage calls are wrapped, with an in-memory fallback,
so the pages still work if storage is blocked (private mode, sandboxed iframe).

**Same-origin requirement.** The index reads the labs' saved progress, so serve the whole
folder from one origin. Opening the files directly from disk with `file://` works for a single
lab, but browsers may isolate each file, in which case the index will show zero.

**Editing content.** Each file has four JSON objects near the bottom of the `<script>` block:

- `PAGE` — sections, hotspot regions, exercises, answers, rationales
- `EXTRA` — teaching cards (`sections`), per-option explanations (`why`), extra notes (`notes`)
- `GLOSSARY` — key terms
- `EVIDENCE` — the pull quote and study findings for this lab

Applied cases carry their per-option explanations inline as `why` on the exercise itself, so
adding a new case means adding one object to `exercises` and nothing else.

Regions are `[x, y, width, height]` as percentages of the poster. A section can hold several.
Nothing else needs to change to add or reword an exercise.

**Accessibility.** Hotspots and pins are real buttons with labels, the dialog uses
`aria-modal`, focus is visible throughout, and motion is disabled for anyone who asks for it.

---

## Two things worth doing next

**A results export.** Learners revising over weeks lose everything if they clear site data.
A short JSON export and import, or a code they can paste, would fix that without a backend.

**Distractor tagging.** Lab 07 names ten wrong-answer traps. If each distractor across the
other eight labs were tagged with which trap it is, you could show a learner their personal
pattern: "you lose most often to reasonable-but-lower-priority options." The exercise data
already has a `tags` field sitting empty and ready for it.
