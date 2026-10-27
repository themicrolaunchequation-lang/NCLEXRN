# Legal update, 27 October 2026: what changed and what only you can confirm

The terms, refunds and privacy pages (main site), the Lean Six Sigma legal page and Evinca's policies were rewritten against the legal review. The code was changed where the pages needed it to be true. This is not a solicitor's sign-off: have a UK consumer and data-protection solicitor read the three main pages, the Lean Six Sigma page and Evinca's terms before taking real money.

## Done in code (live)

| Review point | What changed |
|---|---|
| Cancellation period counted wrongly | Refunds now allowed until the end of the 14th day after the day of purchase (Academy and Lean Six Sigma). Pages say "ends 14 days after the day you bought", with an example. |
| Classify services vs digital content | Pages state each paid plan is an ongoing online service; refunds follow the services route (proportionate deduction after an express early-start request). |
| Generic "start now" checkbox | New wording asks for access to start during the 14-day period and explains the proportionate deduction; separate from marketing; version `2026-10-27b` and time recorded in Stripe metadata; repeated on the Stripe receipt. |
| Model cancellation form | Added to the refunds page and the Lean Six Sigma refund policy (optional to use). |
| Stop renewal vs cancel-and-refund | Plans page and account page now offer two clearly labelled actions: "Stop renewal or update card" and "Cancel and get a refund", with an explanation. |
| Trial and 14 days | Pages explain the contract starts at trial start, conversion does not start a new 14-day period, and trial days are never charged (refund calculation uses paid days only). |
| Annual price prominence | Yearly plans now show the yearly charge as the main price; monthly equivalent is secondary. Crown Pass card shows "£0 today, then £X a year on [date], renewing automatically". |
| No refunds after 14 days | Replaced with statutory remedies (repair, replacement, price reduction up to full refund) that apply at any time; "one refund per person" now applies only to the instant button, never to legal rights. |
| Price and feature changes | Price fixed for the paid term; increases only at renewal with 30 days' notice; detrimental feature removal gives a cancel-and-refund right. |
| Suspension | Grounds, notice, chance to remedy, review by someone not involved, renewals paused, pro-rata refund if not your fault. |
| Licence | Personal learning plus showing content while teaching your own lesson; organisational use needs a team plan. Accounts are personal (household sharing removed). |
| Clinical disclaimers | Terms describe what each app does and does not do (no diagnosis, treatment, monitoring); Serein states it is not monitored, with emergency numbers. |
| Age boundary | Accounts from 16; paid plans 18+ or with parental agreement; Evinca 18+ and an Academy account does not grant Evinca. Privacy notice lists protections for young users. |
| Lumen Academy AI disclosure | Privacy notice now describes both routes (Academy AI via our server to OpenAI, then Groq, then Gemini; and your own key), inputs, outputs, quotes, caching, retention and transfers. |
| Shared AI cache | Fixed: the cache is now private to each person (cache key includes the user id), tested. Old shared entries are cleared by the retention SQL. |
| Streak cookie (hca-daily) | Privacy wording corrected (browsers send it to our domain; servers do not read it). Added an off switch on the account page that deletes it and remembers the choice (hca-daily-off). |
| Serein data | Checked the code: journal and check-ins never leave the device (only its own offline files are fetched). |
| Supplier roles and transfers | Table of providers with role (processor; Stripe also independent controller) and location; transfer route stated. |
| Retention schedule | Table with trigger per category. Retention SQL written to enforce AI cache 30 days, AI counts 90 days, sign-in logs 90 days, enquiries 24 months (see below). |
| Data-protection complaints | Process added: acknowledge within 30 days, then investigate; ICO route. |
| Evinca refund stages | Statutory 14-day right now stated separately; stage refunds are "at least" amounts; remedy for poor service at any stage. |
| Evinca publication conflict | One rule: withdrawal removes name and content within 30 days; revoked records keep only the "Revoked" status on the verification link for up to six years (objection possible); distributed copies cannot be recalled; copyright licence vs data-protection basis explained. |
| Lean Six Sigma legal page | Old Netlify address removed; provider is now HEALTHCARE CROWN ACADEMY LTD; Stripe replaces "merchant of record"; certificate limits, privacy (Frankfurt), retention, complaints and refund policy updated. |

## You need to do or confirm

1. ~~**Run the retention SQL**~~ **Done 27 Oct 2026.** Both daily jobs confirmed running: `hca-retention` (Academy, 03:17 UTC) and `lss-retention` (Lean Six Sigma, 03:23 UTC).
2. **Stripe reminder emails** (the refunds page promises them): in Stripe, Settings → Billing → Subscriptions and emails, turn on "Send a reminder email before a subscription renews" (yearly) and "Send a reminder email before a free trial ends". Also turn on receipt emails for successful payments and refunds. Do this in the sandbox and later in live mode.
3. ~~**VAT**~~ **Confirmed: not VAT-registered.** Pages now say "We are not registered for VAT, so no VAT is added: the price shown is the total you pay." Leave Stripe Tax off. Watch the UK threshold (taxable turnover over £90,000 in any rolling 12 months means you must register within 30 days; then pages and Stripe must change). Ask an accountant once about overseas digital-services VAT/GST for Gulf and EU buyers.
4. **Gemini training terms** (now handled in code: Academy AI skips Gemini unless the secret `LUMEN_AI_GEMINI_PAID` is set to `true`; set it only after confirming a billed Google project): the privacy notice says AI providers do not train on Academy AI data. That is true for OpenAI's and Groq's APIs; for Google Gemini it is true only on the paid tier. Make sure the Gemini key is on a billed (paid) Google project, or remove Gemini from the `LUMEN_AI_PROVIDERS` secret (set it to `openai,groq`).
5. **Supplier agreements (DPAs)**: these are between the company and its own suppliers, not with customers, so customers never accept them at sign-up. Customers are told about suppliers in the privacy notice, which is already done. What you do, once, in about an hour:
   - Make a folder "Supplier agreements" (Google Drive is fine).
   - For each supplier in `RECORDS-OF-PROCESSING.md` part B, open the link while signed in to that supplier's account. Most (Stripe, Vercel, Cloudflare, Netlify, Groq) say the DPA is already part of the terms you accepted when you opened the account: save the page as PDF, name it `Supplier - DPA - date.pdf`.
   - Two need an action: **Supabase** (dashboard → Organization settings → Legal documents → request/sign the DPA) and **OpenAI** (fill in the DPA form on the link to have it signed). Save the signed copies.
   - In a one-page sheet, note per supplier: date saved, where data is held, transfer route (most US suppliers rely on the UK–US data bridge or the UK Addendum in their DPA), and their sub-processor list link.
   - Look again once a year or when you add a supplier.
6. **DPIA screening** for Academy AI (drafted: `DPIA-SCREENING-ACADEMY-AI.md`; read, tick and sign) (AI plus possible health-related text and young users): a short written screening, and a full DPIA if the screening says so.
7. **Account closure process** (step-by-step in `RECORDS-OF-PROCESSING.md`): when someone asks to close their account, delete or anonymise it within 30 days (the privacy notice promises this).
8. **Marketing unsubscribe**: check that every marketing email has a working unsubscribe link and that unsubscribed emails go on a do-not-contact list.
9. **Evinca before paid launch (June 2027)**: add an express "start the review now" request at Evinca checkout and show the refund calculation; enforce the 18+ check at Evinca sign-up.
10. **Subscription rules from 1 January 2027** (subject to Parliament): renewal and trial reminders, the extra cooling-off after qualifying renewals, and easy online cancellation. I can build these once the final regulations and guidance are published.
11. **Price-comparison claims**: avoid "half the market price"-style claims unless you keep dated evidence of comparable products. The current pages make no such claim.
12. **Solicitor review** of: /terms, /refunds, /privacy, the Lean Six Sigma legal page and Evinca's terms, privacy and fees pages. Everything a solicitor or legal AI agent needs, including the brief to give them, is in one file: `LEGAL-REVIEW-PACK.md` (PDF copy `LEGAL-REVIEW-PACK.pdf`).
