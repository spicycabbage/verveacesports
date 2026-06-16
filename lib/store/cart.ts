"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Currency } from "@/lib/constants";

export type CartItem = {
  productId: string;
  variantId: string;
  variantLabel: string;
  slug: string;
  name: string;
  image: string;
  qty: number;
  priceUsd: number;
  priceCad: number;
  stock: number;
};

export function cartLineKey(item: Pick<CartItem, "productId" | "variantId">): string {
  return `${item.productId}:${item.variantId}`;
}

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (productId: string, variantId: string) => void;
  setQty: (productId: string, variantId: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item, qty = 1) =>
        set((state) => {
          const key = cartLineKey(item);
          const existing = state.items.find((i) => cartLineKey(i) === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                cartLineKey(i) === key
                  ? { ...i, qty: Math.min(i.stock, i.qty + qty) }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, qty: Math.min(item.stock, qty) }] };
        }),
      remove: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId),
          ),
        })),
      setQty: (productId, variantId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId && i.variantId === variantId
                ? { ...i, qty: Math.max(0, Math.min(i.stock, qty)) }
                : i,
            )
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name: "verveacesports_cart_v2",
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

export function cartSubtotal(items: CartItem[], currency: Currency): number {
  return items.reduce(
    (sum, i) => sum + (currency === "CAD" ? i.priceCad : i.priceUsd) * i.qty,
    0,
  );
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.qty, 0);
}
