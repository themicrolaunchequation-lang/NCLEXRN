# Progress log — Healthcare Crown Academy (compact)

Covers everything done from the first request to 22 October 2026, across all sessions and accounts. Source of truth for detail: git history (151 commits on `work/serein-voice`), `docs/HANDOFF-2026-10-19.md` (rules, tests, open items), `docs/CODEX-TAKEOVER.md`.

## Who did what
| Who | What |
|---|---|
| Claude, owner's main account (this session) | Audit, plan, subdomain move, Week 1–4 fixes, legal pages, Lumen speed + hook, image prompt sheet, handoffs |
| Claude, owner's second account (sessions "GitHub connection setup", "Save session") | My Day redesign and shell, Learning Studio, Serein/Carecraft/Lumen reworks, Serein player + artwork, Daily Crown, MedLex Learn/Atlas/Word parts, Lumen reader and storage |
| Codex (OpenAI), from 21 Oct 16:00 | Took over per `docs/CODEX-TAKEOVER.md` on branch `codex/medlex-rebase` (5 commits: lesson progress carry-over, slide visit tests, Atlas retry test, quest-before-modal fit, replaced four anatomy icons). Commits show the owner's name. |

## Timeline

**Before Crown Suite (to 17 Oct)** — Laureate LSS certificate engine and ID badge generator (25–26 Sep); Healthcare Crown Academy home page and installable web app (11 Oct); Evinca links, ICO trust bar, hosting moved to Vercel (12–13 Oct).

**17 Oct — apps published + Crown Suite plan**
- Carecraft, Serein, MedLex and Lumen built for the web (hashed JS/CSS, CSP-safe, offline workers, manifests, icons, OG images) with a best-fit first-visit hook each: Carecraft 60-second scenario, Serein breath then mood check, MedLex decode-a-word, Lumen added later.
- Crown Suite plan approved: one account (shared cookie `hca-auth` across subdomains), subscriptions ≥50% under market, 50% test codes, admin generator, certificates.
- Supabase: tables, RLS and functions for plans, subscriptions, grants, codes, progress, certificates, audit; `crown_entitlements` etc.
- Home page: jewel identity per app, launcher dock, gold "Open X" buttons, "build your crown", pricing. Shared account button in every app. Free/paid gates built and switched OFF (`GATES_LIVE=false`; preview `?gates=on`).

**18 Oct — subdomains, audit, fixes**
- Subdomain move: medlex./carecraft./serein./lumen. (Vercel domains, Cloudflare CNAMEs, per-host CSP, host rewrites, one-time local-progress bridge `/move`, permanent redirects). Home page moved to `home.html` via rewrite after a routing bug.
- Deep audit of all six products (six parallel reviewers, screenshots, axe): scores 5.5–6.5/10; report at https://claude.ai/artifact/JYn5XwRaiS8JncfEvnFxTA.
- Week 1–4 fixes: reserve-plan flow and `?plan=`, honest pricing (~40% yearly), unticked consent, Sign-in button docking, Serein hero bug + UK crisis block (111 opt. 2, Shout FRONTLINE, Practitioner Health, NHS 24, Breathing Space, Lifeline NI), Carecraft dark mode + daily-card bug + answer shuffle, MedLex contrast/focus, leak-proof gates in each app, jewel colours, Lumen 15.6 MB → 2.8 MB first load + manifest/offline + 3-step welcome + violet + More tab.
- Evinca: write-first Spotlight story, correct requirements, LinkedIn/Share, mobile fixes (published on owner's approval).
- "My Day" redesign (Today renamed; Infographics → Visual Atlas) with navy shell, bento home, 3D hero objects, shared top bar, Crown-apps switcher; two parallel builds were compared and the other account's (B) was kept and is live.
- Learning Studio: slide-journey engine (pen, highlighter, shapes, laser, undo/redo) for every MedLex module and Carecraft lesson with infographic tours.

**19 Oct — rework wave + legal + suite features**
- Serein toolkit (ten tools by moment); Carecraft Learn (30 lessons depth), Practice Lab (9 branching scenarios), Toolkit (18 job-aids); Lumen reading room.
- Legal: ICO ZC273259; refunds page rewritten to UK Consumer Contracts Regulations; terms and privacy expanded; permanent redirects (/evinca, /pricing).
- Lumen Academy AI now uses the shared HCA sign-in (backend change still needed, see Open).
- Isolated worktrees run in parallel: home page rebuilt as a five-app suite page (real screenshots, one CTA, pricing near top, billing-first FAQ); Carecraft question rewrite + validator; MedLex pronunciation recorder + poster-viewer fixes (microphone allowed on MedLex host only); Evinca dark mode (merged to Evinca `main` at 2806451 with owner approval).
- Serein player: voice-over for 15 practices, instruction timeline, 3D WebGL lungs, breath sounds, per-practice soft music; owner's 44 illustrations optimised and placed (`apps/serein/art/`, runtime `art.js`).
- Daily Crown: `HCA.daily` cookie `hca-daily`, card in all four apps, home summary, single shared streak (Serein shows none), privacy note.

**20–21 Oct — MedLex and Lumen depth**
- MedLex: 29 supplied lesson decks processed and shown full-screen; Library → Word parts hosts three quests; Visual Atlas flip-book + poster pop-up with markup; Atlas reduced-motion crop bug fixed; slide design system; real artwork replaces flat icons; cache headers.
- Lumen: clearer toolbar/menu names and tour; PDF upload fix for older Chrome (`Promise.try` shim); rail folds while reading; customisable reader toolbar; Workspace storage (`docs/LUMEN-STORAGE.md`).
- Plan note for Supabase explicit grants on new public tables (from 30 Oct 2026).
- 21 Oct: Codex takeover brief written; Codex continued MedLex on `codex/medlex-rebase`.

## State of the branches
- Live deploy branch: `claude/loving-ptolemy-srrq02` (last publish: "Rebuild MedLex with cards, popups, artwork, Word parts speed").
- `work/serein-voice`: 5 commits ahead of live (slide-design system, merged builds, Codex brief) — not yet published.
- `codex/medlex-rebase`: Codex's MedLex work, not published.
- Old/finished branches: `wave1/*` (merged), `claude/affectionate-brown-rw9uy1` (earlier redesign, superseded).
- Evinca repo: `main` live; branch `wave1/evinca-dark` merged.

## Open
1. Publish `work/serein-voice` and decide on `codex/medlex-rebase`; verify each page in a browser first.
2. Backend (owner approval first): `lumen-ai` 403 for Crown Pass/Lumen-premium users; add `lumen` key to `crown_entitlements()`.
3. Stripe checkout, billing portal, admin console, discount codes (owner adds Stripe keys as Supabase secrets, never in chat), then `GATES_LIVE=true`.
3a. Stripe (22 Oct): live account HEALTHCARE CROWN ACADEMY LTD `acct_1UNyuEELw45NjhlB` connected to Claude (read-only check): £0 balance, no charges, no webhooks, 8 one-time USD prices (Evinca + LSS only), no Crown Suite products yet. Verification/payouts to confirm on the dashboard. Old test account "New business" `acct_1USDzY4HWr5jKvqT` is not ours to use.
4. Owner to review Terms/Refunds/Privacy with a solicitor before taking payments.
5. NMC revalidation pack: not requested yet.
6. Rules: one session per task; push often; never hand-edit `site/<app>/`; never push Evinca `main` without the owner's word.

## Owner to-do before taking payments (from 28 Oct review)
- [ ] Real trading + postal address for customers (Shelton Street is a registered-office service); send it and Claude adds it to the legal pages.
- [ ] Stripe: turn on renewal reminders and trial-ending emails (Settings → Billing → Subscriptions and emails), sandbox then live.
- [ ] Supabase: upgrade to Pro (backups, no pausing).
- [ ] Accept supplier data processing agreements: Supabase, Stripe, Vercel, Cloudflare, Resend.
- [ ] Accountant (once): overseas VAT/tax on Gulf and EU sales.
- [ ] Short risk assessment for 16–17-year-old users.
- [ ] Solicitor: "service" or "digital content" per product (refund wording already treats the law as the minimum).

## Key links
Audit report https://claude.ai/artifact/JYn5XwRaiS8JncfEvnFxTA · Serein image prompt sheet https://claude.ai/artifact/P9Q8zg8p4sFre9T3ii5r3M · Repos: github.com/themicrolaunchequation-lang/NCLEXRN and /evinca.
