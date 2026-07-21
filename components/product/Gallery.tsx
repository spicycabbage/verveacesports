"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Gallery({
  images,
  alt,
  activeIndex,
  onActiveIndexChange,
}: {
  images: string[];
  alt: string;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
}) {
  const [internalActive, setInternalActive] = useState(0);
  const active = activeIndex ?? internalActive;
  const setActive = onActiveIndexChange ?? setInternalActive;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const safe = images.length > 0 ? images : [""];

  const updateScrollButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 1);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    const ro = new ResizeObserver(updateScrollButtons);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      ro.disconnect();
    };
  }, [updateScrollButtons, safe.length]);

  useEffect(() => {
    thumbRefs.current[active]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [active]);

  function scrollThumbs(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  }

  const showCarouselControls = canScrollPrev || canScrollNext;

  return (
    <div className="space-y-3">
      <div className="relative mx-auto aspect-[5/6] w-full max-h-[min(70vh,560px)] overflow-hidden rounded-xl bg-white sm:aspect-square sm:max-h-none sm:rounded-2xl">
        {safe[active] && (
          <Image
            src={safe[active]}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px"
            className="object-contain sm:object-cover"
            priority
          />
        )}
      </div>
      {safe.length > 1 && (
        <div className="flex items-center gap-1">
          {showCarouselControls && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10 shrink-0"
              disabled={!canScrollPrev}
              onClick={() => scrollThumbs(-1)}
              aria-label="Scroll thumbnails left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <div
            ref={scrollerRef}
            className="flex min-w-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {safe.map((src, idx) => (
              <button
                key={`${src}-${idx}`}
                ref={(el) => {
                  thumbRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => setActive(idx)}
                className="flex shrink-0 snap-center flex-col items-stretch gap-1.5"
                aria-label={`View image ${idx + 1} of ${safe.length}`}
                aria-current={idx === active ? "true" : undefined}
              >
                <span
                  className={cn(
                    "relative size-14 overflow-hidden rounded-md bg-white transition sm:size-[4.5rem]",
                    idx !== active && "hover:opacity-80",
                  )}
                >
                  {src && (
                    <Image src={src} alt="" fill sizes="72px" className="object-cover" />
                  )}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "h-0.5 w-full rounded-full",
                    idx === active ? "bg-black/80" : "bg-transparent",
                  )}
                />
              </button>
            ))}
          </div>
          {showCarouselControls && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10 shrink-0"
              disabled={!canScrollNext}
              onClick={() => scrollThumbs(1)}
              aria-label="Scroll thumbnails right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
