import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Product not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The item you&apos;re looking for is no longer available.
      </p>
      <Link href="/products" className={buttonVariants({ className: "mt-6" })}>
        Browse all products
      </Link>
    </div>
  );
}
