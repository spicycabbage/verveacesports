import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogCategory, blogCategoryMetadata } from "@/components/blog/BlogCategory";
import { blogCategoryBySlug } from "@/lib/content/blog/categories";
import { requireVerveaceSite } from "@/lib/site/require-verveace";

type Params = Promise<{ category: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const [{ category }, site] = await Promise.all([params, requireVerveaceSite()]);
  if (!blogCategoryBySlug(category)) notFound();
  return blogCategoryMetadata(site, category);
}

export default async function BlogCategoryPage({ params }: { params: Params }) {
  const [{ category }, site] = await Promise.all([params, requireVerveaceSite()]);
  return <BlogCategory site={site} slug={category} />;
}
