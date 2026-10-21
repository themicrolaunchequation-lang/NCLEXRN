# Codex takeover brief (written 21 Oct 2026)

Claude's usage is running out. Codex takes over this repository until the owner says Claude is back. Read this whole file, then `docs/HANDOFF-2026-10-19.md` (rules, how to test), then `docs/CODEX-PROMPT-medlex-learn.md` (design brief).

## Authority and limits
You may, without asking: edit any source under `apps/`, `docs/`, `site/assets` and site config (`site/vercel.json`, `_headers`), run builds and tests, create branches, open pull requests, merge your own work into `work/serein-voice`, and publish to the live branch when the publishing rules below are met.

You must NOT, without the owner saying so in plain words in this chat:
- ask for, read out, store in files or paste anywhere any secret key (Supabase service-role key, Stripe keys, tokens);
- start the backend work: the `lumen-ai` entitlement change, Stripe checkout, billing portal, admin console, discount codes, or any Supabase migration or edge function;
- delete branches, force-push, or rewrite history on `work/serein-voice` or `claude/loving-ptolemy-srrq02`;
- change medical wording or meaning, or the legal text (company details, ICO number, privacy);
- edit generated output in `site/<app>/` by hand (always change sources and rebuild).

## Branches and publishing
- `claude/loving-ptolemy-srrq02` = LIVE. Vercel deploys it on every push. Only fast-forward pushes, only after the checks below pass.
- `work/serein-voice` = integration branch (everything Claude merged). Work on a branch from it (e.g. `codex/<topic>`), merge into it when your checks pass.
- Publish = verify, then fast-forward the live branch to the tested commit. Never force. Before pushing: `git fetch`, confirm the live branch is an ancestor of your commit.
- After every publish, tell the owner exactly what changed and what to look at on the live site, and remind them to hard-reload (Ctrl+Shift+R). MedLex keeps an offline copy, so old pages can show for a while.
- Commit small and push often. The previous work-saving rule was: commit and push at least every 30 minutes.

## State right now
Live (published): Lumen reader (rail auto-collapse, customisable toolbar, workspace storage panel, Promise.try shim, tour and Quick tour tab), MedLex lesson viewer fit, Word parts page and in-page studios, Visual Atlas flip book and fit fix, Learn cards, pop-up restyle, rendered artwork, Word parts speed and width, Supabase grants note in the plan.

Merged on `work/serein-voice` but NOT live: the slide design system (`apps/tools/medlex-slide-design.css`/`.js`, applied by `apps/tools/medlex-embed-fit.mjs`). It has not been tested as one combined build.

Open: draft PR #1 (`codex/medlex-learn-design`) was branched before the above and conflicts with it. Do not merge it as it is.

## Do these, in order
1. Rebase your PR #1 work onto `work/serein-voice` as a new branch `codex/medlex-rebase`. For each area (Learn cards, pop-ups, artwork, Word parts speed/width, slide design) keep whichever version is better, once, not both. Port over only genuinely new things.
2. Rebuild (`cd apps/medlex && node build-web.mjs`) and run every MedLex check: `medlex-lessons-check`, `studio-check`, `lib-check`, `atlas-poster-check`, `medlex-deck-audit` (all 29 decks 1920x940, plus `--dialogs-only` at 1558x839, 1366x650, 390x844), `wordparts-check --quick`, `medlex-lessons-axe` light and dark. Fix failures. (`studio-check` once failed an eraser check and passed on re-run: treat a single repeat as a flake, but note it.)
3. Look at screenshots (at least 12 slides of different types, Learn cards, three pop-ups, the three Word parts studios) at 1920x940 and 390x844, light and dark. Fix anything poor, overlapping, cut off or hard to read.
4. Known problems to fix: some slides lost numbers in source text (e.g. human-body slide 5: "0 standardised anatomical terms … Numbered terms in , 2nd ed."); generic or wrong term pictures (e.g. an "ICD 10" picture for "modifier"); long reference cards and tables with 5+ rows still scroll inside their card; small text at 1366x650 and on phones; four artwork assets still old icons (skin, brain, nail, hair); the new illustrations have not been checked for clinical accuracy (thyroid looks off): list them for a clinician rather than guessing.
5. Check Carecraft: its copy of the Learning Studio engine probably has the same bug as MedLex had. A site-wide `prefers-reduced-motion` rule sets `transform:none!important`, which cancels inline `style.transform` set by scripts (stage scaling, poster zoom, flips). MedLex's fix is in `apps/medlex/build-web.mjs` (rewrites the engine's `style.transform=` assignments to use `!important`). Test Carecraft with reduced motion on and fix the same way if broken.
6. When 1-5 pass, merge into `work/serein-voice`, publish to the live branch per the rules, and report to the owner.
7. Then ask the owner what next. Backlog candidates (owner decides): deck artwork for the 291 schematic diagrams; Lumen/Carecraft/Serein visual polish like MedLex got; accessibility pass on Carecraft/Serein; backend work only with owner approval and keys added by the owner in Supabase/Vercel settings.

## Dates and deadlines worth knowing
- From 30 Oct 2026 Supabase stops auto-granting API access to NEW tables in `public`. Existing tables are unaffected. Any new table migration must include explicit grants (see `docs/CROWN-SUITE-PLAN.md`).
- The owner received a Supabase notice about an old paused project `yzlrekjjvenxzpenyily` (not used by this code; the live apps use `ujeofxfbwivjmgrxqdcl`). That is the owner's dashboard decision.

## How things are built (short)
- `site/` is generated and deployed. Sources are `apps/<app>/` with `apps/<app>/build-web.mjs`.
- MedLex lessons: `apps/medlex/learn/*.html`. After changing lesson tooling run, in this order: `node apps/tools/medlex-embed-fit.mjs`, `node apps/tools/medlex-popups.mjs`, `node apps/tools/medlex-art.mjs apply`, then `cd apps/medlex && node build-web.mjs`. All are idempotent.
- Lumen: `cd apps/lumen && node build-web.mjs` (run from that folder). Overlays in `apps/lumen/src`. Full test `apps/tools/lumen-check.mjs` takes several minutes (369 checks at last run).
- Local test server: `node apps/tools/serve-site.mjs 8443`; tests use Playwright with Chromium and a host-resolver rule mapping `*.healthcarecrownacademy.co.uk` to the local server (see the handoff note).
- Never use `pkill -f` patterns that can match your own shell; kill by process id.

## Rules that always apply
UK English, WCAG AA, visible focus, 44px touch targets, reduced motion respected, no inline scripts (CSP `script-src 'self'`), calm tone. Report briefly in plain language after each finished item: what changed and what to check on the live site. If something is risky or unclear, stop and ask the owner.
