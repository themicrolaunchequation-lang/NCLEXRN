# Item-level Crosswalk Specification — 1,350 SNLE Items / 67 Posters
Use `node apps/gulf/scripts/build-crosswalk.mjs` from the repo root. It reads the preserved original source *locally*, verifies its integrity hash, and generates two review queues in `apps/gulf/reports/generated/`. No user item text is transmitted externally.

**Fields for questions:** original_question_id, source_domain, source_topic, original_construct, source_status, high_risk_flag, sa_snle, qa_dhp, ae_dha, ae_doh, required_action, reviewer_id, review_date, evidence_url, clinical_approval, notes.
**Fields for tools:** original_poster_id, tool_title, original_source_job, local_policy_sensitive, destination editions, approval status, reviewer information.

Initial jurisdiction status for *every* item is `PENDING_CLINICAL_AND_REGULATORY_REVIEW`. Mapping a source domain to an official blueprint family identifies *potential* relevance only; it is not approval to publish or validity of exam coverage.

## Review workflow
1. Confirm original question/asset provenance and permission to reuse across new educational editions.
2. Verify clinical accuracy, key, distractors, rationale, evidence source/current date, and reading level.
3. Map to destination's actual blueprint subsection (not merely four generic domain labels).
4. Check local scope, laws, drug availability, units, maternal-child and emergency protocols.
5. Assign `APPROVED`, `REVISE`, `EXCLUDE`, or `PENDING` by an identified qualified clinician; record source and date.
6. Independently verify reviewer credentials and resolve any conflicts; run item statistics after pilot.
7. Only approved, version-pinned item IDs can enter a production question set. Mock blueprint shortage blocks exam simulation instead of substituting unreviewed items.
8. Maintain correction/version history and re-review on new official regulatory releases.

## Interpret generated counts
The generated CSVs are complete **inventory queues**, not validated crosswalks. A statement such as “1,350 items suitable for Qatar” is prohibited until review. Avoid claiming psychometrically calibrated difficulty or exam success probability.
