import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { computeCheckoutQuote, QuoteError } from "@/lib/checkout/quote";
import { getSiteFromRequest } from "@/lib/site/get-site";

export const runtime = "nodejs";

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().optional(),
        qty: z.number().int().positive(),
      }),
    )
    .min(1),
  currency: z.enum(["USD", "CAD"]),
  country: z.enum(["US", "CA"]),
  pointsToRedeem: z.number().int().min(0).default(0),
  discountCode: z.string().trim().min(1).max(64).optional(),
  region: z.string().trim().min(1).optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const expectedCurrency = parsed.data.country === "CA" ? "CAD" : "USD";
  if (parsed.data.currency !== expectedCurrency) {
    return NextResponse.json({ error: "Currency does not match market" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const quote = await computeCheckoutQuote(createSupabaseAdminClient(), {
      items: parsed.data.items,
      currency: parsed.data.currency,
      country: parsed.data.country,
      userId: user.id,
      site: getSiteFromRequest(req),
      pointsToRedeem: parsed.data.pointsToRedeem,
      discountCode: parsed.data.discountCode,
      region: parsed.data.region,
    });
    return NextResponse.json(quote);
  } catch (err) {
    if (err instanceof QuoteError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to compute quote" }, { status: 500 });
  }
}
