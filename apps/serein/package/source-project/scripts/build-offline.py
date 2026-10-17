"""Create a versioned, explicit-opt-in offline cache manifest and worker."""
from pathlib import Path
import hashlib, json

root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
files = sorted(p for p in dist.rglob('*') if p.is_file() and p.name not in ('sw.js', 'offline-assets.json'))
digest = hashlib.sha256()
for p in files:
    digest.update(str(p.relative_to(dist)).encode())
    digest.update(p.read_bytes())
cache_name = 'serein-hca-v4-' + digest.hexdigest()[:12]
urls = ['./' + p.relative_to(dist).as_posix() for p in files]
(dist / 'offline-assets.json').write_text(json.dumps({'cacheName': cache_name, 'files': urls}, indent=2))
worker = r'''/* SEREIN_OFFLINE_WORKER · Registered only after the user chooses offline access. */
const CACHE = __CACHE__;
const FILES = __FILES__;
const SCOPE = new URL('./', self.location.href);
const ALLOWED = new Set(FILES.map(path => new URL(path, SCOPE).href));
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const page = await fetch(new URL('./index.html', SCOPE), {cache:'no-store'});
    if (!page.ok || !(await page.clone().text()).includes('id="app-shell"')) throw new Error('App unavailable');
    await cache.addAll(FILES);
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('serein-hca-v4-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) return response;
      } catch (_) {}
      return (await caches.open(CACHE)).match(new URL('./index.html', SCOPE).href);
    })());
  } else if (ALLOWED.has(url.href)) {
    event.respondWith((async () => {
      const cached = await (await caches.open(CACHE)).match(request);
      return cached || fetch(request);
    })());
  }
});
'''.replace('__CACHE__', json.dumps(cache_name)).replace('__FILES__', json.dumps(urls))
(dist / 'sw.js').write_text(worker)
print(json.dumps({'cache': cache_name, 'assets': len(urls)}))
