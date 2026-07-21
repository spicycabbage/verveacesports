import fs from "fs";

const html = await fetch("https://bleequp.com").then((r) => r.text());
const productHtml = await fetch(
  "https://bleequp.com/products/bleequp-ranger-ai-sports-camera-glasses-standard-lens",
).then((r) => r.text());

function extractVideos(html, page) {
  const out = [];
  // video blocks with optional poster
  for (const m of html.matchAll(
    /<video[^>]*poster="([^"]*)"[^>]*>[\s\S]*?<source\s+src="([^"]+\.mp4[^"]*)"/g,
  )) {
    out.push({ poster: m[1].replace(/^\/\//, "https://"), mp4: m[2].replace(/^\/\//, "https://"), page });
  }
  for (const m of html.matchAll(/<source\s+src="([^"]+\.mp4[^"]*)"/g)) {
    out.push({ mp4: m[1].replace(/^\/\//, "https://"), page });
  }
  return out;
}

const all = [...extractVideos(html, "home"), ...extractVideos(productHtml, "product")];

// dedupe by vp uuid
const byId = new Map();
for (const v of all) {
  const id = v.mp4.match(/\/vp\/([a-f0-9-]+)\//i)?.[1];
  if (!id) continue;
  const existing = byId.get(id);
  const prefer = v.mp4.includes("HD-1080p") || !existing?.mp4.includes("HD-1080p");
  if (!existing || prefer) byId.set(id, { ...existing, ...v, id });
}

// testimonial titles from homepage - h3 near video in carousel
const testimonials = [];
for (const m of html.matchAll(
  /<h3[^>]*class="[^"]*"[^>]*>([^<]+)<\/h3>[\s\S]{0,1500}?\/vp\/([a-f0-9-]+)\//gi,
)) {
  testimonials.push({ title: m[1].trim(), id: m[2] });
}

// h2 feature titles on product page
const features = [];
for (const m of productHtml.matchAll(
  /<h2[^>]*>([^<]+)<\/h2>[\s\S]{0,2500}?\/vp\/([a-f0-9-]+)\//gi,
)) {
  features.push({ title: m[1].replace(/&amp;/g, "&").trim(), id: m[2] });
}

const titles = new Map([...testimonials, ...features].map((t) => [t.id, t.title]));

const list = [...byId.values()].map((v) => ({
  id: v.id,
  title: titles.get(v.id) ?? null,
  mp4: v.mp4,
  poster: v.poster ?? null,
  page: v.page,
}));

console.log(JSON.stringify(list, null, 2));
console.log("count", list.length);

fs.writeFileSync("scripts/bleequp-videos.json", JSON.stringify(list, null, 2));
