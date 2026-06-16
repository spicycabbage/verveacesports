import Link from "next/link";
import { Logo } from "./Logo";
import { CATEGORIES, categoryLabel } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground">
            Authorized retailer for BleeqUp AI camera glasses and Power Golf Carts electric
            equipment.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Shop</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link href={`/products?category=${c}`} className="hover:text-foreground">
                  {categoryLabel(c)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Account</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li><Link href="/account" className="hover:text-foreground">Profile</Link></li>
            <li><Link href="/account/orders" className="hover:text-foreground">Orders</Link></li>
            <li><Link href="/account/loyalty" className="hover:text-foreground">Loyalty Points</Link></li>
            <li><Link href="/account/referrals" className="hover:text-foreground">Refer a Friend</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Help</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>Shipping to USA &amp; Canada</li>
            <li>Free returns within 30 days</li>
            <li>Earn 1 point per dollar</li>
            <li>
              <Link href="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-foreground">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} VerveaceSports. All rights reserved.</span>
          <div className="flex gap-3">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
