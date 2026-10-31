# Healthcare Crown Academy — website and installable app

The home page for **HEALTHCARE CROWN ACADEMY LTD** (company no. 17501904) and its Evinca platform, for `healthcarecrownacademy.co.uk`.

It is a static site with no build step. It installs as an app on phones and desktops (PWA) and keeps working offline.

## What's on the page

| Section | What it does |
|---|---|
| Hero | Animated headline, a 3D-tilt sample recognition record, and a heartbeat line that runs across the page |
| Academy | Bento grid covering Learn, Grow and Be recognised, with small animated visuals |
| Evinca | Feature list and a **live record preview**: visitors type their name and profession and watch a certificate update. This runs in the browser only and nothing is sent |
| How it works | Four steps, with a progress line that fills as you scroll |
| Readiness check | Five statements with a score ring and a suggested next step |
| Who it's for | Tabs for professionals, teams and institutions |
| Principles, Mission, FAQ | The FAQ includes the "not a licence or qualification" disclaimer |
| Join | Sign-up form that saves to the **evinca** Supabase project, with confetti on success |
| Footer | Newsletter sign-up, the company's legal details and an **Install app** button |

Other features:

- Light and dark themes with a circular reveal transition.
- Respects the reduced-motion setting.
- Keyboard accessible, and passes WCAG 2.1 AA checks with axe.
- Strict security headers.
- Fonts are hosted on the site, so there are no third-party requests.

## Files

```
index.html               home page
privacy.html             UK GDPR privacy notice
404.html                 not-found page
assets/js/config.js      ← the settings you edit (see below)
assets/js/main.js        all interactions
assets/css/styles.css    design tokens, layout and animation
manifest.webmanifest     app name, icons and shortcuts (PWA)
sw.js                    offline support (bump VERSION on each release)
vercel.json              hosting: rewrites, redirects, security headers
```

## Settings: `assets/js/config.js`

| Key | What to put there |
|---|---|
| `registeredOffice` | **Required by UK law.** The registered office address exactly as Companies House shows it. It appears in the footer and the privacy notice. |
| `contactEmail` | `hello@healthcarecrownacademy.co.uk` (forwarded to the owner's Gmail by Cloudflare Email Routing; replies are sent from Gmail as hello@). |
| `evincaUrl` | The Evinca app's public URL once it's live. It shows an "Open the Evinca platform" button. |
| `supabaseUrl`, `supabaseKey` | Already set to the `evinca` project. This is the publishable key, which is safe in the browser. |

### Where the form data goes

- **Join form** → a new row in `public.inquiries`:
  - `kind` is `institution` or `contact`.
  - `status` is `new`.
  - The message lists the joining type and interests.
- **Updates checkbox and footer newsletter** → `public.subscribe()`, which adds the email to `public.subscribers`. The `source` is `hca-home-join` or `hca-home-footer`.
- If the backend can't be reached, the form offers a pre-filled email to the contact address instead.
- A hidden honeypot field silently drops bot submissions.

No database changes were needed. The tables, row-level security policies and function already exist in the evinca project.

## Deploy (Vercel)

Production is the Vercel project **nclexrn-site** (team themicrolaunchequation-langs-projects), root directory `site`, no build command. It deploys automatically from the production branch `claude/loving-ptolemy-srrq02`; every other branch gets a preview URL. Routing, host rewrites for the app subdomains, redirects and security headers live in `vercel.json` (the only hosting config; the old `netlify.toml` and `_headers` were removed on 26 Oct 2026).

Domains on the project: `healthcarecrownacademy.co.uk`, `www`, `medlex`, `carecraft`, `serein`, `lumen`. DNS is on Cloudflare (grey cloud). Evinca and `account.` are a separate Vercel project (`evinca`).

**Rollback:** Vercel → nclexrn-site → Deployments → pick the previous production deployment → Promote. Then revert the commit on the production branch.

**Note:** Vercel's Hobby plan is for non-commercial use. Move the team to Pro before taking payments.

## Before launch: checklist

- [ ] Fill in `registeredOffice` in `config.js`. UK law requires the company's registered name, number, place of registration and registered office address on the website.
- [ ] Pay the ICO data protection fee if the company hasn't already. Most UK organisations that handle personal data must pay it.
- [ ] Review the privacy notice, especially the 24-month retention period for enquiries.
- [ ] Before taking payments for recognition assessments, add terms of service and a refund/cancellation policy. Stripe expects both on the website.
- [ ] Set `evincaUrl` when the Evinca app is live.
- [ ] Bump `VERSION` in `sw.js` whenever you change files, so installed apps update.

## Run locally

```
npx serve site
```

Open http://localhost:3000. The service worker only registers over HTTPS, so offline mode is only active on the live site.
