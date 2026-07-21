import fs from "node:fs";

const raw = fs.readFileSync("tmp-product-images.json", "utf8").replace(/^\uFEFF/, "");
const data = JSON.parse(raw);

for (let i = 0; i < data.length; i += 7) {
  const batch = data.slice(i, i + 7);
  const lines = [`-- batch ${i / 7 + 1}`];
  for (const p of batch) {
    const arr = p.images.map((u) => `    '${u.replace(/'/g, "''")}'`).join(",\n");
    lines.push(`update public.products set images = array[\n${arr}\n] where slug = '${p.slug}';`);
  }
  fs.writeFileSync(`supabase/migrations/batch-${i / 7 + 1}.sql`, lines.join("\n\n"));
}

console.log(`wrote ${Math.ceil(data.length / 7)} batches`);
