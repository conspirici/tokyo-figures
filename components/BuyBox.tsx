"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useCart } from "@/lib/cart";
import { SparkleBurst } from "./SparkleBurst";

interface Props {
  slug: string;
  title: string;
  price: number | null;
  inStock: boolean;
  image?: string;
}

/**
 * Buy CTA rules (spec §5):
 * - in stock + priced → Add to cart
 * - otherwise → Notify me (scrolls to the inquiry form, preset to "Availability / notify me")
 */
export function BuyBox({ slug, title, price, inStock, image }: Props) {
  const { add, items } = useCart();
  const [added, setAdded] = useState(0);
  const inCart = items.some((i) => i.slug === slug);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(0), 1800);
    return () => clearTimeout(t);
  }, [added]);

  const buyable = inStock && price != null;

  if (!buyable) {
    return (
      <div className="space-y-3">
        <a
          href="#inquiry"
          onClick={() => window.dispatchEvent(new CustomEvent("inquiry:preset", { detail: { type: "notify", product: slug } }))}
          className="btn-press flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-electric px-6 py-4 font-display text-xl text-white shadow-hard"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden>
            <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 003.4 0" />
          </svg>
          Notify me
        </a>
        <p className="text-center text-sm text-ink-soft">
          {inStock ? "We'll email you as soon as the price is set." : "We'll email you if we can get this one again."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => {
          add({ slug, title, price, image });
          setAdded((a) => a + 1);
        }}
        className="btn-press relative flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-lime px-6 py-4 font-display text-xl text-ink shadow-hard"
      >
        <AnimatePresence mode="wait" initial={false}>
          {added ? (
            <m.span key="ok" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden><path d="M4 12l5 5L20 6" /></svg>
              Added
            </m.span>
          ) : (
            <m.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Add to cart
            </m.span>
          )}
        </AnimatePresence>
        {added > 0 && <SparkleBurst key={added} />}
      </button>
      <span className="sr-only" aria-live="polite">{added ? `${title} added to cart` : ""}</span>
      {inCart && (
        <Link href="/cart/" className="block text-center text-sm font-semibold text-electric underline underline-offset-2">
          View cart and check out
        </Link>
      )}
    </div>
  );
}
