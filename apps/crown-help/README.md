# Crown Help

The help sidebar on the website and in MedLex, Lumen, Carecraft and Serein. No AI: it matches questions in the browser against the checked answers in `docs/crown-help/CROWN-HELP-CATALOGUE.md`. Anything it can't answer goes to hello@ by email.

| File | What |
|---|---|
| `docs/crown-help/CROWN-HELP-CATALOGUE.md` | **The answers.** Edit here only. |
| `apps/crown-help/build.mjs` | Turns the catalogue into `site/assets/crown-help/data.json`. Holds button destinations, extra phrasings and dated answers. Stops with a clear message if anything is missing. |
| `site/assets/crown-help/crown-help.js` / `.css` | The sidebar: matching, crisis and clinical guards, email handover, anonymous logging. |
| `apps/crown-help/sql/` | The Supabase table, logging function and 30-day deletion job. Also the weekly review queries. |
| `apps/crown-help/tests/` | `check.mjs` (120 known questions, 40 unseen, off-topic, crisis and clinical wording) and `ui.mjs` (every page type and app, desktop and phone, overlaps, axe, flows). |

## Change an answer
1. Edit the catalogue.
2. `node apps/crown-help/build.mjs`
3. `node apps/tools/serve-site.mjs 8443 &` then `node apps/crown-help/tests/check.mjs 8443`
4. Commit `docs/crown-help` and `site/assets/crown-help/data.json`.

## Weekly review (15 minutes)
Run the queries at the end of the SQL file. Add the top unanswered questions to the catalogue as new entries or as phrasings, rebuild, test, publish.

## Safety rules built in
- Crisis wording always shows the fixed script from catalogue Part A4, before anything else. The words are never logged.
- Questions about a real patient (doses, symptoms, "my patient") always get the clinical boundary answer (X-01).
- Angry messages go straight to a person by email.
- Two misses in a row, or two unhelpful answers, lead to the email form.

## Where it appears
Every page under `site/` that is not an app gets the script tag before `</head>`. The four apps get it from their `build-web.mjs`, next to `crown-account.js`. Gulf Region Nursing (Cloudflare), Evinca and Green Belt are separate projects; add `<script defer src="https://healthcarecrownacademy.co.uk/assets/crown-help/crown-help.js"></script>` there in Phase 5 (their CSP must allow that script and `connect-src` to Supabase).
