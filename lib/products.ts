/**
 * Build-time data layer. Reads products.json, validates it, and strips every internal field.
 * Only import this from server components / generateStaticParams (it uses node:fs).
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import raw from "@/products.json";
import { ageGate, inStockOverrides, priceOverrides } from "@/config/store";
import type { PublicProduct, ProductSummary } from "./types";

const RawProduct = z.object({
  tf_id: z.number().int(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  priority: z.string(),
  franchise: z.string().min(1),
  character: z.string().min(1),
  english_title: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  highlights: z.array(z.string()),
  scale: z.string().nullable(),
  bonus: z.string().nullable(),
  condition: z.enum(["new", "outlet"]),
  condition_note: z.string().nullable(),
  source_status: z.enum(["available", "sale_ended"]),
  // Selling price. `price_usd` is current; `my_price_usd` is accepted for older files.
  price_usd: z.number().nullable().optional(),
  my_price_usd: z.number().nullable().optional(),
});

const Raw = z.object({ currency: z.literal("USD"), products: z.array(RawProduct) });

export const EXPECTED_COUNT = 15;

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function clean(v: string | null | undefined): string | null {
  if (v == null) return null;
  const t = v.trim();
  if (!t || t.toLowerCase() === "unspecified") return null;
  return t;
}

const IMG_ROOT = path.join(process.cwd(), "public", "images");

function findImages(id: number): string[] {
  const dir = path.join(IMG_ROOT, String(id));
  const out: string[] = [];
  for (const name of ["main", "2", "3"]) {
    if (fs.existsSync(path.join(dir, `${name}.jpg`))) out.push(`/images/${id}/${name}`);
  }
  return out;
}

function load(): PublicProduct[] {
  const list = Raw.parse(raw).products;

  // Build-time assertions (spec §10): exactly 15, no duplicate IDs or slugs.
  if (list.length !== EXPECTED_COUNT) {
    throw new Error(`products.json must contain exactly ${EXPECTED_COUNT} products, found ${list.length}`);
  }
  const ids = new Set<number>();
  const slugs = new Set<string>();
  for (const p of list) {
    if (ids.has(p.tf_id)) throw new Error(`Duplicate tf_id ${p.tf_id}`);
    if (slugs.has(p.slug)) throw new Error(`Duplicate slug ${p.slug}`);
    ids.add(p.tf_id);
    slugs.add(p.slug);
  }

  return list.map((p, i): PublicProduct => {
    const rank = Number.parseInt(p.priority, 10) || 3;
    const scale = clean(p.scale);
    const price = p.tf_id in priceOverrides ? priceOverrides[p.tf_id] : (p.price_usd ?? p.my_price_usd ?? null);
    const inStock = p.tf_id in inStockOverrides ? inStockOverrides[p.tf_id] : p.source_status === "available";
    return {
      id: p.tf_id,
      no: i + 1,
      slug: p.slug,
      priorityRank: rank,
      featured: rank === 1,
      franchise: p.franchise,
      franchiseSlug: slugify(p.franchise),
      character: p.character,
      title: p.english_title,
      tagline: p.tagline,
      description: p.description,
      highlights: p.highlights,
      scale,
      scaleGroup: scale === "1/4" || scale === "1/7" ? scale : "Other",
      bonus: clean(p.bonus),
      condition: p.condition,
      conditionNote: clean(p.condition_note),
      limited: /limited/i.test(p.english_title),
      price: price ?? null,
      inStock,
      ageGate: ageGate[p.tf_id] === true,
      images: findImages(p.tf_id),
    };
  });
}

let cache: PublicProduct[] | null = null;
export function getProducts(): PublicProduct[] {
  if (!cache) cache = load();
  return cache;
}

export function getProduct(slug: string): PublicProduct | undefined {
  return getProducts().find((p) => p.slug === slug);
}

export interface Franchise {
  name: string;
  slug: string;
  count: number;
  sample: PublicProduct;
}

export function getFranchises(): Franchise[] {
  const map = new Map<string, Franchise>();
  for (const p of getProducts()) {
    const f = map.get(p.franchiseSlug);
    if (f) f.count++;
    else map.set(p.franchiseSlug, { name: p.franchise, slug: p.franchiseSlug, count: 1, sample: p });
  }
  return [...map.values()];
}

/** 3 related items: same franchise first, then same priority, then catalog order. */
export function getRelated(p: PublicProduct, n = 3): PublicProduct[] {
  const others = getProducts().filter((o) => o.id !== p.id);
  const score = (o: PublicProduct) =>
    (o.franchiseSlug === p.franchiseSlug ? 2 : 0) + (o.priorityRank === p.priorityRank ? 1 : 0);
  return [...others].sort((a, b) => score(b) - score(a) || a.no - b.no).slice(0, n);
}

export function getProductSummaries(): ProductSummary[] {
  return getProducts().map((p) => ({ slug: p.slug, title: p.title }));
}
