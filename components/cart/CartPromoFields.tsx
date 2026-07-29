"use client";

import { Loader2, Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils/format";
import { useDictionary, useT } from "@/lib/i18n/I18nProvider";
import type { useCartPromo } from "@/lib/store/use-cart-promo";

type Promo = ReturnType<typeof useCartPromo>;

export function CartPromoFields({
  promo,
  compact = false,
}: {
  promo: Promo;
  compact?: boolean;
}) {
  const dict = useDictionary();
  const t = useT();
  const {
    currency,
    promoCode,
    promoInput,
    setPromoInput,
    promoError,
    setPromoError,
    promoLoading,
    quote,
    discountTotal,
    applyPromo,
    removePromo,
  } = promo;

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Tag className="h-4 w-4 text-primary" />
        {dict.checkout.promo}
      </div>
      {promoCode ? (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-primary/25 bg-primary/5 p-3">
          <div className="space-y-1">
            <Badge variant="secondary" className="font-mono">
              {promoCode}
            </Badge>
            {discountTotal > 0 && (
              <p className="text-sm font-medium text-primary">
                {t("checkout.youSave", { amount: formatPrice(discountTotal, currency) })}
              </p>
            )}
            {quote?.freeShipping && (
              <p className="text-xs text-muted-foreground">
                {dict.checkout.freeShippingIncluded}
              </p>
            )}
            {!quote && (
              <p className="text-xs text-muted-foreground">Confirmed at checkout</p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removePromo}
            disabled={promoLoading}
          >
            <X className="h-4 w-4" /> {dict.common.remove}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <Input
              value={promoInput}
              onChange={(e) => {
                setPromoInput(e.target.value.toUpperCase());
                if (promoError) setPromoError(null);
              }}
              placeholder="SUMMER20"
              className="font-mono uppercase"
              aria-invalid={!!promoError}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), void applyPromo())}
            />
            <Button
              type="button"
              variant="secondary"
              className="shrink-0"
              onClick={() => void applyPromo()}
              disabled={promoLoading || !promoInput.trim()}
            >
              {promoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : dict.common.apply}
            </Button>
          </div>
          {promoError && (
            <p className="text-sm text-destructive" role="alert">
              {promoError}
            </p>
          )}
        </>
      )}
      {!compact && <p className="text-xs text-muted-foreground">One code per order.</p>}
    </div>
  );
}
