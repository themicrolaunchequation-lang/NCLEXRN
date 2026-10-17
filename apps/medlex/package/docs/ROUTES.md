# Route map

All normal navigation uses the URL fragment after #. Deploy at the site root. The hosting server serves index.html and does not need a catch-all rewrite for these hash routes.

- #today, #learn, #practice, #progress, #settings, #settings/data
- #learn/module/<module-id>/overview, /words, /practice, /activities, /resources
- #learn/module/<module-id>/activity/<classroom|independent>/<index>/sheet/<sheet-id>?step=<step>
- #practice/session, #practice/adaptive, #practice/clinical, #practice/explain, #practice/confusions, #practice/matching, #practice/coding
- #library/terms, #library/parts?kind=prefix, #library/parts?kind=suffix, #library/part/<element-id>, #library/term/<term-id>
- #library/lab, #library/atlas, #library/pronunciation
- #progress/portfolio, #teach/assignments, #teach/resources, #teach/editor, #teach/evidence

Exact resolution and historic aliases are in src/router/routes.js and src/router/index.js. Use IDs from the JSON records, not a visible label guessed into an ID. An unknown or malformed term route displays a recoverable result.
