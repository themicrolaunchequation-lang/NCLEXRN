/* HCA v6 — Lumen experience layer, injected after v5 (see lumen/tools/build.mjs).
   Adds Academy AI: members sign in with their Evinca account and use the Academy's own AI service
   (Supabase Edge Function "lumen-ai", see lumen/supabase). Nobody needs an API key.
   Academy AI sits first in the fallback chain; members can still add their own keys after it.
   The sign-in is stored apart from the workspace (IndexedDB key "academy"), never in backups. */

/* Public by design: the project address and its publishable key, as in the Evinca home page config. */
const HCA6Academy = {
  url: 'https://ujeofxfbwivjmgrxqdcl.supabase.co',
  key: 'sb_publishable_ie1qqB5QnaqUZPitNPfQCg__M46e7JL',
  evinca: 'https://evinca.healthcarecrownacademy.co.uk',
};
const HCA6_SESSION = 'lumen.academy.session';

HCA5Providers.unshift({
  id: 'academy', name: 'Academy AI', kind: 'academy', model: 'academy', tier: 'academy',
  free: 'Included with your Evinca membership, with a daily allowance. No key to set up.',
  privacy: 'Runs on the Academy’s paid AI accounts (Google Gemini, with Groq as backup), which do not use your text to train models. A request that another member already sent is answered from a shared store, without using your allowance.',
});
if (!HCA5Store.config.order.includes('academy')) HCA5Store.config.order.unshift('academy');
if (!HCA5Store.config.providers.academy) HCA5Store.config.providers.academy = { enabled: true };

/* ---------- Sign-in (Supabase Auth, email and password, as in Evinca) ---------- */
const HCA6Auth = { session: null, status: null };
try {
  const saved = HCA4Store.db ? await HCA4Read(HCA4Store.db, 'academy') : null;
  HCA6Auth.session = saved?.refresh_token ? saved : JSON.parse(sessionStorage.getItem(HCA6_SESSION) || 'null');
} catch {}

function HCA6Keep(session) {
  HCA6Auth.session = session;
  const remember = session?.remember !== false;
  try { if (session && !remember) sessionStorage.setItem(HCA6_SESSION, JSON.stringify(session)); else sessionStorage.removeItem(HCA6_SESSION); } catch {}
  if (HCA4Store.db) HCA4Write(HCA4Store.db, 'academy', session && remember ? session : null).catch(() => HCA4StorageProblem('db-only'));
  window.dispatchEvent(new Event('hca5-ai-config'));
}

async function HCA6AuthFetch(path, body, token) {
  let res;
  try {
    res = await fetch(`${HCA6Academy.url}/auth/v1/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: HCA6Academy.key, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body || {}),
    });
  } catch { throw new HCA5Error('Could not reach Evinca. Check your connection.', 'network', 60); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new HCA5Error(data.error_description || data.msg || data.message || `Sign-in failed (${res.status}).`, res.status === 400 || res.status === 401 ? 'key' : 'request');
  return data;
}

const HCA6FromAuth = (data, remember) => ({
  email: data.user?.email || HCA6Auth.session?.email || '',
  access_token: data.access_token, refresh_token: data.refresh_token,
  expires_at: data.expires_at ? data.expires_at * 1000 : Date.now() + (data.expires_in || 3600) * 1000,
  remember,
});

async function HCA6SignIn(email, password, remember) {
  const data = await HCA6AuthFetch('token?grant_type=password', { email: email.trim(), password });
  HCA6Keep(HCA6FromAuth(data, remember));
  HCA5SetStatus(s => { delete s.until.academy; delete s.note.academy; });
}

async function HCA6SignOut() {
  const token = HCA6Auth.session?.access_token;
  HCA6Keep(null);
  HCA6Auth.status = null;
  if (token) HCA6AuthFetch('logout', {}, token).catch(() => {});
}

let HCA6Refreshing = null;
async function HCA6Token(force = false) {
  const s = HCA6Auth.session;
  if (!s?.refresh_token) throw new HCA5Error('Sign in to use Academy AI.', 'key');
  if (!force && s.expires_at - Date.now() > 60000) return s.access_token;
  HCA6Refreshing ??= HCA6AuthFetch('token?grant_type=refresh_token', { refresh_token: s.refresh_token })
    .then(data => { HCA6Keep(HCA6FromAuth(data, s.remember)); return data.access_token; })
    .catch(err => { if (err.kind === 'key') HCA6Keep(null); throw err.kind === 'key' ? new HCA5Error('Your sign-in has expired. Sign in again to use Academy AI.', 'key') : err; })
    .finally(() => { HCA6Refreshing = null; });
  return HCA6Refreshing;
}

/* ---------- Calling Academy AI ---------- */
async function HCA6Post(body, signal, timeoutMs = 95000) {
  const send = async token => {
    const ctl = new AbortController(), stop = () => ctl.abort();
    signal?.addEventListener('abort', stop, { once: true });
    const timer = setTimeout(stop, timeoutMs);
    try {
      return await fetch(`${HCA6Academy.url}/functions/v1/lumen-ai`, {
        method: 'POST', signal: ctl.signal,
        headers: { 'Content-Type': 'application/json', apikey: HCA6Academy.key, Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
    } catch {
      if (signal?.aborted) throw new DOMException('Stopped', 'AbortError');
      throw new HCA5Error(ctl.signal.aborted ? 'Academy AI took too long to answer.' : 'Could not reach Academy AI. Check your connection.', 'network', 120);
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', stop); }
  };
  let res = await send(await HCA6Token());
  if (res.status === 401) res = await send(await HCA6Token(true));
  const data = await res.json().catch(() => ({}));
  if (res.ok) return data;
  const message = data.message || `Academy AI failed (${res.status}).`;
  if (res.status === 401) { HCA6Keep(null); throw new HCA5Error('Sign in again to use Academy AI.', 'key'); }
  if (res.status === 403) throw new HCA5Error(message, 'key');
  if (res.status === 429) throw new HCA5Error(message, 'quota', data.retryAfter || 3600);
  if (res.status >= 500) throw new HCA5Error(message, 'server', data.retryAfter || 300);
  throw new HCA5Error(message, 'request');
}

async function HCA6Allowance() {
  if (!HCA6Auth.session) return null;
  try { HCA6Auth.status = await HCA6Post({ action: 'status' }, null, 20000); }
  catch (err) { HCA6Auth.status = { error: err.message }; }
  window.dispatchEvent(new Event('hca5-ai-config'));
  return HCA6Auth.status;
}

const HCA6Prev = { Call: HCA5Call, Ready: HCA5Ready, Row: HCA5ProviderRow };
HCA5Call = async function HCA6Call(id, request) {
  if (id !== 'academy') return HCA6Prev.Call(id, request);
  const { system, prompt, json, maxTokens, signal } = request;
  const data = await HCA6Post({ system, prompt, json: !!json, maxTokens }, signal);
  if (typeof data.remaining === 'number' && HCA6Auth.status?.limit) HCA6Auth.status = { ...HCA6Auth.status, remaining: data.remaining, used: HCA6Auth.status.limit - data.remaining };
  return data.text || '';
};
HCA5Ready = function HCA6Ready() {
  const keys = HCA6Prev.Ready();
  return HCA5Store.config.order.filter(id => (id === 'academy' ? !!HCA5Settings(id).enabled && !!HCA6Auth.session : keys.includes(id)));
};

/* ---------- The Academy AI row in the AI dialog ---------- */
function HCA6AcademyRow({ id, index, count, config, update, move }) {
  const ctx = y(), s = { ...HCA5Settings(id), ...config.providers[id] }, session = HCA6Auth.session;
  const [email, setEmail] = _.useState(session?.email || ''), [password, setPassword] = _.useState(''), [remember, setRemember] = _.useState(true);
  const [busy, setBusy] = _.useState(false), [message, setMessage] = _.useState('');
  const status = HCA5Status(), cooling = status.until[id] > Date.now(), allowance = HCA6Auth.status;
  _.useEffect(() => { if (session && s.enabled && !allowance) HCA6Allowance(); }, [!!session, s.enabled]);
  const signIn = async e => {
    e?.preventDefault?.();
    if (busy || !email || !password) return;
    setBusy(true); setMessage('');
    try { await HCA6SignIn(email, password, remember); setPassword(''); ctx.toast('Signed in to Academy AI.'); HCA6Allowance(); }
    catch (err) { setMessage(/invalid/i.test(err.message) ? 'That email and password do not match an Evinca account.' : err.message); }
    setBusy(false);
  };
  const signOut = () => { HCA6SignOut(); setMessage(''); ctx.toast('Signed out of Academy AI on this device.'); };
  return HC('li', { className: `hca5-provider hca6-academy ${s.enabled ? 'on' : ''}` },
    HC('div', { className: 'hca5-provider-head' },
      HC('label', { className: 'hca5-switch' }, HC('input', { type: 'checkbox', checked: !!s.enabled, onChange: e => update(id, { enabled: e.target.checked }) }), HC('strong', {}, 'Academy AI')),
      HC('span', { className: 'hca5-tier academy' }, 'Included for members'),
      cooling && HC('span', { className: 'hca5-tier cooling' }, `Resting until ${new Date(status.until[id]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`),
      HC('span', { className: 'grow' }),
      allowance?.limit ? HC('span', { className: 'hca-small' }, `${allowance.remaining} of ${allowance.limit} left today`) : null,
      HC('span', { className: 'hca5-moves' },
        HC('button', { type: 'button', className: 'hca3-icon-btn', 'aria-label': 'Try Academy AI earlier', disabled: index === 0, onClick: () => move(id, -1) }, HCAIcon('arrow-up-line')),
        HC('button', { type: 'button', className: 'hca3-icon-btn', 'aria-label': 'Try Academy AI later', disabled: index === count - 1, onClick: () => move(id, 1) }, HCAIcon('arrow-down-line')))),
    s.enabled && HC('div', { className: 'hca5-provider-body' },
      HC('p', { className: 'hca-small' }, HCA5Provider(id).free, ' ', HCA5Provider(id).privacy),
      session
        ? HC(_.Fragment, {},
            HC('p', { className: 'hca6-signed' }, HCAIcon('shield-check-line'), HC('span', {}, 'Signed in as ', HC('strong', {}, session.email || 'your Evinca account'),
              allowance?.limit ? `. ${allowance.remaining} of today’s ${allowance.limit} requests left; they reset at midnight UTC.` : allowance?.error ? `. ${allowance.error}` : '.')),
            HC('div', { className: 'hca5-test' }, HCABtn('Sign out', signOut, 'secondary', 'close-line'), HCABtn('Check allowance', () => HCA6Allowance(), 'secondary', 'refresh-line')))
        : HC('form', { className: 'hca6-signin', onSubmit: signIn },
            HC('label', {}, 'Evinca email', HC('input', { type: 'email', value: email, onChange: e => setEmail(e.target.value), autoComplete: 'username', required: true })),
            HC('label', {}, 'Password', HC('input', { type: 'password', value: password, onChange: e => setPassword(e.target.value), autoComplete: 'current-password', required: true })),
            HC('label', { className: 'hca4-check' }, HC('input', { type: 'checkbox', checked: remember, onChange: e => setRemember(e.target.checked) }), 'Stay signed in on this device (otherwise you are signed out when you close the tab)'),
            HC('div', { className: 'hca5-test' },
              HCABtn(busy ? 'Signing in…' : 'Sign in', signIn, 'primary', 'arrow-right-line', { disabled: busy || !email || !password }),
              HC('a', { href: `${HCA6Academy.evinca}/en/sign-in?mode=signup`, target: '_blank', rel: 'noopener noreferrer', className: 'text-link inline' }, 'Create a free Evinca account', HCAIcon('external-link-line')),
              HC('a', { href: `${HCA6Academy.evinca}/en/sign-in`, target: '_blank', rel: 'noopener noreferrer', className: 'text-link inline' }, 'Forgot your password?', HCAIcon('external-link-line')))),
      message && HC('p', { className: 'hca-studio-error', role: 'alert' }, message),
      HC('p', { className: 'hca-small' }, 'Your password goes only to Evinca and is not stored. Lumen keeps a sign-in token in this browser, never in backups.')));
}
HCA5ProviderRow = function HCA6ProviderRow(props) {
  return props.id === 'academy' ? HC(HCA6AcademyRow, props) : HC(HCA6Prev.Row, props);
};
