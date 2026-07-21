"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils/format";
import type { Currency } from "@/lib/constants";
import type {
  CurrencyFinance,
  DailyFinancePoint,
  DiscountRow,
  PayoutRow,
  TaxRow,
} from "@/lib/actions/finance";

const CHART = {
  primary: "var(--chart-1)",
  secondary: "var(--chart-2)",
  tertiary: "var(--chart-3)",
  quaternary: "var(--chart-4)",
  quinary: "var(--chart-5)",
  muted: "var(--muted-foreground)",
  grid: "color-mix(in oklch, var(--border) 60%, transparent)",
} as const;

type FinanceChartsProps = {
  summary: CurrencyFinance[];
  dailySeries: Record<Currency, DailyFinancePoint[]>;
  taxReport: TaxRow[];
  discountReport: DiscountRow[];
  payouts: PayoutRow[];
};

function shortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function moneyTooltip(value: number | string | undefined, currency: Currency) {
  const n = Number(value) || 0;
  return formatPrice(n, currency);
}

function hasActivity(points: DailyFinancePoint[]): boolean {
  return points.some((p) => p.orderCount > 0);
}

function CurrencyTrendCharts({
  currency,
  points,
  summary,
}: {
  currency: Currency;
  points: DailyFinancePoint[];
  summary: CurrencyFinance | undefined;
}) {
  if (!hasActivity(points)) return null;

  const breakdown = summary
    ? [
        { name: "Net sales", value: summary.netSales, fill: CHART.primary },
        { name: "Tax", value: summary.tax, fill: CHART.secondary },
        { name: "Shipping", value: summary.shipping, fill: CHART.tertiary },
        { name: "Discounts", value: summary.discounts + summary.pointsRedeemed, fill: CHART.quaternary },
        { name: "Refunds", value: summary.refunds, fill: CHART.quinary },
      ].filter((d) => d.value > 0)
    : [];

  const contraSeries = points.map((p) => ({
    date: p.date,
    discounts: p.discounts,
    refunds: p.refunds,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">{currency} sales trend</CardTitle>
          <CardDescription>Gross vs net sales by day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gross-${currency}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART.secondary} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={CHART.secondary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={`net-${currency}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART.primary} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={CHART.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tick={{ fill: CHART.muted, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={28}
                />
                <YAxis
                  tickFormatter={(v) => `$${v}`}
                  tick={{ fill: CHART.muted, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                />
                <Tooltip
                  labelFormatter={(l) => shortDate(String(l))}
                  formatter={(value, name) => [
                    moneyTooltip(value as number, currency),
                    name === "grossSales" ? "Gross" : "Net",
                  ]}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  formatter={(v) => (v === "grossSales" ? "Gross sales" : "Net sales")}
                  wrapperStyle={{ fontSize: "12px" }}
                />
                <Area
                  type="monotone"
                  dataKey="grossSales"
                  stroke={CHART.secondary}
                  fill={`url(#gross-${currency})`}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="netSales"
                  stroke={CHART.primary}
                  fill={`url(#net-${currency})`}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{currency} orders</CardTitle>
          <CardDescription>Paid orders per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tick={{ fill: CHART.muted, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={28}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: CHART.muted, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip
                  labelFormatter={(l) => shortDate(String(l))}
                  formatter={(value) => [value, "Orders"]}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="orderCount" fill={CHART.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{currency} contra-revenue</CardTitle>
          <CardDescription>Discounts + points and refunds by day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contraSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tick={{ fill: CHART.muted, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={28}
                />
                <YAxis
                  tickFormatter={(v) => `$${v}`}
                  tick={{ fill: CHART.muted, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip
                  labelFormatter={(l) => shortDate(String(l))}
                  formatter={(value, name) => [
                    moneyTooltip(value as number, currency),
                    name === "discounts" ? "Discounts" : "Refunds",
                  ]}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="discounts" stackId="a" fill={CHART.quaternary} radius={[0, 0, 0, 0]} />
                <Bar dataKey="refunds" stackId="a" fill={CHART.quinary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {breakdown.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{currency} revenue mix</CardTitle>
            <CardDescription>Period totals — net, tax, shipping, discounts, refunds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {breakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      moneyTooltip(value as number, currency),
                      name,
                    ]}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function FinanceCharts({
  summary,
  dailySeries,
  taxReport,
  discountReport,
  payouts,
}: FinanceChartsProps) {
  const summaryByCurrency = Object.fromEntries(summary.map((s) => [s.currency, s])) as Record<
    Currency,
    CurrencyFinance
  >;

  const taxChartData = taxReport.map((t) => ({
    label: `${t.currency} ${(t.taxRate * 100).toFixed(1)}%`,
    taxCollected: t.taxCollected,
    currency: t.currency,
  }));

  const discountChartData = discountReport.slice(0, 8).map((d) => ({
    code: d.code.length > 16 ? `${d.code.slice(0, 14)}…` : d.code,
    totalDiscount: d.totalDiscount,
    redemptions: d.redemptions,
  }));

  const payoutChartData = payouts
    .filter((p) => p.arrivalDate)
    .map((p) => ({
      label: shortDate(p.arrivalDate!.slice(0, 10)),
      amount: p.amount,
      currency: p.currency,
      status: p.status,
    }))
    .reverse();

  const anyTrend =
    hasActivity(dailySeries.USD) ||
    hasActivity(dailySeries.CAD) ||
    taxChartData.length > 0 ||
    discountChartData.length > 0 ||
    payoutChartData.length > 0;

  if (!anyTrend) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No paid orders in this range yet — charts will appear once you have sales data.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Trends
        </h2>
        {(["USD", "CAD"] as const).map((currency) => (
          <CurrencyTrendCharts
            key={currency}
            currency={currency}
            points={dailySeries[currency]}
            summary={summaryByCurrency[currency]}
          />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {taxChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tax collected</CardTitle>
              <CardDescription>By jurisdiction / rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={taxChartData}
                    layout="vertical"
                    margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                  >
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => `$${v}`}
                      tick={{ fill: CHART.muted, fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={88}
                      tick={{ fill: CHART.muted, fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(value, _name, item) => {
                        const cur = (item.payload as { currency: Currency }).currency;
                        return [moneyTooltip(value as number, cur), "Tax"];
                      }}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="taxCollected" fill={CHART.secondary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {discountChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top coupons</CardTitle>
              <CardDescription>Total discount given in period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={discountChartData}
                    layout="vertical"
                    margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                  >
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => `$${v}`}
                      tick={{ fill: CHART.muted, fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="code"
                      width={96}
                      tick={{ fill: CHART.muted, fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(value, _name, item) => {
                        const row = item.payload as { redemptions: number };
                        return [`$${Number(value).toFixed(2)} (${row.redemptions}×)`, "Discount"];
                      }}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="totalDiscount" fill={CHART.quaternary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {payoutChartData.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Stripe payouts</CardTitle>
              <CardDescription>Bank deposits by arrival date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={payoutChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: CHART.muted, fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => `$${v}`}
                      tick={{ fill: CHART.muted, fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={56}
                    />
                    <Tooltip
                      formatter={(value, _name, item) => {
                        const row = item.payload as { currency: Currency; status: string };
                        return [
                          moneyTooltip(value as number, row.currency),
                          `Payout (${row.status})`,
                        ];
                      }}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="amount" fill={CHART.tertiary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
