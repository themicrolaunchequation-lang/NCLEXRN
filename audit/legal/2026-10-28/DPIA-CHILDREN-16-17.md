# Data protection impact assessment: users aged 16 and 17 (draft)

HEALTHCARE CROWN ACADEMY LTD · draft prepared 28 October 2026 for the owner to check, complete and sign. Proportionate, short-form DPIA following the ICO Children's code approach. **Facts marked "to confirm" must be checked before signing.**

## 1. Why this DPIA
Academy accounts are open from age 16, so the online services are likely to be accessed by children (under 18). The ICO expects a children-focused DPIA for such services. Academy AI was switched off on 28 October 2026, which removes the highest-risk processing; this DPIA covers what remains.

## 2. What we process for a 16–17-year-old
| Processing | Data | Where | Basis | Notes |
|---|---|---|---|---|
| Account and sign-in | email, name (optional profile fields) | Supabase London | contract | shared sign-in for Academy apps and Evinca |
| Learning in MedLex, Carecraft, Serein, Lumen | progress, notes, settings | **on the user's device** (browser storage) | — (not sent to us) | Lumen sends text to an AI provider only if the user adds their own key |
| Gulf studio progress | answers, progress | user's account (Supabase) | contract | |
| Daily streak | date, apps used, streak | cookie on the device | consent (opt-in) | off by default |
| Payments | done by a parent/guardian or adult; payer confirms 18+ or parent/guardian | Stripe | contract / legal obligation | the child does not enter card details |
| Emails | order and cancellation emails to the account email | Resend (Ireland) | contract / legal obligation | no marketing without separate consent |
| Evinca | not available to under-18s (Evinca is 18+) | — | — | 18+ confirmation before any paid review |

No advertising, no analytics or tracking cookies, no profiling, no location data, no public profiles for Academy users, no chat between users (to confirm for every app).

## 3. Risks and measures
| Risk to the young person | Likelihood / severity | Measures in place | Further action |
|---|---|---|---|
| Entering health or patient information (e.g. in Lumen notes) | Possible / medium | Clear warnings; Lumen notes stay on the device; no Academy AI | Keep warnings visible in Lumen and Carecraft |
| Wellbeing content (Serein) | Possible / medium | Serein data stays on the device; "Get help" signposting | Confirm signposting covers UK and non-UK users (to confirm) |
| Paying without understanding | Possible / medium | Adult/parent payer box; 7-day free trial; refund preview; confirmation and cancellation emails | — |
| Own AI key: text sent to a third party | Possible / medium | Off by default; key stays on device; provider notes and patient-data warning shown | Consider hiding the own-key option for under-18s, or a stronger warning (owner decision) |
| Marketing to children | Low / medium | Marketing only with a separate unticked choice | Do not send marketing to known under-18s (to implement if age is collected) |
| Account security | Low / medium | Supabase auth; password reset by email | — |
| Data kept too long | Low / low | Retention schedule; Close my account | — |

## 4. Standards of the Children's code (summary check)
Best interests · high-privacy defaults (streak off, no tracking) · data minimisation · no nudging to weaken privacy · clear, age-appropriate privacy information (**to do: a short plain-language summary for young users at the top of the privacy notice**) · parental controls not used · no profiling · no connected toys · tools for rights (Close my account, email requests).

## 5. Decision
Residual risk: **low to medium**, acceptable with the further actions above. No need to consult the ICO.

Signed: ____________________ (Director) · Date: __________ · Review date: one year, or when a new feature processes more data about users (for example if AI returns).
