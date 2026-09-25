# Laureate — Lean Six Sigma certificate & ID badge generators

Browser tools that draw print-ready Lean Six Sigma credentials on a canvas. There's no build step and no server.

| Folder | Open | Output |
|---|---|---|
| `certificate-engine/` | `index.html` | A4 landscape certificate as PNG (3369 × 2382 px) or PDF. Also batch PDF or ZIP from a CSV. |
| `id-badge/` | `index.html` | CR80 badge (54 × 85.6 mm), front and back, with photo, logo and a QR verification code. PNG ZIP or card-size PDF, single or batch. |

Serve the repo folder over HTTP, for example with `npx serve .`, and open either `index.html`. Opening the file directly also works in most browsers.

Both pages keep the draft in the browser's local storage only.

## Using the renderers in another app

The drawing code lives in `certificate-engine/laureate-render.js` (`window.LaureateCertificate`) and `id-badge/badge-render.js` (`window.LaureateBadge`). See [`docs/INTEGRATION_PROMPT.md`](docs/INTEGRATION_PROMPT.md) for the full API, the data fields, logo handling, export sizes, and a ready-to-paste brief for your app's developer or AI assistant.

## Sample content

Names, the institute ("Aurelian Institute of Process Excellence"), signatories, the `aurelian.example` domain and the contact line are placeholders. Replace them before issuing real credentials.
