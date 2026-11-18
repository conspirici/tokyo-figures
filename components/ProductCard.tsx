"use client";

import Link from "next/link";
import type { PublicProduct } from "@/lib/types";
import { pad2 } from "@/lib/format";
import { PriceChip } from "./PriceChip";
import { ProductImage } from "./ProductImage";
import { Sticker, productStickers } from "./Sticker";

const rots = [-6, 5, -3];

/** Numbered poster-style card. Hover: a small lift with a hard shadow, nothing else. */
export function ProductCard({ p, index = 0, priority = false }: { p: PublicProduct; index?: number; priority?: boolean }) {
  const stickers = productStickers(p);

  return (
    <Link
      href={`/products/${p.slug}/`}
      className="card-lift group relative flex h-full flex-col rounded-2xl border-2 border-ink bg-white shadow-hard focus-visible:shadow-hard-lg"
      data-reveal
      style={{ ["--i" as string]: index % 8 }}
    >
      <span className="absolute -left-2 -top-3 z-10 rounded-md border-2 border-ink bg-electric px-2 py-0.5 font-display text-sm text-white shadow-hard-sm">
        No. {pad2(p.no)}
      </span>
      <div className="absolute -right-2 -top-3 z-10 flex flex-col items-end gap-1">
        {stickers.map((s, i) => (
          <Sticker key={s} kind={s} size="sm" rot={rots[i % rots.length]} stamp pulse={s === "new" && i === 0 && index === 0} />
        ))}
      </div>

      <div className="relative aspect-square overflow-hidden rounded-t-[14px] bg-white">
        <div className="h-full w-full p-3">
          <ProductImage base={p.images[0]} alt={p.title} no={p.no} priority={priority} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t-2 border-ink p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-electric">{p.franchise}</p>
        <h3 className="line-clamp-3 text-[15px] font-bold leading-snug">{p.title}</h3>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <PriceChip price={p.price} />
          <span className={`text-xs font-semibold ${p.inStock ? "text-ink-soft" : "text-unavailable"}`}>
            {p.inStock ? (p.scale ? `${p.scale} scale` : "In stock") : "Currently unavailable"}
          </span>
        </div>
      </div>
    </Link>
  );
}
