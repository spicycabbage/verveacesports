import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SiteId } from "@/lib/site/config";
import type { DateRange } from "@/lib/actions/finance";

export type TrafficDaily = { day: string; pageviews: number; visitors: number };
export type TrafficPath = { path: string; pageviews: number; visitors: number };
export type TrafficReferrer = { host: string; pageviews: number };
export type TrafficCountry = { country: string; pageviews: number; visitors: number };

export type TrafficRollup = {
  pageviews: number;
  visitors: number;
  daily: TrafficDaily[];
  paths: TrafficPath[];
  referrers: TrafficReferrer[];
  countries: TrafficCountry[];
  notice?: string;
};

const EMPTY_ROLLUP: TrafficRollup = {
  pageviews: 0,
  visitors: 0,
  daily: [],
  paths: [],
  referrers: [],
  countries: [],
};

const SKIP_PREFIXES = [
  "/admin",
  "/api",
  "/callback",
  "/offline",
  "/icon",
  "/manifest",
  "/robots",
  "/sitemap",
  "/apple-touch",
  "/pwa-icon",
];

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse/i;

export function isBotUserAgent(ua: string | null): boolean {
  return Boolean(ua && BOT_UA.test(ua));
}

export function sanitizePath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let path = raw.trim();
  if (!path.startsWith("/")) return null;
  const q = path.indexOf("?");
  if (q !== -1) {
    const pathname = path.slice(0, q);
    const params = new URLSearchParams(path.slice(q + 1));
    const category = params.get("category")?.trim();
    path = category ? `${pathname}?category=${encodeURIComponent(category)}` : pathname;
  }
  if (path.length > 200) return null;
  if (SKIP_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`) || path.startsWith(`${p}?`))) {
    return null;
  }
  return path;
}

export function sanitizeSessionId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim();
  if (id.length < 8 || id.length > 64) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(id)) return null;
  return id;
}

export function sanitizeReferrerHost(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const host = raw.trim().toLowerCase().replace(/\.$/, "");
  if (!host || host.length > 253) return null;
  if (!/^[a-z0-9.-]+$/.test(host)) return null;
  return host;
}

export function sanitizeCountry(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

export async function insertPageView(input: {
  siteId: SiteId;
  path: string;
  sessionId: string;
  referrerHost: string | null;
  country: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("page_views").insert({
    site_id: input.siteId,
    path: input.path,
    session_id: input.sessionId,
    referrer_host: input.referrerHost,
    country: input.country,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

type PageViewRow = {
  path: string;
  session_id: string;
  referrer_host: string | null;
  country: string | null;
  created_at: string;
};

function rollupRows(rows: PageViewRow[]): TrafficRollup {
  const dailyMap = new Map<string, TrafficDaily & { sessions: Set<string> }>();
  const pathMap = new Map<string, TrafficPath & { sessions: Set<string> }>();
  const refMap = new Map<string, TrafficReferrer>();
  const countryMap = new Map<string, TrafficCountry & { sessions: Set<string> }>();
  const visitorSessions = new Set<string>();

  for (const row of rows) {
    visitorSessions.add(row.session_id);
    const day = row.created_at.slice(0, 10);
    const daily = dailyMap.get(day) ?? {
      day,
      pageviews: 0,
      visitors: 0,
      sessions: new Set<string>(),
    };
    daily.pageviews += 1;
    daily.sessions.add(row.session_id);
    daily.visitors = daily.sessions.size;
    dailyMap.set(day, daily);

    const path = pathMap.get(row.path) ?? {
      path: row.path,
      pageviews: 0,
      visitors: 0,
      sessions: new Set<string>(),
    };
    path.pageviews += 1;
    path.sessions.add(row.session_id);
    path.visitors = path.sessions.size;
    pathMap.set(row.path, path);

    const host = row.referrer_host || "(direct)";
    const ref = refMap.get(host) ?? { host, pageviews: 0 };
    ref.pageviews += 1;
    refMap.set(host, ref);

    const country = row.country || "—";
    const c = countryMap.get(country) ?? {
      country,
      pageviews: 0,
      visitors: 0,
      sessions: new Set<string>(),
    };
    c.pageviews += 1;
    c.sessions.add(row.session_id);
    c.visitors = c.sessions.size;
    countryMap.set(country, c);
  }

  return {
    pageviews: rows.length,
    visitors: visitorSessions.size,
    daily: [...dailyMap.values()]
      .map(({ sessions: _s, ...point }) => point)
      .sort((a, b) => a.day.localeCompare(b.day)),
    paths: [...pathMap.values()]
      .map(({ sessions: _s, ...point }) => point)
      .sort((a, b) => b.pageviews - a.pageviews)
      .slice(0, 15),
    referrers: [...refMap.values()].sort((a, b) => b.pageviews - a.pageviews).slice(0, 10),
    countries: [...countryMap.values()]
      .map(({ sessions: _s, ...point }) => point)
      .sort((a, b) => b.pageviews - a.pageviews)
      .slice(0, 10),
  };
}

export async function getTrafficRollup(
  range: DateRange,
  siteId?: SiteId,
): Promise<(TrafficRollup & { notice?: string }) | { error: string }> {
  const admin = createSupabaseAdminClient();
  const rows: PageViewRow[] = [];
  let offset = 0;
  const page = 1000;
  for (;;) {
    let query = admin
      .from("page_views")
      .select("path, session_id, referrer_host, country, created_at")
      .gte("created_at", range.from)
      .lte("created_at", range.to)
      .order("created_at", { ascending: true })
      .range(offset, offset + page - 1);
    if (siteId) query = query.eq("site_id", siteId);
    const { data, error } = await query;
    if (error) {
      if (error.message.includes("page_views") || error.message.includes("does not exist")) {
        return {
          ...EMPTY_ROLLUP,
          notice:
            "Pageview table is not on this database yet, so traffic stays at zero until 20260907223134_page_views.sql is applied.",
        };
      }
      return { error: error.message };
    }
    const batch = (data ?? []) as PageViewRow[];
    rows.push(...batch);
    if (batch.length < page) break;
    offset += page;
  }
  return rollupRows(rows);
}

export async function getNewsletterSignupCounts(
  range: DateRange,
  siteId?: SiteId,
): Promise<{ total: number; inRange: number }> {
  const admin = createSupabaseAdminClient();
  let totalQuery = admin
    .from("newsletter_subscribers")
    .select("id", { count: "exact", head: true });
  let rangeQuery = admin
    .from("newsletter_subscribers")
    .select("id", { count: "exact", head: true })
    .gte("subscribed_at", range.from)
    .lte("subscribed_at", range.to);
  if (siteId) {
    totalQuery = totalQuery.eq("site_id", siteId);
    rangeQuery = rangeQuery.eq("site_id", siteId);
  }
  const [total, inRange] = await Promise.all([totalQuery, rangeQuery]);
  return { total: total.count ?? 0, inRange: inRange.count ?? 0 };
}
