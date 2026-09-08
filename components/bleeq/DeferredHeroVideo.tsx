"use client";

import { useEffect, useState } from "react";

type DeferredHeroVideoProps = {
  src: string;
  poster?: string;
  title: string;
  className?: string;
};

/** Paint the poster first; attach the MP4 after idle so LCP isn't a multi-MB video. */
export function DeferredHeroVideo({
  src,
  poster,
  title,
  className,
}: DeferredHeroVideoProps) {
  const [canLoad, setCanLoad] = useState(false);

  useEffect(() => {
    const arm = () => setCanLoad(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(arm, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(arm, 400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <video
      className={className}
      poster={poster}
      src={canLoad ? src : undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-label={title}
    />
  );
}
