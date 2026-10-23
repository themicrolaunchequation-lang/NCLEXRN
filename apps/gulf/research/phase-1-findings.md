# Phase 1 — SNLE-to-Gulf Feasibility and Source Audit
**Branch:** codex/gulf-nursing-exams-two-phases. **Baseline:** codex/snle-clinical-studio-integration. No production, DNS, Vercel or Cloudflare operations.

## Evidence from existing repo and live site
- Source archive integrity documented as SHA-256 `75e79310323b939ac4c65ed2f1c95aa3651e78b409d10a0ca0eeb46cdcac0996`.
- Imported SNLE pool: 1,350 questions; 67 canonical posters; 35 dossiers/350 cases; 62 glossary entries, plus Decision Lenses and coaching controls. Counts sourced from SNLE's integration audit; not a new full-run confirmation.
- Live site at https://snle.healthcarecrownacademy.co.uk/ exposes home, tools, practice, guide, dossiers, glossary, progress and a Labs route. Prior integration report marks the original separate Labs bundle missing. **Reconcile current production deploy with source before cloning functionality.**
- Main-bank questions remain clinically unvalidated according to apps/snle/reports/clinical-audit.md. No evidence the bank is officially endorsed, normed, or psychometrically calibrated.
- Current live SNLE practice page uses 20/40/30/10 weights; its Progress page reports raw item counts Fundamentals 450, Adult 470, Management 130, Maternal–Child 300. Raw inventory is not exam blueprint coverage.
- Existing exam/scoring, progress keys, learning copy, scope statements, SCFHS links, and coach guidance are **Saudi-dependent**, not ready for blind rebranding.
- No authenticated user journey, complete mock, clinical review, or 67-tool regression run was performed by this phase.

## Reuse classification
| Capability | Candidate approach | Mandatory gate |
|---|---|---|
| Shell, navigator, theme, accessibility components | Reuse shared technology only | UI, keyboard, mobile regression |
| Tutor/exam engine | Extract to an exam-profile-driven module | Required item count, timer, blueprint exactness |
| Questions/dossiers | Reuse only after item-level clinical and regulator mapping | Evidence, license, answer validity, SME sign-off |
| Posters and Decision Lenses | Shared clinical tools with per-jurisdiction exceptions | Local scope and protocol SME review |
| Profile, analytics and local backup | Independent keys for each jurisdiction | Isolation test; no cross-exam overwrites |
| Official guide | Build separate verified guide per exam | Version-controlled primary regulator sources |
| Labs | Reconcile prod/source before reuse | Complete, independently testable asset inventory |
| Payments / login / domain | Out of scope | No entitlement or redirect changes |

## High-risk terminology/search flags for content review
Delegation, scope of practice, consent, orders, medication authorization, restraints, infection reporting, mandatory reporting, national policies, obstetric emergency pathways, pediatric dosages, resuscitation and blood transfusion. A flagged item is **not automatically invalid**; it needs contextual human review.

## Release gates
1. Signed current examination specification for each exam (especially DOH, DHA RN row, Qatar duration).
2. Item-level review and jurisdiction-specific suitability decision for all displayed questions and tools.
3. Clearly separate `DRAFT`, `INDEPENDENT CLINICAL REVIEW PENDING`, `APPROVED`; no auto-approval.
4. Confirm owner-approved labels, reviewers and endorsements, or suppress claims.
5. Complete independent functional, accessibility, privacy, security and psychometric pilot checks.
6. Obtain owner approval after preview. Do not publish to `claude/loving-ptolemy-srrq02` or touch production apps.
