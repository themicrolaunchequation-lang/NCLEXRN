# The Crown Suite — plan for one academy, four apps, one account

Healthcare Crown Academy (HCA) · drafted 17 Oct 2026 · status: **awaiting approval of the decisions in §11**

## 1. The idea: four jewels, one crown

HCA stops looking like "a company with some apps" and becomes one recognisable product family, the **Crown Suite**. Each app is a jewel in the crown and covers one stage of a healthcare career:

| Jewel | App | Promise | Signature colour | Stage |
|---|---|---|---|---|
| Sapphire | **MedLex** | Understand the language of medicine | Sapphire `#2A45B8` on navy | Understand |
| Emerald | **Carecraft** | Practise better care, one minute a day | Learning teal `#087D7A` | Practise |
| Jade | **Serein** | Restore yourself between shifts | Serene sage `#2F6B5E` / `#9FD8C4` | Restore |
| Gold | **Evinca** | Be recognised for your impact | Crown gold `#D4A445` | Be recognised |

The shared base stays the same everywhere: midnight navy, cream paper, crown gold, the HCA crest, Fraunces/Playfair headings. Only the jewel colour changes. This is the unique identity: **nobody else in healthcare education sells a "crown" you build yourself, jewel by jewel.**

MedLex moves from gold to sapphire so gold belongs only to the crown itself (Evinca and the Crown Pass).

## 2. The home page

Goal: within five seconds a visitor understands "four apps, one account, pick what you need", and can open any app in one click.

### Header
- Keep the gold **Open Evinca** button style, and add the same gold style for the other apps without crowding the bar: the gold button becomes **Open an app ▾**. It opens a "crown dock" panel with four gold-rimmed launch buttons (jewel dot + name + one-line promise + "Open"). On phones it slides up as a sheet.
- Add **Pricing** and **Sign in** (avatar once signed in). Move "How it works", "Readiness check" and "FAQ" into the Evinca section and footer.

### Hero: "Build your crown"
- Headline kept in spirit: *Where healthcare excellence is learned, lived and crowned.*
- Under it, a row of four large **gold launch buttons**, one per app, each with its jewel glyph: Open MedLex · Open Carecraft · Open Serein · Open Evinca.
- The animated crest shows four empty settings; hovering or choosing an app lights its jewel.

### "Pick your interests" configurator (new section right after the hero)
Visitors tap what they want, not product names:
- "Understand medical words" → MedLex
- "Handle tricky moments at work" → Carecraft
- "Look after myself on hard days" → Serein
- "Get my work recognised" → Evinca

The crown lights the chosen jewels and builds a live recommendation: *"Your crown: MedLex + Serein — £9.98/month, or the full Crown Pass for £9.99/month."* The buttons go to **Start free** (account) or **Choose plan** (pricing with the selection pre-filled).

### Then, in order
1. **The four jewels**: the existing live mini-hooks (decode a word, 60-second scenario, one breath) plus Evinca's live record preview, each in its jewel colour.
2. **One account, everywhere**: sign in once, your progress, certificates and plan follow you across apps.
3. **Certificates**: one shared certificate design shown in all four jewel colours.
4. **Pricing**: Free / single app / Crown Pass, a monthly–annual switch and a "Have a code?" field.
5. Evinca story, how recognition works, readiness check, FAQ, join (all existing content, kept).

Motion stays calm: jewel glints on hover, crown assembling on scroll, all switched off with reduced motion. Every interaction works by keyboard and screen reader.

## 3. One account for everything (single sign-on)

### What exists today
- Evinca (`evinca.healthcarecrownacademy.co.uk`) is a static Next.js export. Sign-in uses Supabase Auth with the session stored in that site's browser storage (`evinca-auth`), so other sites cannot see it.
- The Supabase project `evinca` (London) already has `profiles` with `is_admin` (3 admins), payment tables, Stripe Checkout and webhook edge functions, and membership levels for Learn & tools.
- The home page and the three apps are static files on `healthcarecrownacademy.co.uk`.

### Design
- **One identity provider:** the existing Supabase project. No second user database.
- **One session for every subdomain:** store the Supabase session in a cookie on `.healthcarecrownacademy.co.uk` (Secure, SameSite=Lax) using Supabase's `@supabase/ssr` browser client, which splits large sessions across cookies. Evinca switches to the same client. Existing Evinca users are moved over silently the first time they visit, so nobody has to sign in again.
- **One account hub:** `account.healthcarecrownacademy.co.uk`, served by the Evinca project with an HCA-branded layout (not Evinca-branded). Pages: Sign in / create account, My apps, Plan & billing, Certificates, Profile, Admin.
- **One small script for the static sites:** `/assets/js/crown-account.js` (bundled, served from our own domain so the security policy allows it). It shows the account button, reads the signed-in user's entitlements, and opens the upgrade sheet. MedLex, Carecraft and Serein each load it.
- **Sign-in methods:** email + password and magic link now; Google later (needs a Google OAuth app).
- Learning records keep working offline in the browser exactly as today. Signed-in members can optionally sync progress to their account (needed for certificates and for switching devices).

## 4. Free and paid: what each plan unlocks

Free access needs only an account. The paywall is a **soft gate**: a friendly sheet with "Unlock with Crown Pass / Start a free trial", never an error.

| App | Free (account) | Premium |
|---|---|---|
| MedLex | Modules 1–3, word-part decoder, 10 practice items a day, 6 illustrated guides | All 26 modules and 1,480 terms, all 56 guides, worksheets and exports, unlimited spaced practice, certificate |
| Carecraft | Daily 60-second scenario, 6 of 30 lessons, 3 practice activities, core toolkit | All 30 lessons and 90 visual guides, all 22 activities and simulations, Smart Review, certificate |
| Serein | **All 15 practices, check-ins, journal and the "Get help" support pages, always free** | Journeys, routine builder, insights history, team toolkit and shared sessions, infographic library, certificate of participation |
| Evinca | Free story and existing levels (unchanged) | Crown Pass members get 15% off recognition assessment fees |

Serein's core stays free on purpose: support for people who are struggling should never sit behind a payment.

Honest limit: because these apps run in the browser and work offline, a technical user could bypass a browser-only gate. Phase 5 closes this by moving premium content (MedLex modules 4–26, Carecraft lessons 7–30 and their guides, Serein journeys) into the private storage bucket that Evinca already uses for Learn & tools, delivered only to entitled accounts.

## 5. Prices: at least 50% below the market

All prices in GBP, VAT-inclusive wording to be confirmed with an accountant. Comparator prices as published in Oct 2026 (USD figures converted at roughly £0.75 per $1).

| Plan | Closest comparator | Comparator price | HCA price | Saving |
|---|---|---|---|---|
| Serein | Headspace / Calm | $12.99–14.99 a month, $69.99 a year (≈ £10–11 / £52) | **£4.99 a month · £24.99 a year** | ~50–52% |
| Carecraft | RCNi Plus (UK nursing CPD learning) | £10.50 a month | **£4.99 a month · £49.99 a year** | 52% monthly · 60% yearly |
| MedLex | Osmosis LPN plan; one-off terminology courses | $29 a month, $249 a year (≈ £22 / £187); courses $224–249 one-off | **£6.99 a month · £49.99 a year** | 68% monthly · 73% yearly |
| **Crown Pass** (all three apps + Evinca perks) | The three comparators together | ≈ £42.50 a month | **£9.99 a month · £79.99 a year** | 76% |

- Annual plans show "2 months free or better".
- A **7-day free trial** of the Crown Pass, card required, cancel any time from the account hub.
- Optional later: team and institution licences (per-seat pricing for wards and universities).

Sources: [Headspace pricing (Udonis)](https://www.blog.udonis.co/statistics/headspace), [Calm pricing (Carepaths, Feb 2026)](https://carepaths.com/calm-app-pricing/), [EE Calm offer](https://ee.co.uk/help/subscriptions/calm-app), [Lecturio Nursing pricing](https://lecturio.com/nursing/pricing), [Osmosis LPN plan](https://osmosis.org/plans/lpn), [Osmosis MD plan](https://osmosis.org/plans/md), [RCNi subscription](https://secure.rcni.com/subscribe/learning), [Conestoga medical terminology course](https://continuing-education.conestogac.on.ca/courses/HEAL1890).

## 6. Discount codes

### How codes work
- Codes live in our own database, so the admin creates them without opening Stripe.
- At checkout the edge function checks the code (active, not expired, uses left, valid for this plan), then applies a matching Stripe coupon. A **100% code** skips Stripe entirely and grants access directly (for staff, partners and reviewers).
- Each code records who redeemed it and when.

### 50% test codes (for you)
Ten single-use codes, 50% off the first 3 months of any monthly plan or the first year of any annual plan, valid until 31 Dec 2026. They become active when phase 3 is deployed, and work in Stripe test mode first:

```
CROWN50-XPGX-X8H7   CROWN50-AZA3-W9PS   CROWN50-UJRE-GZQE   CROWN50-KVZ6-N5TY   CROWN50-RXGN-R2K6
CROWN50-XETV-JWFA   CROWN50-8C53-BBFT   CROWN50-BD7F-N7YV   CROWN50-GFMD-WD2A   CROWN50-HJKF-HE2U
```

## 7. One admin for everything

The three existing Evinca admins (`profiles.is_admin`) become Crown admins. No second admin login. The **Crown Admin** console in the account hub has these tabs:

- **Overview:** members, active plans by app, trials, monthly recurring revenue, cancellations, code redemptions.
- **Members:** search, view plan and progress, grant or remove free access with an end date and a reason.
- **Plans & prices:** display prices, trial length, Stripe price IDs (test and live), on/off.
- **Discount codes:** a generator with prefix, how many, percent off, duration (once / for N months / forever), which plans, start and end dates, uses per code, and a campaign name. Then list, search, deactivate and export CSV.
- **Certificates:** issued list, reissue, revoke (revocation shows on the public verify page).
- **Settings:** test mode and live mode switches, reusing the existing `app_settings`.

All admin actions are recorded in an audit table.

## 8. Certificates: the Evinca design in four jewels

- One template, based on Evinca's existing A4 landscape certificate (gold-foil frame, guilloche background, microtext border, serial number, embossed seal, holographic mark, QR code to the live record). Only the jewel colour, app crest, title and wording change.
- Every certificate gets a serial (`MLX-2026-000123`, `CCR-…`, `SRN-…`, `EV-…`) and a public verify page on the existing `/verify` route.

| App | Earned by | Title |
|---|---|---|
| MedLex | Completing all 26 modules with module checks at 80% or above | Certificate of Completion: Medical Terminology |
| Carecraft | Completing a 10-lesson pathway and its checks | Certificate of Completion: Communication & Safety Pathway |
| Serein | Completing a 7-day journey | Certificate of Participation: Well-being Journey |
| Evinca | Unchanged recognition process | Unchanged |

Every app certificate carries a clear line: *"Self-paced educational completion. Not a licence, accreditation or assessment of clinical competence."*

## 9. Technical blueprint

**Database (one migration in Supabase project `evinca`):**
- `crown_plans`, `crown_subscriptions`, `crown_grants`
- `crown_codes`, `crown_code_redemptions`
- `crown_progress` (opt-in sync), `crown_certificates`, `crown_admin_audit`
- Row-level security: members read only their own rows; codes, grants and audit are admin-only.
- Functions: `crown_entitlements()` (what the signed-in person can open), `crown_generate_codes(...)`, `crown_issue_certificate(app, program)`, `crown_verify(serial)` (public), `crown_admin_overview()`.

**Edge functions (same pattern as the existing Stripe ones):**
- `crown-checkout`: creates a Checkout Session in subscription mode with a code check and the trial.
- `crown-portal`: opens Stripe's billing portal so members can cancel or update their card.
- `stripe-webhook`: extended with `customer.subscription.created/updated/deleted`, `invoice.paid` and `invoice.payment_failed`.

**Front end:**
- Home page: header dock, hero buttons, configurator, pricing section.
- `crown-account.js`: account button, entitlement check and upgrade sheet.
- Small gating hooks in each app build (`build-web.mjs`), like the first-visit hooks.
- Account hub and admin console as new pages in the Evinca codebase.

## 10. Phases

| Phase | What ships | Needs from you |
|---|---|---|
| **1. Identity and home page** | Jewel system; gold launch buttons in header and hero; "Pick your interests" configurator; pricing section marked *Launching soon* with a waitlist; certificate design previews | Approve prices and names |
| **2. One account** | Shared session across all subdomains, account hub at `account.…`, account button in every app, free and premium soft gates, optional progress sync | Cloudflare DNS record for `account`; add the domain in Vercel; add redirect URLs in Supabase Auth |
| **3. Subscriptions and codes (test mode)** | Plans, checkout, billing portal, webhook, discount engine, Crown Admin console, your 10 test codes live in test mode | Create a Stripe **sandbox** and add its keys as Supabase secrets (never in chat) |
| **4. Certificates** | Four-jewel certificates, issuing rules, verify pages, admin issue and revoke | Signature image or name for certificates |
| **5. Go live and harden** | Live prices, premium content in the private bucket, final QA | Stripe account activation, solicitor review of terms, refund and cancellation policy (UK 14-day rules for digital content), VAT advice, privacy notice update |

Phases 1 and 2 cost nothing to run. Payments are never switched on until you complete the phase 5 checklist.

## 11. Decisions needed before building

1. **Prices:** approve the table in §5, or adjust.
2. **Serein free scope:** keep core practices and support free, as recommended?
3. **Account hub address:** `account.healthcarecrownacademy.co.uk` (recommended), or keep accounts inside Evinca's address?
4. **Order:** start with phase 1 now and phase 2 straight after (recommended)?
