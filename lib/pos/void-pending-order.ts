import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidateCatalogCache } from "@/lib/catalog/invalidate";

/** Cancel a pending POS/checkout order and release inventory / discounts / points. */
export async function voidPendingOrder(
  admin: SupabaseClient,
  orderId: string,
  errorMessage?: string,
): Promise<void> {
  const { data: order } = await admin
    .from("orders")
    .select("id, status, user_id, points_redeemed, stripe_pi_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.status !== "pending") return;

  await admin
    .from("orders")
    .update({
      status: "cancelled",
      financial_status: "voided",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  await admin.rpc("release_order_inventory", { p_order: orderId });
  revalidateCatalogCache();
  await admin.rpc("release_discount", { p_order: orderId });

  if (order.user_id && order.points_redeemed && order.points_redeemed > 0) {
    await admin.from("loyalty_transactions").insert({
      user_id: order.user_id,
      order_id: orderId,
      type: "adjust",
      points: order.points_redeemed,
      note: "Refunded redemption (payment failed)",
    });
    await admin.rpc("adjust_loyalty_points", {
      p_user: order.user_id,
      p_delta: order.points_redeemed,
    });
  }

  if (order.stripe_pi_id) {
    await admin
      .from("payments")
      .update({
        status: "failed",
        error_message: errorMessage ?? "Payment cancelled",
      })
      .eq("stripe_payment_intent_id", order.stripe_pi_id)
      .eq("kind", "sale");
  }
}
