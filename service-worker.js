
const CACHE_NAME = 'nes-checklist-v6';
const ASSETS = [
  './favicon-32.png',
  './',
  './index.html',
  './manifest.json',
  './service-worker.js',
  './1000007845.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((cached) => cached || fetch(evt.request))
  );
});
