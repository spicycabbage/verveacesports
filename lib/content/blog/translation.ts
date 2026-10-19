import type { BlogBlock, BlogFaq } from "./types";

/** Translated article. Block shape must match the English post exactly. */
export type BlogTranslation = {
  title: string;
  /** Search title. Aim ≤ 60 Latin characters, ≤ 32 for Japanese and Chinese. */
  metaTitle: string;
  /** Meta description. Aim ≤ 155 Latin characters, ≤ 80 for Japanese and Chinese. */
  description: string;
  excerpt: string;
  keywords: string[];
  imageAlt: string;
  categoryLabel: string;
  body: BlogBlock[];
  faq: BlogFaq[];
};
