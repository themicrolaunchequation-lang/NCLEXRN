# Gulf Region Exams — isolated two-phase development
**Status:** Draft educational application. No public deployment or owner-approved release. This folder does not replace or modify `apps/snle` or production sites.

## Phase 1: evidence + content governance
- `research/regulatory-matrix.md`: official-source matrix and explicit unresolved exam rules.
- `research/phase-1-findings.md`: source/live discrepancies and preservation boundaries.
- `research/crosswalk-methodology.md`: complete item review workflow.
- `npm run crosswalk`: locally decompresses and hash-verifies the original SNLE source and generates **1,350 question** and **67 poster** CSV *review queues*. Every destination remains unapproved. Generated queues are under `reports/generated/`; do not present as a finished clinical review.

## Phase 2: standalone shared-platform prototype
- `index.html`, `styles.css`, `app.js`: separate Gulf Region Exams parent interface with four edition selectors, domain-blueprint display, regulator source links, day/night palettes, independent local study planning and a strict full-exam hold.
- `data/exam-profiles.js`: explicitly versionable examination specifications, uncertainty, subject allocations and validation.
- `tests/smoke.test.mjs`: checks governance, counts, no unverified exam parameter invention and local-storage separation.

### Local preview (no external deployment)
```sh
cd apps/gulf
npm run check
npm run preview
# Open http://127.0.0.1:4177/
```

### Generated review queue (run only in cloned source repository)
```sh
cd apps/gulf
npm run crosswalk
```
This requires the original `apps/snle/source/original.html.gz` and its provenance JSON; neither is copied or changed.

## Release / safety restrictions
- No changes to SNLE, Vercel, Cloudflare, DNS, identity-provider redirect allowlists, or original Academy applications.
- No paywall, payment SDK, regulated exam content, official seal, unsupported committee claims or live authentication.
- Do not present draft content as independently clinically validated; do not derive a pass likelihood from mock practice scores.
- Published full mocks remain intentionally absent until an approved, version-controlled question set and confirmed regulator blueprint exist.
- No push/merge to `claude/loving-ptolemy-srrq02` or production deployment without explicit written owner approval after preview.
- Qatar: 150 question domain breakdown is officially documented; current 3h listing conflicts with older 3½h PDF.
- Dubai: 150 / 3h / 50% is secondary-reported; current official RN CBT row not directly verified here.
- Abu Dhabi: RN exam structure remains unverified. Never invent exam format to fill the UI.
- Record review by qualified educators, credentials, evidence source, review date and sign-off before releasing exam-specific questions.

## Next steps before a public candidate edition
1. Run the CSV generator; conduct real subject-matter review and classify question reuse at item level.
2. Reconcile the live nine-lab route with missing Labs source noted in SNLE integration branch; capture exact production commit and assets.
3. Confirm the latest DHA/DOH exam rows and Qatar timing directly with licensing regulators.
4. Build an approved content ingest pipeline that rejects unsigned/unreviewed items; then test full timed mocks independently.
5. Validate account data isolation, multilingual support, performance, keyboard/screen reader flows, analytics, privacy and content copyright permissions.
6. Build isolated Cloudflare preview only with owner authorization, perform acceptance tests, then seek explicit go-live decision.
