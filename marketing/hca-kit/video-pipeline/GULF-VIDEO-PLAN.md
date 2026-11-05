# Gulf Region Nursing: 5-video plan (9 language versions)

Status: **plan only. Nothing is built until you say "start".**

## 1. What we deliver

| # | Video | Length | English | Arabic | Shapes |
|---|---|---|---|---|---|
| G0 | Gulf Region Nursing: the whole app (general) | about 60 s | yes | no (as you asked) | 9:16 + 16:9 |
| G1 | Saudi Arabia: SNLE (SCFHS) | 45 s | yes | yes, Saudi voice | 9:16 + 16:9 |
| G2 | Qatar: DHP RGN | 45 s | yes | yes, Qatari voice | 9:16 + 16:9 |
| G3 | Dubai: DHA RN | 45 s | yes | yes, Emirati voice | 9:16 + 16:9 |
| G4 | Abu Dhabi: DOH RN | 45 s | yes | yes, Emirati voice (a different one from Dubai) | 9:16 + 16:9 |

The total is **9 videos and 18 files**, plus copy for each platform in English and Arabic.

## 2. Decisions I need from you before starting

1. **Arabic voices.** The open voice model I used so far (Kokoro) **has no Arabic.** The options are:
   - **A. Microsoft Azure Neural voices (recommended).** These are real country voices:
     - Saudi: `ar-SA-HamedNeural` and `ar-SA-ZariyahNeural`
     - Qatar: `ar-QA-MoazNeural` and `ar-QA-AmalNeural`
     - UAE: `ar-AE-HamdanNeural` and `ar-AE-FatimaNeural`

     Commercial use is allowed. It is cheap: these 9 short videos would come to well under $1. You would create an Azure Speech resource and add its key to this environment as a **secret**. Never paste the key in chat.
   - **B. ElevenLabs (paid).** The voices are more expressive, but you would need a subscription and a key added the same way.
   - **C. A free open voice (Piper, Arabic Jordan).** There is only one male voice and a Levantine accent, so it is **not** country-specific. I don't recommend it for ads.
2. **Market comparison.** I suggest **not naming competitors.** Naming them creates legal risk under UK, UAE and Saudi advertising rules unless every claim is proven. Instead I'd show a "Not just a question bank" contrast. It lists only things our app provably has (section 4).
3. **Arabic review.** I'll write Arabic scripts in clear Modern Standard Arabic with a Gulf-friendly tone. A **native Arabic-speaking nurse should review them** before posting. Do you have someone?
4. **Prices.** I suggest showing no prices, only "Start free" and, if it is still true, "7 days free with the Crown Pass". I'll check the live subscribe page first.

## 3. Facts I will use (only from the app, re-checked on the live site before building)

**Whole app**
| Feature | Fact |
|---|---|
| Question Bank | 1,297 clinically reviewed questions. Each has the safest choice, a clinical pearl and the trap to avoid. |
| Practice Hub | Tutor mode and a timed mock or full simulation, with answers hidden until the end. |
| React & Interact | 67 clinical decision tools, each with a poster, a decision lens and 10 coached questions. |
| Clinical Dossier | 35 specialty dossiers with 350 cases. |
| Interactive Labs | 9 labs on how licensing questions are built. |
| Glossary | 62 terms in English and Arabic, each with 3 clinical examples. |
| Arabic interface | The whole studio switches to Arabic with one tap. |
| Today | Set your exam date and get a suggested daily pace. Readiness map by domain. |
| Reset & Recharge | Short resets matched to the problem. |

**Per exam** (from the app's exam card, "details checked 23 Oct 2026, confirm with regulator")
| Exam | Questions | Time | Pass mark | Attempts | Colour theme already in the app |
|---|---|---|---|---|---|
| Saudi SNLE | 200 | 4 h | 500 | see guide | deep green |
| Qatar DHP RGN | 150 | 3 h | 50% | up to 5 | maroon |
| Dubai DHA RN | 150 | 3 h | 50% | 3 across the UAE | sand and gold |
| Abu Dhabi DOH RN | 150 | 3 h | not published | 3 across the UAE | navy blue |

I'll re-read every number on the live site the day I build. If anything has changed, the video follows the site.

**The same disclaimer stays on screen in every video,** in English and in Arabic: "Original practice material, not official exam questions. Not endorsed by SCFHS, DHP, DHA or DOH."

## 4. "Not just a question bank": the comparison panel

This is an animated two-column card. The left side is generic and names no one. The right side lists our features.

| A typical question bank | Gulf Region Nursing |
|---|---|
| Right or wrong | Why the safest answer wins, plus a clinical pearl and the trap |
| One exam | Four Gulf exams in one studio, each with its own progress |
| English only | English and Arabic, with a bilingual glossary |
| Questions only | 67 decision tools, 35 dossiers, 9 labs |
| Study, study, study | Reset & Recharge for exam stress |
| One app | Plus MedLex, Carecraft, Serein and Lumen with the Crown Pass |

The wording is "Not just…", so we never state that any named product lacks something.

## 5. "More with the Crown Pass": the other apps

I'll confirm what the Crown Pass includes on the subscribe page. Lean Six Sigma is separate, and I'll check whether Evinca is included. Each app gets a 2-second tile with its real screenshot and one benefit for a Gulf nurse:

| App | Benefit for a Gulf nurse |
|---|---|
| MedLex | Decode medical English: 1,480 terms built from word parts. Ideal when English is your second language. |
| Carecraft | SBAR handover and patient communication, practised in 60-second scenarios. |
| Serein | Two-minute resets for long shifts and exam stress. |
| Lumen | Study your own PDFs and notes with recall cards and focus sessions. |

## 6. Visual identity per video

- **Background:** the existing navy glow is replaced by each region's colour.
  - Saudi: green to teal glow.
  - Qatar: maroon to plum.
  - Dubai: sand to gold.
  - Abu Dhabi: navy to sky blue.
  - General: the Gulf Region Nursing teal and gold.
- **Captions:** the highlight colour also changes per region.
- **App screenshots:** taken with that region selected, so the app's own theme matches the background.
- **Arabic versions:**
  - Screenshots are taken with **the app switched to Arabic**.
  - Captions are right to left in an Arabic font, Cairo or IBM Plex Sans Arabic, open-licensed.
  - Headlines and the end card are in Arabic.
  - The web address stays in Latin letters.
- **Engine changes I'll make first:** a per-video background colour, right-to-left caption support, an Arabic font, and an Arabic disclaimer line.

## 7. Structure and screenshots

### G0: General, English, about 60 s

| Time | Scene | Screenshots |
|---|---|---|
| 0–4 s | **Hook:** "Four Gulf licensing exams. One studio." The four region colours flash in sequence. | Today page in each of the 4 themes |
| 4–8 s | **Persona** (nurse, af_sarah): "I'm moving to the Gulf and I don't know where to start." | none |
| 8–14 s | **Reveal:** Today page, exam switcher, set exam date, readiness map | Today, exam date field, readiness map |
| 14–22 s | **Question Bank:** answer, then "Not yet: repair the reasoning" with the pearl and trap | Already captured Gulf video 1 shots, re-taken fresh |
| 22–28 s | **Decision tools:** the BE-FAST poster pops open, and "67 tools" | React & Interact grid, BE-FAST poster |
| 28–33 s | **Dossiers and labs:** quick flips | Clinical Dossier list and one case, an Interactive Lab |
| 33–38 s | **Arabic:** one tap, the whole studio in Arabic, and the glossary | Arabic toggle, Arabic Today, glossary |
| 38–44 s | **"Not just a question bank"** panel | rendered card |
| 44–50 s | **Crown Pass:** MedLex, Carecraft, Serein and Lumen tiles | one screenshot per app |
| 50–60 s | **End card:** "Pass with reasoning, not memory. Start free today." Four flags and colour chips. | — |

### G1–G4: one per region, 45 s each, English and Arabic versions

The same tight template for each, with that region's facts, colour and voices:

| Time | Scene | Screenshots |
|---|---|---|
| 0–3 s | **Hook,** region-specific, for example "SNLE: 200 questions. 4 hours. Are you ready?" with the exam card numbers counting up | exam card for the region |
| 3–6 s | **Persona** in the regional voice: "I have my exam date. Where do I begin?" | — |
| 6–10 s | **Reveal:** the region's Today page and its regulator guide | Today page for the region, guide link |
| 10–24 s | **Fast feature run, about 2 s each,** with callouts: Question Bank reasoning, timed mock, BE-FAST tool, dossier, lab, bilingual glossary, readiness map | 7 shots, captured in that region (Arabic interface for the Arabic version) |
| 24–31 s | **"Not just a question bank"** comparison panel | rendered card |
| 31–37 s | **Crown Pass apps:** 4 quick tiles | per-app screenshots |
| 37–45 s | **End card** in the region's colour: "<exam> preparation, built for <country>. Start free today." | — |

**Voices per region**
| Region | English version | Arabic version (if Azure is chosen) |
|---|---|---|
| Saudi | `bm_lewis` narrator, `af_sarah` nurse | Hamed (narrator), Zariyah (nurse) |
| Qatar | `bf_emma` narrator, `am_michael` nurse | Moaz (narrator), Amal (nurse) |
| Dubai | `bm_george` narrator, `af_nicole` nurse | Hamdan (narrator), Fatima (nurse) |
| Abu Dhabi | `bf_alice` narrator, `am_eric` nurse | Fatima (narrator), Hamdan (nurse) |

Abu Dhabi swaps the roles so it doesn't sound like Dubai.

## 8. Draft scripts (to approve or edit)

### G0 General (EN)
- **Hook:** "Four Gulf licensing exams. One studio."
- **Nurse:** "I'm moving to the Gulf, and I don't know where to start."
- **Reveal:** "Gulf Region Nursing. Saudi Arabia, Qatar, Dubai and Abu Dhabi, each with its own plan and progress."
- **QBank:** "Answer a question, and see why the safest choice wins, with a clinical pearl and the trap to avoid."
- **Tools:** "Sixty-seven clinical decision tools, like BE-FAST for stroke, each with coached practice."
- **Dossiers:** "Thirty-five specialty dossiers, and nine labs that show how licensing questions are built."
- **Arabic:** "Switch the whole studio to Arabic with one tap."
- **Compare:** "Not just a question bank."
- **Pass:** "And with the Crown Pass, MedLex, Carecraft, Serein and Lumen come too."
- **Nurse:** "Now I know exactly where to start."
- **CTA:** "Pass with reasoning, not memory. Start free today, at S N L E dot Healthcare Crown Academy dot co dot uk."

### G1 Saudi (EN)
- "SNLE. Two hundred questions. Four hours. Are you ready?"
- **Nurse:** "I have my exam date. Where do I begin?"
- "Gulf Region Nursing, Saudi edition. Set your date, and get a daily plan."
- **Feature run:** "Reasoning on every question. Timed mocks. Decision tools. Clinical dossiers. A bilingual glossary. And a readiness map that shows what to practise next."
- "Not just a question bank."
- "Plus MedLex, Carecraft, Serein and Lumen with the Crown Pass."
- **CTA:** "SNLE preparation, built for Saudi Arabia. Start free today."

### G1 Saudi (AR, draft for native review)
- "اختبار الهيئة السعودية للتخصصات الصحية للتمريض: مئتا سؤال، وأربع ساعات. هل أنتِ مستعدة؟"
- **Nurse:** "حدّدتُ موعد اختباري. من أين أبدأ؟"
- "تمريض منطقة الخليج، النسخة السعودية. حدّدي موعدك، واحصلي على خطة يومية."
- "شرحٌ لكل سؤال، واختبارات تجريبية مؤقتة، وأدوات قرار سريري، وملفات حالات، ومسرد بالعربية والإنجليزية، وخريطة جاهزية تُريك ما تحتاجين إلى التدرّب عليه."
- "ليس مجرد بنك أسئلة."
- "ومع باقة كراون: ميدلكس وكيركرافت وسيرين ولومن أيضًا."
- **CTA:** "استعدادٌ لاختبار التمريض السعودي، مصمَّم للمملكة. ابدئي مجانًا اليوم."

Qatar, Dubai and Abu Dhabi follow the same pattern, with their own exam name, numbers, country line and dialect-appropriate wording. The English versions come first for your approval. The Arabic follows the approved English, and the native reviewer checks it.

## 9. Copy for each platform

For each video, in English and Arabic:
- YouTube title, description and tags;
- Shorts, TikTok and Reels caption with hashtags, for example #SNLE #هيئة_التخصصات_الصحية #DHA #DOH #QCHP #تمريض;
- LinkedIn post;
- Telegram or Facebook post;
- the disclaimer.

## 10. Order of work and time (after you say start)

| Step | Work | Time |
|---|---|---|
| 1 | Re-check facts on the live site. Capture screenshots for each region, in English and Arabic. | about 1 h |
| 2 | Engine upgrade: colours, right-to-left text, Arabic font. One Saudi pilot in English and Arabic, both shapes, for your approval. | about 1.5 h |
| 3 | Remaining 7 versions | about 2–3 h of rendering |
| 4 | Copy pack | about 30 min |
