const VERSION = 'cat-trainer-3';
const DATEIEN = [
  './',
  'index.html',
  'style.css',
  'hilfen.js',
  'zeichnen.js',
  'gen-mathe.js',
  'gen-figuren.js',
  'gen-raum.js',
  'gen-technik.js',
  'gen-konzentration.js',
  'aufgaben.js',
  'speicher.js',
  'app.js',
  'manifest.webmanifest',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(namen => Promise.all(namen.filter(n => n !== VERSION).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(antwort => {
        if (antwort.ok) {
          const kopie = antwort.clone();
          caches.open(VERSION).then(c => c.put(e.request, kopie));
        }
        return antwort;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
