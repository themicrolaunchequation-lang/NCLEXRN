# Prompt for ChatGPT

**How to use:** open a new ChatGPT chat with file uploads and code execution turned on. Attach `Carecraft-HCA-v3.3-Refined.html` and the five PNGs in `screenshots/`. Paste everything below the line. ChatGPT will work one phase at a time. After each phase, download the file, test it, then reply "continue".

---

You are a senior product designer and front-end engineer who builds world-class learning apps (think Linear, Duolingo, Headspace and Notion in craft and calm). I'm attaching my web app **Carecraft v3.3** (`Carecraft-HCA-v3.3-Refined.html`), a single, self-contained HTML file (about 2.3 MB, with base64 images and fonts inside) for healthcare staff learning. It belongs to Healthcare Crown Academy. Screenshots of current bugs are attached too.

Your job is to upgrade it to world-class: modern, comfortable, easy to navigate and understand, with a smooth workflow, a clean layout and advanced features. Keep its content, voice and privacy model.

## 0. How you must work (read carefully)

1. **Use your Python/code tool to edit the file.** Never retype the whole file in chat, and never print or retype base64 data. Load it with Python, make targeted edits (string or regex replace, or by splitting into CSS / HTML / JS sections), write a new file, and give me a **download link** at the end of each phase. Name the outputs `Carecraft-v4.0-phase1.html`, `…-phase2.html` and so on.
2. **Work in the phases in section 5, one per reply.** At the end of each phase: (a) list every change, (b) list how you verified it, (c) stop and wait for me to say "continue".
3. **Before changing anything in phase 1**, inspect the file and report back: the layer structure (search for `const ccBase…=lessonPage`, `hcaLessonPageBase`, `lessonPage=function`, `library=function`, `showModal=function`, and all `:root{` blocks), the list of views and routes, the `state` object keys, and the data arrays (`lessons`, `cases`, `HCA_ACTIVITIES`, `CC_SIMS`, `CC_EVIDENCE`, `ASSETS`, `P2_DATA`). Confirm you understand them before you edit.
4. If you can, run the file in a headless browser (Playwright or pyppeteer) to check the layout at 390 px and 1440 px. If you can't, check it statically (CSS cascade order, JS syntax with `node --check` on the extracted script, or by parsing it) and tell me exactly what I should test by hand.
5. Never invent clinical facts, statistics, study numbers or citations. Reuse the existing text. Where new UI text is needed (labels, empty states, onboarding), write short, plain, warm UK English that matches the current voice ("one small, useful step").

## 1. Things you must not break

- **Everything stays in one offline HTML file** that works when opened from disk (`file://`), with no external requests. All images and fonts stay embedded. If you recompress them, the new ones are still embedded.
- **All content stays:** 30 lessons, 90 practice prompts, 22 practice activities, tools, templates, evidence summaries, guides, quotes, About, Privacy and Sources text, and all company and legal facts (company no. 17501904, ICO ZC273259, registered address, "Educational activity, not clinical certification or accredited CPD/CME").
- **User data stays compatible:** keep the `localStorage` key `carecraft-v1` and every existing `state` key (`name, role, saved, completed, reflections, assessment, goal, theme, cases, studioRecords, actions, checkRecords, branchRecords, toolDrafts, dataVersion, studioAttempts, migratedStudio, reviewQueue, learningFocus, setting, reduceMotion, lastSession, textSize`). Add new keys only through a `schemaVersion` migration that never drops data. Export, backup and restore must still round-trip.
- **Hash routing** and the back button keep working. Deep links like `#/library` still resolve.
- **Disclaimers stay** (fictional scenarios, illustrative images, "not verified clinical competence"), but they are shown with **one** consistent disclosure-chip component instead of many styles.
- No tracking, analytics or network calls. "Private notes stay on this device" must stay true.
- Brand: navy `#10253A`, teal `#087D7A`, copper `#BD764A`, gold `#C9A24A`, paper `#F8F5EF`/`#FFFDF9`, ink `#24313A`. Playfair Display for display headings, Inter for UI and body text.

## 2. Bugs found in an audit (fix all of these in phase 1)

1. **Phone layout broken (critical).** At 390 px wide, `.workspace` keeps `margin-left:215px`, so content gets only about 175 px and the page scrolls sideways (`scrollWidth` 444). Cause: `@media(max-width:760px){:root{--side:0px}}` is overridden by a *later* `@media(max-width:1000px){:root{--side:215px}}` and by an unconditional `:root{…--side:248px…}`. Fix it so `--side` is `0` below 761 px no matter the source order, the sidebar becomes an off-canvas drawer, and there is no horizontal scroll at 320, 360, 390, 414, 768, 1024, 1280 or 1440 px. Search is `display:none` on phones; give phones a search icon button that opens a full-screen search.
2. **A dark frame around the whole main panel** after every navigation: `#main` (`tabindex="-1"`) gets focus and draws an outline. Add `#main:focus{outline:none}` and do the same for headings that receive focus from code (the modal `<h2>` shows a doubled, clipped focus box). Keep strong `:focus-visible` rings on real controls.
3. **Home hero has text over text.** The hero background is an infographic, and its words ("MAP", "ation", "Give relevant background…", "CROWN ACADEMY · sbar") show behind the headline. Use art with no text (a photo or an abstract brand pattern), or a split layout with no overlap.
4. **Card thumbnails:** the "ILLUSTRATIVE" badge covers the SVG's own "KNOWLEDGE · LEARNING MAP" label, and the thumbnail diagrams contain about 8 px text nobody can read. Replace them with a consistent **topic artwork system**: a soft colour field per category (Knowledge / Skills / Attitudes), a large line icon per topic, and no small text, generated as inline SVG in code. Move the disclosure into the card meta or a corner chip that doesn't collide with anything. Apply the same system to Practice cards (some currently show only a number).
5. **Numbers look like the letter O:** Playfair's old-style "0" in the stat tiles. Use `font-variant-numeric: lining-nums tabular-nums` for all numbers, or set them in Inter.
6. **Dark mode:** cream images and SVG thumbnails sit on navy, and the hero gradient fades to white. Give the SVG art dark fills, dim photos slightly, use a navy-to-transparent hero gradient, and default the theme to **System** (`prefers-color-scheme`) with Light/Dark overrides.
7. **Sidebar:** the bottom "Small steps" card is cut off at 900 px height; the "Navigation · 0%" widget is confusing; "Saved collection" wraps onto two lines. Let the sidebar scroll internally, remove the % widget and shorten the label.
8. **Quote carousel dots are 5 px** and overflow on phones. Give each a ≥24×24 px hit area, wrap or limit them, and add pause/next buttons.
9. **"↗" is used for in-app actions** ("Open tool ↗", "Explore ↗", "Evidence ↗"). Use "→" for in-app actions and keep "↗" for links that really go outside the app.
10. **Naming is inconsistent:** sidebar "Toolkit" vs breadcrumb "Tools", "My Growth" vs bottom-nav "Growth", breadcrumb "Practice collection". Use one name per destination everywhere: Home, Learn, Practice, Toolkit, My Growth.

## 3. Target experience (phases 2 to 4)

### 3.1 Design system (phase 2)
- Replace the 6 competing `:root` blocks with **one token set** plus `[data-theme="dark"]`. Today there are 453 distinct hex colours; target about 20 tokens: neutral 50–900, navy, teal, copper, gold, success, warning, danger, info, plus surface, raised and overlay.
- **Type scale (only these sizes):** 12 / 14 / 16 / 18 / 20 / 24 / 30 / 38 / 48 px. Body 16 px, line-height 1.6, reading width 68ch. Nothing smaller than 12 px (today 12 px is used 206 times and some text is 8–10 px). The existing text-size preference scales everything through a root variable.
- **Spacing:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. **Radius:** 4 / 8 / 16. **Shadow:** 2 levels. **Motion:** 150–220 ms with a standard ease, all turned off under `prefers-reduced-motion` or the in-app reduced-motion setting.
- **Components** (build once, use everywhere): Button (primary / secondary / ghost / icon, plus loading and disabled states), Card (lesson / activity / tool / stat), Chip and filter chip, Tabs, Modal (desktop) / bottom sheet (phone, full-screen with sticky header), Popover, Toast with Undo, Empty state, Progress bar and ring, Disclosure chip, Skeleton.
- Remove all 46 `!important`s once the CSS is merged into one ordered stylesheet: tokens → base → layout → components → pages → utilities.
- WCAG 2.2 AA: contrast ≥ 4.5:1 for text, targets ≥ 24×24 px (44 px on phones for main controls), focus never hidden behind the sticky top bar (`scroll-padding-top`), focus trapped in modals and returned to the trigger on close, Esc closes.

### 3.2 Code architecture (phase 2, alongside the design system)
- Collapse the override chains into **one final function per view**: `renderHome`, `renderLearn`, `renderLesson`, `renderPractice`, `renderActivity`, `renderToolkit`, `renderGrowth`, `renderSearch`, `renderSettings`. Today `lessonPage` is wrapped about 10 times and `library` about 8, and 17 `html.replace('<div class="…">', …)` calls patch HTML strings. Remove them and build the final markup directly. Remove dead code that is left over afterwards, but **first prove it is unreachable** (no route, `onclick`, `data-` hook or string lookup uses it).
- Replace the 270 inline `onclick="…"` handlers with `data-action="…"` attributes plus one delegated click/keydown handler on `document`.
- Keep the data (lessons, activities, evidence, guides) as plain objects at the top of the script, separate from the rendering code.
- One `store` module: `load()`, `save()` (debounced), `migrate()`, `export()`, `import()`.
- Each step must produce exactly the same content and behaviour as v3.3 before you move on. After the refactor, walk through every route and every activity and confirm there are no console errors.

### 3.3 Navigation and layout (phase 3)
- **Sidebar (desktop) / bottom nav (phone):** Home · Learn · Practice · Toolkit · My Growth. "Saved" becomes a tab in Learn and an entry in the profile menu.
- **Top bar:** breadcrumb, then a wide **search field that also opens a command palette** (⌘K / Ctrl+K and `/`), the theme toggle (System/Light/Dark) and a **profile menu** containing: name and role, text size, reduced motion, dyslexia-friendly mode, Your data (export / backup / restore / reset), About, Evidence & sources, Privacy. Remove the separate "Evidence ↗", "Aa 17" and "?" buttons; their functions move into this menu.
- **Footer:** one slim line (© Healthcare Crown Academy · About · Privacy · Sources). The full company and legal block moves to About. The date tag shows only on Home.
- **Page header pattern:** eyebrow, H1 (keep the editorial line as the subtitle, e.g. H1 "Learn", subtitle "Knowledge for the work you do."), then the page's main controls.

### 3.4 Page redesigns (phase 3)
- **Home ("Today"):**
  - **New user:** a 3-step onboarding card (role → focus area → minutes per day) instead of four "0" stats. Store the answers in the existing `role`, `learningFocus` and `goal` keys.
  - **Returning user:** *Continue where you left off* (resume the exact lesson tab or activity step from `lastSession`) → *Today's plan* (keep the working 2/5/10-minute chips: one lesson and one practice) → *Review due* (count from `reviewQueue`) → *Picked for your focus* (3 cards) → quote of the day.
  - Remove the "Good practice starts here" cards, which repeat the nav.
- **Learn:**
  - A sticky filter bar with chips for Category (Knowledge / Skills / Attitudes), Topic, Length (≤5 / ≤10 min) and Status (Not started / In progress / Reviewed / Review due / Saved). Add Sort (Recommended / Shortest / A–Z), a grid/list toggle and a result count.
  - The default view is **grouped sections** (by pathway or category, each with "See all"), not a 30-card wall.
  - **New lesson card:** topic art, then a meta row (category · minutes), then the title and a one-line description, then status (tick or ring, "Review due"). The **whole card is the click target**; bookmark is an icon button. Remove the duplicate "Explore ↗" link and the full-width "Preview lesson" button; offer Preview as a quick-look (hover button on desktop, long-press or ⋯ menu on phones).
  - Drop "Foundational" from the meta line while every lesson has it.
  - Phone: compact list rows (art 72 px on the left, text on the right).
- **Lesson:**
  - A sticky lesson header with title, step tabs **Learn · Check · Reflect** and a progress bar, minutes left, Save, and Focus view.
  - Keep the "who it helps / use it when / one action" brief, outcomes, steps, worked example (Needs improvement / Stronger / Compare) and "One thing to remember".
  - Merge "Evidence in context", "View content notes" and "Sources & editorial context" into **one "Evidence & sources" drawer**.
  - At the end: a completion moment, then **Next lesson** and **Related practice** cards. Keyboard: ←/→ moves between steps.
  - **Notes & highlights:** select text → Highlight / Add note. Store them in `state.notes` (new key, added by migration) and make them searchable and exportable.
  - **Read aloud** with the Web Speech API (play, pause, speed), hidden if the browser doesn't support it.
- **Practice:**
  - One filter bar (Format: Scenario / Interactive studio / 3D simulation / Team practice; Duration; Topic; Solo or Team) replaces the 5 overlapping tabs.
  - Cards match the Learn card system. "Activity guide" becomes an ⓘ icon that opens a popover.
  - Inside an activity: a progress indicator ("Decision 2 of 3"), a sticky Back/Next bar on phones, and a **finish screen** (what you practised · one thing to try · next activity · save to My Growth). Esc or close asks for confirmation if there is an unsaved draft (the `captureDraft` logic already exists; keep it).
- **Toolkit:** group into **Quick tools** (SBAR, Teach-back, Before you act, Critical appraisal), **Templates** (CUS, DESC, Brief-huddle-debrief, Fishbone, Improvement test) and **Wellbeing** (One-minute reset, Movement demonstrations), all using one card component and one button style.
- **My Growth:**
  - A calm weekly activity strip (no streaks or guilt).
  - A **topic coverage map**: the 30 topics as tiles, coloured not started / reviewed / review due.
  - A review queue with "Start review (n)".
  - Practice trail, actions and reflections, each with good empty states.
  - A **"Your data" menu** (Export record / Download backup / Restore / Reset).
  - **Print learning record:** a clean print stylesheet via `window.print()`, labelled "Record of learning activity, not a credential".
- **Search / command palette:** fuzzy matching over lessons, activities, tools, key terms and the user's own notes; grouped results; keyboard navigation (↑/↓/Enter/Esc); recent searches; and actions ("Start 2-minute reset", "Export my record", "Switch theme", "Go to My Growth").

### 3.5 Advanced features (phase 4)
1. **Smart Review:** a spaced-repetition session built on `reviewQueue` and the existing check questions. Intervals 1 / 3 / 7 / 14 / 30 days. Show "Review due" on Home, Learn cards and My Growth. Label it a learning aid, not an assessment.
2. **Pathways:** 4–5 curated sequences of existing lessons and activities (for example Communication, Patient safety, Person-centred care, Digital practice, Team & improvement), each with a progress ring and a completion summary. Use only existing content.
3. **Facilitator / present mode** for activities marked "individual or facilitated": full-screen, large type, step-by-step reveal, timer, and arrow-key navigation.
4. **Keyboard shortcuts:** `/` or ⌘K search, `g h` / `g l` / `g p` / `g t` / `g g` go to pages, `j/k` move through cards, `s` save, `?` shows a shortcut sheet.
5. **Undo toasts** for unsave, delete note or reflection, and restore.
6. **Dyslexia-friendly mode:** more letter and line spacing, left-aligned text, no italics.
7. **Micro-interactions:** a 150–200 ms page fade/slide, card hover lift (2 px plus a shadow step), a check animation when a lesson is reviewed, and skeletons for any delayed render. All respect reduced motion.

### 3.6 Performance (phase 5)
- Re-encode the embedded images (about 728 KB JPEG + 860 KB WebP today) at display size (≤ 1200 px wide for the hero, ≤ 800 px for cards) as WebP at q≈70–75. Target ≤ 600 KB total. Subset the WOFF2 fonts to Latin if you can.
- Add `decoding="async"` and keep `loading="lazy"` below the fold. Render only the visible route. Debounce search input (120 ms).
- Optional: produce a second output, a small hosted bundle (`index.html` + `manifest.webmanifest` + `sw.js` + icons), so the app can be installed and used offline as a PWA. The single file must still work on its own.

## 4. Acceptance checklist (run at the end of every phase and report pass/fail)
- [ ] No console errors on any route or activity (Home, Learn, each filter, a lesson's Learn/Check/Reflect, every Practice activity, every tool and template, My Growth, search, every modal).
- [ ] No horizontal scroll at 320 / 390 / 768 / 1024 / 1440 px. Phone modals are full-screen sheets.
- [ ] Light, dark and system themes all look right, with no light image patches in dark mode.
- [ ] Keyboard only: you can reach and use everything; focus is visible; modals trap focus and return it on close; Esc closes.
- [ ] Text contrast ≥ 4.5:1; no text under 12 px; targets ≥ 24 px.
- [ ] Old v3.3 data in `localStorage['carecraft-v1']` loads with no loss; export → reset → restore round-trips.
- [ ] Deep links and the back button work for every route.
- [ ] Content count unchanged: 30 lessons, 90 prompts, every activity and tool present.
- [ ] Reduced motion turns off all animation.
- [ ] File opens from disk with no network requests.

## 5. Phases (one per reply; wait for "continue" between them)
1. **Audit + P0 fixes:** report the structure (section 0, step 3), then fix every bug in section 2. Output `Carecraft-v4.0-phase1.html`.
2. **Foundation:** tokens, type scale, components, merged CSS, removal of the JS layer chains, delegated actions, store module. The UI should look the same or better and behave exactly the same. Output phase 2.
3. **Structure:** navigation, top bar, profile menu, footer, and the Home, Learn, Lesson, Practice, Toolkit, My Growth and search/command-palette redesigns. Output phase 3.
4. **Advanced:** Smart Review, pathways, notes & highlights, read aloud, present mode, shortcuts, undo, dyslexia mode, micro-interactions, print record. Output phase 4.
5. **Polish and ship:** image recompression, final accessibility and responsive pass, full acceptance checklist, optional PWA bundle, and a short CHANGELOG. Output `Carecraft-v4.0.html`.

Start now with **phase 1**: first the structure report, then the fixes, then the download link and verification notes.
