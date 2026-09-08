"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, cartCount } from "@/lib/store/cart";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";

export function CartButton() {
  const { items, open } = useCartStore();
  const dict = useDictionary();
  const mounted = useHydrated();
  const count = mounted ? cartCount(items) : 0;

  return (
    <Button
      onClick={open}
      variant="ghost"
      size="icon"
      className="relative size-11 sm:size-11"
      aria-label={dict.nav.openCart}
    >
      <ShoppingBag className="size-8 sm:size-7" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
          {count}
        </span>
      )}
    </Button>
  );
}
