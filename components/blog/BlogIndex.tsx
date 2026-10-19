import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { BLOG_POSTS, blogAuthorJsonLd, blogDateIso, blogReadingMinutes, formatBlogDate } from "@/lib/content/blog";
import { localizePost, type LocalizedPost } from "@/lib/content/blog/localize";
import { blogHrefLang, blogHreflangLanguages, blogOgLocale, blogPath, blogPostPath } from "@/lib/content/blog/paths";
import { blogLocalesFor } from "@/lib/content/blog/translations";
import { blogUi } from "@/lib/content/blog/ui";
import { interpolate } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locale";
import { LOCALE_LIST } from "@/lib/i18n/locale";
import type { SiteConfig } from "@/lib/site/config";
import { siteAbsoluteUrl, siteBaseUrl } from "@/lib/site/seo";

function postsFor(locale: Locale): LocalizedPost[] {
  return BLOG_POSTS.flatMap((post) => {
    const localized = localizePost(post, locale);
    return localized ? [localized] : [];
  });
}

export function blogIndexMetadata(site: SiteConfig, locale: Locale): Metadata {
  const ui = blogUi(locale);
  const posts = postsFor(locale);
  const path = blogPath(locale);
  return {
    title: `${ui.blog}: ${ui.indexTitle}`,
    description: ui.indexDescription,
    alternates: {
      canonical: path,
      languages: blogHreflangLanguages(site, "", blogLocalesFor()),
      types: { "application/rss+xml": [{ url: blogPath(locale, "/rss.xml"), title: `${site.name} ${ui.blog}` }] },
    },
    openGraph: {
      type: "website",
      title: `${site.name} ${ui.blog}: ${ui.indexTitle}`,
      description: ui.indexDescription,
      url: path,
      locale: blogOgLocale(locale),
      alternateLocale: LOCALE_LIST.map((entry) => blogOgLocale(entry.code as Locale)).filter(
        (code) => code !== blogOgLocale(locale),
      ),
      ...(posts[0] ? { images: [{ url: posts[0].image.src, alt: posts[0].image.alt }] } : {}),
    },
  };
}

export function BlogIndex({ site, locale }: { site: SiteConfig; locale: Locale }) {
  const ui = blogUi(locale);
  const posts = postsFor(locale);
  const [featured, ...rest] = posts;
  const base = siteBaseUrl(site);
  const blogUrl = siteAbsoluteUrl(site, blogPath(locale));

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${blogUrl}#blog`,
    name: `${site.name} ${ui.blog}`,
    description: ui.indexDescription,
    url: blogUrl,
    inLanguage: blogHrefLang(locale),
    publisher: { "@type": "Organization", name: site.name, url: base },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: siteAbsoluteUrl(site, blogPostPath(locale, post.slug)),
      datePublished: blogDateIso(post.publishedAt),
      image: siteAbsoluteUrl(site, post.image.src),
      inLanguage: blogHrefLang(locale),
      author: blogAuthorJsonLd(post.author, site, locale),
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: ui.home, item: base },
      { "@type": "ListItem", position: 2, name: ui.blog, item: blogUrl },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12" lang={blogHrefLang(locale)}>
      <JsonLd data={blogJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {ui.home}
        </Link>
        {" / "}
        <span aria-current="page">{ui.blog}</span>
      </nav>

      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{ui.indexTitle}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{ui.indexDescription}</p>
      </header>

      {featured ? (
        <article className="group mt-10 grid gap-6 overflow-hidden rounded-2xl border bg-card md:grid-cols-2">
          <Link
            href={blogPostPath(locale, featured.slug)}
            className="relative block aspect-[16/10] md:aspect-auto"
            tabIndex={-1}
            aria-hidden
          >
            <Image
              src={featured.image.src}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </Link>
          <div className="flex flex-col justify-center p-6 md:p-8">
            <PostMeta locale={locale} post={featured} />
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              <Link href={blogPostPath(locale, featured.slug)} className="hover:text-primary">
                {featured.title}
              </Link>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{featured.excerpt}</p>
            <Link
              href={blogPostPath(locale, featured.slug)}
              className="mt-5 text-sm font-medium text-primary hover:underline"
            >
              {ui.readGuide} →
            </Link>
          </div>
        </article>
      ) : null}

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <li key={post.slug}>
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card">
              <Link
                href={blogPostPath(locale, post.slug)}
                className="relative block aspect-[16/10]"
                tabIndex={-1}
                aria-hidden
              >
                <Image
                  src={post.image.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <PostMeta locale={locale} post={post} />
                <h2 className="mt-2 text-lg font-semibold leading-snug tracking-tight">
                  <Link href={blogPostPath(locale, post.slug)} className="hover:text-primary">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PostMeta({ locale, post }: { locale: Locale; post: LocalizedPost }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
      <span className="font-medium uppercase tracking-wide text-primary">{post.categoryLabel}</span>
      <span aria-hidden>·</span>
      <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt, locale)}</time>
      <span aria-hidden>·</span>
      <span>{interpolate(blogUi(locale).minRead, { n: blogReadingMinutes(post) })}</span>
    </p>
  );
}
