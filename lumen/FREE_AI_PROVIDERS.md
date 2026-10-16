# Free AI providers for Lumen

*Researched 16 October 2026. Free tiers change often. Check each provider's console before relying on a number.*

**For the Academy's 500+ members, the main route is now Academy AI** (`ACADEMY_AI.md`): members sign in with Evinca and use the Academy's paid, capped service with no key. The free providers below stay available as an extra for members who want more, and as a fallback.

Lumen never ships with a shared API key. A key built into the app would be visible to everyone, would be used up within a day, and would break the providers' terms. Instead, each learner can add **their own free key** under **AI providers and keys** (Ctrl K → "AI providers"). Lumen then tries the keys in the learner's order and moves on when one runs out:

**Academy AI (members) → your keys, in your order → Browser AI (on-device) → Free local AI (WebLLM, if downloaded) → Source tools (no AI)**

So studying never stops because of a quota. The last step always works offline.

## Providers built into Lumen

| Provider | Cost to the learner | Free limits (as reported, Oct 2026) | Privacy notes | Get a key |
|---|---|---|---|---|
| **Google Gemini** | Free tier | Flash models only on the free tier. Reported figures range from about 250 to 1,500 requests a day and about 10–15 a minute, per model. AI Studio shows your exact limits. | **On the free tier, Google may have people review prompts and use them to improve its products.** Never send patient information. | aistudio.google.com/apikey |
| **Groq** | Free plan | About 30 requests a minute. Daily caps depend on the model: about 14,400 a day on small models and about 1,000 a day on 70B models. Limits are per organisation, not per key. | Groq says it does not keep inference data by default. Zero Data Retention can be switched on in Data Controls. | console.groq.com/keys |
| **OpenRouter** (`:free` models) | Free | 20 requests a minute. 50 a day, or 1,000 a day after a one-time purchase of $10 of credit. Failed requests count too. | Prompts are not logged by default. In privacy settings, turn off providers that may train on your data. | openrouter.ai/keys |
| **Cerebras** | Trial | Reported as about 1M tokens a day at 5 requests a minute. Recent reports say a payment method is needed and $5 of credit expires after 30 days. | — | cloud.cerebras.ai |
| **Mistral** | Free plan (changed in 2026) | Mistral no longer publishes exact free limits. Older guides quote 1B tokens a month, which is now likely out of date. | On the free plan, inputs may be used for training unless you opt out in Privacy settings. | console.mistral.ai/api-keys |
| **SambaNova** | Free tier | Reported as about 20 requests a minute and 200K tokens a day, with no card needed. | — | cloud.sambanova.ai |
| **Cohere** | Trial key | 1,000 calls a month and 20 a minute. Not for commercial use. | — | dashboard.cohere.com/api-keys |
| **NVIDIA NIM** | Free for prototyping | About 40 requests a minute. | **Browser access is not confirmed.** If "Test connection" fails, use another provider. | build.nvidia.com |
| **Hugging Face** | Small credit | $0.10 of credit a month on free accounts. | — | huggingface.co/settings/tokens |
| **OpenAI**, **Anthropic Claude**, **DeepSeek** | Paid | Billed per use. | Paid usage is generally not used for training; check each provider's terms. | Each provider's console |
| **Your own server** (Ollama, LM Studio) | Free, on your computer | No limit beyond your hardware. | Nothing leaves your computer. The server must allow browser requests: for Ollama, set `OLLAMA_ORIGINS=*`. | ollama.com |

Not included:
- **GitHub Models** was reportedly retired on 30 July 2026.
- **Cloudflare Workers AI** still gives 10,000 "Neurons" a day free, roughly 100–200 answers. Its API needs an account ID and is meant to be called from a server, not from a web page.

## How the fallback works
- **Order:** providers are tried in the order shown in the dialog. Reorder them with the arrows.
- **Rate limit (HTTP 429):** Lumen reads the provider's retry hint, or the "per minute" / "per day" wording, and rests that provider:
  - about a minute for a per-minute limit
  - several hours for a daily limit

  Then it tries the next provider.
- **Rejected key (401/403):** the provider rests for a day, and the dialog says the key was refused.
- **Unknown model:** the dialog suggests **Load models**, which asks the provider for its current list. OpenRouter's list is filtered to free models.
- **Server error or no connection:** the provider rests for a few minutes.
- **Visible record:** each request lists what happened with every provider, under "What happened with each provider".
- **Last resort:** if no provider answers, Lumen uses browser AI or the local model when available, otherwise Source tools. The result shows which engine made it.

## Safety rules built in
- **Keys are stored apart from the workspace.** They never appear in backups, exports or the study pack.
- **Keys are stored in this browser only.** The learner can choose "this session only", and **Remove all keys** wipes them.
- **Each key goes only to its own provider.**
- **Nothing is sent automatically.** The learner sees how much text will be sent and to whom, and must confirm that it contains **no patient-identifiable information** (asked once per browser session).
- **AI questions must quote the page.** Every AI question must include a sentence copied from the page. Lumen checks that the sentence is really there and leaves out any draft it cannot match.
- **Drafts are not saved automatically.** The learner reviews them, ticks "I checked these drafts", then saves them to the question bank.

## Question types Lumen can generate and play

| Type | How it is scored |
|---|---|
| Multiple choice (single best answer) | 0/1 |
| Select all that apply | +/− per option, never below 0 |
| True or false | 0/1 |
| Matrix (one choice per row) | 0/1 per row |
| Matrix multiple response | 0/1 per row (every correct box, no extras) |
| Bow-tie (condition, 2 actions, 2 parameters) | 0/1 per correct pick |
| Highlight (findings in a note) | +/− per finding |
| Drop-down cloze | 0/1 per blank |
| Drag and drop (word bank into blanks) | 0/1 per blank |
| Ordered response | 0/1 (all in order) |
| Calculation (with unit and tolerance) | 0/1 |
| Short answer | Learner compares with a model answer and marks themselves |
| Case study (six clinical-judgement steps, with exhibit tabs such as nurses' notes and vital signs) | Each step scored by its own type |
| Flashcards | Saved as recall cards for spaced review |

Scoring approximates the published NGN partial-credit rules for practice. It is not a prediction of exam results.

## Sources
Mostly third-party roundups, many written by vendors. Treat their figures as reported, not official.
- Gemini: [DEV cheatsheet](https://dev.to/hiyoyok/gemini-api-cheatsheet-2026-free-tier-limits-models-and-endpoints-in-one-place-2god), [AI Prompt Generator Hub](https://aipromptshub.co/blog/gemini-api-free-tier-rate-limits), [PE Collective](https://pecollective.com/tools/gemini-free-tier-guide/), [TokenMix](https://tokenmix.ai/blog/gemini-api-free-tier-limits), [Gemini API terms (preview)](https://ai.google.dev/gemini-api/terms_preview), [terms archive](https://ai.google.dev/gemini-api/terms-archive/terms_11_20_25), [forum: CORS on the OpenAI-compatible endpoint](https://discuss.ai.google.dev/t/gemini-api-cors-error-with-openai-compatability/58619)
- Groq: [Groq docs: your data](https://console.groq.com/docs/your-data), [BenchLM](https://benchlm.ai/free-tier/groq), [TokenMix](https://tokenmix.ai/blog/groq-free-tier-limits-2026), [Klymentiev](https://klymentiev.com/blog/groq-api-free-tier)
- OpenRouter: [OpenRouter help: rate limits](https://openrouter.zendesk.com/hc/en-us/articles/39501163636379-OpenRouter-Rate-Limits-What-You-Need-to-Know), [OpenRouter: free LLM APIs compared](https://openrouter.ai/blog/tutorials/free-llm-apis-compared/), [OpenRouter support](https://openrouter.ai/support), [TrueFoundry](https://www.truefoundry.com/blog/openrouter-rate-limits-your-free-tier-depends-on-what-youve-already-paid)
- Mistral: [AI Free API](https://www.aifreeapi.com/en/posts/mistral-api-free-tier), [AgentDeals](https://agentdeals.dev/vendor/mistral-ai), [Spheron](https://www.spheron.network/blog/mistral-api-pricing-vs-self-hosted-llms-cost-privacy-2026/)
- Cerebras: [ToolFreebie](https://toolfreebie.com/cerebras-free-api/), [BenchLM](https://benchlm.ai/free-tier/cerebras)
- GitHub Models retirement: [agentdeals issue #1672](https://github.com/robhunter/agentdeals/issues/1672), [Eden AI](https://www.edenai.co/post/top-free-llm-tools-apis-and-open-source-models)
- Cloudflare: [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- Hugging Face: [Inference Providers pricing](https://huggingface.co/docs/inference-providers/pricing)
- Cohere: [rate limits](https://docs.cohere.com/docs/rate-limits), [going live](https://docs.cohere.com/docs/going-live)
- NVIDIA: [NVIDIA forum](https://forums.developer.nvidia.com/t/is-nim-free/369368), [freellm.net](https://freellm.net/providers/nvidia-nim)
- SambaNova: [CostBench](https://www.costbench.com/software/llm-api-providers/sambanova-cloud/), [freellm.net](https://freellm.net/providers/sambanova)
- Browser (CORS) support: [LLM API Check provider guide](https://llmapicheck.dev/docs/providers)
- Chrome built-in AI: [Prompt API](https://developer.chrome.com/docs/ai/prompt-api), [Summarizer API](https://developer.chrome.com/docs/ai/summarizer-api)

**Not tested from here:** this build environment could not reach the providers' own sites. Connections were tested with simulated providers: a quota error, a server error and success. The **Test connection** button checks a real key in seconds.
