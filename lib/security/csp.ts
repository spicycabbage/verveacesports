// Nonce-based Content-Security-Policy, sent as Report-Only from proxy.ts.
//
// Rollout: watch /api/csp-report (Vercel logs) for violations for a week or two,
// add any missing sources here, then rename the header to
// Content-Security-Policy in proxy.ts. The non-script directives in
// next.config.ts (frame-ancestors, object-src, base-uri, form-action) are
// already enforced.

export const CSP_REPORT_PATH = "/api/csp-report";

/** Base64 nonce; new per request. Requires dynamic rendering (this app is). */
export function createCspNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

export function buildReportOnlyCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    // 'strict-dynamic': scripts injected by nonced scripts (Stripe.js via
    // @stripe/stripe-js) are allowed; the host entry is a fallback for
    // browsers without strict-dynamic. React needs eval only in dev.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://accounts.google.com${isDev ? " 'unsafe-eval'" : ""}`,
    // Tailwind + React inline style attributes; nonce'ing styles isn't practical.
    "style-src 'self' 'unsafe-inline'",
    // Product images come from Supabase Storage, Shopify CDN, YouTube posters, …
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://js.stripe.com https://accounts.google.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://www.youtube-nocookie.com https://accounts.google.com",
    "media-src 'self' https: blob:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://checkout.stripe.com https://hooks.stripe.com",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
    `report-uri ${CSP_REPORT_PATH}`,
  ].join("; ");
}
