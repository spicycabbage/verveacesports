import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const BUCKET = "product-images";
const MAX_DOWNLOAD_BYTES = 15 * 1024 * 1024;
const MAX_EDGE = 1600;
const CONCURRENCY = 4;

function loadEnv(file) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return;
  }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnv(resolve(process.cwd(), ".env.local"));
loadEnv(resolve(process.cwd(), ".env"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

function isOurs(src) {
  try {
    const host = new URL(src).hostname.toLowerCase();
    return host.endsWith(".supabase.co") || host.includes("supabase");
  } catch {
    return false;
  }
}

function skipUrl(src) {
  if (!src || typeof src !== "string") return true;
  if (!/^https?:\/\//i.test(src)) return true;
  if (isOurs(src)) return true;
  try {
    const host = new URL(src).hostname.toLowerCase();
    if (host === "i.ytimg.com" || host === "img.youtube.com") return true;
  } catch {
    return true;
  }
  return false;
}

async function download(src) {
  const res = await fetch(src, {
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const len = Number(res.headers.get("content-length") ?? 0);
  if (len > MAX_DOWNLOAD_BYTES) throw new Error(`too large (${len})`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_DOWNLOAD_BYTES) throw new Error(`too large (${buf.length})`);
  return buf;
}

async function toWebp(input) {
  return sharp(input, { failOn: "none", animated: false })
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return out;
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: products, error: pErr } = await admin
  .from("products")
  .select("id, slug, name, images");
if (pErr) {
  console.error(pErr.message);
  process.exit(1);
}

const { data: variants, error: vErr } = await admin
  .from("product_variants")
  .select("id, product_id, image_url");
if (vErr) {
  console.error(vErr.message);
  process.exit(1);
}

/** @type {{ kind: "product" | "variant"; id: string; productId: string; label: string; src: string; index?: number }[]} */
const jobs = [];
for (const p of products ?? []) {
  const images = Array.isArray(p.images) ? p.images : [];
  images.forEach((src, index) => {
    if (skipUrl(src)) return;
    jobs.push({
      kind: "product",
      id: p.id,
      productId: p.id,
      label: `${p.slug}[${index}]`,
      src,
      index,
    });
  });
}
for (const v of variants ?? []) {
  if (skipUrl(v.image_url)) continue;
  jobs.push({
    kind: "variant",
    id: v.id,
    productId: v.product_id,
    label: `variant:${v.id.slice(0, 8)}`,
    src: v.image_url,
  });
}

console.log(`external images to ingest: ${jobs.length}`);

const hostedByJob = new Map();
let ok = 0;
let fail = 0;

await mapPool(jobs, CONCURRENCY, async (job) => {
  try {
    const raw = await download(job.src);
    const webp = await toWebp(raw);
    const path = `${job.productId}/${crypto.randomUUID()}.webp`;
    const { error: upErr } = await admin.storage.from(BUCKET).upload(path, webp, {
      contentType: "image/webp",
      cacheControl: String(60 * 60 * 24 * 365),
      upsert: false,
    });
    if (upErr) throw new Error(upErr.message);
    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
    hostedByJob.set(job, pub.publicUrl);
    ok += 1;
    console.log(`ok  ${job.label}`);
  } catch (err) {
    fail += 1;
    console.error(`fail ${job.label}  ${job.src}  ${err instanceof Error ? err.message : err}`);
  }
});

const productsById = new Map((products ?? []).map((p) => [p.id, p]));
const productUpdates = new Map();
for (const job of jobs) {
  const hosted = hostedByJob.get(job);
  if (!hosted || job.kind !== "product") continue;
  const current = productUpdates.get(job.productId) ?? [
    ...((productsById.get(job.productId)?.images ?? [])),
  ];
  if (typeof job.index === "number") current[job.index] = hosted;
  productUpdates.set(job.productId, current);
}

for (const [productId, images] of productUpdates) {
  const { error } = await admin.from("products").update({ images }).eq("id", productId);
  if (error) {
    fail += 1;
    console.error(`fail update product ${productId}  ${error.message}`);
  }
}

for (const job of jobs) {
  const hosted = hostedByJob.get(job);
  if (!hosted || job.kind !== "variant") continue;
  const { error } = await admin
    .from("product_variants")
    .update({ image_url: hosted })
    .eq("id", job.id);
  if (error) {
    fail += 1;
    console.error(`fail update ${job.label}  ${error.message}`);
  }
}

console.log(`done. uploaded=${ok} failed=${fail}`);
if (fail) process.exit(1);
