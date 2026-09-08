import Image from "next/image";
import Link from "next/link";
import verveaceLogo from "@/public/verveace_logo.webp";
import { getSite } from "@/lib/site/get-site";
import { siteLogoPath } from "@/lib/site/seo";

export async function Logo({ className }: { className?: string }) {
  const site = await getSite();

  return (
    <Link href="/" className={`inline-flex shrink-0 items-center ${className ?? ""}`}>
      {site.id === "bleeq-ca" ? (
        <Image
          src={siteLogoPath(site)}
          alt={site.name}
          width={160}
          height={40}
          className="h-8 w-auto sm:h-12"
          priority
        />
      ) : (
        <Image
          src={verveaceLogo}
          alt={site.name}
          className="h-8 w-auto sm:h-12 dark:brightness-0 dark:invert"
          priority
          quality={90}
        />
      )}
    </Link>
  );
}
