// Academy AI is switched off (owner decision, 27 Oct 2026). This function no longer sends any text to an AI provider.
// Lumen still lets people use their own AI key, which goes from their browser straight to the provider they choose.
// The previous version is kept in previous/index.ts and handler.mjs in case Academy AI is brought back.
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
Deno.serve((req) => req.method === 'OPTIONS'
  ? new Response(null, { status: 204, headers: CORS })
  : new Response(JSON.stringify({ error: 'retired', message: 'Academy AI has been switched off. You can add your own AI key in Lumen.' }), { status: 410, headers: { ...CORS, 'Content-Type': 'application/json' } }))
