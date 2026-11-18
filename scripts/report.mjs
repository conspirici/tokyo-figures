// Developer-only report. Never shown on the public site.
import { readFileSync } from "node:fs";

const { products } = JSON.parse(readFileSync(new URL("../products.json", import.meta.url), "utf8"));

const rows = products.map((p) => {
  const price = p.price_usd ?? p.my_price_usd ?? null;
  const margin = price != null && p.landed_cost_usd != null ? price - p.landed_cost_usd : null;
  return {
    TF: p.tf_id,
    Character: p.character,
    Cond: p.condition,
    Status: p.source_status,
    "Price $": price ?? "—",
    Source: p.price_source ?? "",
    "Landed $": p.landed_cost_usd ?? "—",
    "Margin $": margin ?? "—",
    Flag: margin == null ? "" : margin < 0 ? "BELOW COST" : margin < 20 ? "thin" : "",
    "Needs verification": (p.needs_verification ?? []).join("; "),
  };
});

console.log("\nCatalog report (internal)\n");
console.table(rows);
const priced = products.filter((p) => (p.price_usd ?? p.my_price_usd) != null).length;
const ended = products.filter((p) => p.source_status === "sale_ended").length;
console.log(`Priced: ${priced}/${products.length}   Sale ended at source: ${ended}`);
const below = rows.filter((r) => r.Flag === "BELOW COST");
if (below.length) console.log(`⚠ Below cost: ${below.map((r) => `TF ${r.TF} (${r["Margin $"]})`).join(", ")}`);
