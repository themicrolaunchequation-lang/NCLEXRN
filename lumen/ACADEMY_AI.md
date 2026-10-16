# Academy AI: AI for every member, with no keys

*Written 16 October 2026 for 500 or more subscribers. Prices are as reported in October 2026; check each provider's pricing page before you rely on them.*

## The choice, in short

| Option | Works for 500+ members? | Why |
|---|---|---|
| **Academy AI** (built in v6) | **Yes. Recommended.** | Members sign in with their Evinca account and nothing else. The Academy pays a small, capped bill. Quality is the same for everyone. |
| Each member brings their own free key (v5) | Only for keen members | Most learners will not create a developer account. It stays in Lumen as an extra after Academy AI. |
| One shared *free* key built into the app | No | A key in the file is public. Free limits are per account, so a shared key runs out after a few dozen members a day. Google's terms also say an app offered to users in the UK, EEA or Switzerland may use only **paid** Gemini services. |
| Puter.js ("user pays") | No | Every member must open a second account with another company. It loads a third-party script into a health-study app. Usage and cost are outside your control. |
| On-device AI (browser AI, WebLLM) | As a backup only | It is free and private, but needs a recent desktop computer and makes simpler questions. Lumen already falls back to it. |

## How Academy AI works

```
Lumen (member signs in with Evinca email + password)
  → Supabase Edge Function "lumen-ai" on the evinca project
      1. checks the sign-in and the member's Evinca level (platform_level())
      2. returns a stored answer if any member already sent the identical request (free)
      3. takes 1 request from the member's daily allowance and from the Academy's daily ceiling
      4. asks Gemini 2.5 Flash-Lite (paid); if busy, asks Groq gpt-oss-20b (paid)
      5. if neither answers, the request is given back
  ← questions or summary
Lumen still checks every question against the page before showing it.
```

- **The keys live only in Supabase secrets.** They are never in the Lumen file or in anyone's browser.
- **No prompt text is logged.** Usage rows hold only member id, date and a count.
- **Fallback is unchanged.** Academy AI comes first, then any key the member added, then browser AI, then local AI, then source tools (no AI).

### Daily limits (you choose them)

| Setting | Default | Meaning |
|---|---|---|
| `LUMEN_AI_DAILY` | `1:15,2:30,3:60` | Requests per member per day by Evinca level (Starter 15, Practice 30, Professional and admins 60). Level 0 (no application yet) gets none. |
| `LUMEN_AI_ACADEMY_DAILY` | `3000` | All members together, per day. **This is your hard spending limit.** |

## What it costs

One request turns a page (up to 8,000 characters) into a summary or 5–10 questions. That is about **3,500 tokens in and 2,500 out**.

| Model | Price per million tokens (in / out) | Per request |
|---|---|---|
| Gemini 2.5 Flash-Lite (main) | $0.10 / $0.40 | about $0.0014 |
| Groq gpt-oss-20b (backup) | $0.075 / $0.30 | about $0.001 |

| 500 members | Requests a day | Cost a month |
|---|---|---|
| Typical: 40% use AI on a day, 5 requests each | 1,000 | **about $40 (about £30)** |
| Busy exam season: 60% use it, 8 each | 2,400 | about $100 |
| Worst case: the 3,000-a-day ceiling is hit every day | 3,000 | **at most about $125** |

The shared store lowers these numbers: when many members study the same Academy material, repeated requests cost nothing. Double the ceiling for about 1,000 members.

## What you need to do (about 20 minutes)

I can deploy the function and the database tables once you say yes. Steps 1–3 need you, because they create accounts in the Academy's name and add billing.

1. **Gemini key on a paid project.** Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and create a key. Under **Billing**, link a Cloud Billing account, so the project is on the paid tier. In Google Cloud → Billing → **Budgets & alerts**, set a monthly budget (for example £50) with email alerts.
2. **Groq key.** Go to [console.groq.com/keys](https://console.groq.com/keys) and create a key. Under **Settings → Billing**, move to the Developer plan with a spending limit (for example $20). In **Data Controls**, turn on Zero Data Retention.
3. **Add the secrets in Supabase.** Open the evinca project → **Edge Functions → Secrets** and add `GEMINI_API_KEY` and `GROQ_API_KEY`. You can also set `LUMEN_AI_DAILY` and `LUMEN_AI_ACADEMY_DAILY` there. Paste the keys there yourself; do not send them in chat.
4. **Deploy (I do this when you approve):**
   - Apply `supabase/migrations/20261016120000_lumen_ai.sql`. This adds the tables `lumen_ai_usage` and `lumen_ai_cache` and the functions `lumen_ai_take`, `lumen_ai_refund` and `lumen_ai_cleanup`. Row-level security is on, and only the server can write.
   - Deploy `supabase/functions/lumen-ai` (`index.ts` and `handler.mjs`) with JWT checking off at the gateway. The function checks the sign-in itself, which keeps it working with Supabase's newer signing keys.
5. **Test:** open Lumen → Ctrl K → "AI providers" → Academy AI → sign in → **Check allowance**. Then make questions from any page.

Evinca's sign-in page must accept the email and password a member types into Lumen. It already uses email and password, so nothing changes there.

## Privacy notes for your policies

- **Who processes the text:** Google (Gemini API, paid tier) and Groq, on the Academy's accounts. On paid Gemini, Google does not use prompts to improve its products. It keeps them for a limited time to detect abuse. With Zero Data Retention on, Groq keeps nothing.
- **What learners must not send:** patient-identifiable information. Lumen asks for this confirmation before anything is sent.
- **What the Academy stores:** a daily request count per member, and generated answers (with no member id) for up to 30 days.
- **Policy text:** add Google and Groq as sub-processors in the Evinca privacy policy before switching this on.

## Sources
- Google [Gemini API Additional Terms](https://ai.google.dev/gemini-api/terms) (paid services only for apps offered to UK, EEA and Swiss users) and [pricing](https://ai.google.dev/gemini-api/docs/pricing)
- Gemini 2.5 Flash-Lite price: [Morph](https://www.morphllm.com/gemini-api-pricing), [AnotherWrapper](https://anotherwrapper.com/tools/llm-pricing/gemini-2.5-flash-lite)
- Groq prices: [Morph (Oct 2026)](https://www.morphllm.com/groq-pricing), [eesel](https://eesel.ai/blog/groq-pricing), [Groq docs: your data](https://console.groq.com/docs/your-data)
- Puter user-pays model: [docs.puter.com](https://docs.puter.com/user-pays-model/)
