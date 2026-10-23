# SNLE and Gulf Exams: status at 23 Oct 2026

## SNLE (live preview + domain)
- Branch `codex/snle-clinical-studio-integration`, Cloudflare Pages project `snle-clinical-studio`, domain https://snle.healthcarecrownacademy.co.uk (Active, SSL). Not linked from the Academy home page yet.
- Done: nine Interactive Labs v3 integrated (inline scripts externalised at build, same-origin framing on the labs path only); Scientific Committee chip and overlay hidden; draft banner and "by Hossam AlDhaher" text removed (app, report, labs text).
- Known: author name is drawn into the poster images themselves (crop postponed); one dormant committee data entry remains in the bundle; `reports/integration-review.md` is stale (says Labs missing).
- Tests: `npm test` in apps/snle (needs BROWSER_PATH, SNLE_CERT_DIR, SNLE_TEST_PORT; server on HTTPS).

## Gulf Region Exams (prototype, unpublished)
- Branch `claude/gulf-crosswalk` (builds on `codex/gulf-nursing-exams-two-phases` + `codex/gulf-rn-regulatory-research-2026-10-23`).
- apps/gulf: four editions (SNLE, Qatar DHP, DHA, DOH), assessment engine that refuses full mocks without clinical sign-off, Crown apps switcher and shared account button, retake/timing/content-policy notes.
- Verified facts: DHA RN 150 Q / 3 h / 50% (Sep 2026 guideline); DOH RN 150 Q / 3 h, pass mark unpublished; Qatar RGN 150 Q, domains 30/61/44/15, 50%, duration disputed (180 vs 210 min). DHA and DOH weights unspecified. See apps/gulf/research/rn-licensing-primary-sources-2026-10-23.md.
- Crosswalk: 1,350 questions triaged (6 Saudi-only, 95 with jurisdiction signals, 300 policy words, 949 clean Core) plus a 57-item spot-check sample; reviewer brief in apps/gulf/research/reviewer-brief.md. Nothing is clinically approved.
- Tests: `npm test` in apps/gulf (12 pass). Cloudflare settings: root apps/gulf, build `npm run build`, output dist, Node 24, no custom domain.

## Needs the owner
1. Create the Gulf Pages preview project (settings above), send the link.
2. Clinical reviewers per regulator; send the reviewer brief and CSVs.
3. Send the 28 regulator questions (Qatar duration and retakes, DOH weights first).
4. Poster images without the credit line (or approve a crop).
5. Say "publish the Academy site" to list SNLE as the sixth app (production deploy).
6. Approve the `lumen-ai` backend fix; add Stripe test keys as Supabase secrets (never in chat); solicitor review of legal pages before payments.
7. Pricing (proposal in chat, not final): free core; Gulf Pass AED 29/month or AED 99/6 months; all-editions AED 149/6 months; launch AED 79/6 months with a free extension if you do not pass. Do not charge before review and Stripe.
