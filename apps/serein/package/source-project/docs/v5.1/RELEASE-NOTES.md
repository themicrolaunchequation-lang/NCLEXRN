# Serein 5.1.0: educational infographics

This additive release preserves the 5.0.1 app, schema 5 and opt-in personal-record storage.

## New reader

- Infographics is the sidebar entry immediately after Toolkit. Toolkit also has a visible link for mobile users.
- Twelve source-labelled educational images have the Serein logo, app name and Healthcare Crown Academy Ltd name.
- Topic filters, thumbnails, previous/next, keyboard arrows/Home/End, horizontal touch swipes, optional reduced-motion-aware page animation, enlarged scrolling image, SVG downloads and global search are implemented.
- Full selectable text explains who, when, why and how. Source details and limitations require a deliberate click. No sidebar hover help or automatic page turning.
- Images distinguish population estimates, research sample counts, guidelines, exercise counts and app behaviour. Sources were checked on 16 October 2026. WHO's current work fact sheet reports 16% of working-age adults in 2023; older estimates are not relabelled as current.

## Maintenance

Edit infographics-content.json and source/infographics.js; run npm run build, npm run check and npm test. The build makes 12 SVGs, infographics-data.js and INFOGRAPHICS-PROMPTS.md, then rebuilds English strings and both offline distributions. The outlined crest preserves the supplied emblem and its original font glyph without depending on SVG font loading.

## Validation limits

SVGs were rendered in Inkscape and visually reviewed. Behaviour is checked in JSDOM and controlled worker mocks. Browser rendering, real touch interactions, screen-reader output, native downloads and device APIs were not tested here; the existing manual publication checklist still applies. Vercel and Netlify configurations are supplied, but no deployment to those services was performed.
