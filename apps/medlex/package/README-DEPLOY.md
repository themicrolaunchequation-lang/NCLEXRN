# MedLex deployment

Read docs/CURRENT-RELEASE-GUIDE.md first. The earlier complete handbook describes the original app; docs/infographics/EXAM-EXPANSION-GUIDE.md describes this addition.

## Source deployment

Use Node 24. Run `npm ci --include=dev`, then `npm run build`. Output directory: dist. Root Vercel and Netlify configurations are included. No private API key or server database is required.

## Prebuilt deployment

Extract MedLex-Static-Upload.zip and upload all its contents as one static folder. It includes index.html, the 56 raster posters, icons, manifest, worker and complete MedLex.html.

## Local file

Open dist/MedLex.html or the separately supplied MedLex-Complete.html. All 56 posters are embedded. index.html uses separate assets. Hosted and local-file learning records live in separate browser storage contexts; use export/import to transfer them. Imported-image backups and drawing/note backups are separate from learning backups.

## Validation

Run `npm run build:test`, `npm test`, `npm run test:infographics`, `npm run test:welcome`, then `npm run build`, `npm run test:hosted-infographics`, `node tests/release-production.cjs`, `node tests/offline-v4.mjs`. Review reports state the scope. Native browser/device layout, touch/fullscreen, contrast and medical-editor review remain pending.

The original hosted app's account gate is separate from app code. Configure the desired audience on any destination host.
