# Serein 5.1.1 complete deployment and handover

Download and keep this whole folder outside the shared account before deleting the conversation. Current live app: https://serein-hca-studio.bouncyfield17.chatgpt.site
Infographic reader: https://serein-hca-studio.bouncyfield17.chatgpt.site/#infographics

## What changed
Original PNGs are in source-project/artwork/infographics. The app uses optimised WebP images and separate small thumbnails; there are no SVG infographic posters in the active app. Read the current release notes first; base-5.1.0 notes are historical.
Twelve rich, newly generated raster infographic posters and a flip reader now sit immediately after Toolkit in the sidebar. Toolkit provides mobile access. Read documentation/RELEASE-NOTES.md and documentation/Serein-Infographic-Prompts.md for the full update, sources and twelve /infographics: prompts.
The original complete 28-page base manual and content inventory are in documentation/base-5.0.1/. Those files describe release 5.0.1; use the 5.1.1 release notes and metrics for the new feature and current validation counts.

## Open the HTML
Open portable/Serein-v5.0.html. The stable filename is retained; the actual app version is 5.1.1. It embeds its code, styles, images and fonts. External sources still need internet. Native APIs and storage support differ for file:// pages.

## Deploy to Vercel
Import this complete package root into a repository you control, then import it in your own Vercel account. Root Directory: this folder. Framework: Other. Build Command: empty. Install Command: empty. Output Directory: dist. Keep vercel.json at the root. The package is prebuilt.

## Deploy to Netlify
For manual deployment, drag only the extracted dist folder to Netlify's manual-deploy area. It contains index.html and _headers. For Git deployment, import the package root; netlify.toml selects dist and an empty build command. Do not publish source-project or the entire handover folder.

## Maintain
Editable code is in source-project. Run npm ci for first setup, then npm run build, npm run check and npm test. Copy the entire generated dist back to this root dist and retain/restore dist/_headers. Replace both portable files together. Update documents and checksums before publishing.

## Data and access
Personal journal/check-in/contact records live in the user's browser, not in this ZIP. Export before moving to another domain and import on the new host. Keep encryption passphrases: there is no reset service. The current live URL remains private and depends on existing account access. The app has no independent cloud login or record sync; choose hosting visibility deliberately.
No Vercel/Netlify account deployment has been performed. Manual browser/device checks remain outstanding; see documentation/PACKAGE-VALIDATION.md and the base audit checklist.
