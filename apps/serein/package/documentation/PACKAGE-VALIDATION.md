# Serein 5.1.1 package verification

Pushed source commit: b2c007725849bb248073f13a5055b8ff67a6b8b8. Twelve generated raster posters replace the earlier SVG infographic assets. PNG originals are retained and WebP image/thumbnail files are deployed. Root dist matches the pushed source except its additional Netlify Drop _headers file. Portable copies match the generated 5.1.1 HTML byte for byte.

701 automated checks passed: 33 catalogue/engine, 39 text contrast, 18 border/focus, 67 behaviour/privacy, 247 audit assertions across 42 scenarios, 90 release/preservation, 10 workers and 197 infographic checks. Original PNGs, optimised images and metadata hashes are validated. All 90 offline-manifest files exist. The standalone file embeds 63 media assets.

The 28-page base handover is in base-5.0.1. The prior SVG release notes in base-5.1.0 are historical. Current release notes explain the actual raster artwork, asset pipeline and checks.

Vercel JSON and Netlify TOML select dist and no host build. No Vercel/Netlify account deployment was performed. Browser/device rendering, actual touch interactions, screen readers, native downloads, hardware APIs and Lighthouse remain manual QA items. Image text, figures and branding were visually reviewed; automated checks are not clinical validation.

No actual user browser records, credentials, original Sites binding, Git metadata or node_modules are included. Development dependencies were already installed for validation; use npm ci on a new machine.
