import type { NextConfig } from "next";

// Non-script CSP directives only. script-src/style-src need a per-request nonce
// (Stripe.js, YouTube embeds, the inline theme-init script) — roll that out
// separately via proxy.ts in Report-Only mode first.
const CONTENT_SECURITY_POLICY = [
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com https://hooks.stripe.com",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=(), payment=(self \"https://js.stripe.com\" \"https://checkout.stripe.com\")",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Cache Components: "use cache" for cross-request catalog/review/nav reads
  // (lib/catalog/queries.ts, lib/catalog/nav-products.ts, lib/reviews/queries.ts).
  // The root layout is host + cookie bound (multi-tenant, locale), so routes stay
  // dynamic — the win is data caching + tag invalidation, not a static shell.
  cacheComponents: true,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.verveacesports.com" }],
        destination: "https://verveacesports.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/rover/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/catalog/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  // Admin image uploads use sharp. Vercel's trace has been dropping the
  // linux libvips binary (Next nests its own older sharp), so force-include it.
  outputFileTracingIncludes: {
    "/admin/products/*": [
      "./node_modules/@img/sharp-linux-x64/**/*",
      "./node_modules/@img/sharp-libvips-linux-x64/**/*",
    ],
    "/icon": ["./public/icons/**"],
    "/pwa-icon/[size]": ["./public/icons/**"],
    "/apple-touch-icon.png": ["./public/icons/**"],
    "/apple-touch-icon-precomposed.png": ["./public/icons/**"],
  },
  images: {
    // Do not set loader: "custom". Next answers /_next/image with the 404 page
    // unless the loader is "default", and every catalog <Image> points there.
    formats: ["image/avif", "image/webp"],
    // Next 16 only allows listed qualities; 82/90 are used on LCP assets.
    qualities: [75, 82, 90],
    // Drop 3840 — we never have sources that large, it just upscales.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Prefer sized CDN URLs (see lib/images/cdn.ts); cache optimized outputs longer.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
