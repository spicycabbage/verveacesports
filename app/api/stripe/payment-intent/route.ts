import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { computeCheckoutQuote, QuoteError } from "@/lib/checkout/quote";
import { normalizeTaxRegion } from "@/lib/constants";
import { getSiteFromRequest } from "@/lib/site/get-site";
import { toMinorUnits } from "@/lib/utils/currency";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";

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
  const ipLimited = rateLimit(`payment-intent:ip:${clientIp(req)}`, 10, 60_000);
  if (!ipLimited.ok) {
    return NextResponse.json(
      { error: "Too many checkout attempts, try again shortly" },
      { status: 429, headers: { "Retry-After": String(ipLimited.retryAfterSeconds) } },
    );
  }

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

  const normalizedRegion = normalizeTaxRegion(country, shippingAddress.state);
  if (!normalizedRegion) {
    return NextResponse.json({ error: "Invalid state/province" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const userLimited = rateLimit(`payment-intent:user:${user.id}`, 6, 60_000);
  if (!userLimited.ok) {
    return NextResponse.json(
      { error: "Too many checkout attempts, try again shortly" },
      { status: 429, headers: { "Retry-After": String(userLimited.retryAfterSeconds) } },
    );
  }

  const site = getSiteFromRequest(req);
  const admin = createSupabaseAdminClient();

  let quote;
  try {
    quote = await computeCheckoutQuote(admin, {
      items,
      currency,
      country,
      userId: user.id,
      site,
      pointsToRedeem,
      discountCode,
      region: shippingAddress.state,
      requireValidRegion: true,
    });
  } catch (err) {
    if (err instanceof QuoteError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to price order" }, { status: 500 });
  }

  const normalizedShipping = {
    ...shippingAddress,
    state: normalizedRegion,
  };

  if (quote.total < 0.5) {
    return NextResponse.json(
      { error: "Order total below minimum charge of $0.50" },
      { status: 400 },
    );
  }

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      site_id: site.id,
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
      shipping_address: normalizedShipping,
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
    cost_usd: li.unitCostUsd,
    cost_cad: li.unitCostCad,
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

  // Reserve the discount usage atomically so a single-use code can't be spent
  // by concurrent checkouts. Released if payment never succeeds.
  if (quote.discountCode) {
    const { data: reserved, error: discountErr } = await admin.rpc("reserve_discount", {
      p_code: quote.discountCode,
      p_order: order.id,
      p_user: user.id,
      p_amount: quote.discountTotal,
    });
    if (discountErr || !reserved) {
      await admin.rpc("release_order_inventory", { p_order: order.id });
      await admin.from("order_items").delete().eq("order_id", order.id);
      await admin.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Discount code is no longer available" },
        { status: 409 },
      );
    }
  }

  // Atomic redemption: fails cleanly if the balance was spent concurrently.
  if (quote.redeemPoints > 0) {
    const { data: redeemed, error: redeemErr } = await admin.rpc("redeem_loyalty_points", {
      p_user: user.id,
      p_points: quote.redeemPoints,
    });
    if (redeemErr || !redeemed) {
      await admin.rpc("release_discount", { p_order: order.id });
      await admin.rpc("release_order_inventory", { p_order: order.id });
      await admin.from("order_items").delete().eq("order_id", order.id);
      await admin.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Not enough loyalty points available" },
        { status: 409 },
      );
    }
    await admin.from("loyalty_transactions").insert({
      user_id: user.id,
      order_id: order.id,
      type: "redeem",
      points: -quote.redeemPoints,
      note: `Redeemed at checkout (order ${order.id})`,
    });
  }

  let intent;
  try {
    const stripe = getStripe(currency);
    intent = await stripe.paymentIntents.create({
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
  } catch (err) {
    await admin.rpc("release_discount", { p_order: order.id });
    await admin.rpc("release_order_inventory", { p_order: order.id });
    if (quote.redeemPoints > 0) {
      await admin.rpc("adjust_loyalty_points", {
        p_user: user.id,
        p_delta: quote.redeemPoints,
      });
      await admin
        .from("loyalty_transactions")
        .delete()
        .eq("order_id", order.id)
        .eq("type", "redeem");
    }
    await admin.from("order_items").delete().eq("order_id", order.id);
    await admin.from("orders").delete().eq("id", order.id);
    const msg = err instanceof Error ? err.message : "Payment provider error";
    console.error("payment-intent: stripe create failed", msg);
    return NextResponse.json({ error: `Payment setup failed: ${msg}` }, { status: 502 });
  }

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
