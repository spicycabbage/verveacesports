import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary, interpolate } from "@/lib/i18n/dictionary";
import {
  catalogNavLabel,
  catalogShortLabel,
} from "@/lib/i18n/catalog-copy";
import { roverCopy } from "@/lib/i18n/rover-copy";
import { ProductGrid } from "@/components/product/ProductGrid";
import { RoverHomeSection } from "@/components/product/rover/RoverHomeSection";
import { RoverArtImage } from "@/components/product/rover/RoverArtImage";
import { DeferredHeroVideo } from "@/components/bleeq/DeferredHeroVideo";
import {
  isRoverGlassesSlug,
  ROVER_MEDIA,
  ROVER_PILLAR_ORDER,
  ROVER_PRIMARY_SLUG,
} from "@/lib/content/bleequp-rover";
import type { SiteConfig } from "@/lib/site/config";
import type { ProductWithDefaultVariant } from "@/lib/catalog/variants";
import { cn } from "@/lib/utils";

const ROVER_HREF = `/products/${ROVER_PRIMARY_SLUG}`;

function GlassesCard({
  href,
  image,
  kicker,
  title,
  shopLabel,
  priority = false,
}: {
  href: string;
  image: string;
  kicker: string;
  title: string;
  shopLabel: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl border bg-card transition hover:border-foreground/30"
    >
      <div className="relative aspect-[4/3] bg-muted">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            priority={priority}
            fetchPriority={priority ? "high" : "auto"}
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : null}
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {kicker}
        </p>
        <h3 className="mt-1 text-lg font-semibold tracking-tight">{title}</h3>
        <span className="mt-3 inline-flex items-center text-sm font-medium text-primary">
          {shopLabel} <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

export async function BleeqHome({
  site,
  rangerProducts,
  accessories,
}: {
  site: SiteConfig;
  rangerProducts: ProductWithDefaultVariant[];
  accessories: ProductWithDefaultVariant[];
}) {
  const cookieStore = await cookies();
  const locale = parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = getDictionary(locale);
  const home = dict.bleeq.home;
  const rover = roverCopy(locale);
  const roverModels = site.rangerProducts.filter((p) => isRoverGlassesSlug(p.slug));
  const leftoverRanger = site.rangerProducts.filter((p) => !isRoverGlassesSlug(p.slug));
  const promoChips = ROVER_PILLAR_ORDER.slice(0, 4).map((key) => rover.pillars.items[key].title);

  return (
    <div>
      <section className="relative min-h-[70vh] overflow-hidden border-b bg-black text-white sm:min-h-[78vh]">
        <div className="absolute inset-0">
          <RoverArtImage
            image={ROVER_MEDIA.hero}
            alt={home.heroAlt}
            className="absolute inset-0 sm:hidden"
            imgClassName="opacity-80"
            priority
          />
          <DeferredHeroVideo
            src={ROVER_MEDIA.statement.mp4}
            poster={ROVER_MEDIA.statement.poster}
            title={rover.hero.headline}
            className="absolute inset-0 hidden h-full w-full object-cover sm:block"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        </div>
        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-end px-4 pb-12 pt-24 sm:min-h-[78vh] sm:pb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {interpolate(home.heroKicker, { shortName: site.shortName })}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {rover.hero.headline}
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/80 sm:text-lg">{home.heroSubcopy}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={ROVER_HREF}
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {home.shopRanger}
            </Link>
            <Link
              href="#models"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white",
              )}
            >
              {home.compareModels}
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {promoChips.map((label) => (
              <span
                key={label}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="models" className="scroll-mt-24 border-b">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{home.chooseTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{home.chooseSubtitle}</p>
            </div>
            <Link
              href="/products?category=ai-glasses"
              className="text-sm font-medium text-primary hover:underline"
            >
              {home.viewAll}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {roverModels.map((p, i) => {
              const live = rangerProducts.find((r) => r.slug === p.slug);
              const navLabel = catalogNavLabel(p.slug, locale, p.label);
              return (
                <GlassesCard
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  image={live?.images?.[0] || p.image}
                  kicker={navLabel.split("—")[0]?.trim() || "BleeqUp"}
                  title={catalogShortLabel(p.slug, locale, p.shortLabel)}
                  shopLabel={home.shopNow}
                  priority={i < 2}
                />
              );
            })}
          </div>

          {leftoverRanger.length > 0 && (
            <div className="mt-14">
              <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
                {home.remainingRangerTitle}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{home.remainingRangerSubtitle}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {leftoverRanger.map((p) => {
                  const live = rangerProducts.find((r) => r.slug === p.slug);
                  const navLabel = catalogNavLabel(p.slug, locale, p.label);
                  return (
                    <GlassesCard
                      key={p.slug}
                      href={`/products/${p.slug}`}
                      image={live?.images?.[0] || p.image}
                      kicker={navLabel.split("—")[0]?.trim() || "BleeqUp"}
                      title={catalogShortLabel(p.slug, locale, p.shortLabel)}
                      shopLabel={home.shopNow}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <RoverHomeSection copy={rover} />

      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{home.accessoriesTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{home.accessoriesSubtitle}</p>
            </div>
            <Link
              href="/products?category=wearables"
              className="text-sm font-medium text-primary hover:underline"
            >
              {home.shopAccessories}
            </Link>
          </div>
          {accessories.length > 0 ? (
            <ProductGrid products={accessories} />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {site.accessoryProducts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-accent"
                >
                  {catalogNavLabel(p.slug, locale, p.label)}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{home.ctaTitle}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground sm:text-base">
            {home.ctaSubtitle}
          </p>
          <Link href={ROVER_HREF} className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
            {home.shopRanger} <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
