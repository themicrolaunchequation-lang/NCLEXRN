# Records of processing, suppliers and procedures

Controller: HEALTHCARE CROWN ACADEMY LTD, 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ · ICO ZC273259 · Contact: themicrolaunchequation@gmail.com · Updated 27 October 2026

## A. Processing activities
| Activity | Data | People | Basis | Where stored | Retention |
|---|---|---|---|---|---|
| Accounts (Academy) | email, name, profile, sessions | users | contract | Supabase London (`ujeofxfbwivjmgrxqdcl`) | account life + 30 days |
| Plans and payments | plan, status, dates, country band, Stripe ids, amounts, refunds (`crown_subscriptions`, `crown_customers`, `gulf_passes`, `crown_refunds`) | buyers | contract; legal obligation | Supabase London; Stripe | 6 years after financial year end |
| Consent to start access | consent time and version (Stripe metadata) | buyers | legal obligation | Stripe | as payments |
| Academy AI | switched off 28 Oct 2026; stored data deleted | — | — | — | — |
| Enquiries | name, email, message (`inquiries`) | enquirers | legitimate interests | Supabase London | 24 months |
| Newsletter | email, consent time and version (`subscribers`) | subscribers | consent | Supabase London | until unsubscribe, then suppression |
| Sign-in logs | auth audit log | users | legitimate interests | Supabase | 90 days |
| Lean Six Sigma accounts, payments, certificates | email, name, org, access, payments, scores, certificates | LSS users | contract; legal obligation; legitimate interests | Supabase Frankfurt (`zrvmqnvlinstipzrimyd`); Stripe | account life; payments 6 years; code attempts 90 days |
| Evinca | see Evinca privacy notice | applicants, nominators, reviewers | various | Supabase London | see Evinca notice |

## B. Suppliers: collect and file each agreement
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

## C. Procedure: closing an account
Since 28 October 2026 people close their own account on https://healthcarecrownacademy.co.uk/account ("Close my account"). It stops renewals, deletes personal and learning data, disables the sign-in and keeps payment records without the name. **Do not delete rows from `auth.users` by hand**: that would also delete payment records (cascading foreign keys).
For an emailed request: confirm it comes from the account email, then either ask the person to use the button, or ask the developer to run the same closure for that account. Reply within one month. If `account_closures.evinca_records` is above 0, email the person about their Evinca records.

## D. Procedure: data-protection complaints (required since 19 June 2026)
1. Log the complaint (date received, person, summary) in a simple spreadsheet.
2. Acknowledge within 30 days (aim: 5 working days).
3. Investigate, keep the person updated, and send the outcome without undue delay, with the ICO route (ico.org.uk, 0303 123 1113).
4. Keep the log and correspondence for 2 years after closure.

## E. Procedure: rights requests (access, erasure, etc.)
Verify identity, reply within one month (extendable by two months for complex requests, telling the person), and log the request and outcome.
