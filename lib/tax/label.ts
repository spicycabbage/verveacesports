import { normalizeTaxRegion } from "@/lib/constants";

export type TaxLine = {
  label: string;
  amount: number;
};

const GST_RATE = 0.05;

/** CRA GST/HST program account. Show on invoices and receipts. */
export const GST_NUMBER = "782936777RT0001";

/** Matches supabase/migrations/0032_ca_provincial_tax_rates.sql */
const CA_TAX_NAME: Record<string, string> = {
  AB: "GST",
  BC: "GST + PST",
  MB: "GST + RST",
  NB: "HST",
  NL: "HST",
  NS: "HST",
  NT: "GST",
  NU: "GST",
  ON: "HST",
  PE: "HST",
  QC: "GST + QST",
  SK: "GST + PST",
  YT: "GST",
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function formatTaxPercent(rate: number): string {
  const pct = rate * 100;
  return `${pct.toFixed(3).replace(/\.?0+$/, "")}%`;
}

export function caTaxName(region: string | null | undefined): string | null {
  const code = normalizeTaxRegion("CA", region);
  if (!code) return null;
  return CA_TAX_NAME[code] ?? null;
}

function nameFromRate(rate: number): string | null {
  if (rate <= 0) return null;
  const rounded = Math.round(rate * 100000) / 100000;
  if (rounded === 0.05) return "GST";
  if (rounded === 0.13 || rounded === 0.14 || rounded === 0.15) return "HST";
  if (rounded === 0.14975) return "GST + QST";
  if (rounded === 0.11) return "GST + PST";
  if (rounded === 0.12) return "GST + PST";
  return null;
}

function labeledRate(name: string, rate: number): string {
  return rate > 0 ? `${name} (${formatTaxPercent(rate)})` : name;
}

export function buildTaxLines(input: {
  country?: string | null;
  region?: string | null;
  rate: number;
  tax: number;
  taxableBase?: number;
}): TaxLine[] {
  const tax = round2(Number(input.tax) || 0);
  if (tax <= 0) return [];

  const rate = Number(input.rate) || 0;
  const country = (input.country ?? "").toUpperCase();
  const name =
    country === "CA"
      ? (caTaxName(input.region) ?? nameFromRate(rate) ?? "GST")
      : null;

  if (!name) {
    return [{ label: labeledRate("Tax", rate), amount: tax }];
  }

  if (name === "GST" || name === "HST") {
    return [{ label: labeledRate(name, rate || (name === "GST" ? GST_RATE : 0)), amount: tax }];
  }

  const provincialName = name.includes("QST") ? "QST" : name.includes("RST") ? "RST" : "PST";
  const provincialRate = rate > GST_RATE ? round2(rate - GST_RATE) : 0;
  const taxable =
    input.taxableBase != null && Number.isFinite(input.taxableBase)
      ? Math.max(0, Number(input.taxableBase))
      : rate > 0
        ? tax / rate
        : 0;
  const gstAmount = round2(taxable * GST_RATE);
  const provincialAmount = round2(tax - gstAmount);

  return [
    { label: labeledRate("GST", GST_RATE), amount: gstAmount },
    { label: labeledRate(provincialName, provincialRate), amount: provincialAmount },
  ].filter((line) => line.amount > 0);
}

export function taxLinesForOrder(order: {
  country?: string | null;
  tax: number;
  tax_rate: number;
  subtotal: number;
  discount_total?: number | null;
  points_value?: number | null;
  shipping?: number | null;
  shipping_address?: { state?: string | null; country?: string | null } | null;
}): TaxLine[] {
  const taxableBase = Math.max(
    0,
    round2(
      Number(order.subtotal) -
        Number(order.discount_total ?? 0) -
        Number(order.points_value ?? 0) +
        Number(order.shipping ?? 0),
    ),
  );
  return buildTaxLines({
    country: order.country ?? order.shipping_address?.country,
    region: order.shipping_address?.state,
    rate: Number(order.tax_rate) || 0,
    tax: Number(order.tax) || 0,
    taxableBase,
  });
}
