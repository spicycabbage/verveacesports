import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogBody } from "@/components/blog/BlogBody";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { ProductGrid } from "@/components/product/ProductGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  blogAuthorJsonLd,
  blogAuthorPath,
  blogDateIso,
  blogReadingMinutes,
  blogWordCount,
  formatBlogDate,
} from "@/lib/content/blog";
import { getLocalizedPost, localizedRelated } from "@/lib/content/blog/localize";
import {
  blogHrefLang,
  blogHreflangLanguages,
  blogOgLocale,
  blogPath,
  blogPostPath,
} from "@/lib/content/blog/paths";
import { blogLocalesForPost } from "@/lib/content/blog/translations";
import { blogCategoryInfo, blogCategoryPath } from "@/lib/content/blog/categories";
import { blogUi } from "@/lib/content/blog/ui";
import { interpolate } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locale";
import { LOCALE_LIST } from "@/lib/i18n/locale";
import { listSitemapProducts, listStorefrontProductsBySlugs } from "@/lib/catalog/queries";
import type { SiteConfig } from "@/lib/site/config";
import { siteAbsoluteUrl, siteBaseUrl, siteLogoPath } from "@/lib/site/seo";

/** hreflang only lists languages this post is actually translated into. */
function alternates(site: SiteConfig, locale: Locale, slug: string) {
  const suffix = `/${slug}`;
  return {
    canonical: blogPath(locale, suffix),
    languages: blogHreflangLanguages(site, suffix, blogLocalesForPost(slug)),
  };
}

function ogLocales(locale: Locale, slug: string) {
  const available = new Set<string>(blogLocalesForPost(slug));
  return LOCALE_LIST.filter((entry) => available.has(entry.code))
    .map((entry) => blogOgLocale(entry.code as Locale))
    .filter((code) => code !== blogOgLocale(locale));
}

export function blogArticleMetadata(site: SiteConfig, locale: Locale, slug: string): Metadata {
  const post = getLocalizedPost(slug, locale);
  if (!post) return { title: "Blog" };
  const ui = blogUi(locale);
  const path = blogPostPath(locale, post.slug);
  const modified = post.updatedAt ?? post.publishedAt;
  return {
    title: { absolute: post.metaTitle },
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author.name, url: siteAbsoluteUrl(site, blogAuthorPath(post.author, locale)) }],
    alternates: {
      ...alternates(site, locale, post.slug),
      types: {
        "application/rss+xml": [{ url: blogPath(locale, "/rss.xml"), title: `${site.name} ${ui.blog}` }],
      },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: path,
      siteName: site.name,
      locale: blogOgLocale(locale),
      alternateLocale: ogLocales(locale, post.slug),
      publishedTime: blogDateIso(post.publishedAt),
      modifiedTime: blogDateIso(modified),
      section: post.categoryLabel,
      tags: post.keywords,
      authors: [siteAbsoluteUrl(site, blogAuthorPath(post.author, locale))],
      images: [{ url: post.image.src, alt: post.image.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.image.src],
    },
  };
}

export async function BlogArticle({
  site,
  locale,
  slug,
}: {
  site: SiteConfig;
  locale: Locale;
  slug: string;
}) {
  const post = getLocalizedPost(slug, locale);
  if (!post) notFound();
  const ui = blogUi(locale);

  const [products, sitemapProducts] = await Promise.all([
    listStorefrontProductsBySlugs({ siteId: site.id, slugs: post.productSlugs }),
    listSitemapProducts(site.id),
  ]);
  const activeProducts = new Set(sitemapProducts.map((p) => p.slug));
  const related = localizedRelated(post, locale);
  const toc = post.body.flatMap((block, index) => {
    if (block.type !== "h2") return [];
    const section = post.body.slice(0, index + 1).filter((b) => b.type === "h2").length;
    return [{ id: `s-${section}`, text: block.text }];
  });
  const minutes = blogReadingMinutes(post);

  const base = siteBaseUrl(site);
  const url = siteAbsoluteUrl(site, blogPostPath(locale, post.slug));
  const modified = post.updatedAt ?? post.publishedAt;
  const organization = {
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: site.name,
    url: base,
    logo: { "@type": "ImageObject", url: `${base}${siteLogoPath(site)}` },
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    image: [siteAbsoluteUrl(site, post.image.src)],
    datePublished: blogDateIso(post.publishedAt),
    dateModified: blogDateIso(modified),
    author: blogAuthorJsonLd(post.author, site, locale),
    publisher: organization,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@id": `${siteAbsoluteUrl(site, blogPath(locale))}#blog` },
    articleSection: post.categoryLabel,
    keywords: post.keywords.join(", "),
    wordCount: blogWordCount(post),
    timeRequired: `PT${minutes}M`,
    inLanguage: blogHrefLang(locale),
  };
  const category = blogCategoryInfo(post.category);
  const crumbs = [
    { name: ui.home, item: base },
    { name: ui.blog, item: siteAbsoluteUrl(site, blogPath(locale)) },
    { name: post.categoryLabel, item: siteAbsoluteUrl(site, blogCategoryPath(category.slug, locale)) },
    { name: post.title, item: url },
  ];
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.item,
    })),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: blogHrefLang(locale),
    mainEntity: post.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12" lang={blogHrefLang(locale)}>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {post.faq.length > 0 ? <JsonLd data={faqJsonLd} /> : null}

      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {ui.home}
        </Link>
        {" / "}
        <Link href={blogPath(locale)} className="hover:text-foreground">
          {ui.blog}
        </Link>
        {" / "}
        <Link href={blogCategoryPath(category.slug, locale)} className="hover:text-foreground">
          {post.categoryLabel}
        </Link>
        {" / "}
        <span aria-current="page" className="line-clamp-1 inline">
          {post.title}
        </span>
      </nav>

      <article className="mt-6">
        <header className="mx-auto max-w-3xl">
          <Link
            href={blogCategoryPath(category.slug, locale)}
            className="text-xs font-medium uppercase tracking-wide text-primary hover:underline"
          >
            {post.categoryLabel}
          </Link>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
          <p className="mt-4 flex flex-wrap gap-x-2 text-sm text-muted-foreground">
            <span>
              {ui.by}{" "}
              <Link
                href={blogAuthorPath(post.author, locale)}
                rel="author"
                className="font-medium text-foreground hover:text-primary"
              >
                {post.author.name}
              </Link>
            </span>
            <span aria-hidden>·</span>
            <time dateTime={blogDateIso(post.publishedAt)}>{formatBlogDate(post.publishedAt, locale)}</time>
            {post.updatedAt ? (
              <>
                <span aria-hidden>·</span>
                <span>
                  {ui.updated}{" "}
                  <time dateTime={blogDateIso(post.updatedAt)}>{formatBlogDate(post.updatedAt, locale)}</time>
                </span>
              </>
            ) : null}
            <span aria-hidden>·</span>
            <span>{interpolate(ui.minRead, { n: minutes })}</span>
          </p>
        </header>

        <div className="relative mx-auto mt-8 aspect-[16/9] max-w-4xl overflow-hidden rounded-2xl border bg-muted">
          <Image
            src={post.image.src}
            alt={post.image.alt}
            fill
            priority
            sizes="(min-width: 1024px) 896px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          {toc.length > 2 ? (
            <nav aria-label={ui.inThisArticle} className="mb-10 rounded-xl border bg-card p-5">
              <p className="text-sm font-semibold">{ui.inThisArticle}</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="hover:text-foreground">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <BlogBody blocks={post.body} activeProducts={activeProducts} locale={locale} />

          {post.faq.length > 0 ? (
            <div className="mt-12">
              <FaqAccordion
                sections={[
                  {
                    title: ui.faqTitle,
                    items: post.faq.map((f) => ({ question: f.q, answer: f.a })),
                  },
                ]}
              />
            </div>
          ) : null}

          <aside aria-label={ui.aboutAuthor} className="mt-12 flex gap-4 rounded-2xl border bg-card p-5">
            <div
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-base font-semibold text-primary"
            >
              {post.author.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {ui.writtenBy}{" "}
                <Link href={blogAuthorPath(post.author, locale)} rel="author" className="hover:text-primary">
                  {post.author.name}
                </Link>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{blogUi(locale).authorShortBio}</p>
            </div>
          </aside>
        </div>
      </article>

      {products.length > 0 ? (
        <section aria-labelledby="shop-heading" className="mt-16">
          <h2 id="shop-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            {ui.shopThis}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {interpolate(ui.shippingNote, { amount: site.freeShippingOver })}
          </p>
          <div className="mt-6">
            <ProductGrid products={products.slice(0, 4)} priorityCount={0} />
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="mt-16">
          <h2 id="related-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            {ui.keepReading}
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">
            {related.map((relatedPost) => (
              <li key={relatedPost.slug}>
                <Link
                  href={blogPostPath(locale, relatedPost.slug)}
                  className="group block h-full overflow-hidden rounded-2xl border bg-card"
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={relatedPost.image.src}
                      alt={relatedPost.image.alt}
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">
                      {relatedPost.categoryLabel}
                    </p>
                    <p className="mt-1 font-semibold leading-snug group-hover:text-primary">{relatedPost.title}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
