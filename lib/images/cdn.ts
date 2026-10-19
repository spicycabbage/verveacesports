const WIDTH_STEPS = [
  160, 240, 320, 400, 480, 640, 750, 828, 1080, 1200, 1600, 1920, 2048,
] as const;

const IMAGE_EXT = /\.(?:png|jpe?g|webp|gif|avif)$/i;

/**
 * Size a remote URL that has its own derivative API. Catalog photos are
 * first-party (Supabase /public) and go through /_next/image instead.
 */
export function sizedImageUrl(
  src: string | null | undefined,
  width: number,
  quality = 75,
): string {
  if (!src) return "";
  if (src.startsWith("/") && !src.startsWith("//")) return src;

  try {
    const url = new URL(src);
    const host = url.hostname.toLowerCase();
    const path = url.pathname;
    const w = snapWidth(width);
    const q = Math.min(90, Math.max(40, Math.round(quality)));

    if (!IMAGE_EXT.test(path)) return src;

    if (host === "i.ytimg.com" || host === "img.youtube.com") {
      return optimizeYoutubeThumb(url, w);
    }

    if (host === "images.unsplash.com") {
      url.searchParams.set("w", String(w));
      url.searchParams.set("q", String(q));
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "max");
      return url.toString();
    }
  } catch {
    // relative / malformed — leave alone
  }

  return src;
}

/** True when the origin can emit a sized derivative (skip /_next/image). */
export function usesOriginResize(src: string): boolean {
  try {
    const url = new URL(src);
    const host = url.hostname.toLowerCase();
    const path = url.pathname;
    if (!IMAGE_EXT.test(path)) return false;
    return (
      host === "i.ytimg.com" ||
      host === "img.youtube.com" ||
      host === "images.unsplash.com"
    );
  } catch {
    return false;
  }
}

export function youtubePosterUrl(youtubeId: string, width = 720): string {
  return sizedImageUrl(`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`, width);
}

function snapWidth(width: number): number {
  const w = Math.max(1, Math.round(width));
  return WIDTH_STEPS.find((step) => step >= w) ?? WIDTH_STEPS[WIDTH_STEPS.length - 1];
}

function optimizeYoutubeThumb(url: URL, width: number): string {
  const match = url.pathname.match(/^\/vi(?:_webp)?\/([^/]+)\/[^/]+$/i);
  if (!match?.[1]) return url.toString();
  const file =
    width <= 360 ? "mqdefault.jpg" : width <= 560 ? "hqdefault.jpg" : "sddefault.jpg";
  return `https://i.ytimg.com/vi/${match[1]}/${file}`;
}
