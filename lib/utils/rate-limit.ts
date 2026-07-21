// Lightweight in-memory sliding-window rate limiter. Per server instance, which
// is sufficient to blunt bursts/abuse on serverless without adding a Redis
// dependency; swap the store for Upstash/Vercel KV if global limits are needed.

type Bucket = { timestamps: number[] };

const store = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  let bucket = store.get(key);
  if (!bucket) {
    if (store.size >= MAX_KEYS) {
      // Drop the oldest entries wholesale to bound memory.
      const keys = [...store.keys()].slice(0, MAX_KEYS / 2);
      for (const k of keys) store.delete(k);
    }
    bucket = { timestamps: [] };
    store.set(key, bucket);
  }

  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    return { ok: false, retryAfterSeconds: Math.ceil((oldest + windowMs - now) / 1000) };
  }

  bucket.timestamps.push(now);
  return { ok: true };
}

export function clientIp(req: { headers: { get(name: string): string | null } }): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
