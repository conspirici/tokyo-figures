// Fails the build if any hero slide image is missing (the CSS fallback is meant for dev only). Runs as `prebuild`.
import { existsSync, readFileSync } from "node:fs";

const slides = JSON.parse(readFileSync(new URL("../content/hero.json", import.meta.url), "utf8"));
const missing = [];
for (const s of slides) {
  for (const w of [1200, 1774]) {
    const f = new URL(`../public${s.image}-${w}.webp`, import.meta.url);
    if (!existsSync(f)) missing.push(`public${s.image}-${w}.webp`);
  }
}
if (!existsSync(new URL("../content/hero-placeholders.json", import.meta.url))) missing.push("content/hero-placeholders.json");

if (missing.length) {
  console.error("\n✖ Hero images missing. Run `npm run optimize-hero` first:\n  - " + missing.join("\n  - ") + "\n");
  process.exit(1);
}
console.log(`✔ hero: ${slides.length} slides present`);
