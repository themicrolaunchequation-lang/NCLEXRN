# Release and rollback

**Status: committed, NOT deployed.**
- Evinca `75c2f0f` (crown-billing): needs deploy to Supabase project ujeofxfbwivjmgrxqdcl. Safe in test mode.
- LSS PR #16: owner merges, then deploy create-checkout and request-refund to zrvmqnvlinstipzrimyd.
- Site: crown-account.js sends consent_version (sw hca-v45). Works with old and new billing function.

**Order**: deploy functions → publish site → test one Gulf and one Crown test purchase.

**Going live (later)**: only after all decisions in LEGAL-OPEN-DECISIONS.md: set secret `LIVE_PAYMENTS_APPROVED=yes` in both projects. Without it, live checkout refuses.

**Rollback**: redeploy previous function version (Supabase keeps versions) or `git revert`; remove the secret to stop live sales instantly.
