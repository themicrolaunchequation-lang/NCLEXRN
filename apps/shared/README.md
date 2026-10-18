# Shared HCA shell and "My Day" system

`hca-shell.css` + `hca-shell.js` are the common layer for MedLex, Carecraft, Serein and Lumen
(Evinca lives in another repo). They are appended by each app's build, never edited in `site/`.

* **Shell** – `HCAShell.init(cfg)` turns an app's existing sidebar, top bar and mobile tabs into the navy shell
  (rail toggle stored in `localStorage` as `<app>.rail`, Crown apps switcher, account dock, theme/motion sync).
* **My Day** – `HCAShell.day(spec)` builds the bento home (hero, progress ring, three action cards, path card, side card).
  Apps supply content and a 3D hero object; the grid, motion and states are shared.
* Rules: no `!important`, no inline scripts, no external fonts or CDNs (CSP). Motion uses transform/opacity
  (the progress ring draws with `stroke-dashoffset`) and is off under `prefers-reduced-motion` and each app's own
  reduced-motion / "Pause motion" setting (`html[data-hs-motion=off]`).
* Per-app wiring: `apps/medlex/src/day.*`, `apps/carecraft/src/v4/home.js` + `day.css`, `apps/serein/src/day.*`,
  `apps/lumen/src/day.*`.
* Tools: `node apps/tools/serve-site.mjs` (vercel.json-faithful preview), `shot.mjs` (Playwright screenshots),
  `audit-space.mjs` (dead-space report).

# Learning Studio (`hca-studio.js` + `hca-studio.css`)

A slide-journey player with an annotation layer, shared by Carecraft (lessons) and MedLex (modules).
`HCAStudio.open(deck, opts)` returns a controller; `HCAStudio.progress(app, id)` reads saved progress
(`localStorage` key `<app>.studio.v1.<deckId>`: position, answers, reflections, notes, ink, tool choices).

* **Canvas** – slides are authored on a fixed logical canvas (1280×720 landscape, 640×1000 portrait) and scaled with a
  transform, so type and ink stay in proportion on any screen. A slide that overflows steps down in size (CSS `zoom`).
* **Slide types** – `cover`, `idea`, `notes`, `terms` (flip cards), `visual` (infographic spotlight tour), `compare`
  (reveal; `neutral` for look-alike words), `check` (multiple choice with rationales), `reflect`, `recap`.
* **Infographics** – the `visual` slide frames one region of a poster at a time (`regions: [{label, text, rect:[x,y,w,h]}]`,
  fractions of the image), dims the rest, adds zoom, pan, fit, a text transcript and "save this view as PNG" (ink included).
  Ink is stored per view, so marks stay on what they were drawn on.
* **Tools** – pen, marker, highlighter, eraser, shapes (arrow, line, box, circle), text notes, laser pointer; undo/redo per
  slide, hide marks, clear slide (with undo toast), clear all (with confirmation). Keys: `A` tools, `P M H E S T L V` tools,
  arrows/space move, `G` overview, `N` notes, `F` full screen, `Esc` closes. Notes export as Markdown.
* **Deck callbacks** – `onCheck(slide, choice, correct)`, `onReflect(slide, rf)`, `canFinish(summary)`, `onComplete(summary)` (may
  return a message), `onClose(progress)`. Saved answers are matched by option text, so a reshuffled order never changes them.
* **Host isolation** – the studio is a modal dialog: the rest of the page is `inert`, its keyboard shortcuts are captured before
  the host app sees them, and it uses `div`s (not `main`/`header`/`aside`) so app element selectors cannot restyle it.
* **Carecraft** – `src/v4/studio.js` builds a 14-slide deck from the lesson, worked example, question bank and the three
  infographic pages; answers, reflection and the planned action are written to the same stores as the lesson page.
  Poster regions come from `apps/tools/poster-regions.py` (hero card, numbered blocks, takeaway) into `studio-regions.json`.
* **MedLex** – `src/studio-data.mjs` distils each module (sections, outcomes, classroom task, case, confusable pair, terms with
  their parts, poster) at build time; `src/studio.js` builds the deck and generates three checks with a seeded shuffle. Only
  the small `studio-entry.js` is in the shell bundle: the engine and data load on first use (`studio.<hash>.js`, also precached).
* Check it: `node apps/tools/serve-site.mjs` then `node apps/tools/studio-check.mjs` (drawing, undo/redo, persistence, poster
  tour, checks, axe on every slide, mobile touch targets, reduced motion) for both apps.
