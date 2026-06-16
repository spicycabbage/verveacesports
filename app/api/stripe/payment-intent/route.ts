import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { computeCheckoutQuote, QuoteError } from "@/lib/checkout/quote";
import { toMinorUnits } from "@/lib/utils/currency";

export const runtime = "nodejs";

const requestSchema = z.object({
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
  shippingAddress: z.object({
    full_name: z.string().min(1),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postal_code: z.string().min(1),
    country: z.enum(["US", "CA"]),
  }),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { items, currency, country, pointsToRedeem, discountCode, shippingAddress } = parsed.data;

  const expectedCurrency = country === "CA" ? "CAD" : "USD";
  if (currency !== expectedCurrency) {
    return NextResponse.json({ error: "Currency does not match market" }, { status: 400 });
  }
  if (shippingAddress.country !== country) {
    return NextResponse.json({ error: "Shipping country does not match market" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  let quote;
  try {
    quote = await computeCheckoutQuote(admin, {
      items,
      currency,
      country,
      userId: user.id,
      pointsToRedeem,
      discountCode,
      region: shippingAddress.state,
    });
  } catch (err) {
    if (err instanceof QuoteError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to price order" }, { status: 500 });
  }

  if (quote.total < 0.5) {
    return NextResponse.json(
      { error: "Order total below minimum charge of $0.50" },
      { status: 400 },
    );
  }

  const balance =
    (
      await admin.from("profiles").select("loyalty_points").eq("id", user.id).single()
    ).data?.loyalty_points ?? 0;

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      financial_status: "pending",
      fulfillment_status: "unfulfilled",
      currency,
      email: user.email ?? null,
      subtotal: quote.subtotal,
      tax: quote.tax,
      tax_rate: quote.taxRate,
      shipping: quote.shipping,
      discount_code: quote.discountCode,
      discount_total: quote.discountTotal,
      points_redeemed: quote.redeemPoints,
      points_value: quote.redeemValue,
      total: quote.total,
      country,
      shipping_address: shippingAddress,
    })
    .select()
    .single();
  if (orderErr || !order) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  const itemsToInsert = quote.lineItems.map((li) => ({
    order_id: order.id,
    product_id: li.productId,
    variant_id: li.variantId,
    location_id: li.locationId,
    sku: li.sku,
    qty: li.qty,
    unit_price: li.unitPrice,
    currency,
    product_name: li.name,
    product_image: li.image,
  }));
  const { error: itemsErr } = await admin.from("order_items").insert(itemsToInsert);
  if (itemsErr) {
    await admin.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
  }

  const { error: reserveErr } = await admin.rpc("reserve_order_inventory", { p_order: order.id });
  if (reserveErr) {
    await admin.from("orders").delete().eq("id", order.id);
    const msg = reserveErr.message?.includes("INSUFFICIENT_STOCK")
      ? reserveErr.message.replace("INSUFFICIENT_STOCK:", "Out of stock:").trim()
      : "Could not reserve inventory";
    return NextResponse.json({ error: msg }, { status: 409 });
  }

  if (quote.redeemPoints > 0) {
    await admin.from("loyalty_transactions").insert({
      user_id: user.id,
      order_id: order.id,
      type: "redeem",
      points: -quote.redeemPoints,
      note: `Redeemed at checkout (order ${order.id})`,
    });
    await admin
      .from("profiles")
      .update({ loyalty_points: balance - quote.redeemPoints })
      .eq("id", user.id);
  }

  const stripe = getStripe(currency);
  const intent = await stripe.paymentIntents.create({
    amount: toMinorUnits(quote.total),
    currency: currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    metadata: {
      order_id: order.id,
      user_id: user.id,
      points_redeemed: String(quote.redeemPoints),
    },
    description: `VerveaceSports order ${order.id}`,
  });

  await admin.from("orders").update({ stripe_pi_id: intent.id }).eq("id", order.id);
  await admin.from("payments").insert({
    order_id: order.id,
    kind: "sale",
    status: "pending",
    amount: quote.total,
    currency,
    gateway: "stripe",
    stripe_payment_intent_id: intent.id,
  });

  return NextResponse.json({
    clientSecret: intent.client_secret,
    orderId: order.id,
    total: quote.total,
    subtotal: quote.subtotal,
    discountTotal: quote.discountTotal,
    discountCode: quote.discountCode,
    tax: quote.tax,
    shipping: quote.shipping,
    redeemPoints: quote.redeemPoints,
    redeemValue: quote.redeemValue,
    currency,
  });
}
