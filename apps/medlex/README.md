# MedLex — Healthcare Crown Academy

Published at https://healthcarecrownacademy.co.uk/medlex (built into `site/medlex`).

| Folder | What |
|---|---|
| `source/index.html` | The hosted build of MedLex 4.0 from the author's package (`dist/index.html`). `build-web.mjs` reads it. |
| `src/hook.js`, `src/hook.css` | First-visit hook: decode one real term by tapping its parts. Words come from `TERMS.json`. |
| `package/` | The author's full project (Vite source, data records, scripts, tests, docs, posters in `public/`). The built `dist/`, the duplicate upload zip and `node_modules` were left out. |
| `web/` | Share image and icons (`node ../tools/render-art.cjs web/art.json`). |

## Publish a change
1. In `package/`: `npm ci`, then `npm run build` (needs Node 22.12+).
2. Copy `package/dist/index.html` to `source/index.html` and any new posters stay in `package/public/infographics`.
3. `node build-web.mjs`, then commit `site/medlex`.

The build stops with a clear message if the app's code changes in a way its patches no longer match (poster paths, manifest link, worker registration).

## Learning Studio

Every module opens as a slide journey (`src/studio.js`, data from `src/studio-data.mjs`, engine in `apps/shared/hca-studio.*`).
The web build adds a lazily loaded `studio.<hash>.js`; `src/studio-entry.js` (in the shell bundle) injects "Learn as slides"
on the Learn page, each module row and each module page.

## Library, Visual Atlas and Practice (reorganised)

`src/lib/*.js` + `src/lib/lib.css` replace the app's Library, Visual Atlas and Practice pages (the router asks `MedlexV5.route`
first; `src/studio-entry.js` loads the bundles on demand). Data comes from `src/lib-data.mjs`, which leads with what teaches
decoding (200 prefix/suffix forms, 60 roots, 75 decoded words) and removes generated filler from the 1,480-term glossary
(1,385 records had an identical definition, a templated example and a stock note). Tools: `apps/tools/lib-check.mjs`.
Atlas thumbnails live in `web/thumbs` (regenerate with PIL when posters change).
