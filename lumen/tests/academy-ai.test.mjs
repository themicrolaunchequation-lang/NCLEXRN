#!/usr/bin/env node
// Tests for the Academy AI Edge Function handler, with fake Supabase and fake providers.
// Usage: node --test lumen/tests/academy-ai.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler, parseAllowance, allowanceFor } from '../supabase/functions/lumen-ai/handler.mjs';

function setup({ env = {}, level = 1, providers = {}, used = 0, ceilingUsed = 0 } = {}) {
  const state = { used, ceilingUsed, cache: new Map(), calls: [], logs: [] };
  const vars = { GEMINI_API_KEY: 'g-key', GROQ_API_KEY: 'q-key', ...env };
  const reply = (status, body) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });
  const fetch = async (url, init) => {
    const id = url.includes('googleapis') ? 'gemini' : url.includes('groq') ? 'groq' : url.includes('openai.com') ? 'openai' : 'openrouter';
    state.calls.push({ id, body: JSON.parse(init.body), headers: init.headers });
    const plan = providers[id] ?? 200;
    if (plan === 'down') throw new TypeError('fetch failed');
    if (plan !== 200) return reply(plan, { error: { message: 'no' } });
    return id === 'gemini'
      ? reply(200, { candidates: [{ content: { parts: [{ text: '{"items":[]}' }] } }] })
      : reply(200, { choices: [{ message: { content: '{"items":["groq"]}' } }] });
  };
  const handle = createHandler({
    env: name => vars[name],
    fetch,
    getUser: async token => (token === 'good' ? { id: 'user-1' } : null),
    levelOf: async () => level,
    take: async (user, limit, ceiling) => {
      if (state.ceilingUsed >= ceiling) return -2;
      if (state.used >= limit) return -1;
      state.used++; state.ceilingUsed++;
      return limit - state.used;
    },
    refund: async () => { state.used = Math.max(0, state.used - 1); state.ceilingUsed = Math.max(0, state.ceilingUsed - 1); },
    usage: async () => state.used,
    cacheGet: async key => state.cache.get(key) || null,
    cachePut: async (key, row) => { state.cache.set(key, row); },
    log: (event, fields) => state.logs.push({ event, ...fields }),
  });
  const post = (body, token = 'good') => handle(new Request('https://x/functions/v1/lumen-ai', {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(body) }));
  return { handle, post, state };
}
const ask = { system: 'S', prompt: 'Make questions from SOURCE: The heart pumps blood.', json: true, maxTokens: 800 };

test('allowance table by level', () => {
  const t = parseAllowance('1:15, 2:30,3:60');
  assert.deepEqual(t, { 1: 15, 2: 30, 3: 60 });
  assert.equal(allowanceFor(0, t), 0);
  assert.equal(allowanceFor(2, t), 30);
  assert.equal(allowanceFor(5, t), 60);
});

test('preflight from a local file is allowed', async () => {
  const { handle } = setup();
  const res = await handle(new Request('https://x', { method: 'OPTIONS', headers: { origin: 'null' } }));
  assert.equal(res.status, 204);
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
});

test('refuses requests without a valid sign-in', async () => {
  const { post } = setup();
  assert.equal((await post(ask, 'bad')).status, 401);
});

test('refuses accounts without an Evinca level', async () => {
  const { post, state } = setup({ level: 0 });
  const res = await post(ask);
  assert.equal(res.status, 403);
  assert.equal(state.calls.length, 0);
});

test('answers with the first provider and counts one request', async () => {
  const { post, state } = setup({ env: { LUMEN_AI_PROVIDERS: 'gemini,groq' } });
  const res = await post(ask);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.provider, 'gemini');
  assert.equal(body.model, 'gemini-3.1-flash-lite');
  assert.equal(body.remaining, 14);
  assert.equal(state.calls[0].headers['x-goog-api-key'], 'g-key');
  assert.ok(!JSON.stringify(state.logs).includes('heart'), 'prompt text must not be logged');
});

test('falls back to Groq when Gemini is rate limited or down', async () => {
  for (const plan of [429, 500, 'down']) {
    const { post, state } = setup({ providers: { gemini: plan }, env: { LUMEN_AI_PROVIDERS: 'gemini,groq' } });
    const body = await (await post(ask)).json();
    assert.equal(body.provider, 'groq', String(plan));
    assert.equal(state.calls[1].body.reasoning_effort, 'low');
    assert.deepEqual(state.calls[1].body.response_format, { type: 'json_object' });
  }
});

test('gives the request back when no provider answers', async () => {
  const { post, state } = setup({ providers: { gemini: 503, groq: 429 } });
  const res = await post(ask);
  assert.equal(res.status, 503);
  assert.equal(state.used, 0);
});

test('stops at the member allowance and the Academy ceiling', async () => {
  let s = setup({ used: 15 });
  let res = await s.post(ask);
  assert.equal(res.status, 429);
  assert.equal((await res.json()).error, 'daily');
  s = setup({ ceilingUsed: 50, env: { LUMEN_AI_ACADEMY_DAILY: '50' } });
  res = await s.post(ask);
  assert.equal(res.status, 429);
  assert.equal((await res.json()).error, 'academy');
  assert.equal(s.state.calls.length, 0);
});

test('a repeated request is served from the shared cache without using the allowance', async () => {
  const { post, state } = setup();
  await post(ask);
  const body = await (await post(ask)).json();
  assert.equal(body.cached, true);
  assert.equal(state.used, 1);
  assert.equal(state.calls.length, 1);
});

test('rejects oversized passages and caps output tokens', async () => {
  const { post, state } = setup({ env: { LUMEN_AI_PROVIDERS: 'gemini' } });
  assert.equal((await post({ ...ask, prompt: 'x'.repeat(30001) })).status, 413);
  await post({ ...ask, maxTokens: 99999 });
  assert.equal(state.calls[0].body.generationConfig.maxOutputTokens, 4000);
});

test('status reports the allowance', async () => {
  const { post } = setup({ level: 2, used: 4 });
  const body = await (await post({ action: 'status' })).json();
  assert.deepEqual(body, { level: 2, limit: 30, used: 4, remaining: 26 });
});

test('reports when no provider key is set', async () => {
  const { post } = setup({ env: { GEMINI_API_KEY: '', GROQ_API_KEY: '' } });
  const res = await post(ask);
  assert.equal(res.status, 503);
  assert.match((await res.json()).message, /not set up/);
});

test('default order uses OpenAI first when its key is set, with current request fields', async () => {
  const { post, state } = setup({ env: { OPENAI_API_KEY: 'o-key' } });
  const body = await (await post(ask)).json();
  assert.equal(body.provider, 'openai');
  assert.equal(body.model, 'gpt-6-luna');
  const sent = state.calls[0].body;
  assert.equal(sent.max_completion_tokens, 800 + 1024);
  assert.equal(sent.temperature, undefined);
  assert.equal(sent.max_tokens, undefined);
  assert.equal(state.calls[0].headers.Authorization, 'Bearer o-key');
});

test('without an OpenAI key the default order starts with Groq', async () => {
  const { post } = setup();
  assert.equal((await (await post(ask)).json()).provider, 'groq');
});

test('OpenRouter with gpt-oss-120b asks for low reasoning effort', async () => {
  const { post, state } = setup({ env: { GEMINI_API_KEY: '', GROQ_API_KEY: '', OPENROUTER_API_KEY: 'r-key', OPENROUTER_MODEL: 'openai/gpt-oss-120b', LUMEN_AI_PROVIDERS: 'openrouter,openai' } });
  const body = await (await post(ask)).json();
  assert.equal(body.provider, 'openrouter');
  assert.deepEqual(state.calls[0].body.reasoning, { effort: 'low', exclude: true });
  assert.equal(state.calls[0].body.model, 'openai/gpt-oss-120b');
});
