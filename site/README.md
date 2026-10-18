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
netlify.toml             hosting settings and security headers
```

## Settings: `assets/js/config.js`

| Key | What to put there |
|---|---|
| `registeredOffice` | **Required by UK law.** The registered office address exactly as Companies House shows it. It appears in the footer and the privacy notice. |
| `contactEmail` | Currently `hello@healthcarecrownacademy.co.uk`. Switch it to `hello@healthcarecrownacademy.co.uk` once email forwarding is set up (below). |
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

## Deploy (Netlify)

A Netlify project called **healthcarecrownacademy** already exists in your team. Production is public; previews require a team login.

Connect it to this repository once, and every push deploys automatically:

1. Go to https://app.netlify.com/projects/healthcarecrownacademy.
2. Open **Project configuration → Build & deploy → Link repository**, choose **GitHub**, then `themicrolaunchequation-lang/NCLEXRN`.
3. Fill in the settings:
   - **Branch to deploy:** the branch that holds this folder.
   - **Base directory:** `site`
   - **Build command:** leave empty.
   - **Publish directory:** `site`
4. Click **Deploy**. The site appears at `https://healthcarecrownacademy.netlify.app`.

Why Netlify: its free plan allows commercial sites. Vercel's free Hobby plan is for non-commercial use only.

## Connect the Porkbun domain

1. **In Netlify:** open **Domain management → Add a domain**, enter `healthcarecrownacademy.co.uk`, then confirm. Netlify adds `www` too and redirects it to the main domain.
2. **In Porkbun:** open **Domain Management → healthcarecrownacademy.co.uk → DNS**.
   - Delete Porkbun's parking records: the `ALIAS` on the root and the `CNAME` on `*`, both pointing to `pixie.porkbun.com`. Delete any other root `A`/`AAAA` records too.
   - Add these two records:

     | Type | Host | Answer |
     |---|---|---|
     | `ALIAS` | *(blank)* | `apex-loadbalancer.netlify.com` |
     | `CNAME` | `www` | `healthcarecrownacademy.netlify.app` |

     If you prefer an `A` record for the root, use `75.2.60.5`.
3. **Back in Netlify:** under **Domain management → HTTPS**, click **Verify DNS configuration**. The free Let's Encrypt certificate is issued once DNS has propagated, which usually takes minutes but can take a few hours.

### Branded email (free)

In Porkbun, open **Email Forwarding** and forward `hello@healthcarecrownacademy.co.uk` to `hello@healthcarecrownacademy.co.uk`. Keep the MX records Porkbun adds; they don't conflict with the website records above. Then update `contactEmail` in `config.js`.

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
