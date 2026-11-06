// Crown Suite billing: subscription checkout, customer portal, Gulf exam passes and the Stripe webhook.
// Uses STRIPE_RESTRICTED_KEY (sandbox rk_test_ or live rk_live_). Products, prices and the webhook endpoint
// are created in Stripe on first use, so a new Stripe account needs no manual catalogue setup.
import Stripe from 'npm:stripe@23.0.0'
import { createClient } from 'npm:@supabase/supabase-js@2.117.2'

const env = (n: string) => Deno.env.get(n) ?? ''
const KEY = env('STRIPE_RESTRICTED_KEY')
const LIVE = KEY.startsWith('rk_live_') || KEY.startsWith('sk_live_')
const stripe = KEY ? new Stripe(KEY, { httpClient: Stripe.createFetchHttpClient() }) : null
const crypto = Stripe.createSubtleCryptoProvider()
const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } })
const SITE = 'https://healthcarecrownacademy.co.uk'
// The contact named on the terms, refunds and privacy pages. Every email uses it, including the reply-to address.
const CONTACT = 'hello@healthcarecrownacademy.co.uk'
const HOOK_URL = `${env('SUPABASE_URL')}/functions/v1/crown-billing?hook=1`
const HOOK_EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted', 'charge.refunded'] as const
const NAMES: Record<string, string> = { crown: 'Crown Pass', medlex: 'MedLex Premium', carecraft: 'Carecraft Premium', lumen: 'Lumen Academy', serein: 'Serein' }
const CONSENT_VERSION = '2026-10-29'
const CONSENT_TEXT = 'You asked for access to start now, during your 14-day cancellation period. Cancel within that period for a full refund. Details: healthcarecrownacademy.co.uk/refunds'
const RECEIPT_TEXT = 'You asked for access to start during your 14-day cancellation period. Cancel within it for a full refund. Stop renewal any time. healthcarecrownacademy.co.uk/refunds'
const DAY = 86400000
// Live payments stay off until the owner sets LIVE_PAYMENTS_APPROVED=yes after legal sign-off (default deny).
const LIVE_APPROVED = env('LIVE_PAYMENTS_APPROVED') === 'yes'
// Refund policy (owner decision, 29 Oct 2026): full refund within the 14-day cancellation period.
// The older 'deduct' rule (full within 3 days, then minus days used) stays available only if REFUND_POLICY=deduct is set.
const REFUND_POLICY = env('REFUND_POLICY') === 'deduct' ? 'deduct' : 'full14'
async function sha256(t: string) { const b = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('') }
// The cancellation period ends at the end of the 14th day after the day the contract was made, counted in UK time.
// londonDate gives the calendar date in London; londonMidnight gives the instant a London day starts (GMT or BST).
const LONDON = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' })
function londonParts(ms: number) {
  const p: Record<string, number> = {}
  for (const x of LONDON.formatToParts(new Date(ms))) if (x.type !== 'literal') p[x.type] = Number(x.value)
  return p
}
const londonOffset = (ms: number) => { const p = londonParts(ms); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000 }
// UK clocks change at 01:00 UTC, never at midnight, so the offset an hour either side of midnight is the right one.
const londonMidnight = (y: number, m: number, d: number) => { const t = Date.UTC(y, m - 1, d); return t - londonOffset(t - londonOffset(t)) }
// The first instant after the cancellation period: midnight in London at the start of day 15.
const windowEnd = (contractMs: number) => { const p = londonParts(contractMs); return londonMidnight(p.year, p.month, p.day + 15) }
const ORIGIN = /^https:\/\/([a-z0-9-]+\.)?healthcarecrownacademy\.co\.uk$/

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

async function state(key: string) {
  const { data } = await db.from('crown_stripe_state').select('value').match({ key, livemode: LIVE }).maybeSingle()
  return data?.value as string | undefined
}
async function setState(key: string, value: string) {
  const { error } = await db.from('crown_stripe_state').upsert({ key, livemode: LIVE, value, updated_at: new Date().toISOString() })
  if (error) throw error
}

// Webhook endpoint pointing back at this function; its signing secret is kept in crown_stripe_state.
async function ensureWebhook() {
  if (await state('webhook_secret')) return
  const list = await stripe!.webhookEndpoints.list({ limit: 100 })
  for (const w of list.data) if (w.url === HOOK_URL) await stripe!.webhookEndpoints.del(w.id) // secret unknown: replace
  const hook = await stripe!.webhookEndpoints.create({ url: HOOK_URL, enabled_events: [...HOOK_EVENTS], description: 'Crown Suite billing (crown-billing Edge Function)' })
  await setState('webhook_id', hook.id)
  await setState('webhook_secret', hook.secret!)
}

async function ensureProduct(id: string, name: string) {
  try { return await stripe!.products.retrieve(id) } catch (e) {
    if ((e as { code?: string }).code !== 'resource_missing') throw e
    return stripe!.products.create({ id, name, tax_code: 'txcd_10000000' })
  }
}

// One Stripe price per plan+band, found again by lookup_key. Amount changes create a new price.
async function ensurePrice(lookup: string, product: string, name: string, amount: number, currency: string, recurring?: Stripe.PriceCreateParams.Recurring) {
  const cents = Math.round(amount * 100)
  const found = (await stripe!.prices.list({ lookup_keys: [lookup], active: true, limit: 1 })).data[0]
  if (found && found.unit_amount === cents && found.currency === currency) return found.id
  await ensureProduct(product, name)
  const price = await stripe!.prices.create({ product, unit_amount: cents, currency, recurring, lookup_key: lookup, transfer_lookup_key: true, tax_behavior: 'inclusive', metadata: { lookup } })
  return price.id
}

async function customerFor(user: { id: string; email?: string }) {
  const { data } = await db.from('crown_customers').select('stripe_customer_id').match({ user_id: user.id, livemode: LIVE }).maybeSingle()
  if (data) return data.stripe_customer_id as string
  const c = await stripe!.customers.create({ email: user.email, metadata: { user_id: user.id } }, { idempotencyKey: `hca-customer-${user.id}-${LIVE}` })
  const { error } = await db.from('crown_customers').insert({ user_id: user.id, livemode: LIVE, stripe_customer_id: c.id })
  if (error && error.code !== '23505') throw error
  return c.id
}

async function userFrom(req: Request) {
  const auth = req.headers.get('authorization') ?? ''
  if (!auth.startsWith('Bearer ')) return null
  const { data, error } = await db.auth.getUser(auth.slice(7))
  return error ? null : data.user
}

const returnUrl = (u: unknown, fallback: string) => typeof u === 'string' && /^https:\/\/([a-z0-9-]+\.)?healthcarecrownacademy\.co\.uk\//.test(u) && u.length < 500 ? u : fallback

async function checkout(user: { id: string; email?: string }, body: Record<string, unknown>) {
  const plan = String(body.plan ?? '')
  const country = /^[A-Z]{2}$/.test(String(body.country ?? '').toUpperCase()) ? String(body.country).toUpperCase() : ''
  const back = returnUrl(body.return_url, `${SITE}/#pricing`)

  // Consent is checked before anything is created in Stripe.
  // UK Consumer Contracts Regulations 2013: the buyer must expressly ask for access to start within the 14-day period.
  if (body.consent !== true) return json({ error: 'consent_required' }, 400)
  // The payer confirms they are 18 or over, or a parent or guardian paying for the account holder.
  if (body.adult !== true) return json({ error: 'consent_required' }, 400)
  // The page must say which consent wording it showed, and it must be the current one. A missing version is refused
  // like an old one: the person reloads, sees the current text and ticks again. Default deny.
  if (body.consent_version !== CONSENT_VERSION) return json({ error: 'consent_outdated' }, 409)
  if (LIVE && !LIVE_APPROVED) return json({ error: 'payments_unavailable' }, 503)

  await ensureWebhook()
  const customer = await customerFor(user)
  const base = { customer, client_reference_id: user.id, allow_promotion_codes: true, billing_address_collection: 'required' as const,
    success_url: `${back}${back.includes('?') ? '&' : '?'}checkout=success&session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${back}${back.includes('?') ? '&' : '?'}checkout=cancelled` }
  const consent = { consent_at: new Date().toISOString(), consent_version: CONSENT_VERSION, consent_hash: (await sha256(CONSENT_TEXT)).slice(0, 32), adult_payer: 'confirmed', refund_policy: REFUND_POLICY }
  if (plan.startsWith('gulf-')) {
    const { data: g } = await db.from('gulf_exam_plans').select('*').eq('id', plan).eq('active', true).maybeSingle()
    if (!g) return json({ error: 'plan_unavailable' }, 404)
    const price = await ensurePrice(`hca_${plan}`, `hca_${plan.replace(/-\d+m$/, '')}`, `Gulf Nursing · ${g.exam}`, Number(g.amount_usd), 'usd')
    const s = await stripe!.checkout.sessions.create({ ...base, mode: 'payment', line_items: [{ price, quantity: 1 }],
      metadata: { user_id: user.id, plan, kind: 'gulf', months: String(g.months), ...consent },
      custom_text: { submit: { message: CONSENT_TEXT } },
      payment_intent_data: { description: RECEIPT_TEXT, metadata: { user_id: user.id, plan, kind: 'gulf', ...consent } } })
    return json({ url: s.url, livemode: s.livemode })
  }

  const { data: quote, error } = await db.rpc('crown_price_for', { p_plan: plan, p_country: country || null })
  if (error) throw error
  if (!quote?.available) return json({ error: 'plan_unavailable' }, 404)
  const { data: p } = await db.from('crown_plans').select('product,interval,trial_days').eq('id', plan).single()
  const { data: existing } = await db.from('crown_subscriptions').select('id').eq('user_id', user.id).eq('livemode', LIVE).in('status', ['trialing', 'active', 'past_due']).limit(1)
  if (existing?.length) return json({ error: 'already_subscribed' }, 409)
  // One free trial per account: anyone who has had a Crown Suite subscription before, in any state, pays from day one.
  const { data: before } = await db.from('crown_subscriptions').select('id').eq('user_id', user.id).eq('livemode', LIVE).limit(1)
  const trialDays = p!.trial_days && !before?.length ? p!.trial_days : 0
  // The plans page says "£0 today". When the trial is used up, the page must tell the person and ask before we charge.
  if (p!.trial_days && !trialDays && body.trial !== false) return json({ error: 'trial_used' }, 409)
  // Founding offer: charge the standard yearly price with a one-off first-year discount, so year two renews at full price.
  const founding = plan === 'crown-year-founding'
  const billed = founding ? (await db.rpc('crown_price_for', { p_plan: 'crown-year', p_country: country || null })).data : quote
  if (!billed?.available) return json({ error: 'plan_unavailable' }, 404)
  const price = await ensurePrice(`hca_${founding ? 'crown-year' : plan}_${billed.band}`, `hca_${p!.product}`, NAMES[p!.product] ?? p!.product, Number(billed.amount), billed.currency, { interval: p!.interval })
  let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined
  if (founding) {
    const off = Math.round((Number(billed.amount) - Number(quote.amount)) * 100), cid = `hca_founding_${billed.band}_${billed.currency}_${off}`
    try { await stripe!.coupons.retrieve(cid) } catch { await stripe!.coupons.create({ id: cid, amount_off: off, currency: billed.currency, duration: 'once', name: 'Founding member, first year' }) }
    discounts = [{ coupon: cid }]
  }
  const s = await stripe!.checkout.sessions.create({ ...base, ...(discounts ? { discounts, allow_promotion_codes: undefined } : {}), mode: 'subscription', line_items: [{ price, quantity: 1 }],
    metadata: { user_id: user.id, plan, band: quote.band, country, ...consent },
    custom_text: { submit: { message: CONSENT_TEXT } },
    subscription_data: { description: RECEIPT_TEXT, metadata: { user_id: user.id, plan, band: quote.band, country, ...consent }, ...(trialDays ? { trial_period_days: trialDays } : {}) } })
  return json({ url: s.url, livemode: s.livemode, amount: quote.amount, currency: quote.currency, band: quote.band })
}

// Self-service refunds. Full refund within the 14-day cancellation period (the statutory
// cancellation period, where the buyer asked for access to start); nothing automatic after that.
// One automatic refund per person per product. Renewals are not refunded automatically.
function refundShare(paidAt: number, periodMs: number) {
  const used = Date.now() - paidAt
  if (REFUND_POLICY === 'full14' || used <= 3 * DAY) return 1 // callers check the 14-day window first
  return Math.max(0, 1 - used / periodMs)
}
async function alreadyRefunded(userId: string, product: string) {
  const { data } = await db.from('crown_refunds').select('id').match({ user_id: userId, product, livemode: LIVE }).limit(1)
  return Boolean(data?.length)
}
async function refund(user: { id: string; email?: string }, body: Record<string, unknown>) {
  const kind = String(body.kind ?? '')
  // preview: true works out the refund and returns it without changing anything, so the person can confirm first.
  const preview = body.preview === true
  if (kind === 'gulf') {
    let q = db.from('gulf_passes').select('*').match({ user_id: user.id, livemode: LIVE, refunded: false })
    if (body.id) q = q.eq('id', String(body.id))
    const { data: pass } = await q.order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (!pass || pass.refunded) return json({ error: 'nothing_to_refund' }, 404)
    const product = 'gulf-' + String(pass.plan_id).split('-')[1]
    if (await alreadyRefunded(user.id, product)) return json({ error: 'already_refunded' }, 409)
    const paidAt = Date.parse(pass.created_at)
    if (Date.now() >= windowEnd(paidAt)) return json({ error: 'outside_window' }, 409)
    const months = Number(String(pass.plan_id).match(/-(\d+)m$/)?.[1] ?? 1)
    const share = refundShare(paidAt, months * 30.44 * DAY)
    const amount = Math.floor(pass.amount_cents * share)
    if (amount <= 0) return json({ error: 'outside_window' }, 409)
    const s = await stripe!.checkout.sessions.retrieve(pass.stripe_session_id)
    const pi = typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id
    if (!pi) return json({ error: 'nothing_to_refund' }, 404)
    if (preview) return json({ preview: true, amount: amount / 100, paid: pass.amount_cents / 100, currency: pass.currency, full: share === 1, name: 'Gulf Pass' })
    const r = await stripe!.refunds.create({ payment_intent: pi, amount, reason: 'requested_by_customer', metadata: { user_id: user.id, kind, full: String(share === 1) } }, { idempotencyKey: `refund-${pass.id}` })
    await db.from('gulf_passes').update({ refunded: true, until: new Date().toISOString() }).eq('id', pass.id)
    await db.from('crown_refunds').insert({ user_id: user.id, product, stripe_refund_id: r.id, amount_cents: amount, currency: pass.currency, full_refund: share === 1, livemode: LIVE })
    await ackEmail(user.email, 'Gulf Pass', amount, pass.amount_cents, pass.currency, share === 1, Date.now()).catch((e) => console.error('ack email', e))
    return json({ refunded: true, amount: amount / 100, currency: pass.currency, full: share === 1 })
  }
  if (kind === 'subscription') {
    const { data: row } = await db.from('crown_subscriptions').select('*').eq('user_id', user.id).eq('livemode', LIVE).in('status', ['trialing', 'active', 'past_due']).order('updated_at', { ascending: false }).limit(1).maybeSingle()
    if (!row) return json({ error: 'nothing_to_refund' }, 404)
    const sub = await stripe!.subscriptions.retrieve(row.stripe_subscription_id)
    if (sub.status === 'trialing') { // nothing paid yet: end the trial now, no charge
      if (preview) return json({ preview: true, trial: true, name: 'Crown Pass free trial' })
      await stripe!.subscriptions.cancel(sub.id)
      await ackEmail(user.email, 'Crown Pass free trial', 0, 0, 'gbp', true, Date.now(), true).catch((e) => console.error('ack email', e))
      return json({ refunded: false, cancelled: true, trial: true })
    }
    const product = String(row.plan_id).split('-')[0]
    if (await alreadyRefunded(user.id, product)) return json({ error: 'already_refunded' }, 409)
    if (Date.now() >= windowEnd(sub.created * 1000)) return json({ error: 'outside_window' }, 409)
    const paid = (await stripe!.invoices.list({ subscription: sub.id, status: 'paid', limit: 10 })).data.filter((i) => i.amount_paid > 0)
    if (paid.length !== 1) return json({ error: 'outside_window' }, 409) // renewals are not refunded automatically
    const inv = paid[0]
    const paidAt = (inv.status_transitions?.paid_at ?? inv.created) * 1000
    const line = inv.lines.data[0]
    const periodMs = line?.period ? (line.period.end - line.period.start) * 1000 : 30 * DAY
    const share = refundShare(paidAt, periodMs)
    const amount = Math.floor(inv.amount_paid * share)
    if (amount <= 0) return json({ error: 'outside_window' }, 409)
    let pi: string | undefined
    try {
      const pays = await (stripe as unknown as { invoicePayments: { list: (p: unknown) => Promise<{ data: { payment?: { payment_intent?: string | { id: string } } }[] }> } }).invoicePayments.list({ invoice: inv.id })
      const p = pays.data[0]?.payment?.payment_intent
      pi = typeof p === 'string' ? p : p?.id
    } catch { /* older API shape */ }
    pi ??= (inv as unknown as { payment_intent?: string }).payment_intent
    if (!pi) return json({ error: 'nothing_to_refund' }, 404)
    if (preview) return json({ preview: true, amount: amount / 100, paid: inv.amount_paid / 100, currency: inv.currency, full: share === 1, name: NAMES[product] ?? 'Your plan' })
    const r = await stripe!.refunds.create({ payment_intent: pi, amount, reason: 'requested_by_customer', metadata: { user_id: user.id, kind, full: String(share === 1) } }, { idempotencyKey: `refund-${inv.id}` })
    await stripe!.subscriptions.cancel(sub.id)
    await db.from('crown_refunds').insert({ user_id: user.id, product, stripe_refund_id: r.id, amount_cents: amount, currency: inv.currency, full_refund: share === 1, livemode: LIVE })
    await ackEmail(user.email, NAMES[product] ?? 'Your plan', amount, inv.amount_paid, inv.currency, share === 1, Date.now()).catch((e) => console.error('ack email', e))
    return json({ refunded: true, cancelled: true, amount: amount / 100, currency: inv.currency, full: share === 1 })
  }
  return json({ error: 'invalid_request' }, 400)
}

async function portal(user: { id: string; email?: string }, body: Record<string, unknown>) {
  const { data } = await db.from('crown_customers').select('stripe_customer_id').match({ user_id: user.id, livemode: LIVE }).maybeSingle()
  if (!data) return json({ error: 'no_customer' }, 404)
  let configuration = await state('portal_config')
  if (!configuration) {
    const c = await stripe!.billingPortal.configurations.create({
      business_profile: { headline: 'Healthcare Crown Academy: manage your plan', privacy_policy_url: `${SITE}/privacy`, terms_of_service_url: `${SITE}/terms` },
      features: { invoice_history: { enabled: true }, payment_method_update: { enabled: true }, customer_update: { enabled: true, allowed_updates: ['email', 'address'] },
        subscription_cancel: { enabled: true, mode: 'at_period_end' } } })
    configuration = c.id; await setState('portal_config', configuration)
  }
  const s = await stripe!.billingPortal.sessions.create({ customer: data.stripe_customer_id, configuration, return_url: returnUrl(body.return_url, `${SITE}/`) })
  return json({ url: s.url })
}

const STATUS: Record<string, string> = { trialing: 'trialing', active: 'active', past_due: 'past_due', unpaid: 'past_due', canceled: 'canceled', incomplete: 'incomplete', incomplete_expired: 'canceled', paused: 'canceled' }

async function syncSubscription(sub: Stripe.Subscription) {
  const userId = sub.metadata?.user_id, plan = sub.metadata?.plan
  if (!userId || !plan) return
  const item = sub.items.data[0] as Stripe.SubscriptionItem & { current_period_end?: number }
  const end = item?.current_period_end ?? (sub as unknown as { current_period_end?: number }).current_period_end
  const { error } = await db.from('crown_subscriptions').upsert({
    user_id: userId, plan_id: plan, status: STATUS[sub.status] ?? 'incomplete',
    current_period_end: end ? new Date(end * 1000).toISOString() : null, cancel_at_period_end: sub.cancel_at_period_end,
    stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id, stripe_subscription_id: sub.id,
    stripe_price_id: item?.price?.id ?? null, band: sub.metadata?.band ?? null, country: sub.metadata?.country || null,
    livemode: sub.livemode, updated_at: new Date().toISOString() }, { onConflict: 'stripe_subscription_id' })
  if (error) throw error
}

// ---------- Order confirmation email (Consumer Contracts Regulations 2013, reg. 16: confirmation on a durable medium) ----------
// Sent once per completed checkout through Resend when RESEND_API_KEY is set. The email itself carries the key terms,
// the cancellation rights and the model cancellation form, so the buyer keeps them even if the website changes.
const TERMS_VERSION = '2026-10-29'
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))
const money2 = (cents: number, cur: string) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: cur.toUpperCase() }).format(cents / 100)
const day2 = (ms: number) => new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' })
async function confirmationEmail(s: Stripe.Checkout.Session) {
  const to = s.customer_details?.email ?? ''
  if (!env('RESEND_API_KEY') || !to) { console.log('confirmation email skipped', { session: s.id }); return }
  const plan = String(s.metadata?.plan ?? ''), now = Date.now(), cur = s.currency ?? 'gbp'
  const gulf = /^gulf-/.test(plan), months = Number(plan.match(/-(\d+)m$/)?.[1] ?? 0)
  const lines: [string, string][] = []
  let name = 'Crown Pass', facts: string[] = []
  if (gulf) {
    name = plan.startsWith('gulf-all') ? `Gulf Pass, ${months} month${months === 1 ? '' : 's'}` : `Gulf Region exam pass, ${months} month${months === 1 ? '' : 's'}`
    lines.push(['Paid', money2(s.amount_total ?? 0, cur)], ['Access until', day2(new Date(now).setMonth(new Date(now).getMonth() + months))])
    facts = ['This is a one-off payment. It never renews.', plan.startsWith('gulf-all') ? 'It includes all four Gulf Region exams and the Crown Pass for the same time. The included Crown Pass ends with the Gulf Pass and never turns into a paid subscription.' : '']
  } else if (s.subscription) {
    const sub = await stripe!.subscriptions.retrieve(typeof s.subscription === 'string' ? s.subscription : s.subscription.id)
    const item = sub.items.data[0], price = item?.price, interval = price?.recurring?.interval === 'year' ? 'year' : 'month'
    const full = price?.unit_amount ?? 0, pcur = price?.currency ?? cur
    name = NAMES[plan.split('-')[0]] ?? 'Crown Pass'
    if (sub.status === 'trialing' && sub.trial_end) {
      let first = full
      if (plan === 'crown-year-founding') { const q = (await db.rpc('crown_price_for', { p_plan: plan, p_country: s.metadata?.country || null })).data; if (q?.available) first = Math.round(Number(q.amount) * 100) }
      lines.push(['Today', money2(0, pcur) + ' (7-day free trial)'], ['First payment', `${money2(first, pcur)} on ${day2(sub.trial_end * 1000)}, unless you cancel before then`])
    } else lines.push(['Paid', money2(s.amount_total ?? 0, pcur)])
    lines.push(['Then', `${money2(full, pcur)} a ${interval}, renewing automatically until you stop it`])
    facts = ['You can stop renewal at any time from your account page; your plan then stays active until the end of the period you paid for.', plan === 'crown-year-founding' ? 'The founding price is for your first year only.' : '']
  }
  const consent = s.metadata?.consent_at ? `On ${day2(Date.parse(String(s.metadata.consent_at)))} you asked for your access to start straight away, during your 14-day cancellation period.` : ''
  const ref = s.id.slice(-10).toUpperCase()
  const rows = lines.map(([k, v]) => `<tr><td style="padding:6px 0;color:#5b6b7c">${esc(k)}</td><td style="padding:6px 0;text-align:right;font-weight:600">${esc(v)}</td></tr>`).join('')
  const list = (xs: string[]) => xs.filter(Boolean).map((x) => `<li style="margin:0 0 8px">${esc(x)}</li>`).join('')
  const rights = [
    `You can cancel without giving a reason. Normally your cancellation period ends at the end of ${day2(windowEnd(now) - 1)} (the 14th day after the day you bought or started your free trial). It can be longer if the law requires.`,
    'Cancel within your 14-day period and we refund you in full, even if you have used the app. A free trial is simply cancelled, with nothing to pay.',
    `To cancel: use "Cancel and get a refund" on your account page (https://healthcarecrownacademy.co.uk/account), or send any clear message to ${CONTACT}, or use the form below. We refund to the card you paid with within 14 days of hearing from you, and email you an acknowledgement.`,
    'After the 14 days, your rights if something is faulty or not as described always remain.',
  ]
  const html = `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#10253a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:14px;padding:28px">
<tr><td><p style="margin:0;color:#b8862b;font-size:12px;font-weight:700;letter-spacing:.12em">HEALTHCARE CROWN ACADEMY</p>
<h1 style="margin:8px 0 4px;font-size:24px">Your order is confirmed</h1>
<p style="margin:0 0 16px;color:#5b6b7c">Order reference ${esc(ref)} · ${esc(day2(now))}</p>
<p style="margin:0 0 4px;font-size:18px;font-weight:700">${esc(name)}</p>
<table role="presentation" width="100%" style="border-top:1px solid #e6e1d6;border-bottom:1px solid #e6e1d6;margin:8px 0 16px;font-size:15px">${rows}</table>
<ul style="padding-left:18px;margin:0 0 16px;font-size:15px">${list(facts)}</ul>
<h2 style="font-size:17px;margin:20px 0 8px">Your right to cancel</h2>
${consent ? `<p style="margin:0 0 8px;font-size:15px">${esc(consent)}</p>` : ''}
<ul style="padding-left:18px;margin:0 0 16px;font-size:15px">${list(rights)}</ul>
<h2 style="font-size:17px;margin:20px 0 8px">Model cancellation form</h2>
<p style="margin:0 0 8px;font-size:14px;color:#5b6b7c">Complete and return this form only if you wish to withdraw from the contract. Any clear message is also enough.</p>
<div style="border:1px solid #e6e1d6;border-radius:10px;padding:12px;font-size:14px;line-height:1.6">
To HEALTHCARE CROWN ACADEMY LTD, 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, ${CONTACT}:<br>
I/We [*] hereby give notice that I/We [*] cancel my/our [*] contract of sale of the following goods [*]/for the supply of the following service [*]: ${esc(name)} (order ${esc(ref)}),<br>
Ordered on [*]/received on [*]: ${esc(day2(now))},<br>Name of consumer(s),<br>Address of consumer(s),<br>Signature of consumer(s) (only if this form is notified on paper),<br>Date<br>[*] Delete as appropriate.</div>
<h2 style="font-size:17px;margin:20px 0 8px">Our terms</h2>
<p style="margin:0 0 8px;font-size:14px">This order is under our terms of use and our subscriptions and refunds terms, version ${TERMS_VERSION}: https://healthcarecrownacademy.co.uk/terms and https://healthcarecrownacademy.co.uk/refunds. Please keep this email: it is your record of what you agreed.</p>
<p style="margin:16px 0 0;font-size:12px;color:#7a8794">HEALTHCARE CROWN ACADEMY LTD, company 17501904, registered in England and Wales. Registered office: 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ. We are not registered for VAT, so no VAT is added. Questions: ${CONTACT}</p>
</td></tr></table></td></tr></table></body></html>`
  await sendEmail(to, `Your order is confirmed: ${name}`, html, `confirm-${s.id}`)
}

async function sendEmail(to: string, subject: string, html: string, idem: string) {
  const key = env('RESEND_API_KEY')
  if (!key || !to) { console.log('email skipped', { reason: key ? 'no_email' : 'no_resend_key', subject }); return }
  const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': idem },
    body: JSON.stringify({ from: env('CONFIRM_FROM') || 'Healthcare Crown Academy <orders@healthcarecrownacademy.co.uk>', to: [to], reply_to: CONTACT, subject, html }) })
  if (!r.ok) throw new Error(`resend ${r.status} ${(await r.text()).slice(0, 200)}`)
}

// Durable acknowledgement of an online cancellation (CCR reg. 32(3)): date, access end and the refund worked out.
async function ackEmail(to: string | undefined, name: string, refundCents: number, paidCents: number, cur: string, full: boolean, at: number, trial = false) {
  if (!to) return
  const when = day2(at)
  const calc = trial ? 'Your free trial was cancelled. Nothing was charged and nothing will be taken from your card.'
    : `You paid ${money2(paidCents, cur)}. ${full ? 'You cancelled within your 14-day period, so you get a full refund' : 'We deducted only the paid time you had used (price × time used ÷ the full paid period)'}: ${money2(refundCents, cur)} is on its way to the card you paid with. It usually shows within 5 to 10 working days.`
  const html = `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#10253a"><table role="presentation" width="100%"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" style="max-width:580px;background:#fff;border-radius:14px;padding:28px"><tr><td>
<p style="margin:0;color:#b8862b;font-size:12px;font-weight:700;letter-spacing:.12em">HEALTHCARE CROWN ACADEMY</p>
<h1 style="margin:8px 0 12px;font-size:24px">We have received your cancellation</h1>
<p style="font-size:15px;margin:0 0 10px"><b>${esc(name)}</b> · cancelled on ${esc(when)}. Your paid access ended on ${esc(when)}.</p>
<p style="font-size:15px;margin:0 0 10px">${esc(calc)}</p>
<p style="font-size:15px;margin:0 0 10px">If anything here looks wrong, or you think the law gives you more, reply to this email and we will review it and tell you the outcome.</p>
<p style="margin:16px 0 0;font-size:12px;color:#7a8794">HEALTHCARE CROWN ACADEMY LTD, company 17501904. 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ. ${CONTACT}</p>
</td></tr></table></td></tr></table></body></html>`
  await sendEmail(to, `Cancellation received: ${name}`, html, `ack-${name}-${to}-${Math.floor(at / 60000)}`)
}

// ---------- Close my account ----------
// Personal details and learning data are deleted; payment records (subscriptions, passes, refunds, Stripe customer)
// are kept for 6 years for tax law, linked only to a closed, nameless account. The sign-in is disabled.
async function closeAccount(user: { id: string; email?: string }, body: Record<string, unknown>) {
  if (body.confirm !== 'CLOSE') return json({ error: 'confirm_required' }, 400)
  const { data: subs } = await db.from('crown_subscriptions').select('stripe_subscription_id,livemode').eq('user_id', user.id).in('status', ['trialing', 'active', 'past_due'])
  for (const x of subs ?? []) if (stripe && x.livemode === LIVE) await stripe.subscriptions.cancel(x.stripe_subscription_id) // stops all future payments now
  const { data: apps } = await db.from('applications').select('id,status').eq('user_id', user.id)
  const evinca = (apps ?? []).filter((a) => !['draft', 'story'].includes(a.status)).length
  if ((apps ?? []).length) await db.from('applications').delete().eq('user_id', user.id).in('status', ['draft', 'story'])
  for (const t of ['crown_progress', 'platform_state', 'crown_code_redemptions', 'crown_grants']) await db.from(t).delete().eq('user_id', user.id)
  await db.from('crown_certificates').delete().eq('user_id', user.id)
  const closed = `closed-${user.id.slice(0, 8)}-${Date.now().toString(36)}@closed.invalid`
  await db.from('profiles').update({ email: closed, full_name: 'Closed account', profession: null, role_title: null, country_iso: null, institution: null }).eq('id', user.id)
  await db.from('account_closures').insert({ user_id: user.id, evinca_records: evinca })
  const { error } = await db.auth.admin.updateUserById(user.id, { email: closed, email_confirm: true, user_metadata: {}, ban_duration: '876000h', password: globalThis.crypto.randomUUID() + globalThis.crypto.randomUUID() })
  if (error) throw error
  return json({ closed: true, evinca_records: evinca })
}

// Stripe sends every event on the account to every webhook, including Green Belt and Evinca checkouts that other
// functions handle. Only a Crown Suite subscription or a Gulf Pass made by this function gets our confirmation email.
const CROWN_PLAN = /^(crown|medlex|carecraft|lumen|serein)-(month|year)(-founding)?$/
const GULF_PLAN = /^gulf-[a-z]+-\d+m$/
function ourOrder(s: Stripe.Checkout.Session) {
  const m = s.metadata ?? {}, plan = String(m.plan ?? '')
  if (!m.user_id || !m.consent_version) return false
  if (s.mode === 'payment') return m.kind === 'gulf' && GULF_PLAN.test(plan)
  return s.mode === 'subscription' && CROWN_PLAN.test(plan)
}

async function hook(req: Request) {
  const secret = await state('webhook_secret')
  if (!secret) return json({ error: 'not_configured' }, 503)
  const raw = await req.text()
  let event: Stripe.Event
  try { event = await stripe!.webhooks.constructEventAsync(raw, req.headers.get('stripe-signature') ?? '', secret, 300, crypto) } catch { return json({ error: 'invalid_signature' }, 400) }
  if (event.livemode !== LIVE) return json({ received: true })
  const { data: seen } = await db.from('crown_stripe_events').select('id').eq('id', event.id).maybeSingle()
  if (seen) return json({ received: true })
  const o = event.data.object as unknown as Record<string, unknown>
  if (event.type.startsWith('customer.subscription.')) {
    await syncSubscription(await stripe!.subscriptions.retrieve((o as { id: string }).id))
  } else if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const s = await stripe!.checkout.sessions.retrieve(o.id as string)
    if (s.mode === 'subscription' && s.subscription) await syncSubscription(await stripe!.subscriptions.retrieve(typeof s.subscription === 'string' ? s.subscription : s.subscription.id))
    if (ourOrder(s) && (s.payment_status === 'paid' || s.payment_status === 'no_payment_required')) await confirmationEmail(s).catch((e) => console.error('confirmation email', e))
    if (s.mode === 'payment' && s.metadata?.kind === 'gulf' && s.payment_status === 'paid') {
      const months = Number(s.metadata.months) || 1
      const { data: last } = await db.from('gulf_passes').select('until').eq('user_id', s.metadata.user_id).eq('plan_id', s.metadata.plan).gt('until', new Date().toISOString()).order('until', { ascending: false }).limit(1)
      const from = last?.[0] ? new Date(last[0].until) : new Date() // a renewal extends an unexpired pass
      from.setMonth(from.getMonth() + months)
      const { error } = await db.from('gulf_passes').upsert({ user_id: s.metadata.user_id, plan_id: s.metadata.plan, until: from.toISOString(),
        amount_cents: s.amount_total ?? 0, currency: s.currency ?? 'usd', stripe_session_id: s.id, livemode: s.livemode }, { onConflict: 'stripe_session_id', ignoreDuplicates: true })
      if (error) throw error
    }
  } else if (event.type === 'charge.refunded') {
    // Only a full refund ends a pass. A partial refund (a price reduction after a problem) keeps access.
    const c = o as { refunded?: boolean; payment_intent?: string }
    if (c.refunded === true && c.payment_intent) {
      const sessions = await stripe!.checkout.sessions.list({ payment_intent: c.payment_intent, limit: 1 })
      const s = sessions.data[0]
      if (s?.metadata?.kind === 'gulf') await db.from('gulf_passes').update({ refunded: true, until: new Date().toISOString() }).eq('stripe_session_id', s.id)
    }
  }
  await db.from('crown_stripe_events').insert({ id: event.id, type: event.type })
  return json({ received: true })
}

Deno.serve(async (req) => {
  const url = new URL(req.url)
  if (url.searchParams.get('hook') === '1') {
    if (req.method !== 'POST' || !stripe) return json({ error: 'unavailable' }, 503)
    try { return await hook(req) } catch (e) { console.error('hook', e); return json({ error: 'fulfillment_failed' }, 500) } // Stripe retries
  }
  const origin = req.headers.get('origin') ?? ''
  const cors: Record<string, string> = ORIGIN.test(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } : {}
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (origin && !ORIGIN.test(origin)) return json({ error: 'origin_not_allowed' }, 403)
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, cors)
  const wrap = async () => {
    const raw = await req.text(); if (raw.length > 4096) return json({ error: 'request_too_large' }, 413)
    const body = raw ? JSON.parse(raw) : {}
    if (body.action === 'status') return json({ configured: Boolean(stripe), livemode: LIVE })
    if (!stripe && body.action !== 'close_account') return json({ error: 'payments_unavailable' }, 503)
    const user = await userFrom(req)
    if (!user) return json({ error: 'sign_in_required' }, 401)
    if (body.action === 'checkout') return checkout(user, body)
    if (body.action === 'portal') return portal(user, body)
    if (body.action === 'refund') return refund(user, body)
    if (body.action === 'close_account') return closeAccount(user, body)
    return json({ error: 'invalid_request' }, 400)
  }
  try { const r = await wrap(); for (const [k, v] of Object.entries(cors)) r.headers.set(k, v); return r }
  catch (e) { console.error('billing', e); return json({ error: 'payment_request_failed', detail: String((e as Error)?.message ?? '').slice(0, 200) }, 500, cors) }
})
