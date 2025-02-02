// Import Workbox library from CDN
importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.5.3/workbox-sw.js"); // eslint-disable-line no-undef

const { core, routing, strategies, cacheableResponse, expiration } = workbox; // eslint-disable-line no-undef

const { clientsClaim } = core;
const { registerRoute } = routing;
const { NetworkFirst, CacheFirst, StaleWhileRevalidate } = strategies;
const { CacheableResponsePlugin } = cacheableResponse;
const { ExpirationPlugin } = expiration;

// Listen for 'SKIP_WAITING' message and activate new service worker immediately
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

// Claim control of clients immediately after the service worker activates
clientsClaim();

// Cache page navigation requests using a 'Network First' strategy
// This tries the network first, and falls back to the cache if offline
registerRoute(
    ({ request }) => request.mode === "navigate",
    new NetworkFirst({
        cacheName: "pages",
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200], // Only cache successful responses
            }),
        ],
    })
);

// Cache CSS, JavaScript, and Web Worker files using a 'Stale While Revalidate' strategy
// This serves cached assets quickly and updates the cache in the background
registerRoute(
    ({ request }) =>
        request.destination === "style" || request.destination === "script" || request.destination === "worker",
    new StaleWhileRevalidate({
        cacheName: "assets",
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200], // Only cache successful responses
            }),
        ],
    })
);

// Cache image requests using a 'Cache First' strategy
// This serves images from the cache and updates only when necessary
registerRoute(
    ({ request }) => request.destination === "image",
    new CacheFirst({
        cacheName: "images",
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200], // Only cache successful responses
            }),
            new ExpirationPlugin({
                maxEntries: 50, // Limit to 50 images in the cache
                maxAgeSeconds: 60 * 60 * 24 * 30, // Cache for 30 days
            }),
        ],
    })
);
