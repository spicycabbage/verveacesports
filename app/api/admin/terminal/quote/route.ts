import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { computeCheckoutQuote, QuoteError } from "@/lib/checkout/quote";
import { SITES } from "@/lib/site/config";
import { POS_COUNTRY, POS_CURRENCY, loadPosSettings } from "@/lib/pos/settings";
import { MAX_CART_LINES, MAX_LINE_QTY, normalizeTaxRegion } from "@/lib/constants";

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().optional(),
        qty: z.number().int().positive().max(MAX_LINE_QTY),
      }),
    )
    .max(MAX_CART_LINES)
    .default([]),
  customItems: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(80),
        description: z.string().trim().max(200).optional(),
        unitPrice: z.number().finite().min(0.01).max(99999.99),
        qty: z.number().int().positive().max(MAX_LINE_QTY),
      }),
    )
    .max(20)
    .default([]),
  siteId: z.enum(["verveace", "bleeq-ca"]).default("verveace"),
  discountCode: z.string().trim().min(1).max(64).optional(),
}).refine((data) => data.items.length + data.customItems.length > 0, {
  message: "Add an item first",
});

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const settings = await loadPosSettings(admin);
  const region = settings
    ? (normalizeTaxRegion(POS_COUNTRY, settings.taxRegion) ?? undefined)
    : undefined;

  try {
    const quote = await computeCheckoutQuote(admin, {
      items: parsed.data.items,
      currency: POS_CURRENCY,
      country: POS_COUNTRY,
      site: SITES[parsed.data.siteId],
      discountCode: parsed.data.discountCode,
      customItems: parsed.data.customItems,
      allowCustomItems: true,
      allowManualDiscount: true,
      region,
      shippingMode: "pickup",
    });
    return NextResponse.json({
      subtotal: quote.subtotal,
      tax: quote.tax,
      taxRate: quote.taxRate,
      taxLines: quote.taxLines,
      shipping: 0,
      discountTotal: quote.discountTotal,
      discountCode: quote.discountCode,
      total: quote.total,
    });
  } catch (err) {
    if (err instanceof QuoteError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to price cart" }, { status: 500 });
  }
}
