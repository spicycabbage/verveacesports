<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CAD only

Storefront, checkout, POS, and admin money are **CAD-only**. Do not add USD prices, USD UI, USD checkout, or dual-currency reporting unless the user explicitly asks. `price_usd` DB columns are legacy mirrors of CAD — write CAD into both. Historical Stripe webhook verification may still mention USD internally; never show it.

