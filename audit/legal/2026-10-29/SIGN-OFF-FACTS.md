# Sign-off facts pack

**HEALTHCARE CROWN ACADEMY LTD** · prepared 29 October 2026 · for our solicitor and our accountant

This pack sets out the facts you need to review and sign off our business before we take real money. It is a statement of facts, not legal or tax advice. Where we do not know something yet, it says **[to confirm]**. Please do not rely on any tax statement in this pack: every statement about tax is our current understanding only and is **to be confirmed by the accountant**.

Contact for questions: **themicrolaunchequation@gmail.com**. We reply the same day where we can.

---

## 1. The company

| Fact | Detail |
|---|---|
| Legal name | HEALTHCARE CROWN ACADEMY LTD |
| Type | Private company limited by shares, registered in England and Wales |
| Company number | 17501904 |
| Registered office | 71-75 Shelton Street, Covent Garden, London WC2H 9JQ. This is a **registered-office service address**. Nobody works there. |
| ICO registration | ZC273259 |
| VAT | **Not VAT-registered** in the UK or anywhere else |
| People | One director. No employees. |
| Director's name | [to confirm] |
| Shareholders | [to confirm] |
| Date of incorporation | [to confirm] |
| Financial year end | [to confirm] |
| Contact email (used on every page) | themicrolaunchequation@gmail.com |
| Trading names | Healthcare Crown Academy; Evinca (trading name of the company) |

### Where the business is actually run
- **The business is run day to day from Saudi Arabia and Jordan**, where the director lives. Nothing is done from the UK.
- City or cities, and how time is split between Saudi Arabia and Jordan: [to confirm]. Earlier papers mention Riyadh.
- Whether the director has a business address, office or coworking space in either country: [to confirm].
- The director's residence and work status in Saudi Arabia and Jordan: [to confirm].
- The Stripe account lists the director's address in Riyadh and a Saudi support phone number (from an earlier brief; [to confirm it is still current]).
- Our customer pages currently show **only** the London registered office and the email address. They do not say where the business is run from.

---

## 2. Status today

- **No real money has been taken.** Stripe is in **test mode**.
- Live payments are **blocked in the code** for the Crown Pass, Gulf Pass and Green Belt. They only start when the owner sets a switch called `LIVE_PAYMENTS_APPROVED=yes`. Without it, a live checkout is refused.
- Evinca paid reviews are **off until June 2027**. Evinca has its own separate readiness check.
- Test-mode purchases no longer unlock paid access for the public (fixed 29 October 2026).
- We will not set the live switch until we have your written sign-off (or until every "must fix" item you list is done).

---

## 3. What we sell

All sales are online, through Stripe Checkout, mostly to **consumers**. Prices are shown as the total the customer pays. Our pages say "No VAT added" (main site) or "We do not add UK VAT while we are not UK VAT-registered" (Green Belt page).

### 3.1 Crown Pass (subscription)
- Premium access to our learning apps: **MedLex** (medical terminology modules, guides, printable worksheets), **Carecraft** (scenarios, lessons, activities; downloadable offline edition), **Lumen** (a study tool that works on the user's own notes on their device). **Serein** (relaxation and reflection) is free for everyone.
- **£5.99 a month or £39.99 a year.** Renews automatically until stopped.
- **7-day free trial.** Nothing is charged if cancelled in the trial.
- **Founding offer:** first year £29.99 for people who join by 31 January 2027, then it renews at £39.99 a year. A reminder is promised before renewal.
- **Decided price rise:** from 1 February 2027 the yearly price is £49.99 for **new** members only. Existing members keep their price and get 30 days' notice of any change.
- **Regional prices** (in US dollars), shown to buyers who choose a country in a lower price band:

| Band | Monthly | Yearly | Founding first year | Number of countries |
|---|---|---|---|---|
| A (default, includes the UK, Gulf states and EU countries) | £5.99 | £39.99 | £29.99 | all countries not in B or C |
| B | US$4.49 | US$29.99 | US$22.49 | 55 (includes **Jordan**) |
| C | US$2.99 | US$19.99 | US$14.99 | 76 (includes Egypt, India, Philippines) |

  How the band is chosen: the buyer's country choice on the plans page. Whether this is checked against the billing address: [to confirm].

### 3.2 Gulf Pass (one-off)
- Exam practice for four Gulf nursing exams: Saudi SNLE, Qatar DHP, Dubai DHA and Abu Dhabi DOH. Question bank, mock exams, reasoning tools, dossiers, progress saved to the account.
- **US$50 for 3 months or US$69 for 6 months.** Same price in every country.
- **Includes the Crown Pass for the same period.** Paid once. **Never renews.** The included Crown Pass ends with the Gulf Pass and never turns into a paid subscription.

### 3.3 Lean Six Sigma Green Belt toolkit (one-off)
- Separate website: lss.healthcarecrownacademy.co.uk, with its own sign-in and legal page.
- Tools, simulations, course materials, exam preparation, a knowledge exam and a **Certificate of Completion** on passing. The certificate is **not accredited**.
- **US$99 for 12 months.** Paid once. Never renews. **US$149 from 1 February 2027** (decided).
- Team seats by invoice exist on paper; whether any team sales are planned before sign-off: [to confirm].

### 3.4 Evinca recognition programme (paid launch planned June 2027)
- Website: account.healthcarecrownacademy.co.uk. Adults (18+) only.
- People apply with evidence of their work. **Automatic evidence verification** runs first. **The owner decides** each application against a published rubric. An **external reviewer** handles conflicts of interest, borderline scores and appeals, and audits **1 in 10** decisions.
- Applicants must not include patient information; there is a **patient-data block**. Colleagues named by applicants are emailed to confirm the work; **those confirmer emails contain a privacy notice**.
- The first cohort (pilot) is free. **Application fees** from June 2027 (US dollars):

| Route | Fee | Reduced "access" fee |
|---|---|---|
| Rising Star | US$39 | US$19 |
| Individual dossier | US$49 | US$25 |
| Leadership dossier | US$149 | US$75 |
| Team or project dossier | US$299 | US$149 |

- Other listed Evinca prices: Verified Spotlight US$9, Evinca Distinction US$29, Unit Verified Record US$100 per unit per month, Institution Honor US$3,900, Institution plan US$2,400 a year, sponsored seat US$49, printed certificate US$39 + shipping, framed certificate US$59 + shipping, printed annual issue US$19 + shipping. Reviewers receive **US$5 of Evinca account credit** per completed review (no cash value). Referral points and a 10% newcomer discount exist.
- **Evinca's refund rule is different from the other products** (see section 5.4).

---

## 4. How buying works (checkout)

### 4.1 Before payment
On the main site (Crown Pass and Gulf Pass) and the Green Belt site, the buyer must tick **two unticked boxes**. The pay button does not work until both are ticked. The server also refuses the checkout without them.

Exact wording (version 2026-10-29):

> ☐ I am 18 or over, or I am a parent or guardian paying for this account and I agree to the payment terms.
>
> ☐ I ask for my access to start now, during my 14-day cancellation period. I understand that if I cancel within that period I get a **full refund**.

Points to note:
- There is **no option to buy with a delayed start**. Both boxes are required to buy.
- There is **no box acknowledging loss of the right to cancel**. The business does not want customers to lose it.
- If the page shows older wording, the server refuses the purchase and asks the buyer to reload (Crown Pass and Gulf Pass).
- Stripe's checkout page also shows this line above the pay button: "You asked for access to start now, during your 14-day cancellation period. Cancel within that period for a full refund. Details: healthcarecrownacademy.co.uk/refunds" (Crown Pass and Gulf Pass).
- We store in Stripe: the time of consent, the wording version, a fingerprint of the wording (Crown Pass and Gulf Pass), that the payer confirmed 18+/parent, and the refund rule in force.
- Stripe collects the buyer's **billing address** (required) on all three checkouts.
- Accounts are open from age 16. Under-18s cannot pay themselves: a parent or guardian, or an adult, pays.

### 4.2 Evinca
Paid reviews will need two ticked boxes: "I am 18 or over" and a request for the review to start during the cancellation period. These are recorded and enforced. Paid reviews are off until June 2027.

---

## 5. Cancellation and refunds

### 5.1 The new rule (owner's decision, 29 October 2026, now built)
For the **Crown Pass, Gulf Pass and Green Belt**:
- **Change of mind within the 14-day cancellation period = full refund, even if the product was used.** This is more generous than the law requires, and the pages say so.
- The 14-day period ends at the end of the 14th day after the contract day. For the Crown Pass the contract day is the day the free trial starts. A trial turning into a paid plan does not start a new period.
- **Free trial cancelled = nothing charged.**
- **One instant self-service refund per person per product** ("Cancel and get a refund" button). It shows the amount before the buyer confirms. If the button has been used before, or cannot help, the buyer can cancel by email or any clear message; the same legal rules apply and the date of the message counts as the cancellation date. The pages say the button limit never limits legal rights.
- Refunds go back to the card used, within 14 days of being told.
- When a refund is made, paid access ends. Progress is kept and the free version stays open.
- **Green Belt:** a change-of-mind refund **withdraws the Certificate of Completion**. A refund for a fault or a mistaken charge does **not** withdraw it.
- **After 14 days:** no change-of-mind refund. The customer can stop renewal at any time. Statutory remedies for faulty or not-as-described products remain, and the pages explain them.
- **Two ways to cancel a subscription:** "Stop renewal or update card" (access continues to the end of the paid period, no refund) and "Cancel and get a refund" (within 14 days; access ends; full refund).
- The previous rule ("full refund within 3 days of paying, then a refund minus the days used") is switched off. It can only come back if the owner changes a setting.

### 5.2 Emails
- **Order confirmation email** after every purchase (our "durable medium" copy). It includes: product, price, renewal terms (or "never renews"), the date of the request to start now, the normal cancellation deadline, the full-refund promise, how to cancel, the **full model cancellation form**, the terms version and links. Sent through Resend.
- **Cancellation acknowledgement email** after every instant refund or trial cancellation, with the date, when access ended and how the refund was worked out.
- Stripe also sends its own receipt.
- **Renewal and trial-ending reminders:** promised on the refunds page. Whether they are switched on and checked in Stripe: [to confirm].
- How cancellations sent **by email** (not through the button) are logged: no tool yet; handled by hand [to confirm process].

### 5.3 Model cancellation form
The statutory model form is on the refunds page, the Green Belt legal page and in the confirmation email. It is addressed to the company at the London registered office and the contact email.

### 5.4 Evinca (different rule; built for June 2027)
- Cancel within 14 days of paying. Before reviewers are assigned: full refund. Later within 14 days: the fee minus a fair amount for review work already done, with the calculation shown; the customer gets whichever is higher, that amount or a published "stage promise" (for example at least half back after reviewers are assigned but before scoring).
- Faulty or not-as-described work: a remedy at every stage, which can include a refund.
- Whether the new 14-day full-refund rule should also apply to Evinca: [to confirm by the owner].

---

## 6. Accounts and records

- **Close my account** (main site and Green Belt): stops any renewing plan straight away, deletes personal and learning data, disables the sign-in, and keeps payment records without the customer's name for 6 years.
- Payment, subscription and refund records (including the consent record) are kept **6 years from the end of the financial year** of the transaction.
- Sign-in and security logs: up to 90 days. Enquiries: 24 months.

---

## 7. Money flow

- **One Stripe account**, registered in the UK, for all products. Currently **test mode**.
- Stripe payouts go to a **Payoneer GBP receiving account in the company's name**.
- The owner confirms a **company-name bank account** exists for withdrawals from Payoneer. Bank name and country: [to confirm].
- Currencies charged: GBP (Crown Pass band A) and USD (regional Crown Pass prices, Gulf Pass, Green Belt, Evinca).
- Stripe settings in our code: prices are set as **tax-inclusive**, with Stripe's general "electronically supplied services" tax code on Crown Pass products. **Stripe Tax (automatic tax calculation) is not switched on** in the checkout code. Stripe does not add any tax.
- Expected sales in the first 12 months: [to confirm by the owner]. Expected split by country: [to confirm].

---

## 8. Data protection facts

- The company is the controller. ICO registration ZC273259.
- **No built-in AI.** The earlier "Academy AI" in Lumen was switched off and its stored data deleted (the privacy notice says 27 October 2026; our internal notes say 28 October 2026 [to confirm date]). Users may add **their own AI provider key**; it stays in their browser and requests go directly from the browser to that provider.
- Most learning data (progress, notes, Serein journal and mood check-ins) stays **in the user's browser**, not with us.
- Cookies: a sign-in cookie (essential) and an **opt-in** daily-streak cookie (off by default). No advertising or analytics cookies.
- Users aged 16-17 can have accounts. A short DPIA for this age group is drafted and waits for the owner's signature (`2026-10-28/DPIA-CHILDREN-16-17.md`).
- Marketing emails only with a separate unticked box.
- A data-protection complaints route is in the privacy notice (Data (Use and Access) Act 2025).

### Suppliers (from the supplier register, 28 October 2026)
| Supplier | Role | Where |
|---|---|---|
| Supabase | Database, sign-in, server functions | London (Academy, Gulf, Evinca); Frankfurt (Green Belt) |
| Stripe | Payments, subscriptions, refunds | UK, EU and US |
| Resend | Order and cancellation emails | Ireland sending region; US company |
| Vercel | Hosting main site and Evinca | Global; US company |
| Cloudflare | DNS; hosting of the Gulf studio | Global; US company |
| Netlify | Hosting the Green Belt site ([to confirm] still used) | US company |
| Google Fonts, cdnjs, jsDelivr | Fonts and code libraries on the Green Belt page | US/global |
| GitHub | Source code only (no customer data [to confirm]) | US |
| Payoneer | Receives Stripe payouts | In the supplier register (added 29 October); whether it receives any customer personal data: [to confirm] |

Supplier data processing agreements, versions and transfer routes are still being collected and filed by the owner [to confirm when complete].

---

## 9. Customer documents to review

| Document | Live link | Version |
|---|---|---|
| Terms of use | https://healthcarecrownacademy.co.uk/terms | 2026-10-29 |
| Subscriptions, cancelling and refunds | https://healthcarecrownacademy.co.uk/refunds | 2026-10-29 |
| Privacy notice | https://healthcarecrownacademy.co.uk/privacy | 2026-10-29 |
| Plans page and checkout boxes | https://healthcarecrownacademy.co.uk/subscribe | consent 2026-10-29 |
| Green Belt terms, privacy and refunds | https://lss.healthcarecrownacademy.co.uk/legal.html | 2026-10-29 (see note) |
| Evinca terms | https://account.healthcarecrownacademy.co.uk/en/terms | dated 27 October 2026 |
| Evinca fees | https://account.healthcarecrownacademy.co.uk/en/fees | [to confirm] |

**Release note:** the main-site pages above are published with version 2026-10-29. The Green Belt page with the new 14-day wording is on a branch waiting for the owner to merge; until it is merged, the live Green Belt page may still show the older rule [to confirm]. The updated payment functions for the Crown Pass, the Gulf Pass and the Green Belt were deployed on 29 October 2026. We could not open the live links while preparing this pack, so please check the version line at the top of each page.

You can test the checkout yourself in test mode. Test checkout is limited to approved testers, so please create a free account and send us the email you used; we will approve it. Then choose a plan and pay with card 4242 4242 4242 4242, any future expiry date and any CVC. No money moves.

---

## 10. Things we noticed while preparing this pack

These are for the professionals to weigh. We have not changed them yet.

1. **Business address.** Pages show only the London registered-office service address. The business is run from Saudi Arabia and Jordan. Which address must be shown is an open question.
2. **Refunds page** said plans include "AI help". **Fixed 29 October:** removed.
3. **Green Belt privacy section** did not list Resend. **Fixed 29 October:** added (Ireland region).
4. **Green Belt "Complaints and law"** lacked the sentence protecting customers outside England and Wales. **Fixed 29 October:** added, same wording as the main site.
5. **VAT wording differed** between the sites. **Fixed 29 October:** both now say "We are not registered for VAT, so no VAT is added: the price shown is the total you pay." This may need to change after the accountant's advice.
6. **Classification** (services or digital content) is still not decided. A brief is in `2026-10-28/CLASSIFICATION-BRIEF.pdf`. It was written before the full-refund decision.
7. **Mandatory start-now box:** buyers cannot choose to wait 14 days before access starts.
8. **Certificate withdrawal** on a Green Belt change-of-mind refund.
9. **Evinca** keeps a work-done deduction, unlike the other products.
10. **Subscription rules under the DMCCA 2024:** our refunds page says they are expected from 1 January 2027, "subject to Parliament's approval". Our research found the regulations still in draft on 28 October 2026 [to confirm].
11. **Supplier register** did not include Payoneer. **Fixed 29 October:** added.

---

## 11. Our current understanding of tax (all to be confirmed by the accountant)

None of this is settled. It is what our own research suggests, so the accountant knows what to check.

| Topic | Our current understanding | Status |
|---|---|---|
| UK VAT | We are not VAT-registered. HMRC guidance suggests a registered-office service alone may not make a business "established" in the UK for VAT. If the company is a **non-established taxable person**, it may need to register from its first UK sale, with no threshold. | To be confirmed by the accountant |
| EU VAT | Sales to EU consumers of e-learning may be "electronically supplied services", with VAT due from the first sale for a non-EU seller, possibly through the non-Union One Stop Shop. | To be confirmed by the accountant |
| Saudi Arabia VAT (ZATCA) | A non-resident supplying electronic services to Saudi consumers may have to register with no threshold; the standard rate appears to be 15%. The answer may change because the business is run from Saudi Arabia. | To be confirmed by the accountant |
| UAE VAT | Not researched in detail. | To be confirmed by the accountant |
| Qatar | We understand Qatar has no VAT at present. | [to confirm] by the accountant |
| Jordan general sales tax | Jordan has a registration route for foreign suppliers of electronic services; the general rate appears to be 16%. The threshold for that route is unclear. The answer may change because the business is run from Jordan. | To be confirmed by the accountant |
| Corporation tax residence | The company is UK-incorporated, but central management and control is in Saudi Arabia and Jordan. Saudi or Jordanian residence, or a permanent establishment, may arise. The UK treaties with Saudi Arabia and Jordan may decide dual residence. | To be confirmed by the accountant |
| Records | We plan to keep payment records for 6 years from the end of the financial year. | To be confirmed by the accountant |

---

## 12. Other papers you may find useful

All in `NCLEXRN/audit/legal/`:
- `2026-10-27/LEGAL-REVIEW-PACK.pdf` (full text of documents as at 27-28 October; the refund rule has since changed)
- `2026-10-27/SOLICITOR-INSTRUCTIONS.pdf` (earlier instructions)
- `2026-10-28/CLASSIFICATION-BRIEF.pdf`
- `2026-10-28/REVIEW-2-STATUS.pdf` (status of an earlier informal review)
- `2026-10-28/SUPPLIER-REGISTER.pdf`
- `2026-10-28/DPIA-CHILDREN-16-17.pdf` (draft, unsigned)
- `2026-10-28/cross-border/HCA-Cross-Border-Research-2026-10-28.pdf` (research, not advice)

---

## 13. Owner's checklist before sending

1. Merge the waiting Green Belt change "Refunds: full refund within 14 days" (branch name ending `full-refund-14-days`), so the live Green Belt page shows version 2026-10-29.
2. (Done 29 October 2026: the updated payment functions are deployed.)
3. Open every link in section 9 and check the version line.
4. Make one test purchase and one test refund. Save screenshots of both boxes, the confirmation email and the cancellation email, and attach them.
5. Fill in every **[to confirm]** you can answer.
6. Keep the live switch off until the sign-offs are back.
