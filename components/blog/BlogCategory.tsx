import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCategoryNav, PostCard, postsFor } from "@/components/blog/BlogIndex";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogDateIso } from "@/lib/content/blog";
import {
  blogCategoryBySlug,
  blogCategoryCopy,
  blogCategoryLocales,
  blogCategoryPath,
} from "@/lib/content/blog/categories";
import { blogHrefLang, blogHreflangLanguages, blogOgLocale, blogPath, blogPostPath } from "@/lib/content/blog/paths";
import { blogUi } from "@/lib/content/blog/ui";
import type { Locale } from "@/lib/i18n/locale";
import type { SiteConfig } from "@/lib/site/config";
import { siteAbsoluteUrl, siteBaseUrl } from "@/lib/site/seo";

function categoryPosts(locale: Locale, slug: string) {
  const info = blogCategoryBySlug(slug);
  if (!info) return null;
  const posts = postsFor(locale).filter((post) => post.category === info.category);
  return posts.length > 0 ? { info, posts } : null;
}

/** False for unknown slugs and for languages with no live post in the category. */
export function hasBlogCategory(locale: Locale, slug: string): boolean {
  return categoryPosts(locale, slug) !== null;
}

export function blogCategoryMetadata(site: SiteConfig, locale: Locale, slug: string): Metadata {
  const found = categoryPosts(locale, slug);
  if (!found) return { title: "Blog" };
  const { info, posts } = found;
  const copy = blogCategoryCopy(info.slug, locale);
  const ui = blogUi(locale);
  const path = blogCategoryPath(info.slug, locale);
  const locales = blogCategoryLocales(info.slug);
  return {
    title: { absolute: copy.metaTitle },
    description: copy.description,
    alternates: {
      canonical: path,
      languages: blogHreflangLanguages(site, `/category/${info.slug}`, locales),
      types: { "application/rss+xml": [{ url: blogPath(locale, "/rss.xml"), title: `${site.name} ${ui.blog}` }] },
    },
    openGraph: {
      type: "website",
      title: copy.title,
      description: copy.description,
      url: path,
      siteName: site.name,
      locale: blogOgLocale(locale),
      alternateLocale: locales.filter((entry) => entry !== locale).map(blogOgLocale),
      images: [{ url: posts[0].image.src, alt: posts[0].image.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: [posts[0].image.src],
    },
  };
}

export function BlogCategory({ site, locale, slug }: { site: SiteConfig; locale: Locale; slug: string }) {
  const found = categoryPosts(locale, slug);
  if (!found) notFound();
  const { info, posts } = found;
  const copy = blogCategoryCopy(info.slug, locale);
  const ui = blogUi(locale);
  const lang = blogHrefLang(locale);
  const base = siteBaseUrl(site);
  const blogUrl = siteAbsoluteUrl(site, blogPath(locale));
  const url = siteAbsoluteUrl(site, blogCategoryPath(info.slug, locale));

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#page`,
    name: copy.title,
    description: copy.description,
    url,
    inLanguage: lang,
    isPartOf: { "@id": `${blogUrl}#blog` },
    publisher: { "@type": "Organization", "@id": `${base}/#organization`, name: site.name, url: base },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: siteAbsoluteUrl(site, blogPostPath(locale, post.slug)),
        name: post.title,
      })),
    },
    dateModified: blogDateIso(posts[0].updatedAt ?? posts[0].publishedAt),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: ui.home, item: base },
      { "@type": "ListItem", position: 2, name: ui.blog, item: blogUrl },
      { "@type": "ListItem", position: 3, name: copy.label, item: url },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12" lang={lang}>
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {ui.home}
        </Link>
        {" / "}
        <Link href={blogPath(locale)} className="hover:text-foreground">
          {ui.blog}
        </Link>
        {" / "}
        <span aria-current="page">{copy.label}</span>
      </nav>

      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{copy.intro}</p>
        <Link href={info.shopHref} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          {copy.shopLabel} →
        </Link>
      </header>

      <BlogCategoryNav locale={locale} current={info.slug} />

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <PostCard locale={locale} post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
}
