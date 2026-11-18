"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartItem {
  slug: string;
  title: string;
  price: number;
  image?: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  count: number;
  subtotal: number;
  bump: number; // increments on every add, so the header icon can animate
  add: (item: Omit<CartItem, "qty">) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

const KEY = "tf-cart-v1";
export const MAX_QTY = 5;
const Ctx = createContext<CartState | null>(null);

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v.filter((x) => x && typeof x.slug === "string" && typeof x.price === "number") : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [bump, setBump] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(read());
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable: cart still works for this visit */
    }
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, "qty">) => {
    setItems((cur) => {
      const found = cur.find((c) => c.slug === item.slug);
      if (found) return cur.map((c) => (c.slug === item.slug ? { ...c, qty: Math.min(MAX_QTY, c.qty + 1) } : c));
      return [...cur, { ...item, qty: 1 }];
    });
    setBump((b) => b + 1);
  }, []);
  const setQty = useCallback((slug: string, qty: number) => {
    setItems((cur) =>
      qty <= 0 ? cur.filter((c) => c.slug !== slug) : cur.map((c) => (c.slug === slug ? { ...c, qty: Math.min(MAX_QTY, qty) } : c)),
    );
  }, []);
  const remove = useCallback((slug: string) => setItems((cur) => cur.filter((c) => c.slug !== slug)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartState>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);
    return { items, count, subtotal, bump, add, setQty, remove, clear };
  }, [items, bump, add, setQty, remove, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used inside <CartProvider>");
  return v;
}
