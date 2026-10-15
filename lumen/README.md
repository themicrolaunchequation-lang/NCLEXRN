# Lumen: clinical study studio (v3)

Lumen is the Healthcare Crown Academy study app: a local-first reader, notes and spaced-recall tool, shipped as a single HTML file. If you deliver it through Evinca's **Learn & tools** page, upload the file in `dist/` on the Evinca Admin page.

| Path | What it is |
|---|---|
| `dist/Lumen-clinical-study-studio-v3.html` | **The app to upload.** The original build plus the v3 layer. |
| `src/hca-v3.js`, `src/hca-v3.css` | The v3 layer: Today's plan, command palette, shortcuts, adaptive (FSRS) scheduling, progress insights, goal dialog, and phone and layout fixes. |
| `tools/build.mjs` | Injects the layer into a Lumen HTML file. Re-running it replaces the old layer, so it is safe to run on its own output. |
| `IMPROVEMENT_PLAN.md` | Review findings, comparison with similar apps, what v3 changed, and the roadmap. |
| `CHATGPT_PROMPT.md` | Detailed brief for the next round of work (v4). |

## Rebuild after editing the layer

```sh
node lumen/tools/build.mjs lumen/dist/Lumen-clinical-study-studio-v3.html
```

With one argument, the result overwrites `dist/Lumen-clinical-study-studio-v3.html`. Pass a second path to write somewhere else. Then open the file in a browser to check it before you publish it.

## Compatibility
- Existing workspaces load unchanged. New data is stored under optional keys (`hcaGoals`, `hcaOnboard`, `settings.hcaScheduler`, `settings.hcaHero`, and `fsrs` / `lapses` on cards).
- Backups made before v3 restore normally.
- Cards on the old 1/3/7/14/30/60-day ladder switch to adaptive scheduling at their next review. Anyone who prefers the ladder can choose it under **Today → Set goal → How cards are scheduled**.
