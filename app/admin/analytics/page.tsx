import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdminPage } from "@/lib/auth/admin";
import { parseRange } from "@/lib/actions/finance";
import { formatDateOnly, formatPrice } from "@/lib/utils/format";
import { countryName } from "@/lib/constants";
import { SITES, type SiteId } from "@/lib/site/config";
import type { SalesChannel } from "@/lib/supabase/types";
import {
  getNewsletterSignupCounts,
  getTrafficRollup,
  type TrafficRollup,
} from "@/lib/analytics/pageviews";
import {
  deltaPct,
  EMPTY_STORE,
  getStoreAnalytics,
  type StoreAnalytics,
} from "@/lib/analytics/store";
import { getBrevoAnalytics, ratePct, type BrevoAnalytics } from "@/lib/brevo/analytics";
import { AnalyticsToolbar } from "./AnalyticsToolbar";
import { EmailChart, SalesChart, TrafficChart } from "./AnalyticsCharts";

export const metadata = { title: "Admin · Analytics" };

type SearchParams = Promise<{ from?: string; to?: string; site?: string; tab?: string }>;

type AnalyticsTab = "sales" | "traffic";

function analyticsTab(value: string | undefined): AnalyticsTab {
  return value === "traffic" ? "traffic" : "sales";
}

function isSiteId(value: string | undefined): value is SiteId {
  return value === "verveace" || value === "bleeq-ca" || value === "volt-ca";
}

function countryLabel(code: string): string {
  if (code === "—" || code.length !== 2) return code;
  try {
    const name = new Intl.DisplayNames(["en"], { type: "region" }).of(code);
    return name ?? code;
  } catch {
    return code;
  }
}

function propertyLabel(siteId: SiteId): string {
  switch (siteId) {
    case "verveace":
      return "Verveace";
    case "bleeq-ca":
      return "BleeqUp";
    case "volt-ca":
      return "Volt Caddy";
    default: {
      const _exhaustive: never = siteId;
      return _exhaustive;
    }
  }
}

function channelLabel(channel: SalesChannel): string {
  switch (channel) {
    case "pos":
      return "In-store (POS)";
    case "online":
      return "Online";
    default: {
      const _exhaustive: never = channel;
      return _exhaustive;
    }
  }
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminPage();
  const sp = await searchParams;
  const range = parseRange(sp);
  const site = isSiteId(sp.site) ? sp.site : undefined;
  const tab = analyticsTab(sp.tab);

  const [traffic, email, signups, storeResult] = await Promise.all([
    getTrafficRollup(range, site),
    tab === "traffic" ? getBrevoAnalytics(range, site) : Promise.resolve(null),
    tab === "traffic"
      ? getNewsletterSignupCounts(range, site)
      : Promise.resolve({ inRange: 0, total: 0 }),
    tab === "sales" ? getStoreAnalytics(range, site) : Promise.resolve(null),
  ]);

  const trafficError = "error" in traffic ? traffic.error : null;
  const emailError = email && "error" in email ? email.error : null;
  const storeError = storeResult && "error" in storeResult ? storeResult.error : null;
  const rollup: TrafficRollup | null = "error" in traffic ? null : traffic;
  const brevo: BrevoAnalytics | null = !email || "error" in email ? null : email;
  const store: StoreAnalytics =
    !storeResult || "error" in storeResult ? EMPTY_STORE : storeResult;
  const conversion =
    rollup && rollup.visitors > 0
      ? `${((store.current.orderCount / rollup.visitors) * 100).toFixed(1)}%`
      : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
      </div>

      <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-muted" />}>
        <AnalyticsToolbar from={range.from} to={range.to} />
      </Suspense>

      {tab === "sales" ? (
      <section className="space-y-4">
        {storeError ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-destructive">
              {storeError}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                label="Revenue"
                value={formatPrice(store.current.revenue)}
                hint={deltaPct(store.current.revenue, store.previous.revenue)}
              />
              <KpiCard
                label="Paid orders"
                value={String(store.current.orderCount)}
                hint={deltaPct(store.current.orderCount, store.previous.orderCount)}
              />
              <KpiCard
                label="AOV"
                value={formatPrice(store.current.aov)}
                hint="Charged minus refunds"
              />
              <KpiCard
                label="Conversion"
                value={conversion}
                hint={
                  rollup && rollup.visitors > 0
                    ? `${store.current.orderCount} orders / ${rollup.visitors} visitors`
                    : "Needs storefront pageviews"
                }
              />
            </div>
            <SalesChart points={store.daily} />
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <BreakdownTable
                title="Top products"
                description="Units kept after refunds."
                empty="No paid line items in this range."
                headers={["Product", "Units", "Revenue"]}
                rows={store.products.map((p) => [
                  p.productId ? (
                    <Link key={p.productId} href={`/admin/products/${p.productId}`} className="break-words hover:underline">
                      {p.name}
                    </Link>
                  ) : (
                    p.name
                  ),
                  String(p.units),
                  formatPrice(p.revenue),
                ])}
              />
              <Card className="min-w-0">
                <CardHeader>
                  <CardTitle className="text-base">Channels</CardTitle>
                  <CardDescription>
                    {store.chatQuestions} chat question{store.chatQuestions === 1 ? "" : "s"} in
                    range.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {store.channels.length === 0 && store.sites.length === 0 ? (
                    <p className="text-muted-foreground">No paid orders in this range.</p>
                  ) : null}
                  {store.channels.map((ch) => (
                    <div key={ch.channel} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">
                        {channelLabel(ch.channel)}
                      </span>
                      <span className="tabular-nums">
                        {ch.orders} · {formatPrice(ch.revenue)}
                      </span>
                    </div>
                  ))}
                  {store.sites.length > 1 || !site ? (
                    <div className="space-y-3 border-t border-border pt-3">
                      {store.sites.map((s) => (
                        <div key={s.siteId} className="flex justify-between gap-2">
                          <span className="text-muted-foreground">{SITES[s.siteId].name}</span>
                          <span className="tabular-nums">
                            {s.orders} · {formatPrice(s.revenue)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {store.countries.length > 0 ? (
                    <div className="space-y-3 border-t border-border pt-3">
                      {store.countries.map((c) => (
                        <div key={c.country} className="flex justify-between gap-2">
                          <span className="text-muted-foreground">{countryName(c.country)}</span>
                          <span className="tabular-nums">
                            {c.orders} · {formatPrice(c.revenue)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </section>
      ) : (
      <>
      <section className="space-y-4">
        {rollup?.notice ? (
          <p className="text-sm text-muted-foreground">{rollup.notice}</p>
        ) : null}
        {trafficError ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-destructive">
              {trafficError}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <KpiCard label="Visitors" value={String(rollup?.visitors ?? 0)} hint="Unique sessions" />
              <KpiCard
                label="Pageviews"
                value={String(rollup?.pageviews ?? 0)}
                hint={
                  rollup && rollup.visitors > 0
                    ? `${(rollup.pageviews / rollup.visitors).toFixed(1)} per visitor`
                    : undefined
                }
              />
            </div>
            {rollup?.notice ? null : (
              <>
                <TrafficChart points={rollup?.daily ?? []} />
                <BreakdownTable
                  title="Properties"
                  empty="No pageviews in this range yet."
                  headers={["Property", "Visitors", "Views", "Top source"]}
                  rows={(rollup?.properties ?? []).map((p) => [
                    propertyLabel(p.siteId),
                    String(p.visitors),
                    String(p.pageviews),
                    `${p.topReferrer} · ${p.topReferrerVisitors}`,
                  ])}
                />
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                  <BreakdownTable
                    title="Top pages"
                    empty="No pageviews in this range yet."
                    headers={["Page", "Views", "Visitors"]}
                    rows={(rollup?.paths ?? []).map((p) => [
                      p.path,
                      String(p.pageviews),
                      String(p.visitors),
                    ])}
                  />
                  <BreakdownTable
                    title="Referrers"
                    empty="No referrers yet."
                    headers={["Source", "Visitors", "Views"]}
                    rows={(rollup?.referrers ?? []).map((r) => [
                      r.host,
                      String(r.visitors),
                      String(r.pageviews),
                    ])}
                  />
                </div>
                <BreakdownTable
                  title="Countries"
                  empty="No geo data yet."
                  headers={["Country", "Views", "Visitors"]}
                  rows={(rollup?.countries ?? []).map((c) => [
                    countryLabel(c.country),
                    String(c.pageviews),
                    String(c.visitors),
                  ])}
                />
              </>
            )}
          </>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Email</h2>
          <p className="text-sm text-muted-foreground">
            Opens/clicks from Brevo transactional + campaigns. List sizes are per property.
          </p>
        </div>
        {emailError ? (
          <Card>
            <CardContent className="space-y-3 py-6 text-sm">
              <p className="text-destructive">{emailError}</p>
              <p className="text-muted-foreground">
                Storefront newsletter signups: {signups.inRange} in range · {signups.total} total.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                label="Delivered"
                value={String(brevo?.totals.delivered ?? 0)}
                hint={`${brevo?.totals.requests ?? 0} sent`}
              />
              <KpiCard
                label="Open rate"
                value={ratePct(brevo?.totals.uniqueOpens ?? 0, brevo?.totals.delivered ?? 0)}
                hint={`${brevo?.totals.uniqueOpens ?? 0} unique opens`}
              />
              <KpiCard
                label="Click rate"
                value={ratePct(brevo?.totals.uniqueClicks ?? 0, brevo?.totals.delivered ?? 0)}
                hint={`${brevo?.totals.uniqueClicks ?? 0} unique clicks`}
              />
              <KpiCard
                label="Storefront signups"
                value={String(signups.inRange)}
                hint={`${signups.total} total on list`}
              />
            </div>
            <EmailChart points={brevo?.daily ?? []} />

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lists</CardTitle>
                  <CardDescription>
                    Brevo lists plus storefront newsletter signups in range.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {(brevo?.lists ?? []).map((list) => (
                    <div key={list.listId} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{list.label}</span>
                      <span className="tabular-nums">
                        {list.subscribers} subscribers
                        {list.blacklisted ? ` · ${list.blacklisted} blocked` : ""}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between gap-2 border-t border-border pt-3">
                    <span className="text-muted-foreground">Bounces / unsubs</span>
                    <span className="tabular-nums">
                      {(brevo?.totals.hardBounces ?? 0) + (brevo?.totals.softBounces ?? 0)} /{" "}
                      {brevo?.totals.unsubscribed ?? 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Campaigns</CardTitle>
                  <CardDescription>Recent Brevo campaigns (account-wide).</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead className="text-right">Sent</TableHead>
                        <TableHead className="text-right">Open</TableHead>
                        <TableHead className="text-right">Click</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(brevo?.campaigns ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                            No campaigns yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        (brevo?.campaigns ?? []).map((c) => (
                          <TableRow key={c.id}>
                            <TableCell>
                              <p className="font-medium">{c.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {c.subject}
                                {c.sentDate ? ` · ${formatDateOnly(c.sentDate)}` : ` · ${c.status}`}
                              </p>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{c.delivered || c.sent}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {ratePct(c.uniqueOpens, c.delivered || c.sent)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {ratePct(c.uniqueClicks, c.delivered || c.sent)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </section>
      </>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="space-y-0 pb-2">
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function BreakdownTable({
  title,
  description,
  empty,
  headers,
  rows,
}: {
  title: string;
  description?: string;
  empty: string;
  headers: string[];
  rows: ReactNode[][];
}) {
  const columns =
    headers.length <= 1 ? "minmax(0,1fr)" : `minmax(0,1fr) repeat(${headers.length - 1}, max-content)`;

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">{empty}</p>
        ) : (
          <div className="grid gap-x-4 text-sm" style={{ gridTemplateColumns: columns }}>
            {headers.map((header, i) => (
              <div
                key={header}
                className={`border-b py-2 font-medium text-muted-foreground ${
                  i === 0 ? "min-w-0 pl-4" : "text-right whitespace-nowrap"
                } ${i === headers.length - 1 ? "pr-4" : ""}`}
              >
                {header}
              </div>
            ))}
            {rows.map((row, rowIndex) =>
              row.map((cell, i) => (
                <div
                  key={`${rowIndex}-${i}`}
                  className={`py-2 ${rowIndex === rows.length - 1 ? "" : "border-b"} ${
                    i === 0
                      ? "min-w-0 pl-4 font-medium break-words"
                      : "text-right tabular-nums whitespace-nowrap"
                  } ${i === headers.length - 1 ? "pr-4" : ""}`}
                >
                  {cell}
                </div>
              )),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
