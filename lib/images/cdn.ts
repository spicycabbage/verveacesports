const WIDTH_STEPS = [
  160, 240, 320, 400, 480, 640, 750, 828, 1080, 1200, 1600, 1920, 2048,
] as const;

/** Partner CDNs bake size into the filename (`_1000x.png`). `?width=` is ignored until that's stripped. */
const FILENAME_SIZE_SUFFIX =
  /_(?:\d+x\d+|\d+x|pico|icon|thumb|small|compact|medium|large|grande|original|master)(?=\.(?:png|jpe?g|webp|gif|avif)$)/i;

const IMAGE_EXT = /\.(?:png|jpe?g|webp|gif|avif)$/i;

/**
 * Ask the image host for a sized derivative so thumbs don't download the
 * full-res file. Catalog photos are hotlinked from BleeqUp / cart vendors.
 */
export function sizedImageUrl(
  src: string | null | undefined,
  width: number,
): string {
  if (!src) return "";
  if (src.startsWith("/") && !src.startsWith("//")) return src;

  try {
    const url = new URL(src);
    const host = url.hostname.toLowerCase();
    const path = url.pathname;
    const w = snapWidth(width);

    if (!IMAGE_EXT.test(path)) return src;
    if (path.includes("/cdn/shop/videos/")) return src;

    if (host === "i.ytimg.com" || host === "img.youtube.com") {
      return optimizeYoutubeThumb(url, w);
    }

    if (isBleeqImageHost(host, path)) {
      applyFilenameResize(url, w);
      return url.toString();
    }

    if (host.includes("wixstatic.com")) {
      applyWixResize(url, w);
      return url.toString();
    }

    if (host === "images.unsplash.com") {
      url.searchParams.set("w", String(w));
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
    if (!IMAGE_EXT.test(path) || path.includes("/cdn/shop/videos/")) return false;
    return (
      isBleeqImageHost(host, path) ||
      host.includes("wixstatic.com") ||
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

/** BleeqUp product/media hosts (their storefront CDN, not our stack). */
function isBleeqImageHost(host: string, path: string): boolean {
  return (
    host === "www.bleequp.com" ||
    host === "bleequp.com" ||
    host === "cdn.shopify.com" ||
    path.includes("/cdn/shop/files/")
  );
}

function applyFilenameResize(url: URL, width: number): void {
  url.pathname = url.pathname.replace(FILENAME_SIZE_SUFFIX, "");
  url.searchParams.set("width", String(width));
  url.searchParams.set("format", "webp");
}

function applyWixResize(url: URL, width: number): void {
  // enc_avif hangs the first decode on iOS Safari / PWAs. Let Wix pick webp/jpeg.
  const next = `/v1/fit/w_${width},h_${width},q_80,enc_auto,quality_auto`;
  if (/\/v1\/(?:fit|fill)\//.test(url.pathname)) {
    url.pathname = url.pathname.replace(/\/v1\/(?:fit|fill)\/[^/]+/, next);
    return;
  }
  url.searchParams.set("width", String(width));
}

function optimizeYoutubeThumb(url: URL, width: number): string {
  const match = url.pathname.match(/^\/vi(?:_webp)?\/([^/]+)\/[^/]+$/i);
  if (!match?.[1]) return url.toString();
  const file =
    width <= 360 ? "mqdefault.jpg" : width <= 560 ? "hqdefault.jpg" : "sddefault.jpg";
  return `https://i.ytimg.com/vi/${match[1]}/${file}`;
}
