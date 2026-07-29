import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { buttonVariants } from "@/components/ui/button";
import { HomeHeroMobileHeadline } from "@/components/home/HomeHeroMobileHeadline";
import { cn } from "@/lib/utils";
import { getDictionary, interpolate } from "@/lib/i18n/dictionary";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getSite } from "@/lib/site/get-site";

const HERO_IMAGE = "/images/home-hero-banner.webp";
/** Intrinsic banner size (1024×571). */
const HERO_ASPECT = "aspect-[1024/571]";

/** Must match `Header` bar height (`sm:h-[5.2rem]`). */
const HERO_HEIGHT_DESKTOP =
  "md:aspect-auto md:h-[calc(100svh-5.2rem)] md:min-h-[28rem]";

export async function HomeHero() {
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const site = await getSite();
  const subcopy = interpolate(dict.home.subcopy, { amount: site.freeShippingOver });

  // Override buttonVariants nowrap + fixed height so long i18n labels wrap inside equal cells
  const ctaClass = cn(
    buttonVariants({ size: "lg" }),
    "h-auto min-h-12 min-w-0 max-w-full w-full shrink justify-center whitespace-normal break-words px-2.5 py-2.5 text-center text-xs font-semibold leading-snug text-balance shadow-lg sm:min-h-12 sm:px-3 sm:text-sm md:w-auto md:min-h-14 md:min-w-[15.84rem] md:max-w-[23.04rem] md:px-10 md:text-base md:leading-snug",
  );

  return (
    <section className="relative w-full min-w-0 overflow-x-hidden border-b">
      {/* Mobile: alternating headline above the image */}
      <div className="min-w-0 px-3 pt-5 pb-3 md:hidden">
        <HomeHeroMobileHeadline
          lineA={dict.home.headlineGlasses}
          lineB={dict.home.headlineCart}
        />
      </div>

      <div className={cn("relative w-full min-w-0", HERO_ASPECT, HERO_HEIGHT_DESKTOP)}>
        <Image
          src={HERO_IMAGE}
          alt={`${dict.home.altGlasses}; ${dict.home.altCart}`}
          fill
          priority
          sizes="100vw"
          quality={82}
          className="object-cover object-[center_42%]"
        />
        <div
          className="absolute inset-0 hidden bg-gradient-to-t from-black/55 via-black/20 to-black/30 md:block"
          aria-hidden
        />

        {/* Desktop: headline + subcopy + CTAs overlaid */}
        <div className="absolute inset-0 mx-auto hidden max-w-7xl flex-col justify-center px-8 py-8 md:flex md:px-12 md:py-10 lg:px-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-center text-[37px] font-bold tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] md:-translate-y-[50px] lg:text-[49px]">
              <span className="text-white">{dict.home.headlineGlasses}.</span>{" "}
              <span className="text-primary">{dict.home.headlineCart}.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl leading-relaxed text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)] md:mt-5 md:-translate-y-[25px] md:text-[22px]">
              {subcopy}
            </p>
          </div>
          <div className="mt-8 grid w-full min-w-0 grid-cols-2 items-stretch gap-3 md:mx-auto md:mt-10 md:flex md:w-auto md:items-center md:justify-center md:gap-6 lg:mt-12">
            <Link href="/products?category=ai-glasses" className={ctaClass}>
              {dict.home.ctaGlasses}
            </Link>
            <Link href="/products?category=electric-carts" className={ctaClass}>
              {dict.home.ctaCarts}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile: CTAs + description below the image */}
      <div className="min-w-0 space-y-4 px-4 py-5 md:hidden">
        <div className="grid min-w-0 grid-cols-2 items-stretch gap-2">
          <Link href="/products?category=ai-glasses" className={ctaClass}>
            {dict.home.ctaGlasses}
          </Link>
          <Link href="/products?category=electric-carts" className={ctaClass}>
            {dict.home.ctaCarts}
          </Link>
        </div>
        <p className="break-words text-base leading-relaxed text-muted-foreground">{subcopy}</p>
      </div>
    </section>
  );
}
