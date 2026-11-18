"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import type { PublicProduct } from "@/lib/types";
import { ProductCard } from "./ProductCard";

/* URL params: q, franchise (comma list of slugs), scale, cond, price, avail, sort */
const PRICE_BUCKETS = [
  { value: "u200", label: "Under $200", test: (p: number | null) => p != null && p < 200 },
  { value: "200-299", label: "$200–$299", test: (p: number | null) => p != null && p >= 200 && p < 300 },
  { value: "300", label: "$300+", test: (p: number | null) => p != null && p >= 300 },
  { value: "soon", label: "Price coming soon", test: (p: number | null) => p == null },
];
const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

interface Filters {
  q: string;
  franchise: string[];
  scale: string[];
  cond: string[];
  price: string[];
  avail: string[];
  sort: string;
}
const EMPTY: Filters = { q: "", franchise: [], scale: [], cond: [], price: [], avail: [], sort: "featured" };
const LIST_KEYS = ["franchise", "scale", "cond", "price", "avail"] as const;

function fromSearch(search: string): Filters {
  const sp = new URLSearchParams(search);
  const list = (k: string) => (sp.get(k) ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return {
    q: sp.get("q") ?? "",
    franchise: list("franchise"),
    scale: list("scale"),
    cond: list("cond"),
    price: list("price"),
    avail: list("avail"),
    sort: SORTS.some((s) => s.value === sp.get("sort")) ? (sp.get("sort") as string) : "featured",
  };
}
function toSearch(f: Filters) {
  const sp = new URLSearchParams();
  if (f.q.trim()) sp.set("q", f.q.trim());
  for (const k of LIST_KEYS) if (f[k].length) sp.set(k, f[k].join(","));
  if (f.sort !== "featured") sp.set("sort", f.sort);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function applyFilters(products: PublicProduct[], f: Filters) {
  const q = f.q.trim().toLowerCase();
  const out = products.filter((p) => {
    if (q && !`${p.title} ${p.franchise} ${p.character}`.toLowerCase().includes(q)) return false;
    if (f.franchise.length && !f.franchise.includes(p.franchiseSlug)) return false;
    if (f.scale.length && !f.scale.includes(p.scaleGroup)) return false;
    if (f.cond.length && !f.cond.includes(p.condition)) return false;
    if (f.price.length && !PRICE_BUCKETS.some((b) => f.price.includes(b.value) && b.test(p.price))) return false;
    if (f.avail.length && !f.avail.includes(p.inStock ? "in" : "out")) return false;
    return true;
  });
  const featured = (a: PublicProduct, b: PublicProduct) =>
    a.priorityRank - b.priorityRank || Number(b.inStock) - Number(a.inStock) || a.no - b.no;
  if (f.sort === "price-asc") out.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity) || featured(a, b));
  else if (f.sort === "price-desc") out.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity) || featured(a, b));
  else out.sort(featured);
  return out;
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <m.button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      animate={on ? { scale: [1, 1.12, 1] } : { scale: 1 }}
      className={`rounded-full border-2 border-ink px-3 py-1.5 text-sm font-semibold transition-colors ${on ? "bg-ink text-lime" : "bg-white text-ink hover:bg-paper"}`}
    >
      {children}
    </m.button>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 font-display text-xs tracking-widest text-ink-soft">{label.toUpperCase()}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

export function ShopClient({
  products,
  franchises,
}: {
  products: PublicProduct[];
  franchises: { name: string; slug: string; count: number }[];
}) {
  const [f, setF] = useState<Filters>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  // Read filters from the URL on load and on back/forward.
  useEffect(() => {
    const sync = () => setF(fromSearch(window.location.search));
    sync();
    setHydrated(true);
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const update = useCallback((next: Filters) => {
    setF(next);
    const url = `${window.location.pathname}${toSearch(next)}`;
    window.history.replaceState(window.history.state, "", url);
  }, []);

  const toggle = (k: (typeof LIST_KEYS)[number], v: string) =>
    update({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] });

  const results = useMemo(() => applyFilters(products, f), [products, f]);
  const activeCount = LIST_KEYS.reduce((n, k) => n + f[k].length, 0) + (f.q ? 1 : 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      {/* Sticky sidebar that scrolls on its own when it's taller than the screen */}
      <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pb-4 lg:pr-2 lg:pt-1 lg:pl-1">

        <div className="flex items-center gap-2 lg:block">
          <label className="relative block flex-1">
            <span className="sr-only">Search by name or franchise</span>
            <input
              type="search"
              value={f.q}
              onChange={(e) => update({ ...f, q: e.target.value })}
              placeholder="Search Miku, Eva, Genshin…"
              className="field-focus w-full rounded-full border-2 border-ink bg-white py-2.5 pl-10 pr-4 text-sm"
            />
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
            </svg>
          </label>
          <button
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            aria-expanded={panelOpen}
            aria-controls="filters"
            className="btn-press shrink-0 rounded-full border-2 border-ink bg-lime px-4 py-2.5 text-sm font-bold shadow-hard-sm lg:hidden"
          >
            Filters{activeCount ? ` (${activeCount})` : ""}
          </button>
        </div>

        <div id="filters" className={`${panelOpen ? "mt-4 grid" : "hidden"} gap-5 rounded-2xl border-2 border-ink bg-white p-4 lg:mt-5 lg:grid`}>
          <Group label="Franchise">
            {franchises.map((fr) => (
              <Chip key={fr.slug} on={f.franchise.includes(fr.slug)} onClick={() => toggle("franchise", fr.slug)}>
                {fr.name} <span className="opacity-60">{fr.count}</span>
              </Chip>
            ))}
          </Group>
          <Group label="Condition">
            <Chip on={f.cond.includes("new")} onClick={() => toggle("cond", "new")}>New</Chip>
            <Chip on={f.cond.includes("outlet")} onClick={() => toggle("cond", "outlet")}>Outlet</Chip>
          </Group>
          <Group label="Scale">
            {["1/4", "1/7", "Other"].map((s) => (
              <Chip key={s} on={f.scale.includes(s)} onClick={() => toggle("scale", s)}>{s}</Chip>
            ))}
          </Group>
          <Group label="Price">
            {PRICE_BUCKETS.map((b) => (
              <Chip key={b.value} on={f.price.includes(b.value)} onClick={() => toggle("price", b.value)}>{b.label}</Chip>
            ))}
          </Group>
          <Group label="Availability">
            <Chip on={f.avail.includes("in")} onClick={() => toggle("avail", "in")}>In stock</Chip>
            <Chip on={f.avail.includes("out")} onClick={() => toggle("avail", "out")}>Currently unavailable</Chip>
          </Group>
          {activeCount > 0 && (
            <button type="button" onClick={() => update({ ...EMPTY, sort: f.sort })} className="justify-self-start text-sm font-semibold text-electric underline underline-offset-2">
              Clear all filters
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink-soft" aria-live="polite">
            {hydrated ? `${results.length} of ${products.length} figures` : `${products.length} figures`}
          </p>
          <label className="flex items-center gap-2 text-sm font-semibold">
            Sort
            <select
              value={f.sort}
              onChange={(e) => update({ ...f, sort: e.target.value })}
              className="field-focus rounded-full border-2 border-ink bg-white px-3 py-2"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>

        <m.ul layout className="grid grid-cols-1 gap-x-6 gap-y-10 pt-3 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {results.map((p, i) => (
              <m.li
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <ProductCard p={p} index={i} priority={i < 3} />
              </m.li>
            ))}
          </AnimatePresence>
        </m.ul>

        {hydrated && results.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-ink bg-white p-10 text-center">
            <p className="font-display text-2xl">Nothing matches those filters</p>
            <button type="button" onClick={() => update(EMPTY)} className="mt-4 rounded-full border-2 border-ink bg-lime px-5 py-2 font-bold shadow-hard-sm">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
