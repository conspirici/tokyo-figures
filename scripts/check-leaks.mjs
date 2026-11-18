// Runs after `next build`: fails if internal fields or source URLs appear anywhere in out/ (spec §10).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../out", import.meta.url));
const { products } = JSON.parse(readFileSync(new URL("../products.json", import.meta.url), "utf8"));

const needles = [
  "landed_cost", "margin_at_my_price", "margin_at_site_price", "price_source", "market_reference_rounded", "jpy_price", "market_reference", "source_url", "source_image_url",
  "needs_verification", "tokyofigure.jp", "cloudfront.net", "japanese_title",
  ...products.map((p) => p.japanese_title).filter(Boolean),
];
const secretNeedles = ["RESEND_API_KEY", "TURNSTILE_SECRET_KEY", "re_"];

const hits = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const f = join(dir, name);
    if (statSync(f).isDirectory()) walk(f);
    else if (/\.(html|js|json|txt|xml|css|map)$/.test(name)) {
      const s = readFileSync(f, "utf8");
      for (const n of needles) if (s.includes(n)) hits.push(`${f.slice(root.length)}: "${n.slice(0, 40)}"`);
      for (const n of secretNeedles.slice(0, 2)) if (s.includes(n)) hits.push(`${f.slice(root.length)}: secret name "${n}"`);
      if (/\bre_[A-Za-z0-9]{16,}/.test(s)) hits.push(`${f.slice(root.length)}: looks like a Resend key`);
    }
  }
}
walk(root);
if (hits.length) {
  console.error("\n✖ Internal data leaked into out/:\n  - " + [...new Set(hits)].slice(0, 40).join("\n  - ") + "\n");
  process.exit(1);
}
console.log("✔ out/: no internal fields, source URLs or secrets found");
