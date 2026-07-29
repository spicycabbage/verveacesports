import fs from "node:fs";

const reviews = JSON.parse(fs.readFileSync("scripts/judgeme-all.json", "utf8"));

const slugByTitle = {
  "BleeqUp Ranger AI Sports Camera Glasses - Standard Lens": "bleequp-ranger-standard-lens",
  "BleeqUp Ranger AI Sports Camera Glasses - Lenses by Zeiss": "bleequp-ranger-zeiss-lens",
  "BleeqUp Ranger AI Sports Camera Glasses - Ultimate Bundle": "bleequp-ranger-ultimate-bundle",
  "BleeqUp Ranger AI Sports Camera Glasses – Ultimate Bundle": "bleequp-ranger-ultimate-bundle",
};

function esc(s) {
  return String(s ?? "").replace(/'/g, "''");
}

const counts = {};
for (const r of reviews) {
  const slug = slugByTitle[r.productTitle] || "UNKNOWN:" + r.productTitle;
  counts[slug] = (counts[slug] || 0) + 1;
}
console.log(counts);

const values = reviews
  .map((r) => {
    const slug = slugByTitle[r.productTitle];
    if (!slug) throw new Error("unmapped product: " + r.productTitle);
    const title = r.title ? `'${esc(r.title)}'` : "null";
    const created = r.created_at
      ? `'${esc(r.created_at.replace(" UTC", "+00:00").replace(" ", "T"))}'::timestamptz`
      : "now()";
    return `    (
      '${esc(slug)}',
      ${Number(r.rating)},
      ${title},
      '${esc(r.body)}',
      '${esc(r.author)}',
      ${r.verified ? "true" : "false"},
      ${created},
      '${esc(r.id)}'
    )`;
  })
  .join(",\n");

const sql = `-- Re-seed all Judge.me product reviews (39) onto matching catalog products.
-- Idempotent: clears previous legacy imports, then inserts current scrape.

delete from public.product_reviews
where source = 'legacy';

with seed(slug, rating, title, body, author_display_name, is_verified_purchase, created_at, external_id) as (
  values
${values}
)
insert into public.product_reviews (
  product_id,
  user_id,
  order_id,
  rating,
  title,
  body,
  author_display_name,
  is_verified_purchase,
  is_published,
  source,
  created_at
)
select
  p.id,
  null,
  null,
  s.rating,
  s.title,
  s.body,
  s.author_display_name,
  s.is_verified_purchase,
  true,
  'legacy',
  s.created_at
from seed s
join public.products p on p.slug = s.slug;
`;

fs.writeFileSync("supabase/migrations/0029_seed_all_judgeme_reviews.sql", sql);
console.log("wrote migration, reviews:", reviews.length);
