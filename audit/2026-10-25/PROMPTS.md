# Prompt pack: what I need from you, and fix prompts per task group

**How to use this file**
- **Part A:** copy a block, fill in the `[brackets]`, and send it to me. Each block unlocks specific fixes in Part B.
- **Part B:** each block is a complete instruction for a new Claude Code session (or this one). Send one group at a time, in order. Each prompt names its finding IDs from `AUDIT-REPORT.md`, `PRICING-STRATEGY.md` and `CERTIFICATES-AUDIT.md`, plus testable acceptance criteria.
- **Standing rules included in every fix prompt:**
  - Work on a feature branch.
  - Never push to the production branch `claude/loving-ptolemy-srrq02` (home site) or `main` (Evinca) without your explicit "approved to publish".
  - Bump `site/sw.js` VERSION on site changes.
  - Run the app's own checks before pushing.

---

# Part A — What I need from you

### A1. Access so I can finish the live audit
```
Access for the live audit:
1. Network: I have added healthcarecrownacademy.co.uk and *.healthcarecrownacademy.co.uk to this environment's Allowed domains (environment settings → Network access). [done / not done]
   — or — I will run a session with the Claude browser extension on my computer: [yes/no]
2. Test accounts (designated for testing only, no real people):
   - Free account email: [test-free@...]   password: I will type it into the sign-in page myself / share via [method]
   - Crown Pass test account (admin-granted, no payment): [test-crown@...]
   - A test inbox I control for verification/recovery emails: [address]
3. You may: sign in, sign out, trigger password recovery and email verification for these test accounts only. [yes/no]
4. Google Search Console access or exported "Pages" + "Performance" reports for healthcarecrownacademy.co.uk and evinca.healthcarecrownacademy.co.uk: [attached / not available]
```

### A2. Hosting, DNS and mailbox facts (HCA-01, 02, 24, 37, 39; CERT-03)
```
Hosting facts:
- snle.healthcarecrownacademy.co.uk is: [not set up yet / live on Cloudflare Pages project ___ / other: ___]
- lss.healthcarecrownacademy.co.uk is operated by: [Healthcare Crown Academy Ltd / Health Quality Leaders Ltd / other], hosted on [___]. Relationship between the two companies: [same owner / licence agreement / other]
- I own evinca.org: [yes / no / don't know]
- hello@healthcarecrownacademy.co.uk forwarding: I sent a test email from an outside account and it [arrived / did not arrive].
- Vercel plan for team themicrolaunchequation-langs-projects: [Hobby / Pro]
- Old Vercel projects nexusrn-public-beta and nexusrn-public-preview: [delete / keep / unsure]
```

### A3. Clinical review (HCA-03 to HCA-07, HCA-35)
```
Clinical review:
- Reviewer name, profession, registration body and number (for the public sign-off page): [___]
- Scope they will review: [UK nursing / Saudi SNLE / UAE DHA-DOH / Qatar DHP]
- I confirm Q0331 (APGAR) should be corrected to 8: [yes / reviewer to confirm]
- Glucose units policy: [show both mg/dL and mmol/L / per exam: SNLE=___, DHA=___, DOH=___, DHP=___]
- Verified crisis numbers for Serein, with a source link per number: Saudi Arabia [___], UAE [___], Qatar [___], others [___]
- Gulf Nursing marketing until review is done: [hide from nav / show as "Preview — clinical review in progress, free"]
```

### A4. Pricing decisions (PRICING-STRATEGY.md)
```
Pricing decisions:
- Approve the recommended UK price list in PRICING-STRATEGY.md §3.1: [approve all / approve with changes: ___]
- Serein fully free: [yes / no — keep premium at £___]
- MedLex lifetime option at £29.99: [yes / no]
- Gulf exams: [free during preview, then USD 39/3 mo & 59/12 mo per exam / Gulf Exam Pass USD 79 / included in Crown Pass / other]
- Regional bands A/B/C as in §3.2: [yes / no], currencies to show: [GBP, USD, SAR, AED, EGP, INR, PHP ...]
- Founding-member offer: price [£29.99 first year], end date [dd Mon yyyy], who qualifies [people who reserved before launch]
- Evinca fee changes in §3.3: [approve / changes: ___]
- LSS launch price USD 69 until [date]: [yes / no]
- Business inputs: VAT registered [yes/no, from date]; Stripe fee rate on my account [__% + __p]; Academy AI cost per active Lumen user per month [£___ or "unknown — measure it"]; monthly fixed costs [£___]
```

### A5. Certificates (CERTIFICATES-AUDIT.md)
```
Certificates:
- App certificates: [build now before paid launch / remove from pricing until later]
- Signatory for Crown Suite certificates: name [___], title [___], signature image [attached, used with consent] — or "sign as Healthcare Crown Academy Ltd"
- Evinca certificate signatory: [named Chair ___ with consent / sign as the company until a board exists]
- Eligibility rules (approve or edit):
  MedLex = pass a 40-question end-of-course test at ≥80%;
  Carecraft = complete a 10-lesson pathway + 20-question test at ≥80%;
  Serein = complete a 7-day journey (Certificate of Participation);
  Lumen = [no certificate / Study certificate after ___]
- LSS certificate issuer: [Health Quality Leaders Ltd / Healthcare Crown Academy Ltd], verify domain [___]
- "Hossam AlDhaher, LSSMBB": awarding body [___] — or remove the post-nominal: [keep / remove]
```

### A6. Legal inputs (HCA-18, 32, 33)
```
Legal:
- Solicitor reviewing terms, refunds and subscriptions (DMCC rules expected 1 Jan 2027): [name / not yet]
- Terms should cover these products: [Gulf Nursing, LSS Toolkit, Evinca]; LSS terms are [ours / the other company's at URL ___]
- Data processor for Lumen Academy AI: provider [OpenAI / Anthropic / Google / other], region [___], DPA signed [yes/no], cache retention for lumen_ai_cache [__ days]
```

### A7. Approval to publish (after each Part B group)
```
Approved to publish group [B#] from branch [branch-name] to production. I have checked the preview at [URL].
```

---

# Part B — Fix prompts per task group

> Send in order. B1 to B3 are the launch blockers.

### B1. Immediate containment: dead links, misleading copy, naming (HCA-01, 02, 03, 16, 17, 31, 32, 38)
```
Repo themicrolaunchequation-lang/NCLEXRN, folder site/. Read audit/2026-10-25/AUDIT-REPORT.md findings HCA-01, 02, 03, 16, 17, 31, 32, 38 first.
Create branch fix/b1-containment from claude/loving-ptolemy-srrq02.
1. Add one feature flag in site/assets/js/config.js: apps = { snle: {live:false}, lss: {live:false} } (I will tell you which are live; default false).
   When live=false, hide every SNLE/Gulf Nursing and LSS link (header Apps menu, mobile menu, crown tiles, #snle section CTA, interest picker, Daily Crown list in crown-account.js, account menu) and show "Gulf Nursing Studio — coming soon" with a waitlist link to #start instead.
2. Remove the sentence "Approved for release by the Academy owner." Label the Gulf section "Preview — clinical review in progress · free".
3. Use one name per product everywhere: "Gulf Nursing" (never "SNLE" in user-facing text except as the exam name "Saudi SNLE"). Update manifest.webmanifest description to the correct app count and names; add Gulf Nursing to the footer app list when live.
4. Replace the trust-bar line "Your progress stays on your device" and the FAQ storage answer with an accurate per-app statement (text in AUDIT-REPORT.md Report 5 item 2).
5. Align the FAQ 14-day answer with refunds.html (pro-rata refund wording).
6. 404 heading: "We can't find that page."
7. Bump VERSION in site/sw.js.
Checks: run apps/tools/home-check.mjs and apps/tools/daily-check.mjs if they run locally; grep deployed files for "SNLE" in user-facing strings, "Five apps", "flatlined", "Approved for release" — all must return nothing (except exam names).
Do not push to claude/loving-ptolemy-srrq02. Push the branch and give me a summary and the preview URL if Vercel creates one.
```

### B2. Privacy truthfulness: Lumen Academy AI (HCA-08, HCA-16)
```
Needs Part A6 answers first (AI provider, region, retention).
Repo NCLEXRN, branch fix/b2-privacy from claude/loving-ptolemy-srrq02. Read AUDIT-REPORT.md HCA-08.
1. site/privacy.html: add a section "Lumen Academy AI" describing: text you choose is sent from your browser to our Supabase Edge Function "lumen-ai", then to [provider] in [region]; purpose; lawful basis [contract]; cache table lumen_ai_cache kept for [N] days; international transfer safeguard; how to avoid it (use your own key or turn Academy AI off). Correct the existing sentence that says AI text never passes through our servers. Update "Last updated".
2. Lumen (apps/lumen source + rebuilt site/lumen bundle via apps/lumen/build-web.mjs): before the first Academy AI call show a one-time dialog: what is sent, where, retention, "Do not include patient-identifiable information", buttons "Use Academy AI" / "Use my own key instead"; store consent in localStorage; fill the provider's empty privacy string.
3. Add a scheduled purge for lumen_ai_cache older than [N] days as a Supabase migration file in the evinca repo (supabase/migrations/), do not apply it — I will approve applying.
Checks: run apps/tools/lumen-check.mjs; screenshot the new dialog at 390px and 1366px.
Push the branch only; summarise.
```

### B3. Evinca trust: demo honorees and certificate wording (HCA-14; CERT-03 to CERT-08)
```
Repo themicrolaunchequation-lang/evinca, branch fix/b3-evinca-trust from main. Read NCLEXRN audit/2026-10-25/AUDIT-REPORT.md HCA-14 and CERTIFICATES-AUDIT.md CERT-03..08. Needs A2 (evinca.org ownership) and A5 (signatory).
1. Honoree pages for ids containing "DEMO": robots noindex, remove from app/sitemap.ts, prefix <title>, description and OG image text with "Illustrative example —".
2. Certificate page app/[locale]/verify/[id]/certificate: build the "Review assurance" list from record data (reviewer count, blind, COI check) instead of fixed text; for DEMO records replace it with "ILLUSTRATIVE · NOT AN AWARD"; raise the SAMPLE watermark opacity in lib/ornaments.ts to 0.3.
3. Replace "evinca.org" in certificate and cover text with the canonical site URL from brand.siteUrl [unless I confirmed I own evinca.org]; make CertQR use brand.siteUrl, not window.location.origin; fail `pnpm build` if NEXT_PUBLIC_SITE_URL is unset in production.
4. Signatory: [named signatory from A5 / "For Healthcare Crown Academy Ltd"]; rubric label "2026.1" linking to /how-we-review.
5. Add a test (tests/) asserting: no "evinca.org", no fixed "Two independent, blind reviews" string, DEMO pages noindex.
Run pnpm build, pnpm test:review. Push branch only; summarise with screenshots of one DEMO certificate.
```

### B4. One price source and the new price list (PRICING-STRATEGY.md; HCA-15)
```
Needs Part A4 approval. Repos NCLEXRN (site) and evinca (database migrations). Branch fix/b4-pricing in both.
1. Treat public.crown_plans as the single source. Write a migration (do not apply) that sets the approved prices: [paste approved table], adds product rows for gulf (gulf-3m, gulf-12m, gulf-pass) as one-off (interval 'once'), adds currency/band columns (band A/B/C, currency, amount) for regional prices.
2. site/home.html pricing section and crown-account.js PRICE/PERKS: stop hard-coding; read prices from a generated JSON (site/assets/data/prices.json) produced by a small script from the migration's values, so home, paywall and JSON-LD Offer stay identical. Remove "All certificates", "Completion certificate", "Study certificate", "Participation certificate" from plan perks until certificates ship (CERT-01).
3. Founding-member offer: show only if today < [end date]; display the end date; no struck-through "was" prices unless that price was charged before.
4. Serein: [if approved free] remove Serein from paywall gating (HCA.locked('serein') returns false) and from paid plans.
5. Unit test: for each plan, home price == paywall price == prices.json == migration value.
Checks: open with ?gates=on and screenshot each paywall; run home-check. Push branches only; list the migration for me to apply.
```

### B5. Gulf Nursing question bank quality (HCA-04, 05, 06, 07)
```
Repo NCLEXRN, folder apps/snle. Branch fix/b5-snle-content from claude/loving-ptolemy-srrq02. Read AUDIT-REPORT.md HCA-04..07 and apps/snle/reports/clinical-audit.md.
Do NOT change the preserved original (source/original.html.gz). Add a corrections layer applied at build time (apps/snle/src/corrections.json) with item id, field, old value, new value, reason, reviewer, date.
1. Correct Q0331: key D (8) with component-by-component rationale [pending reviewer confirmation from A3].
2. Write scripts/check-scoring.mjs: for every APGAR/GCS/drip-rate/dose item, parse stem components and assert the key; output a CSV of mismatches for the reviewer — do not auto-change them.
3. Write scripts/lint-cues.mjs: report % items where key is longest option and where only the key lacks final punctuation; fail if punctuation cue > 0; print the longest-option % (target < 35% over time).
4. Fix the punctuation cue automatically (add/remove final full stops consistently across all options) — this is a formatting change only.
5. Glucose units: per A3 policy, append the converted value in brackets (mg/dL ÷ 18 = mmol/L, 1 dp) via the corrections layer.
Run the existing apps/snle tests. Push branch; give me the mismatch CSV for the clinical reviewer.
```

### B6. Onboarding modals, crisis route, international help (HCA-19, 20, 35)
```
Repo NCLEXRN. Branch fix/b6-onboarding. Read HCA-19, HCA-20, HCA-35.
1. Serein hook (apps/serein/src/hook.js → rebuild site/serein): never open when location.hash is #support or any help route; add a visible "Need urgent help now?" link inside the hook that closes it and opens Get help.
2. MedLex hook (apps/medlex hook → site/medlex/hook.*.js): do not open when the URL hash is anything other than "", #home or #today. Embed the M crest SVG directly (fix blank crest, HCA-30).
3. Serein Get help: add a country selector (default from navigator.language/timezone, user can change) with the verified numbers I supplied in A3, each with source link and "checked [date]"; keep the UK list as is.
Checks: clean-profile Playwright runs: /#support shows crisis routes with no modal; medlex /#library/term/myalgia shows the term with no modal; apps/tools/serein-check.mjs passes. Push branch only.
```

### B7. Security hardening (HCA-09, 10, 11, 12, 13)
```
Repos evinca and NCLEXRN. Branch fix/b7-security. Read HCA-09..13. Do not apply database changes or change Supabase/Vercel settings — prepare them for my approval.
1. Baseline: run `supabase db pull` (or generate from the live schema read-only) into evinca/supabase/migrations as a baseline file; commit.
2. subscribe(): migration adding email format check, a 'pending' status + confirmation token, consent_text_version and consented_at columns, and a per-IP/email rate limit; Edge Function to send the confirmation email (draft, not deployed).
3. Migration setting search_path on gift_allowance and gift_list_of; revoke anon EXECUTE on crown_admin_overview and other admin-only functions.
4. Session design proposal + implementation behind a flag: account site issues an HttpOnly, Secure, host-only refresh cookie; a /api/session endpoint returns short-lived access tokens to *.healthcarecrownacademy.co.uk origins via CORS allowlist of hosts we operate; crown-account.js and lib/auth.ts switch to it when the flag is on; keep the old cookie path as fallback until I approve removal.
5. Lumen CSP: self-host the scripts currently loaded from cdn.jsdelivr.net/esm.run (or add SRI) and remove those origins from vercel.json.
6. Write a checklist for me: enable Leaked Password Protection in Supabase Auth (manual dashboard step).
Run pnpm build and tests. Push branch; list every migration and dashboard step awaiting my approval.
```

### B8. Build real certificates (CERT-01, 02, 09, 10, 11, 12)
```
Needs Part A5. Repos evinca (database, account site) and NCLEXRN (apps, Laureate engine). Branch feat/b8-certificates.
1. Database (migration, not applied): extend crown_certificates.app to include lumen; add score, assessment_id, revoked_reason; create crown_assessments (questions per app) and a SECURITY DEFINER function crown_submit_assessment(app, answers) that scores server-side, rate-limits attempts (3/day), and calls crown_issue_certificate when the pass mark is met. Serial format MLX-YYYY-NNNNNN etc.
2. Account site: /[locale]/account/certificates (list, download PDF) and public /verify/c/[serial] using crown_verify; QR always points to https://account.healthcarecrownacademy.co.uk/verify/c/<serial>.
3. Certificate design: reuse the Evinca certificate frame with app jewel colour; wording "Certificate of Completion" (MedLex, Carecraft), "Certificate of Participation" (Serein); fixed line "Self-paced educational completion. Not a licence, accreditation, CPD credit or assessment of clinical competence."; signatory from A5.
4. Apps: add an end-of-course test entry point in MedLex and Carecraft (calls crown_submit_assessment); Serein 7-day journey completion claims via a server check of synced events.
5. LSS (integrations/hql): seal text "COMPLETION · HEALTHCARE", replace "demonstrating applied competence" wording, QR → https://[A5 verify domain]/verify/<code>. Laureate engine and id-badge: SPECIMEN watermark when institute/signatories are still the defaults; remove "GENUINE · CERTIFIED" from defaults.
6. Admin: revoke/reissue in account admin with crown_admin_audit rows.
Tests: end-to-end with a test account: fail test → no certificate; pass → certificate, verify page shows Active; revoke → verify shows Revoked. Push branch only; list migrations for approval. Re-enable certificate perks in pricing only after this passes.
```

### B9. Performance and SEO (HCA-21, 22, 23, 26, 27)
```
Repos NCLEXRN and evinca. Branch fix/b9-perf-seo.
1. MedLex: reserve space for late-loading blocks (fix CLS), lazy-load infographics (loading="lazy", only on view), defer hook and non-visible routes. Target lab CLS < 0.1 at 390×844.
2. Lumen: move inline bundles out of site/lumen/index.html into hashed files (update apps/lumen/build-web.mjs); index.html < 50 KB.
3. SEO: add all public MedLex Canvas lessons to site/sitemap.xml with lastmod; give each lesson a self-canonical on medlex.healthcarecrownacademy.co.uk and a meta description; add og:image to Lumen; in vercel.json 308-redirect app paths requested on the wrong host to the canonical host; 308-redirect the 31 legacy /medlex/learn/*.html pages to their Canvas equivalents.
4. Evinca: set the Vercel function region to lhr1 in evinca/vercel.json (prepare only).
Verify with the Playwright lab script (CLS, LCP, bytes) before/after and paste the table. Push branch only.
```

### B10. Accessibility polish (HCA-28, 29, 30)
```
Repo NCLEXRN. Branch fix/b10-a11y.
1. MedLex Canvas library: raise .feature-line and .brand small text to ≥12px and colour contrast ≥4.5:1 (replace #61736a on #eef0e9).
2. MedLex Today: exactly one visible h1 per route.
3. Run axe-core (WCAG 2.2 AA) on home, all MedLex routes, Canvas library and 5 lessons, Carecraft, Serein, Lumen; report 0 violations or list remaining ones.
Push branch only.
```

### B11. Docs, hosting hygiene and legal pages (HCA-18, 24, 25, 33, 39)
```
Repo NCLEXRN. Branch fix/b11-docs-legal. Needs A2 and A6.
1. Replace site/README.md deployment sections and HANDOVER.md hosting rows with one accurate DEPLOYMENT.md (Vercel project nclexrn-site, root site/, production branch, how to roll back). Delete site/netlify.toml and site/_headers (unused).
2. Draft additions to site/terms.html, privacy.html, refunds.html covering Gulf Nursing, LSS Toolkit (or link to its operator's documents), and subscription renewal reminders/cancellation consistent with the DMCC subscription regulations expected from 1 Jan 2027 — mark the draft "for solicitor review"; do not publish.
3. Checklist for me: upgrade Vercel to Pro; delete or protect nexusrn-public-* projects; confirm hello@ forwarding.
Push branch only.
```

### B12. Privacy-preserving analytics (HCA-36)
```
Repos NCLEXRN and evinca. Branch feat/b12-analytics. Needs my approval of the event list.
Add first-party, cookieless, aggregate event counting: one Supabase table (event, app, day, count) and an Edge Function that increments counts; no user IDs, no IPs stored. Events: landing_view, app_open, signup_start, signup_done, learning_start, lesson_complete, js_error. Add a small admin chart in the account admin page. Draft a DPIA note and privacy-notice paragraph for my review. Push branch only.
```

---

## Suggested order and dependencies

| Order | Group | Needs from you first |
|---|---|---|
| 1 | B1 Containment | A2 (which apps are live) |
| 2 | B2 Privacy | A6 (AI provider, retention) |
| 3 | B3 Evinca trust | A2 (evinca.org), A5 (signatory) |
| 4 | B4 Pricing | A4 (approved prices) |
| 5 | B5 Question bank | A3 (reviewer, units) |
| 6 | B6 Onboarding and crisis | A3 (verified numbers) |
| 7 | B7 Security | none (outputs await your approval) |
| 8 | B8 Certificates | A5 |
| 9–12 | B9–B12 | A6 for B11; event list for B12 |
| Any time | Live re-audit | A1 |
