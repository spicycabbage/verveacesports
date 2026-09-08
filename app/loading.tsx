// Root-level Suspense boundary for every route (deeper loading.tsx files still
// take precedence). With cacheComponents enabled, a route whose whole tree is
// request-bound (the root layout reads Host + cookies) and has no Suspense
// boundary produces an empty prerender shell, which `next start` then served as
// an empty 200 / hung on. This boundary gives each route a resumable shell.
// Neutral fallback: the page streams in within the same response, so a visible
// skeleton here would only flash.
export default function RootLoading() {
  return <div className="min-h-[50vh]" aria-hidden="true" />;
}
