# Clinical sticker library: plan and research brief

This page has two parts:
1. **How the feature should work in Lumen** (so the list we collect fits it).
2. **The prompt for an external AI research agent.** Copy everything between the two rules into the agent. It returns a list of 300 icons and images that healthcare learners use most, with sources and licences checked.

When you have the agent's answer, give it to me (Claude) and I'll build the library into Lumen.

---

## Part 1: How it should work

**Name in the app:** *Sticker library* (in the reader toolbar, on Notes, and on a new blank "Study board").

**What learners do with it:**
- Drag a sticker onto a PDF page, a note or a blank board. Examples:
  - Put a syringe-angle diagram beside a passage on injections.
  - Drop a sinus-tachycardia strip next to a question.
  - Label an anatomy drawing.
- Resize with corner handles. The shape keeps its proportions; hold Shift to stretch.
- Rotate, recolour (line icons), add a caption, bring forward or back, duplicate, delete.
- **Hide-and-reveal:** turn any label into a cover that hides it until tapped. This works with the existing Visual recall method.
- Make a recall card from a sticker with a caption.

**Why SVG, not photos:**

| Choice | Why |
|---|---|
| **SVG vector files only** for the 300 core stickers | Sharp at any size, tiny (about 1–3 KB each, about 150 KB gzipped for all 300), work offline inside the single HTML file, and line icons can be recoloured. |
| A small separate set of **raster illustrations**, only if licensed | Photos are large, licences are harder, and real people raise consent issues. |
| No logos, brand names, or photos of real patients | Trademark and privacy. |

**How it is built (for me later):**
- **Bundling:** stickers ship as one gzipped SVG sprite inside the app, unpacked the first time the library opens (the same approach as the OCR engine).
- **Storage:** each placed sticker is saved like ink is today, in page coordinates, so it stays put at any zoom:
  `{assetId, bookId, page, x, y, w, h, rotation, color, caption, hidden}`
- **Library panel:**
  - search (name, synonyms, abbreviations such as "NRB" or "PICC")
  - category tabs, recent, favourites
  - a preview with alt text and the source credit
- **Keyboard and screen readers:**
  - Tab to a sticker; arrows move it (Shift for larger steps); `+`/`−` resize; `R` rotates; `Delete` removes.
  - Each sticker has alt text read by screen readers.
- **Credits:** a "Credits" page lists every asset with its licence and required attribution, and backups keep the asset ids.
- **Safety label:** stickers showing values (ECG strips, ranges) carry "Illustrative · check local policy".

---

## Part 2: Prompt for the external AI agent

Copy from here ↓

---

### Role
You are a medical-education librarian and licensing researcher. You know nursing curricula (NCLEX-RN, NMC/UK, Australian and Canadian programmes) and open-licence image sources. Your job is research only. Do not draw or generate images.

### Goal
Find the **300 icons, diagrams and small illustrations that nursing and other healthcare students use most while studying**. For each one, find a **real, downloadable SVG** (or, only when no SVG exists, a high-resolution PNG) under a licence that allows use inside a **commercial education app**, modification (recolouring, resizing) and offline bundling.

The assets will become drag-and-drop, resizable "stickers" that learners place on textbook pages, notes and a study board. They must make sense at 32 px and at 600 px.

### Where to look (in this order of preference)
1. **NIAID NIH BioART** (bioart.niaid.nih.gov): US government, generally public domain. Confirm each asset's page.
2. **Healthicons** (healthicons.org): health-specific line and filled icons. **Check and quote its current licence; I could not confirm it.**
3. **Servier Medical Art** (smart.servier.com): CC BY 4.0. Attribution required: "Image provided by Servier Medical Art (https://smart.servier.com), licensed under CC BY 4.0".
4. **Bioicons** (bioicons.com): the licence differs per icon; record each one.
5. **Wikimedia Commons**: public-domain or CC BY files only, recorded per file. Good for ECG strips and anatomy diagrams.
6. **General open icon sets** (Tabler, Lucide, Phosphor, Iconoir, Material Symbols): MIT or Apache-2.0. Use only for generic items (clipboard, clock, warning, arrows).
7. **PhysioNet** (physionet.org) waveform data under ODC-BY or a similar open licence. Use this only if no ready ECG strip exists, so a correct strip can be drawn from real data. Say that it needs drawing.

### Licence rules (strict)
- **Allowed:** CC0, public domain, MIT, Apache-2.0, ISC, BSD, CC BY 3.0/4.0 (record the exact attribution text).
- **Flag but do not choose as the main option:** CC BY-SA (share-alike) and the OFL.
- **Never:** NC (non-commercial), ND (no derivatives), "free for personal use", Noun Project items without a paid licence, stock-photo sites, Pinterest, or anything with an unclear licence.
- **Never** include trademarked logos, copyrighted scales without permission (for example Wong-Baker FACES®), brand-name drug packaging, or photos of identifiable people or patients.
- If you cannot find an acceptable source, still include the item:
  - set `"status": "needs-commission"`
  - write a one-sentence drawing brief
  - suggest a public reference to draw from.

### Accuracy rules
- **Anatomy** must be correct: orientation, chambers and valves, layers. Prefer diagrams labelled in English, or unlabelled ones that can be labelled in the app.
- **ECG strips** must show the named rhythm correctly (rate, P waves, QRS width, regularity). Name the source of the waveform.
- **Equipment** should show current common practice, such as safety-engineered needles. Note regional differences, for example US vs UK blood-tube colours.
- **People** in illustrations should vary in skin tone, age, sex and body size across the set.

### Coverage: 300 items in these categories (counts are targets)
1. **Anatomy and body systems: 40.** Heart (external and cross-section), conduction system, lungs and alveoli, airway, brain lobes, spinal cord and dermatomes, neuron, kidney and nephron, urinary system, liver, GI tract, stomach, pancreas, gallbladder, skeleton, spine, major joints, skin layers, eye, ear, muscles, arteries, veins, lymphatic system, endocrine glands, thyroid, female reproductive system, male reproductive system, breast, fetus in utero, cell, red and white blood cells, platelets, blood types, immune cells.
2. **Cardiac and ECG: 20.** Normal sinus rhythm, sinus tachycardia, sinus bradycardia, atrial fibrillation, atrial flutter, SVT, PVCs, ventricular tachycardia, ventricular fibrillation, asystole, PEA note, first-, second-degree type I and II, and third-degree heart block, ST elevation, ST depression, peaked T waves (hyperkalaemia), 3- and 5-lead placement, 12-lead placement.
3. **Vital signs and assessment: 20.** Thermometers, blood pressure cuff and correct cuff size, pulse oximeter, stethoscope, pulse sites, apical pulse location, respiratory patterns, pupil size gauge, Glasgow Coma Scale card (layout only), capillary refill, pitting oedema grades, numeric pain scale, generic faces pain scale (original drawing), height and weight, BMI, fluid intake and output chart, neuro check, bowel sounds quadrants, heart sound auscultation points, lung auscultation points.
4. **Medicines and administration: 30.** Tablet, capsule, scored tablet, oral liquid cup, oral syringe, insulin syringe, tuberculin syringe, 3 mL and 10 mL syringes, needle gauges and lengths, vial, ampoule and filter needle, IV bag, secondary (piggyback) line, infusion pump, PCA pump, insulin pen, inhaler with spacer, nebuliser, transdermal patch, eye drops, ear drops (adult and child technique), nasal spray, rectal suppository, injection angles (90°, 45°, 15°), injection sites (deltoid, ventrogluteal, vastus lateralis, abdomen), Z-track, "rights of medication administration" checklist card, high-alert medicine symbol, medicine cup measurements.
5. **Lines, tubes and drains: 20.** Peripheral IV cannula, PICC, central venous catheter, implanted port, arterial line, urinary catheter with bag, suprapubic catheter, nasogastric tube, PEG tube, chest tube with drainage system, Jackson-Pratt drain, Hemovac, T-tube, tracheostomy tube, endotracheal tube, colostomy, ileostomy, urostomy, nephrostomy, feeding pump.
6. **Respiratory and oxygen: 15.** Nasal cannula, simple face mask, non-rebreather, Venturi mask, CPAP and BiPAP, high-flow nasal cannula, oxygen cylinder, wall oxygen, suction equipment, incentive spirometer, peak flow meter, arterial blood gas syringe, tripod position, pursed-lip breathing, chest physiotherapy.
7. **Infection prevention and PPE: 20.** Gloves, gown, surgical mask, N95/FFP3 respirator, face shield, goggles, hand-hygiene steps (WHO 5 moments, original drawing), hand rub, donning order, doffing order, contact, droplet and airborne precaution signs (original), protective isolation sign, sharps container, biohazard bag, clean vs dirty utility, aseptic non-touch technique, sterile field.
8. **Safety and moving people: 20.** Bed with rails and call bell, fall-risk marker, non-slip socks, wheelchair, walker, cane (held on the correct side), crutches and gaits, gait belt, slide sheet, mechanical hoist, transfer board, bed alarm, restraint alternatives, RACE fire steps, PASS extinguisher steps, patient identification band, allergy band, isolation cart, emergency call.
9. **Patient positions: 12.** Fowler's, semi-Fowler's, high Fowler's, supine, prone, left and right lateral, Sims', Trendelenburg, reverse Trendelenburg, lithotomy, orthopnoeic, log roll.
10. **Labs and diagnostics: 20.** Blood tubes and order of draw (note regional colour differences), tourniquet and venepuncture sites, blood culture bottles, glucometer and finger-prick sites, urine dipstick, specimen cup, stool sample, swabs, sputum cup, ABG kit, X-ray, CT, MRI, ultrasound, ECG machine, bladder scanner, lab-value card layout, point-of-care testing, microscope, pathology request label (blank).
11. **Maternity, newborn and children: 20.** Stages of pregnancy, fundal height, Leopold's manoeuvres, fetal positions and presentations, stages of labour, CTG strip layout, postpartum fundus check, breastfeeding positions, newborn assessment (Apgar layout), umbilical cord, newborn injection site (vastus lateralis), infant and child airway, infant CPR (two-thumb and two-finger), child growth chart layout, car seat orientation, developmental milestones, fontanelles, immunisation, neonatal jaundice, kangaroo care.
12. **Mental health and communication: 12.** Therapeutic communication, SBAR handover card, active listening, interpreter, anxiety levels, de-escalation, safety plan, sleep hygiene, grief stages, substance use, cognitive assessment layout, privacy and confidentiality.
13. **Emergency and resuscitation: 15.** Adult CPR hand position, compression depth, AED, defibrillator pad placement, crash trolley, head tilt and chin lift, jaw thrust, recovery position, choking (back blows and abdominal thrusts), ABCDE, triage colours, tourniquet, adrenaline auto-injector, bag-valve-mask, cervical collar.
14. **Wounds and skin: 12.** Pressure injury stages 1 to 4, unstageable, deep tissue injury, pressure areas (bony prominences), wound measurement, dressing types (film, foam, hydrocolloid, alginate), skin tear, burn depths, rule of nines (adult and child).
15. **Nutrition and elimination: 10.** Balanced plate, fluid balance chart, NPO/nil-by-mouth sign, swallowing (original), enteral feeding, bowel sounds, stool types (original drawing, not the Bristol chart image), urine colour chart (original), catheter care, intake measurement.
16. **Study and annotation marks: 14.** Arrows (straight, curved, two-way), callout bubble, warning, red-flag, priority 1, 2 and 3 badges, tick, cross, question mark, "key point" star, mnemonic tag, "remember" pin, bracket, timeline marker, numbered circles 1 to 10 (one item).

### Output format
Return **one JSON array of 300 objects**, then the same data as CSV. Each object:

```json
{
  "id": "resp-nonrebreather",
  "name": "Non-rebreather mask",
  "category": "Respiratory and oxygen",
  "keywords": ["NRB", "high-flow oxygen", "reservoir bag", "oxygen mask"],
  "description": "Face mask with reservoir bag and one-way valves for high-concentration oxygen.",
  "alt": "Line drawing of a face mask with an attached reservoir bag.",
  "use_cases": ["oxygen therapy notes", "choosing a device questions"],
  "style": "line | filled | illustration | diagram | strip",
  "recolourable": true,
  "file_format": "svg",
  "file_url": "https://… (direct link to the SVG file, not a search page)",
  "source_page_url": "https://… (the page that shows the licence)",
  "source_name": "Healthicons",
  "author": "…",
  "licence_spdx": "CC0-1.0 | CC-BY-4.0 | MIT | Apache-2.0 | PD-USGov | …",
  "licence_url": "https://…",
  "attribution_text": "Exact credit line to show, or \"\" if none is required",
  "commercial_use_ok": true,
  "modification_ok": true,
  "accuracy_notes": "What to check or watch for clinically",
  "regional_notes": "e.g., tube colours differ in the UK",
  "status": "ready | needs-check | needs-commission",
  "drawing_brief": "Only when status is needs-commission",
  "alternatives": [{ "file_url": "…", "licence_spdx": "…" }],
  "verified_on": "YYYY-MM-DD"
}
```

### Quality checks before you answer
- **Every `file_url` must be a real, direct link you opened.** Never guess or build URLs. If you could not open it, set `"status": "needs-check"`.
- **Licence:** quote it from the asset's own page, not from a third-party list.
- **No duplicates:** one entry per concept. Variants such as left and right go in `keywords`.
- **Totals:** give the count per category and the count per status. Fill any shortfall with `needs-commission` entries.
- **End with a short summary:**
  - which sources gave most of the assets
  - every item that needs attribution, and the exact text
  - every item flagged CC BY-SA or `needs-commission`

---

Copy to here ↑
