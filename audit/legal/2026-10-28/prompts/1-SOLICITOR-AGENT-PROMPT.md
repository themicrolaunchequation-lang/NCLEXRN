# Prompt for an external legal agent (or solicitor): final consumer-law review

Copy everything below the line into the agent, and attach: LEGAL-REVIEW-PACK.pdf (latest), CLASSIFICATION-BRIEF.pdf, REVIEW-2-STATUS.pdf, LEGAL-REVIEW-2.md, and screenshots of the checkout boxes, the order confirmation email and the cancellation email.

---

You are acting as a senior UK consumer-law and data-protection reviewer for HEALTHCARE CROWN ACADEMY LTD (England and Wales, company 17501904; registered office 71-75 Shelton Street, Covent Garden, London WC2H 9JQ, a registered-office service; ICO ZC273259; not VAT-registered). **Important fact: the company has one director and no employees, and the business is run day to day from Saudi Arabia (Riyadh) and Jordan, not from the UK.** The Stripe account lists the director's address in Riyadh and a Saudi support phone number. The company sells online learning to consumers in the UK, the Gulf and elsewhere. It is about to switch on live payments. Your output will be checked by a qualified solicitor before anyone relies on it. Write for a non-lawyer owner, in plain English.

## What is sold (all through Stripe Checkout)
1. **Crown Pass**: subscription, £5.99/month or £39.99/year (founding first year £29.99 until 31 Jan 2027, then £39.99), 7-day free trial. Premium access to MedLex (medical terminology modules, guides, printable worksheets), Carecraft (scenarios, lessons, activities; downloadable offline edition), Lumen (study tool that works on the user's own files on their device; no AI supplied by us; users may add their own AI key). Serein is free.
2. **Gulf Pass**: one-off US$50 (3 months) or US$69 (6 months). Question bank (1,297 items), mock exams, reasoning tools, dossiers for four Gulf nursing exams, progress saved to the account, plus the Crown Pass for the same period. Never renews.
3. **Lean Six Sigma Green Belt toolkit**: one-off US$99 for 12 months. Tools, simulations, course materials, knowledge exam, Certificate of Completion (not accredited).
4. **Evinca review** (from June 2027): human verification and review of an applicant's evidence, decision and publication.

## What the system does today (verified by the owner in test mode)
- Before payment, two unticked boxes: (a) "I am 18 or over, or I am a parent or guardian paying for this account and I agree to the payment terms"; (b) "I ask for my access to start now, during my 14-day cancellation period. I understand that if I cancel within that period I get a full refund within 3 days of paying, and after that a refund minus the days I have used." The server refuses checkout without both and stores the time and version in Stripe metadata.
- After payment, an order confirmation email (durable medium): product, price, renewal terms, the request to start now, cancellation rights, the full statutory model cancellation form, terms version.
- Self-service "Cancel and get a refund": shows the amount first; full refund within 72 hours of payment; after that, price × time used ÷ the full paid period (real dates), until the end of the 14th day after the contract day; free trial simply cancelled; one instant use per person per product, with an email route that keeps all legal rights. A cancellation acknowledgement email follows.
- "Close my account": stops renewals, deletes personal and learning data, keeps nameless payment records for 6 years.
- Green Belt: a change-of-mind refund withdraws the certificate; a partial or fault refund does not.

## Your tasks
1. **Service or digital content, product by product** (main task). For each product above, say whether the contract is for services, digital content not on a tangible medium, or mixed, under the Consumer Contracts Regulations 2013 and the Consumer Rights Act 2015. Explain the reasoning using the actual features listed.
2. **Checkout wording.** For each product, give the exact checkbox wording needed (one box or two), so that (a) early supply is lawful, and (b) any deduction on cancellation is lawful. The business prefers customers to keep a refund right and does not want them to give up the right to cancel. Say plainly whether the current "3 days full, then proportionate" policy can stay for each product, or whether a full refund within 14 days is required for some products (for example digital content without an acknowledgement under reg. 37).
3. **Free trial.** Does the 7-day free trial change the analysis for the Crown Pass (contract date, early supply, deductions)?
4. **Confirmation and acknowledgement emails.** Do the order confirmation and cancellation acknowledgement, as described, meet reg. 16 and reg. 32(3)? What is missing?
5. **Business address and establishment.** The business is run from Saudi Arabia and Jordan; the only UK address is the registered-office service. The owner would prefer to publish only an email address and the registered office, and not a home address. Under CCR Schedule 2 and the Electronic Commerce Regulations 2002 reg. 6: (a) where is the trader "established" for these purposes; (b) what geographic address must be shown, and is showing only the registered office lawful or misleading in this situation; (c) is the director's home address in Riyadh or Amman required, or are there lawful alternatives (for example a genuine business or correspondence address in either country, or a UK correspondence address that actually receives and forwards post); (d) how should the pages describe where the business operates. Give practical options and the risk of each.
8. **Cross-border consequences.** Because the business is run from Saudi Arabia and Jordan, flag (do not fully advise on) whether Saudi or Jordanian consumer, e-commerce, licensing or data-protection laws (for example Saudi PDPL, Saudi E-Commerce Law, Jordan Personal Data Protection Law 2023) are likely to apply to the business itself, not just to customers there, and what a local lawyer should check.
6. **Cross-check the updated legal pack** (attached) against the facts above and against the second review's status sheet. List anything still inconsistent, unsupported or unlawful.
7. **Overseas customers.** Flag (do not fully advise on) anything in the documents likely to be unenforceable or misleading for Gulf or EU consumers.

## Output format
- A table per product: classification · reasons · exact checkbox wording · refund rule that may lawfully apply · severity (Must fix before taking money / Should fix / Nice to have).
- A list of every other change needed, each with: exact current quote · problem and law · severity · replacement wording ready to paste.
- A yes/no verdict: may the business take live payments once the "Must fix" items are done?
- Questions the solicitor must still confirm.

## Rules
Quote exact text. Do not invent facts; if something is unclear, say what you need to know. Do not reduce consumer rights to protect the business. Use current law and guidance as at your review date (including the DMCCA 2024 unfair commercial practices rules and the status of the subscription contract rules), and name the source for each conclusion.
