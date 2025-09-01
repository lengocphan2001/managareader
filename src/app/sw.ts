import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

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

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // Use only default cache - no custom image caching
  runtimeCaching: defaultCache,
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

// SIMPLE APPROACH: Force page reload for fresh images
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  
  // For manga cover images, force a fresh load by bypassing cache
  if (
    url.hostname === "mangadex.org" ||
    url.hostname === "resizer.f-ck.me" ||
    url.pathname.includes("/covers/")
  ) {
    console.log("Manga cover request - forcing fresh load:", event.request.url);
    
    // Force fresh load by adding cache-busting headers
    const freshRequest = new Request(event.request.url, {
      method: event.request.method,
      headers: event.request.headers,
      mode: event.request.mode,
      credentials: event.request.credentials,
      cache: 'no-cache', // Force fresh load
    });
    
    event.respondWith(
      fetch(freshRequest).then((response) => {
        // Don't cache the response - always fetch fresh
        return response;
      }).catch((error) => {
        console.error("Failed to fetch manga cover:", event.request.url, error);
        // Return a placeholder or error response
        return new Response("Image not available", { status: 404 });
      })
    );
  }
});

// Add event listeners for debugging
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
          // Keep only the serwist cache, remove all old ones
          if (!cacheName.includes("serwist")) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

serwist.addEventListeners();
