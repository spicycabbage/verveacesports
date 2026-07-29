"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { sizedImageUrl } from "@/lib/images/cdn";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/constants";

export type NavMegaProduct = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
};

export type NavMegaCategory = {
  id: Category;
  label: string;
  href: string;
  products: NavMegaProduct[];
};

const CLOSE_MS = 120;

/** Must match `Header` bar height. */
const MEGA_TOP = "top-[4.5rem] sm:top-[5.2rem]";

export function HeaderCategoryNav({
  categories,
  faqLabel,
  viewAllLabel,
}: {
  categories: NavMegaCategory[];
  faqLabel: string;
  viewAllLabel: string;
}) {
  const [openId, setOpenId] = useState<Category | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const open = categories.find((c) => c.id === openId && c.products.length > 0) ?? null;

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenId(null), CLOSE_MS);
  }

  function openCategory(id: Category) {
    cancelClose();
    setOpenId(id);
  }

  useEffect(() => () => cancelClose(), []);

  return (
    <>
      <nav className="hidden items-center gap-5 lg:flex xl:gap-6">
        {categories.map((c) => {
          const hasProducts = c.products.length > 0;
          const isOpen = openId === c.id && hasProducts;

          if (!hasProducts) {
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
                  className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
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

      {open ? (
        <div
          className={cn(
            "fixed inset-x-0 z-50 border-b border-black/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.18)]",
            MEGA_TOP,
          )}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="mx-auto flex h-[22.5rem] max-w-7xl flex-col items-center px-6 py-8 sm:px-8">
            <div className="flex w-full flex-1 flex-nowrap items-start justify-center gap-6 overflow-hidden md:gap-8 lg:gap-10">
              {open.products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group flex w-[9.5rem] shrink-0 flex-col items-center text-center sm:w-[11rem] md:w-[12rem]"
                  onClick={() => setOpenId(null)}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-[#f5f5f5]">
                    {p.image ? (
                      <Image
                        src={sizedImageUrl(p.image, 400)}
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
            <Link
              href={open.href}
              className="mt-auto pt-6 text-sm font-semibold text-neutral-900 underline-offset-4 hover:underline"
              onClick={() => setOpenId(null)}
            >
              {viewAllLabel} →
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
