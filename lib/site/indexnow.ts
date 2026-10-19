import { after } from "next/server";
import { SITES } from "./config";
import { siteAbsoluteUrl, siteBaseUrl } from "./seo";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const KEY_RE = /^[a-zA-Z0-9-]{8,128}$/;

export const INDEXNOW_KEY_PATH = "/indexnow.txt";

export function indexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim();
  return key && KEY_RE.test(key) ? key : null;
}

/**
 * Tells Bing (and through it ChatGPT search / Copilot / DuckDuckGo), Yandex,
 * Seznam, and Naver that VerveaceSports URLs changed. Runs after the response.
 * Production only: previews would resubmit canonical URLs nothing changed on.
 */
export function submitToIndexNow(paths: readonly string[]): void {
  const key = indexNowKey();
  if (!key || process.env.VERCEL_ENV !== "production" || paths.length === 0) return;

  const site = SITES.verveace;
  const base = siteBaseUrl(site);
  const body = JSON.stringify({
    host: new URL(base).host,
    key,
    keyLocation: `${base}${INDEXNOW_KEY_PATH}`,
    urlList: [...new Set(paths)].map((path) => siteAbsoluteUrl(site, path)),
  });

  after(async () => {
    try {
      const res = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body,
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) console.warn(`[indexnow] ${res.status} ${await res.text()}`);
    } catch (err) {
      console.warn("[indexnow]", err);
    }
  });
}

export function submitProductToIndexNow(slug: string): void {
  submitToIndexNow([`/products/${slug}`, "/products", "/"]);
}
