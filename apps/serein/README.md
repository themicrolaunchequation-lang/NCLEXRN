# Serein — Healthcare Crown Academy

Published at https://healthcarecrownacademy.co.uk/serein (built into `site/serein`).

| Folder | What |
|---|---|
| `source/Serein-v5.1.1.html` | Portable 5.1.1 release. `build-web.mjs` reads this file. |
| `src/hook.js`, `src/hook.css` | First-visit hook (one breath, then a private check-in). |
| `package/` | The author's complete 5.1.1 hand-over (verified SHA-256 `51308d32…a939f`): editable source, build and check scripts, original infographic PNGs, documentation. Its `dist` and `portable` copies were left out because they duplicate `source/`. |

Every script in the package's `dist/` is identical to the code inside `source/Serein-v5.1.1.html`, so the web edition and the package are the same release.

## Publish a change
1. Edit in `package/source-project`, then run its `npm run build` (makes `portable/Serein-v5.0.html`).
2. Copy that file to `source/` (update `SOURCE` in `build-web.mjs` if the name changes).
3. Run `node build-web.mjs`, then commit `site/serein`.

The old preview at `serein-hca-studio.bouncyfield17.chatgpt.site` is superseded by the address above.
