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

// COMPLETELY DISABLE SERVICE WORKER - NO CACHING AT ALL
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // NO RUNTIME CACHING - completely disabled
  runtimeCaching: [],
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

// COMPLETELY DISABLE ALL CACHING - force fresh load for everything
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  
  // For ALL requests, force fresh load
  console.log("Service Worker: Forcing fresh load for:", event.request.url);
  
  // Force fresh load by adding cache-busting headers
  const freshRequest = new Request(event.request.url, {
    method: event.request.method,
    headers: event.request.headers,
    mode: event.request.mode,
    credentials: event.request.credentials,
    cache: "no-cache", // Force fresh load
  });
  
  event.respondWith(
    fetch(freshRequest)
      .then((response) => {
        // Don't cache anything - always fetch fresh
        return response;
      })
      .catch((error) => {
        console.error("Failed to fetch:", event.request.url, error);
        // Return error response
        return new Response("Resource not available", { status: 404 });
      }),
  );
});

// Add event listeners for debugging
self.addEventListener("install", (event) => {
  console.log("Service Worker installing... DISABLED MODE");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating... DISABLED MODE");
  // Clean up ALL old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log("Deleting ALL caches:", cacheName);
          return caches.delete(cacheName);
        }),
      );
    }),
  );
});

serwist.addEventListeners();
