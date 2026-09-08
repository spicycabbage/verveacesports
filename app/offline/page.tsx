import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getSite } from "@/lib/site/get-site";

export const metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default async function OfflinePage() {
  const site = await getSite();
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {site.shortName}
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">You&apos;re offline</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Reconnect to browse {site.name}. Prices and checkout need a live connection.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6" })}>
        Try again
      </Link>
    </div>
  );
}
