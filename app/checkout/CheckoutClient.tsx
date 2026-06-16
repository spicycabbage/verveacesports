"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { getStripeClient } from "@/lib/stripe/client";
import { useCartStore, cartSubtotal, cartLineKey } from "@/lib/store/cart";
import { useCountryStore } from "@/lib/store/country";
import { COUNTRIES, LOYALTY } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, ShoppingBag, Tag, X } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import { toast } from "sonner";
import { PaymentForm } from "./PaymentForm";

type ShippingForm = {
  full_name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: "US" | "CA";
};

type Quote = {
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

export function CheckoutClient({
  defaultName,
  loyaltyPoints,
}: {
  defaultName: string;
  loyaltyPoints: number;
}) {
  const { items } = useCartStore();
  const { country, currency } = useCountryStore();
  const stripePromise = useMemo(() => getStripeClient(currency), [currency]);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [shipping, setShipping] = useState<ShippingForm>({
    full_name: defaultName,
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country,
  });
  useEffect(() => setShipping((s) => ({ ...s, country })), [country]);

  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [promoInput, setPromoInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [intent, setIntent] = useState<IntentResp | null>(null);
  const [creating, setCreating] = useState(false);
  const [debouncedState, setDebouncedState] = useState(shipping.state);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedState(shipping.state), 400);
    return () => clearTimeout(t);
  }, [shipping.state]);

  const cartItems = useMemo(
    () => items.map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty })),
    [items],
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
            currency,
            country,
            pointsToRedeem,
            discountCode: code ?? undefined,
            region: shipping.state.trim() || undefined,
          }),
        });
        const data = (await res.json()) as Quote & { error?: string };
        if (!res.ok) throw new Error(data.error || "Could not update totals");
        setQuote(data);
        setPromoError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not update totals";
        if (code) {
          setPromoError(msg);
          toast.error(msg);
        }
      } finally {
        setQuoteLoading(false);
      }
    },
    [items.length, cartItems, currency, country, pointsToRedeem, debouncedState],
  );

  // Baseline quote (tax/shipping) when cart or region changes — no promo applied.
  useEffect(() => {
    if (!mounted || intent || items.length === 0 || appliedCode) return;
    void fetchQuote(null);
  }, [
    mounted,
    intent,
    items.length,
    cartItems,
    currency,
    country,
    pointsToRedeem,
    debouncedState,
    appliedCode,
    fetchQuote,
  ]);

  // Re-quote when points or tax region change while a promo is active.
  useEffect(() => {
    if (!mounted || intent || items.length === 0 || !appliedCode) return;
    void fetchQuote(appliedCode);
  }, [mounted, intent, items.length, pointsToRedeem, debouncedState, appliedCode, fetchQuote]);

  async function applyPromo() {
    const code = promoInput.trim();
    if (!code) {
      toast.error("Enter a promo code");
      return;
    }
    setPromoError(null);
    setQuoteLoading(true);
    try {
      const res = await fetch("/api/checkout/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          currency,
          country,
          pointsToRedeem,
          discountCode: code,
          region: shipping.state.trim() || debouncedState.trim() || undefined,
        }),
      });
      const data = (await res.json()) as Quote & { error?: string };
      if (!res.ok) throw new Error(data.error || "Invalid promo code");
      setQuote(data);
      setAppliedCode(data.discountCode ?? code.toUpperCase());
      setPromoInput("");
      const saved =
        data.discountTotal > 0
          ? formatPrice(data.discountTotal, currency)
          : data.freeShipping
            ? "free shipping"
            : "applied";
      toast.success(`Promo ${data.discountCode ?? code} — ${saved}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid promo code";
      setPromoError(msg);
      toast.error(msg);
    } finally {
      setQuoteLoading(false);
    }
  }

  async function removePromo() {
    setAppliedCode(null);
    setPromoInput("");
    setPromoError(null);
    await fetchQuote(null);
    toast.message("Promo removed");
  }

  const clientSubtotal = mounted ? cartSubtotal(items, currency) : 0;
  const clientShipping = clientSubtotal >= 75 ? 0 : 9.99;
  const maxRedeem = Math.min(
    loyaltyPoints,
    Math.floor((quote?.subtotal ?? clientSubtotal) * LOYALTY.POINTS_PER_DOLLAR_REDEEM),
  );

  const summary = intent ?? quote;
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
      shipping.full_name.trim() &&
      shipping.line1.trim() &&
      shipping.city.trim() &&
      shipping.state.trim() &&
      shipping.postal_code.trim()
    );
  }

  async function startPayment() {
    if (!fieldsValid()) {
      toast.error("Please complete the shipping form.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          currency,
          country,
          pointsToRedeem,
          discountCode: appliedCode ?? undefined,
          shippingAddress: shipping,
        }),
      });
      const data = (await res.json()) as IntentResp & { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to start payment");
      setIntent(data);
      setQuote(data);
      if (data.discountCode) setAppliedCode(data.discountCode);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  }

  if (!mounted) return null;

  if (items.length === 0 && !intent) {
    return (
      <Card>
        <CardContent className="grid place-items-center gap-3 py-20 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold">Your cart is empty</h2>
          <Link href="/products" className={buttonVariants({})}>
            Browse products
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
            <h2 className="text-lg font-semibold">Shipping address</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  value={shipping.full_name}
                  onChange={(e) => setShipping({ ...shipping, full_name: e.target.value })}
                  disabled={!!intent}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="line1">Address</Label>
                <Input
                  id="line1"
                  value={shipping.line1}
                  onChange={(e) => setShipping({ ...shipping, line1: e.target.value })}
                  disabled={!!intent}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="line2">Apt / Suite (optional)</Label>
                <Input
                  id="line2"
                  value={shipping.line2}
                  onChange={(e) => setShipping({ ...shipping, line2: e.target.value })}
                  disabled={!!intent}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={shipping.city}
                  onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  disabled={!!intent}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State / Province</Label>
                <Input
                  id="state"
                  value={shipping.state}
                  onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                  disabled={!!intent}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="postal_code">Postal code</Label>
                <Input
                  id="postal_code"
                  value={shipping.postal_code}
                  onChange={(e) => setShipping({ ...shipping, postal_code: e.target.value })}
                  disabled={!!intent}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <p className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm">
                  <span aria-hidden className="mr-2">
                    {COUNTRIES[country].flag}
                  </span>
                  {COUNTRIES[country].name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!intent && (
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">Promo code</h2>
              </div>
              {appliedCode ? (
                <div className="flex items-start justify-between gap-3 rounded-lg border border-primary/25 bg-primary/5 p-3">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="font-mono">
                      {appliedCode}
                    </Badge>
                    {discountTotal > 0 && (
                      <p className="text-sm font-medium text-primary">
                        You save {formatPrice(discountTotal, currency)}
                      </p>
                    )}
                    {summary?.freeShipping && shippingFee === 0 && (
                      <p className="text-xs text-muted-foreground">Free shipping included</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void removePromo()}
                    disabled={quoteLoading}
                  >
                    <X className="h-4 w-4" /> Remove
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
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), void applyPromo())
                      }
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void applyPromo()}
                      disabled={quoteLoading || !promoInput.trim()}
                    >
                      {quoteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-sm text-destructive" role="alert">
                      {promoError}
                    </p>
                  )}
                </>
              )}
              <p className="text-xs text-muted-foreground">
                One code per order. Enter your state/province above for accurate tax before you
                pay.
              </p>
            </CardContent>
          </Card>
        )}

        {loyaltyPoints > 0 && !intent && (
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">Redeem loyalty points</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                You have {loyaltyPoints.toLocaleString()} pts. 100 pts = $1 off.
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
                  Redeem <strong>{pointsToRedeem.toLocaleString()}</strong> pts
                </span>
                <span className="font-semibold tabular-nums">
                  −{formatPrice(pointsToRedeem / LOYALTY.POINTS_PER_DOLLAR_REDEEM, currency)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">Payment</h2>
            <p className="text-xs text-muted-foreground">
              By completing payment you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            {!intent ? (
              <Button size="lg" onClick={startPayment} disabled={creating || items.length === 0}>
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Preparing payment…
                  </>
                ) : (
                  "Continue to payment"
                )}
              </Button>
            ) : (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: intent.clientSecret,
                  appearance: { theme: "stripe", variables: { colorPrimary: "#ea580c" } },
                }}
              >
                <PaymentForm
                  orderId={intent.orderId}
                  onSuccess={() => {
                    useCartStore.getState().clear();
                    router.push(`/checkout/success?order=${intent.orderId}`);
                  }}
                />
              </Elements>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <ul className="space-y-1.5 text-sm">
            {items.map((i) => {
              const unit = currency === "CAD" ? i.priceCad : i.priceUsd;
              return (
                <li key={cartLineKey(i)} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {i.name}
                    {i.variantLabel !== "Default" && (
                      <span className="text-xs"> · {i.variantLabel}</span>
                    )}{" "}
                    <span className="text-xs">×{i.qty}</span>
                  </span>
                  <span className="tabular-nums">{formatPrice(unit * i.qty, currency)}</span>
                </li>
              );
            })}
          </ul>
          <Separator />
          <div className="space-y-1 text-sm">
            <Row label="Subtotal" value={formatPrice(subtotal, currency)} />
            {discountTotal > 0 && (
              <Row
                label={appliedCode ? `Discount (${appliedCode})` : "Discount"}
                value={`−${formatPrice(discountTotal, currency)}`}
              />
            )}
            <Row
              label={
                summary?.freeShipping && shippingFee === 0 ? "Shipping (promo)" : "Shipping"
              }
              value={shippingFee === 0 ? "FREE" : formatPrice(shippingFee, currency)}
            />
            {tax > 0 && (
              <Row
                label={
                  summary?.taxRate
                    ? `Tax (${(summary.taxRate * 100).toFixed(2)}%)`
                    : "Tax"
                }
                value={formatPrice(tax, currency)}
              />
            )}
            {redeemPts > 0 && (
              <Row
                label={`Points (${redeemPts.toLocaleString()})`}
                value={`−${formatPrice(redeemValue, currency)}`}
              />
            )}
          </div>
          <Separator />
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">
              {quoteLoading && !intent ? (
                <Loader2 className="inline h-4 w-4 animate-spin" />
              ) : (
                formatPrice(total, currency)
              )}
            </span>
          </div>
          {!intent && !quote && !quoteLoading && (
            <p className="text-xs text-muted-foreground">
              Enter state/province for tax estimate.
            </p>
          )}
          <p className="pt-2 text-xs text-muted-foreground">
            You&apos;ll earn ~{Math.floor(subtotal - discountTotal)} pts on this order.
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
