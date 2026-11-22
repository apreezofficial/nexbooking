// EdeBooking Progressive Web App Service Worker
const CACHE_NAME = 'edebooking-v1';
const PRECACHE_ASSETS = ['/', '/manifest.webmanifest', '/icon', '/apple-icon'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests, prioritize network then fallback to cache
  if (event.request.method !== 'GET') return;
  
  // Skip non-HTTP schemes (chrome-extension, etc.)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
