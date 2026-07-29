"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { sizedImageUrl } from "@/lib/images/cdn";
import { cn } from "@/lib/utils";

type YouTubeVideoCardProps = {
  youtubeId: string;
  title: string;
  quote?: string;
  poster: string;
  className?: string;
};

export function YouTubeVideoCard({
  youtubeId,
  title,
  quote,
  poster,
  className,
}: YouTubeVideoCardProps) {
  const [active, setActive] = useState(false);
  const posterSrc = sizedImageUrl(poster, 720);

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm",
        className,
      )}
    >
      <div className="relative aspect-video bg-muted">
        {active ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            className="group relative block h-full w-full"
            onClick={() => setActive(true)}
            aria-label={`Play ${title} on YouTube`}
          >
            <Image
              src={posterSrc}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/35">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                <Play className="h-6 w-6 fill-current pl-0.5" />
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold leading-snug">{title}</h3>
        {quote && (
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">{quote}</p>
        )}
      </div>
    </article>
  );
}
