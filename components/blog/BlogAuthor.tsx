import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogAuthorJsonLd, blogAuthorPath, formatBlogDate, getBlogAuthor, publishedBlogPosts } from "@/lib/content/blog";
import { localizePost } from "@/lib/content/blog/localize";
import { blogHrefLang, blogHreflangLanguages, blogOgLocale, blogPath } from "@/lib/content/blog/paths";
import { blogLocalesFor } from "@/lib/content/blog/translations";
import { blogUi } from "@/lib/content/blog/ui";
import { interpolate } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locale";
import type { SiteConfig } from "@/lib/site/config";
import { siteAbsoluteUrl, siteBaseUrl } from "@/lib/site/seo";

export function blogAuthorMetadata(site: SiteConfig, locale: Locale, slug: string): Metadata {
  const author = getBlogAuthor(slug);
  if (!author) return { title: "Blog" };
  const ui = blogUi(locale);
  const path = blogAuthorPath(author, locale);
  const title = interpolate(ui.authorMetaTitle, { name: author.name });
  return {
    title,
    description: ui.authorShortBio,
    alternates: {
      canonical: path,
      languages: blogHreflangLanguages(site, `/authors/${author.slug}`, blogLocalesFor()),
    },
    openGraph: {
      type: "profile",
      title,
      description: ui.authorShortBio,
      url: path,
      locale: blogOgLocale(locale),
    },
  };
}

export function BlogAuthor({ site, locale, slug }: { site: SiteConfig; locale: Locale; slug: string }) {
  const author = getBlogAuthor(slug);
  if (!author) notFound();
  const ui = blogUi(locale);
  const posts = publishedBlogPosts().flatMap((post) => {
    if (post.author.slug !== author.slug) return [];
    const localized = localizePost(post, locale);
    return localized ? [localized] : [];
  });
  const base = siteBaseUrl(site);
  const url = siteAbsoluteUrl(site, blogAuthorPath(author, locale));

  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    inLanguage: blogHrefLang(locale),
    mainEntity: blogAuthorJsonLd(author, site, locale),
    hasPart: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: siteAbsoluteUrl(site, blogPath(locale, `/${post.slug}`)),
      inLanguage: blogHrefLang(locale),
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: ui.home, item: base },
      { "@type": "ListItem", position: 2, name: ui.blog, item: siteAbsoluteUrl(site, blogPath(locale)) },
      { "@type": "ListItem", position: 3, name: author.name, item: url },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12" lang={blogHrefLang(locale)}>
      <JsonLd data={profileJsonLd} />
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
        <span aria-current="page">{author.name}</span>
      </nav>

      <header className="mt-6 flex items-center gap-4">
        <div
          aria-hidden
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xl font-semibold text-primary"
        >
          {author.name
            .split(" ")
            .map((part) => part[0])
            .join("")}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{author.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{ui.authorTagline}</p>
        </div>
      </header>

      <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
        {ui.authorBio.map((para) => (
          <p key={para}>{para}</p>
        ))}
      </div>

      <section aria-labelledby="articles-heading" className="mt-12">
        <h2 id="articles-heading" className="text-xl font-semibold tracking-tight">
          {interpolate(ui.articlesBy, { name: author.name })}
        </h2>
        <ul className="mt-4 divide-y rounded-2xl border bg-card">
          {posts.map((post) => (
            <li key={post.slug} className="px-5 py-4">
              <Link href={blogPath(locale, `/${post.slug}`)} className="font-medium hover:text-primary">
                {post.title}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {post.categoryLabel} ·{" "}
                <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt, locale)}</time>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
