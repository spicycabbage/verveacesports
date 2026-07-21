"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { CATEGORIES, categoryLabel } from "@/lib/constants";
import { SearchBar } from "./SearchBar";
import { LanguageSelector } from "./LanguageSelector";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 lg:hidden"
            aria-label="Open menu"
          />
        }
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100vw-2rem,20rem)] gap-0 p-0">
        <SheetHeader className="border-b px-4 py-4 text-left">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
          <SearchBar className="mb-4" />
          <nav className="flex flex-col gap-1">
            <Link
              href="/products"
              onClick={close}
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
            >
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              All products
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/products?category=${c}`}
                onClick={close}
                className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
              >
                {categoryLabel(c)}
              </Link>
            ))}
            <Link
              href="/faq"
              onClick={close}
              className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
            >
              FAQ
            </Link>
          </nav>
          <Separator className="my-4" />
          <div className="mb-4 px-1">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Language</p>
            <LanguageSelector />
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <Link href="/cart" onClick={close} className="rounded-md px-3 py-2 hover:bg-accent">
              Cart
            </Link>
            <Link href="/account" onClick={close} className="rounded-md px-3 py-2 hover:bg-accent">
              Account
            </Link>
            <Link
              href="/account/orders"
              onClick={close}
              className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent"
            >
              <Package className="h-4 w-4 text-muted-foreground" />
              Orders
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
