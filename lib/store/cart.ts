"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Currency } from "@/lib/constants";
import { SITE_COOKIE, SITES, type SiteId } from "@/lib/site/config";

function readSiteIdFromCookie(): SiteId {
  if (typeof document === "undefined") return "verveace";
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${SITE_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
  );
  const id = match?.[1];
  if (id === "bleeq-ca" || id === "verveace") return id;
  return "verveace";
}

function cartPersistName(): string {
  return SITES[readSiteIdFromCookie()].cartStorageKey;
}

/** localStorage adapter that namespaces the cart key per storefront. */
const siteCartStorage = createJSONStorage(() => ({
  getItem: () => {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(cartPersistName());
  },
  setItem: (_name, value) => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(cartPersistName(), value);
  },
  removeItem: () => {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(cartPersistName());
  },
}));

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
  promoCode: string | null;
  isOpen: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (productId: string, variantId: string) => void;
  setQty: (productId: string, variantId: string, qty: number) => void;
  syncPrices: (
    updates: { productId: string; variantId: string; priceUsd: number; priceCad: number }[],
  ) => void;
  setPromoCode: (code: string | null) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      promoCode: null,
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
      syncPrices: (updates) =>
        set((state) => {
          let changed = false;
          const items = state.items.map((i) => {
            const u = updates.find(
              (u) => u.productId === i.productId && u.variantId === i.variantId,
            );
            if (!u) return i;
            if (i.priceUsd === u.priceUsd && i.priceCad === u.priceCad) return i;
            changed = true;
            return { ...i, priceUsd: u.priceUsd, priceCad: u.priceCad };
          });
          return changed ? { items } : state;
        }),
      setPromoCode: (code) =>
        set({ promoCode: code?.trim() ? code.trim().toUpperCase() : null }),
      clear: () => set({ items: [], promoCode: null }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name: "cart",
      storage: siteCartStorage,
      partialize: (s) => ({ items: s.items, promoCode: s.promoCode }),
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
