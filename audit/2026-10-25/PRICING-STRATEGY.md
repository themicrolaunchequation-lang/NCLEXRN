# Pricing review and recommended "killing" price list

**Date:** 25 October 2026 · **Status:** recommendation only. No prices were changed anywhere.

**How the market data was collected:** web search on 25 Oct 2026; full rows with sources are in `market-price-scan.csv`. The page-fetch tool was down, so most figures come from search summaries of vendor pages, app-store trackers and review sites, **not** from checkout pages. Treat every competitor figure as indicative and confirm it at checkout before publishing comparisons.

---

## 1. What you charge today: three different price lists

| Plan | Home page (`site/home.html`) | Paywall pop-up (`crown-account.js`) | Database `crown_plans` (what checkout would charge) |
|---|---|---|---|
| Crown Pass monthly | £9.99 | £9.99 | £9.99 (7-day trial) |
| Crown Pass yearly | £69.99 | — | **£79.99** |
| MedLex monthly / yearly | £6.99 / £49.99 | **£4.99** / — | £6.99 / £49.99 |
| Lumen monthly / yearly | £5.99 / £42.99 | **£4.99** / — | £5.99 / **£49.99** |
| Carecraft monthly / yearly | £4.99 / £35.99 | £4.99 / — | £4.99 / **£49.99** |
| Serein monthly / yearly | £4.99 / £35.99 | £4.99 / — | £4.99 / **£24.99** |
| Gulf Nursing (SNLE) | "Saudi Arabia is free"; other exams unpriced | not in paywall | **not in database** |
| Evinca | USD 79 – 3,900 per route (`lib/program.ts`) | — | server-calculated, USD |
| LSS Toolkit | USD 99 / 12 months, one-off | — | separate seller (Health Quality Leaders Ltd) |

**Fix first, whatever prices you choose:** one source of truth (the `crown_plans` table) that the home page, paywall, JSON-LD and checkout all read. Otherwise any new price list will drift again.

---

## 2. Value check: what each app is really worth to a learner

| App | What a buyer gets (verified in code) | Comparable products and indicative prices | Value verdict |
|---|---|---|---|
| **MedLex** | 26 modules, 1,480 terms (only 95 with full definitions and examples), 56 illustrated Canvas lessons, word-part studios, spaced practice | Picturing Medicine **$4.99/mo, $34.99/yr**; Picmonic $12.99–14.99/mo; DeanVaughn $11–19/mo; Quizlet Plus ~£6.31/mo; Anki free | Strong content, but terminology is a **finite course**: learners finish in weeks and then churn. £6.99/mo sits above the cheapest direct rival. |
| **Lumen** | PDF/photo reader, highlights, recall cards, focus planner, AI help (Academy AI or own key) | RemNote Pro $8–10/mo; StudyFetch $8–19/mo; Knowt ~$12.49/mo; Quizlet Plus ~£6.31/mo | Competitive feature set. **Each AI call costs you money**, so price above your AI cost per active user. |
| **Carecraft** | 30 lessons, 90 infographics, 22 activities, daily 60-second scenario, accurate evidence cards; **not CPD-accredited** | RCNi Plus **£10.50/mo** (175+ accredited-style CPD modules, trial £5.25); NHS e-LfH free for NHS staff | Good quality, but a much smaller library than RCNi and no CPD status. It must be priced well under RCNi. |
| **Serein** | 15 practices, journeys, Get help (always free) | Headspace £49.99–69.99/yr; Calm £39.99–49.99/yr; **Unmind free for NHS staff until 31 Dec 2026** | Small library against huge free and cheap alternatives. Charging exhausted nurses for well-being also carries a reputational cost. |
| **Gulf Nursing studio** | 1,350 questions, 67 tools, 350 cases, 4 regulators; **all pending clinical review**; 81% of items guessable from answer cues | Gulf MCQ banks **$69–99 for 6–12 months**; Phoenix RN $99 lifetime; free banks exist; UWorld NCLEX $139/30 days | Large and well featured, but **cannot ethically be sold until clinically reviewed** (your own release record says keep it free). After review, it is your most marketable product. |
| **Crown Pass** | All four apps + 15% off Evinca + "all certificates" (certificates **not built yet**, see `CERTIFICATES-AUDIT.md`) | Bundle of the above | The bundle is your best weapon: no competitor offers terminology + AI study + scenarios + well-being + Gulf prep together. |
| **Evinca** | Evidence-reviewed recognition record, verify page, certificate | Most clinical-excellence awards are nomination-based and free to enter (general knowledge, not verified this session); paid entry is common only for organisational awards | Pay-to-be-recognised invites "vanity award" criticism. Keep individual fees low and lead with free routes. |
| **LSS Toolkit** | 30 DMAIC tools, 9 statistical engines, 10 simulations, exam, Certificate of Completion | Green Belt courses **$300–2,500**; exam-only $159–395 | **$99 is already a killer price.** Fix the certificate wording before pushing it (see certificates audit). |

---

## 3. Recommended price list ("killing" but sustainable)

**Pricing principles:**
1. **Win on the bundle.** Make the Crown Pass so cheap that nobody buys single apps.
2. **Annual first:** lower churn, and payment fees fall as a share of the price.
3. **Time-limited passes, not subscriptions, for exam prep:** exam candidates hate auto-renewal.
4. **Regional fairness** using the World Bank bands Evinca already uses.
5. **Serein stays free**, as acquisition and mission.

### 3.1 UK / high-income price list (GBP, VAT included)

| Product | Today (home page) | **Recommended** | Versus market |
|---|---|---|---|
| **Crown Pass** monthly | £9.99 | **£5.99** | Below RCNi Plus (£10.50) for five apps |
| **Crown Pass** yearly | £69.99 (DB £79.99) | **£39.99** (= £3.33/mo) | Cheaper than Headspace alone (£49.99+) |
| Crown Pass, **founding members** (people who reserved before launch) | — | **£29.99 for the first year**, then £39.99. Offer ends on a stated date. | Genuine time-limited offer (see guardrails) |
| MedLex | £6.99 / £49.99 | **£2.99/mo or £19.99/yr**, plus a **£29.99 lifetime** option | Undercuts Picturing Medicine ($34.99/yr) |
| Lumen | £5.99 / £42.99 | **£4.99/mo or £34.99/yr** (Academy AI daily allowance); free tier: unlimited with your own key, 3 sources | Below RemNote and StudyFetch; covers AI cost (confirm cost per user) |
| Carecraft | £4.99 / £35.99 | **£2.99/mo or £19.99/yr** | About 70% below RCNi Plus |
| Serein | £4.99 / £35.99 | **Free for everyone** (all 15 practices) | Beats Headspace, Calm and Unmind on price; builds trust and traffic |
| Gulf Nursing: Saudi SNLE | Free | **Free** (keep while in preview; consider permanently free as a lead magnet) | Beats every paid SNLE bank |
| Gulf Nursing: Qatar, Dubai, Abu Dhabi | Unpriced | **Free during clinical-review preview.** After a documented review: **USD 39 for 3 months, USD 59 for 12 months** per exam, or **included in the Crown Pass** | Undercuts the $69–99 Gulf banks |
| **Gulf Exam Pass** (all four exams, no renewal) | — | **USD 79 / 12 months, one-off** | Cheaper than one competitor bank per exam |
| Student discount | Email us | **50% off with a verified student email** | Matches RCNi's student pricing logic |
| Teams (5+ seats) | Email us | **£24/seat/yr** for the Crown Pass, invoiced | Simple and quotable |

### 3.2 Regional pricing (reuse Evinca's World Bank bands)

| Band | Examples | Crown Pass yearly | Gulf Exam Pass |
|---|---|---|---|
| A: high income | UK, Saudi Arabia, UAE, Qatar, Kuwait, Oman, Bahrain | £39.99 / SAR 189 / AED 185 | USD 79 |
| B: upper-middle | Jordan, Malaysia, Turkey, South Africa | ~£24.99 equivalent | USD 49 |
| C: lower-middle and low | Egypt, India, Philippines, Pakistan, Nigeria, Kenya | ~£14.99 equivalent | USD 29 |

Charge in the learner's local currency, rounded to local price points. Assign the band from the billing country (Stripe supports multi-currency prices). Many Gulf-bound nurses come from Band C countries, so this is where volume is.

### 3.3 Evinca (USD): recommended adjustments

| Route | Today | Recommended | Why |
|---|---|---|---|
| Spotlight Story | 0 | 0 | Keep free |
| Verified Spotlight | 19 | **9** | Impulse price; the volume driver |
| Rising Star | 79 | **39** | Early-career nurses are price-sensitive |
| Individual dossier | 149 | **79** | Lowers "pay-to-win" criticism; Crown Pass 15% off still applies |
| Leadership dossier | 249 | **149** | More review work; keep a premium |
| Team (≤ 8 people) | 499 | **299** | About $37 per person |
| Band C access price | 50% | **Keep 50%** | Already fair |

Decide on Evinca prices only after the honoree and certificate issues are fixed (`AUDIT-REPORT.md` HCA-14; `CERTIFICATES-AUDIT.md`).

### 3.4 LSS Toolkit
Keep **USD 99 / 12 months**, with an optional **USD 69 launch price** with a real end date. Only do this after the certificate seal and verification are fixed and the seller (Health Quality Leaders Ltd vs Healthcare Crown Academy Ltd) is stated on the page.

---

## 4. Will the low prices pay?

Rough unit economics to check with your own numbers (fill in the inputs in `PROMPTS.md`, Part A4):

| Item | Assumption to confirm |
|---|---|
| Card fees (Stripe, UK cards) | Use your actual rate from Stripe pricing. At £2.99/month, fixed per-transaction fees take a large share, which is why annual plans are pushed. |
| VAT | Prices shown include 20% VAT once you are VAT-registered: £39.99 incl. VAT = £33.33 net |
| Academy AI cost | Your cost per Lumen user per month, which sets Lumen's floor |
| Hosting | Vercel Pro is needed for commercial use (audit HCA-24) |
| Break-even | Fixed monthly costs ÷ net revenue per Crown Pass ≈ number of members needed |

**Rule:** never price a plan below (AI cost + payment fees + VAT) for a heavy user. The free tier and Serein are your marketing budget; everything else must cover its cost.

---

## 5. Guardrails: low prices without legal or reputational trouble

1. **No fake "was" prices.** Only show a struck-through price that you actually charged for a meaningful period. Founding offers need a real end date. *UK consumer protection rules on unfair commercial practices (DMCC Act 2024, in force since April 2025) apply; a solicitor should confirm.*
2. **Subscription rules:** the DMCC subscription-contract regulations are expected from **1 January 2027** (secondary legal sources). Build renewal reminders and easy cancellation now; your refunds page already promises them.
3. **Don't sell what isn't built:** "All certificates" and "Completion certificate" must be removed from pricing until certificates exist (see `CERTIFICATES-AUDIT.md`).
4. **Don't sell unreviewed exam content.** Gulf exams stay free until a dated clinical sign-off exists.
5. **Comparisons:** if you publish "cheaper than X", re-verify X's price on the day and keep a dated screenshot.
6. **One price source** (`crown_plans`) feeding every surface.

*Sources: see `market-price-scan.csv` for every competitor figure and URL (accessed 25 Oct 2026).*

---

## Applied 26 October 2026 (owner approval)

Live on healthcarecrownacademy.co.uk and in `public.crown_plans` (checkout source):

| Plan | Monthly | Yearly |
|---|---|---|
| Crown Pass (MedLex, Lumen, Carecraft; 15% off Evinca) | £5.99 | £39.99 |
| MedLex | £2.99 | £19.99 |
| Lumen | £4.99 | £34.99 |
| Carecraft | £2.99 | £19.99 |
| Serein | Free for everyone (paid plans deactivated, never gated) | — |

Not yet applied (need a decision or a build): MedLex lifetime £29.99, founding-member offer (needs an end date), Gulf exam passes (after clinical review), regional band prices (needs Stripe multi-currency prices), Evinca fee changes (database fee rules and Stripe checkout; decide after the trust fixes settle). Payments remain switched off until Stripe is activated.
