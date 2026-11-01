import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogCategory, blogCategoryMetadata, hasBlogCategory } from "@/components/blog/BlogCategory";
import { requireVerveaceSite } from "@/lib/site/require-verveace";

type Params = Promise<{ category: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const [{ category }, site] = await Promise.all([params, requireVerveaceSite()]);
  if (!hasBlogCategory("en", category)) notFound();
  return blogCategoryMetadata(site, "en", category);
}

export default async function BlogCategoryPage({ params }: { params: Params }) {
  const [{ category }, site] = await Promise.all([params, requireVerveaceSite()]);
  return <BlogCategory site={site} locale="en" slug={category} />;
}
