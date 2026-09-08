"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils/format";
import type { BrevoDailyPoint } from "@/lib/brevo/analytics";
import type { TrafficDaily } from "@/lib/analytics/pageviews";
import type { StoreDaily } from "@/lib/analytics/store";

const CHART = {
  primary: "var(--chart-1)",
  secondary: "var(--chart-2)",
  muted: "var(--muted-foreground)",
  grid: "color-mix(in oklch, var(--border) 60%, transparent)",
} as const;

function shortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function compactCad(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return `$${Math.round(n)}`;
}

export function SalesChart({ points }: { points: StoreDaily[] }) {
  const hasSales = points.some((p) => p.orders > 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Revenue</CardTitle>
        <CardDescription>Paid orders after refunds, CAD, by day (UTC).</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        {!hasSales ? (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No paid orders in this range.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis
                dataKey="day"
                tickFormatter={shortDate}
                tick={{ fill: CHART.muted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="cad"
                tickFormatter={compactCad}
                tick={{ fill: CHART.muted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <YAxis
                yAxisId="orders"
                orientation="right"
                allowDecimals={false}
                tick={{ fill: CHART.muted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                labelFormatter={(v) => shortDate(String(v))}
                formatter={(value, name) => {
                  const n = Number(value) || 0;
                  return name === "Revenue" ? formatPrice(n) : n;
                }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              />
              <Area
                yAxisId="cad"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke={CHART.primary}
                fill={CHART.primary}
                fillOpacity={0.2}
              />
              <Area
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke={CHART.secondary}
                fill={CHART.secondary}
                fillOpacity={0.12}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function TrafficChart({ points }: { points: TrafficDaily[] }) {
  if (points.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visitors & pageviews</CardTitle>
          <CardDescription>Unique sessions and total pageviews by day (UTC).</CardDescription>
        </CardHeader>
        <CardContent className="h-32">
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No storefront pageviews in this range yet.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Visitors & pageviews</CardTitle>
        <CardDescription>Unique sessions and total pageviews by day (UTC).</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis
              dataKey="day"
              tickFormatter={shortDate}
              tick={{ fill: CHART.muted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: CHART.muted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              labelFormatter={(v) => shortDate(String(v))}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
            />
            <Area
              type="monotone"
              dataKey="visitors"
              name="Visitors"
              stroke={CHART.primary}
              fill={CHART.primary}
              fillOpacity={0.2}
            />
            <Area
              type="monotone"
              dataKey="pageviews"
              name="Pageviews"
              stroke={CHART.secondary}
              fill={CHART.secondary}
              fillOpacity={0.12}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function EmailChart({ points }: { points: BrevoDailyPoint[] }) {
  if (points.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email volume</CardTitle>
          <CardDescription>Transactional sends, opens, and clicks by day.</CardDescription>
        </CardHeader>
        <CardContent className="h-32">
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No Brevo sends in this range.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Email volume</CardTitle>
        <CardDescription>Transactional sends, opens, and clicks by day.</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis
              dataKey="day"
              tickFormatter={shortDate}
              tick={{ fill: CHART.muted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: CHART.muted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              labelFormatter={(v) => shortDate(String(v))}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
            />
            <Area
              type="monotone"
              dataKey="delivered"
              name="Delivered"
              stroke={CHART.primary}
              fill={CHART.primary}
              fillOpacity={0.2}
            />
            <Area
              type="monotone"
              dataKey="uniqueOpens"
              name="Unique opens"
              stroke={CHART.secondary}
              fill={CHART.secondary}
              fillOpacity={0.12}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
