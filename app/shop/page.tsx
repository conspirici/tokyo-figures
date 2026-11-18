import type { Metadata } from "next";
import { getFranchises, getProducts } from "@/lib/products";
import { ShopClient } from "@/components/ShopClient";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "Shop all figures",
  description: "Browse all 15 imported Japanese figures. Filter by franchise, scale, new or outlet, price and availability.",
  alternates: { canonical: "/shop/" },
};

export default function ShopPage() {
  const products = getProducts();
  const franchises = getFranchises().map(({ name, slug, count }) => ({ name, slug, count }));
  return (
    <div className="grid-paper min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionTitle tag="CATALOG / 15 FIGURES" as="h1">
          The shop
        </SectionTitle>
        <ShopClient products={products} franchises={franchises} />
      </div>
    </div>
  );
}
