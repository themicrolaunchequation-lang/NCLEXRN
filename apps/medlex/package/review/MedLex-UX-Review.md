Healthcare Crown Academy · MedLex

# MedLex UX review and upgrade plan

An evidence-based review of the 15 October 2026 build ("Guided worksheets and contextual help"), with the changes needed to make MedLex calm, obvious and comfortable on every screen, and a ready-to-paste brief for ChatGPT.

Reviewed **15 Oct 2026**Build **999,971 bytes**Method: headless Chromium, **26 routes × 2 widths** (1440 and 390 px), light and dark, plus the main flows walked through

[Verdict](#verdict)[Defects](#defects)[Evidence](#evidence)[Experience](#experience)[New structure](#ia)[Roadmap](#roadmap)[Keep](#keep)[ChatGPT prompt](#prompt)

## Verdict

MedLex has unusually strong foundations: careful content integrity, honest labelling, a refined HCA visual identity and a robust technical baseline. What holds it back is **accumulation**. Each release added a new layer (studios, guides, "Start here" strips, worksheets) on top of the last, so most screens now offer several equal choices, repeat the same instructions and push real content below the fold. The worksheet editor, the newest feature, is the least comfortable flow, especially on a phone.

The fastest route to "world-class" is to **subtract and consolidate**: one next step per screen, five clear areas instead of six areas plus a studio layer, full-page focused editors instead of modals, and a cleaner architecture so future features stop adding patches.

0

JavaScript errors across all 52 route/width checks

0

pages with horizontal page overflow

18

observed defects, 5 of them high impact

5–66

visible text elements under 13 px on each route

## Observed defects

Each one was reproduced in the browser. The IDs match the ChatGPT prompt, so you can refer to them directly.

| ID | Impact | Where | What happens | Fix |
| --- | --- | --- | --- | --- |
| D1 | High | **Guided worksheet, Work step, phone** 390 px wide → Learn → Basic word structure → Classroom → New blank worksheet → Work | The working-grid table is 520 px wide inside a 340 px box. The third column ("Meaning in context") is hidden behind a sideways scroll inside a vertically scrolling modal, and there is no visual cue. | Below 720 px, render each grid row as a stacked card with three labelled fields. Never use a nested horizontal scroll for form input. |
| D2 | High | **Guided worksheet, all sizes** Open any worksheet | A four-step editor with 15+ textareas is inside a modal dialog. The title and steps scroll out of view. It has no URL of its own, so it cannot be bookmarked or reopened with browser Back/Forward. Pressing Esc while typing in a cell closes the whole editor. | Make the worksheet a full-page route (see §5.4) with a sticky step header, a sticky footer and a deep link. |
| D3 | Medium | **Worksheet cells** Work step | Every cell repeats its column header as a visible label ("Row 1: Term / element"), which doubles the visual noise. | Show column headers once. Give each cell a visually hidden accessible label (`aria-label="Row 1, Term or element"`). On phones, cards show short field labels. |
| D4 | Low | **Worksheet footer** Step 1 | The primary button is labelled "Work →", which reads as a verb ("do work"), not as navigation. | Label it "Next: Work", "Next: Verify", "Next: Keep", and "Finish" on the last step. |
| D5 | Medium | **Classroom / Independent Study cards** Any module → Classroom | Every card shows a primary "Resume / open worksheet" button even when no draft exists, so there are 5 identical primary buttons per page. | Show "Start worksheet" (primary) when no draft exists. When a draft exists, show "Continue worksheet · edited 2 h ago" (primary) and "New blank copy" (text button). Show a draft count when there are several. |
| D6 | Medium | **Search dialog** Press `/` or ⌘K and type "card" | The input box overlaps the heading "What are you curious about?". | Fix the layout. Use the redesigned command palette (§5.7). |
| D7 | Medium | **Sidebar "Practitioner space ▾"** Click it | It looks like a workspace/account switcher with a chevron, but it opens the preferences dialog. | Remove it. Put preferences and data/backup in the avatar menu (top right) and in Settings. |
| D8 | Low | **Theme control in the top bar** Look at the top bar | It is a bare filled caret "▾" with no label, and it reads as a dropdown arrow. | Use a labelled icon button (sun/moon/monitor) with a tooltip and `aria-label="Theme: System"`, or move it into the avatar menu. |
| D9 | High | **Practice page copy** Practice → "Your words, your pace" | The text says "Got it schedules a return in 1, 3, then 7 days; Review again keeps a word due", but `core.js` uses a four-rating scheduler (Again / Hard / Good / Easy, ease factor, up to 180 days). | Rewrite the copy to match the real scheduler, and show the real next interval on each rating button. |
| D10 | Medium | **Today → "Make a connection" and "Explore the body" rows** Desktop, even with reduced motion | The first card in each row sits 24 px higher and is taller than its siblings. | Align all cards in a row: same top edge, same padding, `align-items: stretch`, no special first-child margin. |
| D11 | Low | **Classroom illustration cards** Any module → Classroom (light and dark) | The decorative circle in each illustration bleeds past the card's edge. | Clip with `overflow: hidden` on the illustration frame, or redesign the art to sit inside it. |
| D12 | Medium | **Dark mode** System dark → any page | The crest's navy "M" disc disappears into the dark sidebar. Illustration panels stay bright ivory, so they glare. | Add a dark-mode crest variant (light ring/disc). Give illustrations tokenised colours for dark mode. |
| D13 | Medium | **Onboarding** First visit | Focus lands on the dialog heading and draws a broken, double-rectangle focus ring around the large serif title. | Put initial focus on the first field ("Your name"), or give the heading `tabindex="-1"` and no visible ring. |
| D14 | Low | **Today, phone** 390 px | The "0/10 min today" label overflows the progress ring. | Size the ring for its label, or put the label beside the ring. |
| D15 | Medium | **Top bar search, phone** 390 px | The search field is an empty box with no placeholder or label. | Use an icon button that opens the full-screen command palette on phones. |
| D16 | High | **Small text** All routes | Between 5 and 66 visible text elements per route render below 13 px (Explore → Terms 65, Today 29, module Term Bank 26). Worksheet helper text is 12 px. | Minimum 14 px for meta/caption text, 16 px for body text and form helpers. |
| D17 | Low | **Milestone toast** Answer your first question | The toast says "Milestone reached: first item", a raw identifier. | Use human copy ("First answer saved. Nice start.") with an `aria-live="polite"` region. |
| D18 | High | **Module page, phone** 390 px → any module | The back link, eyebrow, title, subtitle, two download buttons, four meta chips, seven wrapped tabs (3 lines) and a "Start here" box all come before the first piece of content (about 700 px down). | Compact the module header (§5.3). Use a single-line, horizontally scrollable tab bar with scroll shadows. Put downloads in an overflow menu. |

## Evidence

Screenshots from the current build, cropped to the problem.

Worksheet Work step at 390 pixels showing only two of three columns

**D1 · Worksheet on a phone.** Only two of three columns are visible. "Meaning in context" sits off to the right inside the table, with no cue that it is there.

Module page at 390 pixels with header, tabs and Start here box filling the screen

**D18 · Module page on a phone.** Header, download buttons, meta chips, three rows of tabs and the "Start here" box fill the first screen before any content.

Search dialog with the input box overlapping the heading

**D6 · Search.** The input box covers the bottom of the heading "What are you curious about?".

Today page card rows where the first card sits higher than the others

**D10 · Today.** In both rows the first card starts 24 px higher and is taller than its neighbours.

Practice page with three stacked banners and many buttons

**Too many choices.** Practice opens with the "Start here" strip and three banners holding seven buttons before the practice modes appear.

Dark mode classroom page with a faint crest and bright illustration panels

**D11–D12 · Dark mode.** The crest's "M" disc disappears, the illustration panels stay bright ivory, and their circles bleed past the card edges.

## Experience problems

These are about structure rather than bugs. They are the main reasons the app feels busy rather than calm.

1. **The same "Start here" strip is on every page.** It always lists "Choose your focus / Try it yourself / Review your evidence" and takes about 110 px on desktop and 210 px on phones. Repeated guidance gets ignored. Replace it with one sentence under each title, a first-visit coach mark and a persistent "?" help button.
2. **No single next step.** Today, Practice and the module pages each offer several equally weighted buttons. Classroom shows five identical "Resume / open worksheet" primaries even when nothing has been started.
3. **Studios are a parallel app.** Ten studios are reached from Today, Practice and Explore. The sidebar highlights "Explore" while you are in one, and the hub has 12 "Guide" buttons.
4. **Practice lives in four places** (Practice page, module Practice tab, studios, adaptive pathway), so learners cannot tell which one counts. Match Pairs appears twice.
5. **Seven module tabs** wrap onto three lines on phones. Five are enough: Overview, Words, Practice, Activities, Resources.
6. **The term library is slow to scan.** It shows three big cards per row at 1440 px, 60 per page and about 6,000 px of scrolling, with "Explore word & meaning" repeated on every card.
7. **Decorative heroes push content down**: the brain photo on Learn, the "Understand. Connect. Remember." block on Today, and "0 checks passed" shown to new learners.
8. **Three heading levels on every section** (uppercase eyebrow, large serif headline, subtitle) flatten the hierarchy. Keep eyebrows only where they carry information.
9. **Help and research are mixed.** The "How to use" guide for the module outline includes a research chart about medical students. Keep how-to help short, and give the evidence its own place for educators.
10. **The architecture invites more patches.** Seven script layers redefine the same functions (for example `openWorksheet` and `renderWorksheet` exist in both `workspace.js` and `guided.js`). Pages are rendered and then patched with `insertAdjacentHTML`. All data, drafts included, is rewritten as one `localStorage` blob, and the worksheet always says "Draft saves on this device as you type" whatever the write result.

## New structure

Five learner areas plus an educator area. Every current screen has a home, and old links redirect.

Today#today

One "Start today's session" button (reviews due, then new words, then one module step), continue where you left off, word of the day, weekly goal.

Absorbs: Today, adaptive pathway entry

Learn#learn

Course path, grid and body-system views. Module pages with five tabs and a full-page guided worksheet editor with its own link.

Absorbs: Learn, module pages, worksheets

Practice#practice

Daily session, review queue, seven practice modes, and an "Apply" group for the Clinical Note, Patient Explanation and Documentation & Coding studios. One shared session player.

Absorbs: Practice, studios 01–04 and 07

Library#library

Dense term list with preview pane and full term pages, word parts, word lab, body atlas, pronunciation.

Absorbs: Explore tabs, atlas, pronunciation studio

Progress#progress

Four-skill mastery (meaning, spelling, components, context), activity, weekly goal, local insights, and the Portfolio.

Absorbs: Progress, portfolio studio

Teach#teach

For educators only: assignments, packs, curriculum mapping, feedback, editorial overlays, and the research evidence.

Absorbs: Tools (teaching), educator and editorial studios

Preferences, appearance and data/backup move into an avatar menu and a Settings page, which replaces the misleading "Practitioner space" control.

## Roadmap

Ordered so you can ship improvements early and each phase rests on the one before it. The architecture work comes before the redesign so the redesign doesn't add more patch layers.

1. Phase 0 · Defects

   ### Fix D1–D18 in the current code

   A stable, shippable build quickly: phone-friendly worksheet grid, correct scheduler copy, aligned cards, dark-mode crest, minimum 14 px text.
2. Phase 1 · Architecture

   ### ES modules and a single-file Vite build

   One definition per function, a central store, a typed router with focus management. No visual change. Content equality and migration tests prove nothing was lost.
3. Phase 2 · Design system

   ### Tokens, type scale, components, icons

   HCA palette kept. Playfair only for page titles and term names, Inter elsewhere. One icon set, three elevations, tokenised illustrations for dark mode.
4. Phase 3 · Structure

   ### Five areas, Settings, command palette, contextual help

   Redirects for every old route. The "Start here" strips are replaced by coach marks and a "?" help button.
5. Phase 4 · Screens

   ### Today, Learn, modules, worksheet editor, Practice, Library, Progress, Teach

   One primary action per view. The worksheet becomes a two-pane page with a sticky stepper, a real save status and a drafts manager.
6. Phase 5 · Advanced features

   ### Smarter learning

   Unified daily session engine, optional FSRS scheduling, four-skill mastery, typo-tolerant spelling with a letter diff, palette actions, draft history, IndexedDB storage, installable offline app when hosted.
7. Phase 6 · QA

   ### Prove it

   Playwright journeys, axe audits in every theme, overflow and text-size checks at four widths, print checks, measured performance. Only measured results are reported.

## Keep these strengths

### Trust

- All 1,480 terms and 26 modules preserved exactly
- Clear labels for fictional examples, self-review and scored work
- Research shown with its population, source and limits
- No invented reviewer sign-off

### Craft

- The HCA navy, teal, ivory and copper palette
- The Playfair Display and Inter pairing
- Colour-coded prefix, root and suffix anatomy
- Original vector illustrations

### Engineering

- Zero console errors and no page overflow
- Four-rating spaced repetition
- Encrypted backup, typed reset with undo
- Mobile bottom navigation and skip link

## The ChatGPT prompt

A complete, self-contained brief. It contains the audit evidence, constraints, new structure, screen specifications, design system, advanced features, architecture, accessibility checklist, phased plan and acceptance tests.

1. Open a ChatGPT conversation that can read files and run code (Code Interpreter or Codex).
2. Attach `MedLex-Reviewer-Package.zip`.
3. Paste the prompt below. ChatGPT will summarise the package, then work one phase at a time and stop for your review after each.

Show the prompt (6,125 words)

```
## 0. Your role, the product and the goal

You are a senior product designer and a senior front-end engineer working as one team. You are upgrading **MedLex**, an offline medical-terminology learning web app published by **Healthcare Crown Academy (HCA)**. Its users are student nurses, healthcare practitioners and educators.

The attached zip contains:

- `MedLex-Guided-Editor-Review.html`: the current build (one self-contained HTML file, about 1 MB, 15 October 2026 release).
- `source/work/*.js` and `*.css`: the readable source (`core.js`, `advanced.js`, `workspace.js`, `guided.js`, `enhancements.js`, `today.js`, `profile.js`, `srs.js`, `preferences.js`, `activity-art.js`, `design.css`, `advanced.css`, `workspace.css`).
- `source/work/upgrade.py`, `expand.py`, `refine.py`, `minify.cjs`: the current Python build that injects those files into the original HTML.
- `source/upload/MedLex-Medical-Terminology.html`: the original app with all educational data.
- `source/work/tests/*.cjs`: the existing jsdom tests. `source/work/CONTENT_BACKLOG.md`: content gaps that need human editors.
- `source/brand/HCA-Brand-Kit`: the licensed fonts (Inter variable, Playfair Display) and crest template.

**Goal:** make MedLex feel like a world-class, modern learning product (the calm clarity of Linear, the habit loop of Duolingo, the explanations of Brilliant), while keeping its honest, evidence-based character. After this work, a first-time learner should know what to do on every screen within 5 seconds. Every screen should have **one** obvious next action. Every flow, worksheets included, should be comfortable on a 390 px phone and on a 1440 px desktop.

Before you change anything, unzip the package, read `REVIEW-README.md`, `source/work/README.md`, `source/work/CHANGELOG.md` and every file in `source/work/`, and open the HTML in a headless browser. Summarise back to me in 15 lines or fewer what you found, and confirm you can run the existing tests. Then start Phase 0.

---

## 1. Non-negotiable constraints

1. **Do not change educational content.** Keep every one of the 1,480 terms, 100 prefixes, 100 suffixes, 26 modules, lessons, cases, confusions, coding questions, quotes, outcomes, activities, references and disclaimers exactly as they are at runtime. You may rewrite UI chrome (buttons, labels, helper text, empty states) but never definitions, examples, word splits or clinical wording. The existing content-equality test must still pass.
2. **Do not invent medical facts, research figures or reviewer sign-off.** New helper text must be labelled as UI guidance. The research cards (Freeman et al. 2014, Larsen et al. 2013) may move but must keep their population, source and limits.
3. **Offline, single file.** The deliverable is still one HTML file that works from disk with no network, no CDN, no analytics and no runtime fonts from the web. You may author in ES modules with a build step (Vite + `vite-plugin-singlefile` is recommended). Keep the gzipped output small and report the exact byte size before and after.
4. **Zero data loss.** Existing `medlex-v3` records (profile, terms, SRS, sessions, activity, course, drafts, portfolio, feedback, editorial overlays, achievements) must load unchanged. Also keep reading `medlex-v1` and `medlex-course-v2` for migration, and leave those keys untouched. Import must accept v2, v3 and the new v4 exports, plus the existing AES-GCM encrypted backups.
5. **WCAG 2.2 AA** in light, dark and high-contrast modes. Respect `prefers-reduced-motion`, and let the in-app motion setting override it in both directions.
6. **Keep honest labelling.** Self-review, completion and scored results must stay visibly distinct. "Not automatically graded", "fictional example" and "curriculum alignment pending" notices stay, but become calm inline notes rather than repeated banners.
7. **No regressions.** Every feature listed in `source/work/README.md` must still work at the end of each phase. If you remove a screen, map its route to the new location with a redirect.
8. **Keep the HCA identity:** navy, teal, ivory, copper and gold; the Playfair Display + Inter pairing; the crest; the publisher footer (HEALTHCARE CROWN ACADEMY LTD · Company 17501904 · ICO ZC273259). Refine it; do not replace it.

---

## 2. Audit evidence: what is wrong today

These findings come from rendering the current build in Chromium at 1440×900 and 390×844 on all 26 routes and walking through the main flows. The current build has no JavaScript errors and no page-level horizontal overflow, so keep those passing. Fix everything below.

### 2.1 Observed defects (fix all of these in Phase 0)

| # | Where | Reproduce | Problem | Required fix |
|---|---|---|---|---|
| D1 | Guided worksheet, Work step, phone | 390 px wide → Learn → Basic word structure → Classroom → New blank worksheet → Work | The working-grid table is 520 px wide inside a 340 px box. The third column ("Meaning in context") is hidden behind a sideways scroll inside a vertically scrolling modal, and there is no visual cue. | Below 720 px, render each grid row as a stacked card with three labelled fields. Never use a nested horizontal scroll for form input. |
| D2 | Guided worksheet, all sizes | Open any worksheet | A four-step editor with 15+ textareas is inside a modal dialog. The title and steps scroll out of view. It has no URL of its own, so it cannot be bookmarked or reopened with browser Back/Forward. Pressing Esc while typing in a cell closes the whole editor. | Make the worksheet a full-page route (see §5.4) with a sticky step header, a sticky footer and a deep link. |
| D3 | Worksheet cells | Work step | Every cell repeats its column header as a visible label ("Row 1: Term / element"), which doubles the visual noise. | Show column headers once. Give each cell a visually hidden accessible label (`aria-label="Row 1, Term or element"`). On phones, cards show short field labels. |
| D4 | Worksheet footer | Step 1 | The primary button is labelled "Work →", which reads as a verb ("do work"), not as navigation. | Label it "Next: Work", "Next: Verify", "Next: Keep", and "Finish" on the last step. |
| D5 | Classroom / Independent Study cards | Any module → Classroom | Every card shows a primary "Resume / open worksheet" button even when no draft exists, so there are 5 identical primary buttons per page. | Show "Start worksheet" (primary) when no draft exists. When a draft exists, show "Continue worksheet · edited 2 h ago" (primary) and "New blank copy" (text button). Show a draft count when there are several. |
| D6 | Search dialog | Press `/` or ⌘K and type "card" | The input box overlaps the heading "What are you curious about?". | Fix the layout. Use the redesigned command palette (§5.7). |
| D7 | Sidebar "Practitioner space ▾" | Click it | It looks like a workspace/account switcher with a chevron, but it opens the preferences dialog. | Remove it. Put preferences and data/backup in the avatar menu (top right) and in Settings. |
| D8 | Theme control in the top bar | Look at the top bar | It is a bare filled caret "▾" with no label, and it reads as a dropdown arrow. | Use a labelled icon button (sun/moon/monitor) with a tooltip and `aria-label="Theme: System"`, or move it into the avatar menu. |
| D9 | Practice page copy | Practice → "Your words, your pace" | The text says "Got it schedules a return in 1, 3, then 7 days; Review again keeps a word due", but `core.js` uses a four-rating scheduler (Again / Hard / Good / Easy, ease factor, up to 180 days). | Rewrite the copy to match the real scheduler, and show the real next interval on each rating button. |
| D10 | Today → "Make a connection" and "Explore the body" rows | Desktop, even with reduced motion | The first card in each row sits 24 px higher and is taller than its siblings. | Align all cards in a row: same top edge, same padding, `align-items: stretch`, no special first-child margin. |
| D11 | Classroom illustration cards | Any module → Classroom (light and dark) | The decorative circle in each illustration bleeds past the card's edge. | Clip with `overflow: hidden` on the illustration frame, or redesign the art to sit inside it. |
| D12 | Dark mode | System dark → any page | The crest's navy "M" disc disappears into the dark sidebar. Illustration panels stay bright ivory, so they glare. | Add a dark-mode crest variant (light ring/disc). Give illustrations tokenised colours for dark mode. |
| D13 | Onboarding | First visit | Focus lands on the dialog heading and draws a broken, double-rectangle focus ring around the large serif title. | Put initial focus on the first field ("Your name"), or give the heading `tabindex="-1"` and no visible ring. |
| D14 | Today, phone | 390 px | The "0/10 min today" label overflows the progress ring. | Size the ring for its label, or put the label beside the ring. |
| D15 | Top bar search, phone | 390 px | The search field is an empty box with no placeholder or label. | Use an icon button that opens the full-screen command palette on phones. |
| D16 | Small text | All routes | Between 5 and 66 visible text elements per route render below 13 px (Explore → Terms 65, Today 29, module Term Bank 26). Worksheet helper text is 12 px. | Minimum 14 px for meta/caption text, 16 px for body text and form helpers. |
| D17 | Milestone toast | Answer your first question | The toast says "Milestone reached: first item", a raw identifier. | Use human copy ("First answer saved. Nice start.") with an `aria-live="polite"` region. |
| D18 | Module page, phone | 390 px → any module | The back link, eyebrow, title, subtitle, two download buttons, four meta chips, seven wrapped tabs (3 lines) and a "Start here" box all come before the first piece of content (about 700 px down). | Compact the module header (§5.3). Use a single-line, horizontally scrollable tab bar with scroll shadows. Put downloads in an overflow menu. |

### 2.2 Experience problems (fix these through the redesign)

1. **The "Start here" strip is on every page** and always shows the same three generic steps ("Choose your focus / Try it yourself / Review your evidence"). It takes about 110 px on desktop and about 210 px on phones, so learners stop reading it. Replace it with (a) one plain sentence under each page title, (b) a dismissible first-visit coach mark per area, remembered in storage, and (c) a persistent "?" help button in the top bar that opens context help for the current page.
2. **Too many competing calls to action.** Practice shows three stacked hero banners with six buttons (Open interactive studios, My adaptive pathway, Start today's session, Build a word, Listen & spell, Match pairs, Choose a module exercise) before the actual practice modes. Today has a studios banner inside "Make a connection". Rule: **one primary button per view**, at most two secondary buttons.
3. **The studios form an orphaned layer.** The 10 studios are reached from Today, Practice and the Explore tabs, the sidebar highlights "Explore" while you are in one, and the hub has 12 "Guide" buttons (two at the top, one per card). Fold studios into the main areas (§4).
4. **Practice is split four ways:** the Practice page, each module's Practice Exercises tab, the studios (Match Pairs appears in two places) and the adaptive pathway. A learner cannot tell which one "counts". Use one practice model (§5.5).
5. **The module page has seven tabs** (Outline, Learning Outcomes, Term Bank, Practice Exercises, Classroom, Independent Study, References). Consolidate them into five (§5.3).
6. **Explore → Terms is inefficient:** 3 large cards per row on a 1440 px screen, 60 per page, about 6,000 px tall, with "Explore word & meaning ↗" repeated on every card. Learners need a dense, scannable list with an A–Z jump, sort, chips and an instant preview.
7. **Decorative hero content pushes real content below the fold:** the brain photo hero on Learn, the "Understand. Connect. Remember." text block taking half the Today hero, and the "0 checks passed" stat for new users.
8. **Section headings use three levels everywhere** (uppercase eyebrow + large serif headline + subtitle), even for small sections, which flattens the hierarchy. Keep eyebrows only where they encode something true (chapter number, step number, content type).
9. **Guides mix "how to use this" with research infographics** (for example the Module outline guide shows a Larsen 2013 chart). Keep how-to help short. Move the evidence to a "Why this method works" section in the Educator area and in the help centre.

### 2.3 Engineering problems

1. **Patch-layer architecture:** seven JS files redefine the same global functions (`openWorksheet`, `renderWorksheet`, `sheetField`, `guideFor`, `helpButton`, `inlineGuide` and others are defined in both `workspace.js` and `guided.js`; the later one silently wins). Pages are rendered with `main.innerHTML = …` and then patched with `insertAdjacentHTML` (see `render()` in `core.js`). Many functions are 2–5 KB single lines. The build injects strings into the original HTML with Python. This is fragile and blocks further work.
2. **Persistence:** one `localStorage` JSON blob (`medlex-v3`) is re-serialised on every change (250 ms debounce), drafts and portfolio included. Drafts grow without limit towards the roughly 5 MB quota, and the "Draft saves on this device as you type" note is shown whether or not the write succeeded.
3. **Announcements:** the toast and result counters already use live regions, but route changes are not announced. The worksheet's `role="status"` line always shows the same static text ("Draft saves on this device as you type") whatever the write result, so a failed save is never announced.
4. **No focus management on route change** beyond some studios. After navigation, focus should move to the page `<h1>`.
5. **Size:** the build sits just under its self-imposed 1,000,000-byte limit, so every feature squeezes. All 1,480 terms parse at start-up.

### 2.4 Strengths to keep

- Strict content integrity and honest labelling (fictional examples, self-review vs scored, research population and limits, no invented sign-off).
- No console errors and no horizontal overflow across 52 route/width checks.
- The elegant HCA palette and the Playfair + Inter pairing; the coloured prefix/root/suffix word anatomy.
- Mobile bottom navigation, skip link, typed reset with undo, encrypted backup, the four-rating SRS, distinct objective/self-review records, printable packs.

---

## 3. Experience principles (use these to settle every decision)

1. **One next step.** Every screen answers "what should I do now?" with a single primary button.
2. **Show, don't explain.** Replace instruction banners with good defaults, clear labels, examples and empty states that teach.
3. **Calm, not busy.** Fewer boxes, fewer eyebrows, more whitespace and alignment. Cards only where something is a separate, clickable object.
4. **Progress is always visible.** Learners always know where they are (breadcrumb, step, mastery) and that their work is saved.
5. **Respect the craft of medicine.** Precise wording, sources one click away, no gamified pressure. Streaks are gentle and weekly goals are forgiving.
6. **Keyboard-first and thumb-first.** Everything works with a keyboard, a screen reader and one thumb.

---

## 4. New information architecture

Replace the six sidebar items and the studio hub with this structure. Keep the old hash routes working through redirects.

| Area (sidebar + bottom nav) | Contains | Absorbs from today |
|---|---|---|
| **Today** `#today` | The daily plan: one "Start today's session" button, Continue (last module/worksheet), reviews due, word of the day, weekly goal | Today, adaptive pathway entry |
| **Learn** `#learn` | Course path (default), grid, body-system view; module pages | Learn, body-system atlas link |
| **Practice** `#practice` | Daily session (adaptive); Review queue (SRS); Modes: Meaning check, Clinical context, Spell it, Build a word, Listen & spell, Match pairs, Confusable terms; **Apply**: Clinical Note, Patient Explanation, Documentation & Coding studios | Practice, studios 01–04 and 07, module "Practice Exercises" shortcuts |
| **Library** `#library` | Terms, Word parts, Word lab, Body atlas, Pronunciation; full-page term profiles at `#library/term/<id>` | Explore (Terms, Word elements, Word lab), studios 05 and 06 |
| **Progress** `#progress` | Mastery overview, activity heatmap, streak/weekly goal, **Portfolio** (evidence, worksheets, feedback), reports | Progress, portfolio studio |
| **Teach** `#teach` (shown when role = Educator, or switched on in Settings) | Assignments, learner/educator packs, curriculum mapping, feedback, editorial overlays, "Why this method works" research | Tools (teaching parts), educator and editorial studios |

**Settings** live in the avatar menu (top right): profile, appearance, text size, motion, speech, daily goal, data (export, import, encrypted backup, calendar, reset), keyboard shortcuts, about.

On phones the bottom nav shows Today, Learn, Practice, Library and Progress. Teach and Settings live in the avatar menu.

Breadcrumbs: `Learn / Ch 1 Basic word structure / Activities / Label, define, explain`. The page `<title>` follows the same order.

---

## 5. Screen-by-screen redesign

### 5.1 First run

- Two short steps instead of three: (1) name (optional) and role, (2) daily goal and appearance, with motion and text size under "More options". Focus lands on the first field. Show a "Skip" link.
- Then an optional 2-minute placement check (the existing 12-item baseline) with "Not now" as an equal option.
- Land on Today with a single coach mark pointing to "Start today's session".

### 5.2 Today

Top to bottom, at most four blocks above the fold on desktop:

1. Greeting and a one-line status ("3 reviews due · 4 of 10 min today") with a weekly goal ring (7 small dots, one per day) instead of the daily ring.
2. **Primary card: "Today's session"**, about 10 minutes. It mixes due reviews, new words from the current module and one module step. One button: "Start session" (or "Resume session · 4/10"). Show what it contains as three small chips.
3. **Continue** row: last module (progress bar plus next unfinished section) and last worksheet draft ("Continue: Label, define, explain · edited yesterday").
4. Word of the day (compact) and a quick-practice row (3 modes). Body-system carousel lower down.

Remove the "Start here" strip, the studios banner and the decorative "Understand. Connect. Remember." block.

### 5.3 Learn and module pages

- **Learn:** a compact header (title, one sentence, "Continue Chapter N" primary). Remove the brain-photo hero, or shrink it to a small illustration beside the header. The course path is a vertical timeline grouped by part (Foundations, Body systems), each module showing status (Not started / In progress x% / Done), terms count and minutes. Add filter chips (All, In progress, Not started, Done) and a search box. Show stats ("26 modules · 1,480 terms · 200 word parts") as one quiet line.
- **Module header (compact):** chapter label, title, a one-line description, a progress bar with "x of 5 outcomes", and one primary "Continue" button. Print learning pack and Educator guide go in a "⋯" overflow menu. Meta becomes a single text line ("20 terms · 5 outcomes · ~70 min").
- **Five tabs** in a single-line scrollable segmented bar, sticky under the top bar:
  1. **Overview**: outline sections as an accordion (first one open), learning outcomes with self-rating inline, prerequisites, curriculum note.
  2. **Words**: the term bank as a dense list with save/familiar toggles and a "Practise these 20 words" primary button.
  3. **Practice**: the module exercises (knowledge check 80% pass, spelling, components, classification, coding literacy, case reflection) as a list with status and best score.
  4. **Activities**: classroom and independent-study activities in one list, filterable by "Classroom / Independent". Each item is a compact row card (illustration thumbnail, title, mode and minutes, evidence to bring back, status chip: Not started / Draft / Saved to portfolio / Completed) with the button logic from D5. Educator notes and the facilitator's desk appear only in Teach mode.
  5. **Resources**: references and sources.
- A previous/next module footer stays.

### 5.4 Guided worksheet editor (full-page route)

Route: `#learn/module/<id>/activity/<type>/<index>/sheet/<sheetId>`.

- **Layout, desktop ≥1100 px:** two panes. The left pane (360 px, sticky, collapsible) holds the task, the "Evidence to keep" box, group roles, and a "Reference" disclosure with the companion records (hidden until opened, as today). The right pane holds the current step.
- **Layout, tablet/phone:** one column. The task becomes a collapsible "Task" sheet at the top; the reference opens as a bottom sheet.
- **Sticky step header:** worksheet title, a stepper (1 Prepare · 2 Work · 3 Verify · 4 Keep) showing completed/current state, and a save status ("Saved · 10:42" / "Saving…" / "Not saved: storage full. Export now."). The status reflects the real write result.
- **Sticky footer:** "Back" and "Next: Work" (primary); on the last step "Save to portfolio" (primary) and "Finish".
- **Work grid:** desktop shows a real table with column headers once and auto-growing textareas. Below 720 px, each row is a card with three labelled fields. Add "Add row" / "Remove row" (default 5, max 10). Keep "Add five module words to my empty grid" as a secondary action that never overwrites filled cells.
- **Verify:** side-by-side "My attempt" and "Companion record" (revealed deliberately) with a "Corrections" field. Keep the self-review checklist.
- **Keep:** reflection, optional next recall date (locale-aware date input, note "for your own plan; no reminder is sent"), self-review checkboxes, then actions: Save to portfolio (primary), Download/print my worksheet, Download blank copy (in the overflow menu).
- **Drafts:** a "Drafts" menu in the header lists every sheet for this activity (created, last edited, step reached) with Open, Duplicate and Delete (with undo). "New blank worksheet" lives there too.
- Keyboard: Ctrl/⌘+Enter goes to the next step; Esc does **not** close the page. Warn before leaving only if a write is pending.
- Writing is never graded. Saving never marks the activity complete; the learner ticks "Completed" separately. Keep this wording.

### 5.5 Practice

- Header: "Practice" with one primary button, "Start today's session (10 items)", and a line showing reviews due.
- **Review queue** card: due count, "Review now", and a 7-day forecast sparkline.
- **Modes** grid (7 cards, all the same size): icon, name, one-line description, length, and a last-score chip.
- **Apply** section: Clinical Note, Patient Explanation and Documentation & Coding studios as larger cards, each labelled "Self-review + rubric".
- **Session player** (shared by all objective modes): a full-width focused layout with a progress bar ("4 of 10"), large question type, options as large tappable rows with A–D keyboard hints, immediate feedback with the correct answer and the word-part breakdown, a "Why?" disclosure, and a confidence capture (Guess / Unsure / Sure) before reveal where the mode already supports it. End screen: score, items to review, "Review mistakes" (primary) and "Back to Practice".
- **Recall cards:** flip card with Again / Hard / Good / Easy buttons, each showing the real next interval ("10 min", "1.2 d", "3 d", "4 d"), with keys 1–4.
- **Spelling input:** tolerant feedback that shows a letter-level diff of the learner's attempt against the correct spelling (green matching, red wrong, underline missing) and accepts the listed aliases/variants.

### 5.6 Library

- **Terms:** a dense list (term, system chip, one-line meaning, saved/familiar state) with an A–Z rail, filter chips (System, Saved, Familiar, Still to explore, Has word parts), sort (A–Z, chapter, recently viewed) and a list/grid toggle. Virtualise or paginate by 100 with "Load more". On desktop, a preview pane on the right shows the selected term; Enter opens its full page.
- **Term page** `#library/term/<id>`: term and pronunciation (TTS button), system and chapter, colour-coded word anatomy (prefix/root/suffix with meanings), precise meaning, plain-language meaning (where present), example, note, aliases, confusable terms, "Other words with this root", actions (Save, Mark familiar, Add to review, Practise), and source line. Prev/next within the current list.
- **Word parts:** prefixes and suffixes in a two-tab list with tier filter; each part opens a page listing every term that contains it.
- **Word lab, atlas, pronunciation:** keep the features and give them the same header, spacing and card system.

### 5.7 Command palette (⌘K, Ctrl+K, `/`)

- Full-screen on phones, centred 640 px panel on desktop.
- Fuzzy, typo-tolerant search over terms (term, aliases, meaning), word parts (type "-itis" or "cardi"), modules, activities, studios and settings.
- Actions as well as results: "Start today's session", "Continue last worksheet", "Toggle dark mode", "Export backup", "Go to Chapter 5".
- Grouped results, recent searches, arrow-key navigation, Enter to open, Tab to cycle groups, highlighted matches. Show "No results for 'x'. Try a word part such as 'cardi'." when empty.

### 5.8 Progress

- Mastery overview: per-module rings and a per-term mastery model across the four skills the app already tracks (meaning, spelling, components, context), shown as a four-segment indicator.
- Activity heatmap (existing), weekly goal and streak with one "streak freeze" per week.
- Insights computed locally: most-missed terms, weakest word parts, time spent per system. Each insight links to a practice set.
- **Portfolio** tab: worksheets, studio reflections, objective results and educator feedback, filterable, with the existing export/report functions.

### 5.9 Teach (educators)

Assignment builder, learner/educator packs, curriculum mapping (CSV), feedback (CSV), editorial overlays and the research evidence, all with the same page header and form components. Keep "proposed curriculum alignment" and "no independent clinical sign-off" notices as quiet inline notes.

---

## 6. Design system

Implement tokens first as CSS custom properties. Then refactor all styles to use only tokens, and delete unused legacy CSS.

### 6.1 Colour (keep HCA values; verify every text pair is ≥ 4.5:1, large text and UI ≥ 3:1)

Define semantic tokens with light, dark and high-contrast values: `--bg`, `--surface`, `--surface-raised`, `--surface-sunken`, `--border`, `--border-strong`, `--text`, `--text-muted` (must still pass 4.5:1), `--brand-navy`, `--brand-teal` (primary actions), `--brand-copper` (suffix, warm accents), `--brand-gold` (achievements only), `--prefix`, `--root`, `--suffix` (word anatomy, each with a background tint), `--success`, `--warning`, `--danger`, `--info`, `--focus-ring`. Dark mode uses a deep navy base, not pure black. Illustrations use tokens so they adapt.

### 6.2 Typography

- Playfair Display for page titles (h1), term names and display numbers only. Inter for everything else, h2 and h3 included, which gives a cleaner UI hierarchy.
- Scale (rem): 0.875 (caption/meta, minimum), 1 (body), 1.125 (lead), 1.25 (h3), 1.5 (h2), 2 (h1), 2.75 (display), with matching line heights (1.5 for body, 1.2 for headings) and `text-wrap: balance` on headings.
- Body text width at most 70 characters. Uppercase labels only for chips and eyebrows, with 0.06 em letter-spacing.
- Text size setting: 100%, 112.5%, 125%, 150%. All layouts must work at 150% and with browser zoom at 200%.

### 6.3 Space, shape, elevation, layout

- 4 px base grid: 4, 8, 12, 16, 24, 32, 48, 64.
- Radius: 8 (inputs, chips), 12 (cards), 16 (sheets/dialogs), and full (pills).
- Three elevation levels only. Most cards are flat with a 1 px border; raised elevation is for menus, sheets and the session player.
- Layout: sidebar 248 px (collapsible to a 72 px icon rail at 1024–1279 px), content max width 1200 px centred, 24 px gutters on desktop and 16 px on phones. Breakpoints: 480, 720, 1024, 1280.
- Touch targets ≥ 44×44 px. Visible focus ring: 2 px `--focus-ring` with a 2 px offset, never removed.

### 6.4 Components (build once, use everywhere)

Button (primary, secondary, ghost, danger; sizes sm/md/lg; loading state), IconButton (always with an accessible label and tooltip), Link, Chip/Pill (filter, status), Badge, Card (static, interactive), ListRow, Tabs (scrollable, keyboard arrows), Segmented control, Stepper, Accordion, Dialog, BottomSheet, Drawer, Menu (overflow "⋯"), Tooltip (hover and focus, never for essential info), Toast (with `aria-live`, undo action), Banner (info/warning, dismissible), EmptyState (illustration, one line, one button), Skeleton, ProgressBar, ProgressRing, Field (label, hint, error, counter), Textarea (auto-grow), Select, Checkbox, Radio, Switch, DateInput, SearchInput, CommandPalette, WordAnatomy (prefix/root/suffix), TermRow, ModuleRow, ActivityCard, SessionPlayer, Flashcard, SaveStatus, PageHeader (eyebrow optional, title, description, actions), Breadcrumbs.

### 6.5 Motion

- Durations: 120 ms (press/hover), 200 ms (enter/exit), 320 ms (page/sheet). Easing `cubic-bezier(.2,.8,.2,1)`.
- Page transition: 8 px fade-up on main content only. Card hover: 2 px lift and border colour change. Correct answer: brief scale pulse plus a check icon. Flashcard: 3D flip, which becomes a cross-fade under reduced motion.
- Remove entry staggers that delay content (they caused the misaligned cards in screenshots). Under reduced motion, all transforms are disabled and only opacity remains, at 0–120 ms.

### 6.6 Iconography and illustration

Use one consistent 24 px, 1.75 px-stroke line icon set, inlined as SVG symbols. Never use a bare unicode caret or arrow as the only content of a control. Keep the eight original vector illustrations, clipped to their frames and tokenised for dark mode. Add empty-state illustrations in the same style for: no saved words, no reviews due, no drafts, no portfolio items, no search results.

---

## 7. Advanced features (Phase 5)

1. **Unified daily session engine** that builds a 10-minute session from: due SRS reviews first, then weakest skill items, then new words from the current module, with interleaved modes. It is resumable.
2. **Optional FSRS scheduling.** Implement the open FSRS algorithm (for example the MIT-licensed `ts-fsrs`, bundled) behind a setting ("Scheduler: Classic / FSRS"). Migrate existing SM-2 cards without losing their due dates.
3. **Four-skill mastery model** per term (meaning, spelling, components, context) with a decay over time, shown in the term page, the module Words tab and Progress.
4. **Typo-tolerant spelling feedback** with a letter diff, and an accepted-variants list from existing aliases (for example British/American spellings already present in the data).
5. **Command palette with actions** (§5.7).
6. **Worksheet drafts manager**, duplicate and version history (keep the last 10 autosave snapshots per sheet, restorable).
7. **Local insights** on Progress (§5.8).
8. **Keyboard shortcuts:** `?` overlay; `g t` / `g l` / `g p` / `g b` / `g r` to go to an area; `/` search; `1–4` ratings; `A–D` options; `Ctrl/⌘+Enter` next step.
9. **Installable offline app when hosted:** when served over HTTPS (it is also hosted on Vercel), register a service worker and web manifest so learners can install it. The single-file disk version must keep working without them.
10. **Storage upgrade:** move to IndexedDB with separate stores (profile, terms, sessions, activity, drafts, portfolio, overlays). Use a write-ahead in-memory queue, flush on `visibilitychange`/`pagehide`, show a storage usage meter in Settings › Data, and handle `QuotaExceededError` with a clear message and an "Export now" button. Keep a `localStorage` mirror of `medlex-v3` for one release for rollback. Add schema `version: 4` and migrations.
11. **Print-quality exports:** worksheet, learner pack and portfolio report print stylesheets with the HCA header and footer and page-break control.

Do **not** build accounts, cloud sync, AI grading or chat features. Note them as future work only.

---

## 8. Architecture refactor (Phase 1, before any visual change)

1. Move to ES modules under `src/` with a Vite build that outputs one inlined HTML file (`vite-plugin-singlefile`). Suggested structure: `src/data/` (the original collections extracted losslessly, plus the existing compact encoding), `src/state/` (store, migrations, persistence adapter), `src/router/` (typed route table, redirects, focus management, titles), `src/ui/components/`, `src/features/<area>/` (today, learn, module, worksheet, practice, library, progress, teach, settings), `src/styles/` (tokens.css, base.css, components.css, utilities.css).
2. **One definition per function.** Delete the patch layers and `insertAdjacentHTML` post-processing. Each view renders its own complete markup.
3. **Rendering:** stay framework-free (tagged-template rendering with event delegation and keyed list updates) or use Preact (about 4 KB) if it reduces code. Pick one and justify it in 5 lines or fewer. Escape all user-entered text in one place.
4. **State:** a single store with `get/set/subscribe`, typed with JSDoc or TypeScript, and pure selectors for derived data (due count, mastery, streak).
5. **Lazy data:** parse term data on first need, and build the search index in idle time.
6. Keep `upgrade.py` and the old build documented as legacy. The new build command is `npm run build`, which writes `dist/MedLex.html`.

---

## 9. Accessibility checklist (WCAG 2.2 AA)

- Landmarks (`header`, `nav`, `main`, `aside`, `footer`). One `h1` per page and no skipped heading levels.
- On route change: update `document.title`, move focus to the `h1` (`tabindex="-1"`), and announce through a polite live region.
- Dialogs and sheets: `role="dialog"`, `aria-modal`, labelled, focus trapped, focus returned on close, Esc closes them (except the worksheet page, which is not a dialog).
- Tabs follow the ARIA tabs pattern with arrow keys. Accordions use `button[aria-expanded]`.
- Quiz feedback, save status and toasts are announced. Never rely on colour alone (correct/incorrect also gets an icon and text; word parts also get text labels).
- Target size ≥ 24 px minimum (44 px preferred). Focus is never obscured by sticky headers or footers (`scroll-padding`). Dragging (Build a word) has a click/keyboard alternative.
- Forms: visible labels, hints linked with `aria-describedby`, errors announced, `autocomplete` where relevant.
- Contrast verified in light, dark and high-contrast modes, including placeholder text, disabled states and chart labels.

---

## 10. Execution plan (deliver in phases; stop after each one for my review)

For each phase, give: a short changelog, the files changed, test results, screenshots (desktop 1440 and phone 390, light and dark) of the affected screens, the byte size, and the updated HTML file to download.

- **Phase 0, Defects (no redesign):** fix D1–D18 in the current code base so there is a stable, improved build to ship now. Add regression tests for each.
- **Phase 1, Architecture:** the module/Vite refactor with zero visual or behavioural change. Port and extend the tests. Prove content equality and data migration.
- **Phase 2, Design system:** tokens, typography, components, icons, dark/high-contrast. Restyle all existing screens with the new components (structure unchanged).
- **Phase 3, IA and navigation:** the new areas (§4), routes and redirects, avatar menu, Settings, command palette, help button and coach marks; remove the "Start here" strips.
- **Phase 4, Screens:** Today, Learn, module pages (5 tabs), the full-page worksheet editor, Practice and the session player, Library and term pages, Progress and Portfolio, Teach.
- **Phase 5, Advanced features** (§7).
- **Phase 6, QA and polish:** the full test suite, an accessibility audit, a performance check, copy review and the final changelog.

---

## 11. Tests and acceptance criteria (definition of done)

Automate with Playwright (Chromium; WebKit and Firefox too if available) plus axe-core, and keep the jsdom tests.

1. **Content equality:** all ten educational collections are identical to the original at runtime (existing `integrity.cjs` passes).
2. **Migration:** v1 + v2 → v3 → v4 and v3 → v4 lose no data. A v3 export imports into v4. Encrypted backups made by the current build decrypt and restore.
3. **Routes:** every old route (`#home`, `#modules`, `#systems`, `#library`, `#affixes`, `#wordlab`, `#toolkit`, `#module?id=…&tab=…`, `#studio/*`, `#explore/*`) redirects to its new home and renders without errors.
4. **No console errors** on any route in light/dark at 390, 768, 1024 and 1440 px.
5. **No horizontal overflow** of the page at any of those widths, and no nested horizontal scroll inside form inputs. The worksheet Work step at 390 px shows all three fields of every row.
6. **No visible text under 14 px**, except the legal footer line (12 px minimum).
7. **One primary button per view**, checked by counting `.btn-primary` in `main`; session and dialog footers are allowed one each.
8. **axe-core: zero serious or critical violations** on every route and in key states (dialog open, quiz answered, worksheet each step, palette open, dark, high contrast).
9. **Keyboard journeys** pass without a mouse: onboarding → today's session → finish; open module → Activities → start worksheet → all 4 steps → save to portfolio; ⌘K → term → save; Settings → export backup.
10. **Worksheet:** a new blank sheet preserves older sheets; resume opens the latest; drafts survive reload; deep link reopens the same sheet and step; the save status shows a failure when storage throws; Esc does not discard work.
11. **SRS:** the interval labels shown on rating buttons equal the scheduled result; the Practice copy matches the scheduler.
12. **Reduced motion:** with the OS setting or the in-app setting, no transform animations run.
13. **Performance (local file, mid-range laptop profile):** first contentful paint under 1 s, interaction to next paint under 200 ms on the Terms list and the search palette, output HTML ≤ 1.2 MB uncompressed (report gzipped size too).
14. **Print:** worksheet, learner pack and portfolio report print cleanly on A4 with no cut-off text.

---

## 12. Deliverables

1. `MedLex.html`: the single-file build.
2. `src/` source, `package.json`, `vite.config.*`, and a README with build/test commands.
3. Updated `tests/` (jsdom + Playwright + axe) and a `validation.json` with real, measured results only. Never report a test as passed if it was not run.
4. `CHANGELOG.md` entry per phase, `MIGRATION.md` (v3 → v4), and an updated `CONTENT_BACKLOG.md` (unchanged items stay listed; no content invented).
5. A screenshot set: every main route at 390 and 1440 px, light and dark, before and after.

Work carefully and in order. If a requirement conflicts with a constraint in §1, the constraint wins: tell me about the conflict and propose an option. Do not silently drop features. Start by unzipping the package and giving me your 15-line summary, then begin Phase 0.
```

Prepared for Healthcare Crown Academy, 15 October 2026. Based on automated Chromium rendering and code reading. It is not a screen-reader, cross-browser, clinical or curriculum review; those still need qualified people.