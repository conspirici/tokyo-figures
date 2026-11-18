import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import { CartView } from "@/components/CartView";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default function CartPage() {
  // Only items that are in stock and priced can be checked out.
  const valid = Object.fromEntries(getProducts().map((p) => [p.slug, p.inStock ? p.price : null]));
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SectionTitle as="h1" tag="CART">Your cart</SectionTitle>
      <CartView validSlugs={valid} />
    </div>
  );
}
