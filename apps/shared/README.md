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
