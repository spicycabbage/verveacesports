import type { Locale } from "@/lib/i18n/locale";
import { BLOG_POSTS } from "../index";
import type { BlogBlock, BlogPost } from "../types";
import type { BlogTranslation } from "../translation";
import { de } from "./de";
import { es } from "./es";
import { fr } from "./fr";
import { it } from "./it";
import { ja } from "./ja";
import { nl } from "./nl";
import { ptPT } from "./pt-PT";
import { zhCN } from "./zh-CN";
import { deNov2026 } from "./nov-2026/de";
import { esNov2026 } from "./nov-2026/es";
import { frNov2026 } from "./nov-2026/fr";
import { itNov2026 } from "./nov-2026/it";
import { jaNov2026 } from "./nov-2026/ja";
import { nlNov2026 } from "./nov-2026/nl";
import { ptPTNov2026 } from "./nov-2026/pt-PT";
import { zhCNNov2026 } from "./nov-2026/zh-CN";

export const BLOG_TRANSLATIONS: Record<Exclude<Locale, "en">, Record<string, BlogTranslation>> = {
  nl: { ...nl, ...nlNov2026 },
  fr: { ...fr, ...frNov2026 },
  de: { ...de, ...deNov2026 },
  es: { ...es, ...esNov2026 },
  it: { ...it, ...itNov2026 },
  "pt-PT": { ...ptPT, ...ptPTNov2026 },
  ja: { ...ja, ...jaNov2026 },
  "zh-CN": { ...zhCN, ...zhCNNov2026 },
};

function sameShape(en: BlogBlock, tr: BlogBlock): boolean {
  if (en.type !== tr.type) return false;
  switch (en.type) {
    case "h2":
    case "h3":
    case "p":
    case "callout":
      return tr.type === en.type;
    case "ul":
    case "ol":
      return tr.type === en.type && tr.items.length === en.items.length;
    case "table":
      return (
        tr.type === "table" &&
        tr.head.length === en.head.length &&
        tr.rows.length === en.rows.length &&
        tr.rows.every((row, i) => row.length === en.rows[i].length)
      );
    case "image":
      return tr.type === "image";
    default: {
      const _exhaustive: never = en;
      return _exhaustive;
    }
  }
}

/**
 * Translations are optional per post: a new English post can ship before its
 * translations. A translation that does exist must match the English shape.
 */
function assertTranslation(locale: string, post: BlogPost, tr: BlogTranslation | undefined) {
  if (!tr) return;
  if (tr.body.length !== post.body.length || tr.body.some((block, i) => !sameShape(post.body[i], block))) {
    throw new Error(`Blog translation shape mismatch: ${locale} / ${post.slug}`);
  }
  if (tr.faq.length !== post.faq.length) {
    throw new Error(`Blog translation FAQ mismatch: ${locale} / ${post.slug}`);
  }
}

for (const [locale, map] of Object.entries(BLOG_TRANSLATIONS)) {
  for (const post of BLOG_POSTS) assertTranslation(locale, post, map[post.slug]);
}

/** English plus every locale that has a blog (at least one translated post). */
export function blogLocalesFor(): Locale[] {
  return [
    "en",
    ...(Object.keys(BLOG_TRANSLATIONS) as Exclude<Locale, "en">[]).filter(
      (locale) => Object.keys(BLOG_TRANSLATIONS[locale]).length > 0,
    ),
  ];
}

/** English plus every locale that has a translation of this post. */
export function blogLocalesForPost(slug: string): Locale[] {
  return [
    "en",
    ...(Object.keys(BLOG_TRANSLATIONS) as Exclude<Locale, "en">[]).filter(
      (locale) => Boolean(BLOG_TRANSLATIONS[locale][slug]),
    ),
  ];
}
