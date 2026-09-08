import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const outDir = path.join("public", "icons");
fs.mkdirSync(outDir, { recursive: true });

async function verveacePng(size, maskable) {
  const insetRatio = size <= 32 ? 0.06 : maskable ? 0.22 : 0.12;
  const inset = Math.round(size * insetRatio);
  const inner = Math.max(1, size - inset * 2);
  const trimmed = await sharp("public/verveace_logo.webp")
    .ensureAlpha()
    .negate({ alpha: false })
    .trim({ threshold: 8 })
    .png()
    .toBuffer();
  const fitted = await sharp(trimmed)
    .resize(inner, inner, { fit: "inside" })
    .png()
    .toBuffer();
  const { width, height } = await sharp(fitted).metadata();
  const w = width ?? inner;
  const h = height ?? inner;
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: "#193d63",
    },
  })
    .composite([
      {
        input: fitted,
        left: Math.round((size - w) / 2),
        top: Math.round((size - h) / 2),
      },
    ])
    .png()
    .toBuffer();
}

const jobs = [
  [32, false],
  [180, false],
  [192, false],
  [192, true],
  [512, false],
  [512, true],
];

for (const [size, maskable] of jobs) {
  const name = maskable ? `verveace-${size}-maskable.png` : `verveace-${size}.png`;
  fs.writeFileSync(path.join(outDir, name), await verveacePng(size, maskable));
  console.log("wrote", name);
}
