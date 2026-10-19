import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

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

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function hostOf(src) {
  if (!src) return "(empty)";
  if (src.startsWith("/")) return "local";
  try {
    return new URL(src).hostname.toLowerCase();
  } catch {
    return "(bad)";
  }
}

const hosts = new Map();
const externals = [];

function tally(src, label) {
  const host = hostOf(src);
  hosts.set(host, (hosts.get(host) ?? 0) + 1);
  if (host !== "local" && !host.endsWith(".supabase.co") && host !== "i.ytimg.com") {
    externals.push({ label, src });
  }
}

const { data: products, error } = await admin.from("products").select("slug, images");
if (error) {
  console.error(error.message);
  process.exit(1);
}
for (const p of products ?? []) {
  for (const src of p.images ?? []) tally(src, p.slug);
}

const { data: variants } = await admin.from("product_variants").select("id, image_url");
for (const v of variants ?? []) {
  if (v.image_url) tally(v.image_url, `variant:${v.id.slice(0, 8)}`);
}

console.log("hosts", Object.fromEntries([...hosts.entries()].sort((a, b) => b[1] - a[1])));
console.log(`external=${externals.length}`);
for (const e of externals) console.log(`  ${e.label}  ${e.src}`);
