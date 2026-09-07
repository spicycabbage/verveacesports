import type { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSite } from "@/lib/site/get-site";
import { siteBaseUrl } from "@/lib/site/seo";

// Uses request headers (host) so each storefront domain serves its own sitemap.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite();
  const base = siteBaseUrl(site);

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("products")
    .select("slug, created_at")
    .eq("is_active", true);
  if (site.id !== "verveace") {
    query = query.in("category", [...site.categories]);
  }
  const { data: products } = await query;

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/warranty`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const productEntries: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: p.created_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
