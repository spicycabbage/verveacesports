import fs from "node:fs";

const url =
  "https://www.bleequp.com/products/bleequp-ranger-ai-sports-camera-glasses-standard-lens";

const res = await fetch(url, {
  headers: {
    "User-Agent": "Mozilla/5.0",
    "Accept-Language": "en",
  },
});
const html = await res.text();
fs.writeFileSync("scripts/bleequp-live.html", html);

const authors = [...html.matchAll(/class=['"]jdgm-rev__author['"][^>]*>([^<]+)/g)].map((m) =>
  m[1].trim(),
);
const count = html.match(/data-number-of-reviews=['"](\d+)['"]/)?.[1];
console.log({ status: res.status, len: html.length, count, authors: authors.length, names: authors });

// Try common Judge.me public widget endpoints used by storefront JS
const shop = "84d29d-b9.myshopify.com";
const pid = "8402854674629";
const candidates = [
  `https://judge.me/reviews/reviews_for_widget?url=${encodeURIComponent(url)}&shop_domain=${shop}&platform=shopify&page=1`,
  `https://judge.me/reviews/reviews_for_widget?url=${encodeURIComponent(url)}&shop_domain=${shop}&platform=shopify&page=2`,
  `https://cdnwidget.judge.me/reviews/reviews_for_widget?url=${encodeURIComponent(url)}&shop_domain=${shop}&platform=shopify&page=1`,
  `https://api.judge.me/widgets/product_review?shop_domain=${shop}&external_id=${pid}&page=1&per_page=20`,
  `https://judge.me/reviews/${pid}?format=json`,
];

for (const u of candidates) {
  try {
    const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0", Accept: "*/*" } });
    const t = await r.text();
    console.log("\n", r.status, u.slice(0, 110));
    console.log(t.slice(0, 300).replace(/\s+/g, " "));
  } catch (e) {
    console.log("ERR", e.message, u.slice(0, 80));
  }
}
