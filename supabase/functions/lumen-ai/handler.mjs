// Academy AI for Lumen: one request handler.
// Prompt text is never logged. Cached answers are private to each person (the cache key includes the user id)
// and are deleted after 30 days by public.lumen_ai_cleanup (see the privacy notice).

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const LIMITS = { system: 4000, prompt: 30000, maxTokens: 4000 };

export const PROVIDERS = {
  openai: { key: 'OPENAI_API_KEY', model: 'OPENAI_MODEL', fallbackModel: 'gpt-6-luna', name: 'OpenAI', base: 'https://api.openai.com/v1' },
  gemini: { key: 'GEMINI_API_KEY', model: 'GEMINI_MODEL', fallbackModel: 'gemini-3.1-flash-lite', name: 'Gemini' },
  groq: { key: 'GROQ_API_KEY', model: 'GROQ_MODEL', fallbackModel: 'openai/gpt-oss-20b', name: 'Groq', base: 'https://api.groq.com/openai/v1' },
  openrouter: { key: 'OPENROUTER_API_KEY', model: 'OPENROUTER_MODEL', fallbackModel: 'google/gemini-3.1-flash-lite', name: 'OpenRouter', base: 'https://openrouter.ai/api/v1' },
};

export function parseAllowance(text) {
  const out = {};
  for (const part of String(text || '').split(',')) {
    const [level, count] = part.split(':').map(s => Number(s.trim()));
    if (Number.isInteger(level) && Number.isInteger(count) && count >= 0) out[level] = count;
  }
  return out;
}

export function allowanceFor(level, table) {
  const levels = Object.keys(table).map(Number).filter(l => l <= level).sort((a, b) => b - a);
  return levels.length ? table[levels[0]] : 0;
}

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

async function sha256(text) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
}

const secondsToMidnightUtc = now => {
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return Math.max(60, Math.ceil((next.getTime() - now) / 1000));
};

export async function callProvider(id, env, fetcher, { system, prompt, json: wantJson, maxTokens }) {
  const p = PROVIDERS[id], key = env(p.key), model = env(p.model) || p.fallbackModel;
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 60000);
  let res;
  try {
    if (id === 'gemini') {
      res = await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST', signal: ctl.signal,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: maxTokens, ...(wantJson ? { responseMimeType: 'application/json' } : {}) } }),
      });
    } else if (id === 'openai') {
      const effort = env('OPENAI_REASONING_EFFORT');
      res = await fetcher(`${p.base}/chat/completions`, {
        method: 'POST', signal: ctl.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, max_completion_tokens: maxTokens + 1024,
          messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
          ...(effort ? { reasoning_effort: effort } : {}),
          ...(wantJson ? { response_format: { type: 'json_object' } } : {}) }),
      });
    } else {
      const reasoning = /gpt-oss/.test(model);
      res = await fetcher(`${p.base}/chat/completions`, {
        method: 'POST', signal: ctl.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...(id === 'openrouter' ? { 'X-Title': 'Lumen by Healthcare Crown Academy' } : {}) },
        body: JSON.stringify({ model, temperature: 0.2, max_tokens: maxTokens + (reasoning ? 1024 : 0),
          messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
          ...(reasoning && id === 'groq' ? { reasoning_effort: 'low' } : {}),
          ...(reasoning && id === 'openrouter' ? { reasoning: { effort: 'low', exclude: true } } : {}),
          ...(wantJson ? { response_format: { type: 'json_object' } } : {}) }),
      });
    }
  } catch {
    throw Object.assign(new Error(`${p.name} could not be reached`), { retry: true });
  } finally { clearTimeout(timer); }
  const body = await res.text();
  if (!res.ok) throw Object.assign(new Error(`${p.name} answered ${res.status}`), { retry: res.status === 429 || res.status >= 500 || res.status === 401 || res.status === 403 || res.status === 404, status: res.status, detail: body.slice(0, 300) });
  let data;
  try { data = JSON.parse(body); } catch { throw Object.assign(new Error(`${p.name} sent an unreadable reply`), { retry: true }); }
  const text = id === 'gemini'
    ? (data.candidates?.[0]?.content?.parts || []).filter(x => !x.thought).map(x => x.text || '').join('')
    : data.choices?.[0]?.message?.content || '';
  if (!text.trim()) throw Object.assign(new Error(`${p.name} returned an empty answer`), { retry: true });
  return { text, provider: id, model };
}

export function createHandler(deps) {
  const env = name => deps.env(name) ?? '';
  const log = deps.log || (() => {});
  return async function handle(req) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (req.method !== 'POST') return json(405, { error: 'method', message: 'Use POST.' });

    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const user = token ? await deps.getUser(token).catch(() => null) : null;
    if (!user) return json(401, { error: 'signin', message: 'Sign in again to use Academy AI.' });

    let body;
    try { body = await req.json(); } catch { return json(400, { error: 'request', message: 'The request could not be read.' }); }

    const level = Number(await deps.levelOf(token).catch(() => 0)) || 0;
    const allowance = allowanceFor(level, parseAllowance(env('LUMEN_AI_DAILY') || '1:15,2:30,3:60'));
    if (!allowance) return json(403, { error: 'level', message: 'Academy AI is included with an Evinca membership. Start your free Spotlight Story in Evinca to unlock it.' });

    if (body?.action === 'status') {
      const used = await deps.usage(user.id).catch(() => 0);
      return json(200, { level, limit: allowance, used, remaining: Math.max(0, allowance - used) });
    }

    const system = typeof body?.system === 'string' ? body.system : '';
    const prompt = typeof body?.prompt === 'string' ? body.prompt : '';
    const maxTokens = Math.min(LIMITS.maxTokens, Math.max(16, Number(body?.maxTokens) || 1800));
    if (!prompt.trim()) return json(400, { error: 'request', message: 'Nothing to send.' });
    if (system.length > LIMITS.system || prompt.length > LIMITS.prompt) return json(413, { error: 'size', message: 'This passage is too long for Academy AI. Select a shorter passage.' });
    const request = { system, prompt, json: !!body.json, maxTokens };

    // Per-person cache: answers are only ever reused for the same person.
    const cacheKey = await sha256(JSON.stringify(['v2', user.id, system, prompt, request.json, maxTokens]));
    const hit = await deps.cacheGet(cacheKey).catch(() => null);
    if (hit?.text) {
      log('cache-hit', { user: user.id });
      return json(200, { ...hit, cached: true, remaining: Math.max(0, allowance - await deps.usage(user.id).catch(() => 0)) });
    }

    const ceiling = Number(env('LUMEN_AI_ACADEMY_DAILY')) || 3000;
    const remaining = await deps.take(user.id, allowance, ceiling);
    const retryAfter = secondsToMidnightUtc(Date.now());
    if (remaining === -1) return json(429, { error: 'daily', retryAfter, message: `You have used today’s ${allowance} Academy AI requests. They reset at midnight UTC.` });
    if (remaining === -2) return json(429, { error: 'academy', retryAfter, message: 'Academy AI has reached its limit for today. It resets at midnight UTC.' });

    const order = (env('LUMEN_AI_PROVIDERS') || 'openai,groq,gemini').split(',').map(s => s.trim()).filter(id => PROVIDERS[id] && env(PROVIDERS[id].key));
    const tried = [];
    for (const id of order) {
      try {
        const out = await callProvider(id, env, deps.fetch, request);
        if (request.json) await deps.cachePut(cacheKey, out).catch(() => {});
        log('answered', { user: user.id, provider: id, tried: tried.length });
        if (deps.cleanup && Math.random() < 0.01) deps.cleanup().catch(() => {});
        return json(200, { ...out, cached: false, remaining });
      } catch (err) {
        tried.push(`${PROVIDERS[id].name}: ${err.status || 'error'}`);
        log('provider-failed', { provider: id, status: err.status || 0, detail: err.detail || err.message });
        if (!err.retry) break;
      }
    }
    await deps.refund(user.id).catch(() => {});
    return json(503, { error: 'providers', retryAfter: 300, message: order.length ? 'Academy AI is busy right now. Your request was not counted.' : 'Academy AI is not set up yet.', tried });
  };
}
