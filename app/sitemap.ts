import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { store } from "@/config/store";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "shop/", "about/", "wholesale/", "contact/", "shipping/", "returns/", "faq/", "terms/", "privacy/"];
  return [
    ...pages.map((p) => ({ url: `${store.siteUrl}/${p}` })),
    ...getProducts().map((p) => ({ url: `${store.siteUrl}/products/${p.slug}/` })),
  ];
}
