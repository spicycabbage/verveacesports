import type { Locale } from "@/lib/i18n/locale";
import { getBlogPost, relatedBlogPosts } from "./index";
import { BLOG_TRANSLATIONS } from "./translations";
import type { BlogBlock, BlogCategory, BlogFaq, BlogPost } from "./types";
import type { BlogAuthor } from "./author";

export type LocalizedPost = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  excerpt: string;
  keywords: string[];
  image: { src: string; alt: string };
  category: BlogCategory;
  categoryLabel: string;
  author: BlogAuthor;
  publishedAt: string;
  updatedAt?: string;
  productSlugs: readonly string[];
  body: BlogBlock[];
  faq: BlogFaq[];
};

function fromEnglish(post: BlogPost): LocalizedPost {
  return {
    slug: post.slug,
    title: post.title,
    metaTitle: post.metaTitle,
    description: post.description,
    excerpt: post.excerpt,
    keywords: post.keywords,
    image: post.image,
    category: post.category,
    categoryLabel: post.category,
    author: post.author,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    productSlugs: post.productSlugs,
    body: post.body,
    faq: post.faq,
  };
}

/** Null when this locale has no translation. Never falls back to English on a localized URL. */
export function localizePost(post: BlogPost, locale: Locale): LocalizedPost | null {
  if (locale === "en") return fromEnglish(post);
  const tr = BLOG_TRANSLATIONS[locale]?.[post.slug];
  if (!tr) return null;
  return {
    ...fromEnglish(post),
    title: tr.title,
    metaTitle: tr.metaTitle,
    description: tr.description,
    excerpt: tr.excerpt,
    keywords: tr.keywords,
    image: { src: post.image.src, alt: tr.imageAlt },
    categoryLabel: tr.categoryLabel,
    body: tr.body,
    faq: tr.faq,
  };
}

export function getLocalizedPost(slug: string, locale: Locale): LocalizedPost | null {
  const post = getBlogPost(slug);
  if (!post) return null;
  return localizePost(post, locale);
}

export function localizedRelated(post: LocalizedPost, locale: Locale, limit = 3): LocalizedPost[] {
  const source = getBlogPost(post.slug);
  if (!source) return [];
  return relatedBlogPosts(source, limit).flatMap((related) => {
    const localized = localizePost(related, locale);
    return localized ? [localized] : [];
  });
}
