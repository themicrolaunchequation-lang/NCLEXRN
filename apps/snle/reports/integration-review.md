# SNLE integration review and feature-preservation checklist

Release state: **prepared and locally tested; not deployed or published**. The production website and existing hosting settings have not been changed.

The supplied master prompt requires a Cloudflare preview before production approval. This branch prepares the Academy connections and an isolated static app. Cloudflare access is unavailable, and the separate Interactive Labs collection is absent.

## Independent review and release hold — 2026-10-23

**Status: HOLD — preview and written owner approval required. Do not publish to `claude/loving-ptolemy-srrq02`.**

- **Cloudflare preview URL:** PENDING — owner has not provided one; no preview URL is asserted or invented.
- **Independent verification (reported by Claude, not rerun in this change):** integrity check passed; 58/58 journeys passed; 10/10 persistence checks passed; 31/31 library tests passed on `codex/snle-clinical-studio-integration`. Claude also reported that this branch is not missing commits from the live branch. These are external review claims, not a fresh CI attestation.
- **Implemented as source-level safeguards in this branch:** neutralize the displayed Scientific Committee chip/control and committee dialog; neutralize short, explicit unsupported expert endorsement statements; show **“Draft — pending clinical review”** on home and in tool/dialog popups. The original teaching content remains retained for future owner verification.
- **Paywall restriction:** SNLE must remain free of any paywall until clinical review is complete. This safeguard is a release requirement; the present changes do not add any paywall. Paid offerings elsewhere in the Academy are outside the SNLE-specific scope.
- **Still to verify:** run the full test suite after these source edits; visually confirm home and every tool popup notice; inspect all visible authorship/credential/endorsement statements and suppress unverified claims; verify no SNLE paywall/entitlement gate; inspect Cloudflare preview functionality and accessibility.
- **Unresolved blockers:** written confirmation of committee names/credentials and any endorsements; independent qualified clinical review; absent Interactive Labs source; Cloudflare preview URL and verification; owner approval in plain words after seeing the Cloudflare preview.
- **Non-negotiable restrictions:** do not widen login/account redirect allowlists to preview hosts; do not change Vercel settings, domains, existing applications or production DNS; do not merge or publish to `claude/loving-ptolemy-srrq02` absent explicit owner approval.

## Preserved content and provenance

The exact attachment is recoverable from source/original.html.gz. SHA-256: 75e79310323b939ac4c65ed2f1c95aa3651e78b409d10a0ca0eeb46cdcac0996. Counts are 1,350 main-bank questions, 67 canonical posters, 35 dossiers / 350 cases, 62 glossary entries, 73 unique embedded assets and 97 original named runtime functions. Historical metadata mentions 68 poster pages; one duplicate was already retired. No questions were invented to fill counts. The full v14 deployment package was unavailable.

## Feature checklist

PASS means the stated scope was verified. PRESERVED/PARTIAL means source preservation was checked but that interaction has not been exhaustively exercised. BLOCKED identifies an actual missing dependency or external verification.

| Feature | Status | Evidence / limit |
| --- | --- | --- |
| Original recoverable HTML | PASS | Exact compressed original; SHA-256 checked before build. |
| Complete main question bank | PASS | All 1,350 records, fields, keys, rationales and linked IDs match the attachment. |
| Canonical poster collection | PASS | 67 posters; all 73 unique embedded media files verified byte for byte. |
| Clinical dossiers | PASS | 35 dossiers and all 350 cases match; catalogue and one feedback journey exercised. |
| Glossary data | PASS | All 62 records retained; search and teaching example exercised. |
| Original runtime functions | PASS | All 97 named functions retained; specific web adaptations asserted during build. |
| Home dashboard | PASS | Dashboard, practice start and original information overlays exercised. |
| Scientific committee / learning journey / course library | RELEASE HOLD | Committee claim entry points suppressed pending written verification; original learning journey/course library preservation remains subject to post-edit regression tests. |
| Every sidebar page | PASS | All nine routes navigate and survive refresh, including newly exposed My Progress. |
| React & Interact catalogue | PASS | Search, HYP filtering, compact layout, sorting and sorting persistence exercised. |
| All 67 tool popups | PASS | Each poster loaded; learn, poster, practice, evidence and summary tabs exercised. |
| All 67 Decision Lenses | PASS | Per-tool linked scenarios, response review and follow-up application exercised. |
| Original Coach Practice | PASS | Four choices, response review and next controls exercised. |
| Question teaching lenses / hint / zoom variants | PRESERVED; PARTIAL | Original handlers and data retained; not every lens, hint and zoom combination manually exercised. |
| Tutor Mock | PASS | Complete 20-question session reaches report with feedback. |
| Timed Exam Simulation | PASS | Complete 20-question session, hidden feedback, scaled midpoint break and report. |
| 200-question examination configuration | PRESERVED; PARTIAL | Original blueprint and timing functions retained; full 200-item timed run not performed. |
| Flags and answer history | PASS | Flag stored; answer history survives refresh. |
| Reports and recommendation controls | PASS; PARTIAL | Report renders after tutor and exam journeys; every print/retry recommendation combination not exercised. |
| Poster drawing and teaching notes | PASS | Pen marks and note persist, restore after refresh, and survive backup/import. |
| Page-wide annotations / dragging / legacy migration | PRESERVED; PARTIAL | Original page annotation engine and legacy migration retained; not every drawing and dragging combination exercised. |
| Five-stage study planner | PASS | Personal commitment survives refresh. |
| SNLE Guide | PASS | All five tabs exercised; current guide referenced. External reference availability can change. |
| Reset & Recharge | PASS; PARTIAL | Route, evidence overlay, exercises and saved completion exercised; each seven-exercise animation cycle not independently timed. |
| Blue / green palettes | PASS | Original palette toggle retained and exercised; attachment has no separate dark mode. |
| Arabic hover assist | PASS; PARTIAL | Toggle retained and exercised; all individual translations not independently linguistically reviewed. |
| Sound / mute keyboard control | PRESERVED; PARTIAL | Original audio functions and stored mute setting retained; speaker output not manually assessed. |
| Phone and tablet navigation | PASS | 390px and 768px layouts, More drawer, tool popup and overflow checks. |
| Keyboard / basic semantics | PASS; PARTIAL | Skip link, labels, dialog focus trap and Escape exercised; no manual screen-reader certification. |
| Automated accessibility samples | PASS | Home and mobile tool catalogue scans have no WCAG A/AA violations after contrast fixes; limited to sampled screens. |
| Local backup and reviewed import | PASS | Only SNLE-prefixed records exported/imported; matching records reviewed before replacement. |
| Blocked browser storage | PASS | Learning still loads; saves expose an error rather than claiming persistence. |
| Offline support | PASS; PARTIAL | App, questions and a previously viewed poster work offline. Unvisited media and absent Labs are not promised offline. |
| Shared suite switcher / account / Daily Crown | PASS; PARTIAL | Six links, active app, mocked authenticated account and rerenders checked; real account round-trip requires approved Academy origin. |
| Website launchers / interest picker / SNLE chapter | PASS | Six apps listed; SNLE URLs correct; paid offers unchanged. |
| Existing MedLex / Carecraft / Serein / Lumen | PASS | All load without exceptions with six-app switcher; prior MedLex Canvas Learn opens. |
| Existing Carecraft portable download | PASS | Rebuild retains tracked offline edition exactly when optional portable source is absent. |
| Three view-only companion libraries | PASS; REBUILT | Original linked companion files absent. New interfaces use unchanged embedded records, with filters, sorting, pagination, controlled reveal and full poster viewer. |
| Companion view-only affordances | PASS; LIMITED | No download controls; ordinary print/save shortcuts and context menu deterred; blur shield and image drag prevention. HTML cannot prevent screenshots or determined copying. |
| Interactive Labs collection | BLOCKED | Separate SNLE_Decoder_Interactive_Labs_v3 folder not supplied. Clear unavailable panel preserves navigation; original exercises not recreated. |
| Cloudflare build structure | PASS | Static dist, hash assets, security/cache headers, manifest, worker and Pages config prepared; every current asset below 25 MiB. |
| Cloudflare preview / HTTPS / edge cache / routing | BLOCKED | No Cloudflare access or API credentials; not deployed or verified at the edge. |
| Production hostname and real account return | BLOCKED | Proposed snle.healthcarecrownacademy.co.uk is unbound; existing live site remains unchanged. |
| Independent clinical validation | PENDING | Source marks main-bank items pending expert validation and pilot psychometrics. Targeted reference checks do not close this work. |

## Every React & Interact tool

All rows are software checks. Every tool still requires clinical educator review.

| Tool | Decision Lens / follow-up | Poster / five popup tabs | Clinical review |
| --- | --- | --- | --- |
| poster-001 · ABCDE First-Look & Action Guide | PASS | PASS | PENDING |
| poster-002 · ABG Stepwise Interpreter | PASS | PASS | PENDING |
| poster-003 · ADPIE Framework | PASS | PASS | PENDING |
| poster-004 · APGAR Newborn Assessment Guide | PASS | PASS | PENDING |
| poster-005 · AVPU Clinical Decision Guide | PASS | PASS | PENDING |
| poster-006 · Actual Before Potential | PASS | PASS | PENDING |
| poster-007 · Acute Before Chronic | PASS | PASS | PENDING |
| poster-008 · Assess Before Acting | PASS | PASS | PENDING |
| poster-009 · BE-FAST Stroke Recognition | PASS | PASS | PENDING |
| poster-010 · Blood & Blood Products Safety | PASS | PASS | PENDING |
| poster-011 · CAB First-Look & Action Guide | PASS | PASS | PENDING |
| poster-012 · CUS Clinical Decision Guide | PASS | PASS | PENDING |
| poster-013 · Closed-Loop Communication | PASS | PASS | PENDING |
| poster-014 · Core Laboratory Pattern Atlas | PASS | PASS | PENDING |
| poster-015 · Critical Lab & Electrolyte Prioritizer | PASS | PASS | PENDING |
| poster-016 · Deterioration & First-Action Coach | PASS | PASS | PENDING |
| poster-017 · Difference / Contrast Decision Lab | PASS | PASS | PENDING |
| poster-018 · ECG & Lethal Rhythm Rapid Reader | PASS | PASS | PENDING |
| poster-019 · Emergency Exception | PASS | PASS | PENDING |
| poster-020 · Fall Prevention & Post-Fall Response | PASS | PASS | PENDING |
| poster-021 · Fetal Monitoring & Obstetric Emergency | PASS | PASS | PENDING |
| poster-022 · Five Rights of Delegation | PASS | PASS | PENDING |
| poster-023 · Four Ts of Postpartum Hemorrhage | PASS | PASS | PENDING |
| poster-024 · Glasgow Coma Scale | PASS | PASS | PENDING |
| poster-025 · Glycemia & Diabetes Acute Safety | PASS | PASS | PENDING |
| poster-026 · I-PASS Handoff | PASS | PASS | PENDING |
| poster-028 · IV Fluid Types & Selection | PASS | PASS | PENDING |
| poster-029 · IV Therapy & Fluid Balance | PASS | PASS | PENDING |
| poster-030 · Infection Control Selector | PASS | PASS | PENDING |
| poster-031 · Infusion Pump Safety | PASS | PASS | PENDING |
| poster-032 · Isolation Precautions | PASS | PASS | PENDING |
| poster-033 · Leadership & Management Decision Matrix | PASS | PASS | PENDING |
| poster-034 · Least Restrictive & Least Invasive | PASS | PASS | PENDING |
| poster-035 · Maslow Clinical Priority Guide | PASS | PASS | PENDING |
| poster-036 · Medication Math Lab - Foundations | PASS | PASS | PENDING |
| poster-037 · Medication Math Lab - Advanced | PASS | PASS | PENDING |
| poster-038 · Medication Administration Safety Checks | PASS | PASS | PENDING |
| poster-039 · NG / Enteral Tube Safety | PASS | PASS | PENDING |
| poster-040 · Chain of Command | PASS | PASS | PENDING |
| poster-041 · Scope-of-Practice Filter | PASS | PASS | PENDING |
| poster-042 · OPQRST Pain Assessment | PASS | PASS | PENDING |
| poster-043 · Oxygenation, Oxygen Therapy & Suctioning | PASS | PASS | PENDING |
| poster-044 · Patient Safety Event & Sentinel Event | PASS | PASS | PENDING |
| poster-045 · Pediatric & Newborn Rapid Pattern Atlas | PASS | PASS | PENDING |
| poster-046 · Pediatric Assessment Triangle | PASS | PASS | PENDING |
| poster-047 · Peripheral vs Central Vascular Access Decision Lab | PASS | PASS | PENDING |
| poster-048 · Post-Op Complication Lab | PASS | PASS | PENDING |
| poster-049 · Professional Practice & Legal Decision Coach | PASS | PASS | PENDING |
| poster-050 · Psychiatric Nursing Decision & Safety Guide | PASS | PASS | PENDING |
| poster-051 · RACE & PASS Fire Safety | PASS | PASS | PENDING |
| poster-052 · Research & EBP Quick Filter | PASS | PASS | PENDING |
| poster-053 · SAMPLE Emergency History | PASS | PASS | PENDING |
| poster-054 · SBAR / ISBAR | PASS | PASS | PENDING |
| poster-055 · Safety First | PASS | PASS | PENDING |
| poster-056 · Special Medications, Diseases & Laboratory Considerations | PASS | PASS | PENDING |
| poster-057 · Suicide & Psychiatric Safety Algorithm | PASS | PASS | PENDING |
| poster-058 · Teach-Back | PASS | PASS | PENDING |
| poster-059 · Therapeutic Communication Simulator | PASS | PASS | PENDING |
| poster-060 · Tracheostomy Emergency & Care | PASS | PASS | PENDING |
| poster-061 · Tubes / Drains Troubleshooter | PASS | PASS | PENDING |
| poster-062 · Two Patient Identifiers | PASS | PASS | PENDING |
| poster-063 · Unexpected Before Expected | PASS | PASS | PENDING |
| poster-064 · Unstable Before Stable | PASS | PASS | PENDING |
| poster-065 · Urinary Catheter & CAUTI Safety | PASS | PASS | PENDING |
| poster-066 · VEAL-CHOP Fetal Heart Rate Memory Guide | PASS | PASS | PENDING |
| poster-067 · WHO 5 Moments for Hand Hygiene | PASS | PASS | PENDING |
| poster-068 · Wound & Pressure Injury Decision Lab | PASS | PASS | PENDING |

## Interface and performance changes

The original monolithic attachment is 29,897,744 bytes. The hosted entry HTML is 1596 bytes; content is loaded from hashed scripts, CSS and externalized images. The total current static output is 23999799 bytes across 95 files; the largest asset is 3174348 bytes. The 1,350-item data script remains roughly 3.17 MB uncompressed, so this is not a claim of a lightweight bank or measured production speed. Images load lazily, immutable assets can cache for a year, HTML/worker revalidate, and the service worker caches the shell plus viewed media.

Added the existing Crown shell, crest, six-app switcher, account link and Daily Crown entry; direct hash URLs and refresh support; a real My Progress navigation item; mobile More drawer corrections; safe storage handling; a reviewed local progress import; a native help dialog; labels and focus handling; CSP-safe focus controls; and contrast fixes. Fixed stale delayed rendering, examination clocks after leaving practice, native-dialog close detection and leftover overlays during browser navigation. Existing paid plans and entitlement rules remain unchanged.

## Remaining issues by severity

| Severity | Issue | Required next step |
| --- | --- | --- |
| Release blocker | Cloudflare account/API access and network destination unavailable | Enable the intended account securely; inspect existing projects; create and validate an isolated preview. |
| High | Original Interactive Labs folder absent | Supply the folder ZIP / complete original package, integrate it, test its pages and assets. |
| High | Imported clinical content pending expert review | Qualified nursing educators must review high-risk items and jurisdiction-specific practice; see clinical-audit.md. |
| Medium | Real account return untested | Verify existing sign-in/return on the approved Academy hostname; do not widen preview allowlists. |
| Medium | Remaining preservation-only interactions | Complete manual lens/annotation/audio/animation, full-length exam and assistive-technology checks before claiming exhaustive verification. |
| Medium | Generic distractor labels, item sources and psychometrics | Expand option-specific educator rationales, sources/review dates and pilot validation. |
| Medium | Original standalone companion interfaces unavailable | New views preserve embedded content, but visual parity with missing originals cannot be established without those files. |

## Release and rollback

See ../DEPLOYMENT.md for exact Pages GitHub settings and order. Validate Cloudflare preview first, resolve Labs scope, obtain production approval, connect only the approved new hostname, verify the real account round-trip, then publish Academy navigation. Never overwrite existing hosting projects. Record deployment IDs and the prior Academy commit. Roll back only the SNLE deployment and Academy navigation commit; retain learner storage.

The prior Academy commit is b1a9a9ae7d4bb2ea20b70a760cb6b31a89c7edad. No production branch push or Vercel domain/environment/settings change was performed for this integration.
