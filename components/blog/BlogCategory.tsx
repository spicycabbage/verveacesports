import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCategoryNav, PostCard, postsFor } from "@/components/blog/BlogIndex";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogDateIso } from "@/lib/content/blog";
import { blogCategoryBySlug, blogCategoryPath } from "@/lib/content/blog/categories";
import { blogPath, blogPostPath } from "@/lib/content/blog/paths";
import { blogUi } from "@/lib/content/blog/ui";
import type { SiteConfig } from "@/lib/site/config";
import { siteAbsoluteUrl, siteBaseUrl } from "@/lib/site/seo";

export function blogCategoryMetadata(site: SiteConfig, slug: string): Metadata {
  const info = blogCategoryBySlug(slug);
  if (!info) return { title: "Blog" };
  const posts = postsFor("en").filter((post) => post.category === info.category);
  const path = blogCategoryPath(info.slug);
  return {
    title: { absolute: info.metaTitle },
    description: info.description,
    alternates: {
      canonical: path,
      types: { "application/rss+xml": [{ url: blogPath("en", "/rss.xml"), title: `${site.name} Blog` }] },
    },
    openGraph: {
      type: "website",
      title: info.title,
      description: info.description,
      url: path,
      siteName: site.name,
      locale: "en_CA",
      ...(posts[0] ? { images: [{ url: posts[0].image.src, alt: posts[0].image.alt }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: info.title,
      description: info.description,
      ...(posts[0] ? { images: [posts[0].image.src] } : {}),
    },
  };
}

export function BlogCategory({ site, slug }: { site: SiteConfig; slug: string }) {
  const info = blogCategoryBySlug(slug);
  if (!info) notFound();
  const ui = blogUi("en");
  const posts = postsFor("en").filter((post) => post.category === info.category);
  const base = siteBaseUrl(site);
  const blogUrl = siteAbsoluteUrl(site, blogPath("en"));
  const url = siteAbsoluteUrl(site, blogCategoryPath(info.slug));

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#page`,
    name: info.title,
    description: info.description,
    url,
    inLanguage: "en-CA",
    isPartOf: { "@id": `${blogUrl}#blog` },
    publisher: { "@type": "Organization", "@id": `${base}/#organization`, name: site.name, url: base },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: siteAbsoluteUrl(site, blogPostPath("en", post.slug)),
        name: post.title,
      })),
    },
    dateModified: posts[0] ? blogDateIso(posts[0].updatedAt ?? posts[0].publishedAt) : undefined,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: ui.home, item: base },
      { "@type": "ListItem", position: 2, name: ui.blog, item: blogUrl },
      { "@type": "ListItem", position: 3, name: info.category, item: url },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12" lang="en-CA">
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {ui.home}
        </Link>
        {" / "}
        <Link href={blogPath("en")} className="hover:text-foreground">
          {ui.blog}
        </Link>
        {" / "}
        <span aria-current="page">{info.category}</span>
      </nav>

      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{info.title}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{info.intro}</p>
        <Link href={info.shopHref} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          {info.shopLabel} →
        </Link>
      </header>

      <BlogCategoryNav current={info.slug} />

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <PostCard locale="en" post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
}
