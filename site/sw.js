/* Service worker: offline support for the home page.
   Pages are network-first (fresh content when online, cached copy offline);
   static assets are stale-while-revalidate. Cross-origin requests
   (the Supabase API) are never cached. Bump VERSION on every release.
   /carecraft and /serein use content-hashed file names, so cached copies never go stale. */
const VERSION = 'hca-v39';
const CORE = [
  '/',
  '/privacy',
  '/assets/css/styles.css',
  '/assets/js/config.js',
  '/assets/js/main.js',
  '/assets/fonts/fraunces-var.woff2',
  '/assets/fonts/fraunces-var-italic.woff2',
  '/assets/fonts/geist-var.woff2',
  '/assets/img/favicon.svg',
  '/assets/icons/icon-192.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Large one-off downloads (the offline Carecraft edition) are never cached here,
  // and Serein's own offline worker takes over /serein once someone turns it on.
  if (url.pathname.startsWith('/carecraft/download/')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) => {
      const network = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || network;
    })
  );
});
