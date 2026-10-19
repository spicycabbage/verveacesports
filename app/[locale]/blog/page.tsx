import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndex, blogIndexMetadata } from "@/components/blog/BlogIndex";
import { isBlogPrefixLocale } from "@/lib/content/blog/paths";
import { blogLocalesFor } from "@/lib/content/blog/translations";
import { requireVerveaceSite } from "@/lib/site/require-verveace";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const [{ locale }, site] = await Promise.all([params, requireVerveaceSite()]);
  if (!isBlogPrefixLocale(locale) || !blogLocalesFor().includes(locale)) notFound();
  return blogIndexMetadata(site, locale);
}

export default async function LocalizedBlogIndexPage({ params }: { params: Params }) {
  const [{ locale }, site] = await Promise.all([params, requireVerveaceSite()]);
  if (!isBlogPrefixLocale(locale) || !blogLocalesFor().includes(locale)) notFound();
  return <BlogIndex site={site} locale={locale} />;
}
