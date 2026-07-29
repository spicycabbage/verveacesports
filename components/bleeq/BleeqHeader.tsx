"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { CartButton } from "@/components/layout/CartButton";
import { UserMenu } from "@/components/layout/UserMenu";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { useSite } from "@/lib/site/SiteProvider";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { sizedImageUrl } from "@/lib/images/cdn";
import { interpolate } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";

type HeaderUser = {
  email: string;
  fullName: string | null;
} | null;

export function BleeqHeader({
  user,
  loyaltyPoints,
  isAdmin,
}: {
  user: HeaderUser;
  loyaltyPoints: number;
  isAdmin: boolean;
}) {
  const site = useSite();
  const dict = useDictionary();
  const [shopOpen, setShopOpen] = useState(false);
  const [accOpen, setAccOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="border-b border-border/60 bg-muted/40">
        <Link
          href="/draw"
          className="mx-auto flex max-w-7xl items-center justify-center px-3 py-2 text-[11px] font-medium tracking-wide text-muted-foreground transition hover:text-foreground sm:text-xs lg:py-2.5 lg:text-sm"
        >
          <span className="whitespace-nowrap sm:hidden">{dict.bleeq.trust.promo}</span>
          <span className="hidden whitespace-nowrap sm:inline">
            {interpolate(dict.bleeq.trust.promoDesktop, {
              amount: site.freeShippingOver,
            })}
          </span>
        </Link>
      </div>

      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4 lg:h-20 lg:gap-6 lg:px-6">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-10 shrink-0 lg:hidden"
                aria-label={dict.nav.openMenu}
              />
            }
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(100vw-2rem,22rem)] gap-0 p-0">
            <SheetHeader className="border-b px-4 py-4 text-left">
              <SheetTitle>{site.shortName}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {dict.bleeq.header.shopRanger}
              </p>
              <nav className="mb-4 flex flex-col gap-0.5">
                {site.rangerProducts.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/products/${p.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                  >
                    {p.label}
                  </Link>
                ))}
              </nav>
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {dict.bleeq.header.accessories}
              </p>
              <nav className="mb-4 flex flex-col gap-0.5">
                {site.accessoryProducts.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/products/${p.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                  >
                    {p.label}
                  </Link>
                ))}
              </nav>
              <Separator className="my-2" />
              <Link
                href="/faq"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
              >
                {dict.bleeq.header.supportFaq}
              </Link>
              <Link
                href="/products?category=ai-glasses"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
              >
                {dict.bleeq.header.allProducts}
              </Link>
              <div className="mt-4 px-1">
                <p className="mb-2 text-xs font-medium text-muted-foreground">{dict.nav.language}</p>
                <LanguageSelector />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="shrink-0 font-semibold tracking-tight">
          <span className="text-lg sm:text-xl lg:text-2xl">{site.shortName}</span>
          <span className="ml-1.5 hidden text-xs font-normal text-muted-foreground sm:inline lg:text-sm">
            {dict.bleeq.header.canada}
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:ml-4 lg:flex lg:gap-1.5">
          <div
            className="relative"
            onMouseEnter={() => setShopOpen(true)}
            onMouseLeave={() => setShopOpen(false)}
          >
            <button
              type="button"
              className={cn(
                "inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground lg:h-11 lg:px-3.5 lg:text-base",
                shopOpen && "text-foreground",
              )}
              aria-expanded={shopOpen}
            >
              {dict.bleeq.header.shopRanger}
              <ChevronDown className={cn("h-3.5 w-3.5 transition lg:h-4 lg:w-4", shopOpen && "rotate-180")} />
            </button>
            {shopOpen && (
              <div className="absolute left-0 top-full z-50 w-[min(100vw-2rem,28rem)] pt-2">
                <div className="rounded-xl border bg-popover p-3 shadow-lg">
                  <div className="grid gap-2">
                    {site.rangerProducts.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/products/${p.slug}`}
                        className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-accent"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                          {p.image ? (
                            <Image
                              src={sizedImageUrl(p.image, 112)}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.shortLabel}</p>
                          <p className="text-xs text-muted-foreground">{p.label}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/products?category=ai-glasses"
                    className="mt-2 block rounded-lg px-2 py-2 text-center text-sm font-medium text-primary hover:bg-accent"
                  >
                    {dict.bleeq.header.viewAllModels}
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setAccOpen(true)}
            onMouseLeave={() => setAccOpen(false)}
          >
            <button
              type="button"
              className={cn(
                "inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground lg:h-11 lg:px-3.5 lg:text-base",
                accOpen && "text-foreground",
              )}
              aria-expanded={accOpen}
            >
              {dict.bleeq.header.accessories}
              <ChevronDown className={cn("h-3.5 w-3.5 transition lg:h-4 lg:w-4", accOpen && "rotate-180")} />
            </button>
            {accOpen && (
              <div className="absolute left-0 top-full z-50 w-64 pt-2">
                <div className="rounded-xl border bg-popover py-2 shadow-lg">
                  {site.accessoryProducts.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/products/${p.slug}`}
                      className="block px-4 py-2.5 text-sm font-medium hover:bg-accent"
                    >
                      {p.label}
                    </Link>
                  ))}
                  <Separator className="my-1" />
                  <Link
                    href="/products?category=wearables"
                    className="block px-4 py-2.5 text-sm font-medium text-primary hover:bg-accent"
                  >
                    {dict.bleeq.header.allAccessories}
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/faq"
            className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground lg:h-11 lg:px-3.5 lg:text-base"
          >
            {dict.bleeq.header.support}
          </Link>
          <Link
            href="/faq"
            className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground lg:h-11 lg:px-3.5 lg:text-base"
          >
            {dict.bleeq.header.faq}
          </Link>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <LanguageSelector className="hidden sm:flex" />
          <CartButton />
          <UserMenu user={user} loyaltyPoints={loyaltyPoints} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}
