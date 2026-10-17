# MedLex illustrated infographic library

The library now contains 56 raster posters: the original 40 illustrated posters and sixteen new illustrated PNG posters. All are branded MedLex/Healthcare Crown Academy images; active posters are not SVGs. These are illustrated educational study aids. Definitions and visual cues received a development review; independent medical-editor approval is not claimed.

| Collection | Guides | Purpose |
|---|---:|---|
| Decode & pronounce | 9 | Five new decoding/reading skills plus the four original foundation topics |
| Common pitfalls | 6 | Confusables, endings, root look-alikes, plurals, interpretation limits and abbreviation ambiguity |
| Memory cues | 8 | 68 original memory cues, with eighteen new vessel/tissue/ending cues |
| Directions & position | 8 | Directions, standard/oblique planes, positions, movements and abdominal quadrants |
| Body systems | 14 | Musculoskeletal through pregnancy/newborn terminology |
| Clinical concepts | 11 | Mental health, oncology, infection, imaging, pharmacology, complementary/integrative terminology and epidemiology |

## Content and sources

The original ten course datasets are preserved. The infographic catalog is a separate collection. Text transcripts and recall answers accompany every poster. Memory cues are explicitly separated from actual definitions and are not presented as a measured popularity ranking or validated clinical rules.

New teaching content was checked against:

- NLM MedlinePlus, Understanding Medical Words: https://medlineplus.gov/medwords/
- NLM MedlinePlus, word parts: https://medlineplus.gov/appendixa.html
- Open RN, Medical Terminology, foundational concepts: https://www.ncbi.nlm.nih.gov/books/NBK607453/
- Open RN, combining-vowel guidelines: https://www.ncbi.nlm.nih.gov/books/NBK607453/table/ch1concepts.T.a_guidelines_on_combining/
- OpenStax, Anatomy and Physiology 2e, anatomical terminology: https://openstax.org/books/anatomy-and-physiology-2e/pages/1-6-anatomical-terminology
- NCI SEER, anatomical terminology: https://training.seer.cancer.gov/anatomy/body/terminology.html

The references support terminology facts, not the custom mnemonic wording or an independent validation of generated anatomical artwork. Pronunciation practice points users to an approved reference; device speech is not a pronunciation examiner.

## Files and generation history

- `src/features/infographics/catalog.json`: all 56 topics, transcripts, recall answers, source links and custom cues.
- `public/infographics/*.webp`: the 56 optimized raster posters used online.
- `src/features/infographics/raster.js`: static URLs and the embedded PNG brand crest.
- `raster-manifest.json`: dimensions, PNG/WebP checksums, sizes and generation/review status.
- `MedLex-56-Infographic-Prompts.md`: all 56 reusable prompt briefs.

PNG originals are in the separately delivered PNG archive, grouped into the same six collections. WebP optimization changes format/size only, not poster content. Original PNGs were not made by converting the old SVG boards. The SVG board generator is removed from the active app.

Image QA corrected an extra combining vowel in the oste/o/arthr/itis illustration, obstructed confusable-term labels, an oncology spelling issue, and ambiguous anterior/posterior and ipsilateral/contralateral arrows. Generated illustrations remain conceptual study aids.

## Viewer and portability

The Infographics sidebar entry follows Practice. Choose a group or search a topic, open a poster, then use previous/next, arrow keys, Home/End, zoom, Fit width, fullscreen, or swipe in Hand mode at Fit width. The default view fits the available image width. The group-jump menu navigates to a collection. Study text retains definitions, recall and checking references. Production-prompt and related-module controls are removed. Pen, Marker, Highlighter and colored sticky notes share a single-row toolbar; per-poster marks save locally. See ../ANNOTATION-VIEWER.md. Included images download as WebP; the original PNG archive is supplied separately.

Hosted `index.html` uses lazy raster URLs for faster startup. `MedLex.html` embeds every included poster and works as a complete local file. The worker precaches the app and attempts to cache all 56 posters; a failed poster fetch does not prevent shell installation. Viewed posters can be cached on demand.

User replacements accept PNG, JPEG or WebP under 8 MB, reject images above 32 megapixels, and resize to a maximum of 2000×2500. Records are kept separately in MedLex-Infographic-Images IndexedDB, with a localStorage fallback. Image backups support all 56 topic IDs and are separate from learning-progress backups. The 56-topic image-backup import limit is 91 MB so an export containing all valid replacement images can be restored. A failed save leaves an exportable session copy.

## Validation limits

Functional checks use JSDOM, synthetic input, fake IndexedDB, structural axe and generated-worker mocks. Those checks cannot establish rendered contrast, responsive geometry, native touch/fullscreen behavior or screen-reader behavior. Fresh browser/device review and medical-editor review remain release tasks; see review reports for the exact evidence.


## Latest additions

See `EXAM-EXPANSION-GUIDE.md` for the sixteen-topic index, teacher key and reference list. The five former schematic guides have been replaced with illustrated PNGs matching the earlier collection. The retired schematic generator is retained only as a historical text file and is not used by the app or build. New topics appear first within their collections and carry a NEW marker.
