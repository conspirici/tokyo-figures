/** Public product shape. Internal fields (costs, margins, JPY, source URLs) never appear here. */
export type Condition = "new" | "outlet";

export interface PublicProduct {
  id: number; // tf_id
  no: number; // display number, 1-based catalog order
  slug: string;
  priorityRank: number; // 1 = Must, 2 = Strong, 3 = Test
  featured: boolean;
  franchise: string;
  franchiseSlug: string;
  character: string;
  title: string;
  tagline: string;
  description: string;
  highlights: string[];
  scale: string | null;
  scaleGroup: string; // filter bucket: "1/4", "1/7", "Other"
  bonus: string | null;
  condition: Condition;
  conditionNote: string | null;
  limited: boolean;
  price: number | null;
  inStock: boolean;
  ageGate: boolean;
  images: string[]; // base paths, e.g. /images/434/main (variants: -480.webp, -960.webp, .jpg)
}

export interface ProductSummary {
  slug: string;
  title: string;
}
