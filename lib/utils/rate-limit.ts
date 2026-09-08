// Rate limiter for route handlers.
//
// Shared store: Upstash Redis over REST (also matches the Vercel KV integration
// env names) so limits hold across serverless instances/regions. Fixed-window
// counter via a single INCR/PEXPIRE/PTTL pipeline — one round-trip per check.
//
// Fallback: per-instance in-memory sliding window when Redis isn't configured
// (local dev, preview) or the REST call fails. Fail-open to memory rather than
// blocking checkout on a cache outage.

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const REDIS_TIMEOUT_MS = 800;
const KEY_PREFIX = "rl:";

export const rateLimitBackend: "redis" | "memory" = REDIS_URL && REDIS_TOKEN ? "redis" : "memory";

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (rateLimitBackend === "redis") {
    const shared = await redisRateLimit(key, limit, windowMs);
    if (shared) return shared;
  }
  return memoryRateLimit(key, limit, windowMs);
}

// ---------------------------------------------------------------- redis (REST)

type PipelineReply = { result?: number | string | null; error?: string }[];

async function redisRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult | null> {
  const redisKey = KEY_PREFIX + key;
  try {
    const res = await fetch(`${REDIS_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["PEXPIRE", redisKey, String(windowMs), "NX"],
        ["PTTL", redisKey],
      ]),
      signal: AbortSignal.timeout(REDIS_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) return null;

    const replies = (await res.json()) as PipelineReply;
    const count = Number(replies[0]?.result);
    const ttl = Number(replies[2]?.result);
    if (!Number.isFinite(count)) return null;

    if (count > limit) {
      const retryMs = Number.isFinite(ttl) && ttl > 0 ? ttl : windowMs;
      return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil(retryMs / 1000)) };
    }
    return { ok: true };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- memory

type Bucket = { timestamps: number[] };

const store = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

function memoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
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
