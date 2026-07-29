"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 4000;
const FADE_MS = 280;
const MAX_PX = 27;
const MIN_PX = 11;

type Props = {
  lineA: string;
  lineB: string;
};

export function HomeHeroMobileHeadline({ lineA, lineB }: Props) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLHeadingElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [fontPx, setFontPx] = useState(MAX_PX);
  const [scale, setScale] = useState(1);

  const isPrimary = index === 1;
  const text = `${isPrimary ? lineB : lineA}.`;

  useLayoutEffect(() => {
    const container = containerRef.current;
    const el = measureRef.current;
    if (!container || !el) return;

    const fit = () => {
      const available = container.clientWidth;
      if (available <= 0) return;

      // Measure at full size without scale affecting layout width.
      el.style.fontSize = `${MAX_PX}px`;
      el.style.transform = "translateX(-50%)";

      let size = MAX_PX;
      while (size > MIN_PX && el.scrollWidth > available) {
        size -= 1;
        el.style.fontSize = `${size}px`;
      }

      const nextScale = el.scrollWidth > available ? available / el.scrollWidth : 1;
      setFontPx(size);
      setScale(nextScale);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(container);
    return () => ro.disconnect();
  }, [text]);

  useEffect(() => {
    let fadeTimeout = 0;
    const id = window.setInterval(() => {
      setVisible(false);
      fadeTimeout = window.setTimeout(() => {
        setIndex((i) => (i === 0 ? 1 : 0));
        setVisible(true);
      }, FADE_MS);
    }, INTERVAL_MS);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(fadeTimeout);
    };
  }, []);

  return (
    <h1
      ref={containerRef}
      className={cn(
        "relative w-full min-w-0 max-w-full overflow-x-hidden text-center font-bold tracking-tight",
        "transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
        isPrimary ? "text-primary" : "text-foreground",
      )}
      style={{ height: Math.ceil(fontPx * 1.25 * scale) }}
    >
      <span
        ref={measureRef}
        className="absolute top-0 left-1/2 whitespace-nowrap will-change-transform"
        style={{
          fontSize: fontPx,
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: "center top",
        }}
      >
        {text}
      </span>
    </h1>
  );
}
