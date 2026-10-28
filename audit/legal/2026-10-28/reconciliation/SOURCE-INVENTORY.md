# Source inventory: checkout, consent, refunds, emails (28 Oct 2026)

Commits checked: NCLEXRN `04bb4a2`+site edit (branch claude/dazzling-noether-vpexec), Evinca `75c2f0f` (main), LSS `claude/payments-reconciliation` (PR #16).

| Product | Checkout code | Stripe account / mode | Price source |
|---|---|---|---|
| Crown Pass (also MedLex, Carecraft, Lumen, Serein: all covered by Crown Pass) | `evinca/supabase/functions/crown-billing/index.ts` `checkout()` | acct_1UNyuEELw45NjhlB, test (restricted key decides mode) | Stored prices created on first use (`ensurePrice`, lookup keys `hca_*`) |
| Gulf Pass 3m/6m | same, `plan.startsWith('gulf-')` | same | Stored prices from `gulf_exam_plans` (active rows only) |
| Green Belt (LSS) | `lss-healthcare-toolkit/supabase/functions/create-checkout/index.ts` | same account, test | Inline `price_data` US$99 (explains "no products" finding F06) |
| Evinca | `evinca/supabase/functions/_shared/payments.mjs` | same account, test; separate readiness check | Inline `price_data` from frozen order amount |

| Area | Where |
|---|---|
| Consent boxes (start now + 18+/parent) | site `assets/js/subscribe.js` (`data-consent-box`, `data-adult-box`); LSS `index.html`; Evinca `components/account.tsx` |
| Server consent check | crown-billing `checkout()` (consent, adult, **new**: version check, text hash); LSS create-checkout lines 82-83; Evinca `record_review_consent` RPC + `require_review_consent` |
| Live switch (default off) | **new** `LIVE_PAYMENTS_APPROVED` in crown-billing and LSS create-checkout; Evinca `configured`/readiness in payments.mjs |
| Webhook signature | crown-billing `hook()` (constructEventAsync, 300s); LSS payment-webhook lines 115-124 (HMAC, 300s); payments.mjs line 111 |
| Webhook idempotency | crown: `crown_stripe_events`; LSS: unique `payments(provider,provider_ref)`; Evinca: RPC with event id |
| Test/live mismatch | crown: `event.livemode !== LIVE` ignored; Evinca: account id + mode; LSS: separate secret per endpoint (no livemode check) |
| Refund quote + execute | crown `refund()` (preview flag); LSS request-refund (preview); Evinca `record_app_refund` |
| Emails | crown `confirmationEmail()`, `ackEmail()`; LSS payment-webhook `confirmation()`, request-refund ack |
| Account closure | crown `closeAccount()`; LSS close-account |
| Certificate withdrawal | LSS request-refund line 81 (change-of-mind refund only); webhook keeps certificate on partial refund |
| AI | Lumen: own key only (`HCA6_ACADEMY_AI = false`); `lumen-ai` function returns 410 |
