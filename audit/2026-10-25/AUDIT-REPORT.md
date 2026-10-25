# Healthcare Crown Academy — Platform Audit

**Audit date:** 25 October 2026 · **Scope start:** https://healthcarecrownacademy.co.uk/ · **Type:** observation and recommendations only. Nothing was changed in code, content, settings, hosting or production data.

> **Read this first: how the evidence was gathered.**
> The audit environment could not reach the live site. The network proxy refused connections to the domain; the fetch tool failed DNS for every host, including w3.org; and Vercel denied share-link access. Instead, I confirmed through the Vercel API that **production serves exactly the commits held in the two repositories**: `NCLEXRN@e0764db` for the home site and the four app subdomains, and `evinca@2806451` for Evinca and the account site. I then replayed `site/vercel.json` (redirects, clean URLs, host rewrites, security headers including CSP) inside Chromium, serving files from that exact commit. Rendered findings therefore reflect the production build, but **not** CDN behaviour, real DNS, TLS, real network timing or live backend responses. Every claim below is labelled observed, measured (lab), source-only, or needs verification.

## Audit metadata

| Item | Value |
|---|---|
| Date | 2026-10-25 (access date for all sources) |
| Environment | Production build replica: `NCLEXRN` commit `e0764db` (= Vercel production deployment `dpl_2wFw3NJRGZmD7srJfUrrCDseqMTW`), `evinca` commit `2806451` (= deployment `dpl_AFXQbh7yf9TTn9dmW1ECm123oaLh`) |
| Browser tooling | Playwright 1.63.0 with Chromium 153.0.8010.12; request interception emulating `vercel.json`; service workers blocked during crawl |
| Accessibility tooling | axe-core 4.10.3 (rules: WCAG 2.0/2.1 A and AA, WCAG 2.2 AA); manual keyboard tab-order check |
| Viewports | Desktop 1366×900; mobile 390×844 (touch, isMobile); light and dark theme on home; reduced motion spot-check |
| Backend inspection | Supabase security and performance advisors; read-only catalogue queries (`pg_get_functiondef`) on 11 functions. **No table rows read; no data written.** |
| Hosting inspection | Vercel API: teams, projects, deployment metadata (read-only) |
| Accounts | **None.** No test account was provided. No sign-up, recovery, email, payment or support message was triggered. Form submissions were blocked inside the harness, so they never reached production. |
| Clinical review status | **AI screening only.** Nothing in this report is clinical approval. |
| Evidence files | `findings-register.csv`, `coverage-inventory.csv`, `clinical-content-sample.csv` (this folder). About 110 screenshots were captured in the session scratchpad; they are not committed, and none contains personal data. |

---

# Report 1 — Executive assessment

## Readiness judgement

**The four core study apps (MedLex, Carecraft, Serein, Lumen) are usable and well built for free use today. The platform is not ready for paid launch or wider promotion of the Gulf Nursing studio and Evinca** until the P1 items below are resolved or verified.

The engineering quality is unusually high for an early product: strict security headers, zero third-party trackers, near-zero automated accessibility violations, careful disclaimers, and a well-written refunds page. The main risks are not code defects. They come from **governance and truthfulness**:
- A licensure product advertised before its own clinical-review hold was cleared.
- A privacy notice that misdescribes Lumen's AI data flow.
- Fictional "honorees" exposed to search engines.
- A session design that trusts every subdomain.

**Limits of this judgement:** live DNS/TLS, real sign-in, live Evinca pages, the SNLE and LSS hosts, and real-device assistive technology were not tested. The clinical review is a 28-item sample of a much larger body of content.

## Blockers (resolve or verify before paid launch)

1. **HCA-03** — Gulf Nursing studio published despite a documented release HOLD; public text says "Approved for release by the Academy owner".
2. **HCA-04** — Confirmed wrong answer key (APGAR Q0331) in the very first clinical sample.
3. **HCA-08** — Privacy notice says AI text does not pass through your servers; Lumen's default "Academy AI" does.
4. **HCA-14** — 13 fictional honorees are indexable with no "illustrative" marker in search or social snippets.
5. **HCA-09** — Refresh tokens sit in a JS-readable cookie for one year, shared with every subdomain (verify which hosts you control).
6. **HCA-01 / HCA-02 / HCA-37** — Verify that `snle.`, `lss.` and `hello@` actually work.

## Category scorecard

| Area | Score | Confidence | Basis |
|---|---|---|---|
| A. Platform structure & navigation | 6 | Medium | Clear in-app IA and good back/forward behaviour on hash routes. Six entry points lead to an unbound host; inconsistent product names; onboarding modals intercept deep links. |
| B. Healthcare content accuracy, safety & trust | **4** | Medium | Strong disclaimers. Carecraft citations and MedLex glosses checked out. But a wrong key in a 28-item sample, an unreviewed 1,350-item bank on sale-adjacent pages, and fictional honorees in search. |
| C. Learning design & educational value | 6 | Medium | Good retrieval practice, spaced review and worked examples in Carecraft. The SNLE bank has strong answer cues (81% guessable) and thin rationales. |
| D. Visual design & interaction | 8 | Medium | Polished, consistent design system; good mobile layouts; no horizontal overflow at 390 px on any tested route. Minor crest and tone issues. |
| E. Clarity, accessibility & inclusion (WCAG 2.2 AA) | 7 | Low–Medium | axe found violations only on the MedLex Canvas library page (of 28 crawled pages) and on 0 of about 40 desktop app routes scanned; visible focus throughout; skip links. Serein's crisis route is gated by a modal; UK-only crisis numbers; no screen-reader testing. |
| F. Registration, authentication & account | **Not assessed** | — | No test account; only source was reviewed (see HCA-09). |
| G. Functionality, persistence & bugs | 7 | Medium | No page errors on any tested route; localStorage persistence survived reload; form validation and offline error messages work. |
| H. Performance & reliability | 6 | Low | Lab-only signals. Home is lean; MedLex CLS 0.259; Lumen HTML is about 1 MB; functions run in the US while the database is in London. |
| I. SEO, discovery & sharing | 6 | Medium | Canonicals, OG tags and JSON-LD on main pages. Thin sitemap; lesson pages lack metadata; Lumen has no OG image; demo profiles indexable. |
| J. Privacy, security & trust signals | **4** | Medium | Excellent headers, no trackers, and correctly guarded DB functions. But the AI disclosure is inaccurate, token storage is risky, leaked-password protection is off, and the newsletter function is open. |
| K. Pricing, access, support & completion | 6 | Medium | Transparent prices and a good refunds page. The paywall shows wrong prices; legal pages don't cover Gulf Nursing or LSS; support mailbox unverified. |
| L. Maintainability, analytics & readiness | 5 | Medium | Apps have test suites and release notes. Database schema not in version control; documentation drift; no product analytics. |

**Indicative overall score: 5.9 / 10.** This is the equal-weight average of the 11 assessed areas; F was not assessed. Coverage is reported separately in Report 2. **The average must not be read as "acceptable":** areas B and J each contain P1 issues.

**Findings by priority:** P0 = 0 · P1 = 8 · P2 = 19 · P3 = 12 (39 total).

## Strongest features (observed)

- **Security headers** on every host: CSP with hashes, HSTS (2 years, includeSubDomains), X-Frame-Options, nosniff, Permissions-Policy, COOP. CSP was enforced in the replica and blocked injected scripts.
- **No third-party requests** on any crawled page (30 pages): no analytics, ads or font CDNs. Self-hosted fonts.
- **Accessibility groundwork:** skip links, a visible 3 px gold focus ring, `aria-invalid` and `aria-describedby` on form errors, reduced-motion support, and no horizontal scroll at 390 px.
- **Honest framing:** extensive "not CPD / not accreditation / not clinical advice / fictional scenario" statements; Companies House and ICO numbers linked; specimen records labelled.
- **Serein crisis signposting** (UK) is accurate: 999, NHS 111 option 2, NHS 24, Samaritans 116 123, Shout/FRONTLINE 85258, Lifeline NI.
- **Carecraft evidence cards** match their sources in every case spot-checked: Panagioti 2019, Starmer 2014, Pronovost 2006, Westbrook 2010, Hodkinson 2022, Cook 2011, Walters & Wilder 2023.
- **Refunds page** is clear and plain-English, covers the 14-day right, pro-rata refunds, renewal reminders and easy cancellation.
- **Progress-move bridge** (`/move`) uses exact origin checks and add-only copies.
- **Privileged database functions** sampled all enforce `is_admin()` or ownership.

## Ten highest-priority findings

| # | ID | Priority | Summary |
|---|---|---|---|
| 1 | HCA-03 | P1 | Gulf Nursing studio listed despite its own release HOLD; "Approved for release by the Academy owner" on the public page. |
| 2 | HCA-04 | P1 | APGAR item Q0331 keys 9; correct answer 8 (contradicts Q0332). |
| 3 | HCA-08 | P1 | Lumen Academy AI sends learner text via your Supabase function to an undisclosed provider; the privacy notice says it doesn't. |
| 4 | HCA-14 | P1 | 13 fictional honorees indexable; titles and OG images don't say "illustrative". |
| 5 | HCA-09 | P1 | Access and refresh tokens in a JS-readable, 1-year, domain-wide cookie. |
| 6 | HCA-01 | P1 | `snle.` host not attached to production; linked from 6 places (verify DNS). |
| 7 | HCA-02 | P1 | `lss.` host and seller identity unknown; a $99 product with no stated seller or terms. |
| 8 | HCA-37 | P1 | `hello@` is the only cancellation, refund, data-rights and security contact; forwarding unverified. |
| 9 | HCA-05 | P2 | 81% of SNLE items answerable from length or punctuation cues. |
| 10 | HCA-19 | P2 | Serein's first-visit modal covers "Get help", even on `/#support`. |

---

# Report 2 — Platform map and learner journeys

## Platform inventory and coverage

| Name | URL | Access | Audit status | Relationship | Notes |
|---|---|---|---|---|---|
| Home / Crown Suite landing | https://healthcarecrownacademy.co.uk/ | Public | Functionally tested (emulated production build) | Hub for all apps | home.html; keyboard, mobile 390px, dark theme, forms (network blocked), axe |
| www redirect | https://www.healthcarecrownacademy.co.uk/ | Public | Not tested live (alias exists; redirect behaviour unverified) | Alias of apex | HANDOVER says it redirects to apex |
| Privacy notice | https://healthcarecrownacademy.co.uk/privacy | Public | Inspected | Legal | See HCA-08, HCA-16, HCA-18 |
| Terms of use | https://healthcarecrownacademy.co.uk/terms | Public | Inspected | Legal | See HCA-18 |
| Subscriptions & refunds | https://healthcarecrownacademy.co.uk/refunds | Public | Inspected | Legal | See HCA-32, HCA-33 |
| 404 page | https://healthcarecrownacademy.co.uk/<missing> | Public | Inspected | Shared | noindex present; HCA-31 |
| /move progress bridge | https://healthcarecrownacademy.co.uk/move | Public (noindex) | Inspected (source) | Shared infrastructure | Origin checks exact; add-only; positive |
| Redirects /pricing /home /evinca /medlex etc. | https://healthcarecrownacademy.co.uk/pricing (and others) | Public | Functionally tested (emulated vercel.json) | Routing | 308s as configured |
| MedLex | https://medlex.healthcarecrownacademy.co.uk/ | Public; free tier; gates off | Functionally tested (25 hash routes desktop+mobile, axe, persistence) | Crown Suite app; shared account script | HCA-20, 21, 29, 30, 34 |
| MedLex Canvas lesson library | https://medlex.healthcarecrownacademy.co.uk/medlex/learn/canvas | Public | Sampled (library + 11 lessons, axe) | Embedded in MedLex | HCA-26, 28 |
| MedLex legacy lesson pages | https://medlex.healthcarecrownacademy.co.uk/medlex/learn/*.html (31) | Public | Inspected (file inventory only) | Orphaned | HCA-27 |
| MedLex word-part quests | …/medlex/learn/quest-prefixes|roots|suffixes | Public | Sampled (route opened; studios not played) | Embedded | — |
| Carecraft | https://carecraft.healthcarecrownacademy.co.uk/ | Public; free tier | Sampled (Today, scenario, evidence data, question bank data) | Crown Suite app | Citations spot-checked accurate |
| Carecraft offline download | https://carecraft.healthcarecrownacademy.co.uk/carecraft/download/Carecraft-v4.5.0.html | Public | Not tested | Download | — |
| Serein | https://serein.healthcarecrownacademy.co.uk/ | Public; free tier | Functionally tested (Today, onboarding modal, Get help content) | Crown Suite app | HCA-19, HCA-35 |
| Lumen | https://lumen.healthcarecrownacademy.co.uk/ | Public; AI needs account or own key | Sampled (home render, source review of AI path); file upload/AI not exercised | Crown Suite app | HCA-08, HCA-22 |
| Gulf Nursing Licensure Studio (SNLE) | https://snle.healthcarecrownacademy.co.uk/ | Unknown — host not attached to visible deployments | Blocked live; source content sampled (28 items + whole-bank statistics) | Listed as sixth app | HCA-01, 03–07 |
| LSS Toolkit | https://lss.healthcarecrownacademy.co.uk/ | Unknown | Blocked / not tested | Separate product, own sign-in; operator unclear | HCA-02 |
| Evinca (recognition platform) | https://evinca.healthcarecrownacademy.co.uk/en | Public + account areas | Inspected (source only, repo commit 2806451 = production); not rendered | Sister product; shares account and database | 58 routes; HCA-14 |
| Account site | https://account.healthcarecrownacademy.co.uk/en | Login | Inspected (source only); sign-up, recovery and verification not tested (no test account; no emails triggered) | Alias of Evinca deployment | HCA-09 |
| Supabase backend (project evinca) | ujeofxfbwivjmgrxqdcl.supabase.co | Restricted | Inspected (advisors + read-only catalogue queries; no data rows read) | Shared by all apps | HCA-10–13 |
| Vercel projects nexusrn-public-beta / -preview | (unknown) | Unknown | Not tested | Possibly orphaned | HCA-39 |
| External sites | medlineplus.gov, openstax.org, who.int, ico.org.uk, Companies House, etc. | Public | Not tested (outbound network blocked) | Unrelated external | — |


**Navigation vs sitemap reconciliation**

- `sitemap.xml` lists 8 URLs: apex, 4 app subdomains, and 3 legal pages. **Not in the sitemap but linked:** `snle.`, `lss.`, `evinca.` (Evinca has its own sitemap). **Deployed but unlinked (orphans):** 31 legacy MedLex lesson pages. **Public but not in the sitemap:** about 56 MedLex Canvas lessons.
- **Duplicated destinations:** every app path is also served on the apex and on the other subdomains (e.g., `healthcarecrownacademy.co.uk/medlex/learn/canvas`). The apex `/medlex` itself correctly 308-redirects.
- **Inconsistent branding:** "Gulf Nursing" vs "SNLE"; "Crown Academy" vs "Healthcare Crown Academy"; "Five apps" in the manifest vs "Six apps" on the page; the footer omits Gulf Nursing and LSS.

## Coverage summary

- **Inspected and functionally tested:** home (desktop and mobile, keyboard, theme, interest picker, pricing toggle, both email forms' validation and failure path), legal pages, 404, redirects, MedLex (25 routes × 2 viewports), Serein (onboarding, Get help), Carecraft (Today, scenario), Lumen (home render).
- **Sampled:** MedLex Canvas (library + 11 of about 56 lessons), Carecraft data (evidence cards, question bank structure), MedLex glossary (12 of 1,480), SNLE bank (28 of 1,350 items reviewed in full, plus whole-bank statistics).
- **Source-only:** Evinca and account (58 routes), shared account script, Supabase functions.
- **Blocked / not tested:** live DNS/TLS/CDN; `snle.` and `lss.` live; sign-up, sign-in, recovery, verification, session expiry and logout with a real account; Evinca rendered pages; Lumen file upload and AI responses; Carecraft offline download; service-worker offline behaviour; screen readers and real devices; Search Console data; checkout (payments off).

## Learner journeys

### 1. First-time learner arriving from search or a shared link
- **Discovery:** the title "Crown Academy: 6 study & well-being apps for nurses" and a 163-character description are good. A brand search on 25 Oct 2026 for "Healthcare Crown Academy" returned **no result for this site** (WebSearch, US index). Indexing status needs Search Console.
- **Understanding:** the hero is clear ("Six study and well-being apps for nurses. One account.") and the company and ICO numbers are visible immediately. **Hesitation points:**
  - Seven apps are shown where six are promised.
  - "Gulf Nursing" becomes "SNLE" in the picker result.
  - "Pricing · plans open soon", yet "7-day free trial" appears on a plan that cannot be bought.
- **Choosing:** the interest picker works and recommends a first app. It omits Gulf Nursing access and cost (HCA-38).
- **Abandonment risk:** clicking "Open the studio free" (Gulf Nursing) may hit an unbound host (HCA-01).

### 2. Returning learner
- MedLex progress persisted across reload (`medlex-v4` in localStorage). The Daily Crown streak is shared across apps via a first-party cookie.
- **Friction:** progress is device-bound for most apps; changing device loses it unless the learner uses backup tools, and that isn't explained on the home page. Deep links open onboarding modals on a clean profile (HCA-20).
- **Cross-app movement:** every app has a "Crown apps" switcher and a link back to the home page. The account menu labels Gulf Nursing as "SNLE".

### 3. Busy healthcare professional on mobile (390 px)
- No horizontal overflow on any of about 40 mobile routes. Tap targets in the header are 44 px. "Start free — no card" is the primary CTA above the fold.
- **Friction:** MedLex's mobile first load shows layout shift (lab CLS 0.259) and heavy main-thread work. Lumen's 1 MB HTML delays first paint on mobile data (HCA-21, HCA-22).

### 4. Keyboard and assistive-technology learner
- **Keyboard:** the skip link is first; logical order through header, hero CTAs and picker; visible focus everywhere tested (the hero tiles show focus on their inner frame). Escape closes menus and modals.
- **Barriers:** Serein's onboarding modal must be dismissed before "Get help" is reachable (HCA-19). MedLex Today has two `h1`s. The Canvas library has contrast failures.
- **Not tested:** screen-reader announcements (NVDA, VoiceOver), 200%/400% zoom reflow on real devices, captions for audio guidance.

### 5. Sign-up, sign-in, recovery, account, sign-out (untested completion steps)
- From source: "Sign in" sends the learner to `account.healthcarecrownacademy.co.uk/en/sign-in?next=<current URL>`. `safeNext` limits returns to relative paths or `https://*.healthcarecrownacademy.co.uk`. Sign-out clears cookies and revokes the token.
- **Not tested:** verification email wording, password rules, recovery, expired-session behaviour, role boundaries. A designated test account is needed.

### 6. Help, problems and support
- The FAQ and an email address are present. There is no in-app "report a problem with this question" route for clinical content errors (recommended in Report 5). The support mailbox is unverified (HCA-37).

---

# Report 3 — Detailed findings register

Effort bands: Small (≤ 1 day), Medium (≤ 1 week), Large (> 1 week). The same data is in `findings-register.csv`.

| Finding ID | Page/sub-app and URL | Category | Classification | Evidence and reproduction steps | Learner impact | Priority | Confidence | Recommended fix | Effort | Acceptance criteria | Likely owner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| HCA-01 | Home nav, Apps menu, mobile menu, Daily Crown, account menu — https://snle.healthcarecrownacademy.co.uk/ (16 references in deployed code) | A Structure / K Access | Needs verification | Production deployment dpl_2wFw3NJR… (commit e0764db) aliases only apex, www, medlex, carecraft, serein, lumen; snle is not an alias and Vercel returns 404 for it. apps/snle/DEPLOYMENT.md (23 Oct 2026) states the hostname 'has not been added to DNS or any hosting project'. Repro (owner): from a UK and a Gulf network, open https://healthcarecrownacademy.co.uk/ → Apps → 'Gulf Nursing Licensure', or 'Open the studio free'. DNS could not be resolved from the audit environment, so the live result is unconfirmed. | If unbound, the newest advertised product, and the only one aimed at Gulf learners, is a dead end from six entry points. That damages first impressions and trust. | P1 | Medium | Confirm DNS and hosting for snle.*. Until a reviewed release exists, remove SNLE entries from the nav, apps menu, account menu, Daily Crown and interest picker behind one feature flag, or point them to an apex holding page ('Gulf Nursing Studio — coming soon, join the list'). | Small | Every app link on every page returns HTTP 200 over HTTPS from UK and KSA vantage points; an automated link check in CI fails the build on any non-200 app link. | Front-end dev + owner |
| HCA-02 | Home 'Also from the Academy' panel and Apps menu — https://lss.healthcarecrownacademy.co.uk/ | A Structure / J Trust | Needs verification | lss.* is not attached to either Vercel project visible to the owner account (404 from the Vercel API). Repo integrations/hql/laureate-hql.js describes the LSS Master Toolkit as a 'Health Quality Leaders Ltd' product. The home page sells it as 'Also from the Academy… $99 for 12 months… Certificate of Completion'. The operator, hosting and seller of record could not be determined. | Learners cannot tell who sells a $99 product, whose terms and refunds apply, or who holds their data. If the host is broken, the link is a dead end. | P1 | Medium | Confirm who operates lss.* and that it resolves. State the seller, terms, refund policy and privacy notice on the panel. If a third party operates it, do not host it on a subdomain that receives the shared session cookie (see HCA-09); link to that party's own domain instead. | Small | The panel names the legal seller and links to that seller's terms, refunds and privacy pages; the link returns 200; the hca-auth cookie is not sent to any host not operated by Healthcare Crown Academy Ltd. | Owner + legal |
| HCA-03 | Home 'Gulf Nursing Licensure Studio' section (#snle) — healthcarecrownacademy.co.uk | B Content safety / J Trust | Content concern | apps/snle/reports/integration-review.md (23 Oct 2026) records 'HOLD — preview and written owner approval required. Do not publish to claude/loving-ptolemy-srrq02', listing as unresolved blockers 'independent qualified clinical review' and 'Cloudflare preview'. PRs #3 and #4 then merged the listing into the production branch. The live copy advertises '1,350 original practice questions… set up for each regulator [Saudi, Qatar, Dubai, Abu Dhabi]' and publicly states 'Approved for release by the Academy owner'. The bank's own metadata marks 1,350/1,350 items 'clinical SME validation + pilot psychometrics' pending; 70 are flagged 'VERIFY Saudi/local policy'. | Learners preparing for a high-stakes licensing exam are invited to rely on material that the project's own release record says is not clinically reviewed. 'Approved for release' reads as a quality assurance it is not. | P1 | High | Remove 'Approved for release by the Academy owner' from public copy. Until independent review is complete, label the studio 'Preview — clinical review in progress', keep every exam free (the release record requires SNLE to stay unpaywalled), and do not claim regulator-specific alignment for Qatar, Dubai or Abu Dhabi without a documented blueprint check. | Small (copy); Large (review) | Public copy contains no internal-approval language; a dated clinical review sign-off (reviewer name, credentials, scope) is linked from the studio before any paid tier or 'aligned' claim appears. | Owner + clinical lead |
| HCA-04 | Gulf Nursing / SNLE question Q0331 (APGAR) — apps/snle/source/original.html.gz | B Content accuracy | Confirmed defect | Stem: HR 130, strong cry, active movement, 'grimaces with stimulation', pink trunk with blue extremities. Keyed answer A = 9; rationale scores reflex response 2. Under the standard Apgar scale (AAP/ACOG), a grimace scores 1 for reflex irritability and acrocyanosis scores 1, giving 8 (option D). The bank's own Q0332 scores 'grimace to stimulation' as 1, so Q0331 contradicts it. | Learners who answer correctly (8) are marked wrong and taught the wrong scoring rule. | P1 | High | Change the key to D (8) and rewrite the rationale. Run a scripted consistency check across all calculation and scoring items (APGAR, GCS, drug maths, fluid rates) and send them to a clinical reviewer. | Small | Q0331 keys 8 with a component-by-component rationale; a regression test asserts the key for every APGAR/GCS item equals the sum of the scored components stated in the stem. | Clinical item writer + dev |
| HCA-08 | Lumen — Academy AI (lumen.healthcarecrownacademy.co.uk) vs /privacy | J Privacy | Confirmed defect | lumen/js/01.e245896886.js: 'Adds Academy AI: the Academy's own AI service (Supabase Edge Function "lumen-ai")… Academy AI sits first in the fallback chain', enabled by default, with an empty provider privacy string. A public.lumen_ai_cache table exists (Supabase advisor). /privacy says AI questions and source text are 'sent directly from your browser to that provider. They do not pass through our servers' and covers only user-supplied keys. | Learners, and possibly patient details pasted into notes, are processed by an undisclosed AI provider and may be cached. The privacy notice is materially inaccurate (UK GDPR Art. 13 transparency). | P1 | High | Update the privacy notice: Academy AI processor and provider, purpose, lawful basis, retention of lumen_ai_cache, international transfers. Show an in-app notice before the first Academy AI call with a 'Do not include patient-identifiable information' warning. Confirm a DPA with the AI provider and a cache retention limit. | Small (notice); Medium (DPA, retention) | The privacy notice names the Academy AI processing chain; the first Academy AI use shows a dismissible notice; lumen_ai_cache rows older than the stated retention are purged by a scheduled job. | Owner + DPO/legal + dev |
| HCA-09 | Shared account cookie — site/assets/js/crown-account.js; evinca lib/auth.ts | J Security | Needs verification | The full Supabase session JSON (access and refresh tokens) is written by JavaScript to cookies hca-auth.0..n with Domain=.healthcarecrownacademy.co.uk and Max-Age=31536000. They cannot be HttpOnly. They are sent to and readable on every subdomain, including hosts outside the Vercel suite (snle planned on Cloudflare; lss operator unknown). Lumen's CSP allows scripts from cdn.jsdelivr.net and esm.run. Evinca safeNext() accepts any https://*.healthcarecrownacademy.co.uk return URL. Exploitability was not tested. | A script injection on any subdomain, or any subdomain served by a third party, could take over learner accounts for up to a year. | P1 | Medium | Keep the refresh token out of JS-readable storage: issue an HttpOnly, Secure, host-scoped cookie from an account-site endpoint and hand apps short-lived access tokens via a token endpoint. Shorten lifetime. Restrict *.healthcarecrownacademy.co.uk to hosts you operate and audit DNS for dangling records. Self-host Lumen's CDN dependencies or add SRI. | Large | No cookie readable by document.cookie contains a refresh token; a DNS inventory lists only company-operated hosts; Lumen CSP has no third-party script origins. | Security-minded dev |
| HCA-14 | Evinca honoree profiles — /en/honorees/* (13 pages) and sitemap.xml | B Trust / I SEO | Confirmed defect | lib/care-data.ts: all 13 honorees have ids EVN-DEMO-* (fictional, AI-generated portraits). app/sitemap.ts lists every honoree; robots allow indexing (flags.indexable true unless env set); generateMetadata sets noindex only when revoked. Title, description and OG image say e.g. 'Amina Rahman, Midwife and unit quality lead' with no 'illustrative' marker; the on-page DemoBadge and 'Illustrative profile' note are not in search or social snippets. Live index status was not checked (needs Search Console). | Searchers and anyone shown a shared link may take fictional people as real award holders. Names may match real clinicians. | P1 | High | Before launch, noindex demo profiles and remove them from the sitemap, or prefix titles, descriptions and OG images with 'Illustrative example'. Long term, replace them with consenting real honorees. | Small | Every EVN-DEMO page returns a noindex robots meta and is absent from the sitemap; or its title contains 'Illustrative'; a Search Console URL inspection shows them excluded. | Next.js dev + owner |
| HCA-37 | Support email — hello@healthcarecrownacademy.co.uk (config, security.txt, refunds cancellation route) | K Support | Needs verification | HANDOVER.md lists 'Optional: Porkbun email forwarding hello@healthcarecrownacademy.co.uk → Gmail, then update contactEmail' as a to-do and says the contact email stays a personal Gmail address (redacted). Deployed config already uses hello@. No message was sent in this audit. | If forwarding is not set up, cancellations, refund requests, data-rights requests and security reports go nowhere. | P1 | Low | Send a test message from an external account and confirm delivery; monitor the mailbox. | Small | A test email to hello@ is received within 5 minutes; an autoresponder confirms receipt. | Owner |
| HCA-05 | Gulf Nursing / SNLE bank — all 1,350 items | C Learning / assessment validity | Confirmed defect | Scripted analysis of the preserved bank: the keyed option is the longest option in 1,068/1,350 items (79%; chance is about 25%). In 65 items the key is the only option without a final full stop. 1,100 items (81%) can be answered from one of these two cues without clinical knowledge. Many distractors are implausible (e.g., Q1008 'Recommend punishment…', Q1014 'rest in the sun'). | Scores overstate readiness, and learners can learn test-wise habits that fail on the real exam. Any 'readiness' or progress indicator built on these scores is unreliable. | P2 | High | Rewrite options to parallel length, grammar and punctuation; replace implausible distractors with common misconceptions; add item analysis (difficulty, discrimination) once usage data exists; lint the bank in CI for length and punctuation cues. | Large | Key-is-longest falls below 35%; the punctuation cue appears in 0 items; a CI lint reports both metrics on each content release. | Item writers + dev |
| HCA-06 | Gulf Nursing / SNLE rationales | C Learning design | Content concern | Median rationale length is 85 characters (minimum 24). Distractor feedback uses generic labels (e.g., 'Priority inversion / lower-acuity focus'). The project's own clinical-audit.md flags this as Medium. | Learners get little explanation of why their chosen wrong answer is unsafe, which reduces learning from errors. | P2 | High | Add option-level rationales (2–3 sentences each) with a reference and a review date, starting with the high-risk domains listed in clinical-audit.md. | Large | Every high-risk item shows an option-specific explanation, a cited source and a 'last reviewed' date. | Clinical educators |
| HCA-07 | Gulf Nursing / SNLE — units | B Content / E International clarity | Content concern | 21 items use mg/dL and 18 use mmol/L (e.g., Q0520 glucose 54 mg/dL; Q1167 K⁺ 3.0 mmol/L with glucose 200 mg/dL) with no conversion. UK practice reports glucose in mmol/L; Gulf laboratories vary. | Learners trained in mmol/L may misjudge severity, for example not recognising that 54 mg/dL ≈ 3.0 mmol/L. | P2 | High | Show both units for glucose (and any other analyte reported in both systems), or set units per selected regulator. | Medium | Every glucose value displays in both mg/dL and mmol/L, or in the unit configured for the chosen exam. | Item writers |
| HCA-10 | Supabase project evinca — Auth settings | J Security | Confirmed defect | Supabase security advisor (2026-10-25): 'Leaked Password Protection Disabled'. | Learners can set passwords already exposed in breaches. | P2 | High | Enable leaked password protection in Supabase Auth. | Small | The advisor no longer reports auth_leaked_password_protection. | Owner |
| HCA-11 | Supabase public.subscribe() — home 'Launch news' and 'Reserve' forms | J Privacy / K | Confirmed defect | Read-only catalogue query: subscribe(p_email, p_source) is SECURITY DEFINER and executable by anon. It inserts lower(trim(p_email)) with no format check, rate limit or double opt-in, and stores no consent text or timestamp beyond source. | Anyone can add other people's email addresses to the marketing list, and you cannot evidence consent under PECR. | P2 | High | Add server-side email validation and rate limiting; send a confirmation email (double opt-in); store the consent wording version and timestamp. | Medium | New subscribers are 'pending' until confirmed; each row records consent text version and timestamp; more than N requests per IP per hour are rejected. | Backend dev |
| HCA-13 | Evinca repo — supabase/migrations | L Maintainability | Confirmed defect | The repo contains 3 migrations. Live functions and tables such as set_reviewer, cast_vote, gift_allowance and lumen_ai_cache exist in the database but in no repository file. | Indirect: the database cannot be rebuilt or reviewed from source, which raises the risk of security regressions and lost work. | P2 | High | Run `supabase db pull`, commit a baseline migration, and require migrations for all future schema changes. | Medium | A fresh local Supabase built from the repo has the same function and table list as production (diff is empty). | Backend dev |
| HCA-15 | Paywall dialog — crown-account.js PRICE table (all apps) | K Pricing | Confirmed defect | PRICE = {medlex:'£4.99/month', carecraft:'£4.99/month', serein:'£4.99/month', lumen:'£4.99/month'}; the pricing page shows MedLex £6.99 and Lumen £5.99. Visible today with ?gates=on; it will be live for every learner when GATES_LIVE is set. | Learners would be shown a lower price than checkout charges, which is misleading pricing. | P2 | High | Load prices from one source (crown_plans table or a shared config) used by both the pricing section and the paywall. | Small | With ?gates=on, the paywall for each app shows the same monthly price as the pricing section; a unit test compares both sources. | Front-end dev |
| HCA-16 | Home trust bar, FAQ vs Gulf Nursing panel | J Trust / B | Confirmed defect | The trust bar says 'Privacy first — Your progress stays on your device'; the FAQ says 'Each app keeps your progress… in your browser'. The Gulf Nursing panel says 'Progress saved to your Academy account'. Lumen Academy AI and Evinca also store data server-side. | Contradictory privacy statements reduce trust and may mislead learners about where their data is. | P2 | High | Replace with an accurate per-app statement, e.g., 'MedLex, Carecraft and Serein keep progress on your device. Gulf Nursing and Evinca save to your account. Lumen's Academy AI sends the text you choose to our AI service.' | Small | Home, FAQ and privacy notice describe storage identically per app. | Content + dev |
| HCA-17 | Naming across home, manifest, account menu, footer, legal pages | A Structure / D | UX issue | Interest picker result for 'Prepare for nursing decisions' reads 'Your crown: MedLex + SNLE'; the account menu and Daily Crown say 'SNLE'; the home page says 'Gulf Nursing'. manifest.webmanifest says 'Five apps'; the page says six. The footer app list omits Gulf Nursing and LSS. The title uses 'Crown Academy', not 'Healthcare Crown Academy'. | First-time learners cannot tell whether SNLE and Gulf Nursing are the same product, or how many apps they get. | P2 | High | Pick one public name per product and apply it everywhere (nav, picker, account menu, Daily Crown, footer, manifest, legal pages, JSON-LD). | Small | A text search of deployed files finds no stale product name or app count. | Content + dev |
| HCA-18 | /terms, /privacy, /refunds | K / J Legal | Needs verification | Terms list 'MedLex, Carecraft, Serein, Lumen and Evinca'; refunds list MedLex, Carecraft, Serein, Lumen and Crown Pass; privacy covers the same four apps. None mentions the Gulf Nursing studio, which saves progress to the account, or the LSS Toolkit ($99 USD, its own sign-in). | Learners using or buying those products have no applicable terms, refund or privacy information. | P2 | Medium | Extend the legal pages to every product sold or linked as 'from the Academy', or state clearly which company's terms apply. Seek UK consumer-law review. | Small | Each product appears in terms, privacy and refunds, or links to its own operator's documents. | Owner + solicitor |
| HCA-19 | Serein first visit — https://serein.healthcarecrownacademy.co.uk/ and /#support | E Accessibility / B Safety | Confirmed defect | On first visit, a modal <dialog class='serein-hook'> ('Before anything else, let's take three easy breaths') covers the page, including the header 'Get help' button (Playwright: the click is intercepted by the dialog). It also opens on the deep link #support. Its only controls are 'Skip' and 'Continue when ready'; Escape closes it. | A distressed first-time visitor looking for urgent help must first get past a breathing exercise. It is one extra step, but in the wrong moment. | P2 | High | Add 'Need urgent help now?' inside the modal linking to Get help; never show the hook when arriving on #support or a help deep link; consider no auto-opening modal at all. | Small | On a clean profile, /#support shows crisis routes with no modal; the hook (if kept) contains a visible link to Get help reachable by Tab within 2 presses. | Front-end dev + clinical reviewer |
| HCA-20 | MedLex first visit — deep links (e.g., #library/term/myalgia, #learn) | A Navigation | UX issue | On a clean profile, any deep link opens the 'Decode your first term' modal over the requested content (screenshots medlex-desktop-_learn.png and others). | Shared links to a specific term or lesson do not land where promised, which adds friction for returning-via-link learners. | P2 | High | Suppress the onboarding modal when the URL contains a route beyond #home or #today. | Small | Opening /#library/term/myalgia on a clean profile shows the term page with no modal. | Front-end dev |
| HCA-21 | MedLex Today (mobile) | H Performance | Improvement opportunity | Lab only (Playwright Chromium 153, 390×844, 4× CPU throttle, local assets, no network latency): CLS 0.259; total long-task time beyond 50 ms ≈ 3.5 s; two infographics of ~320 KB each loaded at start behind the modal. | Content jumps and sluggish first interaction on mid-range phones. | P2 | Low | Reserve space for late content; lazy-load infographics; defer the modal and non-visible routes; code-split app.js (353 KB brotli). | Medium | Field data (CrUX or RUM) shows p75 CLS < 0.1 and INP < 200 ms on mobile. | Front-end dev |
| HCA-22 | Lumen (mobile) | H Performance | Improvement opportunity | Lab only, same conditions: the HTML document is 996 KB raw (~478 KB brotli estimate) because bundles are inlined; LCP 2.4 s with zero network latency. Inline HTML cannot be cached separately across versions. | Slow first load on mobile data. | P2 | Low | Externalise inline bundles into hashed, immutable files; keep the HTML small. | Medium | lumen index HTML < 50 KB; field p75 LCP < 2.5 s. | Front-end dev |
| HCA-23 | Vercel project evinca (and nclexrn-site) | H Performance / Reliability | Confirmed defect | Vercel deployment metadata: regions ['iad1'] (Washington DC) for both projects. Supabase project evinca is in London (HANDOVER.md, privacy notice). | Every server-rendered Evinca request that queries the database crosses the Atlantic twice; slower pages for UK and Gulf learners. | P2 | High | Set the Evinca function region to lhr1 (London) to sit next to the database. | Small | Evinca deployment shows region lhr1; median server response time for /en/account measured before and after. | Owner/dev |
| HCA-24 | Hosting plan — Vercel team themicrolaunchequation-langs-projects | L / J Compliance | Needs verification | HANDOVER.md: 'Vercel, team themicrolaunchequation-langs-projects, Hobby plan'. site/README.md: 'Vercel's free Hobby plan is for non-commercial use only.' Vercel fair-use docs: commercial usage requires Pro or Enterprise. The site advertises paid plans. | Risk of the service being restricted or suspended for plan misuse. | P2 | Medium | Confirm the current plan; move to Pro before or at commercial launch. | Small | The Vercel dashboard shows Pro for the team hosting production. | Owner |
| HCA-26 | SEO — sitemap.xml, MedLex Canvas lessons, Lumen | I SEO | Improvement opportunity | The sitemap lists 8 URLs. The ~56 public MedLex Canvas lessons (rich educational pages) are absent and have no meta description or canonical. Lumen has no og:image. App paths are served on every host (e.g., healthcarecrownacademy.co.uk/medlex/learn/... and serein.…/privacy return content), creating duplicates where canonicals are missing. | Useful learning pages are hard to find from search; shared Lumen links show no preview. | P2 | High | Add the Canvas lessons to the sitemap with canonicals on the medlex host and meta descriptions; add Lumen og:image; return 404 or redirect for app paths requested on the wrong host. | Medium | Sitemap includes all public lessons; each lesson has a self-canonical and a description; wrong-host app paths 308 to the canonical host. | Dev + content |
| HCA-33 | Subscriptions (when plans open) | K Legal readiness | Needs verification | Secondary legal sources (Wiggin tracker; Taylor Wessing, Apr 2026) report that the DMCC Act subscription-contract regulations are expected from 1 January 2027 (renewal reminders, cooling-off on renewals, easy exit). The refunds page already covers yearly reminders and easy cancellation. | Learners subscribing after commencement have new statutory rights. | P2 | Medium | Ask a solicitor to check checkout, reminders and cancellation against the final regulations before plans open. | Medium | Solicitor sign-off recorded before paid launch. | Owner + solicitor |
| HCA-35 | Serein — Get help routes | B Safety / E International | Improvement opportunity | Signposting is UK-only (999, NHS 111 option 2, NHS 24 111, Samaritans 116 123, Shout/FRONTLINE 85258, Lifeline NI 0808 808 8000), and Serein says so explicitly. The platform also targets Gulf and international nurses. | Learners in KSA, UAE or Qatar get no local crisis route. | P2 | Medium | Add a country selector with locally verified emergency and support numbers, each with a source and review date, checked by a qualified reviewer. | Medium | Each listed number has a cited source and a review date ≤ 12 months old. | Clinical reviewer + content |
| HCA-12 | Supabase — function hygiene | J Security / L | Improvement opportunity | Advisor: 2 functions with mutable search_path (gift_allowance, gift_list_of); 18 SECURITY DEFINER functions executable by anon, 34 by authenticated. Sampled privileged functions (crown_admin_overview, crown_generate_codes, set_reviewer, decide_app_fee, nominee_send_to_review) all check is_admin(); ownership functions check auth.uid(). No bypass was observed. | Low current risk; it reduces the chance of future mistakes. | P3 | Medium | Set search_path on the two functions; revoke anon EXECUTE on admin-only functions (e.g., crown_admin_overview) as defence in depth. | Small | The advisor shows 0 mutable search_path findings and no admin-only function is executable by anon. | Backend dev |
| HCA-25 | Repository documentation and stale configs | L Maintainability | Confirmed defect | site/README.md describes Netlify deployment; HANDOVER.md describes both a manual Cloudflare Worker zip upload and Vercel auto-deploy; site/netlify.toml and site/_headers carry a different, older CSP from vercel.json. | Indirect: a future maintainer may deploy to the wrong host or edit dead security headers. | P3 | High | Keep one DEPLOYMENT.md that matches reality (Vercel, branch, root dir); delete netlify.toml and _headers or mark them unused. | Small | The docs name one host; no unused hosting config files remain. | Dev |
| HCA-27 | Legacy MedLex pages — /medlex/learn/*.html (31) and quest pages | A Orphans | Confirmed defect | 31 legacy lesson pages (e.g., learn/cardiovascular.html) are still deployed but not linked from the app, which now uses the Canvas library; only sw.js references parts of learn/. | Outdated duplicates can surface in search and confuse learners. | P3 | High | Redirect each legacy page to its Canvas equivalent, or remove it and noindex. | Small | Requests for legacy URLs 308 to the matching Canvas lesson. | Dev |
| HCA-28 | MedLex Canvas lesson library — /medlex/learn/canvas | E Accessibility | Confirmed defect | axe-core 4.10.3: 7 color-contrast failures, e.g., .feature-line spans #61736a on #eef0e9 = 4.38:1 at 8–10 px. | Hard to read for low-vision learners and on phones in bright light. | P3 | High | Darken the text colour to ≥ 4.5:1 and raise the minimum size to 12 px. | Small | axe reports 0 color-contrast violations on the library page. | Front-end dev |
| HCA-29 | MedLex Today | E Accessibility | Confirmed defect | Two visible h1 elements: 'Make sense of medicine. One word at a time.' and 'Let's decode one word.' | Screen-reader users lose a clear page title. | P3 | High | Keep one h1 per view; demote the other to h2. | Small | Each MedLex route has exactly one visible h1. | Front-end dev |
| HCA-30 | MedLex onboarding modal header | D Visual | Confirmed defect | The crest renders as a blank cream circle (screenshot f_medlex-03). The hook copies document.querySelector('.hca-crest').innerHTML; suspected cause: the element is empty or absent when the hook renders (not verified). | A broken-looking logo on the very first screen. | P3 | Medium | Embed the crest SVG directly in the hook template. | Small | The MedLex hook shows the M crest on a clean profile. | Front-end dev |
| HCA-31 | 404 page | D Tone | UX issue | Heading: 'This page has flatlined.' | In a healthcare setting, a death metaphor can read as flippant to clinicians who have just lost a patient. | P3 | Medium | Use neutral copy, e.g., 'We can't find that page.' | Small | 404 copy contains no clinical-death metaphor. | Content |
| HCA-32 | Home FAQ vs /refunds | K Pricing | UX issue | FAQ: 'the law lets us reduce or remove the refund'. Refunds page: 'you will pay a proportionate amount… and we will refund the rest'. | Learners get two different answers to 'can I get my money back?'. | P3 | High | Align the FAQ with the refunds page, after legal review of the digital-content vs service characterisation. | Small | The FAQ and refunds page give the same rule. | Content + solicitor |
| HCA-34 | MedLex glossary | C Learning design | Improvement opportunity | The glossary has 1,480 entries, matching the claim. Only 95 (6%) have a full definition and worked example; 1,385 are one-line glosses. A sample of 12 glosses was accurate (e.g., epistaxis, tonometry, posthitis). | Learners get a meaning but rarely a usage example, which weakens transfer to clinical notes. | P3 | High | Prioritise examples for the most frequent clinical terms; say 'with curated examples for 95' to set expectations. | Medium | Coverage metric shown in the release notes; top-300 terms have examples. | Content |
| HCA-36 | Analytics (all apps) | L Product readiness | Improvement opportunity | No analytics or third-party requests were observed on any crawled page (positive for privacy). There is no way to measure discovery, sign-up, learning starts, completion or errors. | You cannot see where learners drop off or which content fails them. | P3 | High | Add privacy-preserving, cookieless, aggregate event counts (first-party endpoint, no identifiers) for a short list of funnel events plus client error reporting; complete a DPIA and update the privacy notice. | Medium | A dashboard shows weekly counts for 6 funnel events and JS error rate, with no personal identifiers stored. | Dev + owner |
| HCA-38 | Interest picker (#start) | A / K | UX issue | Selecting MedLex plus 'Prepare for nursing decisions' returns 'Your crown: MedLex + SNLE' and prices only MedLex (£6.99) and the Crown Pass; it says nothing about Gulf Nursing access or cost. | Learners preparing for Gulf licensure don't learn what they get or pay. | P3 | High | Show a Gulf Nursing line ('Saudi SNLE free; other exams: …') in the result. | Small | Each picker combination names every selected app with its access terms. | Front-end dev |
| HCA-39 | Other Vercel projects — nexusrn-public-beta, nexusrn-public-preview | A Scope | Needs verification | Listed in the team's Vercel projects; not linked from the platform; not inspected. | Possible orphaned public deployments with old or unreviewed NCLEX content under your brand. | P3 | Low | Confirm whether they are publicly reachable; delete or protect them. | Small | Neither project has a public production URL, or each is intentionally linked and reviewed. | Owner |


---

# Report 4 — Healthcare content and evidence review

**Status: AI screening by an auditor, not independent review by a qualified clinician. Nothing here constitutes clinical approval.**

## Sampling method

| Body of content | Size | Sample | Selection method |
|---|---|---|---|
| Gulf Nursing / SNLE main bank | 1,350 items | **28 items read in full** + **all 1,350 analysed by script** | Stratified: 2 items per high-risk stratum (medication maths, insulin/glucose, electrolytes, transfusion, obstetric/fetal, paediatric, stroke/neuro, suicide/psychiatric, airway/anaphylaxis, sepsis, delegation/scope), plus 6 random. Fixed seed 20261025. Related APGAR items were then reviewed for consistency. |
| Carecraft evidence cards | 13 | 11 checked against reference knowledge of the cited papers | All cards with numeric claims |
| Carecraft scenario questions | 30 topics × several items | 2 read in full (teach-back; risk communication) | Home sample + today's scenario |
| MedLex glossary | 1,480 | 12 entries | Random, seed 7 |
| Home page sample content | 3 snippets | 3 | All (heart rate card, teach-back item, tachycardia decode) |
| Serein crisis signposting | all numbers | all | Complete |

Full item-level notes are in `clinical-content-sample.csv`.

## Concerns identified

| Item | Concern | Source used | Needs qualified review |
|---|---|---|---|
| SNLE Q0331 | **Wrong key.** Grimace = 1 point for reflex irritability, so the correct total is 8 (D), not 9 (A). The bank's own Q0332 scores grimace as 1. | AAP Committee on Fetus and Newborn & ACOG, "The Apgar Score", *Pediatrics* 2015;136(4):819–822 / ACOG Committee Opinion 644 (via secondary citations; primary text not opened — fetch tool unavailable), accessed 25 Oct 2026 | Confirm and correct |
| SNLE bank | 79% of keys are the longest option; 65 keys are the only option without a full stop; 81% cue-answerable | Scripted analysis of the preserved bank | Item-writing review |
| SNLE bank | Rationales median 85 characters; distractor feedback is generic labels | Bank data; project's own `clinical-audit.md` | Option-level rationales |
| SNLE bank | Mixed glucose units (21 items mg/dL, 18 items with mmol/L) with no conversion | Bank data | Unit policy per regulator |
| SNLE bank | All 1,350 items self-flagged pending SME validation; 70 flagged "VERIFY Saudi/local policy"; 188 + 89 + 52 flagged for construct or wording review | Bank metadata | Full review before any paid or "aligned" claim |
| SNLE Q1167 (DKA, K⁺ 3.0) | Key correct. Note that sources disagree on whether the hold-insulin threshold is K⁺ < 3.3 or < 3.5 mmol/L under the 2024 consensus; this item is safe under either. | Umpierrez et al., *Hyperglycemic crises in adults: 2024 consensus report* (ADA/EASD/JBDS/AACE/DTS), *Diabetologia* / *Diabetes Care* 2024 — potassium section not opened; accessed 25 Oct 2026 | Confirm the threshold wording in any related item |
| SNLE Q0546 (magnesium toxicity) | Key correct; could name calcium gluconate per local protocol | Reference knowledge | Optional enhancement |
| Gulf Nursing marketing | "Set up for each regulator" (SCFHS, DHP, DHA, DOH) is not evidenced in the repo; the project's audit confirms only the SCFHS SNLE applicant guide | SCFHS SNLE Applicant Guide (cited in `apps/snle/reports/clinical-audit.md`); accessed via the repo's record | Blueprint check per regulator |
| Serein | UK-only crisis routes for an international audience | Numbers match the UK services named | Local numbers per country |
| Evinca honorees | 13 fictional people with AI portraits, indexable | Source | Editorial / legal |

**No concern found in the sample:** Carecraft evidence cards (figures match the cited studies); Carecraft teach-back and absolute-vs-relative risk items (keys and rationales sound); MedLex glosses (12/12 accurate); home heart-rate card (60–100 bpm adult resting, a conventional reference range); 26 of the 28 SNLE items (keys clinically defensible, though rationales are thin).

## Authorship, review dates, claims

- **Authorship and reviewer credentials:** none shown for any clinical content. Carecraft and Serein state "independent clinical peer review remains pending". SNLE committee claims were neutralised in source pending verification (good), but the home page then says "Approved for release by the Academy owner".
- **Review dates:** item-level review dates are absent across apps; Carecraft sources carry publication years.
- **Accreditation and endorsement claims:** appropriately disclaimed everywhere checked ("not CPD/CME", "Not endorsed by SCFHS, DHP, DHA or DOH", "ICO registration is not an endorsement"). The LSS "Green Belt… Certificate of Completion" names no certifying body; clarify that it is not an IASSC/CSSC certification.

## Extent unreviewed

- **SNLE:** 1,322 of 1,350 questions, 67 tools/posters, 350 dossier cases and 62 glossary entries were not reviewed item by item.
- **MedLex:** about 45 of 56 Canvas lessons, 1,468 glossary entries, the practice items and the "Coding basics" content (likely US/international coding systems; jurisdiction not checked).
- **Carecraft:** 30 lessons, 90 infographics and 22 activities (mostly unreviewed).
- **Lumen:** AI outputs (not testable).
- **Serein:** practice scripts (not reviewed).
- **Evinca:** guides and magazine (not reviewed).

**A qualified clinical reviewer should prioritise:** medication calculations, airway emergencies, transfusion, fluids and electrolytes, fetal monitoring, postpartum haemorrhage, suicide safety, paediatric emergencies, and every scoring or calculation item (APGAR, GCS, drip rates).

---

# Report 5 — Design, learning and market improvements

The recommendations below are tied to observed problems. A competitor comparison was attempted, but current competitor pages could not be inspected (the fetch tool was down and search results were thin or unreliable). **No competitor patterns are presented as evidence**; the patterns below are standard practice in healthcare item banks and are offered as recommendations only.

### Home page
1. **One product list, one count.**
   - Replace "Six apps… Also from the Academy: LSS" with "Six Crown Suite apps" and a visually separate "Partner product" card for LSS that names its seller.
   - Use one name per product.
   - Suggested hero sub-line: *"MedLex to understand, Lumen to study, Carecraft to practise, Serein to restore, Gulf Nursing to prepare, Evinca to be recognised."* (already good; keep it identical everywhere).
2. **A truthful data-storage strip** under the trust bar, e.g.: *"Your notes stay on your device in MedLex, Carecraft and Serein. Gulf Nursing and Evinca save to your account. Lumen's Academy AI sends only the text you choose. [How we use data]"*
3. **Gulf Nursing card status chip:** "Preview · clinical review in progress · free during preview". Remove "Approved for release by the Academy owner".
4. **Pricing:** while plans can't be bought, label the trial as "7-day free trial (when plans open)".

### Learning design (SNLE bank first)
5. **Option-level rationales.** For each wrong option: why a learner might choose it, why it is unsafe, and what to do instead, plus a cited source and a "last reviewed" date. This turns errors into learning.
6. **De-cue the items:** equalise option length and grammar, and replace absurd distractors with real misconceptions taken from the bank's existing `misconceptions` field.
7. **"Report a problem with this question"** button on every item, writing to an admin queue with the item ID. This is the fastest way to catch errors like Q0331.
8. **Honest readiness language.** Show "practice accuracy" rather than readiness until psychometrics exist; the bank's own metadata says it is unvalidated.
9. **MedLex:** add usage examples to the most frequent 300 glossary terms; link each lesson to its practice set.

### Interaction and accessibility
10. **No auto-opening modal on deep links** (MedLex, Serein), and a visible "Need urgent help?" link in Serein's welcome.
11. **Serein for international learners:** a country picker with verified local numbers (KSA, UAE, Qatar, Kuwait, Oman, Bahrain, Egypt, Jordan, Philippines, India…), each with a source and review date.
12. **Canvas library:** raise small text to ≥ 12 px and contrast to ≥ 4.5:1; give MedLex Today a single `h1`.
13. **Tone:** 404 copy "We can't find that page".

### Discovery
14. Put the 56 MedLex lessons in the sitemap with canonicals and descriptions; they are the strongest search asset (e.g., "cardiovascular medical terminology"). Add Lumen's OG image. Mark Evinca demo profiles `noindex`.
15. Register the property in Google Search Console and Bing Webmaster Tools to establish crawled vs indexed vs ranking.

---

# Report 6 — Prioritised implementation roadmap

*Provisional; effort and staffing have not been confirmed.*

## Phase 1 — Immediate containment (target: within 7 days)

| Work | IDs | Owner | Effort | Depends on | Verification |
|---|---|---|---|---|---|
| Verify `snle.`, `lss.` and `hello@`; hide dead links behind a flag | 01, 02, 37 | Owner + front-end | S | DNS access | Link check 200; test email received |
| Remove internal approval text; add "Preview — clinical review in progress" | 03 | Owner | S | — | Copy diff |
| Fix APGAR Q0331; scripted check of all scoring items | 04 | Item writer + dev | S | SNLE build | Regression test passes |
| Correct the privacy notice for Academy AI; add in-app notice and "no patient data" warning | 08, 16 | Owner + legal + dev | S–M | AI provider details | Notice live; first-use notice shown |
| `noindex` Evinca demo profiles or label them "Illustrative" in title and OG | 14 | Next.js dev | S | — | URL inspection |
| Enable leaked-password protection | 10 | Owner | S | — | Advisor clear |

## Phase 2 — Core journeys (target: 30 days)

| Work | IDs | Effort | Benefit |
|---|---|---|---|
| Single price source for paywall and pricing | 15 | S | Prevents misleading prices at launch |
| Consistent product naming everywhere | 17, 38 | S | Less confusion for first-time learners |
| Onboarding modals skip deep links; urgent-help link in Serein | 19, 20 | S | Shared links work; crisis route never gated |
| Extend legal pages to Gulf Nursing and LSS; solicitor review incl. DMCC subscription rules | 18, 32, 33 | M | Lawful launch of paid plans |
| Newsletter double opt-in, validation and rate limit | 11 | M | PECR consent evidence |
| Evinca functions to `lhr1`; confirm Vercel Pro | 23, 24 | S | Faster account pages; plan compliance |
| Baseline Supabase migrations into Git | 13 | M | Rebuildable, reviewable backend |

## Phase 3 — Learning, design, discovery, reliability (target: 90 days)

| Work | IDs | Effort |
|---|---|---|
| Session hardening: HttpOnly refresh cookie on the account host, short-lived access tokens, DNS inventory, self-host Lumen CDN scripts | 09 | L |
| SNLE de-cueing, option-level rationales, review dates; independent clinical review of high-risk domains | 05, 06, 07 | L |
| MedLex CLS, lazy infographics, code-splitting; Lumen HTML externalisation | 21, 22 | M |
| Sitemap and metadata for lessons; wrong-host redirects; legacy page redirects; Lumen OG | 26, 27 | M |
| Contrast and heading fixes; MedLex crest; 404 copy | 28–31 | S |

## Phase 4 — Longer term (supported by observed needs)

- Privacy-preserving funnel analytics and error reporting (HCA-36), so the 30/90-day changes can be measured.
- International crisis signposting (HCA-35).
- Glossary examples (HCA-34).
- "Report a problem with this question" plus an item-analysis dashboard.
- Account-synced progress (opt-in), because device-bound progress is the main returning-learner friction.

## Five improvements with the greatest learner benefit relative to effort

| Rank | Improvement | Why (basis) |
|---|---|---|
| 1 | **Fix or hide unbound app links** (HCA-01/02) | Small effort. If confirmed broken, it currently dead-ends the newest product from 6 entry points. |
| 2 | **Correct the Academy AI privacy disclosure and add a no-patient-data warning** (HCA-08) | Small effort; removes a material inaccuracy and protects learners who might paste clinical notes. |
| 3 | **Fix Q0331 and script-check all scoring items** (HCA-04) | One confirmed error in a 28-item sample suggests more; a script finds calculation-type errors cheaply. |
| 4 | **Let shared links and crisis help bypass onboarding modals** (HCA-19/20) | Two small conditionals; improves every shared link and removes friction from the crisis route. |
| 5 | **One price source and one naming scheme** (HCA-15/17) | Small edits that prevent misleading prices at launch and remove first-visit confusion. |

## Access needed to complete the audit (minimum)

1. **Network access to `*.healthcarecrownacademy.co.uk`** in this environment (environment settings → Network access → add the domain), or a session with the Claude browser extension on your machine. This enables live DNS, TLS, CDN, redirect and real-performance checks.
2. **A designated test account** (free tier, plus one premium/Crown grant) to test sign-up wording, recovery, session expiry, entitlements and cross-app sign-in. Ideally use a test email inbox you control.
3. **The SNLE and LSS hosting details**, or confirmation that they are not yet live.
4. **Google Search Console** (or an export) for crawled vs indexed vs ranking, and **CrUX/RUM** for field Core Web Vitals.
5. **A qualified nursing educator** (UK plus Saudi/Gulf scope) to review the high-risk SNLE domains and confirm HCA-04.

*Sources (accessed 25 Oct 2026): Vercel fair-use guidelines — https://vercel.com/docs/limits/fair-use-guidelines ; Wiggin DMCC Act tracker — https://www.wiggin.co.uk/insight/digital-markets-competition-and-consumer-act-tracker/ ; Taylor Wessing, "Subscription contracts: new regime under DMCCA delayed to Spring 2027" (Apr 2026) — https://www.taylorwessing.com/en/insights-and-events/insights/2026/04/subscription-contracts ; AAP/ACOG "The Apgar Score", Pediatrics 2015;136(4):819–822 (cited via secondary sources, e.g., https://wikem.org/wiki/APGAR) ; Hyperglycemic crises in adults: 2024 consensus report, summary — https://consultqd.clevelandclinic.org/hyperglycemic-crises-in-adults-the-2024-consensus-report ; Supabase database linter docs — https://supabase.com/docs/guides/database/database-linter ; W3C WCAG 2.2 — https://www.w3.org/TR/WCAG22/ (standard referenced; not fetched).*
