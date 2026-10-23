# Two-Phase Delivery Verification — 2026-10-23
**Branch:** `codex/gulf-nursing-exams-two-phases`
**Production release:** **NOT AUTHORIZED / NOT PERFORMED**

## Phase 1 — research and crosswalk architecture
- [x] Official-source matrix with verified and provisional exam facts clearly distinguished.
- [x] SNLE source baseline, live/source discrepancy and content ownership boundaries recorded.
- [x] Offline SHA-256 checked generator for all 1,350 original question IDs and 67 poster IDs.
- [ ] Execute generator on the full original source archive and inspect actual generated CSVs.
- [ ] Clinical educator classification, sign-off, regulator-specific approval and question-key verification.
- [ ] Current DHA RN CBT line, DOH RN blueprint, Qatar duration conflict resolved against primary authorities.

## Phase 2 — standalone shared-platform prototype
- [x] Four edition selectors (SNLE, Qatar DHP RN, Dubai DHA RN, Abu Dhabi DOH RN).
- [x] Separate source-linked profile specifications; unknown values never filled by inference.
- [x] Isolated `gulf-*` learner planning keys, no cross-read or migration of SNLE local progress.
- [x] Exam blueprint display, comparison, reviewed source links, release warnings and planning interface.
- [x] Accessible semantic structure, responsive layout, day/night theme and reduced-motion accommodation.
- [x] Domain-exact full-mock assembly module with strict regulator, owner approval and item-level review gates.
- [x] Node smoke/engine test files and offline localhost preview script added.
- [ ] Node test suite executed in an actual checked-out repository; current environment only validated JS syntax and synthetic engine semantics in isolation.
- [ ] Real interactive-browser/mobile/screen-reader acceptance test.
- [ ] Approved question ingestion, psychometrics and complete clinical content.
- [ ] Isolated Cloudflare preview, DNS setup, live authentication and release decision.

## Read-only verification already performed
- GitHub comparison against `codex/snle-clinical-studio-integration`: new branch is ahead with **only files under `apps/gulf/`** changed; no modifications to the original SNLE source, Vercel, DNS or other apps.
- Parsed core app and profile JavaScript; tested blueprint logic and mock release denial.
- Synthetic (non-clinical) item fixtures verified assessment assembly, owner-approval gate and no official scoring claim.
- No claim is made that the actual `npm test` command or 1,350-item crosswalk extraction was executed.

## Hard release rules
1. Do not publish to `claude/loving-ptolemy-srrq02` or any live hostname without the owner's explicit approval after reviewing an isolated preview.
2. Maintain SNLE free of new paywalls during pending clinical review. This prototype adds no payments.
3. No widened sign-in/return URL allowlists for preview hosts.
4. No Vercel or existing Cloudflare project modification, no production DNS changes.
5. No claimed endorsement by licensing regulators or scientific committee.
6. No exam-complete labels before qualified local clinical sign-off and current regulator-source validation.
