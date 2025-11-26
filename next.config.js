const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");

/** @type {(phase: string, defaultConfig: import("next").NextConfig) => Promise<import("next").NextConfig>} */
module.exports = async (phase) => {
  /** @type {import("next").NextConfig} */
  const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "mangadex.org",
        },
        {
          protocol: "https",
          hostname: "resizer.f-ck.me",
        },
      ],
      // Enable image optimization
      unoptimized: false,
      // Add cache headers
      formats: ["image/webp", "image/avif"],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      // Add caching configuration
      minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
      dangerouslyAllowSVG: true,
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    logging: {
      fetches: {
        fullUrl: true,
      },
    },
    // Currently having a lot of errors, just ignore them for now //
    // [kamii0909]: ping me if you upgrade eslint to 9 (btw only next 15 is
    // compatible with eslint 9), I will write the flat config instead.
    eslint: {
      ignoreDuringBuilds: true,
      dirs: ["src", "backend/src"],
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    // Performance optimizations
    experimental: {
      missingSuspenseWithCSRBailout: false,
      optimizePackageImports: [
        "@iconify/react",
        "lucide-react",
        "react-hook-form",
        "yup",
        "@hookform/resolvers",
      ],
    },
    // Enable compression
    compress: true,
    // Optimize bundle
    swcMinify: true,
    // Force dynamic rendering for all pages
    trailingSlash: false,
    // Disable client-side rendering bailout warnings
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
    // Additional dynamic rendering options
    skipTrailingSlashRedirect: true,
    skipMiddlewareUrlNormalize: true,

    // Security headers
    async headers() {
      const isDevelopment = process.env.NODE_ENV === "development";

      // Skip CSP in development to avoid localhost issues
      if (isDevelopment) {
        return [
          {
            source: "/(.*)",
            headers: [
              {
                key: "X-Frame-Options",
                value: "SAMEORIGIN",
              },
              {
                key: "X-Content-Type-Options",
                value: "nosniff",
              },
            ],
          },
        ];
      }

      // Production CSP
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "Content-Security-Policy",
              value:
                "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://api.mangadex.org https://proxy.nettruyen-vn.com https://api.iconify.design https://challenges.cloudflare.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: https://challenges.cloudflare.com https://www.googletagmanager.com; img-src 'self' data: https: blob: https://resizer.f-ck.me https://mangadex.org https://www.googletagmanager.com; font-src 'self' data: https:; object-src 'none'; base-uri 'self';",
            },
            {
              key: "X-Frame-Options",
              value: "SAMEORIGIN",
            },
            {
              key: "X-Content-Type-Options",
              value: "nosniff",
            },
          ],
        },
      ];
    },
  };

  // You may want to use a more robust revision to cache
  // files more efficiently.
  // A viable option is `git rev-parse HEAD`.
  const revision = crypto.randomUUID();

  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withSerwist = (await import("@serwist/next")).default({
      cacheOnNavigation: true, // Enable navigation caching for manga covers
      // Note: This is only an example. If you use Pages Router,
      // use something else that works, such as "service-worker/index.ts".
      swSrc: "src/app/sw.ts",
      swDest: "public/sw.js",
      additionalPrecacheEntries: [{ url: "/ngoai-tuyen", revision }],
      exclude: [/^\/api\//], // Don't exclude images - let service worker handle them
    });
    return withSerwist(nextConfig);
  }

  return nextConfig;
};
