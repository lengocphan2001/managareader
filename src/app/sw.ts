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

// Custom cache strategies for images
const imageCacheStrategy = {
  cacheName: "image-cache",
  strategy: "CacheFirst" as const,
  options: {
    cacheName: "image-cache",
    cacheableResponse: {
      statuses: [0, 200],
    },
    expiration: {
      maxEntries: 1000,
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
    },
  },
};

const mangadexImageCacheStrategy = {
  cacheName: "mangadex-images",
  strategy: "CacheFirst" as const,
  options: {
    cacheName: "mangadex-images",
    cacheableResponse: {
      statuses: [0, 200],
    },
    expiration: {
      maxEntries: 2000,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
    },
  },
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Cache MangaDex images aggressively
    {
      matcher: ({ url }) => 
        url.hostname === "mangadex.org" || 
        url.hostname === "resizer.f-ck.me" ||
        url.pathname.includes("/covers/"),
      handler: mangadexImageCacheStrategy,
    },
    // Cache other images
    {
      matcher: ({ request }) => request.destination === "image",
      handler: imageCacheStrategy,
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

serwist.addEventListeners();
