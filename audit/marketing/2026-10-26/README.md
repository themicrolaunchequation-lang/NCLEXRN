# Marketing plans, 26 October 2026

One bilingual (English, then Arabic) PDF per app. Each one covers the audience, the message, ranked channels, SEO, three budget options, a step-by-step 90-day plan (November 2026 to January 2027), who does what, monthly numbers, rules and key dates, with sources.

| App | PDF | Recommended option |
| --- | --- | --- |
| MedLex | marketing-plan-medlex.pdf | Smart test, £150 a month |
| Carecraft | marketing-plan-carecraft.pdf | Smart test, £200 a month |
| Serein | marketing-plan-serein.pdf | Free and partner-led, £0 |
| Lumen | marketing-plan-lumen.pdf | Smart test, £200 a month |
| Gulf Region Nursing | marketing-plan-gulf.pdf | Smart test, US$300 a month |
| Evinca | marketing-plan-evinca.pdf | Pilot plus posters, £200 a month |
| Lean Six Sigma Green Belt | marketing-plan-lss.pdf | Smart test, US$250 a month |

Ad prices are directional benchmarks from the cited sources. Sign-up and sale estimates use two planning assumptions (10-20% of visitors sign up free, 2-5% of free accounts pay); replace them with real numbers after 30 days.

## Rebuilding

Content lives in `source/apps/<app>.py`. Run `python3 build.py` then `node render.js medlex carecraft serein lumen gulf evinca lss` from `source/`. The build expects a `fonts/` folder with Inter and Noto Naskh Arabic / Noto Sans Arabic woff2 files (from the npm packages `@fontsource/inter`, `@fontsource/noto-naskh-arabic`, `@fontsource/noto-sans-arabic`), and Playwright for printing.
