"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import type { Category } from "@/lib/constants";
import { useSite } from "@/lib/site/SiteProvider";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { categoryLabelFromDict } from "@/lib/i18n/helpers";
import { cn } from "@/lib/utils";
import { SearchBar } from "./SearchBar";
import { LanguageSelector } from "./LanguageSelector";
import type { NavCartFeature } from "./HeaderCategoryNav";
import { VoltNav } from "./VoltNav";
import { AdminUnfulfilledBadge } from "@/components/admin/AdminOrderAlerts";

export function MobileNav({
  categories: categoriesProp,
  cartFeatures = [],
  isAdmin = false,
  blogHref,
}: {
  categories?: readonly Category[];
  cartFeatures?: NavCartFeature[];
  isAdmin?: boolean;
  /** Only set on storefronts that have a blog. */
  blogHref?: string;
} = {}) {
  const site = useSite();
  const dict = useDictionary();
  const categories = categoriesProp ?? site.categories;
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [openFeatureId, setOpenFeatureId] = useState<string | null>(null);

  function close() {
    setOpen(false);
    setCartOpen(false);
    setOpenFeatureId(null);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setCartOpen(false);
          setOpenFeatureId(null);
        }
      }}
    >
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
      <SheetContent side="left" className="w-[min(100vw-2rem,20rem)] gap-0 p-0">
        <SheetHeader className="border-b px-4 py-4 text-left">
          <SheetTitle>{dict.nav.menu}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
          <SearchBar className="mb-4" />
          <nav className="flex flex-col gap-1">
            {site.id === "volt-ca" ? (
              <VoltNav stacked onNavigate={close} />
            ) : (
            <>
            <Link
              href="/products"
              onClick={close}
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
            >
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              {dict.nav.allProducts}
            </Link>
            {categories.map((c) => {
              if (c === "electric-carts" && cartFeatures.length > 0) {
                return (
                  <div key={c} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => {
                        setCartOpen((v) => !v);
                        setOpenFeatureId(null);
                      }}
                      className="flex items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-medium hover:bg-accent"
                      aria-expanded={cartOpen}
                    >
                      {categoryLabelFromDict(dict, c)}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          cartOpen && "rotate-180",
                        )}
                      />
                    </button>
                    {cartOpen ? (
                      <div className="ml-2 border-l border-border pl-2">
                        <Link
                          href={`/products?category=${c}`}
                          onClick={close}
                          className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          {dict.home.viewAll}
                        </Link>
                        {cartFeatures.map((feature) => {
                          const featureOpen = openFeatureId === feature.id;
                          return (
                            <div key={feature.id}>
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenFeatureId((id) =>
                                    id === feature.id ? null : feature.id,
                                  )
                                }
                                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-accent"
                                aria-expanded={featureOpen}
                              >
                                {feature.label}
                                <ChevronDown
                                  className={cn(
                                    "h-3.5 w-3.5 text-muted-foreground transition-transform",
                                    featureOpen && "rotate-180",
                                  )}
                                />
                              </button>
                              {featureOpen ? (
                                <div className="ml-2 flex flex-col gap-0.5 pb-1">
                                  {feature.products.map((p) => (
                                    <Link
                                      key={p.id}
                                      href={`/products/${p.slug}`}
                                      onClick={close}
                                      className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                                    >
                                      {p.name}
                                    </Link>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              }

              return (
                <Link
                  key={c}
                  href={`/products?category=${c}`}
                  onClick={close}
                  className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                >
                  {categoryLabelFromDict(dict, c)}
                </Link>
              );
            })}
            <Link
              href="/faq"
              onClick={close}
              className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
            >
              {dict.nav.faq}
            </Link>
            {blogHref ? (
              <Link
                href={blogHref}
                onClick={close}
                className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
              >
                {dict.footer.blog}
              </Link>
            ) : null}
            </>
            )}
          </nav>
          <Separator className="my-4" />
          <div className="mb-4 px-1">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {dict.nav.language}
            </p>
            <LanguageSelector />
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <Link
              href="/cart"
              onClick={close}
              className="rounded-md px-3 py-2 hover:bg-accent"
            >
              {dict.nav.cart}
            </Link>
            {isAdmin ? (
              <Link
                href="/admin/orders"
                onClick={close}
                className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent"
              >
                <span>{dict.nav.admin}</span>
                <AdminUnfulfilledBadge />
              </Link>
            ) : (
              <>
                <Link
                  href="/account"
                  onClick={close}
                  className="rounded-md px-3 py-2 hover:bg-accent"
                >
                  {dict.nav.account}
                </Link>
                <Link
                  href="/account/orders"
                  onClick={close}
                  className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent"
                >
                  <Package className="h-4 w-4 text-muted-foreground" />
                  {dict.nav.orders}
                </Link>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
