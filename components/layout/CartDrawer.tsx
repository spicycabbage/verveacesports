"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore, cartSubtotal, cartLineKey } from "@/lib/store/cart";
import { useCountryStore } from "@/lib/store/country";
import { formatPrice } from "@/lib/utils/format";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove } = useCartStore();
  const { currency } = useCountryStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const subtotal = mounted ? cartSubtotal(items, currency) : 0;

  return (
    <Sheet open={isOpen} onOpenChange={(o) => (o ? null : close())}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" /> Your Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!mounted ? null : items.length === 0 ? (
            <div className="grid place-items-center gap-2 py-20 text-center text-sm text-muted-foreground">
              <ShoppingBag className="h-10 w-10 opacity-30" />
              <p>Your cart is empty.</p>
              <Link
                href="/products"
                onClick={close}
                className={buttonVariants({ variant: "link" })}
              >
                Browse products
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((i) => {
                const unit = currency === "CAD" ? i.priceCad : i.priceUsd;
                return (
                  <li key={cartLineKey(i)} className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <div className="flex min-w-0 gap-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-white">
                        {i.image ? (
                          <Image src={i.image} alt={i.name} fill sizes="80px" className="object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/products/${i.slug}`}
                          onClick={close}
                          className="line-clamp-2 text-sm font-medium hover:underline"
                        >
                          {i.name}
                        </Link>
                        {i.variantLabel !== "Default" && (
                          <span className="text-xs text-muted-foreground">{i.variantLabel}</span>
                        )}
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">{formatPrice(unit, currency)}</span>
                          <span className="text-sm font-medium tabular-nums sm:hidden">
                            {formatPrice(unit * i.qty, currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
                      <div className="flex items-center rounded-md border">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-10"
                          onClick={() => setQty(i.productId, i.variantId, i.qty - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center text-sm tabular-nums">{i.qty}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-10"
                          onClick={() => setQty(i.productId, i.variantId, i.qty + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-10 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(i.productId, i.variantId)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="hidden text-sm font-medium tabular-nums sm:block">
                      {formatPrice(unit * i.qty, currency)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {mounted && items.length > 0 && (
          <SheetFooter className="border-t pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold tabular-nums">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <Separator />
              <Link
                href="/checkout"
                onClick={close}
                className={buttonVariants({ size: "lg", className: "w-full" })}
              >
                Checkout
              </Link>
              <p className="text-center text-xs text-muted-foreground">
                Shipping &amp; taxes calculated at checkout.
              </p>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
