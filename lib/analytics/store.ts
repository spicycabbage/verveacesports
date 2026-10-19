import { enumerateStoreDates, pacificDateKey } from "@/lib/utils/format";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { DateRange } from "@/lib/actions/finance";
import type { SiteId } from "@/lib/site/config";
import type { SalesChannel } from "@/lib/supabase/types";
import { MIN_REPORTED_ORDER_TOTAL } from "@/lib/orders/reported";

const PAID_STATUSES = ["paid", "partially_refunded", "refunded"] as const;
const PAGE = 1000;
const IN_CHUNK = 200;
const round2 = (n: number) => Math.round(n * 100) / 100;

export type StoreDaily = { day: string; revenue: number; orders: number };
export type StoreProduct = {
  productId: string;
  name: string;
  units: number;
  revenue: number;
};
export type StoreChannel = { channel: SalesChannel; orders: number; revenue: number };
export type StoreSite = { siteId: SiteId; orders: number; revenue: number };
export type StoreCountry = { country: string; orders: number; revenue: number };

export type StoreTotals = {
  revenue: number;
  orderCount: number;
  aov: number;
};

export type StoreAnalytics = {
  current: StoreTotals;
  previous: StoreTotals;
  daily: StoreDaily[];
  products: StoreProduct[];
  channels: StoreChannel[];
  sites: StoreSite[];
  countries: StoreCountry[];
  chatQuestions: number;
};

const EMPTY_TOTALS: StoreTotals = { revenue: 0, orderCount: 0, aov: 0 };

export function priorRange(range: DateRange): DateRange {
  const from = new Date(range.from).getTime();
  const to = new Date(range.to).getTime();
  const span = Math.max(to - from, 24 * 60 * 60 * 1000);
  return {
    from: new Date(from - span).toISOString(),
    to: new Date(from - 1).toISOString(),
  };
}

export function deltaPct(current: number, previous: number): string | undefined {
  if (previous === 0 && current === 0) return undefined;
  if (previous === 0) return "New vs prior period";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}% vs prior`;
}

type OrderRow = {
  id: string;
  site_id?: SiteId | null;
  sales_channel: SalesChannel;
  country: string;
  total: number | string;
  refunded_total: number | string;
  paid_at: string | null;
};

function missingColumn(message: string | undefined, column: string): boolean {
  return Boolean(message && message.includes(column) && message.includes("does not exist"));
}

type ItemRow = {
  order_id: string;
  product_id: string;
  product_name: string;
  qty: number;
  refunded_qty: number;
  unit_price: number | string;
};

function asNum(value: number | string | null | undefined): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}


async function fetchPaidOrders(
  range: DateRange,
  siteId?: SiteId,
  includeSite = true,
): Promise<OrderRow[] | { error: string }> {
  const admin = createSupabaseAdminClient();
  const rows: OrderRow[] = [];
  let offset = 0;
  for (;;) {
    const query = includeSite
      ? admin
          .from("orders")
          .select("id, site_id, sales_channel, country, total, refunded_total, paid_at")
      : admin
          .from("orders")
          .select("id, sales_channel, country, total, refunded_total, paid_at");
    let filtered = query
      .eq("currency", "CAD")
      .in("financial_status", [...PAID_STATUSES])
      .gte("total", MIN_REPORTED_ORDER_TOTAL)
      .gte("paid_at", range.from)
      .lte("paid_at", range.to)
      .order("paid_at", { ascending: true })
      .range(offset, offset + PAGE - 1);
    if (includeSite && siteId) filtered = filtered.eq("site_id", siteId);
    const { data, error } = await filtered;
    if (error) {
      if (includeSite && missingColumn(error.message, "site_id")) {
        return fetchPaidOrders(range, siteId, false);
      }
      return { error: error.message };
    }
    rows.push(...((data ?? []) as unknown as OrderRow[]));
    if ((data ?? []).length < PAGE) break;
    offset += PAGE;
  }
  return rows;
}

async function fetchItems(orderIds: string[]): Promise<ItemRow[] | { error: string }> {
  if (orderIds.length === 0) return [];
  const admin = createSupabaseAdminClient();
  const rows: ItemRow[] = [];
  for (let i = 0; i < orderIds.length; i += IN_CHUNK) {
    const chunk = orderIds.slice(i, i + IN_CHUNK);
    const { data, error } = await admin
      .from("order_items")
      .select("order_id, product_id, product_name, qty, refunded_qty, unit_price")
      .in("order_id", chunk);
    if (error) return { error: error.message };
    rows.push(...((data ?? []) as ItemRow[]));
  }
  return rows;
}

function rollupOrders(orders: OrderRow[]): Omit<StoreAnalytics, "products" | "chatQuestions" | "previous"> & {
  current: StoreTotals;
} {
  let revenue = 0;
  const dailyMap = new Map<string, StoreDaily>();
  const channelMap = new Map<SalesChannel, StoreChannel>();
  const siteMap = new Map<SiteId, StoreSite>();
  const countryMap = new Map<string, StoreCountry>();

  for (const order of orders) {
    const kept = Math.max(0, asNum(order.total) - asNum(order.refunded_total));
    revenue += kept;
    const day = order.paid_at ? pacificDateKey(order.paid_at) : "";
    if (day) {
      const existing = dailyMap.get(day) ?? { day, revenue: 0, orders: 0 };
      existing.revenue = round2(existing.revenue + kept);
      existing.orders += 1;
      dailyMap.set(day, existing);
    }

    const channel = order.sales_channel === "pos" ? "pos" : "online";
    const ch = channelMap.get(channel) ?? { channel, orders: 0, revenue: 0 };
    ch.orders += 1;
    ch.revenue = round2(ch.revenue + kept);
    channelMap.set(channel, ch);

    if (order.site_id === "verveace" || order.site_id === "bleeq-ca" || order.site_id === "volt-ca") {
      const site = siteMap.get(order.site_id) ?? { siteId: order.site_id, orders: 0, revenue: 0 };
      site.orders += 1;
      site.revenue = round2(site.revenue + kept);
      siteMap.set(order.site_id, site);
    }

    const country = order.country || "—";
    const c = countryMap.get(country) ?? { country, orders: 0, revenue: 0 };
    c.orders += 1;
    c.revenue = round2(c.revenue + kept);
    countryMap.set(country, c);
  }

  revenue = round2(revenue);
  const orderCount = orders.length;
  return {
    current: {
      revenue,
      orderCount,
      aov: orderCount > 0 ? round2(revenue / orderCount) : 0,
    },
    daily: [...dailyMap.values()].sort((a, b) => a.day.localeCompare(b.day)),
    channels: [...channelMap.values()].sort((a, b) => b.revenue - a.revenue),
    sites: [...siteMap.values()].sort((a, b) => b.revenue - a.revenue),
    countries: [...countryMap.values()].sort((a, b) => b.revenue - a.revenue),
  };
}

function rollupProducts(items: ItemRow[]): StoreProduct[] {
  const map = new Map<string, StoreProduct>();
  for (const item of items) {
    const units = Math.max(0, asNum(item.qty) - asNum(item.refunded_qty));
    if (units <= 0) continue;
    const revenue = round2(asNum(item.unit_price) * units);
    const key = item.product_id || item.product_name;
    const existing = map.get(key) ?? {
      productId: item.product_id,
      name: item.product_name || "Untitled",
      units: 0,
      revenue: 0,
    };
    existing.units += units;
    existing.revenue = round2(existing.revenue + revenue);
    map.set(key, existing);
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue || b.units - a.units).slice(0, 15);
}

function totalsFromOrders(orders: OrderRow[]): StoreTotals {
  const { current } = rollupOrders(orders);
  return current;
}

function fillDaily(range: DateRange, points: StoreDaily[]): StoreDaily[] {
  const byDay = new Map(points.map((p) => [p.day, p]));
  return enumerateStoreDates(range.from, range.to).map(
    (day) => byDay.get(day) ?? { day, revenue: 0, orders: 0 },
  );
}

export async function getStoreAnalytics(
  range: DateRange,
  siteId?: SiteId,
): Promise<StoreAnalytics | { error: string }> {
  const prev = priorRange(range);
  const admin = createSupabaseAdminClient();

  let chatQuery = admin
    .from("chat_questions")
    .select("id", { count: "exact", head: true })
    .gte("created_at", range.from)
    .lte("created_at", range.to);
  if (siteId) chatQuery = chatQuery.eq("site_id", siteId);

  const [currentOrders, previousOrders, chat] = await Promise.all([
    fetchPaidOrders(range, siteId),
    fetchPaidOrders(prev, siteId),
    chatQuery,
  ]);

  if ("error" in currentOrders) return currentOrders;
  if ("error" in previousOrders) return previousOrders;

  const items = await fetchItems(currentOrders.map((o) => o.id));
  if ("error" in items) return items;

  const rolled = rollupOrders(currentOrders);
  return {
    current: rolled.current,
    previous: totalsFromOrders(previousOrders),
    daily: fillDaily(range, rolled.daily),
    products: rollupProducts(items),
    channels: rolled.channels,
    sites: rolled.sites,
    countries: rolled.countries,
    chatQuestions: chat.count ?? 0,
  };
}

export const EMPTY_STORE: StoreAnalytics = {
  current: EMPTY_TOTALS,
  previous: EMPTY_TOTALS,
  daily: [],
  products: [],
  channels: [],
  sites: [],
  countries: [],
  chatQuestions: 0,
};
