# Clinical reviewer pack: editorial preflight and handoff

Checked: **23 October 2026**. This is an editorial/data and evidence preflight, **not registered-nurse sign-off**. The source CSVs and both uploaded ZIPs remain unchanged. No question is approved, adapted for release, dropped or certified by this report.

The supplied reviewer prompt requires a registered nurse educator's name, registration/licence number and country, regulator expertise and years in nursing education. Those credentials were not supplied. A reviewer should sign only for the regulator they know. No fabricated credentials, clinical verdicts or initials have been inserted.

## Pack reconciliation

- Queue: **1,350 records with 1,350 unique IDs**. Priorities: **6 priority 1; 95 priority 2; 300 priority 3; 949 priority 4**. The four counts sum to 1,350.
- Full text: **158 unique IDs**: **57 SPOT-CHECK + 6 PRIORITY 1 + 95 PRIORITY 2**. All 57 sample IDs are represented. Stems, four options, keys and rationales are present; every key is A–D. This establishes structural completeness, not clinical correctness.
- All **158** verdict/reference/initial/date fields are blank: **0 signed APPROVE, 0 signed ADAPT, 0 signed DROP; 158 awaiting clinical review**. All **1,350** queue records are UNREVIEWED, PENDING for all four regulator editions and NOT_FOR_RELEASE. These statuses were preserved.
- The pack contains **67 poster records**, but not poster artwork/full teaching text. Poster clinical review cannot be completed from the queue alone.
- **1,192 questions lack full text in this pack**. After the supplied sample, the remaining priority-4 pool has **892** unexported questions; priority 3 has **300**. Request those exact full-text exports if review expands.
- `triage_tag=Core` has **1,022** records; `review_priority=4` has **949**. These are different fields/pools. A “whole Core” expansion must identify the intended IDs instead of assuming the labels are interchangeable.

## Resolve these reviewer-instruction discrepancies

1. **Expansion threshold:** the prompt says more than 3 of 57 need changes, which means **4 or more**. The brief says more than 5%, which means **3 or more**, since 3/57 = 5.26%. A clinical reviewer has not yet produced a failure count. Recommended project decision: use the more conservative **3-item trigger**, and document it before applying the review gate. This recommendation does not change the source files or certify a failure rate.
2. **Work order:** the main reviewer prompt says to start with the 57-item spot-check; the brief places priorities 1 and 2 first. Proposed handoff: review the 57 first to test the screen, then the six Saudi-specific items, then the 95 priority-2 items, and obtain further exports before proceeding.
3. **Workload:** the actual supplied full-text batch is 158, rather than the prompt's approximate 100. Agree the clinical-review schedule on the actual count.

## Specific issues for the RN educator

These are requests for clinical/editorial assessment. `reviewer_verdict` remains blank in every original record. International clinical guidelines below are primary evidence for the issue raised, **not substitutes for local Gulf scope/policy sign-off**.

- **Q0011, SPOT-CHECK — emergency activation sequence.** The selected option joins compressions and activation but does not establish whether the nurse is alone, help has already been called, or another responder is present. Specify that context and clarify the sequence in the rationale. The AHA 2025 Adult BLS guidance distinguishes lone-responder activation followed immediately by CPR; it also supports treating absent definite pulse within ten seconds as arrest. Do not mark the current key wrong solely from this note. Reference C1.
- **Q0713, SPOT-CHECK — boggy postpartum uterus.** The stem does not establish bleeding, haemodynamic stability or whether uterine massage/initial assessment has already occurred. The selected bladder-emptying action should not teach postponement of immediate atony/haemorrhage management. Add context or revise the response to integrate tone, bleeding assessment and prompt indicated management. WHO's November 2025 quick card includes assessment of uterine tone/blood loss/vital signs and uterine massage for a poorly contracted uterus. Reference C2.
- **Q0843, SPOT-CHECK — disconnected chest drain.** Specify the drain/device, location of the disconnection and applicable local protocol. The current answer omits interim management while a replacement system is obtained. NSW ACI's procedure includes a brief clamp–reconnect–unclamp sequence, whereas the distractor condemns **extended** clamping. A local reviewer must decide the device-specific wording; do not replace it with a universal “always clamp” or “never clamp” rule. Reference C3.
- **Q1077, PRIORITY 2 — undocumented chronic baseline.** The stem says COPD; the key and rationale assume chronic CO₂ retention. Add a documented baseline/chronic history if testing “acute-on-chronic,” or ask the clinician to revise the interpretation. This is a mismatch between the supplied stem and rationale; no alternate diagnosis is certified here.
- **Q1266, PRIORITY 2 — weak distractors.** Three alternatives describe implausible or harmful actions, including a live vaccine for fetal lung maturation. This makes elimination easy without demonstrating the intended knowledge. Have the educator supply plausible alternatives and cite the current antenatal-corticosteroid guideline for the target jurisdiction. No clinical reference was entered in the original CSV.

## Saudi-specific adaptation candidates

For Qatar/DHA/DOH editions, route **Q0141, Q0143, Q0145, Q0619, Q0641 and Q1009** to the destination-specific reviewer. Do not change their Saudi originals.

- Q0141/Q0143/Q0145/Q0641: any Gulf-edition rewrite must identify the destination regulator's RN scope, credentialing and institutional authorization; changing only the regulator name is insufficient. Preserve the distinction between law/regulator authority and a local employer's policy.
- Q0619: the Saudi label is not necessary to test line tracing. A proposed destination-neutral version can test tracing the line from patient to source, subject to the educator's chosen primary safety reference and device policy.
- Q1009: retain immediate child-safety assessment, but local reporting duty, responsible agency, documentation and escalation route require a destination-specific reference. Do not substitute an invented generic Gulf reporting rule.

## Editorial findings across the supplied text

The 57 spot-check items were read for wording/context. Priority-1 items were read in full; priority-2 stems/keys and selected full records were screened. **A complete clinical verification of all 158 items was not performed.**

The correct option is the sole longest option by whitespace-delimited word count in **33/57 (57.9%)** spot-check items and **82/158 (51.9%)** supplied items. Ties included: **38/57** and **107/158**. This is an observable editorial cue, not proof that a key is wrong. Balance detail across plausible alternatives without adding unsafe instructions.

Spot-check key distribution: **A13, B16, C15, D13**; all supplied items: **A38, B36, C43, D41**. No key-distribution correction is required by these counts alone.

Some automatic jurisdiction flags appear broader than the question: Q0714 is labelled cultural/religious care but describes suspected concealed haemorrhage; Q1098 is similarly labelled but describes NPO oral care. Treat flags as routing hints, not evidence of cultural content or permission to remove an item. Units and drug-name variants also require actual local verification rather than automatic replacement.

I cannot determine whether material resembles a recalled secure exam from personal exam experience. The qualified reviewer must assess provenance under the pack's rule, and suspected secure-content matches should be withheld and investigated without reproducing that content.

## Primary references read for the flagged issues

- **C1 — American Heart Association, Part 7: Adult Basic Life Support, 2025 Guidelines for CPR and ECC.** Guideline year **2025**; read **23 October 2026**. [Exact URL](https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support). Top 10 message 2 and recognition recommendations. Quote fragment: “a lone responder should activate the emergency response system first”.
- **C2 — WHO, Postpartum Haemorrhage quick card.** Printed **Updated guidance November 2025**; read **23 October 2026**. [Exact official PDF URL](https://cdn.who.int/media/docs/default-source/integrated-health-services-%28ihs%29/csy/pph-quick-card.pdf?sfvrsn=359ae7aa_1). Assessment section. Quote: “If uterus is not well contracted, apply uterine massage”.
- **C3 — NSW Agency for Clinical Innovation, Pleural Drains in Adults: Drainage.** Page issue/revision date **NOT FOUND OFFICIALLY**; read **23 October 2026**. [Exact URL](https://aci.health.nsw.gov.au/networks/respiratory/resources/pleural-drains-in-adults/section-3-management/drainage). Disconnection procedure. Quote: “Reconnect system to a new drainage bottle.”

## Reviewer completion request

Obtain the educator's identity, licence/country, regulator expertise and experience; provide this handoff alongside the **unchanged original reviewer pack**. Ask them to enter APPROVE/ADAPT/DROP, a concise issue, the actual primary/local reference or textbook edition, initials and review date in their authorized working copy. Keep each regulator's approval separate. No external sharing or reviewer outreach has occurred.

After the 57-item review, apply the agreed expansion threshold to the **clinician's** change verdicts. If triggered, request the remaining 892 priority-4 texts and clarify whether any additional `Core`-tagged IDs are also intended. Request the 300 priority-3 texts before that stage. Return the signed working CSV with verdict counts, major issues and local-rule differences; keep all unsigned items NOT_FOR_RELEASE.
