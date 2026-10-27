/* My account page: plan, Gulf exam passes and apps for the signed-in person (reads their own rows only). */
(() => {
  const SUPABASE = 'https://ujeofxfbwivjmgrxqdcl.supabase.co';
  const KEY = 'sb_publishable_ie1qqB5QnaqUZPitNPfQCg__M46e7JL';
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const day = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const PLAN = { crown: 'Crown Pass', medlex: 'MedLex Premium', carecraft: 'Carecraft Premium', lumen: 'Lumen Premium' };
  const EXAM = { saudi: 'Saudi SNLE', qatar: 'Qatar DHP', dubai: 'Dubai DHA', abudhabi: 'Abu Dhabi DOH' };
  const APPS = [
    ['medlex', 'MedLex', 'Medical words', 'https://medlex.healthcarecrownacademy.co.uk/'],
    ['carecraft', 'Carecraft', 'Real situations', 'https://carecraft.healthcarecrownacademy.co.uk/'],
    ['lumen', 'Lumen', 'Your notes, remembered', 'https://lumen.healthcarecrownacademy.co.uk/'],
    ['serein', 'Serein', 'Always free', 'https://serein.healthcarecrownacademy.co.uk/'],
    ['snle', 'Gulf Region Nursing', 'Exam studio', 'https://snle.healthcarecrownacademy.co.uk/'],
    ['evinca', 'Evinca', 'Recognition', 'https://evinca.healthcarecrownacademy.co.uk/en'],
  ];

  async function rows(path, token) {
    const r = await fetch(`${SUPABASE}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: 'Bearer ' + token } });
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }

  function planBlock(subs) {
    const s = subs.find((x) => ['trialing', 'active', 'past_due'].includes(x.status));
    if (!s) return { html: '<p class="ac-empty">No plan yet. Your free features are always yours.</p>', has: false };
    const name = PLAN[String(s.plan_id).split('-')[0]] || 'Plan';
    const yearly = /year/.test(s.plan_id);
    const pill = s.status === 'trialing' ? '<span class="ac-pill warn">Free trial</span>' : s.status === 'past_due' ? '<span class="ac-pill warn">Payment due</span>' : s.cancel_at_period_end ? '<span class="ac-pill off">Ends soon</span>' : '<span class="ac-pill">Active</span>';
    const end = s.current_period_end ? day(s.current_period_end) : '—';
    const when = s.status === 'trialing' ? 'First payment' : s.cancel_at_period_end ? 'Access until' : 'Renews on';
    return { has: true, name, html: `<div class="ac-row"><b>${esc(name)}</b><span>${pill}</span></div>
      <div class="ac-row"><b>Billing</b><span>${yearly ? 'Yearly' : 'Monthly'}</span></div>
      <div class="ac-row"><b>${when}</b><span>${esc(end)}</span></div>` };
  }

  function gulfBlock(passes) {
    const now = Date.now();
    const live = passes.filter((p) => !p.refunded && Date.parse(p.until) > now);
    if (!live.length) return '<p class="ac-empty">No active exam pass. The first 10 questions of every exam are free.</p>';
    return live.map((p) => { const k = String(p.plan_id).split('-')[1]; return `<div class="ac-row"><b>${esc(EXAM[k] || 'Gulf exam')}</b><span><span class="ac-pill">Active</span> until ${esc(day(p.until))}</span></div>`; }).join('');
  }

  async function init() {
    if (!window.HCA) return;
    const e = await HCA.ready.catch(() => ({ signed_in: false }));
    const s = await HCA.session().catch(() => null);
    if (!e.signed_in || !s) {
      $('[data-ac-name]').textContent = 'Welcome';
      $('[data-ac-out]').hidden = false;
      $('[data-ac-signin]').addEventListener('click', (ev) => { ev.preventDefault(); HCA.signIn(); });
      return;
    }
    const name = s.name || s.email.split('@')[0];
    $('[data-ac-name]').textContent = name;
    $('[data-ac-email]').textContent = s.email;
    $('[data-ac-initials]').textContent = name.split(/[\s.@_-]+/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join('') || '?';
    $$('[data-ac-in]').forEach((x) => { x.hidden = false; });

    const badge = $('[data-ac-badge]');
    const premium = ['medlex', 'carecraft', 'lumen'].filter((k) => e[k] === 'premium');
    badge.hidden = false;
    if (e.admin) { badge.textContent = 'Admin'; badge.classList.add('gold'); }
    else if (e.crown) { badge.textContent = '♛ Crown Pass member'; badge.classList.add('gold'); }
    else badge.textContent = premium.length ? 'Premium member' : 'Free plan';

    $('[data-ac-apps]').innerHTML = APPS.filter(([k]) => k !== 'snle' || (HCA.live && HCA.live.snle)).map(([k, n, d, u]) => {
      const tag = k === 'serein' ? 'Free' : (k === 'medlex' || k === 'carecraft' || k === 'lumen') ? (e.admin || e.crown || e[k] === 'premium' ? 'Premium' : 'Free plan') : d;
      return `<a class="ac-app" href="${u}"><b>${n}</b><small>${esc(tag)}</small></a>`;
    }).join('');

    try {
      const subs = await rows('crown_subscriptions?select=plan_id,status,current_period_end,cancel_at_period_end,livemode&order=updated_at.desc', s.access_token);
      const p = planBlock(subs);
      $('[data-ac-plan]').innerHTML = p.html;
      $('[data-ac-manage]').hidden = !p.has; $('[data-ac-choose]').hidden = p.has;
    } catch { $('[data-ac-plan]').innerHTML = '<p class="ac-empty">We could not load your plan just now. Please refresh.</p>'; }
    try {
      const passes = await rows('gulf_passes?select=plan_id,until,refunded&order=until.desc', s.access_token);
      $('[data-ac-gulf]').innerHTML = gulfBlock(passes);
    } catch { $('[data-ac-gulf]').innerHTML = '<p class="ac-empty">We could not load your passes just now. Please refresh.</p>'; }

    $('[data-ac-manage]').addEventListener('click', async (ev) => {
      const b = ev.currentTarget; b.disabled = true; b.textContent = 'Opening…';
      const r = await HCA.manageBilling(); b.disabled = false; b.textContent = 'Manage or cancel';
      if (r && r.error && r.error !== 'sign_in_required') alert('We could not open billing just now. Please try again in a moment.');
    });
    $('[data-ac-signout]').addEventListener('click', () => { if (HCA.signOut) HCA.signOut(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
