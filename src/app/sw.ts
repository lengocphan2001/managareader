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
  // Use only default cache - let nginx handle image caching
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

// SIMPLE MANGA COVER CACHING - No complex logic
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  
  // Only handle manga cover images
  if (url.hostname === "mangadex.org" || 
      url.hostname === "resizer.f-ck.me" || 
      url.pathname.includes("/covers/")) {
    
    console.log("Manga cover request:", event.request.url);
    
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
          }).catch((error) => {
            console.error("Failed to fetch manga cover:", event.request.url, error);
            // Return a placeholder or error response
            return new Response("Image not available", { status: 404 });
          });
        });
      })
    );
  }
});

serwist.addEventListeners();
