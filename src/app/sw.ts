import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, NetworkFirst, StaleWhileRevalidate } from "serwist";

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

// Custom cache strategies for images
const imageCacheStrategy = new CacheFirst({
  cacheName: "image-cache",
  plugins: [
    {
      cacheKeyWillBeUsed: async ({ request }) => {
        // Create a unique cache key for each image
        const url = new URL(request.url);
        // Remove query parameters that might change
        const cleanUrl = url.origin + url.pathname;
        return cleanUrl;
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

const mangadexImageCacheStrategy = new CacheFirst({
  cacheName: "mangadex-images",
  plugins: [
    {
      cacheKeyWillBeUsed: async ({ request }) => {
        // Create a unique cache key for MangaDex images
        const url = new URL(request.url);
        // For MangaDex, we want to cache with size parameters
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

// Stale while revalidate for static assets
const staticCacheStrategy = new StaleWhileRevalidate({
  cacheName: "static-cache",
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Cache MangaDex images aggressively with proper strategy
    {
      matcher: ({ url }) =>
        url.hostname === "mangadex.org" ||
        url.hostname === "resizer.f-ck.me" ||
        url.pathname.includes("/covers/"),
      handler: mangadexImageCacheStrategy,
    },
    // Cache other images with proper strategy
    {
      matcher: ({ request }) => request.destination === "image",
      handler: imageCacheStrategy,
    },
    // Cache API calls
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: apiCacheStrategy,
    },
    // Cache static assets
    {
      matcher: ({ request }) => 
        request.destination === "style" ||
        request.destination === "script" ||
        request.destination === "font",
      handler: staticCacheStrategy,
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
          if (cacheName !== "image-cache" && 
              cacheName !== "mangadex-images" && 
              cacheName !== "api-cache" && 
              cacheName !== "static-cache") {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Log image requests for debugging
  if (event.request.destination === "image") {
    console.log("Image request:", event.request.url);
  }
});

serwist.addEventListeners();
