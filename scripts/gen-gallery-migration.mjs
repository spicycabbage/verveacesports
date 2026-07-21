import fs from "node:fs";

const raw = fs.readFileSync("tmp-product-images.json", "utf8").replace(/^\uFEFF/, "");
const data = JSON.parse(raw);
const lines = [
  "-- Backfill full Insanity Golf product galleries (multiple images per product).",
  "",
];

for (const p of data) {
  const arr = p.images.map((u) => `    '${u.replace(/'/g, "''")}'`).join(",\n");
  lines.push(`update public.products set images = array[\n${arr}\n] where slug = '${p.slug}';`);
  lines.push("");
}

fs.writeFileSync("supabase/migrations/0012_insanity_golf_galleries.sql", lines.join("\n"));
console.log(`wrote migration with ${data.length} products`);
