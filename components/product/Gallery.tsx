"use client";

import Image from "next/image";
import { useState } from "react";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const safe = images.length > 0 ? images : [""];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        {safe[active] && (
          <Image
            src={safe[active]}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        )}
      </div>
      {safe.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {safe.map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => setActive(idx)}
              className={`relative aspect-square overflow-hidden rounded-md bg-muted ring-offset-2 transition ${idx === active ? "ring-2 ring-primary" : "hover:opacity-80"}`}
              aria-label={`View image ${idx + 1}`}
            >
              {src && (
                <Image src={src} alt="" fill sizes="120px" className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
