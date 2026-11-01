import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogCategory, blogCategoryMetadata, hasBlogCategory } from "@/components/blog/BlogCategory";
import { isBlogPrefixLocale, type BlogPrefixLocale } from "@/lib/content/blog/paths";
import { requireVerveaceSite } from "@/lib/site/require-verveace";

type Params = Promise<{ locale: string; category: string }>;

function resolve(locale: string, category: string): BlogPrefixLocale {
  if (!isBlogPrefixLocale(locale) || !hasBlogCategory(locale, category)) notFound();
  return locale;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const [{ locale, category }, site] = await Promise.all([params, requireVerveaceSite()]);
  return blogCategoryMetadata(site, resolve(locale, category), category);
}

export default async function LocalizedBlogCategoryPage({ params }: { params: Params }) {
  const [{ locale, category }, site] = await Promise.all([params, requireVerveaceSite()]);
  return <BlogCategory site={site} locale={resolve(locale, category)} slug={category} />;
}
