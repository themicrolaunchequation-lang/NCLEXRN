# Serein 5.1.1 · Healthcare Crown Academy

All phases 0–4 are implemented. Browser-local educational wellbeing support; no analytics, APIs or runtime CDN dependencies.

## Build and check

Run `npm run build`, `npm run check`, then `npm test`. Runtime is framework-free. Node jsdom is a development dependency; Python standard library supports packaging and contrast checks. The build-time English copy extractor uses Node’s bundled Acorn. Editable UI authoring modules live in source/; generated deployment scripts live in dist/. Edit source/ for app, modern, advance, context-info, vault, player-tools and insights and infographics, then rebuild. Other modules remain directly editable in dist/.

Serve dist/ over HTTPS for modular hosting. Open portable/Serein-v5.0.html directly for standalone use. Its portable/sw.js companion is for HTTPS hosting of that single document; do not replace dist/sw.js with it. Choose offline access in Me → Settings → App & reminders.

The namespace is Serein: data/content, store, router, views, ui, player, studios, journeys, insights, search, a11y, media and locale strings. Add ?selftest to run isolated diagnostics. All full content and original safety text are retained, with legacy scope text in About images & evidence.

Storage stays at serein-hca-v3, schema version 5; old exports and serein-demo-v1 migration remain supported. Personal entries require explicit persistent saving. Optional authenticated encryption covers journals, check-ins and contacts; settings, plans, feedback and learning progress remain outside the lock. Passcodes cannot be recovered. Do not use patient-identifying information.

Release documentation is in docs/v5.0/. Real browser/device, assistive technology and Lighthouse checks remain manual; automated checks do not certify WCAG compliance.

Current audit and raster release: 701 automated checks pass, including the 42 audit scenarios and 197 infographic checks. See docs/v5.0/AUDIT-REPORT.md; real-browser, assistive-technology, native-device and Lighthouse checks remain outstanding.


## Illustrated raster infographics (5.1.1)

Infographics sits immediately after Toolkit in the desktop sidebar, with a mobile link inside Toolkit and global-search integration. `#infographics/<id>` supports direct links. Twelve generated, informative raster posters include Serein branding, human-centred scenes, practical examples, diagram labels, reference details and relevant limitations. These are new generated images, not PNG conversions of the earlier SVG cards. The active poster assets contain no SVGs.

Original PNGs live in artwork/infographics. Reviewed WebP reader images and separate small thumbnails live in dist/assets/infographics. On-page downloads are ordinary WebP image files; the image pack provides all original PNGs. Full selectable text remains available beside each poster. Filters, keyboard arrows/Home/End, horizontal swipes, reduced-motion-aware page animation, enlargement and downloads are preserved. Reading creates no personal records; sidebar hover help remains absent.

Edit infographics-content.json for editorial text and source context. infographics-raster.json records original-image hashes, reviewed raster assets and the exact generation prompts. scripts/build-infographics.py validates and publishes those assets and compiles INFOGRAPHICS-PROMPTS.md; it does not generate or draw replacement images. For a reviewed replacement PNG, update its metadata after visual review and run scripts/optimise-infographics.py (requires Pillow), then npm run build, npm run check and npm test. Ordinary builds need no Pillow because optimised assets are already supplied. Keep source PNGs and the metadata with the editable project.

The portable builder embeds 63 media assets: the original 39 raster assets, 12 infographic images and 12 thumbnails. This richer portable edition is about 6.95 MB and has a 10 MB budget. Hosted navigation loads individual posters and small thumbnails instead of downloading every PNG. No remote runtime library was added. Offline availability remains explicit opt-in.

Generated artwork was visually inspected for branding, readability, key facts and source context. The sleep image received two targeted corrections to its numbered steps and an unsourced decorative temperature. Build/data, DOM, route, worker and privacy checks passed. Browser/device rendering, actual touch behaviour, screen readers, native downloads and Lighthouse remain manual QA items.
