"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store/cart";
import { useCountryStore } from "@/lib/store/country";
import { formatPrice } from "@/lib/utils/format";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export type CartQuotePreview = {
  subtotal: number;
  discountTotal: number;
  discountCode: string | null;
  freeShipping: boolean;
  shipping: number;
  total: number;
  lineItems?: {
    productId: string;
    variantId: string;
    priceUsd: number;
    priceCad: number;
  }[];
  error?: string;
};

export function useCartPromo(enabled: boolean) {
  const items = useCartStore((s) => s.items);
  const promoCode = useCartStore((s) => s.promoCode);
  const setPromoCode = useCartStore((s) => s.setPromoCode);
  const { currency, country } = useCountryStore();
  const dict = useDictionary();
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [quote, setQuote] = useState<CartQuotePreview | null>(null);

  const cartItems = useMemo(
    () =>
      items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        qty: i.qty,
      })),
    [items],
  );
  const cartItemsKey = useMemo(
    () => cartItems.map((i) => `${i.productId}:${i.variantId}:${i.qty}`).join("|"),
    [cartItems],
  );

  const refreshQuote = useCallback(
    async (code: string | null) => {
      if (cartItems.length === 0) {
        setQuote(null);
        return null;
      }
      setPromoLoading(true);
      try {
        const res = await fetch("/api/checkout/quote", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            items: cartItems,
            currency,
            country,
            pointsToRedeem: 0,
            discountCode: code ?? undefined,
          }),
        });
        const data = (await res.json()) as CartQuotePreview;
        if (res.status === 401) {
          if (code) {
            setPromoCode(code);
            setQuote(null);
            setPromoError(null);
            toast.message("Promo saved — sign in at checkout to confirm");
            return { ok: true as const, guest: true as const };
          }
          setQuote(null);
          return null;
        }
        if (!res.ok) throw new Error(data.error || "Could not apply promo");
        setQuote(data);
        if (data.lineItems?.length) {
          useCartStore.getState().syncPrices(
            data.lineItems.map((li) => ({
              productId: li.productId,
              variantId: li.variantId,
              priceUsd: li.priceUsd,
              priceCad: li.priceCad,
            })),
          );
        }
        setPromoError(null);
        return { ok: true as const, guest: false as const, data };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Invalid promo code";
        if (code) {
          setPromoError(msg);
          toast.error(msg);
        }
        return { ok: false as const, error: msg };
      } finally {
        setPromoLoading(false);
      }
    },
    [cartItems, currency, country, setPromoCode],
  );

  useEffect(() => {
    if (!enabled || items.length === 0) {
      setQuote(null);
      return;
    }
    void (async () => {
      const result = await refreshQuote(promoCode);
      if (
        result &&
        !result.ok &&
        promoCode &&
        /discount|promo|code|minimum|expired|invalid/i.test(result.error ?? "")
      ) {
        setPromoCode(null);
        setQuote(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when cart composition changes
  }, [enabled, cartItemsKey, currency, country, promoCode]);

  async function applyPromo() {
    const code = promoInput.trim();
    if (!code) {
      toast.error("Enter a promo code");
      return;
    }
    setPromoError(null);
    const result = await refreshQuote(code);
    if (!result?.ok) return;
    if (result.guest) {
      setPromoInput("");
      return;
    }
    const data = result.data;
    setPromoCode(data.discountCode ?? code);
    setPromoInput("");
    const saved =
      data.discountTotal > 0
        ? formatPrice(data.discountTotal, currency)
        : data.freeShipping
          ? "free shipping"
          : "applied";
    toast.success(`Promo ${data.discountCode ?? code} — ${saved}`);
  }

  function removePromo() {
    setPromoCode(null);
    setPromoInput("");
    setPromoError(null);
    void refreshQuote(null);
    toast.message(dict.checkout.promoRemoved);
  }

  const discountTotal = quote?.discountTotal ?? 0;

  return {
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
  };
}
