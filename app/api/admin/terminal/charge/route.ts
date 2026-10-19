import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { QuoteError } from "@/lib/checkout/quote";
import { createPosCharge } from "@/lib/pos/charge";
import { parsePosCustomerEmail } from "@/lib/pos/customer-email";
import { MAX_CART_LINES, MAX_LINE_QTY } from "@/lib/constants";

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
  siteId: z.enum(["verveace", "bleeq-ca"]),
  collect: z.enum(["reader", "tap_to_pay"]).default("reader"),
  readerId: z.string().min(3).max(64).optional(),
  discountCode: z.string().trim().min(1).max(64).optional(),
  email: z.string().trim().max(200).optional(),
  customerName: z.string().trim().max(80).optional(),
}).refine((data) => data.items.length + data.customItems.length > 0, {
  message: "Add an item first",
}).refine((data) => data.collect !== "reader" || Boolean(data.readerId), {
  message: "Reader required",
});

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const result = await createPosCharge(createSupabaseAdminClient(), {
      ...parsed.data,
      email: parsePosCustomerEmail(parsed.data.email),
      actorId: guard.userId,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof QuoteError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : "Charge failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
