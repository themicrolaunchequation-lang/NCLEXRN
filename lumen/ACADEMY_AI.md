# Academy AI: AI for every member, with no keys

**Status (16 Oct 2026): live on the evinca project.** Function `lumen-ai` is deployed and the tables `lumen_ai_usage` and `lumen_ai_cache` exist, with row-level security on. The functions `lumen_ai_take` and `lumen_ai_refund` can be run only by the server. Provider: OpenRouter, `openai/gpt-oss-120b`. The optional `lumen_ai_cleanup` function was not created because Supabase timed out; it is housekeeping only, and old rows can be deleted by hand.

*Written 16 October 2026 for 500 or more subscribers. Prices are as reported in October 2026; check each provider's pricing page before you rely on them.*

## The choice, in short

| Option | Works for 500+ members? | Why |
|---|---|---|
| **Academy AI** (built in v6) | **Yes. Recommended.** | Members sign in with their Evinca account and nothing else. The Academy pays a small, capped bill (about $35–50 a month for 500 members). Quality is the same for everyone. |
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
      4. asks OpenAI GPT-6 Luna (paid); if busy, asks Groq gpt-oss-20b (paid)
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

## Which key to buy (cheapest that does the job)

Lumen's AI work is text only: turn one page (up to 8,000 characters) into a summary or 5–10 exam-style questions as strict JSON, each quoting the page. OCR runs on the device and needs no AI. That is about **3,500 tokens in and 2,500 out per request**. Lumen also checks every question's quote against the page, so a mid-priced model is enough; you do not need a flagship.

Prices below are third-party reports from Sept–Oct 2026. The official pricing pages could not be reached from here, so confirm them when you sign up.

| Model (company, where it runs) | Price per million tokens (in / out) | Per request | 500 members, typical (30,000 a month) | At the 3,000-a-day ceiling | Verdict |
|---|---|---|---|---|---|
| **GPT-6 Luna** (OpenAI, US) | $0.10 / $0.50 | ~$0.0016 | **~$48** | ~$145 | **Buy this one.** Lowest price from a major lab. Reliable JSON, no training on API data, fine for UK users. |
| **gpt-oss-20b on Groq** (Groq, US) | $0.075 / $0.30 | ~$0.0011 | ~$33 | ~$100 | **Backup.** Cheapest and very fast, but weaker at tricky question types. Turn on Zero Data Retention. |
| Mistral Small 4 (Mistral, EU) | ~$0.15 / $0.60 | ~$0.0020 | ~$61 | ~$180 | Good choice if you want EU-only processing. |
| Gemini 3.1 Flash-Lite (Google) | $0.25 / $1.50 | ~$0.0046 | ~$140 | ~$415 | About 3× the cost. The cheaper Gemini 2.5 Flash-Lite is deprecated, and new projects may not get it. |
| Claude Haiku 4.5 (Anthropic) | $1 / $5 | ~$0.016 | ~$480 | ~$1,440 | Highest quality of these, about 10× the cost. Not needed for this task. |
| DeepSeek | ~$0.14–0.30 / ~$0.28–0.50 | ~$0.001 | ~$30 | ~$90 | **Not advised.** Data is stored in China, with training on by default and no zero-retention option. That is a poor fit for a UK health academy under GDPR. |

**Recommendation:** for the lowest cost, see "Cheaper than buying direct?" below: an **OpenRouter** key with gpt-oss-120b (about $19 a month). Otherwise buy an **OpenAI** key as the main one and a **Groq** key as the backup. Expect about **$35–50 a month** for 500 members, with a hard limit of about $145 a month from the default ceiling.
- **Repeats are free.** Requests already in the shared store cost nothing.
- **More members:** for about 1,000 members, double `LUMEN_AI_ACADEMY_DAILY`.
- **Hidden reasoning:** if GPT-6 Luna turns out to be a reasoning model, its hidden reasoning is billed as output. Set `OPENAI_REASONING_EFFORT=low` (or `minimal`) to keep requests near the figures above, and watch the first week's usage page.

## Cheaper than buying direct?

**Yes, legitimately, in three ways:**

1. **Buy an open model from a low-cost host (the biggest saving).** OpenAI's open-weight gpt-oss models are sold by many hosts at different prices. They are reached through **OpenRouter**: one key, and it routes to a low-cost host such as DeepInfra.

   | Model via OpenRouter | Price per million tokens (in / out, lowest host reported) | Per request | 500 members, typical month | At the ceiling |
   |---|---|---|---|---|
   | gpt-oss-120b | ~$0.04 / $0.17 | ~$0.0006 | **~$19** | ~$58 |
   | gpt-oss-20b | ~$0.02 / $0.09 | ~$0.0003 | ~$10 | ~$30 |

   gpt-oss-120b is a stronger model than Groq's 20b, at about 40% of GPT-6 Luna's price. Lumen's function already supports it, with no code change. Set `OPENROUTER_API_KEY`, `OPENROUTER_MODEL=openai/gpt-oss-120b` and `LUMEN_AI_PROVIDERS=openrouter,openai`; the function asks for low reasoning effort. In OpenRouter → **Settings → Privacy**, allow only providers that do not train on or keep prompts. OpenRouter adds a small fee when you buy credits.
2. **Discounts from the same company.**
   - Prompt caching: the repeated instructions in each request are billed at a fraction of the price automatically.
   - Batch processing: about 50% off when results can wait hours, for example building an Academy question bank overnight.
   - Lumen's shared answer store: repeats cost nothing.
3. **Free credits for a new company.**
   - **Microsoft for Startups:** Azure credits that can pay for Azure OpenAI. No investor is needed to apply.
   - **Google for Startups Cloud:** credits for Gemini. Large tiers need an investor or accelerator.
   - **AWS Activate Founders:** a few thousand dollars, usable on Amazon Bedrock, which also hosts gpt-oss.

   Any of these could cover a year or more at this scale. Using them needs a small code change for that provider's address.

**Avoid "cheap key" shops.** These are discount resellers, relay sites, and keys sold on Telegram or marketplaces. A July 2026 investigation found they typically resell abused free trials, leaked keys, or capacity bought with stolen cards. Reselling breaks the providers' terms, so access can stop overnight and take your prepaid balance with it. Every member's text would also pass through an unknown middleman, which is not acceptable for a UK health academy under GDPR.

## What you need to do (about 20 minutes)

I can deploy the function and the database tables once you say yes. Steps 1–3 need you, because they create accounts in the Academy's name and add billing.

1. **OpenAI key (main).** Go to [platform.openai.com](https://platform.openai.com):
   - Create an organisation for the Academy.
   - **Billing:** add $20–50 of prepaid credit and turn off auto-recharge, or set a low top-up. The credit balance is then a hard spending cap.
   - **Limits:** set a monthly budget.
   - **API keys:** create a project key, restricted to the Chat Completions endpoint if offered.
   - **Data controls:** keep "share data to improve models" **off**.
2. **Groq key (backup).** Go to [console.groq.com/keys](https://console.groq.com/keys) and create a key. Under **Settings → Billing**, move to the Developer plan with a spending limit (for example $10). In **Data Controls**, turn on Zero Data Retention.
3. **Add the secrets in Supabase.** Open the evinca project → **Edge Functions → Secrets** and add `OPENAI_API_KEY` and `GROQ_API_KEY`. Paste them there yourself; do not send keys in chat. Optional settings: `LUMEN_AI_DAILY`, `LUMEN_AI_ACADEMY_DAILY`, `OPENAI_REASONING_EFFORT`, and `OPENAI_MODEL` if the model name differs. Gemini is optional (`GEMINI_API_KEY`, paid project only).
4. **Deploy (I do this when you approve):**
   - Apply `supabase/migrations/20261016120000_lumen_ai.sql`. This adds the tables `lumen_ai_usage` and `lumen_ai_cache` and the functions `lumen_ai_take`, `lumen_ai_refund` and `lumen_ai_cleanup`. Row-level security is on, and only the server can write.
   - Deploy `supabase/functions/lumen-ai` (`index.ts` and `handler.mjs`) with JWT checking off at the gateway. The function checks the sign-in itself.
5. **Test:** open Lumen → Ctrl K → "AI providers" → Academy AI → sign in → **Check allowance**. Then make questions from any page. After a day, compare OpenAI's usage page with the figures above.

Evinca's sign-in page must accept the email and password a member types into Lumen. It already uses email and password, so nothing changes there.

## Privacy notes for your policies

- **Who processes the text:** OpenAI and Groq (and Google if you add Gemini), on the Academy's API accounts. API data is not used for training by default. Providers keep it for a limited time to detect abuse; with Zero Data Retention on, Groq keeps nothing.
- **What learners must not send:** patient-identifiable information. Lumen asks for this confirmation before anything is sent.
- **What the Academy stores:** a daily request count per member, and generated answers (with no member id) for up to 30 days.
- **Policy text:** add the providers as sub-processors in the Evinca privacy policy before switching this on. Also check that each provider's data-processing terms cover UK GDPR transfers.

## Sources
- Google [Gemini API Additional Terms](https://ai.google.dev/gemini-api/terms) (paid services only for apps offered to UK, EEA and Swiss users) and [pricing](https://ai.google.dev/gemini-api/docs/pricing)
- GPT-6 Luna: [eesel](https://www.eesel.ai/blog/gpt-6-luna-pricing), [AnotherWrapper](https://anotherwrapper.com/llm-pricing/gpt-6-luna)
- Gemini: [Morph](https://www.morphllm.com/gemini-api-pricing), [2.5 Flash-Lite retirement (distil labs)](https://www.distillabs.ai/blog/gemini-2-5-flash-lite-retires-on-a-date-you-dont-pick/), [3.1 vs 2.5 Flash-Lite](https://www.aifreeapi.com/en/posts/gemini-3-1-flash-lite-vs-gemini-2-5-flash-lite), [Firebase model list](https://firebase.google.com/docs/ai-logic/models)
- Mistral: [CloudZero](https://www.cloudzero.com/blog/mistral-api-pricing)
- Claude Haiku 4.5: [AnotherWrapper](https://anotherwrapper.com/llm-pricing/claude-haiku-4-5-20251001)
- DeepSeek data location: [Deepak Gupta model catalog](https://guptadeepak.com/ai-models/deepseek/deepseek-v4-pro/)
- gpt-oss hosts: [AnotherWrapper](https://anotherwrapper.com/tools/llm-pricing/gpt-oss-120b/gpt-oss-20b), [ComputePrices](https://computeprices.com/api-pricing/gpt-oss), [PricePerToken](https://pricepertoken.com/pricing-page/model/openai-gpt-oss-120b)
- Startup credits: [Causo comparison](https://hub.causo.ai/startup-cloud-credits-compared-2026), [Deepak Gupta](https://guptadeepak.com/aws-activate-vs-microsoft-for-startups-vs-google-for-startups-2026-who-each-one-is-actually-for/)
- Key-reseller risks: [Simon Willison on the relay market](https://simonwillison.net/2026/Jul/26/relay-market), [Developers Digest](https://www.developersdigest.tech/blog/ai-token-relay-market-fraud-hn-analysis)
- Price roundups: [BenchLM](https://benchlm.ai/llm-pricing), [Morph LLM APIs](https://www.morphllm.com/llm-api)
- Groq prices: [Morph (Oct 2026)](https://www.morphllm.com/groq-pricing), [eesel](https://eesel.ai/blog/groq-pricing), [Groq docs: your data](https://console.groq.com/docs/your-data)
- Puter user-pays model: [docs.puter.com](https://docs.puter.com/user-pays-model/)
