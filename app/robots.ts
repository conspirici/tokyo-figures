import type { MetadataRoute } from "next";
import { store } from "@/config/store";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/cart/"] }], sitemap: `${store.siteUrl}/sitemap.xml` };
}
