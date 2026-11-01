import type { BlogCategory } from "./types";

/**
 * English-only category hubs at /blog/category/{slug}. Translated blogs keep a
 * single index per language, so these pages carry no hreflang alternates.
 */
export type BlogCategoryInfo = {
  category: BlogCategory;
  slug: string;
  /** On-page H1. */
  title: string;
  /** `<title>`, rendered as absolute. Keep ≤ 60 chars. */
  metaTitle: string;
  /** Meta description. Keep ≤ 155 chars. */
  description: string;
  /** Intro paragraph under the H1. Supports nothing inline; plain text. */
  intro: string;
  shopHref: string;
  shopLabel: string;
};

export const BLOG_CATEGORIES: readonly BlogCategoryInfo[] = [
  {
    category: "Golf",
    slug: "golf",
    title: "Electric Golf Cart & Trolley Guides",
    metaTitle: "Electric Golf Cart & Trolley Guides | VerveaceSports",
    description:
      "Buyer's guides, how-tos, and care tips for electric golf push carts, remote caddies, and lithium trolley batteries, written for Canadian golfers.",
    intro:
      "Everything we've written about walking the course with an electric golf cart: how to choose between remote, follow-me, and push-button trolleys, how to look after a lithium battery through a Canadian winter, and how to get the most out of a remote caddy once it's yours.",
    shopHref: "/products?category=electric-carts",
    shopLabel: "Shop electric golf carts",
  },
  {
    category: "AI Glasses",
    slug: "ai-glasses",
    title: "AI Sports Glasses & Camera Glasses Guides",
    metaTitle: "AI Sports & Camera Glasses Guides | VerveaceSports",
    description:
      "Guides to AI sports camera glasses: filming POV video, choosing lenses, prescription options, and BleeqUp Rover vs. Ranger for cycling and golf.",
    intro:
      "Practical guides to camera glasses and AI sports glasses: how they compare with action cameras, which lens to ride with, how prescription inserts work, and how to film your sport hands-free with BleeqUp Rover and Ranger.",
    shopHref: "/products?category=ai-glasses",
    shopLabel: "Shop AI sports glasses",
  },
];

export function blogCategoryInfo(category: BlogCategory): BlogCategoryInfo {
  const info = BLOG_CATEGORIES.find((c) => c.category === category);
  if (!info) throw new Error(`Unknown blog category: ${category}`);
  return info;
}

export function blogCategoryBySlug(slug: string): BlogCategoryInfo | null {
  return BLOG_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

/** English-only hub URL. */
export function blogCategoryPath(slug: string): string {
  return `/blog/category/${slug}`;
}
