import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/product/ProductGrid";
import { BleeqHome } from "@/components/bleeq/BleeqHome";
import { HomeHero } from "@/components/home/HomeHero";
import { CATEGORIES } from "@/lib/constants";
import { CATEGORY_IMAGES } from "@/lib/catalog/category-images";
import { attachDefaultVariantIds } from "@/lib/catalog/variants";
import { getSite } from "@/lib/site/get-site";
import { applySiteCatalogFilter } from "@/lib/site/catalog";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { categoryLabelFromDict } from "@/lib/i18n/helpers";
import { sizedImageUrl } from "@/lib/images/cdn";

type HomeSearch = Promise<Record<string, string | string[] | undefined>>;

export const metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage({ searchParams }: { searchParams?: HomeSearch }) {
  const sp = searchParams ? await searchParams : {};
  if (typeof sp.code === "string") {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === "string") q.set(k, v);
      else if (Array.isArray(v)) for (const item of v) q.append(k, item);
    }
    redirect(`/callback?${q.toString()}`);
  }

  const site = await getSite();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const supabase = await createSupabaseServerClient();

  if (site.id === "bleeq-ca") {
    const rangerQ = applySiteCatalogFilter(
      supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("category", "ai-glasses")
        .order("created_at", { ascending: false }),
      site,
    );
    const accQ = applySiteCatalogFilter(
      supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("category", "wearables")
        .order("created_at", { ascending: false })
        .limit(8),
      site,
    );
    const [{ data: rangerRaw }, { data: accRaw }] = await Promise.all([rangerQ, accQ]);
    const rangerProducts = await attachDefaultVariantIds(supabase, rangerRaw ?? []);
    const accessories = await attachDefaultVariantIds(supabase, accRaw ?? []);

    return (
      <BleeqHome site={site} rangerProducts={rangerProducts} accessories={accessories} />
    );
  }

  const { data: featuredRaw } = await applySiteCatalogFilter(
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8),
    site,
  );
  const featured = await attachDefaultVariantIds(supabase, featuredRaw ?? []);

  return (
    <div>
      <HomeHero />

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{dict.home.shopByCategory}</h2>
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            {dict.home.viewAll} →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/products?category=${c}`}>
              <Card className="group overflow-hidden p-0 transition-all hover:shadow-lg">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3] bg-white">
                    <Image
                      src={sizedImageUrl(CATEGORY_IMAGES[c], 800)}
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
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{dict.home.featured}</h2>
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            {dict.home.seeAll} →
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </div>
  );
}
