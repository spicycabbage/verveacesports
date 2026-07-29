const shop = "84d29d-b9.myshopify.com";
const productId = "8402854674629";
const updatedAt = Date.parse("2026-07-15T09:21:27Z") / 1000;
const platforms = ["shopify", undefined];
const hosts = [
  "https://api.judge.me/reviews/reviews_for_widget",
  "https://cdn.judge.me/reviews/reviews_for_widget",
];

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function parseReviews(html) {
  const parts = html.split(/data-review-id='/).slice(1);
  return parts.map((part) => {
    const id = part.slice(0, part.indexOf("'"));
    const chunk = part.slice(0, 5000);
    const author = chunk.match(/class='jdgm-rev__author'[^>]*>([^<]+)/)?.[1] || "Anonymous";
    const title = chunk.match(/class='jdgm-rev__title'[^>]*>([^<]*)/)?.[1] || "";
    const body = chunk.match(/class='jdgm-rev__body'[^>]*><p>([\s\S]*?)<\/p>/)?.[1] || "";
    const rating = Number(chunk.match(/data-score='(\d+(?:\.\d+)?)'/)?.[1] || 0);
    const productTitle = chunk.match(/data-product-title='([^']*)'/)?.[1] || "";
    const created = chunk.match(/data-content='([^']+)'/)?.[1] || null;
    const verified = /jdgm-rev__buyer-badge/.test(chunk.slice(0, 1500));
    return {
      id,
      author: decode(author),
      title: decode(title) || null,
      body: decode(body.replace(/<[^>]+>/g, "")),
      rating,
      productTitle: decode(productTitle),
      created_at: created,
      verified,
    };
  });
}

const all = [];
for (const host of hosts) {
  for (const platform of platforms) {
    for (let page = 1; page <= 10; page++) {
      const params = new URLSearchParams({
        url: shop,
        shop_domain: shop,
        product_id: productId,
        per_page: "5",
        page: String(page),
        ts: String(Math.floor(updatedAt)),
      });
      if (platform) params.set("platform", platform);
      const u = `${host}?${params}`;
      const r = await fetch(u, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json, text/javascript, */*; q=0.01",
          Referer: "https://www.bleequp.com/",
          Origin: "https://www.bleequp.com",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      const text = await r.text();
      let html = text;
      let total = null;
      try {
        const json = JSON.parse(text);
        html = json.html || "";
        total = json.total_count ?? json.number_of_reviews ?? null;
        console.log(r.status, host.includes("cdn") ? "cdn" : "api", "plat", platform, "page", page, "total", total, "htmlLen", html.length);
      } catch {
        console.log(r.status, host.includes("cdn") ? "cdn" : "api", "plat", platform, "page", page, "raw", text.slice(0, 80).replace(/\s+/g, " "));
        break;
      }
      if (!html || r.status >= 400) break;
      const parsed = parseReviews(html);
      console.log("  got", parsed.length, parsed.map((x) => x.author).join(", "));
      all.push(...parsed);
      if (parsed.length === 0) break;
      if (total && all.length >= total) break;
    }
    if (all.length > 5) break;
  }
  if (all.length > 5) break;
}

// dedupe
const uniq = [];
const seen = new Set();
for (const r of all) {
  const key = r.id || `${r.author}|${r.body}`;
  if (seen.has(key)) continue;
  seen.add(key);
  uniq.push(r);
}
console.log("UNIQUE", uniq.length);
await import("node:fs").then((fs) =>
  fs.writeFileSync("scripts/judgeme-all.json", JSON.stringify(uniq, null, 2)),
);
