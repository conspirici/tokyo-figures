// Converts the hero PNGs in assets/ into public/hero/slide-N-{1200,1774}.{webp,avif} plus a blurred placeholder.
import sharp from "sharp";
import { mkdirSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SOURCES = [
  "Neon Miku Sneaker Pop-Art Showcase.png",
  "Anime Figure Under a Lime Moon.png",
  "Summer Beach Anime Figure Poster.png",
];
const WIDTHS = [1200, 1774];
const root = fileURLToPath(new URL("..", import.meta.url));
const outDir = `${root}/public/hero`;
mkdirSync(outDir, { recursive: true });

const placeholders = {};
for (const [i, file] of SOURCES.entries()) {
  const n = i + 1;
  const src = `${root}/assets/${file}`;
  const meta = await sharp(src).metadata();
  for (const w of WIDTHS) {
    const width = Math.min(w, meta.width); // never upscale
    const base = sharp(src).resize({ width, withoutEnlargement: true });
    const webp = `${outDir}/slide-${n}-${w}.webp`;
    await base.clone().webp({ quality: 74, effort: 6 }).toFile(webp);
    await base.clone().avif({ quality: 52, effort: 5 }).toFile(`${outDir}/slide-${n}-${w}.avif`);
    const kb = Math.round(statSync(webp).size / 1024);
    console.log(`slide-${n}-${w}.webp  ${kb} KB${kb > 200 ? "  ⚠ over 200 KB target" : ""}`);
  }
  const tiny = await sharp(src).resize(24, 12).blur(1.2).webp({ quality: 40 }).toBuffer();
  placeholders[`/hero/slide-${n}`] = `data:image/webp;base64,${tiny.toString("base64")}`;
}
writeFileSync(`${root}/content/hero-placeholders.json`, JSON.stringify(placeholders, null, 2) + "\n");
console.log("✔ wrote content/hero-placeholders.json");
