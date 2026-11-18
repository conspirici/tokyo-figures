// LOCAL DEVELOPMENT ONLY.
// Downloads each product's source_image_url into public/images/{tf_id}/main.jpg and builds responsive variants.
// Pass --resize-only to just (re)build variants from photos you've placed yourself (main.jpg, 2.jpg, 3.jpg).
import sharp from "sharp";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const data = JSON.parse(readFileSync(`${root}/products.json`, "utf8"));
const resizeOnly = process.argv.includes("--resize-only");
const WIDTHS = [480, 960];

const banner = `
┌──────────────────────────────────────────────────────────────────────┐
│  WARNING: these photos belong to the Japanese retailer.             │
│  They are for local development only. Replace every file in         │
│  public/images/ with your own photos or licensed images before      │
│  launch. public/images/*/ is git-ignored on purpose.                │
└──────────────────────────────────────────────────────────────────────┘`;
if (!resizeOnly) console.warn(banner);

async function variants(dir, name) {
  const src = `${dir}/${name}.jpg`;
  if (!existsSync(src)) return;
  for (const w of WIDTHS) {
    await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(`${dir}/${name}-${w}.webp`);
  }
}

for (const p of data.products) {
  const dir = `${root}/public/images/${p.tf_id}`;
  mkdirSync(dir, { recursive: true });
  if (!resizeOnly && p.source_image_url && !existsSync(`${dir}/main.jpg`)) {
    try {
      const res = await fetch(p.source_image_url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await sharp(buf).jpeg({ quality: 86 }).toFile(`${dir}/main.jpg`);
      console.log(`↓ ${p.tf_id} main.jpg`);
    } catch (e) {
      console.error(`✖ ${p.tf_id}: ${e.message}`);
      continue;
    }
  }
  for (const name of ["main", "2", "3"]) await variants(dir, name);
}
writeFileSync(`${root}/public/images/README.txt`, "Put your own product photos here: {tf_id}/main.jpg, 2.jpg, 3.jpg, then run `npm run images`.\n");
if (!resizeOnly) console.warn(banner);
