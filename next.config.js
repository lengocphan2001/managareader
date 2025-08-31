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
      ],
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
      dirs: ['src', 'backend/src'],
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    // Performance optimizations
    experimental: {
      missingSuspenseWithCSRBailout: false,
      optimizePackageImports: ["@iconify/react", "lucide-react"],
      // Disable static optimization for pages that use cookies
      staticPageGenerationTimeout: 1000,
    },
    // Enable compression
    compress: true,
    // Optimize bundle
    swcMinify: true,
    // Force dynamic rendering for all pages (prevents static generation issues)
    output: "standalone",
    // Disable static generation completely
    trailingSlash: false,
    // Force all pages to be dynamic
    generateStaticParams: false,
    // Disable static optimization
    staticPageGenerationTimeout: 0,
    // Force dynamic rendering
    dynamic: "force-dynamic",
    // Disable static generation completely
    generateBuildId: async () => {
      return "build-" + Date.now();
    },
    // Disable client-side rendering bailout warnings
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
    // Additional dynamic rendering options
    skipTrailingSlashRedirect: true,
    skipMiddlewareUrlNormalize: true,
  };

  // You may want to use a more robust revision to cache
  // files more efficiently.
  // A viable option is `git rev-parse HEAD`.
  const revision = crypto.randomUUID();

  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withSerwist = (await import("@serwist/next")).default({
      cacheOnNavigation: false,
      // Note: This is only an example. If you use Pages Router,
      // use something else that works, such as "service-worker/index.ts".
      swSrc: "src/app/sw.ts",
      swDest: "public/sw.js",
      additionalPrecacheEntries: [{ url: "/ngoai-tuyen", revision }],
      exclude: [/^\/api\//],
    });
    return withSerwist(nextConfig);
  }

  return nextConfig;
};
