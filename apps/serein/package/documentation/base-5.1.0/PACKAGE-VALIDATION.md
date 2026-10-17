# Serein 5.1.0 package validation

Pushed source commit: f69276d387c15be99f34c54955890cf54c6efbcc. Published successfully to the existing private Sites URL on 16 October 2026.

- Root dist matches pushed source byte for byte, except the additional Netlify Drop _headers file.
- Portable copies match the generated 5.1.0 document byte for byte. Its v5.0 filename inside the source/portable folders is retained for compatibility; its metadata and UI report 5.1.0.
- Vercel JSON and Netlify TOML select dist. No Vercel or Netlify account deployment was performed.
- All 78 offline-manifest files exist. The portable file embeds 51 media assets, including all 12 SVG infographics.
- 664 automated checks passed: 33 catalogue/engine, 39 text contrast, 18 border/focus, 67 behaviour/privacy, 247 audit assertions, 90 release/preservation, 10 workers and 160 infographic checks.
- SVG artwork was rendered and visually checked. Browser layout, real touch interactions, screen readers, native downloads, device APIs and Lighthouse remain manual verification items.
- No Git metadata, environment credentials, original Sites binding or actual user browser records are included. node_modules is excluded; use npm ci on a new machine. Development dependencies were already installed for validation.
- The original 28-page handover is retained under base-5.0.1 and describes that base release. Read RELEASE-NOTES.md and the current infographic prompts/content for the additive 5.1.0 feature and current measurements.
