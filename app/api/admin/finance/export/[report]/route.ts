import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPayouts, getTaxReport, parseRange } from "@/lib/actions/finance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers.join(","), ...rows.map((r) => r.map(csvEscape).join(","))].join("\n");
}

function csvResponse(filename: string, content: string): NextResponse {
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

type Params = Promise<{ report: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: 403 });
  }

  const { report } = await params;
  const sp = req.nextUrl.searchParams;
  const range = parseRange({ from: sp.get("from") ?? undefined, to: sp.get("to") ?? undefined });
  const stamp = `${range.from.slice(0, 10)}_${range.to.slice(0, 10)}`;

  switch (report) {
    case "orders": {
      const admin = createSupabaseAdminClient();
      const { data } = await admin
        .from("orders")
        .select(
          "id, paid_at, created_at, email, country, currency, financial_status, subtotal, discount_code, discount_total, points_value, tax, tax_rate, shipping, total, refunded_total",
        )
        .in("financial_status", ["paid", "partially_refunded", "refunded"])
        .gte("paid_at", range.from)
        .lte("paid_at", range.to)
        .order("paid_at", { ascending: true });
      const csv = toCsv(
        [
          "order_id",
          "paid_at",
          "email",
          "country",
          "currency",
          "financial_status",
          "gross_sales",
          "discount_code",
          "discount",
          "points_value",
          "tax",
          "tax_rate",
          "shipping",
          "total",
          "refunded",
          "net_sales",
        ],
        (data ?? []).map((o) => [
          o.id,
          o.paid_at,
          o.email,
          o.country,
          o.currency,
          o.financial_status,
          o.subtotal,
          o.discount_code,
          o.discount_total,
          o.points_value,
          o.tax,
          o.tax_rate,
          o.shipping,
          o.total,
          o.refunded_total,
          (
            Number(o.subtotal) -
            Number(o.discount_total) -
            Number(o.points_value) -
            Number(o.refunded_total)
          ).toFixed(2),
        ]),
      );
      return csvResponse(`orders_${stamp}.csv`, csv);
    }
    case "tax": {
      const rows = await getTaxReport(range);
      const csv = toCsv(
        ["currency", "tax_rate_percent", "order_count", "taxable_sales", "tax_collected"],
        rows.map((t) => [
          t.currency,
          (t.taxRate * 100).toFixed(2),
          t.orderCount,
          t.taxableSales.toFixed(2),
          t.taxCollected.toFixed(2),
        ]),
      );
      return csvResponse(`tax_${stamp}.csv`, csv);
    }
    case "payouts": {
      const rows = await getPayouts(range);
      const csv = toCsv(
        ["payout_id", "currency", "amount", "status", "arrival_date", "description"],
        rows.map((p) => [p.id, p.currency, p.amount.toFixed(2), p.status, p.arrivalDate, p.description]),
      );
      return csvResponse(`payouts_${stamp}.csv`, csv);
    }
    default:
      return NextResponse.json({ error: "Unknown report" }, { status: 404 });
  }
}
