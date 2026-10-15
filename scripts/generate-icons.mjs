/**
 * Regenerate app icons from Job Hiring Point shield logo.
 * - Trims whitespace so logo is larger
 * - Flattens soft drop shadow so it sits on white (not floating)
 * Run: node scripts/generate-icons.mjs
 */
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(__dirname, "../../web/package.json"));
const sharp = require("sharp");

const SRC = path.resolve(__dirname, "../assets/jhp-logo-source.jpg");
const OUT = path.resolve(__dirname, "../assets");
const SIZE = 1024;
const LOGO = Math.round(SIZE * 0.92);
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

function flattenShadowRaw(data, width, height) {
  const n = width * height;
  const visited = new Uint8Array(n);
  const queue = [];

  function isSoftBackground(px) {
    const i = px * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max - min;
    const lum = (r + g + b) / 3;
    // Pure / near white OR soft exterior drop-shadow gray
    return min >= 200 || (sat < 40 && lum >= 125);
  }

  function enqueue(px) {
    if (px < 0 || px >= n || visited[px]) return;
    if (!isSoftBackground(px)) return;
    visited[px] = 1;
    queue.push(px);
  }

  // Seed from all edges so only *outside* shadow is removed
  for (let x = 0; x < width; x++) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    enqueue(y * width);
    enqueue(y * width + (width - 1));
  }

  while (queue.length) {
    const px = queue.pop();
    const i = px * 4;
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = 255;
    const x = px % width;
    const y = (px / width) | 0;
    if (x > 0) enqueue(px - 1);
    if (x + 1 < width) enqueue(px + 1);
    if (y > 0) enqueue(px - width);
    if (y + 1 < height) enqueue(px + width);
  }

  // Also wipe any leftover near-white fringe
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] >= 240 && data[i + 1] >= 240 && data[i + 2] >= 240) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }

  return data;
}

/** Flat logo on opaque white, tightly cropped then sized */
async function flatLogoOnWhite(outSize) {
  const { data, info } = await sharp(SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  flattenShadowRaw(data, info.width, info.height);

  const flat = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  // Trim remaining white so the shield fills the canvas
  const trimmed = await sharp(flat)
    .trim({ threshold: 12 })
    .png()
    .toBuffer();

  return sharp(trimmed)
    .resize(outSize, outSize, {
      fit: "contain",
      background: WHITE,
    })
    .png()
    .toBuffer();
}

/** Transparent adaptive foreground (white → alpha) */
async function flatLogoTransparent(outSize) {
  const onWhite = await flatLogoOnWhite(outSize);
  const { data, info } = await sharp(onWhite)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= 248 && g >= 248 && b >= 248) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function main() {
  const logo = await flatLogoOnWhite(LOGO);
  const logoFg = await flatLogoTransparent(LOGO);
  const mark = await flatLogoOnWhite(640);

  await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: WHITE } })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(path.join(OUT, "icon.png"));

  await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([{ input: logoFg, gravity: "center" }])
    .png()
    .toFile(path.join(OUT, "android-icon-foreground.png"));

  await sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: WHITE } })
    .png()
    .toFile(path.join(OUT, "android-icon-background.png"));

  const mono = await sharp(logoFg).greyscale().linear(1.2, -40).png().toBuffer();

  await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: mono, gravity: "center" }])
    .png()
    .toFile(path.join(OUT, "android-icon-monochrome.png"));

  await sharp(await flatLogoOnWhite(48)).png().toFile(path.join(OUT, "favicon.png"));

  await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: WHITE },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(path.join(OUT, "splash-icon.png"));

  await sharp(mark).png().toFile(path.join(OUT, "splash-mark.png"));

  console.log("Icons regenerated:", OUT);
  console.log("- Trimmed + larger mark");
  console.log("- Soft drop shadow flattened");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
