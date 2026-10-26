# Edition questions and lab posters: release record

- **Received:** 25 Oct 2026, `Gulf-Nursing-Tasks-Return.zip`, from external agents.
- **Questions:** 150 items from `review-panel-return/corrected/` (Qatar 60, Dubai 60, Abu Dhabi 30). AI three-role pre-review: 132 PASS, 18 FIX applied, 0 REJECT, 0 safety flags.
- **Abu Dhabi gap:** 30 items are not included (20 practice-setting, 10 localised). DOH source documents could not be opened, so no rule-based Abu Dhabi items were written.
- **Licensed nurse sign-off:** the owner stated on 25 Oct 2026 that a licensed nurse signed off these items. The signed sheet was not included in the zip: `REVIEWER-SIGNOFF-SHEET.csv` has empty name, licence, decision and date columns. Store the completed sheet here when received.
- **App wording:** the app says "Approved for release by the Academy owner". It does not claim nurse review until the signed sheet is on file.
- **Posters:** 9 neutral posters (SNLE removed from titles 01, 02, 06, 09 and a few body lines) are shown for Qatar, Dubai and Abu Dhabi. The Saudi edition shows the unchanged originals.

## 26 Oct 2026: clinical acceptance and bank clean-up (owner decision)
- **Owner statement:** the content is clinically reviewed and accepted. App wording now reads "Clinically reviewed and accepted for release (26 Oct 2026)". File the signed reviewer sheet (`REVIEWER-SIGNOFF-SHEET.csv`) here as the record.
- **Removed from the live bank:** 53 of 1,350 shared questions (`apps/snle/src/excluded-items.json`): Q0331 (APGAR answer key wrong: correct total 8, keyed 9) and the 52 items the bank metadata flagged "REVIEW wording/ambiguity". The preserved original is untouched; the exclusion is applied at build time. Live bank: 1,297 questions; every clinical poster keeps at least 5 linked questions.
- **Prices shown:** Saudi (SNLE) free; Qatar, Dubai and Abu Dhabi US$25 a month or US$50 for 3 months per exam. Payments open when Stripe is switched on.
