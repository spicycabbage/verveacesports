import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { computeCheckoutQuote, QuoteError } from "@/lib/checkout/quote";
import { getSiteFromRequest } from "@/lib/site/get-site";
import { MAX_CART_LINES, MAX_LINE_QTY } from "@/lib/constants";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().optional(),
        qty: z.number().int().positive().max(MAX_LINE_QTY),
      }),
    )
    .min(1)
    .max(MAX_CART_LINES),
  currency: z.literal("CAD"),
  country: z.enum(["US", "CA"]),
  pointsToRedeem: z.number().int().min(0).default(0),
  discountCode: z.string().trim().min(1).max(64).optional(),
  region: z.string().trim().min(1).optional(),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimit(`checkout-quote:${clientIp(req)}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests, slow down" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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
