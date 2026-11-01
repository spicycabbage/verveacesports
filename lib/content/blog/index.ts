import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";
import type { BlogBlock, BlogPost } from "./types";
import { bestElectricGolfPushCartsCanada } from "./posts/best-electric-golf-push-carts-canada";
import { remoteVsFollowMeGolfCaddy } from "./posts/remote-vs-follow-me-golf-caddy";
import { cameraGlassesVsActionCamera } from "./posts/camera-glasses-vs-action-camera";
import { bestSmartGlassesForCycling } from "./posts/best-smart-glasses-for-cycling";
import { walkingGolfElectricTrolleyBenefits } from "./posts/walking-golf-electric-trolley-benefits";
import { prescriptionCameraGlasses } from "./posts/prescription-camera-glasses";
import { golfTrolleyLithiumBatteryWinterStorage } from "./posts/golf-trolley-lithium-battery-winter-storage";
import { flyingWithGolfTrolleyLithiumBattery } from "./posts/flying-with-golf-trolley-lithium-battery";
import { howToUseRemoteControlGolfCaddy } from "./posts/how-to-use-remote-control-golf-caddy";
import { polarizedVsPhotochromicSportLenses } from "./posts/polarized-vs-photochromic-sport-lenses";
import { recordGolfRoundWithCameraGlasses } from "./posts/record-golf-round-with-camera-glasses";

export type { BlogBlock, BlogPost } from "./types";
export {
  BLOG_AUTHORS,
  blogAuthorJsonLd,
  blogAuthorPath,
  getBlogAuthor,
  type BlogAuthor,
} from "./author";

/** Newest first. */
export const BLOG_POSTS: readonly BlogPost[] = [
  recordGolfRoundWithCameraGlasses,
  polarizedVsPhotochromicSportLenses,
  howToUseRemoteControlGolfCaddy,
  flyingWithGolfTrolleyLithiumBattery,
  golfTrolleyLithiumBatteryWinterStorage,
  prescriptionCameraGlasses,
  walkingGolfElectricTrolleyBenefits,
  bestSmartGlassesForCycling,
  cameraGlassesVsActionCamera,
  remoteVsFollowMeGolfCaddy,
  bestElectricGolfPushCartsCanada,
].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

/**
 * Scheduled publishing: a post goes live at midnight Eastern (EST, UTC-5) on
 * its `publishedAt` date. Every blog route reads request headers first, so this
 * is checked per request and scheduled posts appear without a redeploy.
 */
export function blogPublishTime(date: string): number {
  return Date.parse(`${date}T00:00:00-05:00`);
}

export function isBlogPostPublished(post: Pick<BlogPost, "publishedAt">, now: number = Date.now()): boolean {
  return now >= blogPublishTime(post.publishedAt);
}

/** Live posts only, newest first. Use this, not BLOG_POSTS, for anything public. */
export function publishedBlogPosts(now: number = Date.now()): BlogPost[] {
  return BLOG_POSTS.filter((post) => isBlogPostPublished(post, now));
}

/** Null for unknown slugs and for posts scheduled in the future. */
export function getBlogPost(slug: string): BlogPost | null {
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  return post && isBlogPostPublished(post) ? post : null;
}

/** Up to `limit` other live posts, same category first. */
export function relatedBlogPosts(post: BlogPost, limit = 3): BlogPost[] {
  const others = publishedBlogPosts().filter((p) => p.slug !== post.slug);
  return [
    ...others.filter((p) => p.category === post.category),
    ...others.filter((p) => p.category !== post.category),
  ].slice(0, limit);
}

export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function stripInline(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
}

function blockText(block: BlogBlock): string {
  switch (block.type) {
    case "h2":
    case "h3":
    case "p":
    case "callout":
      return block.text;
    case "ul":
    case "ol":
      return block.items.join(" ");
    case "table":
      return [...block.head, ...block.rows.flat()].join(" ");
    case "image":
      return block.caption ?? "";
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

export function blogWordCount(post: Pick<BlogPost, "body" | "faq">): number {
  const text = [
    ...post.body.map(blockText),
    ...post.faq.flatMap((f) => [f.q, f.a]),
  ].join(" ");
  return stripInline(text).split(/\s+/).filter(Boolean).length;
}

export function blogReadingMinutes(post: Pick<BlogPost, "body" | "faq">): number {
  return Math.max(1, Math.round(blogWordCount(post) / 225));
}

/** Publish dates are calendar days; anchor at noon Toronto so no TZ shifts the day. */
export function blogDateIso(date: string): string {
  return `${date}T12:00:00-04:00`;
}

function dateLocale(locale: Locale): string {
  switch (locale) {
    case "en":
      return "en-CA";
    case "nl":
      return "nl-NL";
    case "fr":
      return "fr-CA";
    case "de":
      return "de-DE";
    case "pt-PT":
      return "pt-PT";
    case "es":
      return "es-ES";
    case "it":
      return "it-IT";
    case "ja":
      return "ja-JP";
    case "zh-CN":
      return "zh-CN";
    default: {
      const _exhaustive: never = locale;
      return _exhaustive;
    }
  }
}

export function formatBlogDate(date: string, locale: Locale = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(dateLocale(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Toronto",
  }).format(new Date(blogDateIso(date)));
}
