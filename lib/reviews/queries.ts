import { cacheLife, cacheTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { reviewsTag } from "@/lib/catalog/tags";
import type { ProductReview } from "@/lib/reviews/summary";

// Read-only review queries for Server Components. Kept out of
// lib/actions/reviews.ts on purpose: every export of a "use server" module is
// a publicly callable endpoint.

/** Published reviews are public; cached per product and expired by submitProductReview. */
export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  "use cache";
  cacheTag(reviewsTag(productId));
  cacheLife("hours");

  const supabase = createSupabasePublicClient();
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
