"use client";

import Link from "next/link";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CartPromoFields } from "@/components/cart/CartPromoFields";
import { useCartStore, cartSubtotal, cartLineKey } from "@/lib/store/cart";
import { useCountryStore } from "@/lib/store/country";
import { useCartPromo } from "@/lib/store/use-cart-promo";
import { formatPrice } from "@/lib/utils/format";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { sizedImageUrl } from "@/lib/images/cdn";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export function CartView() {
  const dict = useDictionary();
  const { items, setQty, remove } = useCartStore();
  const { currency } = useCountryStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const promo = useCartPromo(mounted && items.length > 0);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="grid place-items-center gap-3 py-20 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold">{dict.cart.empty}</h2>
          <p className="text-sm text-muted-foreground">{dict.cart.emptyHint}</p>
          <Link href="/products" className={buttonVariants({ className: "mt-2" })}>
            {dict.cart.browseProducts}
          </Link>
        </CardContent>
      </Card>
    );
  }

  const subtotal = promo.quote?.subtotal ?? cartSubtotal(items, currency);
  const discountTotal = promo.discountTotal;
  const estimated = Math.max(0, subtotal - discountTotal);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        {items.map((i) => {
          const unit = currency === "CAD" ? i.priceCad : i.priceUsd;
          return (
            <Card key={cartLineKey(i)}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:gap-4">
                <div className="flex gap-3 sm:gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-white sm:h-24 sm:w-24">
                    {i.image && (
                      <Image
                        src={sizedImageUrl(i.image, 192)}
                        alt={i.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${i.slug}`} className="font-medium hover:underline">
                      {i.name}
                    </Link>
                    {i.variantLabel !== "Default" && (
                      <p className="text-sm text-muted-foreground">{i.variantLabel}</p>
                    )}
                    <div className="mt-1 flex items-center justify-between gap-2 sm:hidden">
                      <span className="text-sm text-muted-foreground">{formatPrice(unit, currency)}</span>
                      <span className="text-base font-semibold tabular-nums">
                        {formatPrice(unit * i.qty, currency)}
                      </span>
                    </div>
                    <span className="mt-1 hidden text-sm text-muted-foreground sm:inline">
                      {formatPrice(unit, currency)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
                  <div className="flex items-center rounded-md border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-10"
                      onClick={() => setQty(i.productId, i.variantId, i.qty - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center text-sm tabular-nums">{i.qty}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-10"
                      onClick={() => setQty(i.productId, i.variantId, i.qty + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remove(i.productId, i.variantId)}
                  >
                    <Trash2 className="h-4 w-4" /> {dict.cart.remove}
                  </Button>
                </div>
                <div className="hidden text-right text-base font-semibold tabular-nums sm:block">
                  {formatPrice(unit * i.qty, currency)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardContent className="space-y-4">
          <h2 className="text-lg font-semibold">{dict.cart.orderSummary}</h2>
          <CartPromoFields promo={promo} />
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{dict.cart.subtotal}</span>
            <span className="tabular-nums">{formatPrice(subtotal, currency)}</span>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between text-sm text-primary">
              <span>
                {dict.cart.discount}
                {promo.promoCode ? ` (${promo.promoCode})` : ""}
              </span>
              <span className="tabular-nums">−{formatPrice(discountTotal, currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{dict.cart.shipping}</span>
            <span className="text-muted-foreground">{dict.cart.shippingCalc}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-semibold">
            <span>{dict.cart.estimatedTotal}</span>
            <span className="tabular-nums">{formatPrice(estimated, currency)}</span>
          </div>
          <Link href="/checkout" className={buttonVariants({ size: "lg", className: "w-full" })}>
            {dict.cart.proceedCheckout}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
