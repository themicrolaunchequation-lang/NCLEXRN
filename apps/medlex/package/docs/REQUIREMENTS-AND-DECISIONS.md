# Product decisions and implemented boundaries

The source and handbook are authoritative for this release. This is a product decision record rather than a verbatim conversation transcript.

| Decision | Current implementation |
|---|---|
| Preserve the company identity | HCA crest, footer, embedded fonts and semantic brand tokens |
| Expand learning beyond definitions | Modules, cases, studios, guided worksheets, adaptive sessions and evidence |
| Improve use of screen space | Current responsive shell and compact module headers |
| Replace disruptive hover panels | Inline essentials, click guides and short word meaning tips |
| Worksheets must be usable in the app | Routed Prepare, Work, Verify and Keep editor with storage feedback |
| Support a worldwide audience | Fifteen assisting gloss languages, device English accents and labelled online translation |
| Keep original course records | Ten unchanged canonical collections, editorial changes in overlays |
| Make learning outcomes honest | Proposed mapping and review status visible; no competence certification |
| Add 3D interactions | CSS word blocks and canvas schematic mesh with keyboard/touch controls and fallback |
| Remain independent of a backend | Static single-file build, IndexedDB and localStorage, portable exports |
| Preserve recovery | Legacy migration, v4 queued persistence, JSON and encrypted backup compatibility |
| Support external hosting | Source configs and prebuilt static ZIP for Vercel and Netlify |

Latest fixes: missing Preview panel guard, safe word component selection, malformed route decoding, onboarding race guard, manifest credentials, academy link accessible name, dirty worksheet departure warning and canvas setup fallback.

Not implemented: secure user accounts, cloud synchronization, automated AI marking, automatic coding, verified reviewer authentication, full medical dictionary translation, independent clinical sign-off, detailed anatomical simulator or a central classroom gradebook. Future work is described in the handbook and CONTENT_BACKLOG.md.


## Current illustrated release

Forty real raster infographics replace the previous SVG study boards. Five skill guides, two pitfalls guides, five mnemonic posters with fifty custom cues, and two direction guides expand the original twenty-six topics. Six collections organize the shelf. Today and the floating seven-part field guide are implemented. See CURRENT-RELEASE-GUIDE.md and PACKAGING-VALIDATION.json for the current state and limits.
