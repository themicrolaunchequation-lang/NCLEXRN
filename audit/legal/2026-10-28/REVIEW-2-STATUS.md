# Status of the second legal review (LEGAL-REVIEW-2.md)

That review was written against the pack **before** the 27–28 Oct fixes (it answers 13 questions; the current pack has 16). Status on 28 Oct 2026:

## Main site (Crown Pass, Gulf Pass)
| ID | Status |
|---|---|
| Founding price conflict (R11) | **Fixed 27 Oct**: first year only, then £39.99; no struck-through price |
| Gemini / health consent / AI (P01–P05) | **Fixed**: Academy AI removed 28 Oct; own-key only; health-consent wording replaced |
| T01 agreement & confirmation, R02 durable copy | **Fixed**: order confirmation email (terms version, rights, full model form) live via Resend |
| T02 suspension reviewer | **Fixed 27 Oct** (honest review wording) |
| T03 closure stops billing | **Fixed**: Close my account cancels renewals immediately |
| T04 adult payer | **Fixed**: required box "18 or over, or a parent or guardian paying"; server refuses without it; stored in Stripe metadata |
| T05 overseas rights saving | **Fixed 27 Oct** |
| T06 changes power | **Fixed 27 Oct** |
| T07 trading address | **Owner**: confirm a real geographic/correspondence address |
| T08 business-use exclusion | **Fixed** |
| R03 period can be extended | **Fixed** |
| R04 three-day promise | **Fixed** (72 hours from payment, matches code) |
| R05/R06 deduction safeguards and formula | **Fixed** (real period dates; amount shown before confirming) |
| R07 repeat refund | **Fixed 27 Oct** (email route, cancellation date = date of message) |
| R08 renewals | **Fixed** |
| R09 remedies | **Fixed** |
| R10 reminders | **Owner**: switch on Stripe renewal and trial-ending emails (test and live) |
| R12 model form | **Fixed** (full statutory model on page and in email) |
| R13 cancellation acknowledgement | **Fixed**: email after every instant refund or trial cancellation |
| R14 overseas tax | **Owner/accountant** |
| P06 transfers, P04 supplier terms | **Owner**: DPAs (Supabase, Stripe, Vercel, Cloudflare, Resend) |
| P07 backups | **Fixed** (no own backups; provider DR copies disclosed). Note: Supabase is on the free plan |
| P08 streak cookie | **Fixed 27 Oct** (opt-in) |
| P09/P11 privacy detail, cookie inventory | **Open (should fix)**: browser storage audit |
| P10 children's DPIA (16–17) | **Owner**: short DPIA for under-18 accounts (AI no longer applies) |
| R01 service vs digital content | **Solicitor**: classification product by product; text already says the policy is a minimum |

## Lean Six Sigma (L*, LP*, LR*)
Wording fixes on branch `claude/legal-review-fixes` (owner to merge). Still to build: confirmation email, cancellation acknowledgement, refund preview, close account, and certificate not withdrawn after a fault refund (LR02).

## Evinca (E*)
Paid launch June 2027. 18+ and early-start boxes built 27 Oct; policy fixes partly done. Remaining before June: Article 14 notice workflow, independent appeal/hardship person, refund stage after scoring starts, credit terms, access-fee eligibility, team publication permission, retention schedule, data-complaints route.
