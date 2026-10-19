"use client";

import { useState } from "react";
import { NativeVideoPlayer } from "@/components/product/ai-glasses/NativeVideoPlayer";
import { RoverArtImage, isRoverVideo, type RoverMedia } from "./RoverArtImage";
import { cn } from "@/lib/utils";

export type RoverMediaTabItem = {
  key: string;
  tab: string;
  title: string;
  body: string;
  media: RoverMedia;
};

type Props = {
  items: RoverMediaTabItem[];
  /** Media slot aspect: feature clips are 16:9, AI UI captures are taller. */
  aspect?: "video" | "square";
  className?: string;
};

/**
 * Scrollable pill tabs + one mounted media panel. Only the active clip is in
 * the DOM, so a 7-tab section never fetches seven MP4s.
 */
export function RoverMediaTabs({ items, aspect = "video", className }: Props) {
  const [activeKey, setActiveKey] = useState(items[0]?.key ?? "");
  const active = items.find((item) => item.key === activeKey) ?? items[0];
  if (!active) return null;

  return (
    <div className={cn("min-w-0 max-w-full space-y-6", className)}>
      <div
        role="tablist"
        aria-label={active.title}
        className="flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] sm:flex-wrap sm:justify-center [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const selected = item.key === active.key;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveKey(item.key)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {item.tab}
            </button>
          );
        })}
      </div>

      <div className="grid min-w-0 items-center gap-6 lg:grid-cols-5 lg:gap-10">
        <div className="min-w-0 lg:col-span-3">
          {isRoverVideo(active.media) ? (
            <NativeVideoPlayer
              key={active.key}
              src={active.media.mp4}
              poster={active.media.poster}
              title={active.title}
              autoPlay
              className={aspect === "square" ? "aspect-square sm:aspect-[4/3]" : undefined}
            />
          ) : (
            <div
              className={cn(
                "relative min-w-0 overflow-hidden rounded-xl bg-muted",
                aspect === "square" ? "aspect-square sm:aspect-[4/3]" : "aspect-video",
              )}
            >
              <RoverArtImage
                key={active.key}
                image={active.media}
                alt={active.title}
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </div>
          )}
        </div>
        <div className="space-y-3 lg:col-span-2" role="tabpanel">
          <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{active.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{active.body}</p>
        </div>
      </div>
    </div>
  );
}
