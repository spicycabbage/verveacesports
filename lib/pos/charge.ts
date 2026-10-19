import type { SupabaseClient } from "@supabase/supabase-js";
import { SITES, type SiteId } from "@/lib/site/config";
import { computeCheckoutQuote, QuoteError, type QuoteCustomItem } from "@/lib/checkout/quote";
import { getStripe } from "@/lib/stripe/server";
import { toMinorUnits } from "@/lib/utils/currency";
import type { Currency } from "@/lib/constants";
import { normalizeTaxRegion } from "@/lib/constants";
import {
  POS_COUNTRY,
  POS_CURRENCY,
  loadPosSettings,
  pickupAddress,
  stripeLocationIdFor,
  tapToPayPaymentMethodTypes,
  terminalPaymentMethodTypes,
} from "@/lib/pos/settings";
import { voidPendingOrder } from "@/lib/pos/void-pending-order";
import { isMissingColumn } from "@/lib/supabase/order-row";
import { revalidateCatalogCache } from "@/lib/catalog/invalidate";

export type PosCartItem = {
  productId: string;
  variantId?: string;
  qty: number;
};

export type PosCollectMethod = "reader" | "tap_to_pay";

export type PosChargeInput = {
  items: PosCartItem[];
  customItems?: QuoteCustomItem[];
  siteId: SiteId;
  readerId?: string;
  collect?: PosCollectMethod;
  discountCode?: string;
  email?: string;
  customerName?: string;
  actorId: string;
};

export type PosChargeResult = {
  orderId: string;
  paymentIntentId: string;
  readerId: string;
  collect: PosCollectMethod;
  total: number;
  currency: Currency;
  clientSecret?: string;
  connectionToken?: string;
  locationId?: string;
};

async function rollbackCreatedOrder(
  admin: SupabaseClient,
  orderId: string,
  redeemPoints: number,
  userId: string | null,
): Promise<void> {
  await admin.rpc("release_discount", { p_order: orderId });
  await admin.rpc("release_order_inventory", { p_order: orderId });
  revalidateCatalogCache();
  if (userId && redeemPoints > 0) {
    await admin.rpc("adjust_loyalty_points", { p_user: userId, p_delta: redeemPoints });
    await admin.from("loyalty_transactions").delete().eq("order_id", orderId).eq("type", "redeem");
  }
  await admin.from("order_items").delete().eq("order_id", orderId);
  await admin.from("orders").delete().eq("id", orderId);
}

export async function createPosCharge(
  admin: SupabaseClient,
  input: PosChargeInput,
): Promise<PosChargeResult> {
  const collect: PosCollectMethod = input.collect === "tap_to_pay" ? "tap_to_pay" : "reader";
  if (collect === "reader" && !input.readerId) {
    throw new QuoteError("Reader not found", 400);
  }

  const settings = await loadPosSettings(admin);
  if (!settings) throw new QuoteError("No default inventory location configured", 500);

  const region = normalizeTaxRegion(POS_COUNTRY, settings.taxRegion);
  if (!region) throw new QuoteError("Set the store tax region in POS settings", 400);

  let userId: string | null = null;
  const email = input.email?.trim().toLowerCase() || null;
  if (email) {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();
    userId = profile?.id ?? null;
  }

  const site = SITES[input.siteId];
  const quote = await computeCheckoutQuote(admin, {
    items: input.items,
    currency: POS_CURRENCY,
    country: POS_COUNTRY,
    userId: userId ?? undefined,
    site,
    discountCode: input.discountCode,
    customItems: input.customItems,
    allowCustomItems: true,
    allowManualDiscount: true,
    region,
    requireValidRegion: true,
    shippingMode: "pickup",
  });

  if (quote.total < 0.5) {
    throw new QuoteError("Order total below minimum charge of $0.50", 400);
  }

  const shipping = pickupAddress(settings, input.customerName || email || "Walk-in");
  const orderRow = {
    user_id: userId,
    site_id: site.id,
    status: "pending",
    financial_status: "pending",
    fulfillment_status: "unfulfilled",
    sales_channel: "pos",
    currency: POS_CURRENCY,
    email,
    subtotal: quote.subtotal,
    tax: quote.tax,
    tax_rate: quote.taxRate,
    shipping: 0,
    discount_code: quote.discountCode,
    discount_total: quote.discountTotal,
    points_redeemed: 0,
    points_value: 0,
    total: quote.total,
    country: POS_COUNTRY,
    shipping_address: shipping,
    admin_note:
      collect === "tap_to_pay"
        ? `POS in-person · ${site.shortName} · Tap to Pay`
        : `POS in-person · ${site.shortName} · reader ${input.readerId}`,
  };
  let { data: order, error: orderErr } = await admin
    .from("orders")
    .insert(orderRow)
    .select("id")
    .single();
  if (orderErr && isMissingColumn(orderErr.message, "site_id")) {
    const { site_id: _omit, ...withoutSite } = orderRow;
    ({ data: order, error: orderErr } = await admin
      .from("orders")
      .insert(withoutSite)
      .select("id")
      .single());
  }
  if (orderErr || !order) {
    throw new QuoteError(orderErr?.message || "Failed to create order", 500);
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
    currency: POS_CURRENCY,
    product_name: li.name,
    product_image: li.image,
    variant_title: li.variantTitle,
  }));
  const { error: itemsErr } = await admin.from("order_items").insert(itemsToInsert);
  if (itemsErr) {
    await admin.from("orders").delete().eq("id", order.id);
    const hint = itemsErr.message?.includes("product_id")
      ? " — apply migration 0040_pos_custom_order_items.sql"
      : "";
    throw new QuoteError(`${itemsErr.message || "Failed to create order items"}${hint}`, 500);
  }

  const { error: reserveErr } = await admin.rpc("reserve_order_inventory", { p_order: order.id });
  if (reserveErr) {
    await admin.from("orders").delete().eq("id", order.id);
    const msg = reserveErr.message?.includes("INSUFFICIENT_STOCK")
      ? reserveErr.message.replace("INSUFFICIENT_STOCK:", "Out of stock:").trim()
      : "Could not reserve inventory";
    throw new QuoteError(msg, 409);
  }
  revalidateCatalogCache();

  if (quote.discountCode && !quote.discountManual) {
    const { data: reserved, error: discountErr } = await admin.rpc("reserve_discount", {
      p_code: quote.discountCode,
      p_order: order.id,
      p_user: userId,
      p_amount: quote.discountTotal,
    });
    if (discountErr || !reserved) {
      await admin.rpc("release_order_inventory", { p_order: order.id });
      revalidateCatalogCache();
      await admin.from("order_items").delete().eq("order_id", order.id);
      await admin.from("orders").delete().eq("id", order.id);
      throw new QuoteError("Discount code is no longer available", 409);
    }
  }

  const stripe = getStripe(POS_CURRENCY);
  const locationId = stripeLocationIdFor(settings);
  if (collect === "tap_to_pay" && !locationId) {
    throw new QuoteError("Create a Stripe Terminal location in POS settings first", 400);
  }

  let intent;
  try {
    intent = await stripe.paymentIntents.create({
      amount: toMinorUnits(quote.total),
      currency: POS_CURRENCY.toLowerCase(),
      payment_method_types:
        collect === "tap_to_pay" ? tapToPayPaymentMethodTypes() : terminalPaymentMethodTypes(),
      capture_method: "automatic",
      metadata: {
        order_id: order.id,
        sales_channel: "pos",
        site_id: site.id,
        charged_by: input.actorId,
        collect,
      },
      description: `In-person POS ${site.shortName} ${order.id}`,
    });
  } catch (err) {
    await rollbackCreatedOrder(admin, order.id, 0, userId);
    const msg = err instanceof Error ? err.message : "Payment provider error";
    throw new QuoteError(`Payment setup failed: ${msg}`, 502);
  }

  await admin.from("orders").update({ stripe_pi_id: intent.id }).eq("id", order.id);
  await admin.from("payments").insert({
    order_id: order.id,
    kind: "sale",
    status: "pending",
    amount: quote.total,
    currency: POS_CURRENCY,
    gateway: "stripe_terminal",
    stripe_payment_intent_id: intent.id,
  });

  if (collect === "tap_to_pay") {
    let connectionToken: string;
    try {
      const token = await stripe.terminal.connectionTokens.create(
        locationId ? { location: locationId } : {},
      );
      connectionToken = token.secret;
    } catch (err) {
      try {
        await stripe.paymentIntents.cancel(intent.id);
      } catch {
        /* ignore */
      }
      await rollbackCreatedOrder(admin, order.id, 0, userId);
      const msg = err instanceof Error ? err.message : "Connection token failed";
      throw new QuoteError(`Tap to Pay setup failed: ${msg}`, 502);
    }
    return {
      orderId: order.id,
      paymentIntentId: intent.id,
      readerId: "tap_to_pay",
      collect,
      total: quote.total,
      currency: POS_CURRENCY,
      clientSecret: intent.client_secret ?? undefined,
      connectionToken,
      locationId,
    };
  }

  try {
    await stripe.terminal.readers.processPaymentIntent(input.readerId!, {
      payment_intent: intent.id,
    });
  } catch (err) {
    try {
      await stripe.paymentIntents.cancel(intent.id);
    } catch {
      /* already failed */
    }
    await voidPendingOrder(admin, order.id, err instanceof Error ? err.message : "Reader rejected charge");
    const msg = err instanceof Error ? err.message : "Reader error";
    throw new QuoteError(`Reader failed: ${msg}`, 502);
  }

  return {
    orderId: order.id,
    paymentIntentId: intent.id,
    readerId: input.readerId!,
    collect,
    total: quote.total,
    currency: POS_CURRENCY,
  };
}
