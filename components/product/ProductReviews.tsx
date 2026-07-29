"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ReviewStars } from "@/components/product/ReviewStars";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { submitProductReview } from "@/lib/actions/reviews";
import type { ProductReview, ProductReviewSummary } from "@/lib/reviews/summary";

type Eligibility = {
  signedIn: boolean;
  canReview: boolean;
  alreadyReviewed: boolean;
};

type Props = {
  productId: string;
  productSlug: string;
  reviews: ProductReview[];
  summary: ProductReviewSummary;
  eligibility: Eligibility;
};

export function ProductReviews({
  productId,
  productSlug,
  reviews,
  summary,
  eligibility,
}: Props) {
  const router = useRouter();
  const dict = useDictionary();
  const r = dict.product.reviews;
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitProductReview({
        productId,
        productSlug,
        rating,
        title: title.trim() || undefined,
        body,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(r.thanksReview);
      setOpen(false);
      setTitle("");
      setBody("");
      setRating(5);
      router.refresh();
    });
  }

  return (
    <section aria-labelledby="reviews-heading" className="mt-10 sm:mt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="reviews-heading" className="text-lg font-bold tracking-tight sm:text-xl">
            {r.heading}
          </h2>
          {summary.count > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <ReviewStars rating={summary.average} size="md" />
              <span>
                {summary.average.toFixed(1)} · {summary.count}{" "}
                {summary.count === 1 ? r.reviewSingular : r.reviewPlural}
              </span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">{r.noReviews}</p>
          )}
        </div>

        {eligibility.canReview ? (
          <Button type="button" variant="outline" onClick={() => setOpen((v) => !v)}>
            {open ? r.cancel : r.writeReview}
          </Button>
        ) : null}
      </div>

      {!eligibility.signedIn ? (
        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            {r.signIn}
          </Link>{" "}
          {r.afterPurchase}
        </p>
      ) : eligibility.alreadyReviewed ? (
        <p className="mt-4 text-sm text-muted-foreground">{r.alreadyReviewed}</p>
      ) : !eligibility.canReview ? (
        <p className="mt-4 text-sm text-muted-foreground">{r.verifiedOnly}</p>
      ) : null}

      {open && eligibility.canReview ? (
        <form onSubmit={onSubmit} className="mt-6 max-w-xl space-y-4 border-t pt-6">
          <div className="space-y-2">
            <Label>{r.rating}</Label>
            <div className="flex items-center gap-0.5" role="radiogroup" aria-label={r.rating}>
              {[1, 2, 3, 4, 5].map((n) => {
                const on = n <= rating;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    onClick={() => setRating(n)}
                    className="rounded p-0.5 transition-colors hover:bg-muted"
                    aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  >
                    <Star
                      className={cn(
                        "h-5 w-5",
                        on ? "fill-amber-500 text-amber-500" : "text-muted-foreground/35",
                      )}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-title">{r.titleOptional}</Label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder={r.titlePlaceholder}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-body">{r.reviewBody}</Label>
            <Textarea
              id="review-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              minLength={10}
              maxLength={5000}
              placeholder={r.bodyPlaceholder}
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? r.submitting : r.submitReview}
          </Button>
        </form>
      ) : null}

      {reviews.length > 0 ? (
        <ul className="mt-8 divide-y border-t">
          {reviews.map((review) => (
            <li key={review.id} className="py-5">
              <div className="flex flex-wrap items-center gap-2">
                <ReviewStars rating={review.rating} />
                <span className="text-sm font-medium">{review.author_display_name}</span>
                {review.is_verified_purchase ? (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
                    {r.verifiedBuyer}
                  </span>
                ) : null}
              </div>
              {review.title ? (
                <p className="mt-2 text-sm font-semibold">{review.title}</p>
              ) : null}
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{review.body}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
