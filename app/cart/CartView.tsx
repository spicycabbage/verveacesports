"use client";

import Link from "next/link";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore, cartSubtotal, cartLineKey } from "@/lib/store/cart";
import { useCountryStore } from "@/lib/store/country";
import { formatPrice } from "@/lib/utils/format";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export function CartView() {
  const { items, setQty, remove } = useCartStore();
  const { currency } = useCountryStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="grid place-items-center gap-3 py-20 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground">
            Discover gear that pushes your performance.
          </p>
          <Link href="/products" className={buttonVariants({ className: "mt-2" })}>
            Browse products
          </Link>
        </CardContent>
      </Card>
    );
  }

  const subtotal = cartSubtotal(items, currency);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        {items.map((i) => {
          const unit = currency === "CAD" ? i.priceCad : i.priceUsd;
          return (
            <Card key={cartLineKey(i)}>
              <CardContent className="flex gap-4">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                  {i.image && (
                    <Image src={i.image} alt={i.name} fill sizes="96px" className="object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <Link href={`/products/${i.slug}`} className="font-medium hover:underline">
                    {i.name}
                  </Link>
                  {i.variantLabel !== "Default" && (
                    <span className="text-sm text-muted-foreground">{i.variantLabel}</span>
                  )}
                  <span className="text-sm text-muted-foreground">{formatPrice(unit, currency)}</span>
                  <div className="mt-auto flex items-center gap-3">
                    <div className="flex items-center rounded-md border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQty(i.productId, i.variantId, i.qty - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-8 text-center text-sm">{i.qty}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQty(i.productId, i.variantId, i.qty + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => remove(i.productId, i.variantId)}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                </div>
                <div className="text-right text-base font-semibold tabular-nums">
                  {formatPrice(unit * i.qty, currency)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardContent className="space-y-4">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatPrice(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-muted-foreground">Calculated at checkout</span>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-semibold">
            <span>Estimated total</span>
            <span className="tabular-nums">{formatPrice(subtotal, currency)}</span>
          </div>
          <Link href="/checkout" className={buttonVariants({ size: "lg", className: "w-full" })}>
            Proceed to checkout
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
