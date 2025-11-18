// Name of the cache for this version of the PWA
const CACHE_NAME = 'mindful-tracker-v1'; 

// List of all files that need to be cached for the app to work offline
const urlsToCache = [
    'index.html',
    'why_story.html',
    'support.html',
    'manifest.json',
    'service-worker.js',
    'https://cdn.tailwindcss.com' // Caching the external Tailwind script
];

// --- 1. Installation: Caching all assets ---
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('[Service Worker] Caching failed:', error);
            })
    );
});

// --- 2. Activation: Cleaning up old caches ---
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                    return null;
                })
            );
        })
    );
    // Ensure the service worker controls the page immediately
    return self.clients.claim();
});

// --- 3. Fetch: Serving content from cache first (Cache-First strategy) ---
self.addEventListener('fetch', (event) => {
    // Only cache GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Cache hit - return the cached response
            if (response) {
                return response;
            }

            // No cache hit - fetch from network
            return fetch(event.request).catch(() => {
                // If fetching fails, and it's an HTML page, show a fallback or a default page
                if (event.request.mode === 'navigate') {
                    // We don't have a dedicated offline page, so we just let the browser handle the offline error
                    return new Response("You are offline and this resource is not cached.", { status: 503, statusText: "Offline" });
                }
            });
        })
    );
});
