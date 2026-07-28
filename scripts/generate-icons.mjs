/**
 * Regenerate app icons from Job Hiring Point shield logo.
 * Run: node app/scripts/generate-icons.mjs
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
const LOGO = Math.round(SIZE * 0.78);
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

async function logoBuffer() {
  return sharp(SRC)
    .resize(LOGO, LOGO, {
      fit: "contain",
      background: WHITE,
    })
    .png()
    .toBuffer();
}

async function logoBufferTransparent() {
  // Adaptive foreground: keep white as transparent-ish by flattening on white then
  // compositing logo centered — Android adaptive uses white background separately.
  return sharp(SRC)
    .resize(LOGO, LOGO, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();
}

async function main() {
  const logo = await logoBuffer();
  const logoFg = await logoBufferTransparent();

  await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: WHITE } })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(path.join(OUT, "icon.png"));

  await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 0 } },
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

  await sharp(SRC)
    .resize(48, 48, { fit: "contain", background: WHITE })
    .png()
    .toFile(path.join(OUT, "favicon.png"));

  await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: WHITE },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(path.join(OUT, "splash-icon.png"));

  console.log("App icons written to", OUT, "(white background)");
  console.log("Note: assets/logo.png (wordmark) is left unchanged for in-app BrandLogo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
