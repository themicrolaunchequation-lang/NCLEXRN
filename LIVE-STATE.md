# Live state sync — 27 November 2026

This branch makes the GitHub copy match what is actually running on the live
sites today. It was produced by comparing every deployed file's content (not
just timestamps) and capturing the Gulf studio deployment, which had never
been committed.

## What changed in this branch

1. **`site/medlex/learn/*.html` (29 files)** — replaced with the live versions.
   The live MedLex lesson pages are a redesigned standalone lesson player
   (canonical URLs now point at `/medlex/learn/canvas/lessons/…`). They were
   deployed to Vercel without ever being committed; the repo had the older
   `embed.js`-based versions.
2. **`apps/snle/live/`** — a capture of the Gulf studio deployment at
   `snle.healthcarecrownacademy.co.uk` (Cloudflare Pages project
   `snle-clinical-studio`). File names keep the live content hashes.
   - Root: `index.html` (served at `/`), `manifest.webmanifest`, `sw.js`,
     `robots.txt`, `sitemap.xml`, `404.html`
   - Library pages: `SNLE_Question_Bank_ViewOnly_v19.html`,
     `SNLE_Clinical_Dossier_Question_Bank_ViewOnly_v23_1_Smaller_Stem.html`,
     `SNLE_All_Tools_ViewOnly_v19.html` (live serves them without `.html`;
     `/question-bank`, `/dossier-bank`, `/tool-library` 308-redirect to them)
   - `SNLE_Decoder_Interactive_Labs_v3/` — the 9 labs, index, README and manifest
     as served live. The 10 HTML files are **newer than**
     `apps/snle/source/SNLE_Decoder_Interactive_Labs_v3/`; README/manifest are identical.
   - `assets/`: 18 JS (`prelude`, `gulf-pre`, `gulf-boot`, `gulf-cfg`,
     `gulf-data`, `gulf-sync`, `gulf-ui`, `gulf-slides`, `data`, `dossiers`,
     `library`, `guidance`, `enhancements`, `integration`, `crown-account`,
     `hca-shell`, `app`, `labs-status`) and 3 CSS (`app`, `gulf-css`,
     `library`), plus `crest.svg`, `media/` (73 images) and `fonts/`
   - `hub/` — the "Gulf Region Exams · Development Preview" page served at `/hub/`
   - Every file was re-downloaded and byte-compared with live on 27 Nov 2026.
   - Not capturable from outside: Cloudflare `_headers` / `_redirects`
     configuration and the Pages Function `/api/gulf-content` (see below).
   - These are the **built/deployed** files, not original authoring sources.
     The public `data.js` holds only the free questions (1–10); the full
     1,350-question bank comes from the authenticated `/api/gulf-content`.
   - Correction: the first commit of this branch (`f58489d`) listed the JS/CSS
     above but did not actually contain them; they were added in the follow-up commit.

## How the comparison was done

- Every one of the 1,829 deployed files under `site/` was downloaded from the
  live site and byte-compared with the repo (`claude/loving-ptolemy-srrq02`
  at `29dde98`, pushed 8 Nov 2026). Result: everything matches except the
  29 MedLex lesson pages. Several deployment waves since 8 Nov (14, 15, 17,
  18, 23, 25, 26 Nov) only re-uploaded unchanged files.
- The homepage `site/home.html` is byte-identical to what `https://healthcarecrownacademy.co.uk/` serves.
- SNLE assets were captured from the live site and cross-checked against the
  service worker's precache manifest — all 33 shell entries are present.

## Deployment map (as verified 27 Nov 2026)

| Site | Platform | How it updates | Live matches GitHub? |
|---|---|---|---|
| healthcarecrownacademy.co.uk (hub + `/medlex`, `/lumen`, `/carecraft`, `/serein`, `/guides`, `/tools`) | Vercel, project `nclexrn-site`, root dir `site` | **Automatic** from branch `claude/loving-ptolemy-srrq02` — but newer waves were also pushed directly (Vercel CLI), bypassing GitHub | After this branch: yes |
| snle.healthcarecrownacademy.co.uk | Cloudflare Pages, project `snle-clinical-studio` | **Not connected to GitHub** (per `apps/snle/DEPLOYMENT.md`); deployed directly (wrangler/dashboard) | Only the capture in `apps/snle/live/` |
| account.healthcarecrownacademy.co.uk | Vercel (Next.js app) | Unknown — **source is not in any GitHub repo** | No |
| evinca.healthcarecrownacademy.co.uk | Vercel, project `evinca` | Automatic from `evinca` repo `main` — but live (23 Nov) is newer than the repo's last push (10 Nov), so direct CLI deploys happened too | No |
| lss.healthcarecrownacademy.co.uk | Cloudflare | Direct deploys; `lss-healthcare-toolkit` repo (10 Nov) does **not** match live | No |

## Code that is still NOT in GitHub (needs action)

1. **Account site** (`account.healthcarecrownacademy.co.uk/en`, Next.js,
   last deployed 23 Nov 2026 20:06 GMT): no source found in any repo of
   `themicrolaunchequation-lang`. It writes the `hca-auth` Crown session
   cookies. This is the biggest gap — the sign-in system's source is only
   wherever it was built.
2. **SNLE `/api/gulf-content`** (Cloudflare Pages Function): serves the full
   question bank to entitled Gulf Pass members (returns 401 without a valid
   Bearer token). Server-side source cannot be recovered from outside; export
   it from the Cloudflare dashboard (Pages project → Functions) or from
   wherever it was authored, and commit it under `apps/snle/`.
3. **Evinca drift**: live site is newer than `evinca` repo `main`.
4. **LSS drift**: live site differs from `lss-healthcare-toolkit`.
5. **Supabase**: `supabase/functions/crown-billing` and migrations are in
   this repo (good), but there is no record confirming the *deployed*
   function revision on the Supabase project matches this source. The LSS
   checkout/payment edge functions live in the `lss-healthcare-toolkit`
   repo (`supabase/functions/create-checkout`, `payment-webhook`).

## Merging this branch

Merging into `claude/loving-ptolemy-srrq02` will trigger a normal Vercel
production deploy of `site/` — the only content change there is the 29 lesson
pages, which are byte-identical to what is already live, so the deploy is a
no-op for visitors. `apps/snle/live/` is documentation-only for Vercel (it is
outside the `site/` output directory).

Until merged, production remains on the 8-Nov commit plus direct uploads;
this branch is a preview only.
