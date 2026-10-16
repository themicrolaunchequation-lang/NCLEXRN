# Lumen: clinical study studio

Lumen is the Healthcare Crown Academy study app: a local-first reader, notes and spaced-recall tool, shipped as a single HTML file. If you deliver it through Evinca's **Learn & tools** page, upload the file in `dist/` on the Evinca Admin page.

| Path | What it is |
|---|---|
| `dist/Lumen-clinical-study-studio.html` | **The app to upload** (12.9 MB): the original build plus the v3 and v4 layers. |
| `src/hca-v3.js`, `src/hca-v3.css` | v3 layer: Today's plan, command palette, shortcuts, adaptive (FSRS) scheduling, progress insights, goal dialog, phone fixes. |
| `src/hca-v4.js`, `src/hca-v4.css` | v4 layer: IndexedDB storage, decluttered pages, consistent controls, NCLEX tags and categories, practice set, exam week, Hard rating, resurfaced highlights, reader keys. |
| `tools/build.mjs` | Injects the layers, applies a few exact patches inside the bundle, and compresses the OCR engine. Safe to re-run on its own output. |
| `tests/smoke.mjs` | Headless-browser smoke test: 13 checks, including OCR, at desktop width and on 360, 390 and 414px phones. |
| `CHANGELOG.md` | What changed in each round, and how it was tested. |
| `IMPROVEMENT_PLAN.md` | Review findings, comparison with similar apps, what is done, and what is left. |
| `CHATGPT_PROMPT.md` | Brief for the next round of work (v5). |

## Rebuild and test after editing a layer

```sh
node lumen/tools/build.mjs lumen/dist/Lumen-clinical-study-studio.html
node lumen/tests/smoke.mjs
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
