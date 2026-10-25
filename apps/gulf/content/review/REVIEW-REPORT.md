AI pre-review — not a licensed clinical sign-off. Final approval requires a real licensed nurse reviewer.

# Three-role question pre-review
Review date: 2026-10-25 (Asia/Riyadh).

The three roles are simulated analytical perspectives of one AI assistant. No real nurse participated, and no reviewer credentials or independent human assessments are claimed. Every supplied item was checked in the Clinical Accuracy, Gulf Practice/Regulation, and Item-Writing perspectives, with the strictest role determining the item verdict. This is an editorial screening exercise, not a clinical sign-off or psychometric validation.

## Input completeness — release blocker

The requested input is 180 questions. The writer supplied 150: Qatar 60, Dubai 60, Abu Dhabi 30. The missing 20 Abu Dhabi practice-setting questions and 10 localised rewrites were not authored because the DOH source text could not be opened and verified. Missing slots are not treated as reviewed questions, rejected questions, or empty placeholders. No verdict is fabricated for them. The full 180-item task is therefore incomplete.

The preserved writer files are in `country-questions-return/`. The reviewed versions with exact edits are in this folder’s `corrected/`. Use only a real licensed reviewer’s later decision to authorize any learner release.

## Panel summary

| Edition | Input | PASS | FIX | REJECT | Safety flags | Corrected output | Missing from 60 |
|---|---:|---:|---:|---:|---:|---:|---:|
| qatar | 60 | 53 | 7 | 0 | 0 | 60 | 0 |
| dubai | 60 | 52 | 8 | 0 | 0 | 60 | 0 |
| abudhabi | 30 | 27 | 3 | 0 | 0 | 30 | 30 |

A FIX is an editorial or teaching-detail correction; none of these original keyed answers was classified as a patient-harm instruction. No supplied item was rejected in this AI pass. This does not mean that a licensed reviewer will accept every item.

## Ten recurring issues and review priorities

1. **Incomplete Abu Dhabi block:** 30 regulatory items are missing. Restore source access or provide the published DOH documents before writing those items. Do not substitute DHA or DHP rules.
2. **No licensed sign-off:** all 150 items remain pending human review despite the AI dispositions.
3. **Sparse clinical citations:** the writer used the permitted `source: null` for all 90 clinical items. Three hypoglycaemia items gain a directly checked ADA citation in the corrected files; a licensed reviewer should attach item-level guidance to the other 87 where useful.
4. **Judgment-label mismatch:** action questions about G6PD haemolysis and hyperkalaemia had interpretation/priority-hypothesis labels. They are changed to Take Action in all three editions.
5. **Delegation labels too broad:** checking the fit of a delegation, evaluating its outcome, selecting an activity and interpreting retained accountability need more precise judgment labels in Qatar and Dubai. Exact labels are applied below.
6. **One setting mismatch:** DU-014 describes a home visit; its Inpatient ward tag is corrected to Home healthcare.
7. **Hypoglycaemia teaching detail:** three questions omitted the adult carbohydrate amount and persistence rule. All three retain the same best answer and gain exact 15 g/15-minute wording.
8. **Framework version control:** the Qatar regulator-hosted PDF uses historical QCHP wording. The relevant RGN clauses are visible, but live hosting does not prove that no later circular changes implementation. The real reviewer should check current institutional application.
9. **Scope of broad standards:** several regulatory answers apply general safety, privacy or supervision principles to an original scenario. They do not establish specific legal deadlines, a named abuse-reporting destination, or authority to perform a particular restricted procedure. Keep those limits when local policies are added.
10. **Pilot evidence absent:** plausible misconceptions and balanced keys do not establish statistical item quality. Difficulty and HYP are editorial estimates; the editions share related learning constructs, so cross-edition variants are not independent samples for psychometric analysis.

## Counts and key balance

Clinical domain order: Nursing Fundamentals / Adult Nursing / Maternal-Child Nursing / Nursing Management and Leadership. The ASCII Maternal-Child name matches the existing bank facts. Practice-setting and localised items are counted separately from the 30-item clinical allocation.

| Edition | Clinical split required | Clinical split supplied | Practice-setting | Localised | A/B/C/D keys (input and corrected) | Maximum key share |
|---|---|---|---:|---:|---|---:|
| qatar | 6/12/9/3 | 6/12/9/3 | 20 | 10 | 15/15/15/15 | 25.0% |
| dubai | 7/11/8/4 | 7/11/8/4 | 20 | 10 | 15/15/15/15 | 25.0% |
| abudhabi | 7/11/8/4 | 7/11/8/4 | 0 | 0 | 8/8/7/7 | 26.7% |

No supplied edition exceeds the 35% key-share threshold. The 60-item total/count rule fails only for Abu Dhabi; its clinical allocation passes. Corrections change no key letter and remove no supplied item, so corrected distributions are identical. Dubai/Abu Dhabi 7/11/8/4 is the requested educational allocation, not a published regulator blueprint. No unpublished pass mark, borrowed official weight, duration guarantee or pass-rate claim is introduced.

## Source checks

All 60 supplied regulatory items cite one of three distinct documents opened and inspected directly: Qatar RGN scope, DHA conduct standards, and DHA home-healthcare standards. Reusing a checked document does not mean 60 distinct documents were downloaded. Each item’s exact section locator and result is recorded in `sources-check.csv`. The later ADA citation for the three hypoglycaemia fixes was also opened.

For clinical items with no source field, the URL columns are blank and both yes/no columns say no, with an explicit Not applicable explanation; these are not failed regulatory checks. Three additional WITHHELD-AD rows record the inaccessible DOH sources and are not item verdicts. Broad regulatory framework clauses support the stated nursing response; they do not establish extra legal rules absent from those documents.

The consulted clinical background references and access limitations are listed in the writer’s SOURCES.md. Some primary-guideline text was available through indexed excerpts while direct opening failed; those sources are not described as successfully opened.

## Safety-flagged items

None identified among the 150 supplied keyed answers in this AI screening. Dangerous distractors are explained as wrong; their presence alone is not a safety flag. Missing and unverified Abu Dhabi material is withheld.

## Exact FIX replacements

Each JSON object below contains the full replacement value for every changed field. Apply these objects as field replacements to the stated item ID. The corrected files already contain these changes, including synchronized answerText when an option is edited. Key letters are unchanged.

### QA-002

```json
{
  "judgment": "Generate Solutions"
}
```

### QA-003

```json
{
  "judgment": "Evaluate Outcomes"
}
```

### QA-029

```json
{
  "options": [
    {
      "label": "A",
      "text": "Take extra rapid-acting insulin and rest."
    },
    {
      "label": "B",
      "text": "Eat only a high-fat snack and recheck the next morning."
    },
    {
      "label": "C",
      "text": "Break the fast, take 15 g of fast-acting carbohydrate, and recheck glucose after 15 minutes."
    },
    {
      "label": "D",
      "text": "Continue fasting and recheck glucose at sunset."
    }
  ],
  "answerText": "Break the fast, take 15 g of fast-acting carbohydrate, and recheck glucose after 15 minutes.",
  "rationale": "The alert adult can swallow safely and needs prompt oral treatment of hypoglycaemia, even during a chosen fast. Give 15 g of fast-acting carbohydrate and recheck after 15 minutes; repeat treatment if glucose remains below 3.9 mmol/L, and seek urgent help if recovery fails or swallowing becomes unsafe.",
  "source": {
    "title": "American Diabetes Association — Low Blood Glucose (Hypoglycemia)",
    "section": "Key points and Treating Low Blood Glucose: adult 15/15 rule",
    "url": "https://diabetes.org/living-with-diabetes/hypoglycemia-low-blood-glucose",
    "accessed": "2026-10-25"
  }
}
```

### QA-031

```json
{
  "judgment": "Take Action"
}
```

### QA-035

```json
{
  "judgment": "Take Action"
}
```

### QA-051

```json
{
  "judgment": "Generate Solutions"
}
```

### QA-054

```json
{
  "judgment": "Analyze Cues"
}
```

### DU-002

```json
{
  "judgment": "Generate Solutions"
}
```

### DU-003

```json
{
  "judgment": "Evaluate Outcomes"
}
```

### DU-014

```json
{
  "setting": "Home healthcare"
}
```

### DU-030

```json
{
  "options": [
    {
      "label": "A",
      "text": "Break the fast, take 15 g of fast-acting carbohydrate, and recheck glucose after 15 minutes."
    },
    {
      "label": "B",
      "text": "Continue fasting and recheck glucose at sunset."
    },
    {
      "label": "C",
      "text": "Take extra rapid-acting insulin and rest."
    },
    {
      "label": "D",
      "text": "Eat only a high-fat snack and recheck the next morning."
    }
  ],
  "answerText": "Break the fast, take 15 g of fast-acting carbohydrate, and recheck glucose after 15 minutes.",
  "rationale": "The alert adult can swallow safely and needs prompt oral treatment of hypoglycaemia, even during a chosen fast. Give 15 g of fast-acting carbohydrate and recheck after 15 minutes; repeat treatment if glucose remains below 3.9 mmol/L, and seek urgent help if recovery fails or swallowing becomes unsafe.",
  "source": {
    "title": "American Diabetes Association — Low Blood Glucose (Hypoglycemia)",
    "section": "Key points and Treating Low Blood Glucose: adult 15/15 rule",
    "url": "https://diabetes.org/living-with-diabetes/hypoglycemia-low-blood-glucose",
    "accessed": "2026-10-25"
  }
}
```

### DU-032

```json
{
  "judgment": "Take Action"
}
```

### DU-036

```json
{
  "judgment": "Take Action"
}
```

### DU-051

```json
{
  "judgment": "Generate Solutions"
}
```

### DU-054

```json
{
  "judgment": "Analyze Cues"
}
```

### AD-030

```json
{
  "options": [
    {
      "label": "A",
      "text": "Break the fast, take 15 g of fast-acting carbohydrate, and recheck glucose after 15 minutes."
    },
    {
      "label": "B",
      "text": "Continue fasting and recheck glucose at sunset."
    },
    {
      "label": "C",
      "text": "Take extra rapid-acting insulin and rest."
    },
    {
      "label": "D",
      "text": "Eat only a high-fat snack and recheck the next morning."
    }
  ],
  "answerText": "Break the fast, take 15 g of fast-acting carbohydrate, and recheck glucose after 15 minutes.",
  "rationale": "The alert adult can swallow safely and needs prompt oral treatment of hypoglycaemia, even during a chosen fast. Give 15 g of fast-acting carbohydrate and recheck after 15 minutes; repeat treatment if glucose remains below 3.9 mmol/L, and seek urgent help if recovery fails or swallowing becomes unsafe.",
  "source": {
    "title": "American Diabetes Association — Low Blood Glucose (Hypoglycemia)",
    "section": "Key points and Treating Low Blood Glucose: adult 15/15 rule",
    "url": "https://diabetes.org/living-with-diabetes/hypoglycemia-low-blood-glucose",
    "accessed": "2026-10-25"
  }
}
```

### AD-032

```json
{
  "judgment": "Take Action"
}
```

### AD-036

```json
{
  "judgment": "Take Action"
}
```

## Checklist

- [ ] All 180 items reviewed by all three roles — 150 supplied items reviewed in all three roles; 30 Abu Dhabi items are absent.
- [ ] Every source URL opened and checked — every source URL used by a supplied regulatory item and the added ADA citation was opened; the three logged DOH sources could not be opened and no item was written from them.
- [x] Every FIX has exact replacement text.
- [x] No REJECTED item appears in corrected/ — none of the supplied items received REJECT.
- [x] Safety-flagged items listed in the report — none identified in supplied keyed answers.
- [x] Key balance and domain counts checked per edition — Abu Dhabi’s overall count failure is recorded.
- [x] The AI pre-review label is on the report and sign-off sheet — present in every sign-off summary, with the exact requested column names retained.
- [x] Valid JSON in corrected/ — structure, keys, options, misconceptions and exact changes validated.

The final four sign-off columns are intentionally empty for the real licensed reviewer. An AI PASS/FIXED is not permission to populate those columns or publish the bank.
