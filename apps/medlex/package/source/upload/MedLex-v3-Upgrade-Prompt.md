# MedLex v3 — World-Class Redesign & Upgrade Brief

> **Paste this whole document into your AI coding agent.** Attach the current app file `MedLex-Medical-Terminology.html` with it. Everything the agent needs is here: what exists, what is wrong (with evidence), the exact design system to adopt, the screen-by-screen redesign, the new features, the order of work, and the tests that define "done".

---

## 0. Your role and mission

You are a senior product designer and senior front-end engineer working together. You will take **MedLex**, an existing medical-terminology learning web app, and turn it into a **world-class, modern, calm, animated and engaging** learning product, at the level of Duolingo, Brilliant, Linear or Headspace, but for healthcare practitioners.

The finished app must feel:

- **Easy:** a first-time user knows what to do within 5 seconds, on every screen.
- **Engaging:** every session has a clear goal, visible progress and a small reward.
- **Clear:** one primary action per screen, strong hierarchy, no tiny grey text.
- **Comfortable:** generous spacing, readable type (16px base), soft colours, gentle motion, a good dark mode.
- **Modern and animated:** smooth page transitions, physical micro-interactions, satisfying feedback. Motion always respects reduced-motion settings.

Keep the current brand: calm botanical green, an editorial serif paired with a clean sans, and soft peach, lavender and lime accents. **Refine and elevate it. Do not replace it.**

---

## 1. What the app is today (facts from a full scan)

**Delivery:** one self-contained HTML file (2.04 MB). It uses vanilla JavaScript and inline CSS, needs no server, works offline and has no external requests.

**Embedded assets:**

| Asset | Size | Problem |
|---|---|---|
| Font "Studio" = Nimbus Sans Regular (Helvetica clone), WOFF, 855 glyphs | 59 KB | **Only one weight.** Every 500/600 weight is faux-bold synthesised by the browser |
| Font "Editorial" = P052 Roman + Italic (Palatino clone), WOFF | 81 + 82 KB | Not subset, not WOFF2 |
| 3 anatomy images (heart, lungs, brain), WebP | 162 + 146 + 155 KB | **Heart and lungs are embedded twice** (hero and module hero), wasting ~308 KB. Only 3 images cover 24 chapters |
| Term data (`TERMS`, one 671 KB line) | 671 KB | Parsed on load; see the data-quality findings below |

**Routes (hash-based):** `#modules` (the default landing page), `#home` (labelled "Overview"), `#systems`, `#library`, `#affixes`, `#wordlab`, `#practice`, `#progress`, `#toolkit`, `#module?id=chN&tab=outline|outcomes|bank|practice|classroom|independent|references`.

**Data model:**
- `CHAPTERS` (24), `COURSE_MODULES` (26 = 24 chapters + 2 word-element modules spliced in at positions 3–4)
- `TERMS` (1,480): `{id, term, chapter, definition, plain, parts[{text,type,meaning}], example, aliases[], note, category, source}`
- `PREFIXES` (100), `SUFFIXES` (100), `LESSONS` (7), `CASES` (10), `CONFUSIONS` (6), `CODE_QUESTIONS` (8), `QUOTES` (4)

**Persistence:** `localStorage` under two keys:
- `medlex-v1`: `name, theme, reduced, saved[], learned[], lessons[], history[], reviews{id:{reps,due,last}}, visits[]` (up to 365 dates)
- `medlex-course-v2`: `outcomes{}, activities{}, attempts[], notes{}, mapping{}, last, planMinutes, planStart`

Export and import use JSON `{app:'MedLex', version:2, studio, course}`.

**Features that exist and must be kept:**
- Course modules with tabs: Outline, Learning Outcomes, Term Bank, Practice Exercises, Classroom, Independent Study, References
- 7 foundation lessons
- Term library: search, chapter filter, filters for Saved / Familiar / Still to explore, pagination of 60
- Word-element library: 100 prefixes and 100 suffixes, tier filter
- Word lab: word anatomy with coloured parts
- "Easy to confuse" comparisons
- Practice studio: meaning quiz, clinical-context quiz, recall flashcards with a simple 0/1/3/7-day schedule
- Module exercises: knowledge check (80% pass), spelling, components, classification, coding literacy, case reflection
- Progress page
- Teaching and study tools: study plan generator, curriculum mapping with CSV export, printable learner and educator packs, JSON export and import with validation
- ⌘K search modal, text-to-speech (en-AU, rate 0.8), keyboard shortcuts in quizzes and flashcards, theme toggle, a reduced-motion preference, print stylesheet, skip link

---

## 2. Non-negotiable constraints

1. **Do not lose or change any educational content.** Keep every term, definition, lesson, case, outcome, activity, reference and disclaimer. Wording may be tightened only in UI chrome (buttons, labels, empty states), never in medical definitions.
2. **Do not invent medical facts.** Do not write new definitions, examples or word splits presented as verified. If you add helper content, label it clearly (see §8.3) or leave it as a marked content backlog.
3. **Keep it offline and self-contained.** The final deliverable is **one HTML file** that works when opened from disk with no network. You may author in modules with a build step (for example Vite plus `vite-plugin-singlefile`), but the output must be a single file. No CDNs, no analytics, no external fonts at runtime.
4. **Migrate user data with zero loss.** On first load, read `medlex-v1` and `medlex-course-v2` and merge them into a new `medlex-v3` key with a `schemaVersion`. Keep the old keys untouched for one release so a rollback is safe. Import must accept v2 **and** v3 exports.
5. **WCAG 2.2 AA** throughout, in light and dark mode.
6. **Respect `prefers-reduced-motion`** and the in-app "Reduce motion" setting, which must override the OS setting both ways.
7. **Keep the existing disclaimers** ("educational terminology support, not diagnostic…", "curriculum alignment pending", and the fictional-example labels) and make them *less shouty*, not absent.
8. **No regressions:** every feature in §1 must still work at the end.

---

## 3. Audit findings, prioritised

### P0: must fix (accessibility, trust, broken feel)

1. **Text is far too small.** On Home, **53 of 130** visible text elements are under 12px. On Library it is **141 of 357**. Sizes in use include **6.8px** (logo tagline), **8px**, **9px** (nav counts, nav label, ⌘K hint, chapter tags) and **10px** (sidebar sub-labels, card footers). The stylesheet has **473 separate `font-size` declarations** and **41 distinct sizes**, many re-overridden in 15 media queries, sometimes made *smaller* on smaller screens (8px system meta under 980px).
2. **Colour contrast fails on every screen.** axe-core reports 29–143 contrast violations per page. `--muted #7a8179` on `#f6f7f2` = **3.72:1**, and nav link text `#788178` on white = **4.03:1**. In dark mode, nav text `#788178` on `#213027` = **3.43:1**.
3. **Dark mode is incomplete.** The home hero and other "peach" surfaces use hard-coded `#f2e6de` gradients, so a bright light panel sits in the middle of the dark UI. **136 hard-coded hex values** bypass the tokens.
4. **Faux-bold typography.** Only the Regular weight of the sans is embedded, so all 500/600 text is browser-synthesised and looks smeared.
5. **Icons are Unicode glyphs** (`▤ ▦ ◎ ☷ ◈ ✧ ↗ ⌘ ✦`). They fall back to Arial at 20px and render differently on every OS. Some, like `⌘` for "Teaching tools", carry no meaning.
6. **Mobile layout problems:**
   - The home hero image overlaps the "Start learning" button and the headline breaks into an orphan ("The language / of / better care.")
   - The mobile nav drawer has **no scrim, no close button, no focus trap and no scroll lock**
   - The profile button disappears on mobile
   - Module tabs scroll off-screen with no affordance
7. **Touch targets are too small:** text buttons are 17px tall, filter pills 31px, the bookmark 31×31. Minimum is **44×44** on touch (24×24 per WCAG 2.2 AA, but design to 44).
8. **Confusing numbering.** The Cardiovascular page says "MODULE 11" while the card says "CHAPTER 09", because the two word-element modules were spliced in at positions 3–4. Learners cannot tell which number to trust.

### P1: should fix (clarity, engagement, information architecture)

9. **Information architecture is muddled.**
   - The app lands on `#modules`, but "Overview" (`#home`) is also a start page with its own hero.
   - "Body systems" duplicates part of "Course modules".
   - Nine sidebar items compete for attention.
   - Home has a "Your modular course" banner bolted on *above* the greeting (`enhanceHome()` prepends it). Practice and Progress do the same.
10. **The word of the day never changes.** It is hard-coded to "pericarditis".
11. **Flashcards say "Card 1 of 1480"** in "all" mode. That is overwhelming and there is no session boundary or summary.
12. **Quiz distractors are random across all 1,480 terms**, so questions are trivially easy. For example, "What does duodenitis mean?" offers "Neural system regulating involuntary visceral functions" as a distractor.
13. **94% of term records are thin.** **1,385 of 1,480** have `plain === definition`, a templated example ("In a fictional teaching glossary, 'X' is classified as…") and no word parts. The term sheet then shows the same sentence twice and a boilerplate note, which feels low-quality.
14. **Word lab only offers 75 terms**, through a long native `<select>`. The colour legend dots are near-invisible (about 6px, pastel on white).
15. **Spaced repetition is minimal:** two buttons, intervals capped at 7 days, no "Hard" or "Easy".
16. **No habit loop:** visits are already recorded for 365 days, but there is no streak, daily goal, session summary, celebration, milestones or onboarding.
17. **The module page feels empty.** There is no visual identity per module (only 3 images for 24 chapters) and a wide empty right column.
18. **Search:** the native blue "×" clear button clashes with the design, results have no grouping (terms, word elements, modules, actions) and no recent searches. Duplicate names (for example two "Absorption" entries) are not disambiguated.
19. **Inconsistent design tokens:** 17 different border-radius values (3–30px), 6 ad-hoc shadows, and 2 keyframes for the whole app.

### P2: code health and performance

20. Features were added by monkey-patching: `render`, `home`, `practice`, `progress`, `sources`, `openChapter`, `library`, `filterLibrary` and `exportProgress` are reassigned after definition. There are duplicate global `click`, `input`, `change` and `keydown` listeners, two state objects and two storage keys.
21. Everything re-renders with `innerHTML` (41 call sites). Inline `style=""` appears in templates. Headings sit inside buttons (axe `heading-order`). The `<aside>` landmark lacks a unique label (`landmark-unique`).
22. Bundle weight: about 300 KB of duplicate images, un-subset WOFF fonts, and a 671 KB single-line JSON parsed at startup.

---

## 4. Experience principles (use these to settle every decision)

1. **One clear next step.** Every screen has exactly one primary button, and it answers "what should I do now?"
2. **Bite-sized sessions.** Sessions run 3–10 minutes with a visible end, a summary and a reward.
3. **Show the word's anatomy everywhere.** The coloured prefix, root, vowel and suffix system is MedLex's signature. Use it consistently: chips, cards, quizzes and progress.
4. **Calm, not childish.** These are healthcare professionals: celebrate with elegance (subtle confetti, a glow, a count-up), not cartoons.
5. **Progressive disclosure.** Lead with the essentials and reveal detail (references, coding notes, educator tools) on demand.
6. **Readable first.** 16px body, 1.6 line height, 60–72 characters per line, AA contrast, and nothing under 12px.

---

## 5. Design system (implement as CSS custom properties first, then refactor all styles to use only tokens)

### 5.1 Colour tokens (all text pairs verified at or above WCAG AA 4.5:1)

```css
:root {
  /* Surfaces */
  --bg:            #F7F8F3;  /* app canvas */
  --surface:       #FFFFFF;  /* cards, sheets */
  --surface-2:     #EFF3EA;  /* sunken / secondary panels */
  --surface-3:     #E6ECDF;  /* hover on surface-2 */
  --line:          #E2E7DC;  /* hairlines */
  --line-strong:   #CDD5C6;  /* inputs, dividers that must be seen */

  /* Text */
  --ink:           #1D3127;  /* primary text          13.8:1 on surface */
  --ink-2:         #46564B;  /* secondary text         7.8:1 */
  --ink-3:         #5F6D63;  /* tertiary/meta (MIN)    5.45:1 surface, 5.11 bg */

  /* Brand */
  --primary:       #1F4D3A;  /* forest; buttons, active nav, links */
  --primary-hover: #183D2E;
  --primary-soft:  #E3EEDF;  /* selected backgrounds */
  --on-primary:    #FFFFFF;  /* 9.6:1 */
  --accent:        #D9E86A;  /* lime highlight, NEVER as text colour */
  --accent-ink:    #56661A;  /* lime-family text, 6.3:1 */
  --focus:         #2A6249;  /* focus ring colour */

  /* Word-part semantic pairs (bg / ink) — MedLex signature */
  --prefix-bg: #EEE9F8;  --prefix-ink: #5A4688;   /* 6.6:1 */
  --root-bg:   #E2EFDC;  --root-ink:   #2C663B;   /* 5.7:1 */
  --vowel-bg:  #F7EFC8;  --vowel-ink:  #735C0E;   /* 5.6:1 */
  --suffix-bg: #FCE5D9;  --suffix-ink: #9C4426;   /* 5.3:1 */

  /* Feedback (bg / ink) */
  --success-bg: #E3F2E7; --success: #246B42;
  --error-bg:   #FBE6E1; --error:   #A8392A;
  --warning-bg: #FAF0D3; --warning: #7F5600;
  --info-bg:    #E2ECF6; --info:    #2C5A85;

  /* Course-area hues (bg / ink) for cards, tags, illustrations */
  --area1-bg: #E9F0C8; --area1: #56661A;  /* Foundations & word elements */
  --area2-bg: #E2EFDC; --area2: #2C663B;  /* The body as a framework */
  --area3-bg: #DDEFEA; --area3: #1F6458;  /* Body systems & clinical practice */
  --area4-bg: #EEE9F8; --area4: #5A4688;  /* Specialist clinical language */
  --area5-bg: #FCE5D9; --area5: #9C4426;  /* Evidence & population health */

  /* Hero warmth (themeable — no more hard-coded #f2e6de) */
  --hero-bg: #F4E7DF; --hero-fade: #F4E7DF00;
}

:root[data-theme="dark"] {
  --bg:#0F1914; --surface:#16221B; --surface-2:#1D2B23; --surface-3:#243329;
  --line:#2A3A30; --line-strong:#3A4D41;
  --ink:#E9EFE5; --ink-2:#B7C4B8; --ink-3:#93A296;          /* ≥5.5:1 on all surfaces */
  --primary:#B5DB8C; --primary-hover:#C6E6A3; --primary-soft:#22362A; --on-primary:#0F2418;
  --accent:#D3E77A; --accent-ink:#D3E77A; --focus:#B5DB8C;
  --prefix-bg:#2B2541; --prefix-ink:#CDBFF2;
  --root-bg:#1D3424;   --root-ink:#A8DDB1;
  --vowel-bg:#3A3117;  --vowel-ink:#EED78C;
  --suffix-bg:#43261B; --suffix-ink:#F4B59B;
  --success-bg:#16331F; --success:#8FD6A6;
  --error-bg:#3D1E19;   --error:#F4A493;
  --warning-bg:#3A2D10; --warning:#F0C766;
  --info-bg:#172A3D;    --info:#9CC4EC;
  --hero-bg:#1E2A23; --hero-fade:#1E2A2300;
}
```

**Rules:**
- No raw hex values outside the token block.
- Support `data-theme="system"`, which follows `prefers-color-scheme`. The theme toggle cycles **Light → Dark → System**, and the default is System.
- Use `color-scheme: light dark` so scrollbars and form controls match.
- Set `<meta name="theme-color">` for both schemes.
- Write a tiny script (or test) that checks every text/background token pair at 4.5:1 or above, and UI borders and icons at 3:1 or above.

### 5.2 Typography

Replace the single-weight fonts with **variable fonts, subset to Latin, Latin-1, Latin Extended-A, IPA, arrows and general punctuation, embedded as WOFF2 (base64)**. Target 150 KB or less for all fonts combined.

| Role | Font (SIL OFL) | Use |
|---|---|---|
| Display / editorial | **Fraunces** (variable: wght 400–600, opsz, SOFT) or Newsreader | Page titles, hero, term names, quotes |
| UI / body | **Inter** (variable 400–700) or Geist | Everything else |
| Mono (optional, can use system mono) | `ui-monospace, SFMono-Regular, Menlo, monospace` | ⌘K hints, codes such as ICD-10-AM |

Enable `font-feature-settings: "ss01","cv11"` for Inter if it looks better, and use `font-variant-numeric: tabular-nums` for all stats, timers and counts.

**Type scale (base 16px; fluid with `clamp`; nothing below 12px anywhere):**

| Token | Size | Line height | Weight / font | Tracking |
|---|---|---|---|---|
| `--t-display` | clamp(2.75rem, 1.9rem + 3.2vw, 4.5rem) | 1.04 | Fraunces 500 | -0.025em |
| `--t-h1` | clamp(2.125rem, 1.7rem + 1.8vw, 3.25rem) | 1.08 | Fraunces 500 | -0.02em |
| `--t-h2` | clamp(1.625rem, 1.4rem + 0.9vw, 2.125rem) | 1.15 | Fraunces 500 | -0.015em |
| `--t-h3` | 1.375rem (22px) | 1.25 | Fraunces 500 | -0.01em |
| `--t-title` | 1.125rem (18px) | 1.35 | Inter 600 | -0.005em |
| `--t-body-lg` | 1.125rem (18px) | 1.6 | Inter 400 | 0 |
| `--t-body` | 1rem (16px) | 1.6 | Inter 400 | 0 |
| `--t-body-sm` | 0.875rem (14px) | 1.5 | Inter 400/500 | 0 |
| `--t-caption` | 0.8125rem (13px) | 1.45 | Inter 500 | 0.005em |
| `--t-overline` | 0.75rem (12px) | 1.3 | Inter 600 uppercase | 0.08em |

**Rules:**
- Body text is `--ink` or `--ink-2`; meta text is `--ink-3`. Never lighter.
- Inputs are 16px minimum, which prevents iOS zoom.
- Reading containers are `max-width: 68ch`.
- Use `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs. This fixes orphans such as "of".
- Delete the 473 scattered `font-size` declarations. Use only the scale tokens and utility classes. Media queries may *increase* sizes but never shrink below the scale.

### 5.3 Spacing, radius, elevation, layout

- **Spacing (4px grid):** `--s-1:4px --s-2:8px --s-3:12px --s-4:16px --s-5:20px --s-6:24px --s-8:32px --s-10:40px --s-12:48px --s-16:64px --s-20:80px`
- **Radius (replaces the 17 current values):** `--r-xs:6px --r-sm:10px --r-md:14px --r-lg:20px --r-xl:28px --r-pill:999px`. Cards use lg, buttons and inputs md, chips pill, sheets and modals xl.
- **Elevation (light):**
  - `--e1: 0 1px 2px rgb(20 40 30 / .06)`
  - `--e2: 0 4px 14px -4px rgb(20 40 30 / .10)`
  - `--e3: 0 14px 36px -10px rgb(20 40 30 / .16)`
  - `--e4: 0 28px 70px -16px rgb(10 25 18 / .30)`
  - In dark mode, rely on lighter surfaces plus a `1px` `--line` border and `inset 0 1px 0 rgb(255 255 255 / .04)` instead of dark shadows.
- **Breakpoints:** 480 / 768 / 1024 / 1280 / 1600. Prefer **container queries** for cards.
- **App shell:**
  - **1280px and wider:** expanded sidebar (264px) plus content (max 1240px, centred, 40px gutters)
  - **1024–1279px:** collapsible **icon rail** (76px) with tooltips; the user can pin it open
  - **Under 1024px:** sticky top bar plus a **bottom tab bar** (5 items, 64px plus safe-area inset) and the full nav in a sheet
  - Use `env(safe-area-inset-*)` everywhere and add `viewport-fit=cover` to the viewport meta.
- **Z-index scale:** base 0, sticky 10, rail 20, tabbar 30, dropdown 40, sheet/modal 50, toast 60, tooltip 70.

### 5.4 Iconography and imagery

- Replace every Unicode glyph icon with **inline SVG icons from one set** (Lucide, ISC licence, inlined as an SVG `<symbol>` sprite, about 40 icons). Use a 1.75px stroke, `currentColor`, and 20px in nav or 18px in buttons.
- Suggested mapping:

| Item | Icon |
|---|---|
| Home | `house` |
| Learn | `graduation-cap` |
| Library | `library` / `book-open` |
| Word elements | `puzzle` |
| Word lab | `flask-conical` |
| Practice | `zap` / `brain` |
| Progress | `chart-line` |
| Tools | `briefcase` |
| Search | `search` |
| Theme | `sun` / `moon` / `monitor` |
| Save | `bookmark` |
| Listen | `volume-2` |
| Mark familiar | `check-circle` |
| Close | `x` |
| External / next | `arrow-up-right` / `arrow-right` |

- **De-duplicate the images.** Store each image once in an `ASSETS` map and reference it everywhere.
- Re-encode images at 1200px wide, AVIF with a WebP fallback through `<picture>`, using `loading="lazy" decoding="async"` and explicit width/height. Target 70 KB or less each.
- **Give all 26 modules a visual identity without 26 photos.** Create a consistent set of **duotone SVG organ or concept glyphs** (simple line illustrations: bone, skin, drop, shield, gland, heart, lungs, stomach, brain, eye/ear, kidney, reproductive symbols, foetus, mind, cell, microbe, scan, pill, leaf, chart, plus "Aa" for word elements). Tint each with its course-area hue. Use the 3 photographic renders only as hero art.
- The logo currently says "WORDS INTO UNDERSTANDING" at 6.8px. Either drop the tagline from the sidebar or set it at 12px or larger.

### 5.5 Motion system

```css
--ease-standard:   cubic-bezier(.2, 0, 0, 1);
--ease-emphasized: cubic-bezier(.3, 0, 0, 1);
--ease-exit:       cubic-bezier(.3, 0, 1, 1);
--ease-spring:     linear(0, .55 15%, .9 30%, 1.04 45%, 1.01 60%, 1);  /* fallback: --ease-emphasized */
--dur-1: 120ms;  /* press, hover colour */
--dur-2: 200ms;  /* small UI: chips, toggles, tooltips */
--dur-3: 320ms;  /* cards, sheets, page content */
--dur-4: 480ms;  /* hero, celebrations, flips */
```

**Choreography to implement:**
- **Page transitions:** use the View Transitions API (`document.startViewTransition`) when available, cross-fading content plus an 8px rise. The active nav pill **morphs** between items (shared `view-transition-name`). Fall back to the existing `viewIn` keyframe.
- **Staggered entrances:** list and grid items fade up 12px, staggered 30ms each, maximum 8 items (the rest appear together).
- **Buttons:** hover lightens; press `scale(.97)` for 120ms. Cards lift `translateY(-2px)` and go from `--e1` to `--e3` on hover (pointer devices only, via `@media (hover:hover)`).
- **Word anatomy:**
  - When a term opens, its parts *separate*: chips slide apart with a spring and a `+` fades in between them
  - Tapping a part pops it (`scale 1 → 1.06 → 1`) and expands its meaning underneath with `grid-template-rows: 0fr → 1fr`
- **Quiz feedback:**
  - Correct: the option fills with `--success-bg`, a check icon **draws** (`stroke-dashoffset`), and a +1 floats up and fades
  - Wrong: a gentle horizontal shake (±6px, 3 cycles, 300ms) and the correct answer highlights
- **Flashcards:** a real 3D flip (`rotateY`, `backface-visibility`, 480ms) and swipe gestures on touch (right = Good, left = Again) with the card tilting while dragged.
- **Progress:** rings and bars animate from 0 on enter, and numbers **count up** (600ms, ease-out).
- **Celebrations:**
  - Session complete: a light confetti burst (canvas, about 80 particles in the brand palette, 1.2s)
  - Milestones: a soft radial glow behind the badge
  - Never more than one celebration per screen
- **Sheets and modals:** desktop modals scale `.98 → 1` and fade; mobile uses **bottom sheets** that slide up, with drag-to-dismiss and a backdrop blur (`backdrop-filter: blur(8px)`).
- **Toasts** slide up from the bottom-centre, stack, and offer an optional **Undo** (for unsave, reset or delete).
- **Skeletons** are not needed (all data is local). Instead, make the first paint instant and animate content in.
- **Reduced motion:** replace all transforms with opacity fades of 120ms or less. No confetti, no shake, no flip (cross-fade instead), no auto-advancing anything.

### 5.6 Component library (build once, reuse everywhere)

Build these as small render functions or web components, each with all states: default, hover, focus-visible, active, disabled, loading and selected.

- **Button:** `primary` (filled `--primary`), `secondary` (surface plus `--line-strong` border), `ghost`, `danger`. Sizes sm (36px), md (44px), lg (52px). Icon slots on either side; `aria-busy` state.
- **Icon button:** 44×44 hit area, tooltip on hover and focus.
- **Chip / Tag:** neutral, area-tinted and word-part variants; selectable filter chips with a check icon when active (`aria-pressed`).
- **WordPartChip:** shows text, a role label on hover or focus ("prefix · fast"), and the semantic colour pair. **This is the hero component.**
- **Card:** base, interactive (whole card is a link or button, with the inner heading as `<span>` styled as a heading, or an `<h3>` with a stretched link), media card, stat card.
- **Input / Search field:** 48px, leading icon, custom clear button (hide the native one with `::-webkit-search-cancel-button{appearance:none}`), helper and error text.
- **Select → Combobox:** searchable and keyboard accessible (ARIA 1.2 combobox pattern). Use it for chapter filter, word lab term picker and module filter.
- **Tabs:** an underline indicator that slides between tabs. On mobile, a horizontally scrollable tab bar with edge fades and auto-scroll of the active tab into view. ARIA tabs pattern with arrow-key navigation.
- **Segmented control:** for Prefix/Suffix, Light/Dark/System, and quiz length.
- **Progress:** linear bar, ring (SVG), step dots, plus a mastery bar segmented New / Learning / Familiar / Mastered.
- **Sheet / Modal:** native `<dialog>` with focus trap, return focus, `Esc`, outside click, and scroll lock. Bottom sheet below 768px.
- **Toast:** `role="status"` with optional action.
- **Empty state:** small illustration, one sentence, one button.
- **Tooltip, Kbd hint** (`⌘K`, `Space`, `←` `→`) and **Callout** (info, warning, disclaimer; quiet styling, not shouting peach blocks).
- **Command palette** (see §7.9).

---

## 6. Information architecture (simplify from 9 nav items to 6)

| New nav item | Route | Replaces / contains |
|---|---|---|
| **Today** (default landing) | `#today` | Old Overview (`#home`) plus the course banner, rebuilt as a daily dashboard |
| **Learn** | `#learn`, `#learn/module/:id/:tab` | Course modules plus foundation lessons; "Body systems" becomes a filter/view inside Learn |
| **Explore** | `#explore/terms`, `#explore/elements`, `#explore/lab` | Term library, Word elements, Word lab, "Easy to confuse" |
| **Practice** | `#practice` | Practice studio plus module exercises entry plus reviews |
| **Progress** | `#progress` | My progress plus course record |
| **Tools** | `#tools` | Teaching and study tools, references, export/import, settings |

**Rules:**
- **Keep the old hashes working:** map `#home → #today`, `#modules → #learn`, `#systems → #learn?view=systems`, `#library → #explore/terms`, `#affixes → #explore/elements`, `#wordlab → #explore/lab`, `#toolkit → #tools`, and `#module?id=…&tab=…` to the new module route.
- **Module numbering:** use one scheme. Display "**Chapter 9 · Cardiovascular system**" everywhere for chapter modules, and "**Word elements · Prefixes**" or "**Word elements · Suffixes**" for the two element modules (no number). Remove "MODULE 11".
- Breadcrumbs: `Learn / Body systems & clinical practice / Cardiovascular system`.
- The mobile bottom tab bar shows Today, Learn, Explore, Practice, Progress. Tools and Settings live in the profile sheet.

---

## 7. Screen-by-screen redesign

### 7.1 First run (new)

A 3-step onboarding sheet. It is skippable, and it is only shown when there is no stored data.
1. "What should we call you?" plus role chips (Student · Nurse · Allied health · Clinical coder · Educator · Other).
2. Daily goal: segmented 5 / 10 / 15 / 20 minutes (default 10).
3. Appearance: Light / Dark / System, plus Reduce motion.

Finish with a short animated preview (a term splitting into coloured parts) and the button "Start my first 5-minute session".

### 7.2 Today (default landing)

Layout, top to bottom:
1. **Greeting row:** "Good evening, Lilian." in the serif, with the local-time greeting. On the right: a **streak flame with its count** and a **daily goal ring** (minutes or cards done versus goal).
2. **Continue card** (primary, full width, area-tinted): "Continue · Chapter 9 Cardiovascular · Section 2 of 4". Shows a progress bar and the **Resume** button. If the user is new, it says "Start with Basic word structure".
3. **Two-up row:**
   - **Reviews due** (count, "≈4 min", **Review now**)
   - **Word of the day:** deterministic by date (`hash(today) % curatedTerms.length`), using **only the 95 richly curated terms** (those with parts or a real `plain` explanation). Shows anatomy chips, a listen button and a save button.
4. **Quick practice row:** three compact tiles (Meaning check · 5 Qs, Spell it · 5, Build a word · 5).
5. **Explore by body system:** a horizontal snap carousel of all 13 systems (SVG glyph, name, mastery %), not just 3.
6. **Quote:** keep it, smaller, rotating daily.

Remove the stacked double heroes. The big "The language of better care" hero becomes the **first-run and empty-state hero only**. Once the user has activity, Today is a dashboard.

**Mobile:** single column, the Continue card first, the hero image never overlapping text (image placed *above* the copy and cropped, or as a soft background with a solid copy panel).

### 7.3 Learn (course)

- **Header:** title, overall course progress ring (modules passed of 26), and the **Continue** button.
- **View switch** (segmented control): **Path** (default) · **Grid** · **Body systems**.
  - **Path view:** a vertical learning path grouped by the 5 course areas. Each module is a node with an SVG glyph, a status (Locked styling is *not* used; everything stays open, so show **Not started / In progress / Passed** with colour and icon), and a connecting line that fills as modules are passed. This gives a strong sense of journey.
  - **Grid view:** cleaned-up cards (see below).
  - **Body systems view:** replaces the old `#systems` page.
- **Module card:**
  - Area-tinted glyph tile at the top left; overline "CHAPTER 09"; title (H3 serif); one-line subtitle
  - Meta row with icons (100 terms · 5 outcomes · ~70 min)
  - A **mastery bar** in 4 segments, a status chip, and the whole card clickable
  - Remove the redundant "Open module →" text when the whole card is clickable (keep an arrow icon)
- Search plus an area filter as chips (not a native select). Show a sticky filter bar when scrolled.
- Move the "curriculum alignment pending" notice into a **quiet info callout**, collapsible, or into the Tools > Curriculum section with a small "i" link in the header.

### 7.4 Module workspace

- **Module hero:** area-tinted band with the large SVG glyph, a breadcrumb, a title, a subtitle, chips (terms, outcomes, time), a **progress ring** (outcomes ticked plus knowledge check), and actions: **primary "Continue"** plus a secondary "⋯ More", a menu holding Print learner pack, Educator guide and Export CSV.
- **Tabs:** sticky under the hero on scroll, with a sliding underline. Rename for brevity: **Overview · Outcomes · Terms · Practice · Classroom · Self-study · References.**
- **Overview tab:**
  - Sections as an **interactive stepper**, numbered 1–4 with check states. Expanding animates height.
  - Each section shows the reading text at 16px/1.6, term chips (WordPartChip when parts exist), and buttons "Practise this section" and "Classroom activity".
  - Right column (sticky): "Before you begin" checklist, reference and curriculum note. Below 1024px it collapses under the content.
- **Outcomes tab:** large checkable rows (44px or more) with a satisfying check animation. The evidence text sits in `--ink-2`. Show a summary ring at the top.
- **Terms tab:** sticky search with a category filter as chips (Structure, Condition, Symptom, Test, Procedure…). Offer a **list/grid toggle** (a dense list is better for 100 terms). Load progressively with "Show 24 more" or infinite scroll with an `IntersectionObserver`.
- **Practice tab:** exercise tiles with icon, title, a one-line "why", length, last score and best score. The **Knowledge check** is visually the primary tile (it gates "Passed"). Recent attempts appear as a compact table with relative dates ("2 days ago").
- **Classroom / Self-study:** activity cards with format chips (Pairs · 15 min), a "Done" toggle, and a notes field that autosaves with a "Saved" indicator.
- **Bottom pager:** "← Previous chapter / Next chapter →" as large cards with titles.

### 7.5 Explore: Terms (library)

- Sticky search (with debounced fuzzy matching across term, aliases, US/AU spelling variants and part meanings), plus chips for System, Category and Status (All, Saved, Familiar, To explore), plus a sort control (A–Z, Recently viewed, Weakest).
- **Alphabet jump rail** on desktop (A–Z) and **list virtualisation or windowed rendering** so all 1,480 terms can scroll smoothly. Keep "showing N of M".
- **Term card:**
  - Term (serif 22px), definition in 2 lines (`line-clamp`), and a system tag with its area tint
  - Inline **anatomy chips** when parts exist
  - A save toggle (icon button) and a mastery dot
  - The whole card opens the term sheet
- **Term sheet** (modal on desktop, bottom sheet on mobile):
  - **Header:** term, phonetic respelling if available, listen button, save and familiar toggles
  - **Anatomy:** WordPartChips with meanings, animating apart on open
  - **Meaning:** the definition in large text
  - **"In everyday words":** **show only if `plain !== definition`**
  - **"In a clinical note":** **hide the templated "In a fictional teaching glossary…" example** (detect with the regex `/^In a fictional teaching glossary/`) and replace it with nothing. Never repeat the definition.
  - **Note:** show only if it is not the generic "Concise companion definition…" text. Show the generic disclaimer once as a small footer line instead.
  - **Related terms:** same chapter, preferring shared parts or category.
  - **Disambiguation:** if another term has the same name (for example "Absorption"), show "Also in: Pharmacology".
  - Actions: **Practise this word** (adds it to the next review) and **Open in Word lab**.

### 7.6 Explore: Word elements

- A segmented control (Prefixes · Suffixes), a tier filter as chips and search.
- Show items as **colour-coded tiles** (prefix lavender, suffix peach) with the form in large mono or serif text, the meaning and an example term. The example term is clickable when it exists in `TERMS`.
- The element sheet shows **"Terms in MedLex that use this element"**, computed by matching `parts` and term text, so elements connect to real words.
- Add a **"Opposites"** mini-section (hyper/hypo, tachy/brady, pre/post, endo/exo…) with paired tiles.

### 7.7 Explore: Word lab

- Replace the native `<select>` with the **searchable combobox** plus "Random word" (dice icon) plus previous/next arrows.
- **Large animated anatomy stage:** the full word appears, then splits into coloured parts with a spring. Tapping a part reveals its role and meaning in a card below (no modal). Add a visible legend with real 12px dots and labels, or better, label each chip directly ("prefix") under the chip.
- **New "Build a word" mode:** given a definition, the user taps part tiles from a shuffled tray to assemble the term. Correct order snaps with a spring; a wrong tile shakes back. Use only the 75 curated decomposed terms, plus prefix/suffix banks for distractor tiles.
- Keep the "4-step decoding ritual" as a compact horizontal stepper and the "Easy to confuse" comparison cards. Turn the compare modal into an animated **side-by-side split** with the differing word part highlighted.

### 7.8 Practice

- **Hero:** "Today's session" with one button that builds a **mixed 10-item session**: due reviews first, then new terms from the current module, then 1–2 confusable pairs. Shows ≈ minutes.
- Mode tiles: Meaning check · In clinical context · Recall cards · Spelling · Build a word · Match pairs (new) · Listen and spell (new, uses TTS).
- **Question screen (shared by all quiz types):**
  - **Header:** a close (×) with a confirm-on-exit sheet if there is progress, a segmented progress bar (one segment per question, coloured by result), and a streak-in-session counter.
  - **Prompt** in serif at 26–30px. Options are 56px or taller with the keyboard letter shown (A–D) and full-width on mobile.
  - **Feedback panel** slides up from the bottom (green or red tint) with the explanation, "Explore this word" and a big **Continue** button. Pressing Enter continues.
- **Better distractors:** choose 3 distractors from the **same chapter first, then the same category**, with similar definition length (±40%), never a duplicate text, and never a definition containing the target term. Fall back to the global pool only if there are fewer than 3.
- **Session summary screen (new):**
  - Score ring (count-up), accuracy, time and XP earned
  - A "Words to revisit" list with one-tap "Add all to review"
  - Streak update animation and a confetti burst if the score is 80% or higher or the goal is met
  - Buttons: "Practise mistakes" · "Back to Today"
- **Recall cards:**
  - Sessions of **20 cards maximum** ("Card 3 of 20"; never "of 1480")
  - A flip animation
  - **4 rating buttons: Again · Hard · Good · Easy**, keys 1–4, swipe on mobile, each showing the next interval ("<1 min", "1 d", "3 d", "8 d")

### 7.9 Search / Command palette (⌘K, `/`, and the top-bar search)

- Centered on desktop, full-screen sheet on mobile. Results are **grouped**: Terms · Word elements · Modules · Lessons · Actions (for example "Toggle dark mode", "Start today's session", "Export my progress").
- Fuzzy matching (simple scored subsequence plus prefix boost, tolerant of AU/US spelling via the existing variant mapping). Highlight the matched characters. Arrow keys plus Enter; `Tab` cycles groups.
- Empty state: **Recent searches** (last 8, stored) plus suggested terms.
- Hide the native search clear button and use a custom one.

### 7.10 Progress

- **Top stats row** (count-up numbers in tabular figures): Day streak · Minutes this week · Terms mastered · Accuracy (30 days).
- **Activity heatmap:** a GitHub-style calendar of the last 26 weeks from `visits` (plus minutes if tracked), with tooltips.
- **Mastery by body system:** horizontal stacked bars (New / Learning / Familiar / Mastered) for the 13 systems plus others, sorted by progress, each clickable into the module.
- **Accuracy trend:** a sparkline of the last 20 sessions.
- **Weakest words:** the top 10 by lapses, with "Review these".
- **Milestones / badges** (tasteful, monochrome line badges that fill with colour when earned): First session, 7-day streak, 30-day streak, 100 terms familiar, First knowledge check passed, All foundations passed, 1,000 reviews, and so on.
- Keep the course record (knowledge checks passed of 26), export, and the "stored on this device" note.

### 7.11 Tools (teaching and study)

Sections as cards with clear headings:
- **Study plan:** date picker, minutes segmented control, a generated timeline with "Add to calendar (.ics)" export (new, client-side generated)
- **Curriculum mapping:** the same features, with a better table layout and autosave indicator
- **Print packs**
- **Backup & restore:** export, import with a preview diff, and reset with typed confirmation
- **References**
- **Settings:** name, role, daily goal, theme, reduce motion, TTS voice and speed (populate from `speechSynthesis.getVoices()` filtered to English), text size (Default / Large / Larger, scaling the root font-size 100% / 112.5% / 125%), and a **high-contrast** toggle

---

## 8. Functional fixes and new features (implementation detail)

### 8.1 State, storage, migration

```js
// medlex-v3 shape
{
  schemaVersion: 3,
  profile: { name, role, dailyGoalMin: 10, theme: 'system', reducedMotion: null, textScale: 1, highContrast: false, ttsVoice: null, ttsRate: 0.85 },
  terms:   { [termId]: { saved, familiar, srs: { due, interval, ease, reps, lapses, last }, views, lastViewed } },
  lessons: number[],
  sessions: [{ id, date, mode, module, score, total, durationMs, items:[{termId, correct}] }],  // cap 500
  activity: { [YYYY-MM-DD]: { minutes, items } },   // from old visits[] → { minutes:0, items:0 }
  course:  { outcomes, activities, attempts, notes, mapping, last, planMinutes, planStart },  // copied from v2
  search:  { recent: [] },
  achievements: { [id]: dateEarned }
}
```

- Write a `migrate()` function with unit tests:
  - `saved[]` and `learned[]` become `terms[id].saved` and `familiar`
  - `reviews{reps,due,last}` becomes `srs` with `interval = [0,1,3,7][reps]` days and `ease = 2.5`
  - `history[]` becomes `sessions[]`
  - `visits[]` becomes `activity`
  - the v2 course object is copied verbatim
- One debounced `save()` (250ms) with try/catch and the existing storage-unavailable toast.
- Export v3; import v2 or v3 (reuse and extend the existing `validateImport`, which is good: keep its strict validation and its 3 MB limit).

### 8.2 Spaced repetition (SM-2-lite)

- Ratings: Again (1) · Hard (2) · Good (3) · Easy (4).
- `Again`: `reps = 0`, `lapses++`, `interval = 10 min`, `ease = max(1.3, ease − 0.2)`.
- `Hard`: `interval = max(1d, interval × 1.2)`, `ease −= 0.15`.
- `Good`: `interval = reps==0 ? 1d : reps==1 ? 3d : interval × ease`.
- `Easy`: `interval = (Good interval) × 1.3`, `ease += 0.15`.
- Add ±5% fuzz, cap at 180 days.
- **Mastery levels** (used everywhere): New (never seen) · Learning (interval under 3d) · Familiar (3–20d, or manually marked) · Mastered (interval of 21d or more). The manual "Mark as familiar" button keeps working.

### 8.3 Content quality handling (no invented medicine)

- Hide duplicated or templated fields as described in §7.5.
- *Optional, behind a setting that is **off** by default:* "Show suggested word-part hints". For terms without curated `parts`, detect **exact** prefix and suffix matches from `PREFIXES` / `SUFFIXES` at the start and end of the term. Display them with a dashed outline and the label "Suggested split, verify in your reference". Never use them in graded questions.
- Produce a `CONTENT_BACKLOG.md` listing the 1,385 terms missing plain-language text, real examples and parts, grouped by chapter, for a human medical editor.

### 8.4 Habit loop

- **Activity tracking:** count active minutes (a visible tab plus interaction in the last 60s) and items answered, per day.
- **Streak:** consecutive days with 1 or more completed item or 2 or more active minutes. Show it on Today and Progress. Celebrate at 3, 7, 14, 30, 60 and 100 days.
- **Daily goal ring:** minutes or items toward the goal. When the goal is met, give a gentle celebration once per day.
- **XP:** optional, subtle. 10 per correct answer, 5 per review, and 50 per knowledge check passed. Show it only on summaries and Progress.

### 8.5 Pronunciation and audio

- Keep TTS. Add voice selection (English voices; prefer en-AU, then en-GB, then en-US), a speed slider (0.6–1.1) and an animated "playing" state on the button.
- If `TERMS` has no pronunciation data, show only the listen button (no fake IPA).

### 8.6 Small but important

- Word of the day rotates daily (see §7.2).
- The flashcard "all" mode becomes "20 random unseen or weak cards".
- "Unsave" and "Reset" show an **Undo** toast (5s).
- Confirm before leaving an in-progress quiz (sheet, not `confirm()`).
- Keyboard shortcuts are discoverable with `?` (opens a shortcuts sheet).
- Remember the last tab, filters and scroll position per page (sessionStorage or state).
- Relative dates ("2 days ago") with absolute dates in a tooltip.
- `document.title` updates per route ("Cardiovascular system · MedLex").
- Add a web app manifest (inlined as a data URI) plus an apple-touch-icon so it can be installed to a home screen. A service worker is not possible from `file://`; skip it, or register it only when served over https.

---

## 9. Code architecture refactor

1. **Remove all monkey-patching.** Create a single router (`routes` table: pattern, render function, title, nav key), a single store (`getState`, `setState(patch)`, `subscribe`) and a single event delegation layer (`data-action` attributes handled in one `click` / `input` / `change` / `submit` / `keydown` handler each).
2. **Organise source as modules** (if using a build step): `data/` (terms, affixes, chapters, lessons, cases…), `core/` (store, router, migrate, srs, search, tts, a11y helpers), `ui/` (components), `pages/` (today, learn, module, explore-terms, explore-elements, lab, practice, session, progress, tools), `styles/` (tokens.css, base.css, components.css, pages.css, motion.css, print.css). Bundle to one HTML file.
3. **Templating:** keep tagged-template rendering but always escape through `esc()` (it exists; use it consistently, because some term names are inserted unescaped, for example `${t.term}` in `openTerm`). Patch lists instead of re-rendering whole pages where cheap (filters, search results).
4. **No inline `style=""`**: use classes or CSS variables.
5. **CSS:** layers (`@layer reset, tokens, base, components, pages, utilities, motion`), logical properties (`margin-inline`, `padding-block`), container queries for cards, and `:focus-visible` rings on every interactive element (`outline: 3px solid var(--focus); outline-offset: 3px; border-radius: inherit`). Remove all `!important` except in reduced-motion and print.
6. **Data at startup:** keep `TERMS` as a JSON string inside a `<script type="application/json">` and parse once. Build a search index (lower-cased, AU/US-normalised strings) lazily on the first search.
7. **Performance budget:** total file 1.0 MB or less (currently 2.04 MB). First render within 300ms on a mid-range laptop. Interaction-to-next-paint under 100ms when typing in search (debounce 80ms, render 60 or fewer items at once or virtualise). Keep CLS at 0 by setting image dimensions.

---

## 10. Accessibility checklist (WCAG 2.2 AA)

- [ ] Contrast at or above 4.5:1 for all text (3:1 for large text, UI borders and icons) in light, dark and high-contrast modes
- [ ] All interactive targets 44×44 or larger on touch (and 24×24 or larger at minimum everywhere)
- [ ] Visible `:focus-visible` on everything; logical tab order; skip link kept
- [ ] Headings in order (one `<h1>` per page; cards must not put `<h3>` inside `<button>`. Use a stretched-link pattern or `<span class="card-title">`)
- [ ] Landmarks: `<header>`, `<nav aria-label="Main">`, `<main>`, a unique `aria-label` on each `<aside>`, `<footer>`
- [ ] ARIA patterns: tabs, combobox, dialog (`aria-modal`), menu, switch, `aria-pressed` toggles, `aria-current="page"` on nav
- [ ] Quiz feedback announced through `aria-live="polite"`; progress described ("Question 3 of 10")
- [ ] Colour is never the only signal (word-part chips also carry a text label; correct and wrong states also carry icons)
- [ ] Respect `prefers-reduced-motion`, `prefers-contrast: more`, and `forced-colors: active`
- [ ] Zoom to 200% and a 320px viewport with no horizontal scroll and no clipped text
- [ ] Text-size setting scales the whole UI through `rem`
- [ ] `lang="en-AU"` on `<html>`
- [ ] axe-core run on every route in both themes returns **0 serious or critical violations**

---

## 11. Execution plan (work in this order; commit after each phase with a short changelog)

1. **Phase 0: safety net.** Snapshot the current file. Write a Playwright smoke test that visits every route and exercises save, quiz, flashcards, spelling, export/import, print pack and theme toggle, so regressions are caught. Add the migration with tests.
2. **Phase 1: foundations.** Tokens (colour, type, spacing, radius, elevation, motion), new fonts (subset WOFF2), SVG icon sprite, base and reset styles, focus styles, dark/system theme. Remove all hard-coded colours. *Exit check:* axe contrast is clean on all existing pages.
3. **Phase 2: architecture.** Single router with legacy hash redirects, store, event delegation; remove monkey-patches; de-duplicate images.
4. **Phase 3: shell and navigation.** New 6-item IA, sidebar / rail / bottom tab bar, mobile sheet nav, top bar, command palette, toasts with undo, View Transitions.
5. **Phase 4: component library.** All components from §5.6 with states; a hidden `#__styleguide` route showing every component in both themes (used for QA, not linked in nav).
6. **Phase 5: screens.** Today, Learn, Module workspace, Explore (terms, elements, lab), Practice plus the session engine, Progress, Tools, First run.
7. **Phase 6: engagement.** SRS v2, mastery levels, streaks, goal ring, session summary, achievements, celebrations, better distractors, Build-a-word, Match pairs, Listen and spell.
8. **Phase 7: polish.** Motion choreography, empty states, micro-copy pass, print stylesheet re-check, performance budget, final axe and Lighthouse pass, cross-browser check (Chrome, Safari, Firefox; iOS Safari and Android Chrome).

---

## 12. Acceptance criteria (definition of done)

**Visual and design**
- [ ] No text under 12px anywhere; body text is 16px; meta text is 13px or larger and `--ink-3` or darker
- [ ] Only token colours in CSS (a grep for `#[0-9a-f]{3,8}` outside the token block returns 0)
- [ ] 6 radius values, 4 elevations, one icon set, two font families (plus system mono)
- [ ] Dark mode has no light "islands"; System theme follows the OS live
- [ ] Every page looks intentional at 360, 390, 768, 1024, 1280, 1440 and 1920px widths

**Functional**
- [ ] Existing users' saved words, familiar terms, reviews, lessons, history, visits, course attempts, notes, outcomes and mapping all appear after upgrade (migration tests pass)
- [ ] v2 export files import correctly; v3 export/import round-trips exactly
- [ ] All legacy hashes redirect to the right new screen
- [ ] Module numbering is consistent (no "Module 11 / Chapter 09" conflict)
- [ ] Word of the day changes daily; flashcard sessions are 20 cards or fewer; quiz distractors come from the same chapter or category
- [ ] Term sheet never shows the same sentence twice and never shows the templated "fictional teaching glossary" example
- [ ] Streak, daily goal, session summary and achievements work and persist
- [ ] Print packs, CSV exports, study plan, curriculum mapping and TTS all still work

**Accessibility and performance**
- [ ] axe-core: 0 serious or critical issues on every route, both themes
- [ ] Full keyboard operation of every feature; screen-reader labels on all icon buttons
- [ ] Reduced motion removes all transforms, confetti, shake and flips
- [ ] File size 1.0 MB or less; no console errors or warnings; works offline from `file://`
- [ ] Lighthouse (served locally): Performance 95 or higher, Accessibility 100, Best Practices 100

---

## 13. Deliverables

1. `MedLex.html`: the single-file, offline app.
2. `src/` (if you used a build step) plus `README.md` with build and run instructions.
3. `CHANGELOG.md`: what changed per phase, including before/after screenshots of Today, Learn, a module, Explore terms, Practice session, Progress and Tools, in light and dark, at desktop and mobile sizes.
4. `CONTENT_BACKLOG.md`: the terms that need human medical-editor enrichment (see §8.3).
5. `tests/`: Playwright smoke tests, migration unit tests and the axe audit script.

When you finish, report: the file size before and after, the axe results before and after, any feature you could not preserve (there should be none) and any judgement calls you made.
