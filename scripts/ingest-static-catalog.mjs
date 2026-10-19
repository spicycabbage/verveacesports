import { mkdirSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

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

const ROOT = join(process.cwd(), "public", "catalog");
const MAX_EDGE = 1600;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const NAV_SLUGS = [
  "bleequp-rover-ai-sports-glasses",
  "bleequp-rover-ai-sports-glasses-bundle",
  "bleequp-ranger-standard-lens",
  "bleequp-ranger-zeiss-lens",
  "bleequp-ranger-ultimate-bundle",
  "bleequp-rover-power-plus",
  "bleequp-rover-zeiss-lens",
  "bleequp-rover-photochromic-lens",
  "bleequp-rover-polarized-lens",
  "bleequp-power-plus",
];

const CATEGORY = {
  "ai-glasses":
    "https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Ranger_Black_Standard_Lens.jpg?v=1781082522",
  wearables:
    "https://cdn.shopify.com/s/files/1/0674/8527/0213/files/Bleequp_Power_Plus_Hero_Image.jpg?v=1776843169",
  "electric-carts":
    "https://static.wixstatic.com/media/6df5bf_2e142104e9de400ea6e254dc5a6e6abd~mv2.webp",
  "golf-gear":
    "https://static.wixstatic.com/media/6df5bf_35adbccb049948a791758b5e5a526a5c~mv2.webp",
};

const RANGER_POSTERS = [
  [
    "hero",
    "https://www.bleequp.com/cdn/shop/files/preview_images/9e8a190539d5437c9c118137f12a5c34.thumbnail.0000000000_1000x.jpg?v=1782793329",
  ],
  ["9e8a190539d5437c9c118137f12a5c34", "https://www.bleequp.com/cdn/shop/files/preview_images/9e8a190539d5437c9c118137f12a5c34.thumbnail.0000000000_1000x.jpg?v=1782793329"],
  ["12fd2385af704bd9a8a921f7e93a5873", "https://www.bleequp.com/cdn/shop/files/preview_images/12fd2385af704bd9a8a921f7e93a5873.thumbnail.0000000000_small.jpg?v=1780996187"],
  ["8fd49ec29d6a4255a51b2fe7ea19ee42", "https://www.bleequp.com/cdn/shop/files/preview_images/8fd49ec29d6a4255a51b2fe7ea19ee42.thumbnail.0000000000_small.jpg?v=1776213628"],
  ["a660a6ef1bcc44e6bfdd1453a21a3662", "https://www.bleequp.com/cdn/shop/files/preview_images/a660a6ef1bcc44e6bfdd1453a21a3662.thumbnail.0000000000_small.jpg?v=1776654789"],
  ["a69904470cc64080bbb86ec72a85d7cc", "https://www.bleequp.com/cdn/shop/files/preview_images/a69904470cc64080bbb86ec72a85d7cc.thumbnail.0000000000_small.jpg?v=1780996228"],
  ["eee10c38eeb74cec9a65a5b3796f5af1", "https://www.bleequp.com/cdn/shop/files/preview_images/eee10c38eeb74cec9a65a5b3796f5af1.thumbnail.0000000000_small.jpg?v=1776234813"],
  ["10b848bc446740a7874e92f06e1ba090", "https://www.bleequp.com/cdn/shop/files/preview_images/10b848bc446740a7874e92f06e1ba090.thumbnail.0000000000_small.jpg?v=1774433018"],
  ["12fe6e3576304c69b61fbbc66d227d1e", "https://www.bleequp.com/cdn/shop/files/preview_images/12fe6e3576304c69b61fbbc66d227d1e.thumbnail.0000000000_1000x.jpg?v=1765165749"],
  ["3d1158472e4d467ab9dbe510dea6d88d", "https://www.bleequp.com/cdn/shop/files/preview_images/3d1158472e4d467ab9dbe510dea6d88d.thumbnail.0000000000_1000x.jpg?v=1765165866"],
  ["add0713170824bc8b0aeede7af7cb318", "https://www.bleequp.com/cdn/shop/files/preview_images/add0713170824bc8b0aeede7af7cb318.thumbnail.0000000000_1000x.jpg?v=1765165960"],
  ["abb6633d6bcc42df98f56c30162cc38b", "https://www.bleequp.com/cdn/shop/files/preview_images/abb6633d6bcc42df98f56c30162cc38b.thumbnail.0000000000_1000x.jpg?v=1765166303"],
  ["4908d9062d984d5db5f2510089181454", "https://www.bleequp.com/cdn/shop/files/preview_images/4908d9062d984d5db5f2510089181454.thumbnail.0000000000_1000x.jpg?v=1765166029"],
  ["e55483a47cbe4d7eb1439090f77242ac", "https://www.bleequp.com/cdn/shop/files/preview_images/e55483a47cbe4d7eb1439090f77242ac.thumbnail.0000000000_1000x.jpg?v=1765166103"],
  ["creator-techdaily", "https://www.bleequp.com/cdn/shop/files/BleeqUp_Ranger_AI_Sports_Camera_Glasses-_They_Can_Do_Everything_1000x.png?v=1780989214"],
  ["creator-grim", "https://www.bleequp.com/cdn/shop/files/20260107-184411_1000x.jpg?v=1767783069"],
  ["creator-corey", "https://www.bleequp.com/cdn/shop/files/20260107-184416_1000x.jpg?v=1767783137"],
  ["creator-android", "https://www.bleequp.com/cdn/shop/files/20260204-162902_1000x.jpg?v=1770193759"],
  ["creator-adam", "https://www.bleequp.com/cdn/shop/files/20260107-184401_1000x.jpg?v=1767782529"],
  ["creator-monkey", "https://www.bleequp.com/cdn/shop/files/Record_Your_Life_The_BleeqUp_Ranger_4-In-1_Sports_Camera_Glasses_1000x.png?v=1772246573"],
  ["creator-mopboyz", "https://www.bleequp.com/cdn/shop/files/20260204-162946_1000x.jpg?v=1770193817"],
  ["creator-joel", "https://www.bleequp.com/cdn/shop/files/I_m_Blown_Away_by_The_BleeqUp_AI_Sports_Camera_Glasses_Next_Level_Creativity_Unlocked_1000x.png?v=1772247024"],
];

async function download(src) {
  const res = await fetch(src, {
    redirect: "follow",
    headers: { "User-Agent": UA, Accept: "image/avif,image/webp,image/*,*/*;q=0.8" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${src}`);
  return Buffer.from(await res.arrayBuffer());
}

async function saveWebp(buf, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  const out = await sharp(buf, { failOn: "none", animated: false })
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toBuffer();
  await writeFile(dest, out);
  return out.length;
}

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: products, error } = await admin.from("products").select("slug, images");
if (error) {
  console.error(error.message);
  process.exit(1);
}
const bySlug = new Map((products ?? []).map((p) => [p.slug, p.images?.[0] ?? null]));

let ok = 0;
let fail = 0;

for (const slug of NAV_SLUGS) {
  const src = bySlug.get(slug);
  const dest = join(ROOT, "nav", `${slug}.webp`);
  if (!src) {
    console.error(`fail nav ${slug}  no product image`);
    fail += 1;
    continue;
  }
  try {
    const bytes = await saveWebp(await download(src), dest);
    console.log(`ok  nav ${slug}  ${(bytes / 1024).toFixed(0)}KB`);
    ok += 1;
  } catch (err) {
    console.error(`fail nav ${slug}  ${err instanceof Error ? err.message : err}`);
    fail += 1;
  }
}

for (const [key, src] of Object.entries(CATEGORY)) {
  const dest = join(ROOT, "categories", `${key}.webp`);
  try {
    const bytes = await saveWebp(await download(src), dest);
    console.log(`ok  category ${key}  ${(bytes / 1024).toFixed(0)}KB`);
    ok += 1;
  } catch (err) {
    console.error(`fail category ${key}  ${err instanceof Error ? err.message : err}`);
    fail += 1;
  }
}

for (const [name, src] of RANGER_POSTERS) {
  const dest = join(ROOT, "ranger", `${name}.webp`);
  try {
    const bytes = await saveWebp(await download(src), dest);
    console.log(`ok  ranger ${name}  ${(bytes / 1024).toFixed(0)}KB`);
    ok += 1;
  } catch (err) {
    console.error(`fail ranger ${name}  ${err instanceof Error ? err.message : err}`);
    fail += 1;
  }
}

console.log(`done ok=${ok} fail=${fail}`);
if (fail) process.exit(1);
