import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, NetworkFirst } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Manga cover image caching strategy - ALWAYS serve from cache if available
const mangaCoverCacheStrategy = new CacheFirst({
  cacheName: "manga-covers",
  plugins: [
    {
      cacheKeyWillBeUsed: async ({ request }) => {
        // Create a stable cache key for manga covers
        const url = new URL(request.url);
        
        // For MangaDex covers, cache by manga ID and size
        if (url.hostname === "mangadex.org" && url.pathname.includes("/covers/")) {
          // Extract manga ID and size from URL
          const pathParts = url.pathname.split("/");
          const mangaId = pathParts[2]; // /covers/{mangaId}/{filename}.{size}.jpg
          const filename = pathParts[3];
          const size = filename.split(".")[1]; // Extract size from filename
          return `manga-cover-${mangaId}-${size}`;
        }
        
        // For resizer URLs, cache by the original manga cover URL
        if (url.hostname === "resizer.f-ck.me") {
          const originalUrl = url.searchParams.get("url");
          if (originalUrl && originalUrl.includes("/covers/")) {
            const originalUrlObj = new URL(originalUrl);
            const pathParts = originalUrlObj.pathname.split("/");
            const mangaId = pathParts[2];
            const filename = pathParts[3];
            const size = filename.split(".")[1];
            return `manga-cover-resized-${mangaId}-${size}`;
          }
        }
        
        // Fallback to original URL
        return request.url;
      },
    },
    {
      cacheWillUpdate: async ({ response }) => {
        // Only cache successful responses
        return response.status === 200 ? response : null;
      },
    },
  ],
});

// Network first strategy for API calls
const apiCacheStrategy = new NetworkFirst({
  cacheName: "api-cache",
  networkTimeoutSeconds: 3,
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Cache manga cover images with proper strategy
    {
      matcher: ({ url }) =>
        url.hostname === "mangadex.org" ||
        url.hostname === "resizer.f-ck.me" ||
        url.pathname.includes("/covers/"),
      handler: mangaCoverCacheStrategy,
    },
    // Cache API calls
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: apiCacheStrategy,
    },
    // Default cache for other resources
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/ngoai-tuyen",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// Add event listeners for better debugging
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Keep only the new cache names, remove all old ones
          if (!cacheName.includes("manga-covers") && 
              !cacheName.includes("api-cache") && 
              !cacheName.includes("serwist")) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// CRITICAL: Intercept ALL fetch requests to ensure manga covers are served from cache
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  
  // Log manga cover requests for debugging
  if (url.hostname === "mangadex.org" || url.hostname === "resizer.f-ck.me") {
    console.log("Manga cover request:", event.request.url);
  }
  
  // Handle manga cover images specifically
  if (url.hostname === "mangadex.org" || 
      url.hostname === "resizer.f-ck.me" || 
      url.pathname.includes("/covers/")) {
    
    event.respondWith(
      caches.open("manga-covers").then((cache) => {
        // Try to get from cache first
        return cache.match(event.request).then((response) => {
          if (response) {
            console.log("Serving manga cover from cache:", event.request.url);
            return response;
          }
          
          // If not in cache, fetch from network and cache it
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              // Clone the response before caching
              const responseToCache = networkResponse.clone();
              cache.put(event.request, responseToCache);
              console.log("Cached new manga cover:", event.request.url);
            }
            return networkResponse;
          });
        });
      })
    );
  }
});

serwist.addEventListeners();
