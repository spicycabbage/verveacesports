import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Truck, ShieldCheck, Sparkles } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CATEGORIES, categoryLabel } from "@/lib/constants";
import { CATEGORY_IMAGES } from "@/lib/catalog/category-images";
import { attachDefaultVariantIds } from "@/lib/catalog/variants";

type HomeSearch = Promise<Record<string, string | string[] | undefined>>;

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

  const supabase = await createSupabaseServerClient();
  const { data: featuredRaw } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);
  const featured = await attachDefaultVariantIds(supabase, featuredRaw ?? []);

  return (
    <div>
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-background via-background to-primary/10">
        <div className="absolute inset-0 -z-10 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] [background-size:20px_20px]" />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:py-12 md:grid-cols-2 md:items-center md:gap-10 md:py-24">
          <div className="order-2 space-y-5 md:order-1 md:space-y-6">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="font-medium leading-snug">
                BleeqUp, MGI &amp; Motocaddy — ships USA &amp; Canada
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Capture every moment. <span className="text-primary">Power every round.</span>
            </h1>
            <p className="max-w-prose text-base text-muted-foreground sm:text-lg">
              Shop BleeqUp Ranger AI sports camera glasses and premium electric golf carts from
              MGI and Motocaddy. Free shipping across USA &amp; Canada on orders over $75.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className={buttonVariants({ size: "lg" })}>
                Shop the catalog <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
              <Link
                href="/products?category=ai-glasses"
                className={buttonVariants({ size: "lg", variant: "outline" })}
              >
                BleeqUp Ranger
              </Link>
            </div>
            <div className="grid gap-2 pt-2 text-sm sm:grid-cols-3 sm:gap-3 sm:pt-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" /> Free shipping $75+
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> 30-day returns
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Loyalty rewards
              </div>
            </div>
          </div>
          <div className="relative order-1 aspect-[16/10] min-h-[200px] w-full overflow-hidden rounded-2xl bg-muted shadow-xl sm:aspect-[4/3] sm:min-h-[260px] md:order-2 md:aspect-square md:min-h-0 md:rounded-3xl">
            <Image
              src="https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Ranger_Black_Standard_Lens.jpg?v=1781082522"
              alt="BleeqUp Ranger AI sports camera glasses"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Shop by category</h2>
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/products?category=${c}`}>
              <Card className="group overflow-hidden p-0 transition-all hover:shadow-lg">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={CATEGORY_IMAGES[c]}
                      alt={categoryLabel(c)}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <span className="absolute bottom-3 left-3 text-base font-semibold text-white">
                      {categoryLabel(c)}
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
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Featured products</h2>
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            See all →
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </div>
  );
}
