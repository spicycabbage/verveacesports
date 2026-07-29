import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { ProductGrid } from "@/components/product/ProductGrid";
import { NativeVideoPlayer } from "@/components/product/ai-glasses/NativeVideoPlayer";
import {
  BLEEQUUP_FEATURE_VIDEOS,
  BLEEQUUP_HERO,
  BLEEQUUP_PROMOS,
  BLEEQUUP_TESTIMONIALS,
} from "@/lib/content/bleequp-ai-glasses";
import type { SiteConfig } from "@/lib/site/config";
import type { ProductWithDefaultVariant } from "@/lib/catalog/variants";
import { sizedImageUrl } from "@/lib/images/cdn";
import { cn } from "@/lib/utils";

const AS_SEEN_IN = [
  {
    outlet: "WIRED",
    quote:
      "The arms of the glasses have speakers so you can play music, and they sounded pretty good in brief demo in a very loud space.",
  },
  {
    outlet: "Lifehacker",
    quote:
      "BleeqUp Ranger sport glasses pack a 1080p/3K camera, open-ear audio, and turn-by-turn navigation into a stylish pair of cycling shades.",
  },
  {
    outlet: "Notebookcheck",
    quote:
      "At under 50g, the Ranger is light enough that you stop noticing it after a few minutes. The camera shoots up to 3K at 60fps.",
  },
] as const;

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
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const home = dict.bleeq.home;
  const featurePreview = BLEEQUUP_FEATURE_VIDEOS.slice(0, 4);

  return (
    <div>
      {/* Full-bleed hero */}
      <section className="relative min-h-[70vh] overflow-hidden border-b bg-black text-white sm:min-h-[78vh]">
        <div className="absolute inset-0">
          <Image
            src="/bleeq-hero-mobile.png"
            alt="BleeqUp Ranger AI Sports Glasses"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_20%] opacity-80 sm:hidden"
          />
          <video
            className="hidden h-full w-full object-cover opacity-70 sm:block"
            src={BLEEQUUP_HERO.mp4}
            poster={sizedImageUrl(BLEEQUUP_HERO.poster, 1600)}
            autoPlay
            muted
            loop
            playsInline
            aria-label={BLEEQUUP_HERO.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        </div>
        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-end px-4 pb-12 pt-24 sm:min-h-[78vh] sm:pb-16">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            AI Sports Glasses
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/80 sm:text-lg">
            {BLEEQUUP_HERO.subtitle}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/products?category=ai-glasses"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {home.shopNow}
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
            {BLEEQUUP_PROMOS.map((p) => (
              <span
                key={p.label}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur"
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Model row */}
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
          <div className="grid gap-4 sm:grid-cols-3">
            {site.rangerProducts.map((p) => {
              const live = rangerProducts.find((r) => r.slug === p.slug);
              const img = live?.images?.[0] || p.image;
              return (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className="group overflow-hidden rounded-2xl border bg-card transition hover:border-foreground/30"
                >
                  <div className="relative aspect-[4/3] bg-muted">
                    {img ? (
                      <Image
                        src={sizedImageUrl(img, 900)}
                        alt={p.label}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ranger
                    </p>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight">{p.shortLabel}</h3>
                    <span className="mt-3 inline-flex items-center text-sm font-medium text-primary">
                      {home.shopNow} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature video strip */}
      <section className="border-b bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-16">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {home.featuresKicker}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {home.featuresTitle}
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            {featurePreview.map((video) => (
              <article key={video.id} className="space-y-3">
                <NativeVideoPlayer
                  src={video.mp4}
                  poster={video.poster}
                  title={video.title}
                  posterWidth={640}
                />
                <h3 className="text-lg font-semibold tracking-tight">{video.title}</h3>
                {video.description && (
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                )}
              </article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/products?category=ai-glasses"
              className={buttonVariants({ variant: "outline" })}
            >
              {home.watchMore}
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-16">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {home.testimonialsKicker}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {home.testimonialsTitle}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BLEEQUUP_TESTIMONIALS.slice(0, 6).map((video) => (
              <article key={video.id} className="flex flex-col gap-3">
                <NativeVideoPlayer
                  src={video.mp4}
                  poster={video.poster}
                  title={video.title}
                  posterWidth={640}
                />
                <div>
                  <h3 className="font-semibold">@{video.title}</h3>
                  {video.description && (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      &ldquo;{video.description}&rdquo;
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* As seen in */}
      <section className="border-b bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-16">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            {home.asSeenIn}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {AS_SEEN_IN.map((item) => (
              <blockquote key={item.outlet} className="rounded-2xl border bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.outlet}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Accessories */}
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
                  {p.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{home.ctaTitle}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground sm:text-base">
            {home.ctaSubtitle}
          </p>
          <Link
            href="/products?category=ai-glasses"
            className={cn(buttonVariants({ size: "lg" }), "mt-6")}
          >
            {home.shopRanger} <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
