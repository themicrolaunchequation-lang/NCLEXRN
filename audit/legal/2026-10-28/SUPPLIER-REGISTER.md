# Supplier register (processors and other recipients)

HEALTHCARE CROWN ACADEMY LTD · prepared 28 October 2026 · **draft for the owner to verify**. Nothing here has been accepted, signed or changed in any account. "To confirm" means the owner must check the live account and keep evidence.

For each supplier, keep in one folder: the agreement (PDF of the version in force), how and when it was accepted (usually by accepting the main terms when the account was opened), the sub-processor list, the transfer mechanism, and a short transfer risk note.

| Supplier | What it does for us | Personal data | Our role / theirs | Data location | How the DPA applies | Transfer route to check | Evidence to keep |
|---|---|---|---|---|---|---|---|
| **Supabase** | Database, sign-in, server functions (Academy, Gulf, Evinca: London; Green Belt: Frankfurt) | Accounts, profiles, progress, plans and payment records, Evinca applications | Controller / processor | UK (eu-west-2) and Germany (eu-central-1) for the databases; support and some sub-processors elsewhere (to confirm) | DPA is incorporated into the Supabase terms (per the supplier) | Sub-processors outside the UK; UK–US data bridge or IDTA/Addendum per sub-processor (to confirm) | DPA version and date; organisation plan; sub-processor list |
| **Stripe** | Payments, subscriptions, refunds, receipts | Name, email, billing address, card data (held by Stripe), payments, consent metadata | Controller / processor for payments; Stripe is an independent controller for fraud and legal duties | UK, EU and US | Stripe DPA incorporated into the Stripe Services Agreement (per the supplier) | Stripe's transfer terms (to confirm current mechanism) | Account country and entity contracted with (to confirm); DPA version |
| **Resend** | Order confirmations and cancellation emails | Email address, order details, cancellation details | Controller / processor | Sending region Ireland (eu-west-1); company in the US | DPA incorporated into Resend's terms (per the supplier) | US access: data bridge certification or SCCs/IDTA (to confirm) | Region setting screenshot (Ireland, tracking off); DPA version |
| **Vercel** | Hosting the main site and Evinca | IP addresses and request logs | Controller / processor | Global edge network; US company | Vercel DPA (to confirm whether incorporated or needs acceptance) | To confirm | DPA PDF, plan, log retention |
| **Cloudflare** | DNS; hosting of the Gulf studio (Pages) | IP addresses and request logs | Controller / processor | Global network; US company | Cloudflare Customer DPA (to confirm how accepted on your plan) | To confirm | DPA PDF; plan |
| **Netlify** | Hosting the Green Belt toolkit (to confirm still used) | IP addresses and request logs | Controller / processor | US company | To confirm | To confirm | DPA PDF or account terms |
| **Google Fonts, cdnjs, jsDelivr** (Green Belt page) | Fonts and code libraries loaded by the visitor's browser | IP address, browser details | To assess (often independent recipients) | US/global | Usually none | To assess; consider self-hosting these files | Note of decision |
| **GitHub** | Stores source code only | None about customers (to confirm no customer data in repositories) | — | — | Not needed if no personal data | — | Note |
| ~~OpenAI, Groq, Google Gemini~~ | Academy AI, **switched off 28 Oct 2026** | None now; stored AI data deleted 28 Oct | — | — | Not needed while AI stays off | — | Record of switch-off date |

## What the owner must do
1. For each row, download the agreement version in force and note how it was accepted. Separate signatures are usually not needed where the DPA is incorporated into the account terms, but **keep evidence** of the version and acceptance.
2. Confirm the legal entity you contracted with for each (for example the Stripe entity for a UK account).
3. Confirm the international transfer mechanism for each supplier with data leaving the UK, and keep a short transfer risk note.
4. Re-check this register whenever a supplier is added (for example a phone or helpdesk service).
