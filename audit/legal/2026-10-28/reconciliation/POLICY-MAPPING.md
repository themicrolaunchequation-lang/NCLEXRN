# Policy mapping: what the pages say vs what the code does

| Rule | Pages (v2026-10-28) | Code | Match |
|---|---|---|---|
| Two unticked boxes before paying | Yes | Site, LSS, Evinca: both boxes required, server rejects if missing | Yes |
| Consent wording version stored | Yes | Version + time in Stripe metadata; **new** text hash (Crown) | Yes (Crown hash only) |
| Full refund within 3 days, then minus days used to day 14 | Yes | crown `refundShare`, LSS request-refund | Yes |
| 14-day full refund (option D) | Not on pages | Behind `REFUND_POLICY=full14`, **off** | Not live, by design |
| 14 days counted from contract (trial start for Crown) | Yes | `windowEnd(sub.created)` | Yes |
| Instant button once per person; legal rights kept by email | Yes | `alreadyRefunded`; message points to email | Yes |
| Partial refund keeps access/certificate | Yes | LSS yes; Crown Gulf **fixed today** (was: any refund ended the pass) | Yes after fix |
| Stop renewal vs cancel-and-refund are separate | Yes | Portal (cancel at period end) vs `refund` action | Yes |
| Founding £29.99 then £39.99 | Yes | Coupon once on first year | Needs a live renewal test (T011) |
| Gulf 3m/6m only | Yes | Only active `gulf_exam_plans`; 1-month rows inactive | Yes |
| No Academy AI | Yes | Own key only | Yes |
| Products classed as services with time-based deduction | Yes | Yes | **Unresolved legally** (classification) |
