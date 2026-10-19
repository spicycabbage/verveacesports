// Not wired. next.config must keep images.loader at "default".
// A custom loader makes Next answer /_next/image with the 404 page, and every
// catalog photo is requested from that route.
import type { ImageLoaderProps } from "next/image";
import { sizedImageUrl, usesOriginResize } from "@/lib/images/cdn";

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return src;
  // SVGs aren't rasterized by the optimizer; serve as-is.
  if (/\.svg(?:$|\?)/i.test(src)) return src;

  if (usesOriginResize(src)) {
    return sizedImageUrl(src, width, quality ?? 75);
  }

  // Local /public assets and remote hosts without their own resizer go through
  // Next's optimizer (AVIF/WebP, resized per srcset entry).
  const params = new URLSearchParams({
    url: src,
    w: String(width),
    q: String(quality ?? 75),
  });
  return `/_next/image?${params.toString()}`;
}
