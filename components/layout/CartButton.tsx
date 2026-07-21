"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, cartCount } from "@/lib/store/cart";
import { useEffect, useState } from "react";

export function CartButton() {
  const { items, open } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(items) : 0;

  return (
    <Button
      onClick={open}
      variant="ghost"
      size="icon"
      className="relative size-10"
      aria-label="Open cart"
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground sm:text-xs">
          {count}
        </span>
      )}
    </Button>
  );
}
