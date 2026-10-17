# Package validation

Serein 5.0.1 handover, 16 October 2026.

- Root dist runtime files match audited commit 60bf138a7911c926693aae685a5bba611e9d6df0 byte for byte. Netlify _headers is an additional deployment file.
- Both copied standalone HTML builds match the audited HTML byte for byte.
- Vercel JSON and Netlify TOML parse and select dist with no host build step.
- All offline-manifest files exist.
- The copied source project rebuilt successfully. Catalogue/engine checks 33, text contrasts 39 and border/focus contrasts 18 passed. Runtime suites passed 67 behaviour/privacy, 247 audit assertions across 42 scenarios, 84 release/preservation and 10 worker checks.
- Source tests used the existing development dependency installation via NODE_PATH; npm ci from a fresh machine was not performed. Dependencies are declared and locked in source-project/package.json and package-lock.json. node_modules is intentionally excluded.
- No Git metadata, credential files, original Sites binding or user browser records are included. Test records and test passphrases are synthetic fixtures.
- A 28-page DOCX and its Markdown/content inventory are included. Word pages were rendered for visual inspection.
- The existing private live URL was verified through the hosting service. No Vercel/Netlify deployment, browser/device layout test, assistive-technology test or Lighthouse run was performed.
