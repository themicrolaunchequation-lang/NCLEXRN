# Certificates audit

**Date:** 25 October 2026 · **Method:** source review of both repositories (`NCLEXRN@25959fd` for the audit branch, with site code unchanged since `e0764db`; `evinca@2806451`) plus read-only database catalogue counts. No certificate was issued, edited or revoked.

## 1. Inventory: every certificate the platform has or promises

| # | Certificate | Where | Issuer shown | Status found | Verification |
|---|---|---|---|---|---|
| 1 | MedLex "Completion certificate" | Promised on home pricing and paywall perks | Healthcare Crown Academy | **Not built.** No issuing function (`crown_issue_certificate` absent); `crown_certificates` holds **0 rows** | `crown_verify(serial)` exists, but no public verify page found |
| 2 | Carecraft "Completion certificate" | Promised on pricing | same | **Not built** (as above) | as above |
| 3 | Serein "Participation certificate" | Promised on pricing | same | **Not built** (as above) | as above |
| 4 | Lumen "Study certificate" | Promised on pricing | same | **Not built, and cannot be stored:** the table's `app` check allows only `medlex`, `carecraft`, `serein` | — |
| 5 | Crown Pass "All certificates" | Pricing card | same | Depends on #1–4 | — |
| 6 | Evinca Certificate of Recognition (public page) | `evinca/app/[locale]/verify/[id]/certificate/page.tsx` | "The Evinca Review", signed "Chair, Editorial Board" | Renders only from the static list of **13 fictional EVN-DEMO honorees** | QR to the live record page; record fingerprint printed |
| 7 | Evinca issuance-kit certificate (PDF for real records) | `evinca/components/issuance-kit.tsx` | Evinca | Built; **0 records issued** (`record_issues` = 0) | QR and PDF link to the verify URL; "ILLUSTRATIVE · NOT AN AWARD" shown for illustrative records (good) |
| 8 | LSS Green Belt Certificate of Completion | `integrations/hql/laureate-hql.js` + `certificate-engine/laureate-render.js` | **Health Quality Leaders Ltd**, "Authorised Course Director" | Built for the LSS Toolkit (separate product and seller) | QR contains **plain text only** (name, course, ID), with no link to a record |
| 9 | Laureate generator (standalone tool) | `certificate-engine/index.html` | Placeholder "Aurelian Institute of Process Excellence", "Dr. Helena Voss" | Internal tool with fictional defaults | Optional QR (plain text) |
| 10 | LSS ID badge | `id-badge/` | Placeholder "Aurelian Institute…", "Certified Professional" | Internal tool with fictional defaults | Verify URL to a placeholder domain |
| 11 | In-app learning records (MedLex / Carecraft print packs) | MedLex and Carecraft apps | Healthcare Crown Academy | Built | No verification; correctly worded "not a qualification or clinical competence certificate" (good) |

## 2. Findings

| ID | Certificate | Classification | Finding | Risk | Priority | Fix |
|---|---|---|---|---|---|---|
| CERT-01 | App certificates (#1–5) | Confirmed defect | Certificates are advertised as plan benefits ("Completion certificate", "Study certificate", "Participation certificate", "All certificates") but no issuing code exists and 0 have been issued. Lumen cannot be stored at all. | Selling a feature that doesn't exist once plans open (misleading). | **P1** | Remove certificate claims from pricing and paywall until built, or build them (CERT-02) before taking payment. |
| CERT-02 | App certificates (design) | Design risk | The plan bases eligibility on module completion (e.g., MedLex 26 modules at ≥ 80%), but progress lives in the browser's localStorage, where any user can edit it. | A certificate issued from client-side progress is forgeable. | **P1** (when built) | Issue only from a server-side assessment: a short timed end-of-course test scored in a database function. Store serial, holder, programme, score, date and status. Rate-limit attempts. |
| CERT-03 | Evinca (#6) | Needs verification | The printed legal line reads "Method published at **evinca.org**/how-we-review"; `covers.tsx` also prints evinca.org. Your Evinca site is `evinca.healthcarecrownacademy.co.uk`. | If you don't own evinca.org, whoever does controls where printed certificates send verifiers. | **P1** | Confirm ownership. If not owned, replace with the canonical domain everywhere and add a test that fails on any non-owned domain in certificate text. |
| CERT-04 | Evinca (#6) | Confirmed defect | "Review assurance: Two independent, blind reviews · Conflicts of interest declared and checked" is fixed text printed on **every** certificate. Your published method varies by route (some routes use one independent reviewer and an editor), and the only records rendered are fictional people. | A misleading statement of process on a credential. | **P1** | Print the assurance lines from each record's actual review data (number of reviewers, blind yes/no, COI check date). Never print them on demo records. |
| CERT-05 | Evinca (#6) | Confirmed defect | Demo certificates for fictional honorees are publicly printable. The "SAMPLE" watermark is drawn at **7% opacity**, and the signature block is real-looking. | Screenshots can circulate as real awards. | P2 | Raise the watermark to 25–35% opacity, add "ILLUSTRATIVE · NOT AN AWARD" (as the issuance kit already does), and `noindex` or disable demo certificate pages in production. |
| CERT-06 | Evinca (#6, #7) | Needs verification | Signed "Chair, Editorial Board" using `/signatures/chair.png`. The chair is not named, and no editorial board membership is published (the reviewers page says the pool is "being built"). | A credential signed by an unidentified office weakens trust and may mislead. | P2 | Name the signatory, with their consent and credentials, on the method page; or sign as "For Healthcare Crown Academy Ltd" until a board exists. |
| CERT-07 | Evinca (#6) | UX issue | Prints "Scored on the published rubric **v0.1**". | "v0.1" reads as a draft standard on a formal credential. | P3 | Version the rubric (e.g., 2026.1) and link it. |
| CERT-08 | Evinca (#6) | Confirmed defect | The QR encodes `window.location.origin + path`, so a certificate printed from a preview, `evinca.vercel.app` or `account.` host carries that host. `brand.siteUrl` falls back to `https://example.org` when the environment variable is unset. | QR codes pointing at non-canonical or dead hosts. | P2 | Always build verification URLs from one fixed canonical origin; fail the build if `NEXT_PUBLIC_SITE_URL` is missing in production. |
| CERT-09 | LSS (#8) | Confirmed defect | The seal reads **"OFFICIAL · CERTIFIED"** and the body says "demonstrating applied competence…", while the disclaimer says "Certificate of Completion… does not constitute… board certification". | Contradictory wording on a paid credential; learners may present it as a "certified Green Belt". | **P1** | Seal text "COMPLETION · HEALTHCARE"; replace "applied competence" with "completed the learning and assessment requirements"; keep the disclaimer. |
| CERT-10 | LSS (#8) | Confirmed defect | "Scan to verify" QR holds only text the certificate already shows. Nothing checks it against a record. | Trivially forgeable; the "verify" label overstates. | **P1** | QR should point to `https://<issuer-domain>/verify/<certificate-id>`, backed by a database lookup (like `crown_verify`) showing holder, course, score, date and status (active or revoked). |
| CERT-11 | LSS (#8) | Needs verification | Issuer is Health Quality Leaders Ltd, but the toolkit is sold on your home page as "Also from the Academy". | Unclear who is legally issuing and standing behind the certificate. | P2 | State the issuer on the product panel and in its terms; written agreement between the two companies. |
| CERT-12 | Laureate engine and ID badge (#9, #10) | Improvement opportunity | Defaults print a fictional institute, signatories ("Dr. Helena Voss"), "GENUINE · CERTIFIED", "Certified Professional", and "certification examination and a completed DMAIC improvement project". | If anyone exports with defaults, the result is a convincing fake credential. | P2 | Default to a large "SPECIMEN" watermark until the issuer, signatories and verify URL are changed from placeholders; remove "GENUINE · CERTIFIED" from defaults. |
| CERT-13 | Carecraft about text | Needs verification | "Created by Hossam AlDhaher, LSSMBB." | A post-nominal credential claim with no issuing body named. | P3 | Name the awarding body (or remove the post-nominal) and keep evidence on file. |
| CERT-14 | All | Good practice (keep) | MedLex and Carecraft print packs and the Evinca issuance kit already carry clear "not a qualification / not CPD / not clinical competence" lines. Evinca records have revocation and fingerprints. | — | — | Reuse the same line on every new certificate: *"Self-paced educational completion. Not a licence, accreditation, CPD credit or assessment of clinical competence."* |

## 3. Minimum standard every certificate should meet before release

1. Issued by a **server-side rule** (never browser progress).
2. A unique serial, with a public **verify page** on your canonical domain showing holder, programme, date, status and revocation.
3. **QR → verify URL**, never plain text.
4. A named, real signatory with consent, or the company name.
5. Wording describes **completion or participation** only. No "certified", "official", "competence", "CPD" or "accredited" unless that is literally true.
6. Demo or sample versions are watermarked so they can't pass as real at a glance.
7. **Admin revoke and reissue**, with an audit trail (`crown_admin_audit` already exists).
8. Every certificate printed in pricing exists and has been test-issued end to end.
