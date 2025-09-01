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

// DISABLE SERVICE WORKER CACHING - Let requests go through normally
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

// DON'T INTERCEPT ANY REQUESTS - Let them go through normally
// This prevents the 404 errors from external URLs like resizer.f-ck.me

// Add event listeners for debugging
self.addEventListener("install", (event) => {
  console.log("Service Worker installing... CACHING DISABLED");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating... CACHING DISABLED");
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
