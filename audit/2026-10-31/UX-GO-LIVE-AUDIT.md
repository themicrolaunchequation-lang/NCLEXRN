# Healthcare Crown Academy — UX and go-live readiness audit

**Date:** 31 October 2026 · **Tested against:** the live sites, from inside a cloud browser (Chromium via Playwright). The live files matched commit `4baf71e` on the deploy branch byte for byte.
**Scope:** the home site (32 pages, including 19 guides and 3 tools), MedLex, Carecraft, Serein, Lumen, the Gulf Region Nursing studio (`snle.`), the Green Belt toolkit (`lss.`), and the entry pages of Evinca and the account site.
**Not done, on purpose:** no payments, no account created, nothing submitted to your database. All write requests were blocked in the browser. Only invalid input was used to test forms.

Evidence screenshots are in [`evidence/`](evidence/). The previous audit (25 Oct) is in [`../2026-10-25/`](../2026-10-25/).

---

## 1. Verdict

**The product is close.** Engineering quality is unusually high:
- zero JavaScript errors on 100+ screens;
- no horizontal scrolling at phone width on any page;
- one clear heading per page almost everywhere;
- strict security headers;
- an honest, well-designed checkout consent step;
- a free tier that is genuinely useful.

Serein, Carecraft and MedLex feel like finished products.

**It is not ready to promote as a paid product yet.** Payments are **live** (Stripe `livemode: true`), but the home page still tells visitors plans "open soon" and asks them to "Reserve, no payment now". A visitor gets two different stories about the same product, depending on which page they land on. Fix that first. Then fix the handful of trust and phone-layout issues in section 3, and you are in good shape to launch.

| Area | Score /10 | One-line reason |
|---|---|---|
| Visual design and brand | 8.5 | Cohesive, premium, consistent across five apps. Some gold-on-cream contrast misses. |
| Information architecture and navigation | 6 | Home is excellent; secondary pages are dead ends with no shared navigation. |
| Conversion path (home → plans → checkout) | 5 | The checkout itself is good, but the home page contradicts it. |
| Trust and credibility | 6 | Company and ICO proof are excellent; personal Gmail, no "About" page, no named clinical reviewers. |
| Content consistency | 6 | Prices, counts and product names drift between pages. |
| Accessibility (WCAG 2.2 AA, automated + keyboard) | 8 | Near-zero axe issues; skip links and focus rings throughout; a few contrast and tap-target misses. |
| Phone experience | 7 | Generally excellent; MedLex Learn is clipped and Lumen's tour pill covers content. |
| Performance (lab, throttled phone) | 7 | Marketing pages fast; layout shift poor on MedLex, Serein, Gulf studio and Green Belt. |
| Legal and commercial readiness | 8 | Terms, refunds and privacy are clear and now cover every product. |

---

## 2. How this was tested

- **Pages and screens.** Every static page and every app sidebar screen was opened at **1440×900** and **390×844** (touch, phone): 64 page views and 110 app screens.
- **Checks on each screen:**
  - console and page errors, and failed requests;
  - axe-core 4.10.3 (WCAG 2.0, 2.1 and 2.2 AA);
  - heading structure and horizontal overflow;
  - small tap targets and tiny text;
  - title, description, social image and canonical tags.
- **Flows:** the plans page (signed out) through to the payment consent dialog, with UK, US and Saudi locales; the sign-in window; the reserve and newsletter forms (invalid input only); keyboard tab order on home; the tour player; dark theme with reduced motion; home with JavaScript off; and the paywall on a paid MedLex lesson.
- **Performance:** a throttled phone (4× CPU, ~1.6 Mbps, 150 ms latency) on 10 entry pages.
- **Limits:**
  - No signed-in or paid state was tested.
  - Evinca was tested at entry-page level only. It lives in a separate repo.
  - The Green Belt app loads code from CDNs this sandbox can't reach (cdnjs, jsdelivr, Google Fonts), so its functions weren't exercised.
  - No screen-reader or real-device testing.

---

## 3. Go-live blockers and high-priority fixes

### B1. The home page says plans "open soon", but the plans page takes real money

- **Where:** home `#pricing` ("Pricing · plans open soon", the "Reserve Crown Pass" button, the "Reserve a plan … No payment now" form) and the footer "Launch news: hear when plans open".
- **Reality:** `/subscribe` shows "Start 7-day free trial · £0 today, then £29.99 on 7 November 2026" and goes to live Stripe checkout. The billing status endpoint returns `{"configured":true,"livemode":true}`.
- **Why it matters:**
  - Visitors who reserve think they have secured a founding price without paying. Visitors who go to `/subscribe` are charged on day 8.
  - The founding-price wording differs too: "reserve before 31 Jan" on home, "join before 31 Jan" on plans.
  - It also looks as if nobody is minding the shop.
- **Fix:**
  - Change the eyebrow to "Pricing".
  - Make the Crown Pass button "Start 7-day free trial" and link it to `/subscribe?plan=crown`.
  - Remove the reserve form, or turn it into "Not ready? Get a reminder before the founding price ends".
  - Change the footer copy to "News and new courses".
  - Email everyone who already reserved, and honour their founding price.
- **Also:** `subscribe.js` "fails open". If the billing-status call fails, the buy buttons stay live, even though the code intends "Opening soon" before launch. That doesn't matter now payments are live, but remember it for any future pause.

Evidence: `01-plans-page-live-checkout.jpg`, `02-home-pricing-says-open-soon.jpg`.

### B2. A personal Gmail address is your only support, refund, data-rights and security contact

`themicrolaunchequation@gmail.com` appears on:
- the home FAQ and footer, the plans page, the account page and all legal pages;
- `security.txt`;
- the Green Belt app.

For a company selling subscriptions to healthcare professionals, an unrelated personal Gmail name is the single biggest credibility hit on the site. It reads like a side project, and some employers' mail filters treat it as suspicious.

**Fix:** turn on Porkbun email forwarding for `hello@healthcarecrownacademy.co.uk` and `support@healthcarecrownacademy.co.uk` (free). Send a test message, then switch `contactEmail` in `site/assets/js/config.js`, the Green Belt's `CONTACT_EMAIL`, and `security.txt`.

### B3. MedLex "Learn", the main study screen, is cut off on phones

At 390 px the embedded Canvas Studio library is clipped on the right:
- the headline reads "Clear words. Confident learn…";
- the Night button, lesson cards and the "Next page" button run off screen.

The library page sets `html, body { overflow: hidden }` alongside fixed-width rules, so nothing can scroll into view. Automated checks miss this because the overflow is hidden inside the frame.

**Fix:** make `/medlex/learn/canvas/index.html` fluid below 760 px. Remove the `min-width` and fixed widths, and let the body scroll vertically.

Evidence: `03-medlex-learn-clipped-on-phone.jpg`.

### B4. No visible people behind the product

There is no **About** or **Who we are** page, no founder, no named clinical editor or reviewer, and no editorial policy. The guides carry no author, reviewer or "last checked" date.

The Gulf studio is sold on "1,297 *clinically reviewed* questions … clinically reviewed and accepted for release", but nothing says *who* reviewed them or with what qualifications.

For health and exam content, buyers and Google both look for this, and Google weighs it heavily for health topics.

**Fix:**
- Add an About page: company, founder, mission, clinical review process, and named reviewers with their registration (NMC or other).
- Add "Written by … · Clinically reviewed by … · Last checked …" to every guide.
- Link "clinically reviewed" to the review process.

### B5. The same facts differ from page to page

| Fact | Where it differs |
|---|---|
| Gulf Pass options | Home's Gulf section lists only "US$50 / 3 months or US$69 / 6 months". The pricing card, plans page and refunds page include the new **US$29 / 1 month**. |
| Free MedLex content | Home and plans say "MedLex **modules 1–3**". The MedLex paywall says the free starter lessons are "word structure, building vocabulary, prefixes and suffixes" (four lessons). |
| Gulf question count | Copy everywhere says **1,297**. The hero carousel screenshot of the Gulf studio still shows **1,350**. |
| Product name | Marketing says **Gulf Region Nursing Licensure Studio**. The app's title, sidebar and logo say **SNLE Study Studio** / **SNLE**, even on the Qatar, Dubai and Abu Dhabi editions. |
| What's free | Plans page: "…and 10 free questions for each Gulf exam". Home's "Free account" box omits the Gulf questions. |
| Number of apps | "Six apps. One account." The picker shows 7 jewels ("0 of 7 jewels lit") and the hero has 7 tours. |
| Footer app list | Lists MedLex, Lumen, Carecraft, Serein and Evinca. It omits Gulf Region Nursing (a paid product) and the Green Belt. |

**Fix:** keep prices, counts and free-tier lists in one shared data file (you already have `tours-data.js` and `crown-account.js` `PRICE`). Have home, plans and the paywalls read from it. Re-shoot the Gulf studio screenshot.

---

## 4. Page-by-page critique

### 4.1 Home (`/`)

**Works well**
- **Headline.** "Learn with confidence. Care with skill. Earn your crown." is memorable and on-brand.
- **"Which describes you?" switcher.** Seven personas, each with a tailored first step. This is excellent personalisation for a multi-product suite.
- **Trust strip.** Company number and ICO number, each with a "check" link to the public register, is a smart, verifiable trust device.
- **Try-it widgets.** Decode *tachycardia*, flip a recall card, answer a 60-second scenario, take one breath. These let visitors *feel* each app before signing up. This is the best part of the page.
- **Keyboard and no-JS.** Tab order is logical with visible focus. The page still renders all 1,537 words with JavaScript off.

**Needs work**
1. **Pricing contradiction (B1).**
2. **Length.** About 10,500 px on desktop and **about 16,000 px on a phone (19 screens)**. After the picker, the six app sections repeat the same pattern. Consider collapsing the app sections into tabs or a carousel on phones, or moving the deep demos to each app's guide page.
3. **Picker feedback is off-screen on phones.** On a phone the crown summary ("0 of 7 jewels lit" plus the CTA) appears *after* all seven cards. People tap cards and see nothing happen. Make the summary a sticky bottom bar on phones (`06-…jpg`).
4. **Persona chips row** is clipped at both edges with no scroll cue. Add a fade or an arrow, or wrap the chips onto two rows.
5. **Gold accent words on cream fail contrast badly.** "*grow*" in "Where do you want to *grow*?" is **1.56:1**. Use the darker gold `#8a6418` on light backgrounds; keep the bright gold for dark sections.
6. **Green Belt chip** shows as an empty green square on both desktop and phone (its letter is the same colour as the background, 1.02:1).
7. **Gulf section copy** is a run-on paragraph with three unbulleted lines and a block of small, tracked uppercase disclaimer text. Uppercase small text is the hardest text to read. Use sentence case at 13–14 px in a soft callout box.
8. **Hero headline tracking** is very tight at desktop sizes. "Care with skill." nearly touches. Loosen it by about 0.01 em.
9. **Main-thread work.** About 1.8 s of long tasks on a throttled phone, from the hero animations, carousel and tours. Defer the tour scripts until a "Watch the tour" button is clicked.
10. **FAQ** duplicates part of the plans-page FAQ with different questions. Keep one source, or link "More billing questions → plans".

### 4.2 Plans (`/subscribe`)

**Works well**
- Clear three-plan layout.
- An honest "£0 today, then £29.99 on 7 November 2026, renewing at £39.99" line under the button.
- A trust row: "Cancel in two clicks / Full refund within 14 days / No VAT added / Secure payment by Stripe".
- Self-service "Stop renewal" and "Cancel and get a refund".
- **The "Before you pay" dialog is exemplary:** 18+/guardian confirmation, an explicit "start now during my 14-day period" tick, and the consent stored with its wording version (`07-…jpg`).
- Country pricing detects GB and SA correctly.

**Needs work**
1. **The page has no navigation.** The header is the logo plus "Sign in". There's no way to reach the apps, FAQ or guides except the footer "Home" link.
2. **US visitors see "Prices for United States · Prices in pounds sterling".** That's correct by policy, but jarring. Add "≈ US$38" next to the £ price for non-GBP countries.
3. **"Get the Gulf Pass" button contrast:** white on `#2e86b5` is 4.04:1, which fails AA. The Green Belt badge is 3.42:1. Darken both.
4. **The Gulf Pass card** has no "what's free first" link. Add "Try 10 questions free →" under the button. That message is currently only in the line below the cards.
5. **No social share image** (`og:image`). Plans links shared on WhatsApp or LinkedIn will show no picture.

### 4.3 My account (`/account`)

**Works well:** a clean signed-out state; sign-in opens as a window on the page with the correct `autocomplete` values; clear "Close my account" with a type-CLOSE confirmation; plain-English refund rules.

**Needs work:**
- The avatar shows a stray "**.**" when signed out (`10-…jpg`). Show a generic person icon.
- Two "Sign in" buttons are visible together (header and card). That's fine, but the header one could become "Plans" on this page.
- There's no description tag. It doesn't matter much, because the page is `noindex`.

### 4.4 Guides hub and 19 guides (`/guides/…`)

**Works well:** a strong hub ("Start here" cards with real app screenshots); concise guides with breadcrumbs, `BreadcrumbList` / `Article` structured data, official-source links, an honest "not endorsed by SCFHS…" box, and a contextual call to action into the right app. Fast: LCP 0.7 s on a throttled phone.

**Needs work**
1. **No author, reviewer or "last checked" date** (B4). The Gulf exam guides especially need "Rules checked against SCFHS on [date]".
2. **Navigation dead end.** The header shows only "Back to home". Add the main site navigation, or at least "Guides · Apps · Plans".
3. **Brand gold `#a37a1f` on white fails contrast** on every tag and on the "Day 1…7" labels (3.91:1). Darken it to `#8a6418` (5.4:1 on white, 4.9:1 on cream).
4. **Thin content.** The four study guides are about 210 words each. That's thin for search and for a learner. Aim for 600–900 words with an example, a worked plan and FAQs.
5. **No social share images** on any guide. These are your most shareable pages.

### 4.5 Free tools (`/tools/…`)

The calculators work and explain themselves. The control chart is clear, and "everything runs in your browser" is a nice touch.
- The chart has no axis labels or period numbers, and results show three decimals (`35.000`). Two are enough.
- Add a "Copy result" or "Download PNG" button. That's what an improvement lead needs for their report.

### 4.6 Legal pages (privacy, terms, refunds)

Much improved since 25 Oct: they are versioned (2026-10-29), cover the Gulf studio, point to the Green Belt and Evinca terms, and the refunds page is outstanding plain English.
- Fix the support email (B2).
- On phones the privacy tables scroll sideways but can't be reached by keyboard: add `tabindex="0"` and an `aria-label` to `.table-wrap`.

### 4.7 404 and `/preview/crown`

- The 404 copy is calm and neutral.
- `/preview/crown` is publicly reachable. It is `noindex, nofollow` and disallowed in `robots.txt`, but it contains old copy (for example "plans open soon"). Delete it, or password-protect it before promoting the site.

### 4.8 MedLex

Very polished. My Day, Word parts, Library word lab, Practice, Visual Atlas and Progress are clear and consistent. Zero axe or console issues on all 8 screens at both sizes.
- **B3:** Learn is clipped on phones.
- **Learn feels like a separate app.** It carries its own "MedLex Canvas Studio" logo, search and Night button inside MedLex, so two MedLex logos stack on phones. Hide the inner header when the library is embedded. Learn is also the only screen without a page heading (h1).
- **"HP" chip** (Learning preferences) sits beside the account avatar, so it reads as two profile icons. Use a sliders icon labelled "Preferences".
- **Paywall** (`08-…jpg`): clear, honest, with three good exits. But:
  - it shows no lesson title, preview or price, so a free learner doesn't know what they're missing;
  - the heading falls back to a system Times-style font.

  Show the lesson's cover image and the first two slides, plus "Crown Pass from £5.99/month".
- **Layout shift** on first load is **0.26** (good is under 0.1), unchanged since 25 Oct. Reserve space for the welcome and hero content.

### 4.9 Carecraft

The best-structured app: My Day, Learn (30 lessons), Practice (with skills radar), Toolkit (18 job aids) and My Growth. It's honest throughout ("Fictional · practice only", "not CPD credit"). Zero issues found on 5 screens at both sizes.
- **Small:** the first-visit scenario question is a great hook, but there's no progress hint ("1 of 1 · 60 seconds"). Add one so people know it's short.

### 4.10 Serein

The most finished app in the suite.
- The first visit is a calm, full-screen three-breath welcome with "Skip" and "Need urgent help now?" always visible. That fixes the earlier modal issue.
- Support lists UK crisis lines clearly.
- **Still open:** the crisis numbers are UK-only, while you market to Gulf nurses. Add Saudi, UAE and Qatar lines (verified), or a country picker.
- **Layout shift** on load is **0.30**.

### 4.11 Lumen

Powerful, and the most crowded.
- **Tool windows pile up.** Board, Canvas, Focus timer, Planner, Blurt pad, Lab values and Calculator open as floating windows that stay open when you change screens. After a few clicks, five windows overlap (`05-…jpg`). Close or minimise tools when the main screen changes, and add a single "Close all windows" control.
- **"Quick tour" pill covers content** on every phone screen: card titles and body text (`04-…jpg`). Move it into the Help menu after the first visit, or dock it above the tab bar with padding.
- **US-first defaults in a UK and Gulf product.** Onboarding offers "NCLEX" first, and Lab values defaults to **US units** "as commonly taught for NCLEX". Default to SI units (mmol/L) and offer "OSCE / NMC / Gulf exams" first.
- **Clinical reference values without a source.** The Lab values table lists electrolytes, renal and blood ranges with no source and no review date. Add "Source: … · checked [date]", and keep the existing "ranges vary by lab" note.
- **Sidebar labels** are long descriptions ("Kanban board for your study tasks…"). Short nouns (Board, Canvas, Timer, Planner) would scan faster.
- **Page size.** The HTML document is still **972 KB** (497 KB compressed), and LCP is 3.2 s on a throttled phone. This is unchanged since 25 Oct.

### 4.12 Gulf Region Nursing studio (`snle.`)

The host is now live (it was unconfirmed on 25 Oct). The studio is serious and dense: exam guide, glossary with Arabic, 35 dossiers, 67 decision tools, mock exams, and a slide-view question bank with annotation tools.
- **Naming:** it says SNLE everywhere (see B5).
- **Layout shift:** CLS is **0.98** on the home screen (very poor). Elements jump as the page loads.
- **Console error on every page.** Cloudflare's auto-injected Web Analytics beacon is blocked by your own security policy. Turn off Web Analytics for this zone in Cloudflare. That also keeps your "no analytics" promise true.
- **Accessibility:**
  - one critical ARIA error in the Glossary (`aria-required-attr`);
  - the Interactive Labs frame has no title and the screen has no heading;
  - contrast misses in Dossier and Practice Hub.
- **Density:** many 11–12 px labels on desktop. Think about a "comfortable" text size for long sessions.

### 4.13 Green Belt toolkit (`lss.`)

The seller is now clearly stated (`/legal` names HEALTHCARE CROWN ACADEMY LTD, 17501904). That fixes the 25 Oct finding.
- **2.7 MB single HTML page**, LCP 3.7 s and **CLS 1.25** on a throttled phone. Split the bundles and lazy-load the simulations.
- **Third-party code loaded from CDNs** (cdnjs jsPDF, jsdelivr `supabase-js@2` without a pinned version, Google Fonts) and no `script-src` policy. An unpinned `@2` means someone else's release can change your checkout page. Pin exact versions with integrity hashes, or self-host them like the rest of the suite.
- **Accessibility:** 2 h1s, 16 contrast failures on desktop, and one tooltip without a name.
- **Brand:** this app uses different fonts (Cinzel, Cormorant) from the rest of the suite.

### 4.14 Evinca and the account site (entry pages only)

They load cleanly, with no axe issues.
- The page title "Evinca **Honors** 2027 — Evidence-Reviewed Healthcare **Awards**" uses US spelling and "awards" framing, while the Academy calls Evinca "recognition" in UK English. Align the wording.
- `account.healthcarecrownacademy.co.uk` shows the Evinca home page, and its sign-in page is titled "Sign in · The Evinca Review". Most learners now sign in from the window on the Academy page, so they won't see it. Anyone following the "Evinca profile" link from an app will, and won't expect to land in Evinca.

---

## 5. Cross-cutting themes

1. **One navigation everywhere.** Only home has the full navigation. Plans, account, guides, tools and legal pages are dead ends. A shared slim header (Apps · Guides · Plans · Sign in) would lift guide-to-app and guide-to-plan journeys, which are your SEO funnel.
2. **Darker gold for light backgrounds.** Gold `#a37a1f` and `#e8c170` on cream or white cause most of the contrast failures across 9 pages. Add `--gold-ink: #8a6418` for light surfaces.
3. **Share images.** Only home has an `og:image`. Add a branded image template for plans, guides and tools.
4. **Proof beyond counts.** "26 modules / 1,480 terms / 56 guides" proves size, not quality. When you have them, add 2–3 real learner quotes (with consent), a named clinical reviewer, and a "used by students at…" line. Don't use the fictional Evinca people for this.
5. **Layout shift** on four app entry screens (MedLex 0.26, Serein 0.30, Gulf studio 0.98, Green Belt 1.25). Reserve space for late-loading heroes and dialogs.

---

## 6. Re-check of the 25 October findings

| ID | Then | Now (live, 31 Oct) |
|---|---|---|
| HCA-01 `snle.` host | Unconfirmed | **Fixed.** Live, serving the studio |
| HCA-02 `lss.` seller | Unknown | **Fixed.** `/legal` names the company |
| HCA-08 Lumen Academy AI vs privacy | Open | **Fixed.** Academy AI removed; own keys only |
| HCA-17 Naming | Partly | **Still open** at app level (studio says "SNLE"); footer omits Gulf and Green Belt |
| HCA-19 Serein modal | Fixed | **Confirmed fixed** |
| HCA-21 MedLex CLS | Open | **Still open** (0.259) |
| HCA-22 Lumen 1 MB HTML | Open | **Still open** (972 KB) |
| HCA-28 Canvas contrast | Fixed | **Confirmed.** 0 axe issues on MedLex screens |
| HCA-29 MedLex two h1s | Open | **Fixed** on My Day; Learn now has none |
| HCA-35 Serein UK-only crisis lines | Open | **Still open** |
| HCA-37 `hello@` mailbox | Unverified | Replaced by a personal Gmail; see **B2** |
| HCA-24 Vercel Hobby plan | Needs you | **More urgent if still on Hobby** (not verifiable from here). Payments are now live; Hobby is for non-commercial use |

---

## 7. Action plan

**Before you promote (about 1–2 days of work)**
1. B1: align the home pricing with live checkout; email existing reservers.
2. B2: set up `hello@`/`support@` and replace the Gmail address everywhere.
3. B3: fix MedLex Learn on phones.
4. B5: put prices, counts and names in one data file; fix the Gulf Pass options, free-tier lists and footer app list.
5. Confirm Vercel is on Pro (Hobby is non-commercial only).
6. Remove `/preview/crown`.
7. Turn off Cloudflare Web Analytics on `snle.`.

**First two weeks after launch**
1. B4: About page, named clinical reviewers, and "written by / reviewed by / last checked" on guides.
2. A shared slim header on all secondary pages.
3. A darker gold for light backgrounds; fix the plans-page button contrast.
4. Lumen: close tool windows on navigation, move the tour pill, UK/SI defaults, a source on lab values.
5. Paywall: show the lesson preview and price.
6. Share images for plans, guides and tools.
7. Rename the Gulf studio's in-app brand to match the marketing.

**Next month**
1. Layout shift on MedLex, Serein, the Gulf studio and the Green Belt; Lumen and Green Belt page size.
2. Pin or self-host the Green Belt's CDN scripts.
3. Phone home page: sticky picker summary, shorter app sections.
4. Gulf crisis lines in Serein.
5. Expand the study guides to 600+ words.

---

## 8. What to protect

These are the things competitors rarely get right. Keep them as you change things:
- the verifiable trust strip;
- the "Before you pay" consent step;
- plain-English refunds;
- Serein's tone;
- Carecraft's honesty labels;
- zero trackers;
- one calm design language across five apps.

---

## 9. Fix status (31 October 2026, same day)

| Item | Status |
|---|---|
| B1 Home said "plans open soon" while checkout is live | **Fixed.** "Pricing" heading; Crown Pass button is "Start 7-day free trial" → `/subscribe?plan=crown`; reserve form removed; founding line says "join yearly"; FAQ and footer copy updated |
| B2 Personal Gmail as contact | **Fixed and live.** `hello@healthcarecrownacademy.co.uk` via Cloudflare Email Routing; Green Belt and Evinca repos still to switch |
| B3 MedLex Learn clipped on phones | **Fixed.** Phone layout for the Canvas library (source and published copy) |
| B5 Facts differing between pages | **Mostly fixed.** Gulf section lists US$29 / 50 / 69; free MedLex content is "starter modules" everywhere; free list includes 10 Gulf questions; footer lists Gulf Region Nursing and Green Belt. Gulf app's own "SNLE" naming and the old hero screenshot are not changed (separate Cloudflare deploy; new screenshot needed) |
| Secondary pages had no navigation | **Fixed.** Apps · Guides · Plans on all 28 secondary pages |
| Gold and button contrast | **Fixed.** Home "grow", Green Belt chip, guide tags and day labels, plans Gulf button and badges; axe now 0 on every changed page |
| Account avatar "." | **Fixed.** Person icon until signed in |
| Privacy/refunds tables not keyboard-scrollable | **Fixed** |
| No share images | **Fixed.** Brand share image on 27 public pages |
| Gulf guides had no date | **Fixed.** "By Healthcare Crown Academy · Last updated 30 October 2026" from the existing data |
| MedLex paywall gave no lesson name or price | **Fixed.** Names the lesson and shows the Crown Pass price |
| Lumen "Quick tour" pill covered content on phones | **Fixed.** Compact round button on phones |
| `/preview/crown` | **Left in place.** Another session is actively building it; it is `noindex` and blocked in `robots.txt` |

**Still needs you:** About page and named clinical reviewers (B4, real names needed); confirm the Vercel plan; turn off Cloudflare Web Analytics on `snle.`; Gulf crisis numbers for Serein; contact address in the Green Belt and Evinca repos.
**Still to build (larger app changes):** Lumen tool windows closing on navigation and UK/SI defaults; MedLex "HP" chip and Learn heading; layout shift on MedLex, Serein, Gulf studio and Green Belt; Green Belt CDN pinning and page size; Gulf studio accessibility fixes.
