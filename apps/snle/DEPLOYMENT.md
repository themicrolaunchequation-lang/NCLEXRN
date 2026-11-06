# Cloudflare deployment and rollback

## Current state (checked 7 November 2026) — read this first

The rest of this document describes the plan written before launch. It is out of date in four ways:

1. **The hostname is live.** `snle.healthcarecrownacademy.co.uk` returns the Gulf Nursing Licensure Studio. The statement below that it "has not been added to DNS or any hosting project" is no longer true.
2. **The live site is not built from this folder alone.** It is built by `apps/gulf/scripts/build.mjs`, which builds `apps/snle` first and then layers the four-exam Gulf edition on top. The live page carries the title "Gulf Nursing Licensure Studio" and `<meta name="hca-app" content="gulf">`, which only that build writes.
3. **The live build matches branch `claude/gulf-crosswalk`, commit `c5fb27d` (2 November 2026).** Three content-hashed files served by the live site are byte-for-byte names from that build: `/assets/app.4c4b786799e8.js`, `/assets/gulf-ui.7ab5095e6e4e.js` and `/assets/library.4296c7c2b06f.js`. None of this is on the production branch `claude/loving-ptolemy-srrq02`, which does not contain `apps/gulf`.
4. **Hosting is Cloudflare Pages, not Vercel.** No Vercel project owns the hostname. The build writes a Pages `_worker.js` and `_routes.json` (the worker serves `/api/gulf-content` to Gulf Pass holders only).

**Still unconfirmed, because no one in the review had Cloudflare access:** the Pages project name, the production branch it is set to, whether it deploys automatically on push or by direct upload, and the deployment ID to roll back to. Until the owner confirms these from the Cloudflare dashboard, treat any push to `claude/gulf-crosswalk` as a possible production release.

**Build settings that reproduce the live files** (inferred from the match, to confirm in Cloudflare):

| Setting | Value |
| --- | --- |
| Branch | `claude/gulf-crosswalk` |
| Root directory | `apps/gulf` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment | `GULF_PUBLIC` unset (public build: indexable, with sitemap) |

**Rollback until confirmed:** in Cloudflare → Workers & Pages → the project → Deployments, promote the last good deployment, then revert the commit on the branch the project deploys from. Record the deployment ID before every release.

---

## Access and release order

No Cloudflare connection, API token or account ID was available at implementation time. Local verification is not a Cloudflare preview.

1. Enable Cloudflare access or securely configure CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in the execution environment. Do not paste secrets into source, commands, reports or chat. Enable the Cloudflare API destination in the environment's network policy if needed.
2. Inspect Pages projects in the selected account. Reuse a project only after confirming it is the intended SNLE project. Do not overwrite existing Workers, Pages projects or app domains.
3. Deploy and verify a Cloudflare preview from the exact integration commit.
4. Validate the missing Interactive Labs package, or obtain an explicit release-scope decision from the owner.
5. Obtain production approval after the preview is reviewable.
6. Bind only the approved new SNLE hostname, verify it, then publish the Academy navigation changes separately.

Proposed hostname: snle.healthcarecrownacademy.co.uk. It has not been added to DNS or any hosting project.

## Preferred Pages GitHub integration

Connect themicrolaunchequation-lang/NCLEXRN through Cloudflare Pages' GitHub integration.

| Setting | Value |
| --- | --- |
| Suggested new isolated project | snle-clinical-studio, subject to actual account availability |
| Root directory | apps/snle |
| Build command | npm ci --include=dev && npm run build |
| Output directory | dist |
| Node version | 24 |
| Preview branch | codex/snle-clinical-studio-integration |
| Production branch | Select only during the approved release plan |

Do not silently substitute a Direct Upload project if GitHub integration is required. Inspect the current Wrangler help before using its commands on an already confirmed appropriate project. The package pins Wrangler and includes an explicit preview script, no credentials or production deploy script.

## Preview acceptance

Check HTTPS and security/cache headers. Open every hash route and refresh. Test all popup tabs, a guided case, Coach Practice, tutor/exam simulation, midpoint break, report review, annotations, glossary, Arabic assist, palettes, backup/import, keyboard focus and mobile More navigation. Verify every poster and external lab page.

Pages preview hostnames are outside the trusted Academy cookie domain. Do not widen the account redirect allowlist for previews. The tests verify the protocol using mocked sessions; the real account return must be checked on the approved Academy hostname.

## Production

After approval, attach only the new SNLE domain to the isolated Pages project. The existing account already permits HTTPS returns to Academy subdomains and uses the first-party domain cookie. This integration adds no Supabase schema, paid entitlement, subscription price or redirect permission.

Then merge the website/app-switcher changes into claude/loving-ptolemy-srrq02 and deploy the existing Academy project. Keep Cloudflare SNLE separate from the existing Vercel suite. Do not change Vercel settings, domains or environment variables without approval.

## Rollback

- Record the prior Academy commit and Cloudflare deployment ID before release.
- Roll back SNLE to its prior known-good deployment in that same Pages project. Do not delete the project, domain or learner records.
- Revert the Academy navigation commits or restore the prior deployment of the existing nclexrn-site project.
- The SNLE worker deletes only obsolete snle-web-* caches. It never clears progress or annotations.
- Export a local progress backup before changing origins. Rollback does not move records between origins.

## Documentation checked

- [GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
- [Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/)
