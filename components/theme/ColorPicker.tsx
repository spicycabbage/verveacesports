"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { hexToHsv, hsvToHex, type Hsv } from "@/lib/theme/color";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function readPointer(
  event: ReactPointerEvent<HTMLDivElement>,
  el: HTMLDivElement,
): { x: number; y: number } {
  const rect = el.getBoundingClientRect();
  return {
    x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
    y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
  };
}

export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value));
  const lastEmitted = useRef(value.toLowerCase());

  // Resync from outside (preset/swatch click) without clobbering active drag.
  useEffect(() => {
    if (value.toLowerCase() !== lastEmitted.current) {
      setHsv(hexToHsv(value));
      lastEmitted.current = value.toLowerCase();
    }
  }, [value]);

  function emit(next: Hsv) {
    setHsv(next);
    const hex = hsvToHex(next);
    lastEmitted.current = hex.toLowerCase();
    onChange(hex);
  }

  function onFieldPointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.type === "pointermove" && event.buttons !== 1) return;
    const { x, y } = readPointer(event, event.currentTarget);
    emit({ h: hsv.h, s: x, v: 1 - y });
  }

  function onHuePointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.type === "pointermove" && event.buttons !== 1) return;
    const { x } = readPointer(event, event.currentTarget);
    emit({ h: x * 360, s: hsv.s, v: hsv.v });
  }

  const hueHex = hsvToHex({ h: hsv.h, s: 1, v: 1 });
  const current = hsvToHex(hsv);

  return (
    <div className="space-y-2.5">
      <div
        role="slider"
        aria-label="Saturation and brightness"
        aria-valuetext={current}
        tabIndex={0}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          onFieldPointer(event);
        }}
        onPointerMove={onFieldPointer}
        className="relative h-36 w-full cursor-crosshair touch-none rounded-lg"
        style={{ backgroundColor: hueHex }}
      >
        <div
          className="absolute inset-0 rounded-lg"
          style={{ background: "linear-gradient(to right, #fff, rgba(255,255,255,0))" }}
        />
        <div
          className="absolute inset-0 rounded-lg"
          style={{ background: "linear-gradient(to top, #000, rgba(0,0,0,0))" }}
        />
        <span
          className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
          style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, backgroundColor: current }}
        />
      </div>

      <div
        role="slider"
        aria-label="Hue"
        aria-valuenow={Math.round(hsv.h)}
        aria-valuemin={0}
        aria-valuemax={360}
        tabIndex={0}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          onHuePointer(event);
        }}
        onPointerMove={onHuePointer}
        className="relative h-4 w-full cursor-pointer touch-none rounded-full"
        style={{
          background:
            "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
        }}
      >
        <span
          className="pointer-events-none absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
          style={{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: hueHex }}
        />
      </div>
    </div>
  );
}
