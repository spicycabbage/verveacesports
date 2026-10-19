import type { RoverArtDirectedImage, RoverVideo } from "@/lib/content/bleequp-rover";
import { cn } from "@/lib/utils";

const SM_BREAKPOINT = "(min-width: 640px)"; // Tailwind `sm`

export type RoverMedia = RoverVideo | RoverArtDirectedImage;

export function isRoverVideo(media: RoverMedia): media is RoverVideo {
  return "mp4" in media;
}

type Props = {
  image: RoverArtDirectedImage;
  alt: string;
  /** Kept for call-site compatibility; <picture> picks the crop, not a srcset. */
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

/**
 * Art-directed first-party image: one <picture>, so phones never download the
 * desktop crop. Parent must size the box (aspect-* or absolute inset-0).
 */
export function RoverArtImage({
  image,
  alt,
  className,
  imgClassName,
  priority = false,
}: Props) {
  return (
    <picture className={cn("block h-full w-full min-w-0 max-w-full", className)}>
      <source media={SM_BREAKPOINT} srcSet={image.desktop} />
      <img
        src={image.mobile}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={cn("h-full w-full max-w-full object-cover", imgClassName)}
      />
    </picture>
  );
}
