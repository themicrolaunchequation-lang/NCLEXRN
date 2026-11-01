# Healthcare Crown Academy — AI image prompt pack

**Purpose:** generate a new, premium set of social media images with an external AI image tool, then drop them into the setup kit in place of the current images. The **file names below match the kit exactly**.

**Version:** 1 November 2026 · **Brand owner:** HEALTHCARE CROWN ACADEMY LTD

---

## 0. How to use this pack (read first)

**1. Pick a tool that renders text well:**

| Tool | Recommendation |
|---|---|
| **ChatGPT (image generation)** | Best all-rounder; accepts reference images |
| **Ideogram** | Excellent for headline text |
| **Gemini (Imagen)** | Good |
| **Midjourney** | Beautiful art, but weak at text. Use **Mode B** below |

**2. Paste the MASTER BRIEF (section 1)** once at the start of the chat.

**3. Upload the reference images** if your tool accepts them:
- `reference/brand/crown-mark.svg` (or `crown-mark-on-navy.png`): the logo
- `reference/brand/crown-3d.png`: the 3D crown hero
- `reference/screens/<app>-phone.jpg` and `-desktop.jpg`: the real app screens

**4. Generate one image at a time.** Paste the prompt for that file name, check it against the **quality checklist** (section 6), and regenerate if anything fails.

**5. Two ways to work:**
- **Mode A (finished image):** the AI renders the full design, including the text in quotation marks.
- **Mode B (art only, then add text):** add "*No text, no letters, no logo*" to the prompt. Then add the headline, button and logo yourself in **Canva** (free) using the exact text given. Choose Mode B if any letters come out misspelt.

**6. The logo is never redrawn by the AI.** Every prompt leaves a clear space for it. Place the real crown mark from `reference/brand/` in that space afterwards (Canva: Uploads → drag it in).

**7. Export as PNG at the exact pixel size listed.** If the tool can't produce that size, generate at the stated aspect ratio and resize or crop in Canva (Resize → Custom size).

**8. Save each file with the exact name** (section 7) and replace the matching file in `social-setup-kit/images/`.

---

## 1. MASTER BRIEF (paste this first)

```
You are the art director and image generator for HEALTHCARE CROWN ACADEMY, a UK company that makes study and well-being apps for people who work in healthcare (nursing students, nurses, healthcare assistants, carers, clinical coders, educators and quality-improvement leads, in the UK and the Gulf region).

BRAND IDEA: "Learn with confidence. Care with skill. Earn your crown." The crown is earned through learning and care, not given. Our signature symbol is a gold crown whose band carries a heartbeat (ECG) line: excellence joined with care.

VISUAL STYLE (apply to every image):
- Premium, modern, cinematic, calm confidence. Think high-end health-tech brand meets editorial magazine: Apple-level polish, not stock-photo clichés.
- Deep navy night palette with warm gold light. Base colours: navy #10253A, deep navy #0B1A2B, warm cream #F8F5EF, gold #D4A445 (gold is for achievement and highlights only).
- Each app has a jewel colour used for its glow and accents: MedLex sapphire #3557D6, Lumen violet #8B6CF0, Carecraft teal #0F8A86, Serein sage #5FB89E, Gulf Region Nursing ocean blue #2E86B5, Evinca gold #D4A445, Green Belt emerald #1F9D74.
- Lighting: soft volumetric light, gentle rim light, subtle depth of field, fine film grain. Rich contrast, never neon or garish.
- Composition: one clear focal point, generous negative space, strong visual hierarchy, nothing cluttered.
- Typography (when text is requested): an elegant high-contrast serif for headlines (similar to Fraunces or Playfair Display), a clean geometric sans for small text (similar to Geist or Inter). Headlines in cream or white, with one accent phrase in italic in the app's jewel colour or gold. Render text EXACTLY as written, with correct spelling and punctuation, and nothing else.
- People (only when a prompt asks): diverse, real-looking healthcare professionals of different ages and ethnicities, including women wearing a hijab where natural. Warm, competent, dignified expressions. Plain scrubs or uniforms in navy, teal or white, WITHOUT any hospital, NHS or regulator logos, and without name badges. Correct clinical details (stethoscope around the neck, not in the ears, when not in use; clean hands; no jewellery on hands).

NEVER INCLUDE:
- Any logos other than the space reserved for ours; NHS, SCFHS, DHA, DOH, DHP, hospital or university logos or names.
- Fake app screens with invented numbers, fake reviews, star ratings, testimonials or quotes, "official" stamps, certificates that look like real qualifications, or the words "guaranteed", "official exam" or "pass for sure".
- Blood, injuries, patients in distress, needles in skin, or anything frightening.
- Cartoon or clip-art styles, emoji, cheesy stock poses (thumbs up, pointing at the camera), or busy backgrounds.
- Watermarks, signatures or extra text that was not requested.

When I give you a prompt with a file name, produce exactly one image at the stated size and aspect ratio, keep every "safe area" clear as instructed, and leave the logo space empty.
```

---

## 2. Sizes, safe areas and layout rules

| File type | Exact size (px) | Ratio to generate | Safe area and layout notes |
|---|---|---|---|
| `profile-1080x1080.png` | 1080 × 1080 | 1:1 | Shown as a **circle**: keep everything inside the central 80% circle. No small text. |
| `linkedin-cover-1512x256.png` | 1512 × 256 | ~6:1 (generate 3:1 at 1536×512, then crop the middle band) | The Page logo covers the **bottom-left ~300 px**: keep it empty. Text in the middle third, visual on the right. |
| `facebook-cover-1702x630.png` | 1702 × 630 | ~2.7:1 | Phones crop the sides: keep text and the focal point inside the **central 1100 px**. The profile picture covers the **bottom-left corner**. |
| `youtube-banner-2560x1440.png` | 2560 × 1440 | 16:9 | Only the **central 1546 × 423 px band** shows on phones: all text and the focal point go there. The rest is atmospheric background (it shows on TV). |
| `intro-post-1080x1350.png` | 1080 × 1350 | 4:5 | The main feed post. Headline top, visual centre, button bottom. Keep 80 px margins. |
| `square-post-1080x1080.png` | 1080 × 1080 | 1:1 | A simpler version of the intro post. Keep 70 px margins. |
| `welcome-post-1080x1350.png` | 1080 × 1350 | 4:5 | Brand welcome post. |

**Logo space:** where a prompt says "logo space", leave a clean, calm area of about **240 × 80 px** (posts) or **180 × 60 px** (covers) in the stated corner. Place the real crown mark there afterwards.

**Button style** (when a prompt asks for one): a rounded pill with a warm gold gradient (#F3D58F to #D9A846), dark text, and a soft glow.

---

## 3. BRAND images → save in `images/brand/`

### `brand/profile-1080x1080.png` (and resize copies `profile-800x800.png`, `profile-400x400.png`)
**Recommended: make this in Canva, not with AI.** Use `reference/brand/crown-mark.svg` in gold (#D4A445), centred, at about 55% of the width, on a deep navy (#0B1A2B → #163A66) radial gradient, with a thin gold ring at 78% of the width. A logo must be exact; AI redraws it.

### `brand/profile-3d-1080x1080.png`
```
Square 1:1, 1080×1080. A single luminous 3D gold crown floating at the centre of a deep navy night sky with faint starlight. The crown's band is engraved with a glowing heartbeat (ECG) line; small pearls line the rim; one sapphire, one amethyst and one ruby gem set in the band. Soft warm volumetric light from above, gentle gold reflections, subtle depth of field. Keep the crown inside the central 75% circle. No text. (Match the uploaded reference crown-3d.png if available.)
```

### `brand/welcome-post-1080x1350.png`
```
Portrait 4:5, 1080×1350. Cinematic hero image: the luminous gold heartbeat crown (as in the master brief) floats in the upper half above a deep navy night sky; warm light rays fall from above as if the crown is being earned. Below it, a calm reflective surface catches the gold light.
Text on image (render exactly):
– Headline, large elegant serif, cream, three lines, centred-left in the lower half: "Learn with confidence." / "Care with skill." / "Earn your crown." (the last line in italic gold)
– Small sans text under the headline: "Seven study and well-being apps for people who work in healthcare"
– Gold pill button, bottom-left: "Start free, no card →"
– Small text, bottom-right: "healthcarecrownacademy.co.uk"
Logo space: top-left corner. Keep 80 px margins.
```

### `brand/linkedin-cover-1512x256.png`
```
Ultra-wide banner (generate 1536×512 at 3:1, then crop the central 1512×256 band). Deep navy night background with very subtle starlight. On the right third, the luminous gold heartbeat crown glows softly, with warm light spilling left across the banner. Middle third: text.
Text on image (render exactly), elegant serif, cream, one line: "Learn with confidence. Care with skill." then on the next line, italic gold: "Earn your crown."
Keep the bottom-left 300 px completely empty and dark (the page logo covers it). No other text.
```

### `brand/facebook-cover-1702x630.png`
```
Wide cover, 1702×630 (about 2.7:1). Deep navy night sky. Centre-left: the luminous gold heartbeat crown, with soft light rays. Centre-right: text. Keep all text and the crown inside the central 1100 px (phones crop the sides), and keep the bottom-left corner (about 400×250 px) empty and dark for the profile picture.
Text on image (render exactly):
– Small caps, letter-spaced, gold: "HEALTHCARE CROWN ACADEMY"
– Headline serif, cream: "Learn with confidence. Care with skill." then on a new line, italic gold: "Earn your crown."
– Small sans text: "Seven study and well-being apps for every stage of your healthcare career"
```

### `brand/youtube-banner-2560x1440.png`
```
16:9, 2560×1440. A vast, atmospheric deep navy night sky with subtle stars and a soft horizon glow. In the exact central band (1546×423 px, centred): on the left the luminous gold heartbeat crown, on the right the text. Outside the central band: only calm atmosphere, faint gold dust and soft light. No text outside the central band.
Text on image (render exactly), inside the central band:
– Small caps, gold: "HEALTHCARE CROWN ACADEMY"
– Headline serif, cream: "Learn with confidence. Care with skill. " followed by italic gold "Earn your crown."
– Small sans: "Medical words · study · care skills · Gulf nursing exams · well-being"
```

---

## 4. APP images → save in `images/<app>/`

Each app has a **concept** (the visual metaphor), then four prompts:
- **profile** (`profile-1080x1080.png`): the app's badge, used for Showcase Pages and the Gulf Facebook Page.
- **LinkedIn cover** (`linkedin-cover-1512x256.png`)
- **intro post** (`intro-post-1080x1350.png`): the hero feed post.
- **square post** (`square-post-1080x1080.png`)

The Gulf app also has a **Facebook cover**.

**Using the real app screen (recommended):** if your tool accepts reference images, upload `reference/screens/<app>-phone.jpg` and add this line to the intro and square prompts:
> "Show this exact app screen inside a modern, slim, frameless smartphone, angled slightly, with a soft shadow and the app's glow behind it. Do not change or invent anything on the screen."

If your tool can't do this reliably, use Mode B and place the screenshot inside a phone frame in Canva.

---

### 4.1 MedLex: "Make sense of any medical word" → `images/medlex/`
**Concept:** a medical word breaking apart into three glowing glass tiles (prefix · root · suffix) that click together. The meaning lights up as they join: understanding as an "aha" moment. Jewel: sapphire #3557D6.

**`medlex/profile-1080x1080.png`**
```
Square 1:1 app badge. A glossy sapphire-blue (#3557D6) circular emblem with a subtle inner glow and a thin gold ring, on deep navy. In the centre, three small glass tiles arranged in a gentle arc, softly glowing (no letters). A small gold crown at the top edge. Everything inside the central 80% circle. No text.
```
**`medlex/linkedin-cover-1512x256.png`**
```
Ultra-wide (generate 1536×512, crop the central 1512×256 band). Deep navy with a sapphire glow on the right. Right third: three floating frosted-glass tiles reading "peri", "card", "itis", connected by thin lines of light, with a faint line-art heart forming behind them. Middle third, serif text, cream: "Make sense of " followed by italic sapphire-light (#A9BCFF) "any medical word." Keep the bottom-left 300 px empty and dark.
```
**`medlex/intro-post-1080x1350.png`**
```
Portrait 4:5, 1080×1350. Deep navy background with a rich sapphire (#3557D6) glow in the lower right. Centre: three large frosted-glass tiles floating in space, softly lit from within, reading "tachy", "card", "ia". Beneath each tile, a small label: "fast", "heart", "condition". Thin beams of light join the tiles, and where they meet a softly glowing anatomical heart outline appears: understanding clicking into place.
Text on image (render exactly):
– Small pill label, top-left under the logo space: "MedLex · Understand"
– Headline, large serif, cream: "Make sense of" / italic sapphire-light (#A9BCFF): "any medical word."
– Small sans: "26 modules · 1,480 terms · 56 illustrated guides"
– Gold pill button, bottom-left: "Start free, no card →"
Logo space: top-left. 80 px margins.
```
**`medlex/square-post-1080x1080.png`**
```
Square 1:1, same scene as the MedLex intro post, simplified: three frosted-glass tiles "tachy" "card" "ia" joining into a glowing heart outline, sapphire glow on deep navy.
Text on image (render exactly): headline serif centred at top: "Make sense of " followed by italic sapphire-light "any medical word." · gold pill bottom-right: "Start free, no card →". Logo space: top-left. 70 px margins.
```

---

### 4.2 Lumen: "Turn your own notes into recall" → `images/lumen/`
**Concept:** *lumen* means light. Lecture slides and handwritten notes on a desk lift off and transform into glowing recall cards: knowledge turning into light. Jewel: violet #8B6CF0.

**`lumen/profile-1080x1080.png`**
```
Square 1:1 app badge. A glossy violet (#8B6CF0) circular emblem with a thin gold ring on deep navy; at its centre a small open notebook from which a soft beam of violet-white light rises, forming one floating card. Small gold crown at the top edge. Inside the central 80% circle. No text.
```
**`lumen/linkedin-cover-1512x256.png`**
```
Ultra-wide (generate 1536×512, crop the central 1512×256 band). Night-time study desk on the right: an open notebook and printed slides, with pages lifting off and turning into a stream of small glowing violet cards floating upward. Deep navy and violet light. Middle third, serif text, cream: "Turn your own notes " followed by italic violet-light (#C6B6FF) "into recall." Keep the bottom-left 300 px empty and dark.
```
**`lumen/intro-post-1080x1350.png`**
```
Portrait 4:5, 1080×1350. A calm night-time study scene seen from slightly above: a wooden desk, an open notebook with handwritten notes, printed lecture slides and a pen. From the pages, softly glowing violet (#8B6CF0) recall cards lift into the air in a gentle spiral, each card bright like a small lantern: notes becoming light. Warm desk-lamp glow mixes with violet light. Deep navy surroundings.
Text on image (render exactly):
– Pill label: "Lumen · Study"
– Headline serif, cream: "Turn your own notes" / italic violet-light (#C6B6FF): "into recall."
– Small sans: "Your PDFs and photos become recall cards. Your library stays on your device."
– Gold pill button: "Start free, no card →"
Logo space: top-left. 80 px margins.
```
**`lumen/square-post-1080x1080.png`**
```
Square 1:1, simplified Lumen scene: an open notebook releasing a spiral of glowing violet cards into a deep navy night. Text (exact): headline centred at top "Turn your own notes " followed by italic violet-light "into recall." · gold pill bottom-right "Start free, no card →". Logo space: top-left. 70 px margins.
```

---

### 4.3 Carecraft: "One useful minute of practice a day" → `images/carecraft/`
**Concept:** the craft of care. A calm, real moment between a nurse and a patient, with a subtle 60-second ring of light around it: small daily practice building real skill. Jewel: teal #0F8A86.

**`carecraft/profile-1080x1080.png`**
```
Square 1:1 app badge. A glossy teal (#0F8A86) circular emblem with a thin gold ring on deep navy; inside, two simple elegant hands almost touching, framed by a thin circular 60-second progress ring of light. Small gold crown at the top edge. Inside the central 80% circle. No text.
```
**`carecraft/linkedin-cover-1512x256.png`**
```
Ultra-wide (generate 1536×512, crop the central 1512×256 band). Right third: a warm, softly lit close-up of a nurse in teal scrubs sitting at eye level with an older patient, listening attentively, and a faint circular ring of teal light (like a 60-second timer) arcing behind them. Deep navy and teal palette. Middle third, serif text, cream: "One useful minute " followed by italic teal-light (#6FD3CC) "of practice a day." Keep the bottom-left 300 px empty and dark.
```
**`carecraft/intro-post-1080x1350.png`**
```
Portrait 4:5, 1080×1350. A cinematic, emotionally warm hospital moment: a nurse in teal scrubs (no logos) kneels to eye level beside an older patient sitting on the edge of a bed, explaining something gently while the patient listens and nods; the nurse holds a simple discharge leaflet. Soft window light, shallow depth of field. A subtle, elegant ring of teal light (a 60-second progress ring) arcs around the scene, as if this moment is being practised. Deep navy edges with a teal (#0F8A86) glow.
Text on image (render exactly):
– Pill label: "Carecraft · Practise"
– Headline serif, cream: "One useful minute" / italic teal-light (#6FD3CC): "of practice a day."
– Small sans: "A 60-second scenario a day · 30 lessons · 22 activities"
– Gold pill button: "Start free, no card →"
Logo space: top-left. 80 px margins.
```
**`carecraft/square-post-1080x1080.png`**
```
Square 1:1, simplified Carecraft moment: a nurse at eye level with a patient, a soft teal 60-second ring of light behind them, deep navy edges. Text (exact): headline centred at top "One useful minute " followed by italic teal-light "of practice a day." · gold pill bottom-right "Start free, no card →". Logo space: top-left. 70 px margins.
```

---

### 4.4 Serein: "A little room to breathe" → `images/serein/`
**Concept:** calm between tasks. A softly glowing sage-green sphere that "breathes" in a quiet, misty dawn space: a pause in the middle of a busy shift. Jewel: sage #5FB89E.

**`serein/profile-1080x1080.png`**
```
Square 1:1 app badge. A softly luminous sage-green (#5FB89E) sphere floating in a deep navy circle with faint concentric breathing rings around it and a thin gold ring at the edge. Small gold crown at the top edge. Serene, minimal. Inside the central 80% circle. No text.
```
**`serein/linkedin-cover-1512x256.png`**
```
Ultra-wide (generate 1536×512, crop the central 1512×256 band). A misty, quiet dawn space; on the right a single softly glowing sage-green sphere hovers with faint concentric rings like a slow breath, and a single green leaf with a dewdrop beside it. Deep navy fading to soft sage light. Middle third, serif text, cream: "A little room " followed by italic sage-light (#9FE3CC) "to breathe." Keep the bottom-left 300 px empty and dark.
```
**`serein/intro-post-1080x1350.png`**
```
Portrait 4:5, 1080×1350. A tranquil scene: a nurse in navy scrubs (no logos) sits by a window in a quiet staff room at dawn, eyes gently closed, one hand on her chest, taking a slow breath; a softly glowing sage-green sphere hovers in the air in front of her, surrounded by faint concentric rings like a breath expanding. Soft mist, warm dawn light through the window, a small green plant. Peaceful, dignified, not sad.
Text on image (render exactly):
– Pill label: "Serein · Restore"
– Headline serif, cream: "A little room" / italic sage-light (#9FE3CC): "to breathe."
– Small sans: "15 short, private practices for before, during and after a shift. Nothing is monitored."
– Gold pill button: "Free for everyone →"
Logo space: top-left. 80 px margins.
```
**`serein/square-post-1080x1080.png`**
```
Square 1:1, minimal Serein image: a single softly glowing sage-green sphere with concentric breathing rings in a misty deep-navy space, one green leaf with a dewdrop. Text (exact): headline centred at top "A little room " followed by italic sage-light "to breathe." · gold pill bottom-right "Free for everyone →". Logo space: top-left. 70 px margins.
```

---

### 4.5 Gulf Region Nursing: "Train the decision. Master the reasoning." → `images/gulf/`
**Concept:** a confident nurse at dawn, with a stylised, generic Gulf skyline and a clear path of light ahead: preparing for the licence that opens a career in Saudi Arabia, Qatar, Dubai and Abu Dhabi. Jewel: ocean blue #2E86B5. Show **no real landmarks, regulator names or logos**.

**`gulf/profile-1080x1080.png`**
```
Square 1:1 app badge. A glossy ocean-blue (#2E86B5) circular emblem with a thin gold ring on deep navy; inside, a minimal compass rose whose north point is a small gold crown, over a faint stylised desert-city horizon line. Inside the central 80% circle. No text.
```
**`gulf/linkedin-cover-1512x256.png`**
```
Ultra-wide (generate 1536×512, crop the central 1512×256 band). Dawn over a stylised, generic modern Gulf city skyline (no recognisable landmarks) in ocean-blue and gold light; a glowing path of light runs toward the horizon. Middle third, serif text, cream: "Train the decision. " followed by italic ocean-light (#9ED8F2) "Master the reasoning." Keep the bottom-left 300 px empty and dark.
```
**`gulf/intro-post-1080x1350.png`**
```
Portrait 4:5, 1080×1350. A confident, focused nurse (a woman in a navy hijab and navy scrubs, no logos) stands on a terrace at sunrise, holding a tablet, looking toward a stylised, generic modern Gulf city skyline (no recognisable landmarks). A glowing path of ocean-blue light leads from her toward the horizon, like a decision path. Warm gold sunrise mixed with ocean-blue (#2E86B5) light. Hopeful, professional, cinematic.
Text on image (render exactly):
– Pill label: "Gulf Region Nursing · Prepare"
– Headline serif, cream: "Train the decision." / italic ocean-light (#9ED8F2): "Master the reasoning."
– Small sans: "Saudi SNLE · Qatar DHP · Dubai DHA · Abu Dhabi DOH"
– Gold pill button: "10 free questions per exam →"
– Very small sans, bottom: "Original practice material, not official exam questions. Not endorsed by SCFHS, DHP, DHA or DOH."
Logo space: top-left. 80 px margins.
```
**`gulf/square-post-1080x1080.png`**
```
Square 1:1, simplified Gulf image: the stylised Gulf skyline at sunrise with a glowing ocean-blue path of light to the horizon. Text (exact): headline centred at top "Train the decision. " followed by italic ocean-light "Master the reasoning." · gold pill bottom-right "Try it free →" · very small at the bottom: "Original practice material. Not endorsed by SCFHS, DHP, DHA or DOH." Logo space: top-left. 70 px margins.
```
**`gulf/facebook-cover-1702x630.png`**
```
Wide cover, 1702×630. Sunrise over a stylised, generic modern Gulf city skyline (no recognisable landmarks), ocean-blue and gold light, a glowing path of light to the horizon on the right. Keep the text and focal point inside the central 1100 px and keep the bottom-left corner (about 400×250 px) dark and empty.
Text on image (render exactly):
– Small caps, letter-spaced: "GULF REGION NURSING LICENSURE STUDIO"
– Headline serif, cream: "Train the decision." then italic ocean-light: "Master the reasoning."
– Small sans: "Saudi SNLE · Qatar DHP · Dubai DHA · Abu Dhabi DOH · 10 free questions per exam"
– Very small sans: "Original practice material, not official exam questions. Not endorsed by SCFHS, DHP, DHA or DOH."
```

---

### 4.6 Evinca: "Your best work, recognised on evidence" → `images/evinca/`
**Concept:** the quiet work that made care safer, finally seen. A warm spotlight falls on a nurse and a folder of evidence, with a gold laurel of recognition: recognition earned, not bought. Jewel: gold #D4A445.

**`evinca/profile-1080x1080.png`**
```
Square 1:1 app badge. A rich gold (#D4A445) circular emblem with a deep navy ring; inside, an elegant open laurel wreath around a small heartbeat-crown. Polished, premium, minimal. Inside the central 80% circle. No text.
```
**`evinca/linkedin-cover-1512x256.png`**
```
Ultra-wide (generate 1536×512, crop the central 1512×256 band). Right third: a warm golden spotlight falls on an elegant gold laurel wreath resting beside a neat folder of documents and a ward safety chart. Deep navy surroundings with golden light. Middle third, serif text, cream: "Your best work, " followed by italic gold "recognised on evidence." Keep the bottom-left 300 px empty and dark.
```
**`evinca/intro-post-1080x1350.png`**
```
Portrait 4:5, 1080×1350. A dignified, editorial portrait: an experienced nurse in navy scrubs (no logos) stands calmly in a softly lit hospital corridor at the end of a shift, holding a folder of evidence. A warm golden spotlight falls on her from above, and a delicate gold laurel motif glows faintly behind her. Proud but humble, real, cinematic. Deep navy with gold (#D4A445) light.
Text on image (render exactly):
– Pill label: "Evinca · Be recognised"
– Headline serif, cream: "Your best work," / italic gold: "recognised on evidence."
– Small sans: "Share your story free. Apply for an evidence-based review when you're ready."
– Gold pill button: "Share your story free →"
Logo space: top-left. 80 px margins.
```
**`evinca/square-post-1080x1080.png`**
```
Square 1:1: a gold laurel wreath glowing under a warm spotlight on deep navy, a folder of evidence below it. Text (exact): headline centred at top "Your best work, " followed by italic gold "recognised on evidence." · gold pill bottom-right "Share your story free →". Logo space: top-left. 70 px margins.
```

---

### 4.7 Lean Six Sigma Green Belt: "Lean Six Sigma, built for healthcare" → `images/green-belt/`
**Concept:** turning ward data into better care. A control chart line rises out of the noise and becomes a clear upward path through a modern hospital: improvement made visible. Jewel: emerald #1F9D74.

**`green-belt/profile-1080x1080.png`**
```
Square 1:1 app badge. A glossy emerald (#1F9D74) circular emblem with a thin gold ring on deep navy; inside, a minimal control-chart line with dotted upper and lower limit lines, ending in a rising arrow, and a small gold crown at the top edge. Inside the central 80% circle. No text.
```
**`green-belt/linkedin-cover-1512x256.png`**
```
Ultra-wide (generate 1536×512, crop the central 1512×256 band). Right third: a glowing emerald control chart (a data line with dotted upper and lower control limits) floats in the air of a modern, softly lit hospital corridor; the final points rise above the noise into a clear upward path. Deep navy with emerald light. Middle third, serif text, cream: "Lean Six Sigma, " followed by italic emerald-light (#7FE0BD) "built for healthcare." Keep the bottom-left 300 px empty and dark.
```
**`green-belt/intro-post-1080x1350.png`**
```
Portrait 4:5, 1080×1350. A quality-improvement lead (any gender, smart clinical attire, no logos) stands at a glass wall in a modern hospital, drawing with a marker; projected onto the glass is a large glowing emerald control chart. The data line moves inside dotted control limits, then steps up into a clearly improved, stable level, with a subtle arrow of light. A small team looks on. Deep navy and emerald (#1F9D74) light, cinematic, purposeful.
Text on image (render exactly):
– Pill label: "Lean Six Sigma Green Belt · Improve"
– Headline serif, cream: "Lean Six Sigma," / italic emerald-light (#7FE0BD): "built for healthcare."
– Small sans: "30 DMAIC tools · 9 live statistics engines · 10 simulations"
– Gold pill button: "Free to try →"
Logo space: top-left. 80 px margins.
```
**`green-belt/square-post-1080x1080.png`**
```
Square 1:1: a glowing emerald control chart floating in deep navy space, its line rising above the dotted control limits into a stable improved level. Text (exact): headline centred at top "Lean Six Sigma, " followed by italic emerald-light "built for healthcare." · gold pill bottom-right "Free to try →". Logo space: top-left. 70 px margins.
```

---

## 5. Optional extra: one "family" image of all seven apps

**`brand/apps-family-1080x1350.png`** (new file; use it for a "meet the suite" post)
```
Portrait 4:5, 1080×1350. The luminous gold heartbeat crown at the top centre. Below it, seven small glowing gems in a gentle arc, each a jewel colour: sapphire #3557D6, violet #8B6CF0, teal #0F8A86, sage #5FB89E, ocean blue #2E86B5, gold #D4A445, emerald #1F9D74, each casting soft light. Deep navy night.
Text on image (render exactly), under each gem in small sans: "MedLex", "Lumen", "Carecraft", "Serein", "Gulf Region Nursing", "Evinca", "Green Belt".
Headline at the bottom, serif cream: "One account." then italic gold: "Seven ways to grow."
Gold pill: "Start free, no card →". Logo space: top-left.
```

---

## 6. Quality checklist (reject and regenerate if any fails)

- [ ] **Text** is spelt exactly as given: no extra words, no gibberish letters, no missing punctuation.
- [ ] **Numbers** match exactly: 26 · 1,480 · 56 · 30 · 22 · 15 · 1,297 · 67 · 35 · 9 · 10.
- [ ] **No logos or names of real organisations:** NHS, SCFHS, DHA, DOH, DHP, hospitals, universities.
- [ ] **The Gulf images carry the "not official / not endorsed" line.**
- [ ] **People look natural:** correct hands (5 fingers), clinically correct details, dignified and diverse, with no name badges.
- [ ] **No fake reviews, star ratings, quotes, "official" stamps or certificates.**
- [ ] **Safe areas are respected** (section 2), and the logo space is clear.
- [ ] **The palette feels like one family:** deep navy plus warm gold plus the app's jewel colour.
- [ ] **It looks premium at phone size:** check at 25% zoom that the headline is readable and the focal point is clear.
- [ ] **Exact pixel size and PNG format.**

---

## 7. File names and replacing the kit

Save every image with **exactly** these names, then copy them over the matching files in `social-setup-kit/images/` (same folder structure). The setup guide (`SETUP-KIT.md`) already points to these names, so nothing else needs changing.

| Folder | Files |
|---|---|
| `images/brand/` | `profile-1080x1080.png`, `profile-800x800.png`, `profile-400x400.png`, `profile-3d-1080x1080.png`, `welcome-post-1080x1350.png`, `linkedin-cover-1512x256.png`, `facebook-cover-1702x630.png`, `youtube-banner-2560x1440.png`, *(optional)* `apps-family-1080x1350.png` |
| `images/medlex/` | `profile-1080x1080.png`, `linkedin-cover-1512x256.png`, `intro-post-1080x1350.png`, `square-post-1080x1080.png` |
| `images/lumen/` | same 4 files |
| `images/carecraft/` | same 4 files |
| `images/serein/` | same 4 files |
| `images/gulf/` | same 4 files + `facebook-cover-1702x630.png` |
| `images/evinca/` | same 4 files |
| `images/green-belt/` | same 4 files |

**Total:** 37 files (38 with the optional family image).

**Once your new images are ready,** send them to me (or put them in the folder) and say "replace". I'll swap them into the kit, check every size and name, update the preview sheet and rebuild the zip.
