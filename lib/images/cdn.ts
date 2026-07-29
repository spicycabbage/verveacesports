/**
 * Ask CDNs for a sized derivative before Next.js Image Optimization fetches.
 * Cuts origin bytes for Shopify / BleeqUp / Wix / YouTube images on both sites.
 */
export function sizedImageUrl(
  src: string | null | undefined,
  width: number,
): string {
  if (!src) return "";
  if (src.startsWith("/")) return src;

  try {
    const url = new URL(src);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.toLowerCase();
    const w = Math.max(1, Math.round(width));

    if (host === "i.ytimg.com" || host === "img.youtube.com") {
      return optimizeYoutubeThumb(url, w);
    }

    const isShopify =
      host.includes("shopify.com") ||
      host === "www.bleequp.com" ||
      path.includes("/cdn/shop/");
    const isWix = host.includes("wixstatic.com");

    if (isShopify || isWix) {
      url.searchParams.set("width", String(w));
      if (isShopify && !url.searchParams.has("format")) {
        url.searchParams.set("format", "webp");
      }
      return url.toString();
    }
  } catch {
    // relative / malformed — leave alone
  }

  return src;
}

/** YouTube thumbnail URL sized for the display slot (jpg; Next re-encodes). */
export function youtubePosterUrl(
  youtubeId: string,
  width = 720,
): string {
  return sizedImageUrl(
    `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    width,
  );
}

function optimizeYoutubeThumb(url: URL, width: number): string {
  const match = url.pathname.match(/^\/vi(?:_webp)?\/([^/]+)\/[^/]+$/i);
  if (!match?.[1]) return url.toString();

  // mq 320 · hq 480 · sd 640 — maxres often 404s, skip it
  const file =
    width <= 360 ? "mqdefault.jpg" : width <= 560 ? "hqdefault.jpg" : "sddefault.jpg";

  return `https://i.ytimg.com/vi/${match[1]}/${file}`;
}
