"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/constants";
import type { CartFeatureId } from "@/lib/catalog/cart-features";

export type NavMegaProduct = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  translations?: unknown;
};

export type NavCartFeature = {
  id: CartFeatureId;
  label: string;
  products: NavMegaProduct[];
};

export type NavMegaCategory = {
  id: Category;
  label: string;
  href: string;
  products: NavMegaProduct[];
  /** Two-level mega menu (Electric Carts): features first, products on feature hover. */
  cartFeatures?: NavCartFeature[];
};

const CLOSE_MS = 120;

/** Pins under the sticky header. `--announce-h` is 2.25rem or 0 when dismissed. */
const MEGA_TOP =
  "top-[calc(var(--announce-h,2.25rem)+3.5rem)] sm:top-[calc(var(--announce-h,2.25rem)+5.2rem)]";

function ProductGrid({
  products,
  onNavigate,
}: {
  products: NavMegaProduct[];
  onNavigate: () => void;
}) {
  return (
    <div className="flex w-full flex-1 flex-nowrap items-start justify-center gap-6 overflow-x-auto overflow-y-hidden md:gap-8 lg:gap-10">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/products/${p.slug}`}
          className="group flex w-[9.5rem] shrink-0 flex-col items-center text-center sm:w-[11rem] md:w-[12rem]"
          onClick={onNavigate}
        >
          <div className="relative aspect-square w-full overflow-hidden bg-[#f5f5f5]">
            {p.image ? (
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 40vw, 200px"
                className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-2 text-xs text-neutral-400">
                {p.name}
              </div>
            )}
          </div>
          <span className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-neutral-900 group-hover:underline md:min-h-[3rem] md:text-base">
            {p.name}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function HeaderCategoryNav({
  categories,
  faqLabel,
  viewAllLabel,
  pickCartCategoryLabel,
}: {
  categories: NavMegaCategory[];
  faqLabel: string;
  viewAllLabel: string;
  pickCartCategoryLabel: string;
}) {
  const [openId, setOpenId] = useState<Category | null>(null);
  const [activeFeatureId, setActiveFeatureId] = useState<CartFeatureId | null>(
    null,
  );
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const open = categories.find((c) => c.id === openId) ?? null;
  const isCartMega = Boolean(open?.cartFeatures?.length);
  const hasFlatProducts = Boolean(open && !isCartMega && open.products.length > 0);
  const showPanel = Boolean(open && (isCartMega || hasFlatProducts));

  const activeFeature =
    open?.cartFeatures?.find((f) => f.id === activeFeatureId) ?? null;

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setOpenId(null);
      setActiveFeatureId(null);
    }, CLOSE_MS);
  }

  function openCategory(id: Category) {
    cancelClose();
    setOpenId((prev) => {
      if (prev !== id) setActiveFeatureId(null);
      return id;
    });
  }

  useEffect(() => () => cancelClose(), []);

  return (
    <>
      <nav className="hidden items-center gap-5 lg:flex xl:gap-6">
        {categories.map((c) => {
          const hasMega =
            Boolean(c.cartFeatures?.length) || c.products.length > 0;
          const isOpen = openId === c.id && hasMega;

          if (!hasMega) {
            return (
              <Link
                key={c.id}
                href={c.href}
                className="text-base font-medium text-muted-foreground hover:text-foreground lg:text-lg"
              >
                {c.label}
              </Link>
            );
          }

          return (
            <div
              key={c.id}
              onMouseEnter={() => openCategory(c.id)}
              onMouseLeave={scheduleClose}
              onFocus={() => openCategory(c.id)}
              onBlur={scheduleClose}
            >
              <Link
                href={c.href}
                className={cn(
                  "inline-flex items-center gap-1 text-base font-medium text-muted-foreground hover:text-foreground lg:text-lg",
                  isOpen && "text-foreground",
                )}
                aria-expanded={isOpen}
                aria-haspopup="true"
              >
                {c.label}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </Link>
            </div>
          );
        })}
        <Link
          href="/faq"
          className="text-base font-medium text-muted-foreground hover:text-foreground lg:text-lg"
        >
          {faqLabel}
        </Link>
      </nav>

      {showPanel && open ? (
        <div
          className={cn(
            "fixed inset-x-0 z-50 border-b border-black/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.18)]",
            MEGA_TOP,
          )}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {isCartMega && open.cartFeatures ? (
            <div className="mx-auto flex h-[22.5rem] max-w-7xl gap-0 px-6 py-6 sm:px-8">
              <aside className="flex w-48 shrink-0 flex-col border-r border-neutral-200 pr-4 sm:w-56">
                <ul className="flex flex-1 flex-col gap-0.5">
                  {open.cartFeatures.map((feature) => {
                    const isActive = activeFeatureId === feature.id;
                    return (
                      <li key={feature.id}>
                        <button
                          type="button"
                          className={cn(
                            "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors",
                            isActive
                              ? "bg-neutral-100 text-neutral-900"
                              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                          )}
                          onMouseEnter={() => setActiveFeatureId(feature.id)}
                          onFocus={() => setActiveFeatureId(feature.id)}
                          aria-expanded={isActive}
                        >
                          {feature.label}
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 shrink-0 text-neutral-400 transition-opacity",
                              isActive ? "opacity-100" : "opacity-40",
                            )}
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <Link
                  href={open.href}
                  className="mt-auto pt-4 text-sm font-semibold text-neutral-900 underline-offset-4 hover:underline"
                  onClick={() => {
                    setOpenId(null);
                    setActiveFeatureId(null);
                  }}
                >
                  {viewAllLabel} →
                </Link>
              </aside>
              <div className="flex min-w-0 flex-1 flex-col items-center pl-6 pt-1">
                {activeFeature && activeFeature.products.length > 0 ? (
                  <ProductGrid
                    products={activeFeature.products}
                    onNavigate={() => {
                      setOpenId(null);
                      setActiveFeatureId(null);
                    }}
                  />
                ) : (
                  <div className="flex flex-1 items-center justify-center text-sm text-neutral-400">
                    {pickCartCategoryLabel}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex h-[22.5rem] max-w-7xl flex-col items-center px-6 py-8 sm:px-8">
              <ProductGrid
                products={open.products}
                onNavigate={() => setOpenId(null)}
              />
              <Link
                href={open.href}
                className="mt-auto pt-6 text-sm font-semibold text-neutral-900 underline-offset-4 hover:underline"
                onClick={() => setOpenId(null)}
              >
                {viewAllLabel} →
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}
