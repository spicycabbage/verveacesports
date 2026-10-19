import { readdir, rename, stat, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = join(process.cwd(), "public", "rover");

function maxEdge(file) {
  const name = file.replace(/\\/g, "/").toLowerCase();
  if (name.includes("/posters/")) return 960;
  if (name.includes("-mobile.")) return 828;
  return 1920;
}

/** Re-encode a rover still. Keeps the original if we don't beat it by 5%. */
export async function optimizeRoverStill(file) {
  const before = (await stat(file)).size;
  if (before < 150 * 1024) {
    return { file, before, after: before, changed: false };
  }
  const meta = await sharp(file, { failOn: "none" }).metadata();
  const cap = maxEdge(file);
  const width = meta.width ?? cap;

  let pipeline = sharp(file, { failOn: "none" }).rotate();
  if (width > cap) {
    pipeline = pipeline.resize(cap, cap, { fit: "inside", withoutEnlargement: true });
  }

  let out;
  if (/\.jpe?g$/i.test(file)) {
    out = await pipeline.jpeg({ quality: 78, mozjpeg: true }).toBuffer();
  } else if (/\.png$/i.test(file)) {
    out = await pipeline.png({ compressionLevel: 9 }).toBuffer();
  } else {
    out = await pipeline.webp({ quality: 78, effort: 6 }).toBuffer();
  }

  if (out.length >= before * 0.95) {
    return { file, before, after: before, changed: false };
  }
  const tmp = `${file}.tmp`;
  await writeFile(tmp, out);
  try {
    await rename(tmp, file);
  } catch {
    await writeFile(file, out);
    await unlink(tmp).catch(() => undefined);
  }
  return { file, before, after: out.length, changed: true };
}

async function listStills(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && /\.(webp|png|jpe?g)$/i.test(e.name))
    .map((e) => join(dir, e.name));
}

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("optimize-rover-media.mjs");
if (isMain) {
  const files = [
    ...(await listStills(join(ROOT, "art"))),
    ...(await listStills(join(ROOT, "posters"))),
  ];
  let saved = 0;
  for (const file of files) {
    const result = await optimizeRoverStill(file);
    const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
    if (result.changed) {
      saved += result.before - result.after;
      console.log(`OK  ${kb(result.before)} → ${kb(result.after)}  ${file}`);
    } else {
      console.log(`skip ${kb(result.before)}  ${file}`);
    }
  }
  console.log(`saved ${(saved / 1024).toFixed(0)}KB across ${files.length} files`);
}
