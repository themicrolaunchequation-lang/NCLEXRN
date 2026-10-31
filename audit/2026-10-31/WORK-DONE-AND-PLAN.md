# Healthcare Crown Academy — work done and plan

**Date:** 31 October 2026
**Full audit:** [`UX-GO-LIVE-AUDIT.md`](UX-GO-LIVE-AUDIT.md), with evidence screenshots in [`evidence/`](evidence/)
**Working branch:** `claude/funny-sagan-74noh2` · **Live branch:** `claude/loving-ptolemy-srrq02` (push = live)

---

## 1. What was done

### 1.1 Go-live audit (complete)

- Tested the **live** sites, after the cloud environment was allowed to reach the domains.
- Scope:
  - 32 site pages, desktop and phone;
  - 110 app screens across MedLex, Carecraft, Serein, Lumen, the Gulf studio and the Green Belt;
  - the entry pages of Evinca and the account site.
- Checks:
  - errors, accessibility (axe), phone layout, keyboard use;
  - the checkout path up to the payment consent step (no payment made);
  - performance on a throttled phone.
- Main discovery: **payments are live** (Stripe `livemode: true`), while the home page still said "plans open soon".
- Report written with page-by-page findings, scores and an action plan.

### 1.2 Professional email: hello@healthcarecrownacademy.co.uk (✅ live)

| Step | Result |
|---|---|
| Cloudflare Email Routing turned on | ✅ hello@ forwards to themicrolaunchequation@gmail.com |
| Old Porkbun mail records removed | ✅ 2 MX records and the old SPF record |
| SPF updated | ✅ `v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all` |
| DMARC relaxed so replies aren't marked as spam | ✅ `p=quarantine` → `p=none` |
| Gmail "Send mail as" hello@ | ✅ Working, using an app password |
| Website switched from the Gmail address to hello@ | ✅ **Live**: home, plans, account, privacy, terms, refunds, `security.txt` |

### 1.3 Audit fixes (✅ done on the working branch, ⏳ waiting for "publish it")

| Problem | Fix |
|---|---|
| Home page said "plans open soon" and "reserve, no payment now" while checkout is live | The heading now reads "Pricing". The Crown Pass button is now **"Start 7-day free trial"** and goes to the plans page. The reserve form is removed; the founding-price line and FAQ are updated. |
| Prices and free content differed between pages | The Gulf section lists US$29, US$50 and US$69. Free MedLex content is described as the "starter modules" everywhere. The free list includes 10 Gulf questions. |
| Footer missed two products | Added Gulf Region Nursing and Lean Six Sigma Green Belt |
| Plans, account, guides, tools and legal pages were dead ends | **Apps · Guides · Plans** links on all 28 secondary pages; the phone version shows the crown logo only |
| MedLex "Learn" was cut off on phones | Phone layout fixed for the lesson library |
| MedLex paywall gave no context | Shows the lesson name and the Crown Pass price, with the button "Start 7-day free trial" |
| Lumen "Quick tour" button covered text on phones | Now a small round icon on phones |
| Text and buttons failed colour contrast | Darker gold on light backgrounds; darker Gulf button and Green Belt badges. Accessibility checker: **0 issues** on every changed page |
| Account page avatar showed "." | Person icon until signed in |
| Legal tables couldn't be scrolled with the keyboard | Fixed |
| Links shared on WhatsApp or LinkedIn had no picture | Share image added to 27 public pages |
| Gulf exam guides had no date | "By Healthcare Crown Academy · Last updated 30 October 2026" |
| Installed apps keep old files | Site version bumped to v69; Lumen cache renewed |

---

## 2. The plan

### Step 1: Publish the fixes (today, needs your OK)

Reply **"publish it"**. I'll add the fixes to the live branch without overwriting the other session's work, then confirm them on the live site.

### Step 2: Things only you can do (this week)

| # | Task | Where | Time |
|---|---|---|---|
| 1 | Confirm Vercel is on the **Pro** plan (the free Hobby plan is not for commercial use, and payments are now live) | vercel.com → team settings → Billing | 5 min |
| 2 | Turn off **Web Analytics** for the Gulf studio (it causes an error on every page and breaks your "no analytics" promise) | Cloudflare → Analytics & Logs → Web Analytics | 2 min |
| 3 | Send me **names and registration** (NMC or other) of your clinical reviewers, plus a short founder bio, for an **About page** | Message me | 15 min |
| 4 | Send me **verified crisis phone numbers** for Saudi Arabia, the UAE and Qatar, for Serein's "Get help" | Message me | 15 min |
| 5 | Email anyone who reserved a founding price, and honour it | Your inbox / Supabase reservations | 30 min |

### Step 3: Before promoting (next 1–2 weeks; I can do these)

1. **About page and trust:** build the About page from your details; add "Reviewed by …" to guides and the Gulf studio.
2. **Contact email in the other two products:** switch the Green Belt app and Evinca to hello@ (needs those repositories added to this session).
3. **Gulf studio naming:** change "SNLE Study Studio" to "Gulf Region Nursing" inside the app, and re-shoot the hero screenshot that still says 1,350 questions.
4. **Gulf studio accessibility:** a critical glossary error, an untitled frame in Interactive Labs, and contrast.

### Step 4: Polish (next month)

1. **Lumen:**
   - close tool windows when you change screens;
   - default to UK units (mmol/L) and OSCE/NMC instead of NCLEX;
   - add a source and date to the lab values table.
2. **MedLex:**
   - replace the "HP" chip with a "Preferences" icon;
   - add a heading to the Learn page.
3. **Fix content jumping as these apps load:**

   | App | Score now (good is under 0.1) |
   |---|---|
   | MedLex | 0.26 |
   | Serein | 0.30 |
   | Gulf studio | 0.98 |
   | Green Belt | 1.25 |

4. **Green Belt:** split its 2.7 MB page and pin or self-host the code it loads from outside sites.
5. **Home page on phones:** a sticky crown summary in the "Where do you want to grow?" picker; shorter app sections.
6. **Guides:** expand the four study guides to 600+ words.
7. **Serein:** add the Gulf crisis numbers from Step 2.

### Step 5: Keep (don't change)

- the verifiable company and ICO trust strip;
- the "Before you pay" consent step;
- the plain-English refunds page;
- Serein's tone;
- Carecraft's honesty labels;
- zero trackers;
- the consistent design across all apps.
