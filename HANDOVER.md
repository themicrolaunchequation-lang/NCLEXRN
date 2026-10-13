# Handover: Healthcare Crown Academy + Evinca (13 Oct 2026)

## Live addresses
| Address | What | Host | How it updates |
|---|---|---|---|
| healthcarecrownacademy.co.uk (+ www) | Company home page | Cloudflare Worker `curly-king-5652` | **Manual**: Cloudflare → Workers & Pages → curly-king-5652 → New deployment → drag in the zip |
| evinca.healthcarecrownacademy.co.uk | Evinca app | Vercel project `evinca` | **Automatic**: any push to `main` of `themicrolaunchequation-lang/evinca` |
| evinca.vercel.app | Old address | Vercel | 308-redirects to the address above |

## Account map (who logs in where)
| Service | Log in with | Holds |
|---|---|---|
| GitHub | `themicrolaunchequation-lang` (owner); `lilianhossamfahmi2-glitch` = collaborator | Code: `NCLEXRN` (home page), `evinca` (app) |
| Vercel | themicrolaunchequation@gmail.com (kept as is; the separate account lilianhossamfahmi2-1009 holds only old NCLEX projects) | Evinca hosting |
| Supabase | themicrolaunchequation@… ; lilianhossamfahmi2@gmail.com invited as Owner | Org **clinicalai** → project **evinca** |
| Cloudflare | lilianhossamfahmi2@gmail.com → open **Themicrolaunchequation@gmail.com's Account** (Super Admin) | DNS + home page |
| Porkbun | unchanged | Domain registration/renewal |
| Evinca admins | lilianhossamfahmi@gmail.com, themicrolaunchequation@gmail.com, lilianhossamfahmi2@gmail.com | Full admin (all data, gifts, certificates) |

Contact email on both sites stays themicrolaunchequation@gmail.com.

## Accounts
- **Domain**: Porkbun (nameservers → Cloudflare: asa / kellen.ns.cloudflare.com). Email forwarding MX/TXT kept.
- **DNS + home page hosting**: Cloudflare (free plan). Records: root + www → Worker; `evinca` CNAME → Vercel (grey cloud, DNS only).
- **Evinca hosting**: Vercel, team `themicrolaunchequation-langs-projects`, Hobby plan.
  Commits must be authored as `themicrolaunchequation-lang <287725945+themicrolaunchequation-lang@users.noreply.github.com>`.
  If a push builds only as **Preview**, use Deployments → ⋯ → Promote to Production.
- **Database/sign-in**: Supabase project `evinca` (London). Home page forms write to `inquiries` and call `subscribe()`.
- **Payments**: Stripe account exists; Evinca payments are OFF (app_settings.stripe_enabled=false). Activation steps: `evinca/PRICING_STRIPE_RELEASE.md`.
- **Netlify**: no longer used (projects can be deleted).
- **ICO**: fee paid 13 Oct 2026, application C2057983. Registration number (ZB…) arrives by email.

## Code
- Home page: repo `themicrolaunchequation-lang/NCLEXRN`, branch `claude/loving-ptolemy-srrq02`, folder `site/`.
  Settings in `site/assets/js/config.js` (contact email, registered office, Evinca URL, Supabase, **icoNumber**).
  After any change: bump `VERSION` in `site/sw.js`, zip the `site/` folder contents, upload to Cloudflare.
- Evinca: repo `themicrolaunchequation-lang/evinca`, branch `main`. Brand + flags in `lib/brand.ts`
  (`icoNumber`, `pilotInviteOnly=false`, `indexable`), policy texts in `lib/policies.ts`.

## Current state of Evinca
- Applications open and free (invite code off in code and DB `settings.invite_only=false`).
- Full Privacy / Terms / Corrections / Reviewer conduct texts (dated 12 Oct 2026).
- Search engines allowed; sitemap at /sitemap.xml.
- Footer links to the home page; certificates print the company line.
- Sample people stay labelled "Illustrative" (fictional people must not be shown as real).

## To-do (in order)
1. **Upload the latest home page zip** to Cloudflare (contains Evinca links, subdomain, credentials bar).
2. **ICO number**: when the email arrives, set `icoNumber: 'ZB…'` in
   - `NCLEXRN/site/assets/js/config.js` → re-zip → upload to Cloudflare
   - `evinca/lib/brand.ts` → push to `main`.
3. **Second admin**: create an Evinca account with a second email, then in Supabase SQL editor:
   `update profiles set is_admin = true where email = 'SECOND_EMAIL';`
4. Solicitor review of the policy texts before taking payments.
5. Before charging: activate Stripe, add refund/terms details, follow `PRICING_STRIPE_RELEASE.md`.
6. Optional: Porkbun email forwarding `hello@healthcarecrownacademy.co.uk` → Gmail, then update `contactEmail`.
7. Replace illustrative samples with real, consenting honorees over time.

## Prompt to continue in a new chat
"Continue the Healthcare Crown Academy / Evinca work. Read HANDOVER.md in themicrolaunchequation-lang/NCLEXRN
(branch claude/loving-ptolemy-srrq02). My ICO registration number is ZB______ — switch on the badges on both sites."
