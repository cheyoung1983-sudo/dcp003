const CACHE_NAME = 'dcp-diagnostic-lab-cache-v4';
const TEMPLATE_URL = '/api/ticket-templates';

const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon.png',
  '/icon.svg',
  '/manifest.json',
  '/pwa-192.png',
  '/pwa-512.png',
  '/apple-touch-icon.png'
];

// Install Event: Pre-cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching core layout files...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clear legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing legacy cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Handle caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Strategy 1: Stale-While-Revalidate for ticket templates
  if (url.pathname === TEMPLATE_URL) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch((err) => {
              console.warn('[Service Worker] Background revalidation fetch failed for templates:', err);
            });

          if (cachedResponse) {
            return cachedResponse;
          }

          return fetchPromise.then((networkResponse) => {
            if (networkResponse) {
              return networkResponse;
            }
            return new Response(
              JSON.stringify([
                {
                  id: 'tpl-fallback-screen',
                  name: 'Offline Screen Replacement Template (Emergency)',
                  brand: 'General',
                  issueType: 'screen',
                  description: 'Emergency local repair layout loaded from offline device registers.',
                  estimatedTime: '45 mins',
                  difficulty: 'Intermediate',
                  defaultPrice: 129.00
                }
              ]),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        });
      })
    );
    return;
  }

  // Handle API Requests (Network First, Cache Fallback for GET)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone).catch(() => {});
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response(
              JSON.stringify({
                offlineMode: true,
                message: 'Operating in Offline Lab Cache Mode. Real-time server sync paused.'
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // Handle Navigation HTML Requests (Network First, Cache Fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache).catch(() => {});
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const rootFallback = await caches.match('/');
          return rootFallback || new Response('Diagnostic Asset is offline', { status: 404 });
        })
    );
    return;
  }

  // Handle Static Assets (Stale-While-Revalidate)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache).catch(() => {});
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Message Event: Safe listener for client sync
self.addEventListener('message', (event) => {
  try {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ status: 'ack', version: CACHE_NAME });
    }
  } catch (err) {
    console.debug('[ServiceWorker] Message listener caught error:', err);
  }
});
