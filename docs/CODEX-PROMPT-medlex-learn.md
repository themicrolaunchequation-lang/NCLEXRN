# Prompt for Codex: MedLex Learn visual and UX upgrade

Copy everything below the line into Codex (environment: NCLEXRN, branch to start from: `claude/loving-ptolemy-srrq02`).

---

You are a senior product designer and front-end engineer. Do the work below to the highest professional, modern standard, as if shipping a premium medical-education product. Do only these tasks. Do not touch other apps.

## Ground rules (follow exactly)
- Work on a NEW branch `codex/medlex-learn-design`. Do not push to or change `claude/loving-ptolemy-srrq02`. Open a pull request when finished.
- Never ask me for secret keys and never add any to files.
- Read `docs/HANDOFF-2026-10-19.md` first. It explains how the repository works and how to test.
- `site/` is GENERATED. Never hand-edit it. Edit sources under `apps/`, then rebuild with `cd apps/medlex && node build-web.mjs`.
- UK English. WCAG AA contrast, visible keyboard focus, 44px touch targets on phones, respect reduced motion. Content security policy is `script-src 'self'`: no inline scripts or inline event handlers.
- Do not delete existing behaviour. Keep all existing tests passing and extend them.

## Where things live
- The 29 lesson decks: `apps/medlex/learn/*.html` (each is a 1280x720 slide stage scaled to fit). Shared images are in `apps/medlex/learn/shared/img` (webp), shared scripts in `shared/js`.
- Lessons are shown inside the lesson viewer iframe. `apps/tools/medlex-embed-fit.mjs` is the single source of the viewer-only CSS and script patches (rules scoped to `html.hca-embed`). Extend it; it is idempotent. The processor is `apps/tools/medlex-process-lessons.mjs`.
- The Learn page cards and the viewer: `apps/medlex/src/studio-entry.js`, `apps/medlex/src/studio.css`.
- Word parts page: `apps/medlex/src/lib/quests.js`, styles `.wp-*` in `studio.css`. The three studios are `apps/medlex/learn/quest-prefixes.html`, `quest-roots.html`, `quest-suffixes.html`, shown in an in-page frame sized by `quests.js` and `shared/js/quest-embed.js`.
- Tests: `apps/tools/medlex-lessons-check.mjs`, `medlex-lessons-axe.mjs`, `medlex-deck-audit.mjs` (finds overlaps, clipping, off-screen controls), `wordparts-check.mjs`, `lib-check.mjs`, `studio-check.mjs`. Serve with `node apps/tools/serve-site.mjs 8443`. Use Playwright with Chromium and the host-resolver rule from the handoff note.

## Tasks

### 1. Learn page cards ("Foundations & word elements" list)
The lesson cards look poor and inconsistent: oversized, uneven layouts, tiny "New" and "Lesson" chips, a cramped "Reopen the lesson" button that wraps to two lines, narrow text columns with a lot of dead space, and some cards (such as Basic word structure) different in structure from the others. Redesign the cards as a modern, consistent, scannable set:
- One clear hierarchy: lesson number, title, one-line purpose, slide count and time, status and a single clear primary button ("Start", "Continue", "Review") that never wraps.
- A proper progress indicator, a tasteful illustration or thumbnail per lesson, even card heights, an adaptive responsive grid (1, 2 or 3 columns) with generous but efficient spacing.
- Good empty, in-progress and done states. Works in light and dark.

### 2. Slides inside every lesson: modern design, real images, clarity
Scan EVERY slide of EVERY deck (all 29, plus the interactive widgets: reveal, predict, detail panels, flash cards, quizzes) and redesign them to a modern, premium standard:
- Many slides are poorly designed: for example the "Learning journey and outcomes" slide is four large mostly empty boxes with a small run-on line of text and a stray symbol, and the "One word. Three clinical clues." slide has tiny images and small text. Replace weak layouts with well-structured ones: clear typographic hierarchy, short lines, real card structure (label, key term, meaning, example), consistent spacing and a coherent colour system that matches the app.
- Raise clarity: body text readable at the viewer size, strong contrast, key terms emphasised. Use the "Try it: tap each part" card (tachy, card, ia with coloured chips and a decode sentence) as the standard of clarity to match.
- Space utilisation: remove icons, labels, symbols and decorations that carry no meaning or only occupy space. Let useful content (text and images) use the freed room. Use the big, clear image-led layout of the "Visual study key" pop-up (large picture, short heading, concise caption) as the model for image areas.
- Images: replace the flat SVG or icon-style illustrations (Health Icons style) with real, high-quality images. If you can generate images, create proper illustrations or photoreal medical-education images. If not, build them as designed HTML/CSS scenes and render them to crisp raster files (WebP or PNG at 2x, a sensible size budget) with headless Chromium, so they are real images and not inline SVG. Every image needs meaningful alt text. Keep file sizes sensible (aim for each deck's images to load fast).
- Do not change the medical content or its meaning. Keep sources and attributions. If you are unsure whether a fact is right, leave the text as it is and list it for me.
- Keep slides fitting the 1280x720 stage with no overlaps or clipping. Run `apps/tools/medlex-deck-audit.mjs` and aim for zero issues.

### 3. Pop-up screens
Reading view, Illustrated terms, Visual study key and other pop-ups look pale and low-contrast. Redesign them: stronger contrast, clear title bar, larger readable text, bigger images, better use of space, clear close button and focus handling, in light and dark.

### 4. Word parts (Prefixes, Roots, Suffixes)
- The three studio pages are slow to open after pressing Prefixes, Roots or Suffixes. Find out why (frame load, large scripts, many images, fonts, layout work) with measurements, then make them open fast. Examples: preload or prefetch, lazy-load images and below-the-fold content, defer non-critical script, skeleton screen while loading, avoid doing the work twice. Report before and after load times.
- When a studio is open, make the content wider so it uses the available width, with sensible limits for very wide screens. Check the studio pop-ups still fit.

## How to check your work
- Rebuild, serve, and click through every deck and every Word parts studio at 1920x940, 1440x800, 1024x700 and a phone (390x844), in light and dark.
- Take before and after screenshots of at least 12 representative slides, the Learn cards, three pop-ups and the three studios, and put them in the pull request.
- Run all the tests listed above and fix anything you break.
- In the pull request, say honestly what you did not finish or could not verify.

## Do not
- Change other apps (Carecraft, Serein, Lumen, home site).
- Change medical wording or meaning.
- Edit `site/` by hand.
- Remove accessibility features.
