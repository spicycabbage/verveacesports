import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { SiteId } from "./config";
import { getSite } from "./get-site";
import { sitePwaChrome } from "./pwa";

const PNG_CACHE = "public, max-age=3600, stale-while-revalidate=86400";

const VERVEACE_SIZES = [32, 180, 192, 512] as const;
const VERVEACE_MASKABLE = [192, 512] as const;

function closest(size: number, allowed: readonly number[]): number {
  return allowed.reduce((best, n) =>
    Math.abs(n - size) < Math.abs(best - size) ? n : best,
  );
}

function verveaceIconPath(size: number, maskable?: boolean): string {
  const picked = maskable
    ? closest(size, VERVEACE_MASKABLE)
    : closest(size, VERVEACE_SIZES);
  const name = maskable
    ? `verveace-${picked}-maskable.png`
    : `verveace-${picked}.png`;
  return path.join(process.cwd(), "public", "icons", name);
}

function pngResponse(png: Buffer): Response {
  return new Response(Uint8Array.from(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": PNG_CACHE,
    },
  });
}

export async function appleTouchIconGET(): Promise<Response> {
  const site = await getSite();
  return brandLogoIconResponse(site.id, 180);
}

/** Host-aware PWA / apple-touch PNG. Verveace is a pre-rendered VA mark (no sharp at runtime). */
export async function brandLogoIconResponse(
  siteId: SiteId,
  size: number,
  opts?: { maskable?: boolean },
): Promise<Response> {
  switch (siteId) {
    case "verveace":
      return pngResponse(await readFile(verveaceIconPath(size, opts?.maskable)));
    case "bleeq-ca":
      return bleeqWordmarkIcon(size, opts);
    case "volt-ca":
      return voltWordmarkIcon(size, opts);
    default: {
      const _exhaustive: never = siteId;
      return _exhaustive;
    }
  }
}

/** Next.js `app/icon.tsx` must return ImageResponse, not a raw PNG Response. */
export async function brandLogoImageResponse(
  siteId: SiteId,
  size: number,
): Promise<ImageResponse> {
  switch (siteId) {
    case "verveace": {
      const png = await readFile(verveaceIconPath(size, false));
      const src = `data:image/png;base64,${png.toString("base64")}`;
      return new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
            }}
          >
            <img src={src} width={size} height={size} alt="" />
          </div>
        ),
        { width: size, height: size },
      );
    }
    case "bleeq-ca":
      return bleeqWordmarkIcon(size);
    case "volt-ca":
      return voltWordmarkIcon(size);
    default: {
      const _exhaustive: never = siteId;
      return _exhaustive;
    }
  }
}

async function voltWordmarkIcon(
  size: number,
  opts?: { maskable?: boolean },
): Promise<ImageResponse> {
  const { backgroundColor } = sitePwaChrome("volt-ca");
  const png = await readFile(path.join(process.cwd(), "public", "volt-caddy-logo.png"));
  const src = `data:image/png;base64,${png.toString("base64")}`;
  const pad = opts?.maskable ? 0.18 : 0.08;
  const imgW = Math.round(size * (1 - pad * 2));
  const imgH = Math.round(imgW / 6.15);
  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: backgroundColor,
        }}
      >
        <img src={src} width={imgW} height={imgH} alt="" />
      </div>
    ),
    { width: size, height: size },
  );
  image.headers.set("Cache-Control", PNG_CACHE);
  return image;
}

async function bleeqWordmarkIcon(
  size: number,
  opts?: { maskable?: boolean },
): Promise<ImageResponse> {
  const { backgroundColor } = sitePwaChrome("bleeq-ca");
  const svg = await readFile(path.join(process.cwd(), "public", "bleeq-logo.svg"));
  const src = `data:image/svg+xml;base64,${svg.toString("base64")}`;
  const pad = opts?.maskable ? 0.2 : 0.1;
  const imgW = Math.round(size * (1 - pad * 2));
  const imgH = Math.round(imgW * (170 / 627));
  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: backgroundColor,
        }}
      >
        <img src={src} width={imgW} height={imgH} alt="" />
      </div>
    ),
    { width: size, height: size },
  );
  image.headers.set("Cache-Control", PNG_CACHE);
  return image;
}
