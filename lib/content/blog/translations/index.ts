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

export const BLOG_TRANSLATIONS: Record<Exclude<Locale, "en">, Record<string, BlogTranslation>> = {
  nl,
  fr,
  de,
  es,
  it,
  "pt-PT": ptPT,
  ja,
  "zh-CN": zhCN,
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

function assertTranslation(locale: string, post: BlogPost, tr: BlogTranslation | undefined) {
  if (!tr) throw new Error(`Blog translation missing: ${locale} / ${post.slug}`);
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

/** English plus every locale that has a full translation. */
export function blogLocalesFor(): Locale[] {
  return ["en", ...(Object.keys(BLOG_TRANSLATIONS) as Exclude<Locale, "en">[])];
}
