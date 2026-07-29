import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Currency } from "@/lib/constants";

export type DateRange = { from: string; to: string };

export type CurrencyFinance = {
  currency: Currency;
  orderCount: number;
  grossSales: number; // sum of merchandise subtotal (pre-discount)
  discounts: number;
  pointsRedeemed: number; // $ value of loyalty points used (contra-revenue)
  refunds: number; // total refunded in range
  netSales: number; // gross - discounts - points - refunds
  tax: number; // tax collected
  shipping: number; // shipping revenue
  totalCollected: number; // sum of order totals charged
  stripeFees: number; // processing fees
  estimatedCogs: number; // sum(cost * qty) for sold lines
  grossMargin: number; // netSales - cogs
  grossProfit: number; // netSales - cogs - fees
};

const CURRENCIES: Currency[] = ["USD", "CAD"];
const round2 = (n: number) => Math.round(n * 100) / 100;

// Default range: last 30 days through now.
export function defaultRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function parseRange(sp: { from?: string; to?: string }): DateRange {
  const def = defaultRange();
  const from = sp.from ? new Date(sp.from) : new Date(def.from);
  const to = sp.to ? new Date(sp.to) : new Date(def.to);
  // Treat `to` as inclusive end-of-day when a bare date is supplied.
  if (sp.to && sp.to.length <= 10) to.setHours(23, 59, 59, 999);
  return {
    from: Number.isNaN(from.getTime()) ? def.from : from.toISOString(),
    to: Number.isNaN(to.getTime()) ? def.to : to.toISOString(),
  };
}

type OrderRow = {
  id: string;
  currency: Currency;
  subtotal: number | string;
  discount_total: number | string;
  points_value: number | string;
  tax: number | string;
  shipping: number | string;
  total: number | string;
  refunded_total: number | string;
};

// Finance summary keyed by currency. Uses paid orders (paid / partially /
// fully refunded) placed within the range; refunds are netted from order rows.
export async function getFinanceSummary(range: DateRange): Promise<CurrencyFinance[]> {
  const admin = createSupabaseAdminClient();

  const { data: ordersData } = await admin
    .from("orders")
    .select(
      "id, currency, subtotal, discount_total, points_value, tax, shipping, total, refunded_total",
    )
    .in("financial_status", ["paid", "partially_refunded", "refunded"])
    .gte("paid_at", range.from)
    .lte("paid_at", range.to);
  const orders = (ordersData ?? []) as OrderRow[];

  const orderIds = orders.map((o) => o.id);

  // COGS from order line costs.
  const cogsByCurrency: Record<Currency, number> = { USD: 0, CAD: 0 };
  if (orderIds.length > 0) {
    const { data: itemsData } = await admin
      .from("order_items")
      .select("order_id, qty, cost_usd, cost_cad, currency")
      .in("order_id", orderIds);
    for (const it of itemsData ?? []) {
      const cur = it.currency as Currency;
      const cost = cur === "CAD" ? it.cost_cad : it.cost_usd;
      if (cost != null) cogsByCurrency[cur] += Number(cost) * it.qty;
    }
  }

  // Stripe fees: prefer BTs linked to orders in range; fall back to BT created_at.
  const feesByCurrency: Record<Currency, number> = { USD: 0, CAD: 0 };
  const countedBt = new Set<string>();
  if (orderIds.length > 0) {
    const { data: linkedFees } = await admin
      .from("stripe_balance_transactions")
      .select("id, currency, fee, order_id")
      .in("order_id", orderIds);
    for (const bt of linkedFees ?? []) {
      countedBt.add(bt.id);
      feesByCurrency[bt.currency as Currency] += Math.abs(Number(bt.fee) || 0);
    }
  }
  const { data: btData } = await admin
    .from("stripe_balance_transactions")
    .select("id, currency, fee, order_id, created_at")
    .gte("created_at", range.from)
    .lte("created_at", range.to)
    .in("type", ["charge", "payment", "refund", "payment_refund"]);
  for (const bt of btData ?? []) {
    if (countedBt.has(bt.id)) continue;
    // Skip orphans already covered by an order outside this range.
    if (bt.order_id && !orderIds.includes(bt.order_id)) continue;
    feesByCurrency[bt.currency as Currency] += Math.abs(Number(bt.fee) || 0);
  }

  return CURRENCIES.map((currency) => {
    const rows = orders.filter((o) => o.currency === currency);
    const grossSales = round2(rows.reduce((s, o) => s + Number(o.subtotal), 0));
    const discounts = round2(rows.reduce((s, o) => s + Number(o.discount_total), 0));
    const pointsRedeemed = round2(rows.reduce((s, o) => s + Number(o.points_value), 0));
    const refunds = round2(rows.reduce((s, o) => s + Number(o.refunded_total), 0));
    const tax = round2(rows.reduce((s, o) => s + Number(o.tax), 0));
    const shipping = round2(rows.reduce((s, o) => s + Number(o.shipping), 0));
    const totalCollected = round2(rows.reduce((s, o) => s + Number(o.total), 0));
    const netSales = round2(grossSales - discounts - pointsRedeemed - refunds);
    const estimatedCogs = round2(cogsByCurrency[currency]);
    const stripeFees = round2(feesByCurrency[currency]);
    return {
      currency,
      orderCount: rows.length,
      grossSales,
      discounts,
      pointsRedeemed,
      refunds,
      netSales,
      tax,
      shipping,
      totalCollected,
      stripeFees,
      estimatedCogs,
      grossMargin: round2(netSales - estimatedCogs),
      grossProfit: round2(netSales - estimatedCogs - stripeFees),
    };
  });
}

export type TaxRow = {
  currency: Currency;
  taxRate: number;
  orderCount: number;
  taxableSales: number;
  taxCollected: number;
};

export async function getTaxReport(range: DateRange): Promise<TaxRow[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("orders")
    .select("currency, tax_rate, tax, subtotal, discount_total, points_value")
    .in("financial_status", ["paid", "partially_refunded", "refunded"])
    .gte("paid_at", range.from)
    .lte("paid_at", range.to);

  const map = new Map<string, TaxRow>();
  for (const o of data ?? []) {
    const currency = o.currency as Currency;
    const rate = Number(o.tax_rate) || 0;
    const key = `${currency}:${rate}`;
    const taxable = Math.max(
      0,
      Number(o.subtotal) - Number(o.discount_total) - Number(o.points_value),
    );
    const existing = map.get(key) ?? {
      currency,
      taxRate: rate,
      orderCount: 0,
      taxableSales: 0,
      taxCollected: 0,
    };
    existing.orderCount += 1;
    existing.taxableSales = round2(existing.taxableSales + taxable);
    existing.taxCollected = round2(existing.taxCollected + Number(o.tax));
    map.set(key, existing);
  }
  return [...map.values()].sort(
    (a, b) => a.currency.localeCompare(b.currency) || b.taxRate - a.taxRate,
  );
}

export type DiscountRow = {
  code: string;
  redemptions: number;
  totalDiscount: number;
};

export async function getDiscountReport(range: DateRange): Promise<DiscountRow[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("discount_redemptions")
    .select("amount, created_at, discounts(code)")
    .gte("created_at", range.from)
    .lte("created_at", range.to);

  const map = new Map<string, DiscountRow>();
  for (const r of data ?? []) {
    const rel = (r as { discounts: { code: string } | { code: string }[] | null }).discounts;
    const code = Array.isArray(rel) ? rel[0]?.code : rel?.code;
    const key = code ?? "(unknown)";
    const existing = map.get(key) ?? { code: key, redemptions: 0, totalDiscount: 0 };
    existing.redemptions += 1;
    existing.totalDiscount = round2(existing.totalDiscount + Number(r.amount));
    map.set(key, existing);
  }
  return [...map.values()].sort((a, b) => b.totalDiscount - a.totalDiscount);
}

export type PayoutRow = {
  id: string;
  currency: Currency;
  amount: number;
  status: string;
  arrivalDate: string | null;
  description: string | null;
};

export async function getPayouts(range: DateRange): Promise<PayoutRow[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("stripe_payouts")
    .select("id, currency, amount, status, arrival_date, description, created_at")
    .gte("created_at", range.from)
    .lte("created_at", range.to)
    .order("created_at", { ascending: false });
  return (data ?? []).map((p) => ({
    id: p.id,
    currency: p.currency as Currency,
    amount: Number(p.amount),
    status: p.status,
    arrivalDate: p.arrival_date,
    description: p.description,
  }));
}

export type DailyFinancePoint = {
  date: string;
  grossSales: number;
  netSales: number;
  orderCount: number;
  tax: number;
  refunds: number;
  discounts: number;
  shipping: number;
};

type OrderTimeRow = OrderRow & { paid_at: string | null };

function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

function enumerateDates(from: string, to: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(from);
  cursor.setUTCHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setUTCHours(0, 0, 0, 0);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

/** Daily buckets for trend charts; zero-filled for days with no sales. */
export async function getDailyFinanceSeries(
  range: DateRange,
): Promise<Record<Currency, DailyFinancePoint[]>> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("orders")
    .select(
      "currency, subtotal, discount_total, points_value, tax, shipping, total, refunded_total, paid_at",
    )
    .in("financial_status", ["paid", "partially_refunded", "refunded"])
    .gte("paid_at", range.from)
    .lte("paid_at", range.to)
    .order("paid_at", { ascending: true });

  const buckets: Record<Currency, Map<string, DailyFinancePoint>> = {
    USD: new Map(),
    CAD: new Map(),
  };

  for (const o of (data ?? []) as OrderTimeRow[]) {
    if (!o.paid_at) continue;
    const currency = o.currency as Currency;
    const key = dateKey(o.paid_at);
    const gross = Number(o.subtotal);
    const discounts = Number(o.discount_total) + Number(o.points_value);
    const refunds = Number(o.refunded_total);
    const net = round2(gross - discounts - refunds);
    const existing = buckets[currency].get(key) ?? {
      date: key,
      grossSales: 0,
      netSales: 0,
      orderCount: 0,
      tax: 0,
      refunds: 0,
      discounts: 0,
      shipping: 0,
    };
    existing.grossSales = round2(existing.grossSales + gross);
    existing.netSales = round2(existing.netSales + net);
    existing.orderCount += 1;
    existing.tax = round2(existing.tax + Number(o.tax));
    existing.refunds = round2(existing.refunds + refunds);
    existing.discounts = round2(existing.discounts + discounts);
    existing.shipping = round2(existing.shipping + Number(o.shipping));
    buckets[currency].set(key, existing);
  }

  const allDates = enumerateDates(range.from, range.to);
  const empty = (date: string): DailyFinancePoint => ({
    date,
    grossSales: 0,
    netSales: 0,
    orderCount: 0,
    tax: 0,
    refunds: 0,
    discounts: 0,
    shipping: 0,
  });

  return {
    USD: allDates.map((d) => buckets.USD.get(d) ?? empty(d)),
    CAD: allDates.map((d) => buckets.CAD.get(d) ?? empty(d)),
  };
}
