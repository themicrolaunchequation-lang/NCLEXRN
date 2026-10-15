# Carecraft v3.3: UX review and improvement plan

**File reviewed:** `Carecraft-HCA-v3.3-Refined.html` (one 2.3 MB HTML file, about 1,040 lines)
**Method:** I read the code and ran the app in headless Chromium at 1440×900 (desktop) and 390×844 (phone). I opened every main page, a lesson, an activity, dark mode and search. The figures below come from those runs. Screenshots are in `screenshots/`.

---

## 1. Verdict

The content and tone are already strong: calm, careful, evidence-aware and well written. Desktop looks premium (Playfair + Inter, navy/teal/copper on a warm paper colour). The lesson flow (Learn → Check → Reflect, worked "needs improvement vs stronger" examples, research in context) is thoughtful.

Four things stop it from being world-class:

1. **Phones are broken.** Content gets about 175 px of a 390 px screen.
2. **Several visual collisions** (text over text, badge over label, light images in dark mode) make it look unfinished in places.
3. **Long, flat pages.** Learn is a 30-card wall, 6,900 px tall on desktop and **30,500 px on a phone**. Cards offer two or three competing buttons.
4. **The code is built in layers.** Each version overrides the one before it. `lessonPage` is wrapped about 10 times and `library` about 8, and HTML is patched with string `.replace()`. There are 6 competing `:root` token blocks, 37 font sizes and 453 hex colours. This causes the bugs and makes every new feature risky.

Fix those four and add a handful of advanced features (section 7), and it will compete with the best learning apps.

---

## 2. Keep these (they already work)

- The editorial voice and the "one small useful step" idea.
- Learn → Check → Reflect structure; worked good/poor examples; "One thing to remember".
- The evidence panel (study count, outcome, citation) and the content-provenance notes.
- The time-fit chips on Home (2 / 5 / 10 min). They really do change the recommendation.
- Local-first privacy: one `localStorage` key, export, backup and restore.
- Hash routing with back-button support, a skip link, labelled icon buttons, `alt` text on every image, one `<h1>` per page, and reduced-motion support.
- Brand palette: navy `#10253A`, teal `#087D7A`, copper `#BD764A`, gold `#C9A24A`, paper `#F8F5EF`.

---

## 3. P0: bugs to fix first (with root cause)

| # | Problem | Evidence | Root cause / fix |
|---|---|---|---|
| 1 | **Phone layout broken.** Content sits 215 px from the left and is 175 px wide. The page scrolls sideways (`scrollWidth` 444 on a 390 px screen), and search is hidden on phones. | `screenshots/01-mobile-layout-broken.png` | `@media(max-width:760px){:root{--side:0px}}` is overridden by a later `@media(max-width:1000px){:root{--side:215px}}` and by the unconditional `:root{…--side:248px}`. `.workspace{margin-left:var(--side)}` keeps the offset. **Fix:** one `--side` definition, set to `0` below 761 px *after* every other rule, and show a search icon button on phones. |
| 2 | A **dark 1 px frame around the whole main panel** after every navigation. | All desktop screenshots | `#main` has `tabindex="-1"` and gets focus on route change, so the focus outline draws. **Fix:** `#main:focus{outline:none}` (keep `:focus-visible` rings on controls). The modal `<h2>` also shows a doubled, clipped focus box; apply the same treatment to programmatically focused headings. |
| 3 | **Text over text in the Home hero.** The illustration's own words ("MAP", "ation", "Give relevant background…", "CROWN ACADEMY · sbar") show through behind the headline. | `02-home-hero-text-overlap.png` | The hero art is an infographic, not a photo. **Fix:** use a photo or an abstract pattern with no text, or put the art in its own column with no overlap. |
| 4 | **The "ILLUSTRATIVE" badge sits on top of the SVG's own "KNOWLEDGE · LEARNING MAP" label**, so the two read as garbled text. The thumbnail diagrams also use about 8 px text that nobody can read. | `03-learn-badge-overlap.png` | **Fix:** move the badge to the bottom right, or put the disclosure in the card meta line. Replace the thumbnails with simple topic artwork (icon + colour field, no small text). |
| 5 | **Stat zeros look like the letter "O"** (Playfair old-style figures). | `05-growth-oldstyle-zeros.png` | **Fix:** `font-variant-numeric: lining-nums tabular-nums` on every number, or set numbers in Inter. |
| 6 | **Dark mode shows cream images and thumbnails** on navy, and the hero gradient fades to white. | `04-dark-mode-light-images.png` | **Fix:** dark versions of the SVG art (they are generated in code, so swap the fills), `filter: brightness(.85)` on photos, and a navy-to-transparent hero gradient. Follow `prefers-color-scheme` by default. |
| 7 | **Sidebar bottom card is cut off** at 900 px height. A "Navigation · 0%" scroll widget is unclear, and "Saved collection" wraps. | `02-…` (left column) | Let the sidebar scroll internally, drop the % widget, and shorten the label to "Saved". |
| 8 | **Quote carousel dots are 5 px** and overflow on phones (the `.quote-dots` row ends at 514 px). | Probe | Give each dot a 24×24 hit area (WCAG 2.2 target size). Wrap or limit the dots. |
| 9 | **The "↗" (external link) icon is used for actions that open modals** ("Open tool ↗", "Explore ↗", "Evidence ↗"). | All pages | Use "→" for in-app actions. Keep "↗" for links that really leave the app. |

---

## 4. Navigation and information architecture

**Make names consistent.** The sidebar says "Toolkit" but the breadcrumb says "Tools". The bottom nav says "Growth" and the sidebar says "My Growth". The breadcrumb says "Practice collection". Pick one name per place and use it in the sidebar, bottom nav, breadcrumb, page eyebrow and search groups:

| Nav | Page title (keep the editorial line as a subtitle) |
|---|---|
| Home | Today |
| Learn | Learn: 30 lessons |
| Practice | Practice: 22 activities |
| Toolkit | Toolkit |
| My Growth | My Growth |

Move **Saved** into Learn (as a tab, which already exists) and the profile menu. Remove it as a separate sidebar item.

**Topbar.** Today it has Evidence ↗ · Aa 17 · search · theme · ? · You (six controls). Make it: **Search / command palette (⌘K)** · **Theme** · **Profile menu** (which holds text size, reduced motion, backup, about, evidence and sources, privacy). "Aa 17" means nothing to a first-time user.

**Footer.** Every page ends with a trust strip *and* a large navy legal block, which is heavy inside an app. Use a one-line footer (© · Privacy · About · Sources) and move the company details to About.

**Repeated date tag.** "15 October 2026" appears on every page heading. Keep it on Home only.

---

## 5. Page-by-page

### Home
- A new user sees four "0" stats. Replace them with a **3-step onboarding** (role → focus → time per day) and show stats only once there is activity.
- Order: **Continue where you left off** (or "Start here"), then **Today's plan** (time chips plus one lesson and one practice), then **Review due** (spaced recall), then **Picked for your focus**, then the quote.
- The "Good practice starts here" cards repeat the nav. Remove them, or turn them into "Recently saved".
- The hero should have one primary CTA. The secondary CTA should be clearly secondary.

### Learn
- The 30-card wall needs structure. Add **pathway sections** (or Knowledge / Skills / Attitudes groups) with a "See all", plus **filter chips**: topic, length (≤5 / ≤10 min) and status (not started / in progress / reviewed / saved). Add **sort** (recommended, shortest, A–Z) and a **list/grid toggle**.
- **Status on every card:** a progress tick or ring, "Reviewed 3 days ago" and "Review due".
- **One clear click target:** the whole card opens the lesson, with bookmark as a secondary icon. Remove the duplicate "Explore ↗" link. Make "Preview" a quick-look (hover or long-press) instead of a full-width button.
- Make cards shorter. The meta line wraps to two lines ("TEAM / COMMUNICATION · FOUNDATIONAL"), so drop "Foundational" when every lesson has it.

### Lesson
- Add a **sticky lesson header** with step progress (Learn 1/3 → Check → Reflect), time left, Save and Focus view.
- At the end, add **Next lesson** and **Related practice** cards so the session keeps moving.
- Merge the three provenance entries ("Evidence in context", "View content notes", "Sources & editorial context") into **one "Evidence & sources" drawer**.
- Optional extras: highlight and personal note on any paragraph (stays on the device), and **Read aloud** (Web Speech API).

### Practice
- 22 cards across 5 overlapping tabs (Scenarios, Interactive Studios, 3D simulations, Teams & improvement). Use **one filter bar** instead: format · duration · topic · team or solo.
- Fill the cards that show only a number with real art, and use the same art system as Learn.
- Make "Activity guide" an ⓘ icon that opens a popover. Today it is a second full-width button under every card.
- Inside activities: a progress indicator (decision 1 of 3), a clear finish screen ("What you practised · one thing to try · next activity"), and Esc closes after confirming if there is a draft.

### Toolkit
- Three different card styles and two button styles on one page. Group into **Quick tools** (SBAR, Teach-back, Before you act, Appraisal), **Templates** (CUS, DESC, Huddle, Fishbone, Improvement test) and **Wellbeing** (Reset, Movement). Use one card component.

### My Growth
- Show a **weekly activity strip** (calm, no streak pressure), a **topic coverage map** (30 topics, coloured by reviewed or due) and a **review queue**.
- Put the three data buttons (Export · Backup · Restore) under one **"Your data"** menu.

### Phone
- Pages are very long (Learn is 30,500 px). Use one-column compact cards (image left, text right), sticky filter chips, and a bottom nav with a raised **Search** action.
- Modals should be **full-screen sheets** with a sticky header and close button on phones.

---

## 6. Design system clean-up

| Today | Target |
|---|---|
| 6 `:root` blocks overriding each other | **1** token block plus a `[data-theme=dark]` block that also follows `prefers-color-scheme` |
| 37 font sizes; 12 px used 206×; some text 8–10 px | **9-step scale:** 12 / 14 / 16 / 18 / 20 / 24 / 30 / 38 / 48. Body 16 px. Nothing under 12 px. |
| 453 distinct hex colours | About **20 tokens**: neutral 50–900, teal, navy, copper, gold, and success/warning/danger/info |
| 46 `!important` | 0 (achievable once the CSS layers are merged) |
| Mixed radius, shadow and spacing | radius 4 / 8 / 16; spacing 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64; 2 shadow levels |
| "Illustrative", "Fictional", "Not clinical competence" repeated in many styles | **One disclosure chip** component plus one footnote style |

Components to standardise: Button (primary / secondary / ghost / icon), Card (lesson / activity / tool / stat), Chip/Filter, Tabs, Modal/Sheet, Toast, Empty state, Progress ring/bar, Popover, Command palette.

---

## 7. Advanced features (local-first, privacy-safe)

1. **Command palette (⌘K / Ctrl+K)**: search lessons, activities and tools, plus actions ("Start a 2-minute reset", "Export my record", "Switch theme").
2. **Smart Review**: a spaced-repetition queue built on the existing `reviewQueue`, with "3 prompts due today" on Home and a calm review session UI.
3. **Learning pathways with progress rings**: for example Communication, Safety, Person-centred care and Digital practice. Each has a short goal and a completion summary.
4. **Continue anywhere**: resume the exact lesson step or activity decision.
5. **Notes & highlights**: per-paragraph, searchable, exportable, on device only.
6. **Read aloud and dyslexia-friendly mode**: Web Speech API, adjustable line height and letter spacing, and a font swap.
7. **Facilitator / present mode**: full-screen, large type, step-by-step reveal for team huddles (the activities already say "individual or facilitated").
8. **Printable learning record**: a clean print stylesheet and PDF via `window.print()`, clearly labelled "record of learning activity, not a credential".
9. **Installable and offline (PWA)**: manifest, service worker and icons. This needs the app hosted as a small folder rather than opened as a single file. The `site/` folder in this repo already shows the pattern.
10. **Keyboard shortcuts**: `/` search, `g h / g l / g p` go to pages, `j/k` move through cards, `?` shows the shortcut sheet.
11. **Undo toasts** for save/unsave, delete reflection and restore backup.
12. **Gentle micro-interactions**: page fade or slide (150–200 ms), card hover lift, and a satisfying "lesson reviewed" check, all turned off under reduced motion.

---

## 8. Architecture and performance

- **Merge the layers.** Write **one** final version of each view (`renderHome`, `renderLearn`, `renderLesson`, `renderPractice`, `renderToolkit`, `renderGrowth`, `renderSearch`). Delete the wrapper chains and the 17 `html.replace('<div class="…">', …)` patches. Replace the 270 inline `onclick=` with one delegated `data-action` click handler.
- **Separate data from views.** Keep lessons, activities, evidence and guides as plain data objects (they mostly are already).
- **Images:** 1.6 MB of base64 JPEG/WebP. Re-encode at display size (about 800 px wide, WebP or AVIF at q≈70). Target under 600 KB in total. Subset fonts to Latin.
- **State:** keep the `carecraft-v1` key and add a `schemaVersion` migration, so existing users keep their progress.
- **Quality gates:** zero console errors; Lighthouse Accessibility ≥ 95 and Performance ≥ 90 (hosted); no horizontal scroll at 320 / 390 / 768 / 1024 / 1440 px; axe-core with no serious issues.

---

## 9. Roadmap

| Phase | Scope | Result |
|---|---|---|
| **1. Fix** | Section 3 bugs (P0) | Works and looks finished on every screen size and in both themes |
| **2. Foundation** | One token set, type scale, components; merge the CSS and JS layers | Consistent look, safe to change |
| **3. Structure** | Section 4 navigation, Learn and Practice filters, card redesign, onboarding, lesson header and next-step | Easy to find things, smooth flow |
| **4. Delight** | Command palette, Smart Review, pathways, notes, present mode, print record, micro-interactions | Advanced, modern feel |
| **5. Ship** | Image compression, PWA (if hosted), QA matrix | Fast, installable, reliable |

The prompt for ChatGPT is in `CHATGPT_PROMPT.md`.
