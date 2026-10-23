# SNLE Clinical Learning Studio integration

Preserves the attached application and prepares an isolated Cloudflare Pages app at the proposed hostname snle.healthcarecrownacademy.co.uk. Existing applications retain their current hosting projects.

**Release state:** local implementation until a Cloudflare preview is deployed and verified. The separately referenced Interactive Labs collection was not uploaded. Production requires the preview and approval specified in the supplied task.

## Build

Requires Node 22.12+; Node 24 is recommended.

    cd apps/snle
    npm ci --include=dev
    npm run build
    npm run preview

The build itself has no package dependencies. It reads source/original.html.gz, checks its SHA-256 against source/provenance.json, extracts embedded images and scripts into content-hashed files, and writes dist/. Original question text, keys, poster images, dossier cases and glossary records are retained.

Counts: 1,350 main-bank questions, 67 canonical posters, 35 dossiers / 350 cases and 62 glossary entries. The original metadata refers to 68 historical poster pages; one duplicate had already been retired in the attachment. No missing questions or labs have been invented.

The src/ modules provide asserted web adaptations: Academy navigation/account integration, page URLs, strict CSP, safe storage access, tool-specific Decision Lens applications, progress backup/import, mobile navigation and offline caching. Guided applications reuse existing question IDs and remain separate from mock scores.

The attachment also linked three absent view-only companion HTML files. Their study views are rebuilt from the exact embedded tool, question and dossier records, with search, filters, sorting, poster viewing and controlled answer reveal. These are new companion interfaces; they are not claimed to be copies of the missing original companion files.

## Verification

    npm run build
    node tests/integrity.mjs

For browser tests, supply a local certificate directory containing k.pem and c.pem:

    PORT=8450 SNLE_CERT_DIR=/absolute/certificate/path SNLE_BASELINE=1 node scripts/serve.mjs
    SNLE_TEST_PORT=8450 BROWSER_PATH=/absolute/path/to/chromium node tests/journeys.mjs
    SNLE_TEST_PORT=8450 BROWSER_PATH=/absolute/path/to/chromium node tests/persistence.mjs
    SNLE_TEST_PORT=8450 BROWSER_PATH=/absolute/path/to/chromium node tests/libraries.mjs

The original-source comparison route exists only in the development server, never in dist/. Browser tests cover every sidebar page, all 67 popup tools, guided and original coach cases, tutor/exam modes, flags, reports, persistence, glossary, dossiers, guide tabs, mobile navigation, account rerenders and website connections.

Account tests use an isolated mocked session, never a real person's credentials. A real sign-in round-trip must still be checked on the approved Academy hostname.

## Interactive Labs

Supply the original collection under source/SNLE_Decoder_Interactive_Labs_v3/ and rebuild. The missing collection remains clearly identified in the app rather than opening a broken frame or substituting invented exercises.

## Recover the attachment

    node -e "require('fs').writeFileSync('SNLE-original.html',require('zlib').gunzipSync(require('fs').readFileSync('source/original.html.gz')))"

Compare the recovered file with source/provenance.json. Existing storage keys remain unchanged. A new HTTPS origin cannot automatically read prior file-origin progress; the hosted app provides local backup/import for future moves. Learner notes are never uploaded to the account database.

See [deployment and rollback](DEPLOYMENT.md), [clinical audit](reports/clinical-audit.md), and the generated verification reports.

To repeat the existing app smoke checks, start the repository preview server with node apps/tools/serve-site.mjs 8443, then run npm run test:suite from apps/snle. Browser tests map Academy hostnames to the local test server and block external services.
