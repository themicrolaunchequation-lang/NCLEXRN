# Legal review pack: HEALTHCARE CROWN ACADEMY LTD

Prepared 27 October 2026 for an external reviewer (a UK solicitor, or an AI legal agent whose output a solicitor will check). Everything needed is in this one file: the brief, the business facts, how buying and cancelling actually work, the data map, what changed after the last review, and the full current text of every customer-facing legal page.

**How to use it:** give the whole file to the reviewer. Part 1 is the instruction. Parts 2 to 6 are the facts. Part 7 is the text to review. Part 8 is supporting records.

---

## Part 1. Brief for the reviewer (copy this as the prompt)

> You are reviewing the customer-facing legal documents of HEALTHCARE CROWN ACADEMY LTD, a small UK company (England and Wales) selling online learning apps for nurses and healthcare staff to consumers in the UK, the Gulf and elsewhere, and to some organisations. The company has not yet taken real money; all payments so far were in Stripe test mode. It wants to go live safely.
>
> **Your job:** check that the documents in Part 7 are lawful, accurate against the facts in Parts 2 to 6, consistent with each other, and fair and transparent to a consumer. Write for a non-lawyer owner.
>
> **Law to check against (as at the review date):**
> 1. Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013: pre-contract information, the 14-day cancellation period for services and digital content, express request to start early, proportionate payment, the model cancellation form, and whether each product is correctly treated as a *service* rather than *digital content*.
> 2. Consumer Rights Act 2015: services with reasonable care and skill, digital content quality, statutory remedies, and Part 2 unfair terms and transparency (including the grey list in Schedule 2).
> 3. Digital Markets, Competition and Consumers Act 2024: the subscription contract regime expected to start in 2027 (pre-contract information, reminder notices, renewal cooling-off, easy exit), and the unfair commercial practices rules (drip pricing, fake urgency, misleading price comparisons) already in force.
> 4. UK GDPR and the Data Protection Act 2018 as amended by the Data (Use and Access) Act 2025: transparency (Articles 13 and 14), lawful bases, international transfers (UK–US data bridge, IDTA/Addendum), retention, children aged 16 to 17, AI processing, and the data-protection complaints duty in force from 19 June 2026.
> 5. PECR: the one first-party cookie (a daily-streak cookie with an off switch) and marketing emails.
> 6. Any obvious issue for customers in the Gulf (Saudi Arabia, Qatar, UAE) or the EU that would make a term unenforceable or misleading. Flag it; do not write full local-law advice.
>
> **For each document in Part 7, give:**
> - A table: *issue* · *exact quote* · *why it matters (law and risk)* · *severity: must fix before taking money / should fix / nice to have* · *suggested replacement wording, ready to paste*.
> - Any place where the text promises something the facts in Parts 2 to 6 do not support, or where the facts need a promise the text does not make.
> - Any conflict between documents (for example the main refunds page versus the Lean Six Sigma page versus Evinca's fees).
>
> **Then give:**
> 1. A yes/no verdict per document: fit to take real money once the "must fix" items are done?
> 2. Answers to the open questions in Part 6.
> 3. A short list of anything the owner must do outside the documents (registrations, supplier agreements, records, settings).
>
> **Rules:** quote exact text; do not invent facts; if something is unclear, say what you would need to know. Keep wording plain English at about a reading age of 12. Do not reduce consumer rights to make the business safer: if a term would be unfair, say so. Where you rely on guidance (CMA, ICO), name it.

---

## Part 2. The business

| Fact | Detail |
|---|---|
| Legal name | HEALTHCARE CROWN ACADEMY LTD, private company limited by shares, England and Wales, company no. 17501904 |
| Registered office | 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ (a registered-office service address) |
| ICO registration | ZC273259 |
| Contact | themicrolaunchequation@gmail.com (no phone line) |
| VAT | **Not VAT-registered.** No VAT is added to any price. Pages now say "We are not registered for VAT, so no VAT is added: the price shown is the total you pay." |
| Size | One owner. No employees. Very early stage; no live sales yet. |
| Customers | Nurses, students and healthcare staff (UK, Gulf, international), aged 16+; paid plans 18+ or with a parent's agreement. Some organisations (team plans). |
| Websites | healthcarecrownacademy.co.uk (main site and Academy apps), snle.healthcarecrownacademy.co.uk (Gulf Region exam studio), lss.healthcarecrownacademy.co.uk (Lean Six Sigma Green Belt toolkit), account.healthcarecrownacademy.co.uk (Evinca, a recognition and review programme) |
| Payments | Stripe Checkout (cards, wallets). Two Stripe accounts: one for the Academy and Evinca, one for Lean Six Sigma. Currently test mode only. |

### Apps

| App | What it is | What it is not |
|---|---|---|
| MedLex | Medical terminology and clinical vocabulary learning | Not clinical decision support |
| Carecraft | Short care-practice scenarios and soft-skills practice | Not training that certifies competence |
| Lumen | Study studio: read your own PDFs/notes, make recall cards; optional AI help ("Academy AI") | Not for patient data; AI answers can be wrong |
| Serein | Wellbeing journal and check-ins; free; data stays on the device | Not monitored, not a crisis service |
| Gulf Region exam studio | Practice for Saudi SNLE, Qatar DHP, Dubai DHA and Abu Dhabi DOH nursing exams | Not affiliated with the exam bodies; no guaranteed pass |
| Lean Six Sigma Green Belt toolkit | Course, tools, exam prep, knowledge exam and a Certificate of Completion | Certificate of completion, not an accredited certification |
| Evinca | Paid, reviewer-scored recognition of healthcare work, with public records and verification links | Not a professional licence or qualification |

---

## Part 3. Products and prices (as live in the code today)

All prices are the total paid. No VAT is added.

### Academy subscriptions (renew automatically; monthly or yearly)

| Plan | Monthly | Yearly | Free trial |
|---|---|---|---|
| Crown Pass (MedLex + Carecraft + Lumen premium) | £5.99 | £39.99 (founding price £29.99 for people who join by 31 Jan 2027) | 7 days |
| MedLex | £2.99 | £19.99 | none |
| Carecraft | £2.99 | £19.99 | none |
| Lumen | £4.99 | £34.99 | none |

Some countries see lower regional prices in US dollars. Planned: Crown Pass yearly to £49.99 for **new** members from 1 Feb 2027 (existing members keep their price until renewal and get 30 days' notice of any change).

### One-off purchases (never renew)

| Product | Price |
|---|---|
| Gulf Region exam pass (one exam) | 1 month US$25 · 3 months US$50 · 6 months US$69 |
| Lean Six Sigma Green Belt, full access for 12 months | US$99 (US$79 per seat for teams of 10+ until 31 Jan 2027, then US$99; planned individual US$149 from 1 Feb 2027) |
| Carecraft team | £30 per learner a year (10–49), £20 from 50 learners (sold by invoice/agreement, not self-checkout) |
| Evinca review fees (paid launch June 2027) | Rising Star US$39 · Individual US$49 · Leadership US$149 · Team US$299; reduced "access" fees for eligible countries (see Part 7) |

---

## Part 4. How buying, cancelling and refunds actually work (the code)

### Before payment (Academy)
1. The plans page shows the yearly amount as the main price, with "About £x a month · save £y a year" underneath.
2. For the Crown Pass trial the card says: "£0 today. Then £39.99 a year, taken on [date] and renewing automatically…"
3. Pressing a plan opens a dialog **"Before you pay"**: "Please confirm how your access starts. This is separate from any marketing choice." with an unticked box:
   > "I ask for my access to start now, during my 14-day cancellation period. I understand that if I cancel within that period I get a **full refund within 3 days** of paying, and after that a refund **minus the days I have used**."
   The "Continue to secure payment" button stays disabled until it is ticked. The server refuses checkout unless consent is true, and stores the consent time and version (`2026-10-27b`) in Stripe metadata.
4. Stripe Checkout takes payment. Stripe emails a receipt.

### Lean Six Sigma
Same pattern: an unticked box at checkout: "I ask for my access to start now, during my 14-day cancellation period. I understand that if I cancel within that period I get a full refund within 3 days of paying, and after that a refund minus the time I have used." plus a line "By continuing you agree to our Terms, Privacy policy and Refund policy" linking to its legal page. The server refuses checkout without consent.

### Cancelling: two separate buttons (account page and plans page)
- **"Stop renewal or update card"** → Stripe customer portal. Access continues to the end of the paid period. No refund.
- **"Cancel and get a refund"** → instant, automatic refund, no questions, with a confirmation card first:
  - **Window:** until the end of the 14th day after the day of purchase (for a trial, the day the trial started). Example on the page: buy on 1 March → you can cancel until the end of 15 March.
  - **Within 3 days of paying:** full refund.
  - **Days 4 to 14:** refund minus the days used: price × days used ÷ days in the period. Example on the page: £39.99 yearly, 6 days used → £0.66 kept, £39.33 refunded. Trial days are never charged.
  - **During a free trial:** the trial is cancelled; nothing is charged.
  - **Converted from trial:** the 14 days still run from the trial start; conversion does not start a new period.
  - **Gulf passes:** the same window and calculation; the pass ends.
  - **Lean Six Sigma:** the same window and calculation; access ends and any certificate is withdrawn.
  - **Limit:** the instant button works once per person per product. The pages say this limit never affects legal rights; anyone can still ask by email and rely on statutory remedies.
  - Access ends immediately; Stripe sends the refund to the original card.
- After 14 days: no change-of-mind refund; statutory remedies (repair, re-performance, price reduction up to a full refund) apply at any time if something is faulty or not as described.

### Renewals
Stripe sends renewal reminders before yearly renewals and before a trial ends (the owner is switching these on in the Stripe dashboard). Monthly renewals have no reminder yet.

### Evinca
Paid launch planned June 2027. Fees are refunded by stage (see Part 7). The express "start the review now" request at checkout and an 18+ check at sign-up are still to be built before paid launch.

---

## Part 5. Personal data map (short)

| Area | Data | Where | Kept for |
|---|---|---|---|
| Academy accounts | email, name, profile, sessions | Supabase, London (eu-west-2) | account life + 30 days |
| Payments and refunds | plan, status, dates, country band, Stripe ids, amounts, consent time/version | Supabase London; Stripe | 6 years after financial year end |
| Academy AI (Lumen) | passage the user selects + instruction; answers | sent from our London server to OpenAI (US), then Groq (US) if OpenAI fails; Google Gemini only if a paid Google project is confirmed (currently off). No name or email sent | answer cache 30 days (private to each user); daily request counts 90 days |
| Lumen "own key" route | user's own AI key; requests go from the browser straight to the provider the user chose | user's device and chosen provider | not stored by us |
| Serein | journal, check-ins | user's device only (never sent to us) | until the user deletes |
| Enquiries | name, email, message | Supabase London | 24 months |
| Newsletter | email, consent time and version | Supabase London | until unsubscribe, then suppression list |
| Sign-in logs | auth audit log | Supabase | 90 days |
| Lean Six Sigma | account, organisation, payments, exam scores, certificates | Supabase Frankfurt (eu-central-1); Stripe | account life; payments 6 years; code attempts 90 days |
| Evinca | applications, nominations, reviews, public records | Supabase London | see Evinca privacy notice |
| Cookies | one first-party cookie `hca-daily` (daily streak), with an off switch that deletes it and remembers the choice (`hca-daily-off`); no analytics or advertising cookies | browser | 1 year / until switched off |

Suppliers: Supabase (database, auth, functions), Vercel and Cloudflare (hosting), Netlify (older Lean Six Sigma hosting), Stripe (payments; also an independent controller for fraud and legal duties), OpenAI and Groq (AI), Google (only if Gemini paid tier is turned on). Retention is enforced by daily scheduled database jobs (confirmed running on 27 October 2026).

Under-18s: accounts allowed from 16. No marketing by default, no profiling, the same protections for everyone. Evinca is 18+.

---

## Part 6. What the last review raised, what changed, and open questions

### Changes made after the last review (all live in code and pages)

| Review point | What changed |
|---|---|
| Cancellation period counted wrongly | Refunds allowed until the end of the 14th day after purchase. Pages give an example. |
| Services vs digital content | Pages state each paid plan is an ongoing online service; refunds follow the services route (proportionate deduction after express request). |
| Generic "start now" checkbox | New express-request wording (above), separate from marketing, versioned and recorded in Stripe. |
| Model cancellation form | Added to the refunds page and the Lean Six Sigma refund policy. |
| Stop renewal vs cancel-and-refund | Two clearly labelled actions with explanation. |
| Trial and the 14 days | Contract starts at trial start; conversion does not restart the period; trial days never charged. |
| Annual price prominence | Yearly charge shown as main price; monthly equivalent secondary; trial card shows date and amount of first payment. |
| "No refunds after 14 days" | Replaced by statutory remedies at any time; "one refund per person" limited to the instant button only. |
| Price and feature changes | Price fixed for the paid term; increases only at renewal with 30 days' notice; detrimental changes give a cancel-and-refund right. |
| Suspension | Grounds, notice, chance to remedy, independent review, pro-rata refund if not the customer's fault. |
| Licence | Personal learning plus showing content while teaching; organisations need a team plan; accounts are personal. |
| Clinical disclaimers | What each app does and does not do; Serein not monitored, with emergency numbers. |
| Age | 16+; paid plans 18+ or parental agreement; Evinca 18+. |
| AI disclosure | Both AI routes, inputs, outputs, caching, retention and transfers described. |
| Shared AI cache | Fixed: cache private to each user. |
| Streak cookie | Wording corrected; off switch added. |
| Supplier roles, transfers, retention, complaints | Tables and processes added; retention jobs running. |
| Evinca refunds and publication | Statutory 14-day right stated separately; one rule for withdrawal and revocation records. |
| Lean Six Sigma page | Provider changed to the company; Stripe replaces the old payment provider; certificate limits, privacy, refunds updated. |
| VAT | Company not VAT-registered: pages now say no VAT is added and the price shown is the total. |

### Open questions for the reviewer

1. **Services classification.** Is it right to treat subscriptions, exam passes and the Lean Six Sigma toolkit as services (proportionate deduction) rather than digital content (right lost on download)? Is the express-request wording sufficient for each?
2. **Full refund within 3 days.** We give a full refund (no deduction) in the first 3 days as a goodwill rule on top of the law. Is it clearly worded so it does not read as limiting rights?
3. **"Once per person per product" instant refund.** Is the limit, with the statement that legal rights are unaffected, fair and transparent?
4. **Proportionate calculation.** Is "price × days used ÷ days in the period" a fair proportion for a yearly subscription whose content is front-loaded (e.g. the full exam bank available on day one)?
5. **Lean Six Sigma certificate.** On refund the certificate is withdrawn. Is that fair, and is the Certificate of Completion described accurately (not "accredited")?
6. **DMCCA subscriptions.** What must change before the regime starts (reminders for monthly plans, renewal cooling-off, exit in one step)? Is anything in the current text inconsistent with it?
7. **Under-18s.** Is "paid plans 18+ or with a parent's agreement" workable without age verification? Anything else needed for 16–17-year-olds (ICO Children's code)?
8. **AI and health data.** The privacy notice says users must not paste patient data and relies on explicit consent only if a user includes their own health information. Is that adequate? Is a full DPIA needed before marketing Academy AI?
9. **International customers.** Gulf customers pay in US dollars under English law. Any wording that is likely to be unenforceable or misleading for them? Any VAT/GST or digital-services tax issue overseas the owner should take to an accountant (the company is not UK VAT-registered)?
10. **Contact.** The only contact is a Gmail address. Is that sufficient for the pre-contract information duty, or should a phone number or business address for correspondence be given?
11. **Registered office.** The address is a registered-office service. Is it acceptable as the geographic address customers can use?
12. **Evinca.** Are the stage refund amounts ("at least 50%") and the publication/revocation rule fair? What must be in place before paid launch?
13. **Team plans.** Carecraft and Lean Six Sigma team plans are B2B. Do they need separate business terms?

### Things the owner is doing outside the documents
- Supplier data processing agreements (DPAs): accept or download and file one per supplier (see Part 8B).
- Stripe: renewal and trial reminder emails, receipts and refund emails switched on (test, then live).
- DPIA screening for Academy AI: drafted, to be signed (Part 8A).
- Account closure, rights request and complaints procedures: written (Part 8B).

---

## Part 7. Full current text of the documents to review

The texts below are converted from the live pages (links shown in brackets). Headings and lists are as on the page.

## 7.1 Main site: Terms of use (https://healthcarecrownacademy.co.uk/terms)


### Terms of use

Last updated: 27 October 2026 · Version 2026-10-27

#### Who we are

This website and the MedLex, Carecraft, Serein, Lumen and Gulf Region Nursing apps are provided by HEALTHCARE CROWN ACADEMY LTD, a private company limited by shares registered in England and Wales, company number 17501904 (“we”, “us”). Registered office: 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ. Contact: themicrolaunchequation@gmail.com.

Evinca and the Lean Six Sigma Green Belt toolkit are also ours but have their own terms, shown in those apps; where they differ, their own terms apply to them.

#### Our agreement with you

These terms, our subscriptions, cancelling & refunds (/refunds) page and our privacy notice (/privacy) make up the agreement between us. A contract for a paid plan is made when you complete payment or start a free trial, and Stripe emails you a receipt. Our contracts are in English.

#### What our apps are, and are not

Our apps are educational and well-being resources for people who study or work in health and care. They help you learn and practise. They do not diagnose, recommend treatment, interpret anyone’s symptoms or monitor anyone, and they are not intended to be used for decisions about a particular patient.

- **MedLex, Carecraft and Gulf Region Nursing** teach terminology, practice skills and exam preparation. Scenarios are fictional. Exam questions are our own original practice material, not official examination questions, and are not endorsed by any regulator.
- **Lumen** turns your own study notes into recall cards and, if you choose, uses AI to help you study them. AI answers can be wrong; check them against your course materials. Do not enter patient-identifiable information.
- **Serein** offers general relaxation and reflection practices. It is not a medical, therapy or crisis service, and no one monitors what you write in it. If you or someone else is in danger, call 999; for urgent mental health help in England call NHS 111 and choose option 2; Samaritans are on 116 123.

Our content does not replace your training, your employer’s policies, your regulator’s standards or advice from a qualified professional. Completing an app does not give you a qualification, registration, accreditation or licence to practise.

#### Your account

- You must be 16 or over to create an account. One account works across this website and our apps. Evinca is only for people aged 18 and over, and having an Academy account does not by itself let you use Evinca.
- To buy a paid plan you must be 18 or over, or have the agreement of a parent or guardian who pays for it.
- Your account is personal to you, because your progress and any certificates are yours. Please do not share your sign-in. For a group or organisation, ask us about team plans.
- Give accurate details and keep your sign-in safe. Tell us straight away if you think someone else has used your account.
- You can close your account at any time by emailing us. Stop any renewing plan first, or ask us to do it.

#### Free and paid plans

Some features are free and some need a paid plan. The plans page (/subscribe) shows what each plan includes and its total price. Billing, renewals, cancelling, your 14-day right to cancel and refunds are explained on our subscriptions, cancelling & refunds (/refunds) page.

We may change which features are free or paid for new customers. We will not remove a main feature from a paid plan during a period you have paid for, unless we must for a legal, security or supplier reason outside our control. If such a change is to your disadvantage, we will tell you, and you may cancel and receive a refund of the unused part of your payment.

#### Using our content

The lessons, questions, guides, illustrations, music, voice guidance and software in our apps belong to us or our licensors. While you have access, you may:

- use them for your own learning and professional development;
- if you teach, show them to learners during a lesson you deliver, as long as you have your own account. Copying, distributing or uploading our material for others, or giving organisation-wide access, needs a team plan or our written permission.

Please do not copy, publish, sell, scrape or use our content to train AI systems.

#### Your content

What you write or upload stays yours. Most progress, notes and settings are stored only in your browser, so clearing your browser data can remove them; use the backup tools in the apps to keep a copy. You give us only the permission we need to store, process and show your content back to you in the service, and, for Academy AI, to send the passage you choose to our AI providers to answer your request. Only upload material you are allowed to use, and never patient-identifiable information.

#### Acceptable use

Please use the apps lawfully and considerately. Do not try to disrupt, probe or overload them, get around plan limits or security, misuse AI features to produce harmful content, or upload anything unlawful or that infringes someone else’s rights.

#### Suspending or ending access

- We may suspend an account straight away only where it is needed to protect the service, other users or the law, for example a security breach or fraud. We will tell you why as soon as we can, unless the law prevents us.
- For other breaches of these terms, we will normally tell you first and give you a reasonable chance to put things right.
- You can ask us to review a suspension by emailing us; a person who was not involved in the decision will look at it.
- While an account is suspended pending review, we pause renewals. If we end your plan and it was not your fault, we refund the unused part of your payment.

#### Availability and accuracy

We work hard to keep our content accurate and up to date and our apps available, but we cannot promise they will always be error-free or uninterrupted. If something we supply is faulty or not as described, you have the legal rights explained on our refunds (/refunds) page.

#### Our responsibility to you

We are responsible for loss or damage you suffer that is a foreseeable result of our breaking these terms or failing to use reasonable care and skill. We are not responsible for loss or damage that is not foreseeable.

Nothing in these terms limits or excludes our liability for death or personal injury caused by our negligence, for fraud or fraudulent misrepresentation, or for anything else that cannot be limited or excluded by law, including your statutory rights as a consumer.

Because our apps are educational and are not intended for decisions about individual patients, we are not responsible for clinical or professional decisions you make in practice that rely only on our content rather than on your training, your employer’s policies and qualified advice. This does not affect our responsibility for content that we supply negligently or that is not as described.

We provide the apps for personal, domestic and professional learning. If you use them for a business purpose, we are not responsible for loss of profit, business or business opportunity.

#### Changes to these terms

We may update these terms, for example to reflect changes in the law or in our apps. The date and version at the top show the latest version. If a change matters to you and you have a paid plan, we will email you before it applies, and if it is to your disadvantage you may cancel and receive a refund of the unused part of your payment.

#### Complaints and law

If you are unhappy, email us and we will try to put it right. We reply within 5 working days. Complaints about personal data are handled as described in our privacy notice (/privacy). These terms are governed by the law of England and Wales. If you live in Scotland or Northern Ireland, you may also bring proceedings in your local courts.


---

## 7.2 Main site: Subscriptions, cancelling and refunds (https://healthcarecrownacademy.co.uk/refunds)


### Subscriptions, cancelling & refunds

Last updated: 27 October 2026 · Version 2026-10-27

This page explains how paid plans work, how to cancel and what you get back. It is part of our terms of use (/terms). It applies to plans sold by HEALTHCARE CROWN ACADEMY LTD (company 17501904, 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ; themicrolaunchequation@gmail.com). Nothing here reduces your legal rights.

#### What you can buy

- **Subscriptions** that renew automatically until you stop them: the Crown Pass (MedLex, Carecraft and Lumen premium, with a 7-day free trial), and MedLex, Carecraft or Lumen on their own. You can pay monthly or yearly.
- **Gulf Region Nursing exam passes** for one exam (Saudi SNLE, Qatar, Dubai or Abu Dhabi): 1, 3 or 6 months, paid once and **never renewed automatically**.
- Serein is free for everyone. The Lean Six Sigma Green Belt toolkit and Evinca recognition fees have their own terms, shown in those apps.

Each paid plan is an **ongoing online service**: continuing access to our learning apps, their updates and, where included, AI help. That is why the cancellation and refund rules below follow the rules for services.

#### Before you pay

- We show the **total price you will pay**, before you commit. We are not registered for VAT, so no VAT is added: the price shown is the total you pay. For a yearly plan we show the **yearly amount you are charged**, not just a monthly equivalent.
- For a trial we show its length, the **date of your first payment** and the amount.
- We tell you that the plan renews automatically, how often, and how to stop it. There is no minimum commitment beyond the period you pay for.
- Prices for some countries are lower and shown in US dollars; you see the actual amount before paying. Your card provider may add its own currency fees.
- After you pay, Stripe (our payment provider) emails you a receipt, and these terms are always available on this page.

#### Two different ways to cancel

|  | Stop renewal | Cancel and get a refund |
|---|---|---|
| When | Any time | Within your 14-day cancellation period (below) |
| Your access | Continues to the end of the period you paid for | Ends straight away |
| Money | No more payments; no refund for the current period | Refund worked out as below |
| How | “Stop renewal or update card” on the plans page (/subscribe) or your account page (/account) | “Cancel and get a refund”, email or the form at the end of this page |

Exam passes do not renew, so you never need to stop them.

#### Free trial

The Crown Pass starts with a 7-day free trial. You are not charged if you cancel before the trial ends. If you cancel during the trial with “Cancel and get a refund”, the plan ends at once and nothing is taken. Your contract starts on the day you start the trial, so your 14-day cancellation period also starts then. A trial turning into a paid plan does not start a new 14-day period. If you then cancel within the 14 days, you are **never charged for the free trial days**; only paid days count.

#### Your 14-day right to cancel

If you are a consumer, you can cancel a new plan or exam pass without giving a reason. Your cancellation period **ends 14 days after the day you bought the plan or started the trial**. For example, if you buy on 1 March, you can cancel up to the end of 15 March.

At checkout we ask whether you want your access to start straight away, during the cancellation period. You tick a box to say so; it is separate from any marketing choice, and we record the wording and the time you agreed.

##### What you get back

- **Within 3 days of your payment:** a full refund. This is our own promise, more generous than the law.
- **After that, within your 14-day period:** we refund the price minus a proportionate amount for the access you have already had, in proportion to the time since you paid, at the price you agreed. Example: a £39.99 yearly plan cancelled 6 days after payment costs £39.99 × 6/365 = £0.66, so you get back £39.33. For a 3-month exam pass, the calculation uses the pass length.
- **If you did not ask for access to start during the cancellation period,** you get a full refund.
- We never charge administration fees for cancelling.

##### How to cancel

- **Fastest:** while signed in, use “Cancel and get a refund” on the plans page (/subscribe) or your account page (/account). It works out your refund, sends it at once and ends your paid access.
- **Or tell us another clear way,** for example by emailing themicrolaunchequation@gmail.com with “I cancel my Healthcare Crown Academy plan” and the email address on your account. You may use the model form below, but you do not have to.

We refund to the card you paid with, without undue delay and at the latest within 14 days of the day you tell us. Card refunds usually reach your account within 5 to 10 working days of being sent.

The instant “Cancel and get a refund” button covers one refund per person for each product. This limit applies only to the button: your legal right to cancel always applies, so if the button cannot help, email us and we will deal with it under the rules above.

#### After the 14 days

Once your cancellation period has ended, you can still stop renewal at any time, but we do not refund part-used periods simply because you change your mind. Renewals are not covered by the 14-day right today.

**Your legal rights still apply after 14 days.** Paid digital content and services must be as described, of satisfactory quality and fit for purpose, and services must be provided with reasonable care and skill. If something we supply does not meet these standards, you are entitled to a remedy: we will repair or replace it, or, if that is not possible or does not work, give you a price reduction, which can be a full refund. If we charge you twice, charge you after you cancelled, or charge you a price you did not agree, we will refund it. Tell us at themicrolaunchequation@gmail.com.

#### Renewals and reminders

- Monthly plans renew each month and yearly plans each year until you stop renewal.
- Before a yearly plan renews, and before a free trial turns into a paid plan, we send you a reminder with the date, the amount and how to stop it.
- New UK rules for subscriptions are expected to start on 1 January 2027, subject to Parliament’s approval. They will add more reminders and, for some renewals, a further cancellation period. We will update this page and our emails before they apply.

#### Price changes

The price you agreed is fixed for the period you have paid for. If we change a plan’s price, the new price applies only from your next renewal, and we will email you at least 30 days before that renewal so you can stop renewal first at no cost. Founding members keep their founding price for as long as they stay subscribed.

#### Changes to what a plan includes

We improve the apps often. We will not take away a main feature of a paid plan during a period you have paid for, unless we have to for a legal, security or supplier reason outside our control. If that happens and the change is to your disadvantage, we will tell you, and you may cancel and receive a refund of the unused part of your payment.

#### If we suspend or end your plan

We may suspend or end a plan only for the reasons in our terms (/terms#suspension). If we end it without it being your fault, we refund the unused part. While a plan is suspended pending a review, we pause renewals.

#### Model cancellation form

You may copy this and email it to us. Using it is optional.

To: HEALTHCARE CROWN ACADEMY LTD, 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ. Email: themicrolaunchequation@gmail.com

I hereby give notice that I cancel my contract for the supply of the following service: [plan or exam pass name]

Ordered on / started on: [date]

Name: [your name]

Email address on the account: [email]

Date: [date]

#### Questions and complaints

Email themicrolaunchequation@gmail.com with the email address on your account and, if you have it, your receipt number. We reply within 5 working days. If we cannot resolve your complaint, we will tell you in writing, and you can contact Citizens Advice (0808 223 1133) or take the matter to court. These terms are governed by the law of England and Wales, and you can also bring proceedings in Scotland or Northern Ireland if you live there.

See also our terms of use (/terms) and privacy notice (/privacy).


---

## 7.3 Main site: Privacy notice (https://healthcarecrownacademy.co.uk/privacy)


### Privacy notice

Last updated: 27 October 2026 · Version 2026-10-27

#### Who we are

HEALTHCARE CROWN ACADEMY LTD, a private company limited by shares registered in England and Wales (company number 17501904), registered office 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, is the controller of the personal data described here (“we”, “us”). We are registered with the Information Commissioner’s Office (registration ZC273259).

Contact for anything about your data: themicrolaunchequation@gmail.com.

This notice covers this website and the MedLex, Carecraft, Serein, Lumen and Gulf Region Nursing apps. Evinca and the Lean Six Sigma toolkit have their own privacy notices, shown in those apps.

#### Please never enter patient information

Our apps are for learning. Do not type, upload or paste information that identifies a patient or anyone in your care, including in Lumen notes or questions to Academy AI. Our apps are not designed to receive health records, and we ask you to remove names, dates of birth, NHS or hospital numbers and similar details before using any feature.

#### What we collect, why, and our lawful basis

| What | Why | Lawful basis |
|---|---|---|
| **Account:** email address, name, details you choose to add (such as profession or country), sign-in records | To give you one account across our apps | Contract |
| **Plans and payments:** plan, status, renewal dates, country used for pricing, amounts, Stripe customer and payment references, refunds. We never see your full card number. | To sell, renew, cancel and refund plans; to keep accounting records | Contract; legal obligation (tax and company records) |
| **Your request to start access now** (the box you tick at checkout), with its wording version and time | To show we followed the cancellation rules | Legal obligation; legitimate interests in being able to prove it |
| **Gulf Region exam passes:** which exam, pass length and end date | To unlock the exam you paid for | Contract |
| **Academy AI in Lumen** (see below): the passage and instructions you send, the answer, and how many requests you made that day | To answer your study request and apply fair daily limits | Contract |
| **Enquiries and reservations:** what you send us, and the plan you reserved | To reply, and to tell you when a plan opens | Legitimate interests; steps before a contract |
| **Optional updates by email**, only if you tick the separate box | To send news about our apps and courses | Consent, which you can withdraw at any time |
| **Technical logs** kept by our hosting and database providers (such as IP address, browser and pages requested) | To keep the services secure and working | Legitimate interests |

We do not sell personal data, show advertising, or build marketing profiles. We do not make decisions about you that have legal or similarly significant effects by automated means alone. The instant refund button works out refunds by fixed rules; you can always ask a person to look again.

#### Health information

We do not ask for health information about you or anyone else. Serein’s mood check-ins and journal stay on your own device (see below) and are not sent to us. If you choose to include health information about yourself in something you send us, such as an email, we use it only to deal with your message. Where it is health information, we rely on your explicit consent, given when you choose to send it, and you can ask us to delete it.

#### Lumen: two ways to use AI

Lumen works without AI. If you want AI help, there are two routes, and you choose which one to use in Lumen’s settings.

##### 1. Academy AI (provided by us)

- **What is sent:** only the passage you select, the instructions Lumen adds, and your request. It goes from your browser to our server function (run by Supabase in London), which forwards it to an AI provider: **OpenAI** first, and if OpenAI is unavailable, **Groq** and then **Google (Gemini)**. These providers are in the United States.
- **What is kept by us:** to save time and cost, structured answers are stored for up to **30 days** in a private cache that only you can reuse, and are then deleted. An answer can quote parts of the passage you sent. We also keep a daily count of your requests to apply the daily limit, deleted after 90 days. We do not keep the passages you send in our logs.
- **What the providers do:** they process the request to produce the answer, as our processors, under their business terms. They may keep requests for a limited time for security and abuse monitoring, and their business terms say they do not use this data to train their models. We do not send your name or email address to them.
- **Accuracy:** AI answers can be wrong. Always check them against your course materials.

##### 2. Your own AI key

If you add your own key from an AI provider, the key is stored only in your browser, and requests go directly from your browser to that provider. They do not pass through our servers. That provider’s own terms and privacy notice apply, and some free plans allow providers to review prompts or use them for training. Lumen shows this next to each provider.

#### Serein

Serein’s practices, mood check-ins, journal and settings are stored only in your browser on this device. Serein does not send your journal or check-ins to us or anyone else, and no one at the Academy can read them. Serein is not monitored and is not a crisis service: if you or someone else is in danger, call 999; for urgent mental health help in England call NHS 111 and choose option 2; Samaritans are on 116 123.

#### Who receives your data

| Provider | What it does | Role | Where |
|---|---|---|---|
| Supabase | Accounts, sign-in, our database and server functions | Our processor | London, United Kingdom |
| Vercel | Hosts this website | Our processor | Global network; US company |
| Cloudflare | Domain settings, and hosting for the Gulf Region Nursing studio | Our processor | Global network; US company |
| Stripe | Takes payments, runs subscriptions and refunds | Our processor for payments; an independent controller for its own fraud prevention and legal duties | UK, EU and US |
| OpenAI, Groq, Google | Answer Academy AI requests in Lumen | Our processors | United States |

We may also share data where the law requires it, or with professional advisers under a duty of confidence.

##### Transfers outside the UK

When data is processed outside the UK, we use a transfer route recognised by UK law: UK adequacy regulations (for the United States, the UK Extension to the EU–US Data Privacy Framework, where the recipient is certified) or the ICO’s International Data Transfer Agreement or Addendum, together with a transfer risk assessment. You can ask us for more detail.

#### How long we keep data

| Data | How long |
|---|---|
| Account and profile | While your account is open; deleted or anonymised within 30 days after you close it. Backups are overwritten within a further 30 days. |
| Payment, subscription and refund records, including your request to start access | 6 years from the end of the financial year in which the transaction took place, because company and tax law require it |
| Academy AI cached answers | Up to 30 days from when the answer was created |
| Academy AI daily request counts | 90 days |
| Sign-in and security logs | Up to 90 days, unless needed for a security investigation |
| Enquiries | 24 months after our last contact with you |
| Plan reservations | Until the plan opens and we have told you, then up to 12 months |
| Marketing emails | Until you unsubscribe. We then keep only your email address on a do-not-contact list, so we respect your choice. |
| Data in your browser (app progress, notes, Serein, your own AI key) | Until you delete it or clear your browser data; we do not hold a copy |

If we need to keep something longer because of a legal claim or a legal duty, we keep only what is needed for that.

#### Cookies and storage on your device

We do not use advertising or analytics cookies.

- **Sign-in (hca-auth):** keeps you signed in across our site and apps. It is essential for the account service you ask for. It lasts up to a year or until you sign out.
- **Daily Crown streak (hca-daily):** shows your daily learning streak across the apps. It holds the date you were last active, which apps you used that day and your streak numbers, and lasts up to a year. Your browser sends it with requests to our own domain, but our servers do not read or keep it, and it is never shared. It is not used for tracking. You can switch the streak off at any time on your account page (/account); we then delete it and set a small cookie (hca-daily-off) that remembers your choice.
- **App progress and settings:** each app keeps your progress, notes and settings in your browser’s storage. This stays on your device.
- **Preferences and offline use:** your light or dark theme choice and, if you install an app, a copy of it for offline use.

#### Young people

You can create an account from age 16. We design for young users too: we do not show advertising, do not profile you for marketing, send marketing only if you choose to receive it, keep location off, and keep data such as app progress on your device by default. Evinca is for people aged 18 and over.

#### Your rights

You can ask to access your data, correct it, delete it, restrict or object to its use, receive a portable copy, and withdraw consent at any time without affecting earlier processing. You can object to direct marketing at any time. Email us to use any right. We reply within one month, which we may extend by two further months for complex requests, and we will tell you if we do.

#### Complaints about your data

If you are unhappy with how we have handled your data, please email themicrolaunchequation@gmail.com with “Data protection complaint” in the subject. We will acknowledge your complaint within 30 days, investigate it, keep you updated and tell you the outcome without undue delay.

You can also complain to the Information Commissioner’s Office at ico.org.uk/make-a-complaint (https://ico.org.uk/make-a-complaint/) or on 0303 123 1113. The ICO usually expects you to raise the complaint with us first.

#### Changes

We update this notice when the way we use data changes. The date and version at the top show the latest version, and we will tell account holders about important changes.


---

## 7.4 Lean Six Sigma Green Belt: Terms, privacy and refund policy (https://lss.healthcarecrownacademy.co.uk/legal.html)

#### Terms of use

Last updated: 27 October 2026 · Version 2026-10-27

These terms apply to the Lean Six Sigma Green Belt toolkit for Healthcare Practitioners at lss.healthcarecrownacademy.co.uk (https://lss.healthcarecrownacademy.co.uk/) (the "Toolkit"). The Toolkit is provided by HEALTHCARE CROWN ACADEMY LTD, a private company limited by shares registered in England and Wales, company number 17501904, registered office 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ ("we", "us"). Contact: themicrolaunchequation@gmail.com. By creating an account you agree to these terms, our privacy policy and our refund policy below.

##### 1. What you get

- **Free account:** the handbook, Define-phase tools, preview versions of other tools with sample data, selected Field Guide chapters and a 10-question sample exam.
- **Full access (paid):** every tool, simulation, the Learning Studio, the full Exam Prep bank, the knowledge exam and a Certificate of Completion on passing, for 12 months from the date of purchase. It is a one-time payment shown in US dollars. We are not registered for VAT or sales tax, so nothing is added: the price shown is the total you pay (your bank may add its own currency fee). It does not renew automatically.
- Full access is an ongoing online service for 12 months, so the cancellation rules for services apply (see the refund policy).

##### 2. The certificate

The certificate is a Certificate of Completion issued by us. It shows that you passed the Toolkit's knowledge exam. It is not an accredited certification, a professional registration or a qualification, and it is not issued or endorsed by ASQ, IASSC, CSSC or any other certifying body. Employers decide for themselves whether to recognise it. References to these bodies' published bodies of knowledge are for study purposes only.

##### 3. Your account

- You must be 16 or over to create an account, and 18 or over (or have a parent's or guardian's agreement) to buy full access.
- One account is for one person. Do not share your login, and keep your password private. The name on your certificate comes from your account, so please use your real name.
- Team and hospital licences give each named person their own account.

##### 4. Educational use, not clinical advice

The Toolkit teaches quality-improvement methods. It does not diagnose, recommend treatment or make decisions about patients, and it does not replace your organisation's clinical, safety or governance processes. Do not enter patient-identifiable information into any tool.

##### 5. Content and copyright

The tools, text, posters, simulations and question banks belong to us or our licensors. You may use them for your own learning and your own improvement projects, share exports of your own project work, and show them to colleagues while teaching a session you deliver. Copying, reselling, republishing or giving others access to the Toolkit's content needs our written permission.

##### 6. Suspending an account

We may suspend an account that is shared, resold, used to cheat on the exam or used to copy the Toolkit's content. Except where we must act at once to protect the service or the law, we will tell you first and give you a chance to explain. You can ask for a review by emailing us. If we end your access without it being your fault, we refund the unused part of your payment.

##### 7. Availability and changes

We aim to keep the Toolkit available and to improve it, but we cannot promise uninterrupted service. We will not remove a main feature during your 12 months unless we must for a legal, security or supplier reason outside our control; if such a change is to your disadvantage, you may cancel and receive a refund of the unused part.

##### 8. Our responsibility to you

We are responsible for loss or damage you suffer that is a foreseeable result of our breaking these terms or failing to use reasonable care and skill. Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or anything else that cannot be limited by law, including your statutory consumer rights. If something we supply is faulty or not as described, you are entitled to a remedy, as explained in the refund policy. If you buy for a business purpose, we are not responsible for loss of profit or business opportunity, and our total liability to a business customer is limited to the amount paid in the 12 months before the claim.

##### 9. Payments

Payments are taken by Stripe, our payment provider, which also emails your receipt. We never see or store your full card details.

##### 10. Complaints and law

Email us with any complaint; we reply within 5 working days. These terms are governed by the law of England and Wales. If you live in Scotland or Northern Ireland, you may also bring proceedings in your local courts.

#### Privacy policy

Last updated: 27 October 2026 · Version 2026-10-27

HEALTHCARE CROWN ACADEMY LTD (company 17501904, ICO registration ZC273259) is the controller of the personal data described here. Contact: themicrolaunchequation@gmail.com. We collect as little as we can: most of what you do in the Toolkit never leaves your browser.

##### What we hold, why and our lawful basis

- **Account:** your email address, name, organisation (optional), a securely hashed password, and your access level with its expiry date. To run your account and issue certificates (contract).
- **Payments and refunds:** order reference, amount, currency, date, status, the time you asked for access to start, and refunds. To sell, refund and keep accounting records (contract; legal obligation). Card details are handled only by Stripe.
- **Exam results and certificates:** your score, pass status, certificate code and the name on it, so anyone you show it to can verify it (contract; legitimate interests in verifiable certificates).
- **Access codes:** which code was redeemed by which account, and failed attempts, to prevent guessing (legitimate interests).

##### What stays in your browser

Your project work in the tools (charts, data you type in, drawings, exam practice progress and settings) is saved in your own browser's storage. We cannot see it. Clearing your browser data deletes it, so export anything you want to keep.

##### Who receives your data

- **Supabase:** sign-in and our database, in Frankfurt, Germany (our processor).
- **Stripe:** payments and refunds (our processor for payments; an independent controller for its own fraud prevention and legal duties).
- **Netlify and Cloudflare:** website hosting (our processors).
- **Google Fonts, cdnjs and jsDelivr:** fonts and code libraries. Your browser contacts them when the page loads, which shares your IP address with them.

Where data is processed outside the UK, we use a transfer route recognised by UK law, such as UK adequacy regulations or the ICO's International Data Transfer Agreement or Addendum. We do not sell your data, show ads or use tracking cookies. We email you only about your account, receipts and important service notices.

##### How long we keep it

- Account and certificate: while your account is open; deleted within 30 days after you ask us to close it.
- Payment and refund records: 6 years from the end of the financial year of the transaction, as company and tax law require.
- Failed access-code attempts: up to 90 days.

##### Your rights and complaints

You can ask to access, correct, export or delete your data, or object to how we use it, by emailing us. We reply within one month. If you are unhappy with how we handled your data, email us with "Data protection complaint" in the subject: we acknowledge complaints within 30 days and tell you the outcome without undue delay. You can also complain to the Information Commissioner's Office at ico.org.uk (https://ico.org.uk/make-a-complaint/) or on 0303 123 1113.

##### Patient data

The Toolkit is not designed for patient information. Please use de-identified or sample data only.

#### Refund policy

Last updated: 27 October 2026 · Version 2026-10-27

At checkout you tick a box to ask for your access to start now, during your 14-day cancellation period. If you are a consumer, you can cancel within that period, which ends 14 days after the day you buy (buy on 1 March and you can cancel until the end of 15 March).

- **Within 3 days of paying:** a full refund, no questions asked. This is our own promise, more generous than the law.
- **After that, within your 14-day period:** we refund the price minus a proportionate amount in proportion to the time you have had access, out of 365 days. Example: cancelling 10 days after buying a US$99 licence costs US$2.72, so you get back US$96.28.
- **After a refund** the account returns to the free tier, and any certificate issued under that purchase is withdrawn.
- **After your 14-day period** there is no change-of-mind refund. Your legal rights still apply: if the Toolkit is faulty or not as described, you are entitled to a repair or replacement or, if that does not work, a price reduction that can be a full refund. We also refund duplicate or mistaken charges.
- Team and hospital licences: unused seats can be refunded within 14 days.

**How to cancel:** while signed in, use **Request a refund** in your account menu (top right of the Toolkit). It works out your refund and sends it straight away. The instant button can be used once per person; your legal right to cancel always applies, so you can also email themicrolaunchequation@gmail.com from the address on your account with a clear statement, for example "I cancel my Lean Six Sigma Toolkit purchase". You may use the model form below, but you do not have to. We refund to your original payment method within 14 days of being told; card refunds usually arrive within 5–10 working days.

To: HEALTHCARE CROWN ACADEMY LTD, 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, themicrolaunchequation@gmail.com

I hereby give notice that I cancel my contract for the supply of the following service: Lean Six Sigma Green Belt toolkit, full access

Ordered on: [date] · Name: [your name] · Account email: [email] · Date: [date]

← Back to the toolkit


---

## 7.5 Evinca: privacy, terms, corrections, reviewer conduct, fees and refunds (https://account.healthcarecrownacademy.co.uk/en/terms and related pages)

Note: Evinca's paid launch is planned for June 2027; its texts are dated 12 October 2026 and were updated on 27 October 2026 for fees, refunds and publication rules.

### Evinca privacy (last updated 12 October 2026)

The Evinca Review ("Evinca") is published by HEALTHCARE CROWN ACADEMY LTD, a private company limited by shares registered in England and Wales (company no. 17501904), registered office 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom ("we", "us"). We are the controller of the personal data described here.

Questions or requests about your data: themicrolaunchequation@gmail.com. "Evinca" and "The Evinca Review" are trading names of HEALTHCARE CROWN ACADEMY LTD. We are registered with the Information Commissioner's Office (ICO), registration no. ZC273259.

Evinca is intended for adults (18 and over) working in or with healthcare. We do not knowingly collect data from children.

#### What we collect

- Account details: your name, email address, role, organisation and country.
- Application and story content: the description of your work, outcomes, evidence links, team members you name, photos you upload, and the names and emails of colleagues you ask to confirm your contribution.
- Nominations, thank-you notes, reviewer sign-ups, enquiries and newsletter sign-ups you send us.
- Review records: reviewer scores, comments, conflict declarations and decisions about applications.
- Payment records, if fees apply in future: amount, currency, status and a payment reference. Card details are handled by Stripe and never reach us.
- Learning and career tools: if you are signed in and turn on "Save to my Evinca account", your course progress, drafts and documents from Learn & tools. With it off, that work stays only in your browser and is never sent to us.
- Technical data: standard server logs kept by our hosting providers for security.
- We do not ask for special category data (such as your health, ethnicity or religion). Please do not include it.

#### Data we receive about you from others

- If someone names you as a colleague, nominee or team member, we receive your name, email address, role and how they know your work from them. We tell you this when we first contact you, and you can decline, object or ask us to delete your details at any time.

#### Why we use it, and our lawful basis

- To run your account and assess your application, under our contract with you.
- To publish approved records, under our contract with you and only with the consent you give at application. Non-approved applications are never published.
- To contact colleagues you name so they can confirm your contribution, under our legitimate interest in verifying evidence. They can decline or ask us to delete their details.
- To store your Learn & tools work in your account, only when you turn this on, under our contract with you. Turning it off stops saving; ask us to delete the stored copy at any time.
- To send updates you sign up for, with your consent, which you can withdraw at any time.
- To keep the published register accurate and trustworthy, including keeping corrected or revoked records visible, under our legitimate interest in the integrity of the register.
- To keep the service secure, prevent fraud and meet legal obligations.
- Giving us your details is not a legal requirement, but we cannot assess an application without them.
- We do not make decisions about you by purely automated means. Every recognition decision is made by people.

#### Patient information

- Do not include patient names or anything that could identify a patient. We remove such details if we find them, and we may decline an application that contains them.

#### What becomes public

- If your application is approved, your public record shows your name, role, organisation, country, the recognition awarded, a summary of the work and its status history. You choose whether a photo appears. Evidence files, colleague details and reviewer comments are never published.
- You can withdraw your consent to publication at any time. Within 30 days we then remove your name, photo, summary and status history from the register, your profile page and search; anyone checking the verification link sees only that the record is no longer published, without your name.
- The one exception is a record that has been revoked (for example because evidence proved false). To keep the register trustworthy, its verification link keeps showing "Revoked" with a non-sensitive reason code for up to six years from the revocation, under our legitimate interests. You can object, and we will weigh your circumstances and tell you our decision.
- Copies already distributed before you withdraw consent, such as printed magazines or certificates, cannot be recalled, but we will not reprint or reuse them. The permission you give us to publish your words (a copyright licence) is separate from our data protection basis for showing your identity; withdrawing consent to publication ends both for future use.

#### Who processes data for us

- Supabase (database, sign-in and file storage, hosted in London, UK), Vercel and Cloudflare (website hosting and security, including servers in the United States), Stripe (payments, if enabled), and email providers used to send account and record emails. Each acts on our instructions under a written data processing agreement. Where data is processed outside the UK, we rely on UK adequacy regulations (including the UK Extension to the EU-US Data Privacy Framework) or the ICO's International Data Transfer Addendum. We never sell your data.

#### How long we keep it

- Published records stay online while the recognition is valid, unless you withdraw consent to publication (then removed within 30 days, as described above). Revoked records keep their "Revoked" status visible for up to six years from the revocation, as described above; you can object.
- Applications that are not approved, and their evidence, are deleted 24 months after the decision. Enquiries are kept for up to 24 months. Newsletter emails are kept until you unsubscribe.

#### Your rights

- Under UK data protection law you can ask to access, correct or delete your data, restrict or object to its use (including any direct marketing, at any time), receive a portable copy, and withdraw consent without affecting earlier lawful use. We reply within one month, extendable by two months for complex requests, and there is normally no fee.
- You can also complain to the Information Commissioner's Office (ico.org.uk). We would welcome the chance to help first.

#### If you live outside the UK

- We follow UK data protection law for everyone. Where the laws of your country (for example the EU GDPR or Saudi Arabia's Personal Data Protection Law) give you additional rights, we will honour them. Contact us using the details above.

#### Cookies

- We use only the cookies and local storage that are strictly necessary for sign-in, security and site preferences, so no consent banner is needed. We do not use advertising or tracking cookies. If this changes, we will ask for your consent first.

### Evinca terms (last updated 12 October 2026)

These terms apply to The Evinca Review website and the Evinca Honors programme, operated by HEALTHCARE CROWN ACADEMY LTD, a private company limited by shares registered in England and Wales (company no. 17501904), registered office 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom. By creating an account, applying, nominating or reviewing, you agree to them. You must be 18 or over to use Evinca. "Evinca" is a trading name of HEALTHCARE CROWN ACADEMY LTD.

#### What Evinca is

- Evinca Honors are independent recognitions of documented contribution to healthcare. They are not a licence to practise, a professional classification, a clinical certification, an academic qualification or an accreditation, and they do not replace the requirements of any professional regulator.

#### Applying

- Applications are currently open and free. You must be the person the application describes, or authorised to apply for the team or project.
- Everything you submit must be true and your own. You confirm that colleagues you name agree to be contacted, and that you have removed patient-identifying information.
- We assess every application against our published method. We may decline any application, and our decision follows that method rather than any payment or relationship.

#### Fees

- The first cohort is free. Where a fee applies, the full price, what it covers and the refund and cancellation terms are shown before you pay, and a fee never guarantees a result.
- If you are a consumer, you can cancel within 14 days of paying (the period ends 14 days after the day you pay). At checkout we ask whether you want the review to start during that period. If you cancel before reviewers are assigned, you get a full refund. If you asked for the review to start and then cancel within the 14 days, we refund the fee minus a proportionate amount for the review work already done, and we show you how it was worked out. Once the review is complete and the decision issued, the service has been fully provided. Our own withdrawal policy on the fees page is more generous in some stages; where the legal calculation gives you more, you get the legal amount.
- If the review is not carried out with reasonable care and skill or as described, you are entitled to a remedy, which can include a refund, whatever the stage.

#### Using a recognition

- If approved, you may share your recognition using the exact wording on your record and its verification link. You must not describe it as a licence, qualification or accreditation, or use protected professional titles it does not grant.
- Recognitions can be corrected or revoked under our corrections policy, for example if evidence proves false. A revoked record keeps its "Revoked" status visible on its verification link for up to six years, as our privacy notice explains, even if consent to publication is later withdrawn.

#### Suspending or closing accounts

- You can close your account at any time by emailing us. We may suspend or close an account that breaks these terms, after telling you why where it is safe and lawful to do so.

#### Your content

- You keep ownership of what you submit. You give us a non-exclusive, worldwide licence to store and review it, and, if approved, to publish the summary and record in the register, the magazine and related promotion of the programme.

#### Acceptable use

- Do not submit false or misleading information, impersonate anyone, upload unlawful or confidential material, interfere with the service or attempt to influence reviewers.

#### Liability

- We provide the service with reasonable care and skill. We are not responsible for losses that were not reasonably foreseeable, or for decisions employers or other third parties make based on a record. Nothing in these terms excludes or limits our liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot be limited under English law, including your rights under the Consumer Rights Act 2015.

#### Changes and law

- We may update these terms and will show the date of the latest version here; we will tell account holders by email about important changes before they take effect.
- If any part of these terms is found unenforceable, the rest still applies.
- These terms are governed by the law of England and Wales. If you are a consumer, you may bring proceedings in the courts of England and Wales, or of Scotland or Northern Ireland if you live there, and you keep any mandatory protections of the country where you live.
- If you have a complaint, email us first; we aim to resolve complaints within 14 days.
- Contact: themicrolaunchequation@gmail.com.

### Evinca corrections (last updated 12 October 2026)

The register is only useful if it is accurate. Anyone can report an error or a concern about a public record.

#### How to report

- Email themicrolaunchequation@gmail.com with the record ID (for example EVN-…), what is wrong and any evidence. We acknowledge reports within five working days.

#### What happens next

- We investigate, give the record holder a fair chance to respond, and decide within 30 days where possible.
- A correction changes the public summary but keeps the recognition valid. A revocation ends the recognition; its verification link shows "Revoked" with a non-sensitive reason code for up to six years.
- Every outcome is added to the record's public status history.

#### Appeals

- The record holder or the person who reported the issue can appeal a decision once, within 30 days, by email. An appeal is decided by someone who was not involved in the original decision.

### Evinca reviewer-conduct (last updated 12 October 2026)

Reviewers are the reason an Evinca recognition means something. Every reviewer agrees to this code before opening a file.

#### Independence

- Declare any conflict of interest before reading a file: your employer, close colleagues, business partners, family or anyone you have a personal stake in. If in doubt, declare it and step aside.
- The founder is recused from his own projects, employers, business partners and close associates.

#### Fair assessment

- Score only against the published rubric and the evidence provided, not against reputation, nationality, profession or how the application is written.
- Flag any integrity concern, such as unverifiable claims or patient-identifying information, instead of scoring around it.

#### Confidentiality

- Applications, evidence, scores and discussions are confidential. Do not copy, share or keep them after the review, and do not contact applicants or their colleagues directly.

#### Conduct

- Do not accept gifts or favours connected to a review. Breaches of this code end a reviewer's participation and may lead to affected decisions being re-reviewed.

### Evinca fees (lib/program.ts)

| Route | Who | Fee (US$) | Access fee (US$) |
|---|---|---|---|
| Rising Star (Emerging Healthcare Contributor) | First five years of practice | 39 | 19 |
| Evinca Honor, individual dossier | Patient Safety & Quality, Healthcare Education and other themes | 49 | 25 |
| Evinca Honor, leadership dossier | Healthcare Leadership (more evidence to review) | 149 | 75 |
| Evinca Honor, team or project dossier | Up to 8 named members, one shared record | 299 | 149 |

### Evinca refund stages (lib/program.ts)

- Found ineligible at screening: full refund.
- Withdrawn before reviewers are assigned: full refund.
- Withdrawn after assignment but before scoring: at least 50% refund.
- Your legal right: as a consumer you can cancel within 14 days of paying. If you asked for the review to start in that period, you get the fee back minus a proportionate amount for the work already done, with the calculation shown. Where that gives you more than the stages above, you get that amount.
- Once the review is complete and the decision issued, there is no change-of-mind refund. If the review was not done with reasonable care or as described, you are entitled to a remedy at any stage.
- Anyone can request a hardship waiver; an independent coordinator must approve it before submission.

- **reviewerCreditText**: US$5 of Evinca account credit per completed review (credit only: no cash value, not transferable, spendable on Evinca fees)

---

## Part 8. Supporting records

### 8A. DPIA screening for Academy AI (draft for the owner to sign)


Controller: HEALTHCARE CROWN ACADEMY LTD (17501904, ICO ZC273259) · Prepared: 27 October 2026 · Owner to review and sign · Review again before any change to providers, caching or audience.

#### 1. What the processing is
Signed-in Lumen users who have an Evinca membership level may select a passage of their own study notes and ask Academy AI to make recall cards or explain it. The passage, Lumen's instructions and the request go from the browser to our Supabase Edge Function `lumen-ai` (London, eu-west-2), which forwards them to OpenAI, then Groq if OpenAI fails (Gemini only if a paid Google project is confirmed with `LUMEN_AI_GEMINI_PAID=true`). The answer returns to the user. Structured (JSON) answers are cached for 30 days in `lumen_ai_cache` under a key that includes the user id, so only the same person can reuse them. A per-user daily request count is kept in `lumen_ai_usage` (90 days). Prompt text is not written to logs. No name or email is sent to the AI providers.

#### 2. Screening questions (ICO list of likely high-risk processing)
| Question | Answer |
|---|---|
| Innovative technology (AI)? | Yes: large language models. |
| Special category data (health)? | Not intended. Users study health topics; notes may mention conditions in general. Risk: a user pastes patient-identifiable or their own health information despite instructions. |
| Vulnerable people or children? | Accounts from 16, so some users are 16–17. |
| Large scale? | No: capped at 15–60 requests per user per day and 3,000 per day in total. |
| Profiling or automated decisions with significant effects? | No. |
| Invisible processing or data matching? | No: user-initiated, disclosed in the privacy notice and in Lumen settings. |
| International transfers? | Yes: AI providers in the United States. |
| Systematic monitoring? | No. |

**Screening result:** two triggers (innovative technology and possible health data with some under-18 users) mean a full DPIA is advisable before marketing Academy AI widely. The measures below already reduce the risk; record the decision below.

#### 3. Risks and measures
| Risk | Likelihood / severity before | Measures in place | Residual |
|---|---|---|---|
| Patient-identifiable data sent to AI | Possible / high | Clear warnings in Lumen, privacy notice and terms; user-selected passages only; size limit 30,000 characters; no identity sent to provider | Low–medium. **Add:** a simple client-side check that warns before sending text containing NHS numbers, dates of birth or "Mr/Mrs + surname" patterns. |
| Cross-user leakage via cache | Was possible / medium | Fixed 27 Oct 2026: cache key includes user id; old shared cache cleared | Low |
| Provider training on data | Possible / medium | OpenAI and Groq APIs do not train on API data by default; Gemini excluded unless paid tier confirmed | Low |
| Over-retention | Possible / low | 30-day cache and 90-day counts enforced by `hca_retention_cleanup` (pg_cron, running daily since 27 Oct 2026) | Low |
| Transfer to US | Certain / medium | Provider DPAs with UK transfer mechanism (UK–US data bridge or IDTA/Addendum); transfer risk assessment to file | Low–medium |
| Inaccurate AI answers relied on clinically | Possible / medium | "AI answers can be wrong; check against course materials"; terms say apps are not for decisions about patients | Low |
| Under-18 users | Likely / low | No marketing by default, no profiling, data minimised, same protections for all | Low |

#### 4. Lawful basis
Contract (providing the Academy AI feature the user asks for). Health data is not sought; where a user chooses to include their own health information, Article 9(2)(a) explicit consent at the moment of sending is relied on only for that request, and we do not otherwise process it. Patient data must not be entered.

#### 5. Decision (owner to complete)
- [ ] Proceed with the measures above
- [ ] Add the client-side identifier warning before wider launch
- [ ] Full DPIA completed and filed (date: ______)
Signed: ______________ Date: ______

### 8B. Records of processing, suppliers and procedures


Controller: HEALTHCARE CROWN ACADEMY LTD, 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ · ICO ZC273259 · Contact: themicrolaunchequation@gmail.com · Updated 27 October 2026

#### A. Processing activities
| Activity | Data | People | Basis | Where stored | Retention |
|---|---|---|---|---|---|
| Accounts (Academy) | email, name, profile, sessions | users | contract | Supabase London (`ujeofxfbwivjmgrxqdcl`) | account life + 30 days |
| Plans and payments | plan, status, dates, country band, Stripe ids, amounts, refunds (`crown_subscriptions`, `crown_customers`, `gulf_passes`, `crown_refunds`) | buyers | contract; legal obligation | Supabase London; Stripe | 6 years after financial year end |
| Consent to start access | consent time and version (Stripe metadata) | buyers | legal obligation | Stripe | as payments |
| Academy AI | passages, answers (cache), daily counts | Lumen users | contract | Supabase London; OpenAI/Groq (US) | cache 30 days; counts 90 days |
| Enquiries | name, email, message (`inquiries`) | enquirers | legitimate interests | Supabase London | 24 months |
| Newsletter | email, consent time and version (`subscribers`) | subscribers | consent | Supabase London | until unsubscribe, then suppression |
| Sign-in logs | auth audit log | users | legitimate interests | Supabase | 90 days |
| Lean Six Sigma accounts, payments, certificates | email, name, org, access, payments, scores, certificates | LSS users | contract; legal obligation; legitimate interests | Supabase Frankfurt (`zrvmqnvlinstipzrimyd`); Stripe | account life; payments 6 years; code attempts 90 days |
| Evinca | see Evinca privacy notice | applicants, nominators, reviewers | various | Supabase London | see Evinca notice |

#### B. Suppliers: collect and file each agreement
| Supplier | Role | Agreement to accept/download | Transfer route to confirm |
|---|---|---|---|
| Supabase | processor | https://supabase.com/legal/dpa | EU/UK hosting; check sub-processors list |
| Vercel | processor | https://vercel.com/legal/dpa | UK–US data bridge certification or IDTA/Addendum |
| Cloudflare | processor | https://www.cloudflare.com/cloudflare-customer-dpa/ | as above |
| Netlify (LSS hosting) | processor | Netlify DPA from its legal pages | as above |
| Stripe | processor (payments) and independent controller (fraud/legal) | https://stripe.com/legal/dpa | as above |
| OpenAI | processor (API) | https://openai.com/policies/data-processing-addendum | as above |
| Groq | processor (API) | DPA from Groq's legal/trust pages | as above |
| Google (Gemini, only if paid tier enabled) | processor | Google's data processing terms for the paid Gemini API | as above |

For each: save the signed or accepted copy, note the date, list of sub-processors and transfer mechanism, and keep a one-page transfer risk assessment.

#### C. Procedure: closing an account (promised within 30 days)
1. Confirm the request comes from the account's email address.
2. In Stripe, cancel any subscription immediately (or let it end if the person prefers) and note any refund due.
3. In the Supabase SQL editor of the Academy project, delete the person's non-financial data and the sign-in account. Keep payment and refund rows for 6 years, unlinked from the deleted account (foreign keys use `on delete cascade` on some tables, so first export the person's payment rows from `crown_subscriptions`, `gulf_passes` and `crown_refunds` to your accounting records if they are needed).
   ```sql
   -- replace with the user's id from auth.users
   select id, email from auth.users where email = 'person@example.com';
   -- Academy AI cached answers use hashed keys and are deleted automatically within 30 days
   delete from public.lumen_ai_usage where user_id = '<id>';
   delete from auth.users where id = '<id>';   -- removes the login and cascades to linked rows
   ```
4. Do the same in the Lean Six Sigma project if they have an account there, and in Evinca as its notice describes.
5. Reply to confirm, within one month of the request.

#### D. Procedure: data-protection complaints (required since 19 June 2026)
1. Log the complaint (date received, person, summary) in a simple spreadsheet.
2. Acknowledge within 30 days (aim: 5 working days).
3. Investigate, keep the person updated, and send the outcome without undue delay, with the ICO route (ico.org.uk, 0303 123 1113).
4. Keep the log and correspondence for 2 years after closure.

#### E. Procedure: rights requests (access, erasure, etc.)
Verify identity, reply within one month (extendable by two months for complex requests, telling the person), and log the request and outcome.
