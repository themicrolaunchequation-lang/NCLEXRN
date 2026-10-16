# Prompt: healthcare study images and 100 drag-and-drop icons for Lumen

Lumen v7 already has a **Stickers** tray (Reader → Tools → Stickers). It holds 50 emoji and 14 text labels. Learners drag a sticker onto a page, move it, resize it from the corner, and delete it. Stickers are saved with the page and appear in snips and exports.

This brief asks an external design or AI agent for two things:
- **Part A:** 100 professional SVG icons to replace and extend the emoji set.
- **Part B:** a set of study illustrations.

Paste everything below the line into the agent.

---

## Who this is for

Healthcare Crown Academy makes **Lumen**, a study app for nursing and allied-health learners: NCLEX candidates, UK and international nurses, and healthcare assistants. Learners read PDFs and slides, then annotate them.

The assets will be:
- dragged onto PDF pages and placed **over or beside text**
- **resized** from about 16 px to 400 px
- shown on light and dark pages
- printed and exported to PowerPoint and Word

They must stay clear at small sizes.

## Part A: 100 icons (SVG)

### Technical rules (every icon)
1. **Format:** one SVG file per icon, `viewBox="0 0 24 24"`, no fixed `width` or `height`, no `<script>`, no external references, no embedded raster images, no fonts (convert any text to paths).
2. **Style:** outline style on a 24 × 24 grid.
   - 2 px stroke, `stroke-linecap="round"`, `stroke-linejoin="round"`
   - `fill="none"` except small solid accents
   - keep 2 px of padding inside the edge
3. **Colour:** use `currentColor` only. Lumen sets the colour, so one file serves every colour and theme.
   - Where two tones help (for example a drop of blood inside a tube), mark the second tone with `class="accent"` and give it `opacity=".35"`.
4. **Legible at 16 px:** at most about 8 path segments of detail. No hairlines. No text unless it is the meaning itself (for example "PRN" on a label icon).
5. **Size:** under 1.5 KB per file after SVGO.
6. **Accessibility:** each icon has a plain-English `title` and a one-sentence `description` of what it shows (used as alt text).
7. **Licence:** original work, or a licence that allows commercial redistribution inside an app with no attribution shown to the end user (MIT, ISC, CC0 or Apache-2.0). For each icon, state the source and licence. **Do not** use Flaticon, Freepik, Noun Project (without a paid licence), Font Awesome Pro, or any icon that needs visible attribution.
8. **Clinical accuracy:** anatomy must be recognisable and correct in outline:
   - heart: apex pointing down and left
   - lungs: the right lung has three lobes, the left lung has two
   - syringe: plunger and barrel in proportion
   - no blood or wounds shown graphically

### The 100 icons (10 categories × 10)
Deliver exactly these, with the `id` given.

| Category | Icons (id) |
|---|---|
| **Body systems** | heart, lungs, brain, kidney, liver, stomach, intestines, bone, joint, skin |
| **Senses and specialities** | eye, ear, tooth, uterus-pregnancy, baby-infant, child, older-adult, mental-health, nerve, muscle |
| **Assessment** | stethoscope, thermometer, blood-pressure-cuff, pulse-oximeter, ecg-wave, respiratory-rate, pain-scale, glucose-meter, weighing-scale, neuro-pupil-torch |
| **Medications** | tablet, capsule, liquid-cup, syringe, vial-ampoule, iv-bag, inhaler, patch, insulin-pen, controlled-drug-lock |
| **Procedures and equipment** | cannula, catheter, nasogastric-tube, oxygen-mask, nebuliser, suction, wound-dressing, suture, defibrillator, ventilator |
| **Infection control and safety** | hand-hygiene, gloves, apron-gown, mask, goggles, sharps-bin, isolation-door, biohazard, fall-risk, allergy-band |
| **Labs and diagnostics** | test-tube, blood-sample, urine-sample, microscope, x-ray, ct-mri, culture-petri, lab-report, dna, microbe-bacteria |
| **Care and nursing actions** | assess, plan, implement, evaluate, document-chart, handover-sbar, escalate-call, position-turn, mobility-walker, nutrition-feeding |
| **Study marks** | key-point, warning, red-flag, question, correct-check, incorrect-cross, star-priority, lightbulb-idea, pin, bookmark |
| **Flow and logic** | arrow-right, arrow-up-increase, arrow-down-decrease, cause-effect, cycle-repeat, compare-balance, timeline-clock, stop-hand, go-start, link-connect |

### Deliverables for Part A
1. A folder `icons/` with `<id>.svg` for all 100.
2. `icons.json`, an array of 100 objects:

   ```json
   {
     "id": "heart",
     "category": "Body systems",
     "title": "Heart",
     "description": "Outline of a human heart with the apex pointing down and left.",
     "keywords": ["cardiac", "cardiovascular", "cardiology", "chest"],
     "defaultColor": "#9e3e3e",
     "source": "original",
     "licence": "CC0-1.0",
     "svg": "<svg viewBox=\"0 0 24 24\" ...>...</svg>"
   }
   ```

   Rules for the fields:
   - `defaultColor` is one of: `#10253a` navy, `#087d7a` teal, `#1f6feb` blue, `#2f8f46` green, `#9e3e3e` red, `#e0711b` orange, `#7a4fd1` purple, `#d03b8c` pink.
   - `keywords`: 3–8 search words, including UK and US spellings where they differ (oedema/edema, haemoglobin/hemoglobin).
3. A contact sheet `icons-preview.png`: all 100 icons at 16, 24 and 48 px, on white and on `#0d1b2a`.
4. `LICENCES.md`, listing the source and licence of every icon.

### Quality check before delivery (state that you did each)
- Opened each SVG in a browser at 16 px and 256 px.
- Ran SVGO with `removeViewBox: false`.
- Checked there are no `width`/`height` attributes, no `style` blocks and no hard-coded colours except `currentColor`.
- Checked every `id` is unique and matches the table above.

## Part B: study illustrations (images)

### Purpose
Larger pictures that learners place beside text or use on title slides:
- simple labelled diagrams
- calm, modern scenes

They are not decoration for its own sake: each one supports learning.

### Technical rules
- **Format:** SVG preferred (flat, 4–6 colours). WebP or PNG at 1600 px on the long side if SVG is not possible. Transparent background.
- **Palette:**
  - navy `#10253a`, teal `#087d7a`, sage `#b9d8bd`, sand `#f7f4ec`, copper `#bd764a`, soft red `#c75b5b`
  - skin tones: varied and realistic
- **Style:** flat, clean lines, no gradients except subtle shading, no text baked in. Labels are separate text layers or a JSON list of label positions, so Lumen can translate or hide them.
- **People:** a mix of ages, sexes, ethnicities and body types, with realistic, modest uniforms. No brand logos. No identifiable real people.
- **Safety:** no graphic wounds, blood pools, surgery scenes or patient faces in distress. Equipment must be used correctly (gloves on, aseptic technique where relevant).
- **Licence:** original or CC0. List the generator or tool used. If AI-generated, confirm the tool's terms allow commercial use.

### The 30 illustrations
1. Heart: chambers, valves and blood-flow arrows (with a label list)
2. Lungs and airway, with alveolus close-up (with a label list)
3. Kidney and nephron (with a label list)
4. Brain lobes (with a label list)
5. Skin layers, with pressure-ulcer stages 1–4 shown as simple cross-sections (no photos)
6. Digestive system (with a label list)
7. Skeleton, front view (with a label list)
8. Fluid compartments (intracellular, interstitial, intravascular)
9. Acid–base see-saw (pH, CO₂, HCO₃⁻)
10. Coagulation cascade (simple flow)
11. Injection sites: deltoid, vastus lateralis, ventrogluteal, subcutaneous abdomen
12. IV set-up: bag, drip chamber, roller clamp, cannula
13. Hand-hygiene steps (six panels)
14. PPE donning and doffing order (two strips)
15. Patient positions: Fowler's, semi-Fowler's, supine, prone, lateral, Trendelenburg, recovery
16. Vital-signs station (thermometer, BP cuff, oximeter)
17. Falls-prevention bedside (bed low, rails, call bell, non-slip socks)
18. Nurse handover using SBAR (two nurses, clipboard)
19. Medication rights checklist (pill organiser and wristband)
20. Diabetes: glucose meter, insulin pen, hypo kit
21. Maternity: fetal positions, simple
22. Paediatric growth chart (stylised, no real data)
23. Mental-health conversation (two chairs, calm room)
24. Infection chain (six links)
25. Wound-healing phases (four panels)
26. ECG paper with P-QRS-T labelled (stylised)
27. Glasgow Coma Scale card (blank layout for labels)
28. NEWS2-style chart layout (blank grid, no real thresholds)
29. Quality improvement: PDSA cycle
30. Six Sigma DMAIC: five linked steps

### Deliverables for Part B
- **Files:** `illustrations/<nn>-<slug>.svg` (or `.webp`).
- **Manifest:** `illustrations.json`, with one entry per file:
  - `title`
  - `description` (alt text)
  - `labels`, an array of `{ "text", "x", "y" }`, where x and y are fractions of the image size
  - `keywords`
  - `source`
  - `licence`
- **Contact sheet:** `illustrations-preview.png`.

## How Lumen will use these (for the agent's information)
- **Icons:** become a new "Icons" tab in the Stickers tray, with search by `keywords`.
  - A placed icon keeps its colour (one of the eight brand colours, chosen by the learner) and size.
  - Icons can sit over text with a light halo, so the text stays readable.
- **Illustrations:** become an "Images" tab.
  - Placed images can be resized and moved, and labels can be shown, hidden or quizzed (cover the labels → recall).
- Everything stays offline inside the single Lumen file, so total size matters: aim for under 400 KB for all 100 icons, and under 4 MB for the 30 illustrations.
