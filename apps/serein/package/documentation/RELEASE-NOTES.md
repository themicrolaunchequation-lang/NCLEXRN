# Serein 5.1.1: informative generated raster posters

This update replaces all twelve SVG infographic cards with newly generated bitmap illustrations. The original PNGs are included in source and the image ZIP; the app uses reviewed WebP copies and small thumbnails for faster navigation. This is not a file-format conversion of the earlier vector artwork.

Each poster has its own educational scene, explanatory diagrams, useful examples, practical steps, Serein logo, Serein name, Healthcare Crown Academy Ltd name and source context. Readable text and source limits remain available in the reader. No sidebar hover help or automatic page turning was added. The existing 5.1.0 routes and viewer controls are preserved.

## Build and image provenance

- Original PNGs: artwork/infographics/*.png.
- Optimised reader images and thumbnails: dist/assets/infographics.
- infographics-raster.json records exact prompts, hashes, source paths and review status.
- scripts/optimise-infographics.py requires Pillow only when preparing reviewed replacement artwork.
- Ordinary npm run build validates the prebuilt rasters, compiles reader data and prompts, then rebuilds both offline distributions.
- INFOGRAPHICS-PROMPTS.md has twelve self-contained /infographics: generation prompts. These require actual image generation and the existing logo reference.

## Verification

701 automated checks passed: 33 catalogue/engine, 39 text contrast, 18 border/focus, 67 behaviour/privacy, 247 audit assertions across 42 scenarios, 90 release/preservation, 10 workers and 197 infographic checks. The latter cover raster signatures, dimensions, thumbnail efficiency, download extensions, routes, filters, keyboard, swipes, enlargement, source text and offline inclusion. Brand and factual wording in the images were inspected visually; these checks are not clinical validation.

Browser/device rendering, real touch interactions, screen readers, native image downloads and Lighthouse remain unverified. Vercel/Netlify configuration is included in the complete package; no account deployment to those platforms was performed.

This release changes no storage key, data schema, opt-in persistence choice or encryption scope. The existing live app remains private under the original account's access rules.
