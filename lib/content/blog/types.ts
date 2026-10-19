/**
 * Inline text in blocks supports `[label](/path)` links and `**bold**`.
 * Internal links must be site-relative so they stay on the current host.
 */
export type BlogBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; caption: string; head: string[]; rows: string[][] }
  | { type: "callout"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string };

import type { BlogAuthor } from "./author";

export type BlogCategory = "Golf" | "AI Glasses";

export type BlogFaq = { q: string; a: string };

export type BlogPost = {
  slug: string;
  /** On-page H1. */
  title: string;
  /** `<title>` — keep ≤ 60 chars; rendered as absolute (no site suffix). */
  metaTitle: string;
  /** Meta description — keep ≤ 155 chars. */
  description: string;
  /** Card / intro teaser. */
  excerpt: string;
  /** ISO date (YYYY-MM-DD), America/Toronto publishing day. */
  publishedAt: string;
  updatedAt?: string;
  category: BlogCategory;
  author: BlogAuthor;
  keywords: string[];
  image: { src: string; alt: string };
  /** Product slugs shown as "shop this article" cards, in order. */
  productSlugs: string[];
  body: BlogBlock[];
  faq: BlogFaq[];
};
