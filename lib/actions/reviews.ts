"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileDisplayName } from "@/lib/utils/profileDisplayName";
import type { ProductReview } from "@/lib/reviews/summary";

const submitSchema = z.object({
  productId: z.string().uuid(),
  productSlug: z.string().min(1).max(200),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(10, "Write at least 10 characters").max(5000),
});

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .select(
      "id, product_id, user_id, rating, title, body, author_display_name, is_verified_purchase, source, created_at",
    )
    .eq("product_id", productId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getProductReviews", error.message);
    return [];
  }
  return (data ?? []) as ProductReview[];
}

export async function getReviewEligibility(productId: string): Promise<{
  signedIn: boolean;
  canReview: boolean;
  alreadyReviewed: boolean;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { signedIn: false, canReview: false, alreadyReviewed: false };
  }

  const { data: existing } = await supabase
    .from("product_reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { signedIn: true, canReview: false, alreadyReviewed: true };
  }

  const { data: can } = await supabase.rpc("can_review_product", {
    p_product_id: productId,
  });

  return {
    signedIn: true,
    canReview: Boolean(can),
    alreadyReviewed: false,
  };
}

export async function submitProductReview(input: z.infer<typeof submitSchema>) {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to leave a review" };

  const { data: can, error: canError } = await supabase.rpc("can_review_product", {
    p_product_id: parsed.data.productId,
  });
  if (canError) return { error: canError.message };
  if (!can) {
    return {
      error: "Only verified buyers can leave a review for this product",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const display =
    profileDisplayName(profile ?? {}) ||
    user.email?.split("@")[0] ||
    "Customer";

  const { data: purchase } = await supabase
    .from("order_items")
    .select("order_id, orders!inner(user_id, financial_status)")
    .eq("product_id", parsed.data.productId)
    .eq("orders.user_id", user.id)
    .in("orders.financial_status", ["paid", "partially_refunded"])
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("product_reviews").insert({
    product_id: parsed.data.productId,
    user_id: user.id,
    order_id: purchase?.order_id ?? null,
    rating: parsed.data.rating,
    title: parsed.data.title?.trim() || null,
    body: parsed.data.body.trim(),
    author_display_name: display.slice(0, 120),
    is_verified_purchase: true,
    is_published: true,
    source: "storefront",
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You already reviewed this product" };
    }
    return { error: error.message };
  }

  revalidatePath(`/products/${parsed.data.productSlug}`);
  return { ok: true as const };
}
