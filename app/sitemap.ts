import type { MetadataRoute } from "next";
import { getSite } from "@/lib/site/get-site";
import { siteBaseUrl } from "@/lib/site/seo";
import { listSitemapProducts } from "@/lib/catalog/queries";

// Uses request headers (host) so each storefront domain serves its own sitemap.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite();
  const base = siteBaseUrl(site);
  const products = await listSitemapProducts(site.id);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    ...site.categories.map((category) => ({
      url: `${base}/products?category=${category}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/warranty`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    ...(site.id === "bleeq-ca"
      ? [{ url: `${base}/draw`, changeFrequency: "weekly" as const, priority: 0.6 }]
      : []),
  ];

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: p.created_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
