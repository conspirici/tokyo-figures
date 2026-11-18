// Fails the build if products.json is not exactly 15 unique products. Runs as `prebuild`.
import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("../products.json", import.meta.url), "utf8"));
const list = data.products ?? [];
const errors = [];

if (list.length !== 15) errors.push(`Expected 15 products, found ${list.length}`);
const seen = new Map();
for (const p of list) {
  for (const k of ["tf_id", "slug", "english_title", "franchise", "condition", "source_status"]) {
    if (p[k] == null || p[k] === "") errors.push(`TF ${p.tf_id ?? "?"}: missing ${k}`);
  }
  if (seen.has(p.tf_id)) errors.push(`Duplicate tf_id ${p.tf_id}`);
  seen.set(p.tf_id, true);
  if (!["new", "outlet"].includes(p.condition)) errors.push(`TF ${p.tf_id}: bad condition "${p.condition}"`);
  if (!["available", "sale_ended"].includes(p.source_status)) errors.push(`TF ${p.tf_id}: bad source_status`);
  if (p.condition === "outlet" && !p.condition_note) errors.push(`TF ${p.tf_id}: outlet item without condition_note`);
}
const slugs = list.map((p) => p.slug);
if (new Set(slugs).size !== slugs.length) errors.push("Duplicate slugs");

if (errors.length) {
  console.error("\n✖ products.json validation failed:\n  - " + errors.join("\n  - ") + "\n");
  process.exit(1);
}
console.log(`✔ products.json: ${list.length} products, IDs unique`);
