# Lumen: clinical study studio

Lumen is the Healthcare Crown Academy study app: a local-first reader, notes and spaced-recall tool, shipped as a single HTML file. If you deliver it through Evinca's **Learn & tools** page, upload the file in `dist/` on the Evinca Admin page.

| Path | What it is |
|---|---|
| `dist/Lumen-clinical-study-studio.html` | **The app to upload** (13.0 MB): the original build plus the v3, v4, v5 and v6 layers. |
| `src/hca-v3.js`, `src/hca-v3.css` | v3 layer: Today's plan, command palette, shortcuts, adaptive (FSRS) scheduling, progress insights, goal dialog, phone fixes. |
| `src/hca-v4.js`, `src/hca-v4.css` | v4 layer: IndexedDB storage, decluttered pages, consistent controls, NCLEX tags and categories, practice set, exam week, Hard rating, resurfaced highlights, reader keys. |
| `src/hca-v5.js`, `src/hca-v5.css` | v5 layer: AI with your own keys and automatic fallback, every question type, question bank, rebuilt Page studio. |
| `src/hca-v6.js`, `src/hca-v6.css` | v6 layer: Academy AI. Members sign in with their Evinca account and use the Academy's AI with no key. |
| `supabase/` | The `lumen-ai` Edge Function and its migration (daily allowances, a shared answer store). **Not deployed yet**; see `ACADEMY_AI.md`. |
| `tools/build.mjs` | Injects the layers, applies a few exact patches inside the bundle, and compresses the OCR engine. Safe to re-run on its own output. |
| `tests/smoke.mjs` | Headless-browser smoke test: 17 checks, including OCR, Academy AI sign-in and fallback to a learner's key (both mocked), at desktop width and on 360, 390 and 414px phones. |
| `tests/academy-ai.test.mjs` | Unit tests for the Edge Function: sign-in, levels, allowances, ceiling, fallback, refund, cache. Run with `node --test`. |
| `ACADEMY_AI.md` | Why Academy AI suits 500+ members, what it costs, and the setup steps. |
| `FREE_AI_PROVIDERS.md` | Free AI providers, their limits and privacy terms, and how Lumen falls back between them. |
| `ICON_LIBRARY_PROMPT.md` | Design for the clinical sticker library and a research prompt for 300 openly licensed icons. |
| `CHANGELOG.md` | What changed in each round, and how it was tested. |
| `IMPROVEMENT_PLAN.md` | Review findings, comparison with similar apps, what is done, and what is left. |
| `CHATGPT_PROMPT.md` | Brief for the next round of work (v6). |

## Rebuild and test after editing a layer

```sh
node lumen/tools/build.mjs lumen/dist/Lumen-clinical-study-studio.html
node lumen/tests/smoke.mjs
node --test lumen/tests/academy-ai.test.mjs
```

With one argument, the build overwrites `dist/Lumen-clinical-study-studio.html`. Pass a second path to write somewhere else. The smoke test needs Playwright with Chromium.

If any patch can no longer find its text (for example, after the original bundle is rebuilt), the build stops and names the patch.

## Compatibility
- **Existing workspaces move over automatically.** On first load, a workspace saved in the browser's localStorage moves to IndexedDB (`lumen.workspace.v4`). A copy is still kept in localStorage while it fits, so older versions of the file keep working.
- **New data is stored under optional keys**, so older backups restore normally:
  - `tags`, `fsrs` and `lapses` on cards
  - `tags` on notes
  - `hcaGoals`, `hcaOnboard`, `hcaNgnLog` and `hcaResurface`
  - `settings.hcaScheduler` and `settings.hcaHero`
- **Backups now include the Hard rating.** The restore check was updated to accept it.
- **OCR works offline**, whether the file is opened from your computer or served from a website.
- **AI keys are kept apart from the workspace** (IndexedDB key `ai`, or the browser session only). They are never included in backups. New optional data: `hcaQuestionBank`.
- **The Academy AI sign-in is stored the same way** (IndexedDB key `academy`, or the browser session only), never in backups.
