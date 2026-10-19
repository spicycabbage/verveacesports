import Link from "next/link";
import Image from "next/image";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CATEGORY_IMAGES } from "@/lib/catalog/category-images";
import type { ProductWithDefaultVariant } from "@/lib/catalog/variants";
import { categoryLabelFromDict } from "@/lib/i18n/helpers";
import type { Dictionary } from "@/lib/i18n/messages/types";
import type { SiteConfig } from "@/lib/site/config";

export function VoltHome({
  site,
  dict,
  featured,
}: {
  site: SiteConfig;
  dict: Dictionary;
  featured: ProductWithDefaultVariant[];
}) {
  return (
    <div>
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {site.name}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            {dict.site.voltTagline}
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">{dict.site.voltDescription}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/products/volt-caddy-pro-s"
              className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              {dict.home.ctaCarts}
            </Link>
            <Link
              href="/products"
              className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-semibold"
            >
              {dict.home.ctaAll}
            </Link>
          </div>
        </div>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
          <Image
            src="/catalog/volt/pro-s-01-sq.webp"
            alt="Volt Caddy Pro-S remote electric golf push cart"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">{dict.home.shopByCategory}</h2>
        <div className="grid grid-cols-2 gap-4">
          {site.categories.map((c) => (
            <Link key={c} href={`/products?category=${c}`}>
              <div className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-white">
                <Image
                  src={CATEGORY_IMAGES[c]}
                  alt={categoryLabelFromDict(dict, c)}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute bottom-3 left-3 text-base font-semibold text-white">
                  {categoryLabelFromDict(dict, c)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight">{dict.home.featured}</h2>
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            {dict.home.seeAll} →
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </div>
  );
}
