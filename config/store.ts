/**
 * Store settings the owner can edit without touching components.
 * After editing, rebuild (`npm run build`) and redeploy.
 */

/**
 * Stock flags, keyed by TF ID.
 * Default comes from `source_status` in products.json ("available" → in stock, "sale_ended" → unavailable).
 * Set a value here to override it, e.g. `1546: true` once you have Rei in hand.
 */
export const inStockOverrides: Record<number, boolean> = {
  // 1546: true,
};

/**
 * Price overrides in USD, keyed by TF ID. Leave empty to use `price_usd` from products.json.
 * `null` shows "Price coming soon".
 */
export const priceOverrides: Record<number, number | null> = {
  // 434: 549,
};

/** Show a small "18+ collectors" label on these product pages. */
export const ageGate: Record<number, boolean> = {
  916: false, // Azur Lane Musashi: set to true to show the label
};

/** Store identity shown on the site. */
export const store = {
  name: "Tokyo Figure Imports",
  shortName: "TF Imports",
  tagline: "Japanese figures, imported for US collectors",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.pages.dev",
};

/**
 * Policy details used across Shipping, Returns, FAQ, Wholesale and the form confirmations.
 * These are sensible defaults written for launch. Change any value here and every page updates.
 */
export const policies = {
  replyWindow: "one business day",
  handlingTime: "1–3 business days",
  deliveryWindow: "7–14 business days",
  carriers: "Japan Post or DHL",
  /** How duties are handled. Copy across the site assumes duties are quoted and collected before shipping. */
  dutiesSummary: "Any US import duties and tariffs are included in your order total before you pay, so there is nothing extra to pay when your package arrives.",
  damageReportHours: 48,
  returnWindowDays: 14,
  refundDays: "5–10 business days",
  wholesaleMinimum: "5 figures per order (mix and match across the catalog)",
  wholesalePricing: "Volume pricing is quoted per order and improves with quantity. Larger and repeat orders receive our best rates.",
  wholesalePayment: "Payment in full before dispatch. We invoice by email with a secure payment link, and bank transfer is available for larger orders.",
  paymentSummary: "Once you place an order, we confirm availability and the full total, then email you a secure payment link. Major credit and debit cards are accepted.",
};

/** Ticker phrases under the hero. Keep them true. */
export const tickerPhrases = ["New arrivals", "Outlet deals", "Ships from Japan", "Wholesale welcome", "Carefully packed"];

/** Trust strip. Do not add "official", "authorized dealer" or "free shipping" unless true. */
export const trustItems = [
  { title: "Ships from Japan", body: "Sent from Japan with tracking." },
  { title: "Carefully packed", body: "Packed so the box arrives the way you'd want it." },
  { title: "Customs duties info up front", body: "We explain US import duties before you pay." },
  { title: "Outlet items clearly labeled", body: "Box or minor flaws are always disclosed." },
];
