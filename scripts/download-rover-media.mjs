import { mkdir, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { dirname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { optimizeRoverStill } from "./optimize-rover-media.mjs";

const ROOT = join(process.cwd(), "public", "rover");
const UA = "Mozilla/5.0 (compatible; VerveAceRoverMirror/1.0)";

const VIDEO_IDS = {
  film: { id: "486cc4385b364cb9ae19964fc824ccc2", bitrate: "3.3", suffix: "93510779" },
  statement: { id: "a1b99a58e38e4b7ba5bb38070a871a51", bitrate: "3.3", suffix: "93510803" },
  "capture-tilt": { id: "b566f5d23b0245678ab31f891c3a2a6b", bitrate: "3.3", suffix: "93510820" },
  "capture-hdr": { id: "eb45553bd7134adea44f9060a9648001", bitrate: "3.3", suffix: "93510828" },
  "capture-night": { id: "abc2943084004febbb9a7ac50b8cbee9", bitrate: "3.3", suffix: "93510836" },
  "capture-fov": { id: "579434804fa045f98e0f39c9448df83e", bitrate: "4.8", suffix: "93510842" },
  "capture-eis": { id: "7873f251bfe543cba6d5783913c5f3e4", bitrate: "4.8", suffix: "93510853" },
  "capture-ratio": { id: "2e9e32ec55de4d23a13abbc06606c691", bitrate: "4.8", suffix: "93510870" },
  "capture-loop": { id: "37f94b9a34a24d79a7fa8804f8927abc", bitrate: "4.8", suffix: "93510887" },
  "editing-highlight": { id: "e173f0a5491b4ace9c990951f59221f5", bitrate: "4.8", suffix: "93510901" },
  "editing-search": { id: "5393b1804cd544ccabd78a48325fa622", bitrate: "4.8", suffix: "93510908" },
  "editing-edit": { id: "538661f127774df6b54b6a6b530f6a3d", bitrate: "4.8", suffix: "93510911" },
  "share-motion": { id: "fc5f195883e04395be61672296f1f384", bitrate: "4.8", suffix: "93510915" },
  "share-remix": { id: "216fedf8ce564337b2319627bf77439a", bitrate: "4.8", suffix: "93510924" },
  "companion-breathing": { id: "2a0cd0e6dea64f9e925d381418d8c828", bitrate: "4.8", suffix: "93510935" },
  "companion-emergency": { id: "be88672186ac4e2db2016daaaac37a24", bitrate: "4.8", suffix: "93510956" },
};

const ART = [
  "hero",
  "feature-tilt",
  "feature-3k",
  "feature-assistant",
  "feature-roadbook",
  "audio-surround",
  "feature-accessories",
  "ai-roadbook",
  "split-assistant",
  "split-recap",
  "split-alerts",
  "audio-wind",
  "audio-talk",
  "accessory-power",
  "accessory-controller",
  "box",
  "cta",
];

function videoCandidates({ id, bitrate, suffix }) {
  const names = [
    `${id}.HD-1080p-${bitrate}Mbps-${suffix}.mp4`,
    `${id}.HD-720p-1.6Mbps-${suffix}.mp4`,
    `${id}.HD-720p-2.5Mbps-${suffix}.mp4`,
    `${id}.HD-720p-4.5Mbps-${suffix}.mp4`,
  ];
  const hosts = [
    "https://cdn.shopify.com/videos/c/vp",
    "https://www.bleequp.com/cdn/shop/videos/c/vp",
  ];
  return hosts.flatMap((host) => names.map((name) => `${host}/${id}/${name}`));
}

function posterCandidates(id, size) {
  return [
    `https://www.bleequp.com/cdn/shop/files/preview_images/${id}.thumbnail.0000000000_${size}.jpg`,
    `https://cdn.shopify.com/s/files/1/0674/8527/0213/files/preview_images/${id}.thumbnail.0000000000_${size}.jpg`,
  ];
}

function artCandidates(name, variant) {
  return [
    `https://www.bleequp.com/cdn/shop/t/78/assets/rover-0904-${name}-${variant}.webp`,
    `https://www.bleequp.com/cdn/shop/t/78/assets/rover-0904-${name}-${variant}.png`,
    `https://www.bleequp.com/cdn/shop/t/78/assets/rover-0904-${name}-${variant}.jpg`,
  ];
}

async function firstOk(urls) {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD", headers: { "user-agent": UA }, redirect: "follow" });
      if (res.ok) {
        return { url, status: res.status, bytes: Number(res.headers.get("content-length") || 0) };
      }
      // Some CDNs reject HEAD
      if (res.status === 405 || res.status === 403) {
        const get = await fetch(url, { method: "GET", headers: { "user-agent": UA, range: "bytes=0-0" } });
        if (get.ok || get.status === 206) {
          return { url, status: get.status, bytes: Number(get.headers.get("content-length") || 0) };
        }
      }
    } catch {
      // try next
    }
  }
  return null;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok || !res.body) throw new Error(`${res.status} ${url}`);
  await mkdir(dirname(dest), { recursive: true });
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

async function scrapeOfficial() {
  const res = await fetch("https://www.bleequp.com/products/bleequp-rover-ai-sports-glasses", {
    headers: { "user-agent": UA },
  });
  const html = await res.text();
  const mp4s = [...html.matchAll(/https?:[^"'\\\s>]+\.mp4[^"'\\\s>]*/gi)].map((m) => m[0]);
  return { status: res.status, htmlLen: html.length, mp4s: [...new Set(mp4s)] };
}

const jobs = [];

for (const [name, meta] of Object.entries(VIDEO_IDS)) {
  jobs.push({
    dest: join(ROOT, "videos", `${name}.mp4`),
    candidates: videoCandidates(meta),
    kind: "video",
    name,
  });
  const size = name === "film" || name.startsWith("editing") || name.startsWith("share") || name === "statement"
    ? "2400x"
    : "1800x";
  jobs.push({
    dest: join(ROOT, "posters", `${name}.jpg`),
    candidates: posterCandidates(meta.id, size),
    kind: "poster",
    name,
  });
}

for (const name of ART) {
  for (const variant of ["desktop", "mobile"]) {
    jobs.push({
      dest: join(ROOT, "art", `${name}-${variant}.webp`),
      candidates: artCandidates(name, variant),
      kind: "art",
      name: `${name}-${variant}`,
    });
  }
}

jobs.push({
  dest: join(ROOT, "art", "compare-rover.png"),
  candidates: ["https://www.bleequp.com/cdn/shop/t/78/assets/rover-compare-rover-product.png"],
  kind: "art",
  name: "compare-rover",
});
jobs.push({
  dest: join(ROOT, "art", "compare-ranger.png"),
  candidates: ["https://www.bleequp.com/cdn/shop/files/20260805-114054_1_1.png?v=1788961677"],
  kind: "art",
  name: "compare-ranger",
});

const official = await scrapeOfficial();
console.log(`official page ${official.status} ${official.htmlLen}b mp4s=${official.mp4s.length}`);
official.mp4s.forEach((u) => console.log("  scraped", u));

const manifest = [];
for (const job of jobs) {
  const hit = await firstOk(job.candidates);
  if (!hit) {
    console.log(`FAIL ${job.kind} ${job.name}`);
    manifest.push({ ...job, ok: false });
    continue;
  }
  process.stdout.write(`GET ${job.kind} ${job.name} <- ${hit.url}\n`);
  await download(hit.url, job.dest);
  if (job.kind === "art" || job.kind === "poster") {
    await optimizeRoverStill(job.dest);
  }
  manifest.push({ name: job.name, kind: job.kind, url: hit.url, dest: job.dest, bytes: hit.bytes, ok: true });
}

await writeFile(join(ROOT, "manifest.json"), JSON.stringify({ official, files: manifest }, null, 2));
const failed = manifest.filter((m) => !m.ok);
console.log(`done ok=${manifest.filter((m) => m.ok).length} fail=${failed.length}`);
if (failed.length) process.exitCode = 1;
