const home = await fetch("https://bleequp.com").then((r) => r.text());
const product = await fetch(
  "https://bleequp.com/products/bleequp-ranger-ai-sports-camera-glasses-standard-lens",
).then((r) => r.text());

function mp4s(html) {
  const byId = new Map();
  for (const m of html.matchAll(/<source\s+src="([^"]+\.mp4[^"]*)"/g)) {
    const mp4 = m[1].replace(/^\/\//, "https://");
    const id = mp4.match(/\/vp\/([a-f0-9-]+)\//i)?.[1];
    if (!id) continue;
    const existing = byId.get(id);
    if (!existing || mp4.includes("HD-1080p")) byId.set(id, mp4);
  }
  return byId;
}

const homeMp4 = mp4s(home);
const productMp4 = mp4s(product);

// testimonials from home
const testimonials = [];
for (const m of home.matchAll(
  /<h3 class="im-inf-title">([^<]+)<\/h3>[\s\S]{0,400}?<p class="im-inf-quote">([^<]+)<\/p>[\s\S]{0,400}?source src="([^"]+\.mp4)/g,
)) {
  const id = m[3].match(/\/vp\/([a-f0-9-]+)\//)?.[1];
  testimonials.push({
    title: m[1].trim(),
    quote: m[2].trim(),
    mp4: homeMp4.get(id) ?? m[3].replace(/^\/\//, "https://"),
  });
}

// reverse order - quote might come after video in DOM, try alternate pattern
if (testimonials.length < 6) {
  for (const block of home.matchAll(/<div class="im-inf-card">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g)) {
    const chunk = block[1];
    const title = chunk.match(/<h3 class="im-inf-title">([^<]+)/)?.[1]?.trim();
    const quote = chunk.match(/<p class="im-inf-quote">([^<]+)/)?.[1]?.trim();
    const src = chunk.match(/source src="([^"]+\.mp4)/)?.[1]?.replace(/^\/\//, "https://");
    if (title && src && !testimonials.find((t) => t.title === title)) {
      testimonials.push({ title, quote: quote ?? "", mp4: src });
    }
  }
}

// feature sections from product - media-tabs titles
const features = [];
for (const m of product.matchAll(
  /<span class="media-tabs__sub[^"]*">([^<]*)<\/span><h2 class="media-tabs__title[^"]*">([^<]*)<\/h2>[\s\S]{0,2500}?\/vp\/([a-f0-9-]+)\//gi,
)) {
  features.push({
    tag: m[1].replace(/&amp;/g, "&").trim(),
    title: m[2].replace(/&amp;/g, "&").trim(),
    id: m[3],
    mp4: productMp4.get(m[3]),
  });
}

// standalone h2 feature videos
for (const m of product.matchAll(
  /<h2[^>]*>([^<]+)<\/h2>[\s\S]{0,3000}?\/vp\/([a-f0-9-]+)\//gi,
)) {
  const title = m[1].replace(/&amp;/g, "&").trim();
  const id = m[2];
  if (!features.find((f) => f.id === id)) {
    features.push({ tag: null, title, id, mp4: productMp4.get(id) });
  }
}

// youtube creators
const creators = [];
for (const m of product.matchAll(
  /data-ytid="([A-Za-z0-9_-]{11})"[\s\S]{0,800}?<h4[^>]*>([^<]+)<\/h4>[\s\S]{0,400}?<div class="x5-quote-text"><p>([^<]+)/g,
)) {
  creators.push({ youtubeId: m[1], name: m[2].trim(), quote: m[3].trim() });
}

const setupVideo = product.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/)?.[1]
  ?? product.match(/watch\?v=([A-Za-z0-9_-]{11})/)?.[1];

console.log(JSON.stringify({ testimonials, features, creators, setupVideo }, null, 2));
