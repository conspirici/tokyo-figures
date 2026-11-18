"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { MAX_QTY, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { orderRequestUrl, startCheckout } from "@/lib/checkout";
import { ProductImage } from "./ProductImage";

export function CartView({ validSlugs }: { validSlugs: Record<string, number | null> }) {
  const { items, subtotal, setQty, remove } = useCart();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // Drop anything no longer purchasable (price removed or out of stock since it was added).
  const live = items.filter((i) => validSlugs[i.slug] != null);

  if (live.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-ink bg-white p-10 text-center">
        <p className="font-display text-3xl">Your cart is empty</p>
        <p className="mt-2 text-ink-soft">Find something nice for the shelf.</p>
        <Link href="/shop/" className="btn-press mt-6 inline-block rounded-full border-2 border-ink bg-lime px-6 py-3 font-display text-lg shadow-hard">
          Browse the shop
        </Link>
      </div>
    );
  }

  const onCheckout = async () => {
    setBusy(true);
    setMsg("");
    const url = await startCheckout(live.map((i) => ({ slug: i.slug, qty: i.qty })));
    if (url) {
      window.location.assign(url);
      return;
    }
    // Online checkout isn't live yet: hand the order to the contact form, prefilled.
    setMsg("Taking you to the order form…");
    window.location.assign(orderRequestUrl(live.map((i) => ({ ...i, price: validSlugs[i.slug] ?? i.price }))));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="space-y-4">
        <AnimatePresence initial={false}>
          {live.map((i) => (
            <m.li
              key={i.slug}
              layout
              exit={{ opacity: 0, x: -40 }}
              className="flex gap-4 rounded-2xl border-2 border-ink bg-white p-4 shadow-hard-sm"
            >
              <span className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-ink bg-white p-1">
                <ProductImage base={i.image} alt="" sizes="96px" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/products/${i.slug}/`} className="line-clamp-2 font-bold hover:underline">
                  {i.title}
                </Link>
                <p className="mt-1 font-display text-lg">{formatPrice(validSlugs[i.slug] ?? i.price)}</p>
                <div className="mt-auto flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    Qty
                    <select value={i.qty} onChange={(e) => setQty(i.slug, Number(e.target.value))} className="field-focus rounded-lg border-2 border-ink bg-white px-2 py-1">
                      {Array.from({ length: MAX_QTY }, (_, k) => k + 1).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                  <button type="button" onClick={() => remove(i.slug)} className="text-sm font-semibold text-[#b0185a] underline underline-offset-2">
                    Remove
                  </button>
                </div>
              </div>
            </m.li>
          ))}
        </AnimatePresence>
      </ul>

      <aside className="h-fit rounded-2xl border-2 border-ink bg-white p-6 shadow-hard lg:sticky lg:top-24" aria-label="Order summary">
        <p className="font-display text-2xl">Summary</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="font-bold">{formatPrice(live.reduce((n, i) => n + i.qty * (validSlugs[i.slug] ?? i.price), 0) || subtotal)}</dd>
          </div>
          <div className="flex justify-between text-ink-soft">
            <dt>Shipping</dt>
            <dd>Calculated at checkout</dd>
          </div>
          <div className="flex justify-between text-ink-soft">
            <dt>US import duties</dt>
            <dd>
              <Link href="/shipping/" className="underline">See policy</Link>
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onCheckout}
          disabled={busy}
          className="btn-press mt-6 w-full rounded-full border-2 border-ink bg-lime px-6 py-3.5 font-display text-lg shadow-hard disabled:opacity-70"
        >
          {busy ? "One sec…" : "Check out"}
        </button>
        <p className="mt-3 rounded-lg border-2 border-dashed border-ink bg-paper px-3 py-2 text-xs text-ink-soft">
          Online payment is coming soon. For now, checking out sends us your order through the{" "}
          <Link href="/contact/?type=order" className="font-semibold text-electric underline">contact form</Link>, and we reply
          by email with shipping and payment details.
        </p>
        <p className="mt-3 min-h-5 text-sm font-semibold" aria-live="polite">{msg}</p>
      </aside>
    </div>
  );
}
