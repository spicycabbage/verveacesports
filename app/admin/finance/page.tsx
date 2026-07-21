import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Download } from "lucide-react";
import { formatPrice, formatDateOnly } from "@/lib/utils/format";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getDailyFinanceSeries,
  getDiscountReport,
  getFinanceSummary,
  getPayouts,
  getTaxReport,
  parseRange,
} from "@/lib/actions/finance";
import type { CurrencyFinance } from "@/lib/actions/finance";
import type { Currency } from "@/lib/constants";
import { FinanceCharts } from "./FinanceCharts";
import { FinanceDateRange } from "./FinanceDateRange";

export const metadata = { title: "Admin · Finance" };

type SearchParams = Promise<{ from?: string; to?: string }>;

export default async function FinancePage({ searchParams }: { searchParams: SearchParams }) {
  const guard = await requireAdmin();
  if (!guard.ok) redirect("/login?next=/admin/finance");

  const sp = await searchParams;
  const range = parseRange(sp);
  const [summary, taxReport, discountReport, payouts, dailySeries] = await Promise.all([
    getFinanceSummary(range),
    getTaxReport(range),
    getDiscountReport(range),
    getPayouts(range),
    getDailyFinanceSeries(range),
  ]);

  const active = summary.filter((s) => s.orderCount > 0);
  const shown = active.length > 0 ? active : summary;
  const exportQuery = `from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
          <p className="text-sm text-muted-foreground">
            Paid orders from {formatDateOnly(range.from)} to {formatDateOnly(range.to)}. Totals are
            shown in each native currency (no FX conversion).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/api/admin/finance/export/orders?${exportQuery}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Download className="h-4 w-4" /> Orders CSV
          </Link>
          <Link
            href={`/api/admin/finance/export/tax?${exportQuery}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Download className="h-4 w-4" /> Tax CSV
          </Link>
          <Link
            href={`/api/admin/finance/export/payouts?${exportQuery}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Download className="h-4 w-4" /> Payouts CSV
          </Link>
        </div>
      </div>

      <FinanceDateRange from={range.from} to={range.to} />

      <FinanceCharts
        summary={summary}
        dailySeries={dailySeries}
        taxReport={taxReport}
        discountReport={discountReport}
        payouts={payouts}
      />

      {shown.map((s) => (
        <CurrencySummary key={s.currency} data={s} />
      ))}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tax collected</CardTitle>
            <CardDescription>By rate and currency, for remittance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {taxReport.length === 0 && (
              <p className="text-muted-foreground">No tax collected in range.</p>
            )}
            {taxReport.map((t) => (
              <div key={`${t.currency}-${t.taxRate}`} className="flex justify-between gap-2">
                <span className="text-muted-foreground">
                  {t.currency} · {(t.taxRate * 100).toFixed(2)}% · {t.orderCount} orders
                </span>
                <span className="tabular-nums">{formatPrice(t.taxCollected, t.currency)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Discount performance</CardTitle>
            <CardDescription>Redemptions and total discount given.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {discountReport.length === 0 && (
              <p className="text-muted-foreground">No discounts redeemed in range.</p>
            )}
            {discountReport.map((d) => (
              <div key={d.code} className="flex justify-between gap-2">
                <span className="text-muted-foreground">
                  {d.code} · {d.redemptions}×
                </span>
                <span className="tabular-nums">−{d.totalDiscount.toFixed(2)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payout reconciliation</CardTitle>
          <CardDescription>
            Stripe deposits to your bank. Synced from webhooks; empty until the first payout event
            arrives.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {payouts.length === 0 && (
            <p className="text-muted-foreground">No payouts in range.</p>
          )}
          {payouts.map((p) => (
            <div key={p.id} className="flex justify-between gap-2">
              <span className="text-muted-foreground">
                {p.arrivalDate ? formatDateOnly(p.arrivalDate) : "pending"} · {p.status}
              </span>
              <span className="tabular-nums">{formatPrice(p.amount, p.currency)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function CurrencySummary({ data }: { data: CurrencyFinance }) {
  const c = data.currency as Currency;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{c} summary</CardTitle>
        <CardDescription>{data.orderCount} paid orders</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Gross sales" value={formatPrice(data.grossSales, c)} />
        <Metric label="Discounts" value={`−${formatPrice(data.discounts, c)}`} />
        <Metric label="Points redeemed" value={`−${formatPrice(data.pointsRedeemed, c)}`} />
        <Metric label="Refunds" value={`−${formatPrice(data.refunds, c)}`} />
        <Metric label="Net sales" value={formatPrice(data.netSales, c)} strong />
        <Metric label="Tax collected" value={formatPrice(data.tax, c)} />
        <Metric label="Shipping" value={formatPrice(data.shipping, c)} />
        <Metric label="Total collected" value={formatPrice(data.totalCollected, c)} />
        <Metric label="Stripe fees" value={`−${formatPrice(data.stripeFees, c)}`} />
        <Metric label="Est. COGS" value={`−${formatPrice(data.estimatedCogs, c)}`} />
        <Metric label="Gross margin" value={formatPrice(data.grossMargin, c)} />
        <Metric label="Gross profit" value={formatPrice(data.grossProfit, c)} strong />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`tabular-nums ${strong ? "text-lg font-bold" : "text-sm font-medium"}`}>
        {value}
      </p>
    </div>
  );
}
