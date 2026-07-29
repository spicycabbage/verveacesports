"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { getStripeClient } from "@/lib/stripe/client";
import { useCartStore, cartSubtotal, cartLineKey } from "@/lib/store/cart";
import { useCountryStore } from "@/lib/store/country";
import { COUNTRIES, LOYALTY, regionsForCountry } from "@/lib/constants";
import type { CountryCode } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, ShoppingBag, Tag, X } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import { toMinorUnits } from "@/lib/utils/currency";
import { toast } from "sonner";
import { PaymentForm } from "./PaymentForm";
import { useSite } from "@/lib/site/SiteProvider";
import { useDictionary, useT } from "@/lib/i18n/I18nProvider";

type ShippingForm = {
  first_name: string;
  last_name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: "US" | "CA";
};

type QuoteLineItem = {
  productId: string;
  variantId: string;
  qty: number;
  unitPrice: number;
  priceUsd: number;
  priceCad: number;
  name: string;
};

type Quote = {
  lineItems: QuoteLineItem[];
  subtotal: number;
  discountTotal: number;
  discountCode: string | null;
  freeShipping: boolean;
  tax: number;
  taxRate: number;
  shipping: number;
  redeemPoints: number;
  redeemValue: number;
  total: number;
};

type IntentResp = Quote & {
  clientSecret: string;
  orderId: string;
  currency: "USD" | "CAD";
};

type CreateIntentResult = { clientSecret: string; orderId: string };

export function CheckoutClient({
  defaultMarket,
  defaultFirstName,
  defaultLastName,
  loyaltyPoints,
}: {
  defaultMarket: CountryCode;
  defaultFirstName: string;
  defaultLastName: string;
  loyaltyPoints: number;
}) {
  const site = useSite();
  const dict = useDictionary();
  const t = useT();
  const { items } = useCartStore();
  const promoCode = useCartStore((s) => s.promoCode);
  const setPromoCode = useCartStore((s) => s.setPromoCode);
  const setCountry = useCountryStore((s) => s.setCountry);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setCountry(defaultMarket);
  }, [defaultMarket, setCountry]);

  const [shipping, setShipping] = useState<ShippingForm>({
    first_name: defaultFirstName,
    last_name: defaultLastName,
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: defaultMarket,
  });

  const checkoutCountry = shipping.country;
  const checkoutCurrency = COUNTRIES[checkoutCountry].currency;
  const stripePromise = useMemo(() => getStripeClient(checkoutCurrency), [checkoutCurrency]);

  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [debouncedState, setDebouncedState] = useState(shipping.state);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedState(shipping.state), 400);
    return () => clearTimeout(t);
  }, [shipping.state]);

  const cartItemsKey = useMemo(
    () => items.map((i) => `${i.productId}:${i.variantId}:${i.qty}`).join("|"),
    [items],
  );
  const cartItems = useMemo(
    () =>
      cartItemsKey
        ? cartItemsKey.split("|").map((key) => {
            const [productId, variantId, qty] = key.split(":");
            return { productId, variantId, qty: Number(qty) };
          })
        : [],
    [cartItemsKey],
  );

  const fetchQuote = useCallback(
    async (code: string | null) => {
      if (items.length === 0) {
        setQuote(null);
        return;
      }
      setQuoteLoading(true);
      try {
        const res = await fetch("/api/checkout/quote", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            items: cartItems,
            currency: checkoutCurrency,
            country: checkoutCountry,
            pointsToRedeem,
            discountCode: code ?? undefined,
            region: debouncedState.trim() || undefined,
          }),
        });
        const data = (await res.json()) as Quote & { error?: string };
        if (!res.ok) throw new Error(data.error || dict.checkout.couldNotUpdate);
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
      } catch (err) {
        const msg = err instanceof Error ? err.message : dict.checkout.couldNotUpdate;
        if (code) {
          setPromoError(msg);
          setPromoCode(null);
          toast.error(msg);
        }
      } finally {
        setQuoteLoading(false);
      }
    },
    [items.length, cartItems, checkoutCurrency, checkoutCountry, pointsToRedeem, debouncedState, setPromoCode, dict],
  );

  // Baseline quote (tax/shipping) when cart or region changes — no promo applied.
  useEffect(() => {
    if (!mounted || items.length === 0 || promoCode) return;
    void fetchQuote(null);
  }, [
    mounted,
    items.length,
    cartItems,
    checkoutCurrency,
    checkoutCountry,
    pointsToRedeem,
    debouncedState,
    promoCode,
    fetchQuote,
  ]);

  // Re-quote when points or tax region change while a promo is active.
  useEffect(() => {
    if (!mounted || items.length === 0 || !promoCode) return;
    void fetchQuote(promoCode);
  }, [mounted, items.length, pointsToRedeem, debouncedState, promoCode, checkoutCountry, fetchQuote]);

  function removePromo() {
    setPromoCode(null);
    setPromoError(null);
    void fetchQuote(null);
    toast.message(dict.checkout.promoRemoved);
  }

  const clientSubtotal = mounted ? cartSubtotal(items, checkoutCurrency) : 0;
  const clientShipping = clientSubtotal >= site.freeShippingOver ? 0 : 9.99;
  const quotedUnitByKey = useMemo(() => {
    const m = new Map<string, number>();
    for (const li of quote?.lineItems ?? []) {
      m.set(`${li.productId}:${li.variantId}`, li.unitPrice);
    }
    return m;
  }, [quote?.lineItems]);
  const maxRedeem = Math.min(
    loyaltyPoints,
    Math.floor((quote?.subtotal ?? clientSubtotal) * LOYALTY.POINTS_PER_DOLLAR_REDEEM),
  );

  const summary = quote;
  const subtotal = summary?.subtotal ?? clientSubtotal;
  const discountTotal = summary?.discountTotal ?? 0;
  const tax = summary?.tax ?? 0;
  const shippingFee = summary?.shipping ?? clientShipping;
  const redeemValue = summary?.redeemValue ?? pointsToRedeem / LOYALTY.POINTS_PER_DOLLAR_REDEEM;
  const redeemPts = summary?.redeemPoints ?? pointsToRedeem;
  const total =
    summary?.total ??
    Math.max(0, clientSubtotal - discountTotal + shippingFee - redeemValue + tax);

  function fieldsValid() {
    return (
      shipping.first_name.trim() &&
      shipping.last_name.trim() &&
      shipping.line1.trim() &&
      shipping.city.trim() &&
      shipping.state.trim() &&
      shipping.postal_code.trim()
    );
  }

  const createPaymentIntent = useCallback(async (): Promise<CreateIntentResult> => {
    if (!fieldsValid()) {
      throw new Error(dict.checkout.completeShipping);
    }
    const full_name = `${shipping.first_name.trim()} ${shipping.last_name.trim()}`.trim();
    const res = await fetch("/api/stripe/payment-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        items: cartItems,
        currency: checkoutCurrency,
        country: checkoutCountry,
        pointsToRedeem,
        discountCode: promoCode ?? undefined,
        shippingAddress: {
          full_name,
          line1: shipping.line1,
          line2: shipping.line2,
          city: shipping.city,
          state: shipping.state,
          postal_code: shipping.postal_code,
          country: shipping.country,
        },
      }),
    });
    const data = (await res.json().catch(() => null)) as IntentResp & { error?: string } | null;
    if (!res.ok || !data?.clientSecret || !data.orderId) {
      throw new Error(data?.error || `Failed to start payment (${res.status})`);
    }
    if (data.discountCode) setPromoCode(data.discountCode);
    setQuote(data);
    return { clientSecret: data.clientSecret, orderId: data.orderId };
  }, [
    cartItems,
    checkoutCurrency,
    checkoutCountry,
    pointsToRedeem,
    promoCode,
    setPromoCode,
    shipping,
    dict,
  ]);

  const paymentAmountMinor = toMinorUnits(total);
  const elementsKey = `${checkoutCurrency}-${paymentAmountMinor}`;
  const canPay = stripePromise && paymentAmountMinor >= 50 && !quoteLoading;

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="grid place-items-center gap-3 py-20 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold">{dict.checkout.empty}</h2>
          <Link href="/products" className={buttonVariants({})}>
            {dict.checkout.browseProducts}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">{dict.checkout.shippingAddress}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">{dict.checkout.firstName}</Label>
                <Input
                  id="first_name"
                  autoComplete="given-name"
                  value={shipping.first_name}
                  onChange={(e) => setShipping({ ...shipping, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name">{dict.checkout.lastName}</Label>
                <Input
                  id="last_name"
                  autoComplete="family-name"
                  value={shipping.last_name}
                  onChange={(e) => setShipping({ ...shipping, last_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="line1">{dict.checkout.address}</Label>
                <Input
                  id="line1"
                  value={shipping.line1}
                  onChange={(e) => setShipping({ ...shipping, line1: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="line2">{dict.checkout.aptOptional}</Label>
                <Input
                  id="line2"
                  value={shipping.line2}
                  onChange={(e) => setShipping({ ...shipping, line2: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">{dict.checkout.city}</Label>
                <Input
                  id="city"
                  value={shipping.city}
                  onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">{dict.checkout.stateProvince}</Label>
                <Select
                  value={shipping.state || undefined}
                  onValueChange={(v) => {
                    if (!v) return;
                    setShipping((s) => ({ ...s, state: v }));
                  }}
                >
                  <SelectTrigger id="state">
                    <SelectValue placeholder={dict.checkout.stateProvince} />
                  </SelectTrigger>
                  <SelectContent>
                    {regionsForCountry(shipping.country).map((r) => (
                      <SelectItem key={r.code} value={r.code}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="postal_code">{dict.checkout.postalCode}</Label>
                <Input
                  id="postal_code"
                  value={shipping.postal_code}
                  onChange={(e) => setShipping({ ...shipping, postal_code: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shipping_country">{dict.checkout.country}</Label>
                <Select
                  value={shipping.country}
                  onValueChange={(v) => {
                    if (!v) return;
                    const code = v as CountryCode;
                    setShipping((s) => ({ ...s, country: code, state: "" }));
                    setCountry(code);
                  }}
                >
                  <SelectTrigger id="shipping_country">
                    <SelectValue>{COUNTRIES[shipping.country].name}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(COUNTRIES) as CountryCode[]).map((code) => (
                      <SelectItem key={code} value={code}>
                        {COUNTRIES[code].name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">{dict.checkout.promo}</h2>
            </div>
            {promoCode ? (
              <div className="flex items-start justify-between gap-3 rounded-lg border border-primary/25 bg-primary/5 p-3">
                <div className="space-y-1">
                  <Badge variant="secondary" className="font-mono">
                    {promoCode}
                  </Badge>
                  {discountTotal > 0 && (
                    <p className="text-sm font-medium text-primary">
                      {t("checkout.youSave", {
                        amount: formatPrice(discountTotal, checkoutCurrency),
                      })}
                    </p>
                  )}
                  {summary?.freeShipping && shippingFee === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {dict.checkout.freeShippingIncluded}
                    </p>
                  )}
                  {promoError && (
                    <p className="text-sm text-destructive" role="alert">
                      {promoError}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removePromo}
                  disabled={quoteLoading}
                >
                  <X className="h-4 w-4" /> {dict.checkout.remove}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {dict.checkout.noPromo}{" "}
                <Link href="/cart" className="text-primary hover:underline">
                  {dict.checkout.addPromoOnCart}
                </Link>
                .
              </p>
            )}
          </CardContent>
        </Card>

        {loyaltyPoints > 0 && (
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">{dict.checkout.redeemPoints}</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("checkout.pointsAvailable", { n: loyaltyPoints.toLocaleString() })}
              </p>
              <input
                type="range"
                min={0}
                max={maxRedeem}
                step={100}
                value={pointsToRedeem}
                onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
              <div className="flex items-center justify-between text-sm">
                <span>
                  {dict.checkout.redeemN.split("{n}")[0]}
                  <strong>{pointsToRedeem.toLocaleString()}</strong>
                  {dict.checkout.redeemN.split("{n}")[1] ?? ""}
                </span>
                <span className="font-semibold tabular-nums">
                  −{formatPrice(pointsToRedeem / LOYALTY.POINTS_PER_DOLLAR_REDEEM, checkoutCurrency)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">{dict.checkout.payment}</h2>
            {!stripePromise ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {checkoutCurrency === "CAD"
                  ? dict.checkout.cadNotConfigured
                  : dict.checkout.currencyNotConfigured}
              </p>
            ) : quoteLoading && !quote ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {dict.checkout.calculating}
              </div>
            ) : paymentAmountMinor < 50 ? (
              <p className="text-sm text-muted-foreground">
                {dict.checkout.belowMinimum}
              </p>
            ) : (
              <Elements
                key={elementsKey}
                stripe={stripePromise}
                options={{
                  mode: "payment",
                  amount: paymentAmountMinor,
                  currency: checkoutCurrency.toLowerCase(),
                  appearance: { theme: "stripe", variables: { colorPrimary: "#ea580c" } },
                }}
              >
                <PaymentForm
                  disabled={!canPay}
                  createPaymentIntent={createPaymentIntent}
                  onSuccess={(orderId) => {
                    useCartStore.getState().clear();
                    router.push(`/checkout/success?order=${orderId}`);
                  }}
                />
              </Elements>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold">{dict.checkout.orderSummary}</h2>
          <ul className="space-y-1.5 text-sm">
            {items.map((i) => {
              const unit =
                quotedUnitByKey.get(cartLineKey(i)) ??
                (checkoutCurrency === "CAD" ? i.priceCad : i.priceUsd);
              return (
                <li key={cartLineKey(i)} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {i.name}
                    {i.variantLabel !== "Default" && (
                      <span className="text-xs"> · {i.variantLabel}</span>
                    )}{" "}
                    <span className="text-xs">×{i.qty}</span>
                  </span>
                  <span className="tabular-nums">{formatPrice(unit * i.qty, checkoutCurrency)}</span>
                </li>
              );
            })}
          </ul>
          <Separator />
          <div className="space-y-1 text-sm">
            <Row label={dict.checkout.subtotal} value={formatPrice(subtotal, checkoutCurrency)} />
            {discountTotal > 0 && (
              <Row
                label={
                  promoCode
                    ? t("checkout.discountWithCode", { code: promoCode })
                    : dict.checkout.discount
                }
                value={`−${formatPrice(discountTotal, checkoutCurrency)}`}
              />
            )}
            <Row
              label={
                summary?.freeShipping && shippingFee === 0
                  ? dict.checkout.shippingPromo
                  : dict.checkout.shipping
              }
              value={shippingFee === 0 ? dict.checkout.free : formatPrice(shippingFee, checkoutCurrency)}
            />
            {tax > 0 && (
              <Row
                label={
                  summary?.taxRate
                    ? t("checkout.taxWithRate", { rate: (summary.taxRate * 100).toFixed(2) })
                    : dict.checkout.tax
                }
                value={formatPrice(tax, checkoutCurrency)}
              />
            )}
            {redeemPts > 0 && (
              <Row
                label={t("checkout.points", { n: redeemPts.toLocaleString() })}
                value={`−${formatPrice(redeemValue, checkoutCurrency)}`}
              />
            )}
          </div>
          <Separator />
          <div className="flex justify-between text-base font-semibold">
            <span>{dict.checkout.total}</span>
            <span className="tabular-nums">
              {quoteLoading ? (
                <Loader2 className="inline h-4 w-4 animate-spin" />
              ) : (
                formatPrice(total, checkoutCurrency)
              )}
            </span>
          </div>
          {!quote && !quoteLoading && (
            <p className="text-xs text-muted-foreground">
              {dict.checkout.enterRegionForTax}
            </p>
          )}
          <p className="pt-2 text-xs text-muted-foreground">
            {t("checkout.earnPointsNote", { n: Math.floor(subtotal - discountTotal) })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
