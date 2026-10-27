# DPIA screening: Academy AI in Lumen

Controller: HEALTHCARE CROWN ACADEMY LTD (17501904, ICO ZC273259) · Prepared: 27 October 2026 · Owner to review and sign · Review again before any change to providers, caching or audience.

## 1. What the processing is
Signed-in Lumen users who have an Evinca membership level may select a passage of their own study notes and ask Academy AI to make recall cards or explain it. The passage, Lumen's instructions and the request go from the browser to our Supabase Edge Function `lumen-ai` (London, eu-west-2), which forwards them to OpenAI, then Groq if OpenAI fails (Gemini only if a paid Google project is confirmed with `LUMEN_AI_GEMINI_PAID=true`). The answer returns to the user. Structured (JSON) answers are cached for 30 days in `lumen_ai_cache` under a key that includes the user id, so only the same person can reuse them. A per-user daily request count is kept in `lumen_ai_usage` (90 days). Prompt text is not written to logs. No name or email is sent to the AI providers.

## 2. Screening questions (ICO list of likely high-risk processing)
| Question | Answer |
|---|---|
| Innovative technology (AI)? | Yes: large language models. |
| Special category data (health)? | Not intended. Users study health topics; notes may mention conditions in general. Risk: a user pastes patient-identifiable or their own health information despite instructions. |
| Vulnerable people or children? | Accounts from 16, so some users are 16–17. |
| Large scale? | No: capped at 15–60 requests per user per day and 3,000 per day in total. |
| Profiling or automated decisions with significant effects? | No. |
| Invisible processing or data matching? | No: user-initiated, disclosed in the privacy notice and in Lumen settings. |
| International transfers? | Yes: AI providers in the United States. |
| Systematic monitoring? | No. |

**Screening result:** two triggers (innovative technology and possible health data with some under-18 users) mean a full DPIA is advisable before marketing Academy AI widely. The measures below already reduce the risk; record the decision below.

## 3. Risks and measures
| Risk | Likelihood / severity before | Measures in place | Residual |
|---|---|---|---|
| Patient-identifiable data sent to AI | Possible / high | Clear warnings in Lumen, privacy notice and terms; user-selected passages only; size limit 30,000 characters; no identity sent to provider | Low–medium. **Add:** a simple client-side check that warns before sending text containing NHS numbers, dates of birth or "Mr/Mrs + surname" patterns. |
| Cross-user leakage via cache | Was possible / medium | Fixed 27 Oct 2026: cache key includes user id; old shared cache cleared | Low |
| Provider training on data | Possible / medium | OpenAI and Groq APIs do not train on API data by default; Gemini excluded unless paid tier confirmed | Low |
| Over-retention | Possible / low | 30-day cache and 90-day counts enforced by `hca_retention_cleanup` (pg_cron, running daily since 27 Oct 2026) | Low |
| Transfer to US | Certain / medium | Provider DPAs with UK transfer mechanism (UK–US data bridge or IDTA/Addendum); transfer risk assessment to file | Low–medium |
| Inaccurate AI answers relied on clinically | Possible / medium | "AI answers can be wrong; check against course materials"; terms say apps are not for decisions about patients | Low |
| Under-18 users | Likely / low | No marketing by default, no profiling, data minimised, same protections for all | Low |

## 4. Lawful basis
Contract (providing the Academy AI feature the user asks for). Health data is not sought; where a user chooses to include their own health information, Article 9(2)(a) explicit consent at the moment of sending is relied on only for that request, and we do not otherwise process it. Patient data must not be entered.

## 5. Decision (owner to complete)
- [ ] Proceed with the measures above
- [ ] Add the client-side identifier warning before wider launch
- [ ] Full DPIA completed and filed (date: ______)
Signed: ______________ Date: ______
