// Supabase Edge Function "lumen-ai": Academy AI for Lumen members.
// The logic lives in handler.mjs (tested in Node); this file wires it to Supabase.
//
// Secrets (Supabase → Edge Functions → Secrets):
//   GEMINI_API_KEY          Academy's Google AI Studio key, on a PAID (billing-enabled) project
//   GROQ_API_KEY            Academy's Groq key (fallback)
//   OPENROUTER_API_KEY      optional third provider
//   LUMEN_AI_PROVIDERS      order, default "gemini,groq"
//   GEMINI_MODEL / GROQ_MODEL / OPENROUTER_MODEL   optional model overrides
//   LUMEN_AI_DAILY          requests per member per day by Evinca level, default "1:15,2:30,3:60"
//   LUMEN_AI_ACADEMY_DAILY  requests per day for all members together, default 3000
// SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
import { createClient } from 'npm:@supabase/supabase-js@2.117.2'
import { createHandler } from './handler.mjs'

const env = (name: string) => Deno.env.get(name) ?? ''
const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } })
const asUser = (token: string) => createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { headers: { Authorization: `Bearer ${token}` } },
})

const handler = createHandler({
  env,
  fetch: (url: string, init: RequestInit) => fetch(url, init),
  getUser: async (token: string) => {
    const { data, error } = await admin.auth.getUser(token)
    return error || !data.user ? null : { id: data.user.id }
  },
  levelOf: async (token: string) => {
    const { data, error } = await asUser(token).rpc('platform_level')
    return error ? 0 : Number(data ?? 0)
  },
  take: async (user: string, limit: number, ceiling: number) => {
    const { data, error } = await admin.rpc('lumen_ai_take', { p_user: user, p_limit: limit, p_ceiling: ceiling })
    if (error) throw error
    return Number(data)
  },
  refund: async (user: string) => { await admin.rpc('lumen_ai_refund', { p_user: user }) },
  usage: async (user: string) => {
    const { data } = await admin.from('lumen_ai_usage').select('requests').eq('user_id', user).eq('day', new Date().toISOString().slice(0, 10)).maybeSingle()
    return Number((data as { requests?: number } | null)?.requests ?? 0)
  },
  cacheGet: async (key: string) => {
    const { data } = await admin.from('lumen_ai_cache').select('text, provider, model').eq('key', key).gt('created_at', new Date(Date.now() - 30 * 864e5).toISOString()).maybeSingle()
    return data
  },
  cachePut: async (key: string, row: { text: string; provider: string; model: string }) => {
    await admin.from('lumen_ai_cache').upsert({ key, ...row, created_at: new Date().toISOString() })
  },
  cleanup: async () => { await admin.rpc('lumen_ai_cleanup') },
  log: (event: string, fields: Record<string, unknown>) => console.log(JSON.stringify({ fn: 'lumen-ai', event, ...fields })),
})

Deno.serve(handler)
