export type ProductReview = {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number;
  title: string | null;
  body: string;
  author_display_name: string;
  is_verified_purchase: boolean;
  source: "storefront" | "legacy" | "import";
  created_at: string;
};

export type ProductReviewSummary = {
  count: number;
  average: number;
};

export function summarizeReviews(reviews: ProductReview[]): ProductReviewSummary {
  if (reviews.length === 0) return { count: 0, average: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    count: reviews.length,
    average: Math.round((sum / reviews.length) * 10) / 10,
  };
}
