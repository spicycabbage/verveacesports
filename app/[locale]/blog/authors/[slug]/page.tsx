import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogAuthor, blogAuthorMetadata } from "@/components/blog/BlogAuthor";
import { getBlogAuthor } from "@/lib/content/blog";
import { isBlogPrefixLocale } from "@/lib/content/blog/paths";
import { blogLocalesFor } from "@/lib/content/blog/translations";
import { requireVerveaceSite } from "@/lib/site/require-verveace";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const [{ locale, slug }, site] = await Promise.all([params, requireVerveaceSite()]);
  if (!isBlogPrefixLocale(locale) || !blogLocalesFor().includes(locale) || !getBlogAuthor(slug)) notFound();
  return blogAuthorMetadata(site, locale, slug);
}

export default async function LocalizedBlogAuthorPage({ params }: { params: Params }) {
  const [{ locale, slug }, site] = await Promise.all([params, requireVerveaceSite()]);
  if (!isBlogPrefixLocale(locale) || !blogLocalesFor().includes(locale)) notFound();
  return <BlogAuthor site={site} locale={locale} slug={slug} />;
}
