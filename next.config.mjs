import withPWAInit from "next-pwa";
import defaultRuntimeCaching from "next-pwa/cache.js";

const isProduction = process.env.NODE_ENV === "production";

const runtimeCaching = defaultRuntimeCaching.map((entry) => {
  if (entry.options?.cacheName === "others") {
    return {
      ...entry,
      urlPattern: ({ url }) =>
        url.origin === self.location.origin &&
        !url.pathname.startsWith("/api/") &&
        !url.pathname.startsWith("/_next/data/"),
      options: {
        ...entry.options,
        // Mobile networks often need longer than 10s before falling back to cache-only.
        networkTimeoutSeconds: 30,
      },
    };
  }
  return entry;
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
};

const withPWA = withPWAInit({
  dest: "public",
  disable: !isProduction,
  register: true,
  skipWaiting: true,
  runtimeCaching,
  // Do not use document fallbacks: on mobile, flaky networks trigger handlerDidError and
  // serve /offline for navigations that are still online, breaking the app shell + hydration.
  cacheOnFrontEndNav: true,
});

export default withPWA(nextConfig);
