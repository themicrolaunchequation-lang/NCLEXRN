# Records of processing, suppliers and procedures

Controller: HEALTHCARE CROWN ACADEMY LTD, 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ · ICO ZC273259 · Contact: themicrolaunchequation@gmail.com · Updated 27 October 2026

## A. Processing activities
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

## C. Procedure: closing an account (promised within 30 days)
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

## D. Procedure: data-protection complaints (required since 19 June 2026)
1. Log the complaint (date received, person, summary) in a simple spreadsheet.
2. Acknowledge within 30 days (aim: 5 working days).
3. Investigate, keep the person updated, and send the outcome without undue delay, with the ICO route (ico.org.uk, 0303 123 1113).
4. Keep the log and correspondence for 2 years after closure.

## E. Procedure: rights requests (access, erasure, etc.)
Verify identity, reply within one month (extendable by two months for complex requests, telling the person), and log the request and outcome.
