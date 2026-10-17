# Phase 6 — QA and polish

Completed the retained jsdom suite and new v4 data tests. Final Chromium evidence:
372 layout checks (31 routes, four widths, three themes), 186 route axe runs,
108 dialog/practice-state axe runs and 24 worksheet-step axe runs: zero reported
violations, page errors or page overflow. Sixteen functional journeys, 31 legacy
redirects, 62 layouts at 150% text and nine 200%-zoom layout surrogates also pass.

Verified ten original collections, full v1/v2→v3→v4 migration with original keys
untouched, v3/v4 round-trips, reload, storage failures/export recovery, Classic/FSRS,
actual old encrypted backup decryption, v4 encryption and wrong-password rejection.
Three A4 exports retain HCA branding and text inside safe page boundaries.

Production local 4× CPU-throttled result: FCP 336 ms; Terms search 161.7 ms;
palette 139.8 ms. HTML 921,722 bytes; gzip 443,552 bytes. Exact measurements and
browser/PWA/zoom-simulation limits are recorded in root validation.json. Before
and after screenshot sets cover every main route in both sizes and themes.

Primary changed files: `tests/`, print exporters, consolidated/current styles,
`README.md`, `MIGRATION.md`, `CHANGELOG.md`, `validation.json`, review reports.
The final Phase-6 HTML supersedes all development checkpoints.
